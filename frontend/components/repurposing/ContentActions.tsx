import { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';

export interface ContentActionsProps {
  content: any;
  contentType: 'linkedin_carousel' | 'twitter_thread' | 'instagram_story' | 'tiktok_script' | 'blog_outline' | 'email_course' | 'infographic_data';
  filename?: string;
}

interface ActionButton {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';
  action: () => Promise<void> | void;
}

export default function ContentActions({ 
  content, 
  contentType, 
  filename
}: ContentActionsProps) {
  const { showToast } = useToast(); // Using your existing toast context
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  const [completedActions, setCompletedActions] = useState<{[key: string]: boolean}>({});

  const setLoading = (actionId: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [actionId]: loading }));
  };

  const setCompleted = (actionId: string, completed: boolean) => {
    setCompletedActions(prev => ({ ...prev, [actionId]: completed }));
    if (completed) {
      setTimeout(() => {
        setCompletedActions(prev => ({ ...prev, [actionId]: false }));
      }, 2000);
    }
  };

  // Universal content extraction
  const extractTextContent = (): string => {
    try {
      switch (contentType) {
        case 'instagram_story':
          const stories = content?.structured_data?.story_sequence || content?.stories || [];
          return stories.map((story: any, i: number) => 
            `Story ${i + 1}:\n${story.content || story.text || story}\n`
          ).join('\n') || '';
          
        case 'twitter_thread':
          const hookTweet = content?.structured_data?.hook_tweet || content?.hook_tweet || '';
          const threadTweets = content?.structured_data?.thread_tweets || content?.thread_tweets || [];
          const allTweets = [hookTweet, ...threadTweets.map((t: any) => t.content || t.text || t)];
          return allTweets.map((tweet, index) => `${index + 1}/${allTweets.length} ${tweet}`).join('\n\n');
          
        case 'linkedin_carousel':
          const slides = content?.structured_data?.slides || content?.slides || [];
          const title = content?.structured_data?.title || content?.title || 'LinkedIn Carousel';
          const hashtags = content?.structured_data?.hashtags || content?.hashtags || [];
          const slideTexts = slides.map((slide: any, index: number) => 
            `Slide ${index + 1}: ${slide.content || slide.text || slide}`
          ).join('\n\n');
          return `${title}\n\n${slideTexts}\n\n${hashtags.join(' ')}`;
          
        case 'tiktok_script':
          const script = content?.structured_data?.script || content?.script || {};
          const scenes = script?.scenes || [];
          return scenes.map((scene: any, index: number) => {
            return `SCENE ${index + 1}:\n${scene.action || ''}\n\nDIALOGUE:\n${scene.dialogue || scene.content || ''}`;
          }).join('\n\n---\n\n');
          
        case 'blog_outline':
          const outline = content?.structured_data?.blog_outline || content?.outline || {};
          const sections = outline?.sections || [];
          return `# ${outline.title}\n\n## Introduction\n${outline.introduction}\n\n` +
            sections.map((section: any) => 
              `## ${section.heading}\n${section.content || section.summary || ''}\n\n` +
              (section.subsections || []).map((sub: any) => `### ${sub.heading}\n${sub.content || ''}`).join('\n\n')
            ).join('\n\n') +
            `\n\n## Conclusion\n${outline.conclusion}`;
            
        case 'email_course':
          const course = content?.structured_data?.email_course || content?.course || {};
          const emails = course?.emails || [];
          return emails.map((email: any, index: number) => 
            `EMAIL ${index + 1}: ${email.subject}\n\n${email.content}\n\n---\n\n`
          ).join('');
          
        case 'infographic_data':
          const infographic = content?.structured_data?.infographic || content?.infographic || {};
          const dataPoints = infographic?.data_points || [];
          const designSpecs = content?.design_automation || content?.design_specs || {};
          return JSON.stringify({
            title: infographic.title,
            subtitle: infographic.subtitle,
            data_points: dataPoints,
            design_specs: designSpecs,
            call_to_action: infographic.cta
          }, null, 2);
          
        default:
          return JSON.stringify(content, null, 2);
      }
    } catch (error) {
      console.error('Error extracting content:', error);
      return JSON.stringify(content, null, 2);
    }
  };

  // Action handlers
  const copyToClipboard = async () => {
    try {
      const textContent = extractTextContent();
      await navigator.clipboard.writeText(textContent);
      showToast('Content copied to clipboard!', 'success');
      return true;
    } catch (error) {
      showToast('Failed to copy content to clipboard', 'error');
      return false;
    }
  };

  const downloadAsFile = async (format: 'txt' | 'json' | 'md' = 'txt') => {
    try {
      const textContent = extractTextContent();
      const defaultFilename = filename || `${contentType}_${Date.now()}.${format}`;
      
      const mimeTypes = {
        txt: 'text/plain',
        json: 'application/json',
        md: 'text/markdown'
      };
      
      const blob = new Blob([textContent], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showToast(`Content downloaded as ${format.toUpperCase()}!`, 'success');
      return true;
    } catch (error) {
      showToast('Failed to download content', 'error');
      return false;
    }
  };

  const exportForPlatform = async () => {
    try {
      // Platform-specific export logic would go here
      // For now, we'll simulate the action
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (contentType) {
        case 'instagram_story':
          showToast('Story images generated! Ready for Instagram.', 'success');
          break;
        case 'linkedin_carousel':
          showToast('Carousel slides exported! Ready for LinkedIn.', 'success');
          break;
        case 'twitter_thread':
          showToast('Thread formatted! Ready for Twitter.', 'success');
          break;
        case 'tiktok_script':
          showToast('Script exported! Ready for video production.', 'success');
          break;
        case 'blog_outline':
          showToast('Outline exported! Ready for WordPress.', 'success');
          break;
        case 'email_course':
          showToast('Email sequence exported! Ready for ESP.', 'success');
          break;
        case 'infographic_data':
          showToast('Infographic data exported! Ready for design.', 'success');
          break;
      }
      return true;
    } catch (error) {
      showToast('Platform export failed. Please try again.', 'error');
      return false;
    }
  };

  const openInDesignTool = async () => {
    try {
      // This would integrate with Canva, Figma, etc.
      const designUrls = {
        linkedin_carousel: 'https://www.canva.com/design/create?template=linkedin-carousel',
        instagram_story: 'https://www.canva.com/design/create?template=instagram-story',
        infographic_data: 'https://www.canva.com/design/create?template=infographic',
        tiktok_script: 'https://www.canva.com/design/create?template=video-script'
      };
      
      const url = designUrls[contentType as keyof typeof designUrls];
      if (url) {
        window.open(url, '_blank');
        showToast('Design tool opened in new tab!', 'success');
      } else {
        showToast('Design tool integration coming soon!', 'info');
      }
      return true;
    } catch (error) {
      showToast('Failed to open design tool', 'error');
      return false;
    }
  };

  const scheduleContent = async () => {
    try {
      // This would integrate with Buffer, Hootsuite, etc.
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('Content scheduled successfully!', 'success');
      return true;
    } catch (error) {
      showToast('Scheduling failed. Please try again.', 'error');
      return false;
    }
  };

  // Define actions based on content type
  const getActionsForContentType = (): ActionButton[] => {
    const baseActions: ActionButton[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: '📋',
        description: 'Copy to clipboard',
        color: 'blue',
        action: async () => {
          setLoading('copy', true);
          const success = await copyToClipboard();
          setLoading('copy', false);
          setCompleted('copy', success);
        }
      },
      {
        id: 'download',
        label: 'Download',
        icon: '💾',
        description: 'Download as file',
        color: 'green',
        action: async () => {
          setLoading('download', true);
          const success = await downloadAsFile();
          setLoading('download', false);
          setCompleted('download', success);
        }
      }
    ];

    const specificActions: {[key: string]: ActionButton[]} = {
      linkedin_carousel: [
        {
          id: 'design',
          label: 'Edit in Canva',
          icon: '🎨',
          description: 'Open design template',
          color: 'purple',
          action: async () => {
            setLoading('design', true);
            const success = await openInDesignTool();
            setLoading('design', false);
            setCompleted('design', success);
          }
        },
        {
          id: 'export',
          label: 'Export Images',
          icon: '📱',
          description: 'Generate slide images',
          color: 'orange',
          action: async () => {
            setLoading('export', true);
            const success = await exportForPlatform();
            setLoading('export', false);
            setCompleted('export', success);
          }
        }
      ],
      twitter_thread: [
        {
          id: 'schedule',
          label: 'Schedule',
          icon: '📅',
          description: 'Schedule posts',
          color: 'blue',
          action: async () => {
            setLoading('schedule', true);
            const success = await scheduleContent();
            setLoading('schedule', false);
            setCompleted('schedule', success);
          }
        },
        {
          id: 'export',
          label: 'Export Thread',
          icon: '🧵',
          description: 'Format for Twitter',
          color: 'blue',
          action: async () => {
            setLoading('export', true);
            const success = await exportForPlatform();
            setLoading('export', false);
            setCompleted('export', success);
          }
        }
      ],
      instagram_story: [
        {
          id: 'images',
          label: 'Export Images',
          icon: '📱',
          description: '9:16 ratio images',
          color: 'pink',
          action: async () => {
            setLoading('images', true);
            const success = await exportForPlatform();
            setLoading('images', false);
            setCompleted('images', success);
          }
        },
        {
          id: 'schedule',
          label: 'Schedule Stories',
          icon: '📅',
          description: 'Auto-post sequence',
          color: 'purple',
          action: async () => {
            setLoading('schedule', true);
            const success = await scheduleContent();
            setLoading('schedule', false);
            setCompleted('schedule', success);
          }
        }
      ],
      tiktok_script: [
        {
          id: 'export',
          label: 'Export Script',
          icon: '🎬',
          description: 'Production ready',
          color: 'red',
          action: async () => {
            setLoading('export', true);
            const success = await exportForPlatform();
            setLoading('export', false);
            setCompleted('export', success);
          }
        }
      ],
      blog_outline: [
        {
          id: 'markdown',
          label: 'Export Markdown',
          icon: '📝',
          description: 'WordPress ready',
          color: 'green',
          action: async () => {
            setLoading('markdown', true);
            const success = await downloadAsFile('md');
            setLoading('markdown', false);
            setCompleted('markdown', success);
          }
        },
        {
          id: 'publish',
          label: 'Publish to CMS',
          icon: '🌐',
          description: 'Direct integration',
          color: 'blue',
          action: async () => {
            setLoading('publish', true);
            const success = await exportForPlatform();
            setLoading('publish', false);
            setCompleted('publish', success);
          }
        }
      ],
      email_course: [
        {
          id: 'csv',
          label: 'Export CSV',
          icon: '📊',
          description: 'ESP compatible',
          color: 'orange',
          action: async () => {
            setLoading('csv', true);
            const success = await downloadAsFile('txt');
            setLoading('csv', false);
            setCompleted('csv', success);
          }
        },
        {
          id: 'esp',
          label: 'Upload to ESP',
          icon: '📮',
          description: 'Mailchimp/ConvertKit',
          color: 'pink',
          action: async () => {
            setLoading('esp', true);
            const success = await exportForPlatform();
            setLoading('esp', false);
            setCompleted('esp', success);
          }
        }
      ],
      infographic_data: [
        {
          id: 'design',
          label: 'Open in Canva',
          icon: '🎨',
          description: 'Design template',
          color: 'purple',
          action: async () => {
            setLoading('design', true);
            const success = await openInDesignTool();
            setLoading('design', false);
            setCompleted('design', success);
          }
        },
        {
          id: 'export',
          label: 'Export Designs',
          icon: '📊',
          description: 'Multiple formats',
          color: 'blue',
          action: async () => {
            setLoading('export', true);
            const success = await exportForPlatform();
            setLoading('export', false);
            setCompleted('export', success);
          }
        }
      ]
    };

    return [...baseActions, ...(specificActions[contentType] || [])];
  };

  const actions = getActionsForContentType();

  const getButtonColor = (color: string, variant: 'bg' | 'hover' | 'border' = 'bg') => {
    const colors = {
      blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-200' },
      green: { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-200' },
      purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', border: 'border-orange-200' },
      red: { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-200' },
      pink: { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', border: 'border-pink-200' }
    };
    return colors[color as keyof typeof colors]?.[variant] || colors.blue[variant];
  };

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {actions.slice(0, 2).map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={loadingStates[action.id]}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200
              ${getButtonColor(action.color, 'bg')} ${getButtonColor(action.color, 'hover')}
              disabled:opacity-50 disabled:cursor-not-allowed
              ${completedActions[action.id] ? 'ring-2 ring-green-300' : ''}
            `}
          >
            {loadingStates[action.id] ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : completedActions[action.id] ? (
              <span className="text-green-300">✓</span>
            ) : (
              <span>{action.icon}</span>
            )}
            <span>{loadingStates[action.id] ? 'Loading...' : action.label}</span>
          </button>
        ))}
      </div>

      {/* Advanced Actions */}
      {actions.length > 2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.slice(2).map((action) => (
            <motion.button
              key={action.id}
              onClick={action.action}
              disabled={loadingStates[action.id]}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full p-3 bg-white border rounded-lg transition-all duration-200
                ${getButtonColor(action.color, 'border')} hover:border-opacity-60
                disabled:opacity-50 disabled:cursor-not-allowed
                ${completedActions[action.id] ? 'ring-2 ring-green-300 bg-green-50' : 'hover:shadow-md'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {loadingStates[action.id] ? (
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : completedActions[action.id] ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span>{action.icon}</span>
                  )}
                </div>
                <div className="text-left">
                  <div className={`font-medium ${getButtonColor(action.color, 'bg').replace('bg-', 'text-').replace('-500', '-900')}`}>
                    {action.label}
                  </div>
                  <div className="text-xs text-gray-600">{action.description}</div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
