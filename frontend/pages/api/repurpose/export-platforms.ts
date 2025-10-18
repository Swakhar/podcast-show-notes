import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import JSZip from 'jszip';

interface ExportPlatformsData {
  contentType: 'instagram_story' | 'linkedin_carousel' | 'tiktok_script';
  stories?: any[];
  slides?: any[];
  scenes?: any[];
  images: { [key: number]: string };
  exportFormats: string[];
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

    const { contentType, stories, slides, scenes, images, exportFormats }: ExportPlatformsData = req.body;

    if (!contentType || !images || Object.keys(images).length === 0) {
      return res.status(400).json({ error: 'No images to export' });
    }

    // ✅ Create main ZIP file
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0];
    const content = contentType === 'instagram_story' ? stories : 
                   contentType === 'linkedin_carousel' ? slides : 
                   scenes || []; // ✅ Add fallback empty array

    // ✅ Export for each requested format
    for (const format of exportFormats) {
      const formatFolder = zip.folder(format);
      
      if (!formatFolder) continue;

      switch (format) {
        case 'canva_templates':
          await createCanvaTemplates(formatFolder, contentType, content, images);
          break;
        case 'buffer_ready':
          await createBufferFormat(formatFolder, contentType, content, images);
          break;
        case 'later_scheduler':
          await createLaterFormat(formatFolder, contentType, content, images);
          break;
        case 'hootsuite_format':
          await createHootsuiteFormat(formatFolder, contentType, content, images);
          break;
        case 'raw_images':
          await createRawImages(formatFolder, contentType, content, images);
          break;
      }
    }

    // ✅ Add master README
    const masterReadme = createMasterReadme(contentType, content, images, exportFormats);
    zip.file('README.md', masterReadme);

    // ✅ Generate and send ZIP
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const filename = `${contentType}_platform_exports_${timestamp}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    res.status(200).send(zipBuffer);

  } catch (error: any) {
    console.error('Error creating platform exports:', error);
    return res.status(500).json({ 
      error: 'Failed to create platform exports',
      details: error.message 
    });
  }
}

// ✅ CANVA TEMPLATES - Updated with TikTok support
async function createCanvaTemplates(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // ✅ Add safety check at the start
  if (!content || !Array.isArray(content)) {
    content = [];
  }

  // ✅ Determine dimensions based on content type
  const dimensions = contentType === 'instagram_story' || contentType === 'tiktok_script' 
    ? { width: 1080, height: 1920 } 
    : { width: 1080, height: 1080 };

  // Create Canva template JSON
  const canvaTemplate = {
    template_name: `${contentType}_template_${new Date().toISOString().split('T')[0]}`,
    dimensions: dimensions,
    brand_kit: {
      colors: contentType === 'tiktok_script' ? ['#ff0050', '#00f2ea'] : ['#667eea', '#764ba2'],
      fonts: ['Inter', 'Roboto'],
    },
    elements: content.map((item: any, index: number) => ({
      type: 'text_image_combo',
      position: { x: 0, y: 0 },
      content: item.content || item.dialogue || item.text || '', // ✅ Add dialogue for TikTok
      image_placeholder: `image_${index + 1}.png`,
      style: {
        font_family: 'Inter',
        font_size: contentType === 'instagram_story' || contentType === 'tiktok_script' ? 48 : 36,
        color: '#FFFFFF',
        background: 'gradient'
      },
      // ✅ Add TikTok-specific properties
      ...(contentType === 'tiktok_script' && {
        scene_type: item.type,
        duration: item.duration,
        action: item.action,
        visual_cues: item.visual_cues
      })
    })) || []
  };

  folder.file('canva_template.json', JSON.stringify(canvaTemplate, null, 2));

  // Add images with Canva naming
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`image_${parseInt(index) + 1}.png`, buffer);
  });

  // ✅ Updated Canva instructions with TikTok support
  const canvaInstructions = `# Canva Template Import

## How to use:
1. Log into Canva.com
2. Go to "Create a design" → "Custom size"
3. Set dimensions: ${dimensions.width} x ${dimensions.height} px
4. Upload all image files from this folder
5. Use the template.json as a reference for element positioning

## Template Structure:
- ${Object.keys(images).length} images ready for import
- Pre-configured brand colors and fonts
- Optimized for ${contentType.replace('_', ' ')}

${contentType === 'tiktok_script' ? `
## TikTok Specific Features:
- Vertical format (9:16 aspect ratio)
- Bold colors for mobile viewing
- Scene-based layout system
- Action and dialogue references included

## Pro Tips for TikTok:
- Use high contrast colors for mobile screens
- Keep text large and readable
- Consider adding motion graphics
- Test readability on mobile devices
` : `
## Pro Tips:
- Import images in order (image_1.png, image_2.png, etc.)
- Use the brand colors: ${contentType === 'tiktok_script' ? '#ff0050, #00f2ea' : '#667eea, #764ba2'}
- Font recommendations: Inter, Roboto
`}
`;

  folder.file('CANVA_INSTRUCTIONS.md', canvaInstructions);
}

// ✅ BUFFER FORMAT - Updated with TikTok support
async function createBufferFormat(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // ✅ Handle TikTok content differently
  const platform = contentType === 'tiktok_script' ? 'tiktok' : 'instagram';
  
  // Create Buffer CSV schedule
  const csvHeaders = 'Content,Image,Scheduled Time,Platform,Status\n';
  const csvRows = content?.map((item: any, index: number) => {
    const scheduledTime = new Date(Date.now() + (index * 2 * 60 * 60 * 1000)); // 2 hours apart
    const contentText = item.content || item.dialogue || item.text || '';
    return `"${contentText.replace(/"/g, '""')}","image_${index + 1}.png","${scheduledTime.toISOString()}","${platform}","draft"`;
  }).join('\n') || '';

  folder.file('buffer_schedule.csv', csvHeaders + csvRows);

  // Add images for Buffer
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`image_${parseInt(index) + 1}.png`, buffer);
  });

  // ✅ Updated Buffer setup guide with TikTok support
  const bufferGuide = `# Buffer Import Guide

## Setup Instructions:
1. Log into Buffer.com
2. Go to "Publishing" → "Compose"
3. Select ${platform === 'tiktok' ? 'TikTok' : 'Instagram'} account
4. Upload images from this folder in order

${contentType === 'tiktok_script' ? `
## TikTok Specific Notes:
- Images are scene references for video production
- Use as storyboard while filming
- Buffer supports TikTok scheduling with video uploads
- Consider converting to video format before uploading

## Video Production Workflow:
1. Use images as scene references
2. Film corresponding video content
3. Edit scenes together
4. Upload final video to Buffer
5. Schedule using provided timing
` : `
## Schedule:
- Images are numbered sequentially
- CSV contains suggested 2-hour intervals
- All posts set as "draft" status for review
`}

## Content Format:
${content?.map((item: any, index: number) => {
  const contentText = item.content || item.dialogue || item.text || '';
  return `- Image ${index + 1}: "${contentText.substring(0, 50)}..."`;
}).join('\n') || ''}

## Next Steps:
1. Import CSV file into Buffer
2. Upload corresponding ${contentType === 'tiktok_script' ? 'videos (after production)' : 'images'}
3. Review and adjust posting times
4. Publish or schedule posts
`;

  folder.file('BUFFER_SETUP.md', bufferGuide);
}

// ✅ LATER FORMAT - Updated with TikTok support
async function createLaterFormat(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Create Later metadata JSON
  const laterMetadata = {
    campaign_name: `${contentType}_campaign_${new Date().toISOString().split('T')[0]}`,
    platform: contentType === 'tiktok_script' ? 'tiktok' : 'instagram',
    content_type: contentType === 'instagram_story' ? 'story' : 
                 contentType === 'linkedin_carousel' ? 'carousel' :
                 'video', // ✅ TikTok is video content
    posts: content?.map((item: any, index: number) => ({
      id: `post_${index + 1}`,
      content: item.content || item.dialogue || item.text || '',
      image: `${index + 1}.png`,
      hashtags: item.hashtags || [],
      schedule_time: new Date(Date.now() + (index * 3 * 60 * 60 * 1000)).toISOString(), // 3 hours apart
      // ✅ Add TikTok-specific metadata
      ...(contentType === 'tiktok_script' && {
        scene_type: item.type,
        duration: item.duration,
        action: item.action,
        visual_cues: item.visual_cues
      })
    })) || []
  };

  folder.file('later_campaign.json', JSON.stringify(laterMetadata, null, 2));

  // Add numbered images for Later
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`${parseInt(index) + 1}.png`, buffer);
  });

  // ✅ Updated Later workflow guide with TikTok support
  const laterWorkflow = `# Later.com Import Workflow

## Quick Setup:
1. Open Later.com dashboard
2. Click "Create Post" → "${contentType === 'tiktok_script' ? 'TikTok Video' : `Instagram ${contentType === 'instagram_story' ? 'Story' : 'Feed'}`}"
3. Upload ${contentType === 'tiktok_script' ? 'videos (after production)' : 'images'} in numerical order

${contentType === 'tiktok_script' ? `
## TikTok Video Production:
- Use numbered images as scene references
- Film corresponding video content for each scene
- Edit scenes together maintaining timing guidelines
- Upload final video to Later for scheduling

## TikTok Best Practices:
- Keep videos under 60 seconds
- Hook viewers in first 3 seconds
- Use trending sounds and effects
- Include relevant hashtags
- Post during peak hours (6-10 AM, 7-9 PM)
` : `
## Campaign Details:
- Total Posts: ${Object.keys(images).length}
- Content Type: ${contentType.replace('_', ' ')}
- Suggested Interval: 3 hours between posts

## Optimization Tips:
- Best posting times: 9-11 AM, 7-9 PM
- Use Later's best time suggestions
- Enable auto-posting for consistent scheduling
`}

## Post Content:
${content?.map((item: any, index: number) => {
  const contentText = item.content || item.dialogue || item.text || '';
  return `\n### Post ${index + 1}
${contentType === 'tiktok_script' ? 'Scene Reference' : 'Image'}: ${index + 1}.png
Content: ${contentText.substring(0, 100)}${contentText.length > 100 ? '...' : ''}${
  contentType === 'tiktok_script' && item.action ? `\nAction: ${item.action}` : ''
}`;
}).join('\n') || ''}
`;

  folder.file('LATER_WORKFLOW.md', laterWorkflow);
}

// ✅ HOOTSUITE FORMAT - Updated with TikTok support
async function createHootsuiteFormat(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Create Hootsuite bulk upload CSV
  const hootsuiteCSV = `Date,Time,Content,Image,Platform
${content?.map((item: any, index: number) => {
    const postDate = new Date(Date.now() + (index * 4 * 60 * 60 * 1000)); // 4 hours apart
    const date = postDate.toISOString().split('T')[0];
    const time = postDate.toTimeString().split(' ')[0];
    const cleanContent = (item.content || item.dialogue || item.text || '').replace(/"/g, '""').replace(/\n/g, ' ');
    const platform = contentType === 'tiktok_script' ? 'TikTok' : 'Instagram';
    return `${date},${time},"${cleanContent}",hootsuite_${index + 1}.jpg,${platform}`;
  }).join('\n') || ''}`;

  folder.file('hootsuite_bulk_upload.csv', hootsuiteCSV);

  // Add images with Hootsuite naming
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`hootsuite_${parseInt(index) + 1}.jpg`, buffer);
  });

  // ✅ Updated Hootsuite instructions with TikTok support
  const hootsuiteInstructions = `# Hootsuite Bulk Import

## Import Steps:
1. Log into Hootsuite dashboard
2. Go to "Publisher" → "Bulk Composer"
3. Upload the hootsuite_bulk_upload.csv file
4. Upload all ${contentType === 'tiktok_script' ? 'video files (after production)' : 'image files'} when prompted

${contentType === 'tiktok_script' ? `
## TikTok Video Requirements:
- Images provided are scene references
- Create videos based on scene descriptions
- Export videos in MP4 format, 1080x1920 resolution
- Ensure videos are under 60 seconds
- Upload final videos with corresponding filenames

## TikTok Production Checklist:
- [ ] Film all scenes according to action descriptions
- [ ] Edit scenes maintaining timing guidelines
- [ ] Add trending music/sounds
- [ ] Include text overlays from visual cues
- [ ] Export in correct format for upload
` : `
## File Format:
- CSV contains: Date, Time, Content, Image filename, Platform
- Images named: hootsuite_1.jpg, hootsuite_2.jpg, etc.
- 4-hour intervals between posts
`}

## Important Notes:
- Review all content before publishing
- Adjust times based on your audience timezone
- Hootsuite supports ${contentType === 'tiktok_script' ? 'TikTok video uploads' : `Instagram ${contentType === 'instagram_story' ? 'Stories' : 'Posts'}`}

## Content Preview:
Total posts: ${Object.keys(images).length}
Platform: ${contentType === 'tiktok_script' ? 'TikTok' : 'Instagram'}
Schedule: Every 4 hours starting now

## Troubleshooting:
- Ensure ${contentType === 'tiktok_script' ? 'video' : 'image'} files match CSV references exactly
- Check character limits per platform
- Verify account permissions for ${contentType === 'tiktok_script' ? 'TikTok' : 'Instagram'}
${contentType === 'tiktok_script' ? '- Confirm video format compatibility (MP4, 1080x1920)' : ''}
`;

  folder.file('HOOTSUITE_INSTRUCTIONS.md', hootsuiteInstructions);
}

// ✅ RAW IMAGES - Updated with TikTok support
async function createRawImages(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Add high-quality images
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const contentTitle = content?.[parseInt(index)]?.content || 
                        content?.[parseInt(index)]?.dialogue || 
                        content?.[parseInt(index)]?.text || 
                        `content_${parseInt(index) + 1}`;
    const safeTitle = contentTitle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    
    // ✅ Add scene type for TikTok files
    const prefix = contentType === 'tiktok_script' 
      ? `scene_${parseInt(index) + 1}_${content?.[parseInt(index)]?.type || 'content'}`
      : `${parseInt(index) + 1}`;
    
    folder.file(`${prefix}_${safeTitle}.png`, buffer);
  });

  // ✅ Updated technical specifications with TikTok support
  const techSpecs = `# Raw Images - Technical Specifications

## Image Details:
- Format: PNG (lossless compression)
- Dimensions: ${contentType === 'instagram_story' || contentType === 'tiktok_script' ? '1080 x 1920 pixels (9:16)' : '1080 x 1080 pixels (1:1)'}
- Color Space: sRGB
- Quality: High Resolution (print ready)
${contentType === 'tiktok_script' ? '- Purpose: Scene references for video production' : '- Purpose: Direct social media upload'}

## Files Included:
${Object.entries(images).map(([index, _]) => {
    const contentTitle = content?.[parseInt(index)]?.content || 
                        content?.[parseInt(index)]?.dialogue || 
                        content?.[parseInt(index)]?.text || 
                        `content_${parseInt(index) + 1}`;
    const safeTitle = contentTitle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const prefix = contentType === 'tiktok_script' 
      ? `scene_${parseInt(index) + 1}_${content?.[parseInt(index)]?.type || 'content'}`
      : `${parseInt(index) + 1}`;
    
    return `- ${prefix}_${safeTitle}.png${contentType === 'tiktok_script' ? ` (${content?.[parseInt(index)]?.duration || 5}s scene)` : ''}`;
  }).join('\n')}

${contentType === 'tiktok_script' ? `
## TikTok Production Notes:
- Each image represents a scene in your TikTok video
- Use as visual reference while filming
- Scene timing guidelines included in filenames
- Consider action descriptions when setting up shots

## Video Production Workflow:
1. Review scene images for visual reference
2. Set up camera/lighting for each scene
3. Film according to action descriptions
4. Edit scenes together maintaining timing
5. Export final video in 1080x1920 MP4 format
` : `
## Usage Recommendations:
- Direct upload to Instagram/social platforms
- Use for custom design workflows
- Archive as source files
- Print versions available at 300 DPI
`}

## Platform Compatibility:
${contentType === 'tiktok_script' ? `
✅ TikTok (scene references for video production)
✅ Instagram Reels (adapt for 9:16 video format)
✅ YouTube Shorts (scene storyboarding)
✅ Video editing software (reference images)
` : `
✅ Instagram ${contentType === 'instagram_story' ? 'Stories' : 'Posts'}
✅ Facebook ${contentType === 'instagram_story' ? 'Stories' : 'Posts'}
✅ LinkedIn ${contentType === 'linkedin_carousel' ? 'Carousel' : 'Posts'}
✅ Twitter/X Image Posts
✅ Pinterest Pins
`}
✅ Custom design software (Canva, Figma, etc.)
`;

  folder.file('TECHNICAL_SPECS.md', techSpecs);
}

// ✅ MASTER README - Updated with TikTok support
function createMasterReadme(
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }, 
  exportFormats: string[]
): string {
  return `# ${contentType.toUpperCase().replace('_', ' ')} - Platform Export Package

Generated: ${new Date().toLocaleString()}
Total ${contentType === 'tiktok_script' ? 'Scenes' : 'Images'}: ${Object.keys(images).length}
Export Formats: ${exportFormats.length}

${contentType === 'tiktok_script' ? `
## 🎬 TikTok Video Production Package

This package contains scene references and production assets for creating a TikTok video based on your podcast content.

### 📋 What's Included:
- Scene reference images (1080x1920)
- Production guidelines and timing
- Platform export formats for scheduling
- Detailed filming instructions

### 🎯 Video Structure:
Total Duration: ~${content?.reduce((total, scene) => total + (scene.duration || 5), 0) || 30} seconds
Scene Types: ${content?.map(scene => scene.type).filter((type, index, arr) => arr.indexOf(type) === index).join(', ') || 'Various'}
` : ''}

## 📁 Folder Structure:

${exportFormats.map(format => {
    const descriptions = {
      'canva_templates': `🎨 Ready-to-import Canva templates with positioning data${contentType === 'tiktok_script' ? ' and scene references' : ''}`,
      'buffer_ready': `📅 CSV schedule + ${contentType === 'tiktok_script' ? 'scene references' : 'images'} for Buffer bulk import`,
      'later_scheduler': `⏰ JSON campaign file + numbered ${contentType === 'tiktok_script' ? 'scene references' : 'images'} for Later.com`,
      'hootsuite_format': `🚀 Bulk upload CSV + ${contentType === 'tiktok_script' ? 'scene references' : 'images'} for Hootsuite Publisher`,
      'raw_images': `🖼️ High-quality PNG files for ${contentType === 'tiktok_script' ? 'video production reference' : 'direct platform upload'}`
    };
    return `### ${format}/
${descriptions[format as keyof typeof descriptions] || '📦 Platform-specific export format'}`;
  }).join('\n\n')}

## 🚀 Quick Start Guide:

1. **Choose Your Platform:**
   - Canva: Use \`canva_templates/\` folder
   - Buffer: Use \`buffer_ready/\` folder  
   - Later: Use \`later_scheduler/\` folder
   - Hootsuite: Use \`hootsuite_format/\` folder
   - Direct Upload: Use \`raw_images/\` folder

2. **Follow Platform Instructions:**
   Each folder contains specific setup guides and instructions.

3. **Review Content:**
   All posts are set as drafts - review before publishing.

## 📊 Content Overview:

${content?.map((item: any, index: number) => {
  const contentText = item.content || item.dialogue || item.text || '';
  const sceneInfo = contentType === 'tiktok_script' && item.type 
    ? ` (${item.type} scene, ${item.duration || 5}s)` 
    : '';
  return `**${index + 1}.** ${contentText.substring(0, 80)}${contentText.length > 80 ? '...' : ''}${sceneInfo}`;
}).join('\n') || 'No content available'}

## ⚡ Pro Tips:

${contentType === 'tiktok_script' ? `
- **Filming:** Use scene images as visual reference for each shot
- **Timing:** Follow duration guidelines for proper pacing
- **Hook:** First 3 seconds are crucial for viewer retention
- **Editing:** Use trending sounds and quick cuts for engagement
- **Posting:** Optimal times are 6-10 AM and 7-9 PM
` : `
- **Optimal Posting Times:** 9-11 AM, 7-9 PM (adjust for your timezone)
- **Hashtag Strategy:** Add relevant hashtags before publishing
- **Engagement:** Respond to comments within first hour for better reach
`}
- **Analytics:** Track performance and adjust future content accordingly

## 🔧 Technical Support:

If you encounter any issues:
1. Check platform-specific instruction files
2. Verify ${contentType === 'tiktok_script' ? 'video format' : 'image file'} integrity
3. Ensure proper account permissions
4. Contact support with error details

---
*Generated by CastLumen - ${new Date().getFullYear()}*
`;
}
