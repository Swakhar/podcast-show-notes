import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface GuestResearchFormProps {
  onSubmit: (data: GuestResearchData) => Promise<void>;
  isSubmitting: boolean;
  templates: any[];
  me: any;
}

interface GuestResearchData {
  guestName: string;
  guestInfo: string;
  additionalContext: string;
  showFocus: string;
  features: string[];
  language: string;
  templateIds: string[];
}

export default function GuestResearchForm({ onSubmit, isSubmitting, templates, me }: GuestResearchFormProps) {
  const [formData, setFormData] = useState<GuestResearchData>({
    guestName: '',
    guestInfo: '',
    additionalContext: '',
    showFocus: '',
    features: ['guest_research', 'interview_questions', 'conversation_starters'],
    language: 'en',
    templateIds: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateFeature = (feature: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      features: enabled 
        ? [...prev.features, feature]
        : prev.features.filter(f => f !== feature)
    }));
  };

  const isFree = me?.plan === "FREE" && !me?.isTeamMember;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-900 mb-1">🔍 Guest Research Assistant</h2>
          <p className="text-sm text-gray-600">Get AI-powered insights and interview prep for your guests</p>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Guest Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Guest Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., John Doe, CEO of TechCorp"
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69] transition-colors"
            />
          </div>

          {/* Guest Information */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Guest Background & Information *
            </label>
            <textarea
              required
              rows={6}
              placeholder="Paste LinkedIn profile, bio, website content, recent interviews, articles, or any information about your guest..."
              value={formData.guestInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, guestInfo: e.target.value }))}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69] transition-colors"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Include their LinkedIn, recent work, articles, or social media to get better research
            </p>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Additional Context <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Any specific topics you want to explore, mutual connections, recent news about them..."
              value={formData.additionalContext}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalContext: e.target.value }))}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69] transition-colors"
            />
          </div>

          {/* Show Focus */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Show Focus/Theme <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Entrepreneurship, Tech Innovation, Marketing Strategies..."
              value={formData.showFocus}
              onChange={(e) => setFormData(prev => ({ ...prev, showFocus: e.target.value }))}
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69] transition-colors"
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Output Language</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#9CEE69] focus:border-[#9CEE69]"
              value={formData.language}
              onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
              disabled={isSubmitting}
            >
              <option value="en">🇺🇸 English</option>
              <option value="de">🇩🇪 Deutsch (German)</option>
            </select>
          </div>

          {/* Feature Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Research Components</label>
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "guest_research", label: "Complete Research Report", desc: "Executive summary, expertise, achievements", icon: "📊", free: true },
                { key: "interview_questions", label: "Interview Questions", desc: "15 targeted questions for your interview", icon: "❓", free: true },
                { key: "conversation_starters", label: "Conversation Starters", desc: "Ice breakers and natural transitions", icon: "💬", free: false },
              ].map(({ key, label, desc, icon, free }) => {
                const disabled = !free && isFree;
                const isSelected = formData.features.includes(key);
                return (
                  <label
                    key={key}
                    className={`relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      disabled
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : isSelected
                        ? 'border-[#9CEE69] bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected && (free || !isFree)}
                      onChange={(e) => !disabled && updateFeature(key, e.target.checked)}
                      disabled={disabled || isSubmitting}
                      className="mt-1 w-4 h-4 text-[#9CEE69] border-gray-300 rounded focus:ring-[#9CEE69]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="font-medium text-gray-900">{label}</span>
                        {!free && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            Pro
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.guestName || !formData.guestInfo}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Researching Guest...
                </span>
              ) : (
                "🔍 Start Guest Research"
              )}
            </button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Research typically takes 30-60 seconds
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
