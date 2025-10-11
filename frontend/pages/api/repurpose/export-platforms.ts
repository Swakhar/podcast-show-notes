import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import JSZip from 'jszip';

interface ExportPlatformsData {
  contentType: 'instagram_story' | 'linkedin_carousel';
  stories?: any[];
  slides?: any[];
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

    const { contentType, stories, slides, images, exportFormats }: ExportPlatformsData = req.body;

    if (!contentType || !images || Object.keys(images).length === 0) {
      return res.status(400).json({ error: 'No images to export' });
    }

    // ✅ Create main ZIP file
    const zip = new JSZip();
    const timestamp = new Date().toISOString().split('T')[0];
    const content = contentType === 'instagram_story' ? stories : slides;

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

// ✅ CANVA TEMPLATES - JSON format for Canva API
async function createCanvaTemplates(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Create Canva template JSON
  const canvaTemplate = {
    template_name: `${contentType}_template_${new Date().toISOString().split('T')[0]}`,
    dimensions: contentType === 'instagram_story' ? { width: 1080, height: 1920 } : { width: 1080, height: 1080 },
    brand_kit: {
      colors: ['#667eea', '#764ba2'],
      fonts: ['Inter', 'Roboto'],
    },
    elements: content?.map((item: any, index: number) => ({
      type: 'text_image_combo',
      position: { x: 0, y: 0 },
      content: item.content || item.text || '',
      image_placeholder: `image_${index + 1}.png`,
      style: {
        font_family: 'Inter',
        font_size: contentType === 'instagram_story' ? 48 : 36,
        color: '#FFFFFF',
        background: 'gradient'
      }
    })) || []
  };

  folder.file('canva_template.json', JSON.stringify(canvaTemplate, null, 2));

  // Add images with Canva naming
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`image_${parseInt(index) + 1}.png`, buffer);
  });

  // Canva import instructions
  const canvaInstructions = `# Canva Template Import

## How to use:
1. Log into Canva.com
2. Go to "Create a design" → "Custom size"
3. Set dimensions: ${contentType === 'instagram_story' ? '1080 x 1920 px' : '1080 x 1080 px'}
4. Upload all image files from this folder
5. Use the template.json as a reference for element positioning

## Template Structure:
- ${Object.keys(images).length} images ready for import
- Pre-configured brand colors and fonts
- Optimized for ${contentType.replace('_', ' ')}

## Pro Tips:
- Import images in order (image_1.png, image_2.png, etc.)
- Use the brand colors: #667eea, #764ba2
- Font recommendations: Inter, Roboto
`;

  folder.file('CANVA_INSTRUCTIONS.md', canvaInstructions);
}

// ✅ BUFFER FORMAT - CSV + Images
async function createBufferFormat(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Create Buffer CSV schedule
  const csvHeaders = 'Content,Image,Scheduled Time,Platform,Status\n';
  const csvRows = content?.map((item: any, index: number) => {
    const scheduledTime = new Date(Date.now() + (index * 2 * 60 * 60 * 1000)); // 2 hours apart
    return `"${(item.content || item.text || '').replace(/"/g, '""')}","image_${index + 1}.png","${scheduledTime.toISOString()}","instagram","draft"`;
  }).join('\n') || '';

  folder.file('buffer_schedule.csv', csvHeaders + csvRows);

  // Add images for Buffer
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`image_${parseInt(index) + 1}.png`, buffer);
  });

  // Buffer setup guide
  const bufferGuide = `# Buffer Import Guide

## Setup Instructions:
1. Log into Buffer.com
2. Go to "Publishing" → "Compose"
3. Select Instagram account
4. Upload images from this folder in order

## Schedule:
- Images are numbered sequentially
- CSV contains suggested 2-hour intervals
- All posts set as "draft" status for review

## Content Format:
${content?.map((item: any, index: number) => 
  `- Image ${index + 1}: "${(item.content || item.text || '').substring(0, 50)}..."`
).join('\n') || ''}

## Next Steps:
1. Import CSV file into Buffer
2. Upload corresponding images
3. Review and adjust posting times
4. Publish or schedule posts
`;

  folder.file('BUFFER_SETUP.md', bufferGuide);
}

// ✅ LATER FORMAT - Structured folder + metadata
async function createLaterFormat(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Create Later metadata JSON
  const laterMetadata = {
    campaign_name: `${contentType}_campaign_${new Date().toISOString().split('T')[0]}`,
    platform: 'instagram',
    content_type: contentType === 'instagram_story' ? 'story' : 'carousel',
    posts: content?.map((item: any, index: number) => ({
      id: `post_${index + 1}`,
      content: item.content || item.text || '',
      image: `${index + 1}.png`,
      hashtags: item.hashtags || [],
      schedule_time: new Date(Date.now() + (index * 3 * 60 * 60 * 1000)).toISOString() // 3 hours apart
    })) || []
  };

  folder.file('later_campaign.json', JSON.stringify(laterMetadata, null, 2));

  // Add numbered images for Later
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`${parseInt(index) + 1}.png`, buffer);
  });

  // Later workflow guide
  const laterWorkflow = `# Later.com Import Workflow

## Quick Setup:
1. Open Later.com dashboard
2. Click "Create Post" → "Instagram ${contentType === 'instagram_story' ? 'Story' : 'Feed'}"
3. Upload images in numerical order (1.png, 2.png, etc.)

## Campaign Details:
- Total Posts: ${Object.keys(images).length}
- Content Type: ${contentType.replace('_', ' ')}
- Suggested Interval: 3 hours between posts

## Optimization Tips:
- Best posting times: 9-11 AM, 7-9 PM
- Use Later's best time suggestions
- Enable auto-posting for consistent scheduling

## Post Content:
${content?.map((item: any, index: number) => 
  `\n### Post ${index + 1}
Image: ${index + 1}.png
Content: ${(item.content || item.text || '').substring(0, 100)}${(item.content || item.text || '').length > 100 ? '...' : ''}`
).join('\n') || ''}
`;

  folder.file('LATER_WORKFLOW.md', laterWorkflow);
}

// ✅ HOOTSUITE FORMAT - Bulk upload format
async function createHootsuiteFormat(
  folder: JSZip, 
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }
) {
  // Create Hootsuite bulk upload CSV
  const hootsuiteCSV = `Date,Time,Content,Image
${content?.map((item: any, index: number) => {
    const postDate = new Date(Date.now() + (index * 4 * 60 * 60 * 1000)); // 4 hours apart
    const date = postDate.toISOString().split('T')[0];
    const time = postDate.toTimeString().split(' ')[0];
    const cleanContent = (item.content || item.text || '').replace(/"/g, '""').replace(/\n/g, ' ');
    return `${date},${time},"${cleanContent}",hootsuite_${index + 1}.jpg`;
  }).join('\n') || ''}`;

  folder.file('hootsuite_bulk_upload.csv', hootsuiteCSV);

  // Add images with Hootsuite naming
  Object.entries(images).forEach(([index, imageData]) => {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    folder.file(`hootsuite_${parseInt(index) + 1}.jpg`, buffer);
  });

  // Hootsuite import instructions
  const hootsuiteInstructions = `# Hootsuite Bulk Import

## Import Steps:
1. Log into Hootsuite dashboard
2. Go to "Publisher" → "Bulk Composer"
3. Upload the hootsuite_bulk_upload.csv file
4. Upload all image files when prompted

## File Format:
- CSV contains: Date, Time, Content, Image filename
- Images named: hootsuite_1.jpg, hootsuite_2.jpg, etc.
- 4-hour intervals between posts

## Important Notes:
- Review all content before publishing
- Adjust times based on your audience timezone
- Hootsuite supports Instagram ${contentType === 'instagram_story' ? 'Stories' : 'Posts'}

## Content Preview:
Total posts: ${Object.keys(images).length}
Platform: Instagram
Schedule: Every 4 hours starting now

## Troubleshooting:
- Ensure image files match CSV references exactly
- Check character limits per platform
- Verify account permissions for Instagram
`;

  folder.file('HOOTSUITE_INSTRUCTIONS.md', hootsuiteInstructions);
}

// ✅ RAW IMAGES - High quality exports
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
    
    const contentTitle = content?.[parseInt(index)]?.content || content?.[parseInt(index)]?.text || `content_${parseInt(index) + 1}`;
    const safeTitle = contentTitle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    
    folder.file(`${parseInt(index) + 1}_${safeTitle}.png`, buffer);
  });

  // Technical specifications
  const techSpecs = `# Raw Images - Technical Specifications

## Image Details:
- Format: PNG (lossless compression)
- Dimensions: ${contentType === 'instagram_story' ? '1080 x 1920 pixels' : '1080 x 1080 pixels'}
- Color Space: sRGB
- Quality: High Resolution (print ready)

## Files Included:
${Object.entries(images).map(([index, _]) => {
    const contentTitle = content?.[parseInt(index)]?.content || content?.[parseInt(index)]?.text || `content_${parseInt(index) + 1}`;
    const safeTitle = contentTitle.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    return `- ${parseInt(index) + 1}_${safeTitle}.png`;
  }).join('\n')}

## Usage Recommendations:
- Direct upload to Instagram/social platforms
- Use for custom design workflows
- Archive as source files
- Print versions available at 300 DPI

## Platform Compatibility:
✅ Instagram ${contentType === 'instagram_story' ? 'Stories' : 'Posts'}
✅ Facebook ${contentType === 'instagram_story' ? 'Stories' : 'Posts'}
✅ LinkedIn ${contentType === 'linkedin_carousel' ? 'Carousel' : 'Posts'}
✅ Twitter/X Image Posts
✅ Pinterest Pins
✅ Custom design software (Canva, Figma, etc.)
`;

  folder.file('TECHNICAL_SPECS.md', techSpecs);
}

// ✅ MASTER README
function createMasterReadme(
  contentType: string, 
  content: any[], 
  images: { [key: number]: string }, 
  exportFormats: string[]
): string {
  return `# ${contentType.toUpperCase().replace('_', ' ')} - Platform Export Package

Generated: ${new Date().toLocaleString()}
Total Images: ${Object.keys(images).length}
Export Formats: ${exportFormats.length}

## 📁 Folder Structure:

${exportFormats.map(format => {
    const descriptions = {
      'canva_templates': '🎨 Ready-to-import Canva templates with positioning data',
      'buffer_ready': '📅 CSV schedule + images for Buffer bulk import',
      'later_scheduler': '⏰ JSON campaign file + numbered images for Later.com',
      'hootsuite_format': '🚀 Bulk upload CSV + images for Hootsuite Publisher',
      'raw_images': '🖼️ High-quality PNG files for direct platform upload'
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

${content?.map((item: any, index: number) => 
  `**${index + 1}.** ${(item.content || item.text || '').substring(0, 80)}${(item.content || item.text || '').length > 80 ? '...' : ''}`
).join('\n') || 'No content available'}

## ⚡ Pro Tips:

- **Optimal Posting Times:** 9-11 AM, 7-9 PM (adjust for your timezone)
- **Hashtag Strategy:** Add relevant hashtags before publishing
- **Engagement:** Respond to comments within first hour for better reach
- **Analytics:** Track performance and adjust future content accordingly

## 🔧 Technical Support:

If you encounter any issues:
1. Check platform-specific instruction files
2. Verify image file integrity
3. Ensure proper account permissions
4. Contact support with error details

---
*Generated by CastLumen - ${new Date().getFullYear()}*
`;
}
