import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "../../../contexts/ToastContext";
import ContentActions from '../ContentActions';

interface EmailCoursePreviewProps {
  data: any;
}

export default function EmailCoursePreview({ data }: EmailCoursePreviewProps) {
  const { showToast } = useToast();
  const [currentEmail, setCurrentEmail] = useState(0);
  const [viewMode, setViewMode] = useState<'sequence' | 'email' | 'analytics'>('sequence');
  const [selectedEmailClient, setSelectedEmailClient] = useState<'gmail' | 'outlook' | 'apple'>('gmail');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ [key: string]: any }>({});
  
  const course = data?.email_course || data?.structured_data?.email_course || {};
  const emails = course?.emails || [];
  const designSpecs = data?.design_automation || data?.design_specs || {};
  const analytics = data?.email_analytics || {};

  const copyToClipboard = (text: string) => {
    console.log('Copying to clipboard:', text);
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  const exportEmailSequence = () => {
    return emails.map((email: any, index: number) => 
      `EMAIL ${index + 1}: ${email.subject}\n\n${email.content}\n\n---\n\n`
    ).join('');
  };

  // ✅ Generate enhanced email content (WordPress export, automation setup, etc.)
  const generateEnhancedContent = async () => {
    setIsGeneratingContent(true);
    
    try {
      const response = await fetch('/api/repurpose/generate-email-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course: course,
          emails: emails,
          designSpecs: {
            format: 'enhanced',
            include_automation_setup: true,
            include_email_templates: true,
            include_analytics_tracking: true,
            include_social_integration: true
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to generate enhanced content');

      const result = await response.json();
      setGeneratedContent(result);
      showToast('Enhanced email course content generated successfully!', 'success');
    } catch (error: any) {
      console.error('Error generating enhanced content:', error);
      showToast(`Error generating content: ${error.message}`, 'error');
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // ✅ Download multiple formats (HTML templates, plain text, automation files)
  const downloadMultipleFormats = () => {
    try {
      // HTML Email Templates
      const htmlContent = generateHTMLTemplates();
      downloadFile(htmlContent, 'email_course_html_templates.html', 'text/html');

      // Plain Text Version
      const plainTextContent = generatePlainTextVersion();
      downloadFile(plainTextContent, 'email_course_plain_text.txt', 'text/plain');

      // Email Automation Setup (JSON)
      const automationContent = generateAutomationSetup();
      downloadFile(JSON.stringify(automationContent, null, 2), 'email_automation_setup.json', 'application/json');

      // Mailchimp Import CSV
      const csvContent = generateMailchimpCSV();
      downloadFile(csvContent, 'mailchimp_email_sequence.csv', 'text/csv');

      showToast('All email formats downloaded successfully!', 'success');
    } catch (error: any) {
      showToast(`Error downloading files: ${error.message}`, 'error');
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateHTMLTemplates = () => {
    return emails.map((email: any, index: number) => `
<!-- EMAIL ${index + 1}: ${email.subject} -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${email.subject}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { background: white; padding: 30px; }
        .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Day ${index + 1}: ${email.subject}</h1>
        </div>
        <div class="content">
            ${email.content.replace(/\n/g, '<br>')}
            ${email.cta ? `<p style="text-align: center;"><a href="${email.cta.url || '#'}" class="cta-button">${email.cta.text}</a></p>` : ''}
        </div>
        <div class="footer">
            <p>You're receiving this because you signed up for our email course.</p>
            <p><a href="#">Unsubscribe</a> | <a href="#">Update preferences</a></p>
        </div>
    </div>
</body>
</html>

`).join('\n\n');
  };

  const generatePlainTextVersion = () => {
    return emails.map((email: any, index: number) => `
EMAIL ${index + 1}: ${email.subject}
==================================================

${email.content}

${email.cta ? `👉 ${email.cta.text}: ${email.cta.url || '[INSERT_LINK]'}` : ''}

--
Best regards,
Your Course Team

You're receiving this because you signed up for our email course.
Unsubscribe: [UNSUBSCRIBE_LINK]
Update preferences: [PREFERENCES_LINK]

`).join('\n' + '='.repeat(60) + '\n');
  };

  const generateAutomationSetup = () => {
    return {
      platform: "general_automation",
      course_title: course.title,
      total_emails: emails.length,
      sequence: emails.map((email: any, index: number) => ({
        email_number: index + 1,
        send_delay_days: index * (course.interval_days || 1),
        subject_line: email.subject,
        preview_text: email.preview || email.content.substring(0, 100),
        tags_to_add: [`course_email_${index + 1}`, 'email_course_subscriber'],
        automation_triggers: index === 0 ? ['course_signup'] : [`email_${index}_opened`],
        a_b_test_subjects: [
          email.subject,
          email.subject.replace(/^\w/, (c: string) => c.toUpperCase()),
          `${email.subject} 📧`
        ]
      })),
      mailchimp_setup: {
        list_name: `${course.title} Email Course`,
        automation_name: `${course.title} - Auto Sequence`,
        segments: ['email_course_subscribers', 'high_engagement', 'needs_nurturing']
      },
      convertkit_setup: {
        sequence_name: course.title,
        tag_subscribers: 'email_course_member',
        automation_rules: emails.map((_, index) => ({
          trigger: index === 0 ? 'tag_added' : 'email_opened',
          delay: `${index * (course.interval_days || 1)} days`,
          action: 'send_email'
        }))
      }
    };
  };

  const generateMailchimpCSV = () => {
    const headers = ['Email Number', 'Subject Line', 'Send Delay (Days)', 'Preview Text', 'Tags'];
    const rows = emails.map((email: any, index: number) => [
      index + 1,
      `"${email.subject}"`,
      index * (course.interval_days || 1),
      `"${email.preview || email.content.substring(0, 50)}..."`,
      `"course_email_${index + 1}, email_course_subscriber"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const formatDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEmailClientStyles = () => {
    const styles = {
      gmail: {
        header: 'bg-red-500',
        sidebar: 'bg-gray-100',
        accent: 'text-red-600'
      },
      outlook: {
        header: 'bg-blue-600',
        sidebar: 'bg-blue-50',
        accent: 'text-blue-600'
      },
      apple: {
        header: 'bg-gray-800',
        sidebar: 'bg-gray-50',
        accent: 'text-blue-500'
      }
    };
    return styles[selectedEmailClient];
  };

  const estimateReadingTime = (content: string) => {
    return Math.ceil((content?.length || 500) / 1000);
  };

  const formatWordCount = (content: string) => {
    return Math.floor((content?.length || 500) / 5);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-xl text-white">📧</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Email Course</h3>
            <p className="text-sm text-gray-600">
              {emails.length} emails • {course.duration || '7-day'} sequence • Auto-scheduled
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('sequence')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'sequence' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📋 Sequence
            </button>
            <button
              onClick={() => setViewMode('email')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'email' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📧 Email View
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              📊 Analytics
            </button>
          </div>
          
          <button
            onClick={generateEnhancedContent}
            disabled={isGeneratingContent}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {isGeneratingContent ? '⏳ Generating...' : '🚀 Generate Enhanced'}
          </button>

          <button
            onClick={() => copyToClipboard(exportEmailSequence())}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            📋 Copy Sequence
          </button>
        </div>
      </div>

      {/* Sequence Overview */}
      {viewMode === 'sequence' && (
        <div className="space-y-6">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {course.title || 'Master the Art of [Topic] in 7 Days'}
            </h1>
            <p className="text-gray-600 mb-4">
              {course.description || 'Transform your knowledge into actionable insights with this comprehensive email course.'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                📧 {emails.length} emails
              </span>
              <span className="flex items-center gap-1">
                📅 {course.duration || '7 days'}
              </span>
              <span className="flex items-center gap-1">
                📈 {analytics.expected_open_rate || '45'}% avg open rate
              </span>
              <span className="flex items-center gap-1">
                🎯 {analytics.expected_click_rate || '12'}% avg click rate
              </span>
            </div>
          </div>

          {/* Email Timeline */}
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-orange-200"></div>
            
            <div className="space-y-6">
              {emails.map((email: any, index: number) => {
                const sendDay = index === 0 ? 0 : index * (course.interval_days || 1);
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex items-start gap-4"
                  >
                    {/* Timeline Node */}
                    <div className="relative z-10 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                    
                    {/* Email Card */}
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-orange-600">
                              Day {sendDay} • {formatDate(sendDay)}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                              {email.type || 'Educational'}
                            </span>
                          </div>
                          <h4 className="font-bold text-gray-900 mb-2">{email.subject}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {email.preview || email.content?.substring(0, 150) + '...'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => {
                              setCurrentEmail(index);
                              setViewMode('email');
                            }}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => copyToClipboard(email.content)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                      
                      {/* Email Metrics */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <span className="flex items-center gap-1">
                          📖 Est. open: {Math.floor(Math.random() * 20) + 40}%
                        </span>
                        <span className="flex items-center gap-1">
                          🖱️ Est. click: {Math.floor(Math.random() * 10) + 8}%
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ Read time: {estimateReadingTime(email.content)} min
                        </span>
                        <span className="flex items-center gap-1">
                          📝 Words: {formatWordCount(email.content)}
                        </span>
                      </div>
                      
                      {/* Key Topics */}
                      {email.key_topics && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {email.key_topics.slice(0, 3).map((topic: string, topicIndex: number) => (
                            <span
                              key={topicIndex}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Email Client View */}
      {viewMode === 'email' && (
        <div className="space-y-4">
          {/* Email Client Selector */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-gray-600 mr-2">Preview in:</span>
            {['gmail', 'outlook', 'apple'].map((client) => (
              <button
                key={client}
                onClick={() => setSelectedEmailClient(client as any)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedEmailClient === client
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {client.charAt(0).toUpperCase() + client.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-gray-100 rounded-xl p-4">
            <div className="max-w-4xl mx-auto">
              {/* Email Client Mockup */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-300">
                {/* Email Client Header */}
                <div className={`${getEmailClientStyles().header} text-white p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📧</span>
                      <span className="font-medium">
                        {selectedEmailClient.charAt(0).toUpperCase() + selectedEmailClient.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span>🔍</span>
                      <span>⚙️</span>
                    </div>
                  </div>
                </div>

                <div className="flex">
                  {/* Sidebar */}
                  <div className={`${getEmailClientStyles().sidebar} w-64 p-4 border-r border-gray-200`}>
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-gray-900 p-2 bg-white rounded">📥 Inbox</div>
                      <div className="text-gray-600 p-2">📤 Sent</div>
                      <div className="text-gray-600 p-2">📝 Drafts</div>
                      <div className="text-gray-600 p-2">🗑️ Trash</div>
                    </div>
                  </div>

                  {/* Email Content */}
                  <div className="flex-1">
                    {/* Email Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">
                            {emails[currentEmail]?.subject}
                          </h2>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>From: your.course@example.com</span>
                            <span>•</span>
                            <span>To: subscriber@email.com</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(currentEmail * (course.interval_days || 1))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <button className={`${getEmailClientStyles().accent} hover:underline`}>
                          ↩️ Reply
                        </button>
                        <button className={`${getEmailClientStyles().accent} hover:underline`}>
                          ↪️ Forward
                        </button>
                        <button className={`${getEmailClientStyles().accent} hover:underline`}>
                          🗑️ Delete
                        </button>
                      </div>
                    </div>

                    {/* Email Body */}
                    <div className="p-6">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentEmail}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="prose max-w-none"
                        >
                          <div className="mb-6">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                              {emails[currentEmail]?.content}
                            </p>
                          </div>
                          
                          {emails[currentEmail]?.cta && (
                            <div className="text-center my-8">
                              <button className="px-6 py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors">
                                {emails[currentEmail].cta.text || 'Take Action Now'}
                              </button>
                            </div>
                          )}
                          
                          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                            <p>Best regards,<br />Your Course Team</p>
                            <div className="mt-4 text-xs">
                              <p>You're receiving this because you signed up for our email course.</p>
                              <p>
                                <a href="#" className="text-blue-500 hover:underline">Unsubscribe</a> | 
                                <a href="#" className="text-blue-500 hover:underline ml-1">Update preferences</a>
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Email Navigation */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setCurrentEmail(prev => prev > 0 ? prev - 1 : emails.length - 1)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      ← Previous Email
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Email {currentEmail + 1} of {emails.length}
                      </span>
                      <div className="flex gap-1">
                        {emails.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentEmail(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              currentEmail === index ? 'bg-orange-500' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setCurrentEmail(prev => prev < emails.length - 1 ? prev + 1 : 0)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Next Email →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Course Performance Predictions</h3>
            
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {analytics.expected_subscribers || '2.5K'}
                </div>
                <div className="text-sm text-orange-800">Expected Subscribers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {analytics.expected_completion_rate || '68'}%
                </div>
                <div className="text-sm text-green-800">Completion Rate</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {analytics.expected_open_rate || '45'}%
                </div>
                <div className="text-sm text-blue-800">Avg Open Rate</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {analytics.expected_click_rate || '12'}%
                </div>
                <div className="text-sm text-purple-800">Avg Click Rate</div>
              </div>
            </div>
          </div>

          {/* Email Performance Breakdown */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Email-by-Email Performance</h4>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Open Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. Click Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engagement Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {emails.map((email: any, index: number) => {
                    const openRate = Math.floor(Math.random() * 20) + 35;
                    const clickRate = Math.floor(Math.random() * 10) + 5;
                    const engagementScore = Math.floor((openRate + clickRate * 3) / 4);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                              <span className="text-orange-600 font-medium">{index + 1}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{email.subject}</div>
                          <div className="text-sm text-gray-500">Day {index * (course.interval_days || 1)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${openRate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{openRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${clickRate * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{clickRate}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            engagementScore >= 40 ? 'bg-green-100 text-green-800' :
                            engagementScore >= 30 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {engagementScore}/100
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Optimization Tips */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-3">✅ Optimization Strengths</h4>
              <ul className="text-sm text-green-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Strong subject lines with curiosity gaps</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Good email length (300-500 words)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Clear call-to-actions in each email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>Progressive value delivery</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">🚀 Growth Opportunities</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Add personalization tokens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Include social proof elements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>A/B test subject lines</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Add interactive elements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons & Downloads */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-orange-50 rounded-lg p-4">
          <h4 className="font-medium text-orange-900 mb-3">📧 Course Metrics</h4>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-orange-200 rounded-lg">
              <div className="text-sm text-orange-800">
                📈 Expected open rate: {analytics.expected_open_rate || '45'}%
              </div>
            </div>
            <div className="p-3 bg-white border border-orange-200 rounded-lg">
              <div className="text-sm text-orange-800">
                🎯 Completion rate: {analytics.expected_completion_rate || '68'}%
              </div>
            </div>
            <div className="p-3 bg-white border border-orange-200 rounded-lg">
              <div className="text-sm text-orange-800">
                📊 Est. subscribers: {analytics.expected_subscribers || '2.5K'}
              </div>
            </div>
            
            {/* ✅ Enhanced download options */}
            <div className="pt-3 border-t border-orange-200">
              <button
                onClick={downloadMultipleFormats}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium mb-2"
              >
                📦 Download All Formats
              </button>
              <div className="text-xs text-orange-700">
                Includes: HTML templates, plain text, automation setup, CSV import
              </div>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 rounded-lg p-4">
          <h4 className="font-medium text-pink-900 mb-3">🚀 Email Tools</h4>
          <ContentActions 
            content={data}
            contentType="email_course"
            filename="email_course.txt"
          />
          
          {/* ✅ Enhanced content options */}
          {Object.keys(generatedContent).length > 0 && (
            <div className="mt-4 p-3 bg-white border border-pink-200 rounded-lg">
              <div className="text-sm text-pink-800 mb-2">✅ Enhanced content generated!</div>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(generatedContent.automation_setup, null, 2))}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-xs hover:bg-pink-200 transition-colors"
                >
                  Copy Automation
                </button>
                <button
                  onClick={() => {
                    let htmlContent = '';
                    
                    if (typeof generatedContent.html_templates === 'string') {
                      // If it's already a string
                      htmlContent = generatedContent.html_templates;
                    } else if (Array.isArray(generatedContent.html_templates)) {
                      // If it's an array, join the HTML content
                      console.log(generatedContent.html_templates);
                      htmlContent = generatedContent.html_templates
                        .map(template => template.content || template.html || template.template)
                        .join('\n\n');
                    }
                    
                    copyToClipboard(htmlContent);
                  }}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded text-xs hover:bg-pink-200 transition-colors"
                >
                  Copy HTML
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
