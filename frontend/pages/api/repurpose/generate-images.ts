import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

interface StoryImageData {
  contentType: 'instagram_story' | 'linkedin_carousel';
  stories?: any[];
  slides?: any[];
  designSpecs?: {
    dimensions?: string;
    format?: string;
    brand_colors?: string[];
    font_family?: string;
    [key: string]: any;
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

    const { contentType, stories, slides, designSpecs }: StoryImageData = req.body;

    if (!contentType || (!stories && !slides)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Provide safe defaults for designSpecs
    const safeDesignSpecs = {
      dimensions: designSpecs?.dimensions || (contentType === 'instagram_story' ? '1080x1920' : '1080x1080'),
      format: designSpecs?.format || 'png',
      brand_colors: designSpecs?.brand_colors || (contentType === 'instagram_story' ? ['#667eea', '#764ba2'] : ['#0077B5', '#00A0DC']),
      font_family: designSpecs?.font_family || 'Inter',
      ...designSpecs
    };

    // ✅ Generate images based on content type
    let generatedImages: { [key: number]: string } = {};

    if (contentType === 'instagram_story' && stories) {
      generatedImages = await generateInstagramStoryImages(stories, safeDesignSpecs);
    } else if (contentType === 'linkedin_carousel' && slides) {
      generatedImages = await generateLinkedInCarouselImages(slides, safeDesignSpecs);
    }

    return res.status(200).json({
      success: true,
      images: generatedImages,
      count: Object.keys(generatedImages).length
    });

  } catch (error: any) {
    console.error('Error generating images:', error);
    return res.status(500).json({ 
      error: 'Failed to generate images',
      details: error.message 
    });
  }
}

// ✅ Generate Instagram Story Images
async function generateInstagramStoryImages(
  stories: any[], 
  designSpecs: any
): Promise<{ [key: number]: string }> {
  const images: { [key: number]: string } = {};
  
  for (let i = 0; i < stories.length; i++) {
    const story = stories[i];
    
    try {
      // ✅ Create Canvas-based image generation
      const imageUrl = await createStoryImage({
        content: story.content || story.text || '',
        type: story.type || 'quote',
        background: story.background || 'gradient',
        brandColors: Array.isArray(designSpecs.brand_colors) ? designSpecs.brand_colors : ['#667eea', '#764ba2'],
        fontFamily: designSpecs.font_family || 'Inter',
        dimensions: designSpecs.dimensions || '1080x1920'
      });
      
      images[i] = imageUrl;
    } catch (error) {
      console.error(`Error generating story ${i}:`, error);
      // Continue with other images even if one fails
    }
  }
  
  return images;
}

// ✅ Generate LinkedIn Carousel Images
async function generateLinkedInCarouselImages(
  slides: any[], 
  designSpecs: any
): Promise<{ [key: number]: string }> {
  const images: { [key: number]: string } = {};
  
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    
    try {
      const imageUrl = await createCarouselSlide({
        title: slide.title || `Slide ${i + 1}`,
        content: slide.content || slide.text || '',
        slideNumber: i + 1,
        totalSlides: slides.length,
        brandColors: Array.isArray(designSpecs.brand_colors) ? designSpecs.brand_colors : ['#0077B5', '#00A0DC'],
        fontFamily: designSpecs.font_family || 'Inter',
        dimensions: designSpecs.dimensions || '1080x1080'
      });
      
      images[i] = imageUrl;
    } catch (error) {
      console.error(`Error generating slide ${i}:`, error);
    }
  }
  
  return images;
}

// ✅ Create Story Image using Canvas API
async function createStoryImage(params: {
  content: string;
  type: string;
  background: string;
  brandColors: string[];
  fontFamily: string;
  dimensions: string;
}): Promise<string> {
  const { createCanvas } = await import('canvas');
  
  // ✅ Safe dimensions parsing with fallback
  let width = 1080;
  let height = 1920;
  
  try {
    if (params.dimensions && typeof params.dimensions === 'string' && params.dimensions.includes('x')) {
      const [w, h] = params.dimensions.split('x').map(Number);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        width = w;
        height = h;
      }
    }
  } catch (error) {
    console.warn('Error parsing dimensions, using defaults:', error);
  }
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // ✅ Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const color1 = (params.brandColors && params.brandColors[0]) ? params.brandColors[0] : '#667eea';
  const color2 = (params.brandColors && params.brandColors[1]) ? params.brandColors[1] : '#764ba2';
  
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // ✅ Add content based on type
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Title/Icon with responsive sizing
  const iconSize = Math.min(width, height) * 0.08; // 8% of smaller dimension
  ctx.font = `${iconSize}px Arial`;
  
  if (params.type === 'quote') {
    ctx.fillText('💭', width / 2, height * 0.25);
  } else if (params.type === 'stat') {
    ctx.fillText('📊', width / 2, height * 0.25);
  } else if (params.type === 'tip') {
    ctx.fillText('💡', width / 2, height * 0.25);
  } else if (params.type === 'question') {
    ctx.fillText('❓', width / 2, height * 0.25);
  } else {
    // Default icon
    ctx.fillText('✨', width / 2, height * 0.25);
  }
  
  // Main content with responsive font size
  const fontSize = Math.min(width, height) * 0.04; // 4% of smaller dimension
  ctx.font = `bold ${fontSize}px Arial`;
  
  // Safe content handling
  const content = params.content || 'Sample Content';
  const words = content.split(' ');
  const lines = [];
  let currentLine = '';
  
  // Word wrap
  for (const word of words) {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width * 0.8 && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }
  
  // Draw text lines
  const lineHeight = fontSize * 1.3;
  const startY = height / 2 - (lines.length * lineHeight) / 2;
  
  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });
  
  // ✅ Convert to base64 data URL
  return canvas.toDataURL('image/png');
}

// ✅ Create Carousel Slide
async function createCarouselSlide(params: {
  title: string;
  content: string;
  slideNumber: number;
  totalSlides: number;
  brandColors: string[];
  fontFamily: string;
  dimensions: string;
}): Promise<string> {
  const { createCanvas } = await import('canvas');
  
  // ✅ Safe dimensions parsing with fallback
  let width = 1080;
  let height = 1080;
  
  try {
    if (params.dimensions && typeof params.dimensions === 'string' && params.dimensions.includes('x')) {
      const [w, h] = params.dimensions.split('x').map(Number);
      if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
        width = w;
        height = h;
      }
    }
  } catch (error) {
    console.warn('Error parsing dimensions, using defaults:', error);
  }
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // ✅ Create LinkedIn-style background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const color1 = (params.brandColors && params.brandColors[0]) ? params.brandColors[0] : '#0077B5';
  const color2 = (params.brandColors && params.brandColors[1]) ? params.brandColors[1] : '#00A0DC';
  
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // ✅ Add slide number
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = `${width * 0.033}px Arial`; // Responsive font size
  ctx.textAlign = 'right';
  ctx.fillText(`${params.slideNumber}/${params.totalSlides}`, width - 40, 60);
  
  // ✅ Add title
  ctx.fillStyle = 'white';
  ctx.font = `bold ${width * 0.067}px Arial`; // Responsive title font
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Word wrap title
  const title = params.title || `Slide ${params.slideNumber}`;
  const titleWords = title.split(' ');
  const titleLines = [];
  let currentTitleLine = '';
  
  for (const word of titleWords) {
    const testLine = currentTitleLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width * 0.8 && currentTitleLine !== '') {
      titleLines.push(currentTitleLine.trim());
      currentTitleLine = word + ' ';
    } else {
      currentTitleLine = testLine;
    }
  }
  if (currentTitleLine.trim()) {
    titleLines.push(currentTitleLine.trim());
  }
  
  // Draw title
  titleLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, 120 + index * (width * 0.083));
  });
  
  // ✅ Add content
  ctx.font = `${width * 0.044}px Arial`; // Responsive content font
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const content = params.content || 'Sample content for this slide';
  const contentWords = content.split(' ');
  const contentLines = [];
  let currentContentLine = '';
  
  for (const word of contentWords) {
    const testLine = currentContentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width * 0.85 && currentContentLine !== '') {
      contentLines.push(currentContentLine.trim());
      currentContentLine = word + ' ';
    } else {
      currentContentLine = testLine;
    }
  }
  if (currentContentLine.trim()) {
    contentLines.push(currentContentLine.trim());
  }
  
  // Draw content
  const contentStartY = height / 2 + 50;
  const contentLineHeight = width * 0.056;
  contentLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, contentStartY + index * contentLineHeight);
  });
  
  return canvas.toDataURL('image/png');
}
