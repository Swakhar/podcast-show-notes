import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

interface ScheduleStoriesData {
  contentType: 'instagram_story' | 'linkedin_carousel';
  stories?: any[];
  slides?: any[];
  images: { [key: number]: string };
  schedulingOptions: {
    platform: string;
    publishTime: string | 'optimal';
    interval: string;
    account: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // ✅ Auth check
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { contentType, stories, slides, images, schedulingOptions }: ScheduleStoriesData = req.body;

    if (!contentType || !images || Object.keys(images).length === 0) {
      return res.status(400).json({ error: 'No images to schedule' });
    }

    const content = contentType === 'instagram_story' ? stories : slides;
    
    // ✅ Calculate optimal posting times
    const optimalTimes = calculateOptimalTimes(schedulingOptions.publishTime, schedulingOptions.interval, Object.keys(images).length);
    
    // ✅ Create scheduling data
    const scheduledPosts = await createScheduledPosts(contentType, content, images, optimalTimes, schedulingOptions);
    
    // ✅ Save to database/queue (simulated)
    const queueResults = await addToPublishingQueue(scheduledPosts, session.user.email);
    
    // ✅ Generate scheduling report
    const report = generateSchedulingReport(scheduledPosts, queueResults);

    return res.status(200).json({
      success: true,
      scheduledCount: scheduledPosts.length,
      nextPostTime: optimalTimes[0],
      report: report,
      queueId: queueResults.queueId
    });

  } catch (error: any) {
    console.error('Error scheduling stories:', error);
    return res.status(500).json({ 
      error: 'Failed to schedule stories',
      details: error.message 
    });
  }
}

// ✅ Calculate optimal posting times
function calculateOptimalTimes(publishTime: string | 'optimal', interval: string, postCount: number): Date[] {
  const times: Date[] = [];
  const now = new Date();
  
  // ✅ Determine starting time
  let startTime: Date;
  
  if (publishTime === 'optimal') {
    // Calculate next optimal time (9 AM or 7 PM)
    const today9AM = new Date(now);
    today9AM.setHours(9, 0, 0, 0);
    
    const today7PM = new Date(now);
    today7PM.setHours(19, 0, 0, 0);
    
    const tomorrow9AM = new Date(now);
    tomorrow9AM.setDate(tomorrow9AM.getDate() + 1);
    tomorrow9AM.setHours(9, 0, 0, 0);
    
    if (now < today9AM) {
      startTime = today9AM;
    } else if (now < today7PM) {
      startTime = today7PM;
    } else {
      startTime = tomorrow9AM;
    }
  } else {
    startTime = new Date(publishTime);
  }
  
  // ✅ Calculate interval in milliseconds
  const intervalMs = parseInterval(interval);
  
  // ✅ Generate all posting times
  for (let i = 0; i < postCount; i++) {
    const postTime = new Date(startTime.getTime() + (i * intervalMs));
    
    // ✅ Adjust for optimal hours (avoid 12-6 AM)
    const adjustedTime = adjustForOptimalHours(postTime);
    times.push(adjustedTime);
  }
  
  return times;
}

// ✅ Parse interval string to milliseconds
function parseInterval(interval: string): number {
  const intervals: { [key: string]: number } = {
    '30_minutes': 30 * 60 * 1000,
    '1_hour': 60 * 60 * 1000,
    '2_hours': 2 * 60 * 60 * 1000,
    '3_hours': 3 * 60 * 60 * 1000,
    '4_hours': 4 * 60 * 60 * 1000,
    '6_hours': 6 * 60 * 60 * 1000,
    '12_hours': 12 * 60 * 60 * 1000,
    '24_hours': 24 * 60 * 60 * 1000,
  };
  
  return intervals[interval] || intervals['2_hours']; // Default to 2 hours
}

// ✅ Adjust posting time to avoid low-engagement hours
function adjustForOptimalHours(time: Date): Date {
  const hour = time.getHours();
  
  // If posting between 12 AM - 6 AM (low engagement), move to 9 AM
  if (hour >= 0 && hour < 6) {
    const adjusted = new Date(time);
    adjusted.setHours(9, 0, 0, 0);
    return adjusted;
  }
  
  return time;
}

// ✅ Create scheduled posts data
async function createScheduledPosts(
  contentType: string,
  content: any[],
  images: { [key: number]: string },
  scheduleTimes: Date[],
  options: any
): Promise<any[]> {
  const posts = [];
  
  for (let i = 0; i < Object.keys(images).length; i++) {
    const item = content?.[i] || {};
    const post = {
      id: `scheduled_${Date.now()}_${i}`,
      contentType,
      platform: options.platform,
      account: options.account,
      scheduledTime: scheduleTimes[i],
      content: {
        text: item.content || item.text || '',
        type: item.type || 'story',
        image: images[i],
        hashtags: item.hashtags || [],
      },
      status: 'scheduled',
      createdAt: new Date(),
      metadata: {
        originalIndex: i,
        totalInSeries: Object.keys(images).length,
        engagementPrediction: calculateEngagementPrediction(item, scheduleTimes[i])
      }
    };
    
    posts.push(post);
  }
  
  return posts;
}

// ✅ Calculate engagement prediction
function calculateEngagementPrediction(content: any, scheduleTime: Date): any {
  const hour = scheduleTime.getHours();
  const day = scheduleTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Base engagement rates by time and day
  let baseRate = 3.5; // Base 3.5% engagement rate
  
  // Time multipliers
  if (hour >= 9 && hour <= 11) baseRate *= 1.4; // Morning peak
  else if (hour >= 19 && hour <= 21) baseRate *= 1.6; // Evening peak
  else if (hour >= 0 && hour <= 6) baseRate *= 0.6; // Low engagement hours
  
  // Day multipliers
  if (day >= 1 && day <= 5) baseRate *= 1.1; // Weekdays
  else if (day === 0 || day === 6) baseRate *= 1.3; // Weekends
  
  // Content type multipliers
  const contentText = content.content || content.text || '';
  if (contentText.includes('?')) baseRate *= 1.2; // Questions get more engagement
  if (contentText.length > 100) baseRate *= 0.9; // Shorter content performs better
  
  return {
    estimatedRate: Math.min(baseRate, 8.5), // Cap at 8.5%
    reachMultiplier: baseRate > 5 ? 'high' : baseRate > 3 ? 'medium' : 'low',
    bestTime: hour >= 9 && hour <= 11 || hour >= 19 && hour <= 21,
    confidence: baseRate > 4 ? 'high' : 'medium'
  };
}

// ✅ Add to publishing queue (simulated database operation)
async function addToPublishingQueue(posts: any[], userEmail: string): Promise<any> {
  // In a real app, this would save to database
  // For now, we'll simulate the operation
  
  const queueId = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate saving to queue
  const queueEntry = {
    queueId,
    userEmail,
    platform: posts[0]?.platform || 'instagram',
    totalPosts: posts.length,
    status: 'queued',
    createdAt: new Date(),
    posts: posts.map(post => ({
      ...post,
      queueId,
      apiEndpoint: getAPIEndpoint(post.platform, post.contentType),
      retryCount: 0,
      maxRetries: 3
    }))
  };
  
  // TODO: Save to actual database
  console.log('Queue entry created:', queueEntry);
  
  return {
    queueId,
    success: true,
    postsQueued: posts.length,
    estimatedCompletion: posts[posts.length - 1]?.scheduledTime
  };
}

// ✅ Get API endpoint for platform
function getAPIEndpoint(platform: string, contentType: string): string {
  const endpoints: { [key: string]: string } = {
    'instagram_story': 'https://graph.facebook.com/v18.0/{ig-user-id}/media',
    'instagram_post': 'https://graph.facebook.com/v18.0/{ig-user-id}/media',
    'linkedin_carousel': 'https://api.linkedin.com/v2/ugcPosts',
    'facebook_story': 'https://graph.facebook.com/v18.0/{page-id}/photos',
    'twitter_post': 'https://api.twitter.com/2/tweets'
  };
  
  const key = `${platform}_${contentType}`.replace('linkedin_carousel', 'linkedin_carousel');
  return endpoints[key] || endpoints['instagram_story'];
}

// ✅ Generate scheduling report
function generateSchedulingReport(posts: any[], queueResults: any): any {
  const now = new Date();
  const nextPost = posts.find(post => new Date(post.scheduledTime) > now);
  const totalDuration = new Date(posts[posts.length - 1].scheduledTime).getTime() - new Date(posts[0].scheduledTime).getTime();
  
  // Calculate engagement predictions
  const avgEngagement = posts.reduce((sum, post) => sum + post.metadata.engagementPrediction.estimatedRate, 0) / posts.length;
  const highEngagementPosts = posts.filter(post => post.metadata.engagementPrediction.confidence === 'high').length;
  
  return {
    summary: {
      totalPosts: posts.length,
      queueId: queueResults.queueId,
      platform: posts[0]?.platform || 'instagram',
      status: 'scheduled'
    },
    timing: {
      firstPost: posts[0]?.scheduledTime,
      lastPost: posts[posts.length - 1]?.scheduledTime,
      nextPost: nextPost?.scheduledTime || null,
      totalDuration: Math.round(totalDuration / (1000 * 60 * 60)), // hours
      averageInterval: Math.round(totalDuration / (posts.length - 1) / (1000 * 60)) // minutes
    },
    predictions: {
      averageEngagement: `${avgEngagement.toFixed(1)}%`,
      highConfidencePosts: highEngagementPosts,
      estimatedTotalReach: Math.round(posts.length * 2500 * (avgEngagement / 100)),
      peakPerformanceTimes: posts
        .filter(post => post.metadata.engagementPrediction.bestTime)
        .map(post => ({
          time: post.scheduledTime,
          content: (post.content.text || '').substring(0, 50) + '...'
        }))
    },
    optimizations: [
      avgEngagement > 5 ? '✅ Schedule optimized for high engagement' : '⚠️ Consider adjusting posting times',
      highEngagementPosts > posts.length * 0.7 ? '✅ Most posts scheduled at optimal times' : '💡 More posts could be moved to peak hours',
      posts.length > 10 ? '📊 Large campaign - monitor performance and adjust' : '🎯 Focused campaign size',
      '💡 Enable post notifications for real-time engagement tracking'
    ],
    nextSteps: [
      '1. Monitor queue status in dashboard',
      '2. Prepare engagement responses',
      '3. Track performance metrics',
      '4. Adjust future campaigns based on results'
    ]
  };
}
