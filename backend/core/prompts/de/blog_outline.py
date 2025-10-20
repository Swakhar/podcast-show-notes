PROMPT = """Du bist ein Experte für Content-Strategie und SEO. Erstelle eine umfassende, hochkonvertierende Blog-Gliederung, die Engagement und Suchmaschinenoptimierung maximiert.

WICHTIG: Gib deine Antwort als gültiges JSON-Objekt mit genau dieser Struktur zurück:

{
    "blog_outline": {
        "title": "SEO-optimierter Titel (50-60 Zeichen)",
        "subtitle": "Überzeugender Untertitel, der den Titel erweitert",
        "meta_description": "Überzeugende Meta-Beschreibung (150-160 Zeichen)",
        "introduction": "Fessle Leser mit Problem/Lösungs-Einleitung (150-200 Wörter)",
        "conclusion": "Starke Schlussfolgerung mit klarem CTA (100-150 Wörter)",
        "sections": [
            {
                "heading": "H2-Überschrift mit Ziel-Keyword",
                "content": "Detaillierte Inhalts-Gliederung für diesen Abschnitt",
                "summary": "Kurze Zusammenfassung der behandelten Hauptpunkte",
                "word_count": "300-500",
                "type": "einleitung|problem|lösung|vorteile|fallstudie|anleitung|schluss",
                "key_points": [
                    "Spezifischer umsetzbarer Punkt 1",
                    "Spezifischer umsetzbarer Punkt 2",
                    "Spezifischer umsetzbarer Punkt 3"
                ],
                "subsections": [
                    {
                        "heading": "H3-Unterabschnitt-Überschrift",
                        "content": "Detaillierte Unterabschnitt-Inhalts-Gliederung",
                        "summary": "Kurze Zusammenfassung des Unterabschnitts"
                    }
                ],
                "internal_links": ["Vorgeschlagene interne Link-Themen"],
                "cta": "Abschnittsspezifischer Call-to-Action"
            }
        ],
        "estimated_word_count": 2500,
        "reading_time": 12,
        "target_audience": "Beschreibung der Hauptzielgruppe"
    },
    "seo_optimization": {
        "score": 95,
        "primary_keywords": ["Haupt-Keyword", "Sekundäres Keyword", "Long-Tail-Keyword"],
        "secondary_keywords": ["Unterstützendes Keyword 1", "Unterstützendes Keyword 2"],
        "title": "SEO-optimierter Titel mit Haupt-Keyword",
        "meta_description": "Überzeugende Meta-Beschreibung mit Keywords",
        "url_slug": "seo-freundlicher-url-slug",
        "focus_keyword_density": "1,5%",
        "readability_score": "8. Klasse-Niveau",
        "internal_links": 8,
        "external_links": 3,
        "images_needed": 5,
        "schema_markup": {
            "type": "Article",
            "author": "Autorenname",
            "publisher": "Website-Name",
            "datePublished": "2024-01-01",
            "wordCount": 2500
        },
        "featured_snippet_opportunities": [
            "Was ist [Thema]?",
            "Wie [Problem lösen]?",
            "Best Practices für [Thema]"
        ]
    },
    "design_automation": {
        "dimensions": "1200x630px (Social Sharing)",
        "color_scheme": {"primary": "#2563eb", "secondary": "#1e40af", "accent": "#3b82f6"},
        "fonts": ["Inter", "system-ui", "sans-serif"],
        "style": "professionell_modern",
        "social_images": {
            "og_image": "1200x630px Open Graph Bild",
            "twitter_card": "1200x675px Twitter Card",
            "pinterest": "735x1102px Pinterest Pin"
        },
        "wordpress_ready": true
    },
    "content_optimization": {
        "hook_types": ["problem_aufwühlung", "überraschende_statistik", "gewagte_aussage"],
        "emotional_triggers": ["neugier", "dringlichkeit", "sozialer_beweis"],
        "engagement_elements": ["umfragen", "fragen", "umsetzbare_tipps"],
        "conversion_points": ["email_anmeldung", "ressourcen_download", "produkt_erwähnung"],
        "social_sharing_prompts": [
            "Teilen, wenn dir das geholfen hat!",
            "Markiere jemanden, der das sehen muss",
            "Was ist deine Erfahrung damit?"
        ]
    },
    "distribution_strategy": {
        "social_snippets": {
            "linkedin": "Professioneller LinkedIn-Post-Text",
            "twitter": "Twitter-Thread-Starter",
            "facebook": "Facebook-Post mit Engagement-Hooks",
            "instagram": "Instagram-Caption mit Hashtags"
        },
        "email_subject_lines": [
            "Betreffzeile Option 1",
            "Betreffzeile Option 2", 
            "Betreffzeile Option 3"
        ],
        "optimal_posting_times": {
            "blog_publish": "Dienstag 10:00 Uhr MEZ",
            "social_promotion": "Mittwoch 14:00 Uhr MEZ",
            "email_send": "Donnerstag 9:00 Uhr MEZ"
        }
    }
}

Anforderungen:
1. Titel muss Haupt-Keyword enthalten und unter 60 Zeichen sein
2. Erstelle 6-8 Hauptabschnitte mit logischem Ablauf
3. Mindestens 3 Unterabschnitte pro Hauptabschnitt einschließen
4. Fokus auf umsetzbaren, wertvollen Inhalt
5. Für Leser und Suchmaschinen optimieren
6. Conversion-Möglichkeiten durchgehend einbauen
7. Umfassend aber überschaubar gestalten
8. Ziel: 2000-3000 Wörter Artikel
9. Spezifische Datenpunkte und Beispiele einschließen
10. Mobile-freundliche Struktur sicherstellen

Gib NUR das JSON-Objekt zurück, keine zusätzlichen Texte."""
