PROMPT = """You are an expert email marketing strategist and course creator. Create a comprehensive 7-day email course that converts subscribers into engaged audience members and potential customers.

IMPORTANT: Return your response as a valid JSON object with this exact structure:

{
    "email_course": {
        "title": "Course title that promises transformation",
        "description": "Brief description of what subscribers will learn",
        "target_audience": "Specific audience description",
        "course_duration": 7,
        "total_lessons": 7,
        "learning_objectives": [
            "Specific outcome 1",
            "Specific outcome 2", 
            "Specific outcome 3"
        ],
        "emails": [
            {
                "day": 1,
                "email_type": "welcome",
                "subject": "Welcome! Your [Course Topic] journey starts now 🚀",
                "preview_text": "What to expect + your first lesson inside...",
                "content": "Welcome to the course! Here's what you'll learn over the next 7 days...\n\nLesson 1: Foundation concepts\n\nYour action step for today: [specific task]\n\nTomorrow we'll dive into [next topic].",
                "key_points": [
                    "Set expectations for the course",
                    "Deliver immediate value",
                    "Build excitement for what's coming"
                ],
                "cta": {
                    "text": "Get Your Free Starter Template",
                    "url": "[RESOURCE_LINK]",
                    "type": "resource_download"
                },
                "estimated_read_time": "3 minutes",
                "word_count": 400,
                "personalization_tokens": ["[FIRST_NAME]", "[COURSE_TOPIC]"]
            },
            {
                "day": 2,
                "email_type": "foundation",
                "subject": "The #1 mistake that's holding you back",
                "preview_text": "Most people get this wrong (here's how to fix it)",
                "content": "Yesterday we covered the basics. Today, let's tackle the biggest obstacle...\n\nThe mistake: [specific problem]\nWhy it happens: [root cause]\nHow to fix it: [solution steps]\n\nAction step: [specific task]",
                "key_points": [
                    "Identify common mistake",
                    "Explain why it happens",
                    "Provide clear solution"
                ],
                "cta": {
                    "text": "Download the Fix-It Checklist",
                    "url": "[CHECKLIST_LINK]",
                    "type": "resource_download"
                },
                "estimated_read_time": "4 minutes",
                "word_count": 500,
                "personalization_tokens": ["[FIRST_NAME]", "[SPECIFIC_CHALLENGE]"]
            },
            {
                "day": 3,
                "email_type": "deep_dive",
                "subject": "The framework that changed everything",
                "preview_text": "Step-by-step system used by top performers",
                "content": "Ready for the good stuff? Here's the exact framework that transforms [outcome]...\n\nStep 1: [action]\nStep 2: [action]\nStep 3: [action]\n\nReal example: [case study snippet]\n\nYour turn: [specific assignment]",
                "key_points": [
                    "Introduce proven framework",
                    "Break down into actionable steps",
                    "Show real-world example"
                ],
                "cta": {
                    "text": "Get the Complete Framework Template",
                    "url": "[FRAMEWORK_LINK]",
                    "type": "resource_download"
                },
                "estimated_read_time": "5 minutes",
                "word_count": 600,
                "personalization_tokens": ["[FIRST_NAME]", "[OUTCOME]", "[INDUSTRY]"]
            },
            {
                "day": 4,
                "email_type": "case_study",
                "subject": "How [Name] went from zero to hero in 30 days",
                "preview_text": "Real results + the exact steps they took",
                "content": "Meet [Name], who was struggling with [problem] just like you...\n\nTheir situation: [before state]\nWhat they did: [actions taken]\nThe results: [specific outcomes]\n\nThe key insight: [main takeaway]\n\nHow you can apply this: [actionable steps]",
                "key_points": [
                    "Share compelling success story",
                    "Show transformation journey",
                    "Extract actionable insights"
                ],
                "cta": {
                    "text": "See More Success Stories",
                    "url": "[TESTIMONIALS_LINK]",
                    "type": "social_proof"
                },
                "estimated_read_time": "4 minutes",
                "word_count": 550,
                "personalization_tokens": ["[FIRST_NAME]", "[SIMILAR_SITUATION]"]
            },
            {
                "day": 5,
                "email_type": "advanced_tactics",
                "subject": "Advanced tactics (for serious students only)",
                "preview_text": "Ready to level up? Here's what pros do differently",
                "content": "You've mastered the basics. Time for advanced strategies...\n\nAdvanced Tactic #1: [strategy]\nWhy it works: [explanation]\nHow to implement: [steps]\n\nAdvanced Tactic #2: [strategy]\nPro tip: [insider insight]\n\nWarning: [common pitfall to avoid]",
                "key_points": [
                    "Reward engagement with advanced content",
                    "Separate serious students from casual browsers",
                    "Provide insider-level insights"
                ],
                "cta": {
                    "text": "Join Our Advanced Community",
                    "url": "[COMMUNITY_LINK]",
                    "type": "community_join"
                },
                "estimated_read_time": "6 minutes",
                "word_count": 650,
                "personalization_tokens": ["[FIRST_NAME]", "[SKILL_LEVEL]"]
            },
            {
                "day": 6,
                "email_type": "troubleshooting",
                "subject": "Stuck? Here's how to breakthrough",
                "preview_text": "Common roadblocks + how to overcome them",
                "content": "Hitting some roadblocks? That's totally normal. Here are the most common challenges and solutions...\n\nChallenge #1: [obstacle]\nSolution: [fix]\n\nChallenge #2: [obstacle]\nSolution: [fix]\n\nChallenge #3: [obstacle]\nSolution: [fix]\n\nRemember: [encouragement]",
                "key_points": [
                    "Address common implementation challenges",
                    "Provide specific solutions",
                    "Encourage persistence"
                ],
                "cta": {
                    "text": "Get Personal Help (Free)",
                    "url": "[SUPPORT_LINK]",
                    "type": "support_offer"
                },
                "estimated_read_time": "5 minutes",
                "word_count": 575,
                "personalization_tokens": ["[FIRST_NAME]", "[COMMON_CHALLENGE]"]
            },
            {
                "day": 7,
                "email_type": "graduation",
                "subject": "🎓 Congratulations graduate! What's next?",
                "preview_text": "You did it! Plus your next steps...",
                "content": "Congratulations! You've completed the 7-day course. Here's what you've accomplished...\n\n✅ [Achievement 1]\n✅ [Achievement 2]\n✅ [Achievement 3]\n\nWhat's next?\n1. [Next step]\n2. [Next step]\n3. [Next step]\n\nSpecial offer for graduates: [exclusive offer]",
                "key_points": [
                    "Celebrate completion",
                    "Summarize achievements",
                    "Present next level opportunity"
                ],
                "cta": {
                    "text": "Continue Your Journey (Special Offer)",
                    "url": "[OFFER_LINK]",
                    "type": "product_offer"
                },
                "estimated_read_time": "4 minutes",
                "word_count": 500,
                "personalization_tokens": ["[FIRST_NAME]", "[BIGGEST_WIN]", "[NEXT_GOAL]"]
            }
        ],
        "automation_setup": {
            "trigger": "Lead magnet signup",
            "delay_between_emails": "24 hours",
            "send_time": "9:00 AM subscriber timezone",
            "tags_to_add": ["email_course_subscriber", "engaged_prospect"],
            "segments": ["course_completers", "non_openers", "high_engagement"]
        },
        "bonus_content": {
            "welcome_bonus": "Starter template/checklist",
            "mid_course_bonus": "Framework template",
            "completion_bonus": "Advanced guide or consultation call",
            "resource_library": ["Templates", "Checklists", "Video tutorials", "Case studies"]
        }
    },
    "design_specs": {
        "email_template": "clean_professional",
        "color_scheme": {"primary": "#2563eb", "secondary": "#1e40af", "accent": "#3b82f6"},
        "fonts": ["Inter", "system-ui", "sans-serif"],
        "mobile_optimized": true,
        "personalization_level": "high",
        "cta_style": "button",
        "header_image": true,
        "social_proof_placement": "footer"
    },
    "email_analytics": {
        "expected_open_rates": {
            "email_1": "45-55%",
            "email_2": "35-45%", 
            "email_3": "30-40%",
            "email_4": "28-38%",
            "email_5": "25-35%",
            "email_6": "23-33%",
            "email_7": "20-30%"
        },
        "expected_click_rates": {
            "email_1": "8-12%",
            "email_2": "6-10%",
            "email_3": "5-9%",
            "email_4": "4-8%",
            "email_5": "4-7%",
            "email_6": "3-6%",
            "email_7": "5-10%"
        },
        "completion_rate": "65-75%",
        "conversion_to_paid": "3-8%"
    },
    "optimization_tips": {
        "subject_line_testing": [
            "Test emoji vs no emoji",
            "Test question vs statement",
            "Test urgency vs curiosity"
        ],
        "content_optimization": [
            "Keep emails scannable with bullet points",
            "Include personal stories and examples",
            "End each email with clear next step"
        ],
        "timing_optimization": [
            "Test different send times",
            "Consider subscriber timezone",
            "Monitor engagement patterns"
        ],
        "personalization_opportunities": [
            "Use first name throughout",
            "Reference previous interactions",
            "Tailor content to subscriber interests"
        ]
    }
}

Requirements:
1. Create compelling subject lines that get opened
2. Include clear value proposition in each email
3. Build logical progression from basic to advanced
4. Include specific action steps in every email
5. Provide downloadable resources for engagement
6. Address common objections and challenges
7. Include social proof and success stories
8. Create natural progression to paid offerings
9. Optimize for mobile email clients
10. Include automation and segmentation guidance

Return ONLY the JSON object with no additional text."""
