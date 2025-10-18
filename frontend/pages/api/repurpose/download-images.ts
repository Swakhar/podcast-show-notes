import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';

interface DownloadImagesData {
  contentType: 'instagram_story' | 'linkedin_carousel' | 'tiktok_script';
  stories?: any[];
  slides?: any[];
  scenes?: any[]; // ✅ Add scenes for TikTok
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

    const { contentType, stories, slides, scenes, images }: DownloadImagesData = req.body;

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
        // ✅ Update ONLY the TikTok section in the image processing loop:

        // ✅ Handle TikTok file URLs (different from Instagram/LinkedIn base64)
        if (contentType === 'tiktok_script' && typeof imageDataUrl === 'string' && imageDataUrl.startsWith('/generated/')) {
          // Read file from disk
          const filePath = path.join(process.cwd(), 'public', imageDataUrl);
          
          if (fs.existsSync(filePath)) {
            const buffer = fs.readFileSync(filePath);
            
            const sceneType = scenes?.[parseInt(index)]?.type || 'scene';
            const sceneAction = scenes?.[parseInt(index)]?.action || '';
            const safeAction = sceneAction.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 15);
            const filename = `scene_${parseInt(index) + 1}_${sceneType}_${safeAction}_${timestamp}.png`;
            
            zip.file(filename, buffer);
          } else {
            // ✅ NEW: Handle missing TikTok files
            console.warn(`TikTok scene file not found: ${filePath}`);
            // Don't add to zip, but continue processing other images
          }
        } else {
          // ✅ Handle Instagram/LinkedIn base64 (UNCHANGED)
          const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          let filename = '';
          if (contentType === 'instagram_story') {
            const storyType = stories?.[parseInt(index)]?.type || 'story';
            filename = `story_${parseInt(index) + 1}_${storyType}_${timestamp}.png`;
          } else if (contentType === 'linkedin_carousel') {
            const slideTitle = slides?.[parseInt(index)]?.title || `slide_${parseInt(index) + 1}`;
            const safeTitle = slideTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
            filename = `slide_${parseInt(index) + 1}_${safeTitle}_${timestamp}.png`;
          }
          
          zip.file(filename, buffer);
        }

      } catch (error) {
        // Continue with other images
      }
    }
    
    // ✅ Add metadata file with TikTok support
    const metadata = {
      generated_at: new Date().toISOString(),
      content_type: contentType,
      total_images: Object.keys(images).length,
      user_email: session.user.email,
      specifications: {
        dimensions: contentType === 'instagram_story' || contentType === 'tiktok_script' ? '1080x1920' : '1080x1080',
        format: 'PNG',
        quality: 'High Resolution',
        ready_for: contentType === 'instagram_story' ? 'Instagram Stories' : 
                  contentType === 'linkedin_carousel' ? 'LinkedIn Carousel' : 
                  'TikTok Video Production'
      },
      usage_instructions: contentType === 'instagram_story' 
        ? [
            '1. Upload images to Instagram Stories',
            '2. Add interactive elements (polls, questions, etc.)',
            '3. Post at optimal times (9-11 AM or 7-9 PM)',
            '4. Use relevant hashtags in your story highlights'
          ]
        : contentType === 'linkedin_carousel'
        ? [
            '1. Create new LinkedIn post',
            '2. Upload all slides in order',
            '3. Add engaging caption with insights',
            '4. Include relevant hashtags and tag connections'
          ]
        : [
            // ✅ TikTok instructions
            '1. Use scene frames as reference for video production',
            '2. Film each scene according to the action descriptions',
            '3. Edit scenes together using CapCut, InShot, or similar apps',
            '4. Add trending music and effects',
            '5. Post at optimal times (6-10 AM, 7-9 PM)',
            '6. Use relevant hashtags and trends'
          ],
      // ✅ Add TikTok-specific metadata
      ...(contentType === 'tiktok_script' && {
        production_notes: {
          total_scenes: scenes?.length || 0,
          estimated_duration: `${scenes?.reduce((total, scene) => total + (scene.duration || 5), 0) || 30} seconds`,
          scene_types: scenes?.map(scene => scene.type).filter((type, index, arr) => arr.indexOf(type) === index) || [],
          recommended_equipment: [
            'Smartphone with good camera',
            'Ring light or natural lighting',
            'Tripod or phone stabilizer',
            'Video editing app (CapCut, InShot, Adobe Premiere)'
          ]
        }
      })
    };
    
    zip.file('README.json', JSON.stringify(metadata, null, 2));
    
    // ✅ Add TikTok production guide
    if (contentType === 'tiktok_script' && scenes) {
      const productionGuide = `# TikTok Video Production Guide

## 🎬 Scene Breakdown:

${scenes.map((scene, index) => `
### Scene ${index + 1}: ${scene.type?.toUpperCase() || 'CONTENT'}
- **Duration:** ${scene.duration || 5} seconds
- **Action:** ${scene.action || 'Standard shot'}
- **Dialogue:** ${scene.dialogue || scene.content || 'No dialogue'}
- **Visual Cues:** ${scene.visual_cues || 'Standard visuals'}
- **Image Reference:** scene_${index + 1}_${scene.type || 'scene'}_*.png

`).join('')}

## 🎯 Filming Tips:

### Pre-Production:
- [ ] Review all scene images for reference
- [ ] Practice dialogue and transitions
- [ ] Set up lighting and camera position
- [ ] Prepare any props or visual aids

### Production:
- [ ] Film each scene separately
- [ ] Record multiple takes for best options
- [ ] Maintain consistent lighting
- [ ] Keep camera steady (use tripod if available)

### Post-Production:
- [ ] Import all scene clips to editing app
- [ ] Cut scenes according to duration guidelines
- [ ] Add trending music/sounds
- [ ] Include text overlays from visual cues
- [ ] Export in 1080x1920 resolution

## 📱 Recommended Apps:
- **CapCut** (Free, TikTok's official editor)
- **InShot** (User-friendly mobile editor)
- **Adobe Premiere Pro** (Professional option)
- **DaVinci Resolve** (Free professional editor)

## 🚀 Publishing Checklist:
- [ ] Video is under 60 seconds
- [ ] Audio is clear and engaging
- [ ] Hook grabs attention in first 3 seconds
- [ ] Includes trending hashtags
- [ ] Posted at optimal time for your audience
`;

      zip.file('PRODUCTION_GUIDE.md', productionGuide);
    }
    
    // ✅ Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    
    // ✅ Set response headers for download
    const filename = contentType === 'instagram_story' 
      ? `instagram_stories_${timestamp}.zip`
      : contentType === 'linkedin_carousel'
      ? `linkedin_carousel_${timestamp}.zip`
      : `tiktok_scenes_${timestamp}.zip`; // ✅ Add TikTok filename
      
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    // ✅ Send ZIP file
    res.status(200).send(zipBuffer);

  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Failed to create download',
      details: error.message 
    });
  }
}
