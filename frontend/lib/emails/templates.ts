export const emailTemplates = {
  welcomeUser: (userName: string, baseUrl: string) => ({
    subject: "Welcome to CastLumen — Let's create amazing content! 🎉",
    html: `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${baseUrl}/castlumen-wordmark.svg" alt="CastLumen" style="height: 32px; width: auto;" />
      </div>
      
      <!-- Main Content -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #9CEE69, #83E14E); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 12px 0;">Welcome to CastLumen, ${userName}!</h1>
        <p style="color: #64748b; font-size: 18px; margin: 0;">Your account has been created successfully. Let's start generating amazing podcast content!</p>
      </div>
      <!-- What's Next */}
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">Here's what you can do with your free account:</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Generate up to 30 minutes of content per month</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Create show notes, summaries, and timestamps</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Generate social media snippets</span>
          </div>
        </div>
      </div>
      <!-- Getting Started */}
      <div style="background: #eff6ff; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 2px solid #3b82f6;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">🚀 Quick Start Guide</h3>
        <div style="space-y: 8px;">
          <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;"><strong>Step 1:</strong> Upload your podcast audio file or provide a YouTube URL</p>
          <p style="color: #475569; font-size: 14px; margin: 0 0 8px 0;"><strong>Step 2:</strong> Choose what type of content you want to generate</p>
          <p style="color: #475569; font-size: 14px; margin: 0;"><strong>Step 3:</strong> Let our AI work its magic and download your content!</p>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${baseUrl}/generate" 
           style="display: inline-block; background: linear-gradient(135deg, #9CEE69, #83E14E); color: #1e293b; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(156, 238, 105, 0.3);">
          Start Creating Content →
        </a>
      </div>

      <!-- Upgrade Prompt -->
      <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <h4 style="color: #92400e; font-size: 16px; font-weight: 700; margin: 0 0 8px 0;">Need more? Upgrade anytime!</h4>
        <p style="color: #b45309; font-size: 14px; margin: 0 0 12px 0;">Get unlimited content generation, team collaboration, and premium features</p>
        <a href="${baseUrl}/#pricing" style="color: #92400e; text-decoration: underline; font-weight: 600;">View Plans →</a>
      </div>
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px 0;">
          Questions? We're here to help! Reply to this email or check our help center.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          You're receiving this email because you created a CastLumen account.
        </p>
      </div>
    </div>
    `
  }),

  passwordReset: (userName: string, resetUrl: string, baseUrl: string) => ({
    subject: "Reset your CastLumen password 🔑",
    html: `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${baseUrl}/castlumen-wordmark.svg" alt="CastLumen" style="height: 32px; width: auto;" />
      </div>
      
      <!-- Main Content -->
      <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
        </div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 12px 0;">Password Reset Request</h1>
        <p style="color: #64748b; font-size: 18px; margin: 0;">Hi ${userName}, we received a request to reset your password</p>
      </div>
      
      <!-- Instructions -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">Reset your password</h3>
        <p style="color: #475569; font-size: 16px; margin: 0 0 16px 0; text-align: center;">
          Click the button below to reset your password. This link will expire in 1 hour for security.
        </p>
        <div style="text-align: center;">
          <a href="${resetUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
            Reset My Password
          </a>
        </div>
        <!-- Security Notice -->
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
        <div style="display: flex; align-items: start; gap: 12px;">
          <div style="flex-shrink: 0;">
            <svg style="width: 20px; height: 20px; color: #f59e0b;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.178 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <div>
            <h4 style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Security Notice</h4>
            <p style="color: #b45309; font-size: 13px; margin: 0;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px 0;">
          This password reset link will expire in 1 hour for your security.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          If you're having trouble, contact our support team for assistance.
        </p>
      </div>
    </div>
    `
  }),

  welcomeSubscription: (baseUrl: string) => ({
    subject: "Welcome to CastLumen — your subscription is active 🎉",
    html: `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${baseUrl}/castlumen-wordmark.svg" alt="CastLumen" style="height: 32px; width: auto;" />
      </div>
      
      <!-- Main Content -->
      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #9CEE69, #83E14E); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 12px 0;">Welcome to CastLumen!</h1>
        <p style="color: #64748b; font-size: 18px; margin: 0;">Your subscription is now active and ready to use</p>
      </div>
      
      <!-- Features -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">What you can do now:</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Generate AI-powered show notes from any podcast</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Create timestamps and social media snippets</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Export to multiple formats and platforms</span>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${baseUrl}/generate" 
           style="display: inline-block; background: linear-gradient(135deg, #9CEE69, #83E14E); color: #1e293b; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(156, 238, 105, 0.3);">
          Start Creating Content →
        </a>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px 0;">
          Need help? Reply to this email or visit our support center.
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Manage your billing anytime from your profile settings.
        </p>
      </div>
    </div>
    `
  }),

  paymentReceived: (amount: string, currency: string) => ({
    subject: "Payment received ✔ — CastLumen",
    html: `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/castlumen-wordmark.svg" alt="CastLumen" style="height: 32px; width: auto;" />
      </div>
      
      <!-- Payment Confirmation -->
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 style="color: #1e293b; font-size: 24px; font-weight: 800; margin: 0 0 12px 0;">Payment Received</h1>
        <p style="color: #64748b; font-size: 18px; margin: 0;">
          We've successfully processed your payment of <strong>${amount} ${currency.toUpperCase()}</strong>
        </p>
      </div>
      
      <!-- Thank You Message -->
      <div style="text-align: center; padding: 24px;">
        <p style="color: #475569; font-size: 16px; margin: 0 0 16px 0;">
          Thank you for being a valued CastLumen member! Your continued support helps us improve our AI-powered content creation tools.
        </p>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          Questions about your billing? Feel free to reach out to our support team.
        </p>
      </div>
    </div>
    `
  }),

  teamInvitation: (inviterName: string, teamName: string, teamUrl: string, inviterEmail: string) => ({
    subject: `You've been invited to join "${teamName}" on CastLumen 🎉`,
    html: `
    <div style="font-family: Inter, system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${process.env.NEXT_PUBLIC_BASE_URL || "https://castlumen.com"}/castlumen-wordmark.svg" alt="CastLumen" style="height: 32px; width: auto;" />
      </div>
      
      <!-- Main Content -->
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 16px; padding: 32px; text-align: center; margin-bottom: 24px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #9CEE69, #83E14E); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 800; margin: 0 0 12px 0;">You're Invited!</h1>
        <p style="color: #64748b; font-size: 18px; margin: 0 0 24px 0;">
          <strong>${inviterName}</strong> has invited you to join the team
        </p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 16px 0; border: 2px solid #9CEE69;">
          <h2 style="color: #1e293b; font-size: 24px; font-weight: 700; margin: 0 0 8px 0;">"${teamName}"</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Team workspace on CastLumen</p>
        </div>
      </div>
      
      <!-- Features -->
      <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">What you can do as a team member:</h3>
        <div style="display: grid; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Generate AI-powered podcast content together</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Share templates and collaborate on content</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 24px; height: 24px; background: #9CEE69; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #1e293b; font-weight: bold; font-size: 12px;">✓</span>
            </div>
            <span style="color: #475569; font-size: 14px;">Access shared workspace and resources</span>
          </div>
        </div>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${teamUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #9CEE69, #83E14E); color: #1e293b; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(156, 238, 105, 0.3);">
          Join Team Workspace →
        </a>
      </div>
      
      <!-- Footer -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; text-align: center;">
        <p style="color: #94a3b8; font-size: 14px; margin: 0 0 12px 0;">
          This invitation was sent by ${inviterName} (${inviterEmail})
        </p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
    </div>
    `
  })
};
