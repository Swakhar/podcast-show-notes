export interface RepurposingConfig {
  sourceJobId: string;
  contentTypes: string[];
  customInstructions?: string;
  targetAudience?: string;
  brandVoice?: string;
  includeDesignSpecs?: boolean;
  includeAnalytics?: boolean;
  includeScheduling?: boolean;
}

export interface RepurposingJobResult {
  id: string;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  stage?: string;
  billed_minutes?: number;
  result?: {
    repurposed_content?: Record<string, any>;
  };
}

export interface ContentActionsProps {
  content: any;
  contentType: 'linkedin_carousel' | 'twitter_thread' | 'instagram_story' | 'tiktok_script' | 'blog_outline' | 'email_course' | 'infographic_data';
  filename?: string;
}

export type RepurposingSectionMode = 'sidebar' | 'inline' | 'standalone';
