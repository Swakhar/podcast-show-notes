import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import JSZip from 'jszip';

interface DownloadImagesData {
  contentType: 'instagram_story' | 'linkedin_carousel';
  stories?: any[];
  slides?: any[];
  images: { [key: number]: string };
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

    const { contentType, stories, slides, images }: DownloadImagesData = req.body;

    if (!contentType || !images || Object.keys(images).length === 0) {
      return res.status(400).json({ error: 'No images to download' });
    }

    // ✅ Create ZIP file with all images
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0];
    
    // ✅ Process each image
    for (const [index, imageDataUrl] of Object.entries(images)) {
      try {
        // Convert base64 data URL to buffer
        const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate filename based on content type
        let filename = '';
        if (contentType === 'instagram_story') {
          const storyType = stories?.[parseInt(index)]?.type || 'story';
          filename = `story_${parseInt(index) + 1}_${storyType}_${timestamp}.png`;
        } else if (contentType === 'linkedin_carousel') {
          const slideTitle = slides?.[parseInt(index)]?.title || `slide_${parseInt(index) + 1}`;
          const safeTitle = slideTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
          filename = `slide_${parseInt(index) + 1}_${safeTitle}_${timestamp}.png`;
        }
        
        // Add to ZIP
        zip.file(filename, buffer);
        
      } catch (error) {
        console.error(`Error processing image ${index}:`, error);
        // Continue with other images
      }
    }
    
    // ✅ Add metadata file
    const metadata = {
      generated_at: new Date().toISOString(),
      content_type: contentType,
      total_images: Object.keys(images).length,
      user_email: session.user.email,
      specifications: {
        dimensions: contentType === 'instagram_story' ? '1080x1920' : '1080x1080',
        format: 'PNG',
        quality: 'High Resolution',
        ready_for: contentType === 'instagram_story' ? 'Instagram Stories' : 'LinkedIn Carousel'
      },
      usage_instructions: contentType === 'instagram_story' 
        ? [
            '1. Upload images to Instagram Stories',
            '2. Add interactive elements (polls, questions, etc.)',
            '3. Post at optimal times (9-11 AM or 7-9 PM)',
            '4. Use relevant hashtags in your story highlights'
          ]
        : [
            '1. Create new LinkedIn post',
            '2. Upload all slides in order',
            '3. Add engaging caption with insights',
            '4. Include relevant hashtags and tag connections'
          ]
    };
    
    zip.file('README.json', JSON.stringify(metadata, null, 2));
    
    // ✅ Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // ✅ Set response headers for download
    const filename = contentType === 'instagram_story' 
      ? `instagram_stories_${timestamp}.zip`
      : `linkedin_carousel_${timestamp}.zip`;
      
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    // ✅ Send ZIP file
    res.status(200).send(zipBuffer);

  } catch (error: any) {
    console.error('Error creating download:', error);
    return res.status(500).json({ 
      error: 'Failed to create download',
      details: error.message 
    });
  }
}
