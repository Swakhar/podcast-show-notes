PROMPT = """Du bist ein Experte für E-Mail-Marketing-Strategien und Kurserstellung. Erstelle einen umfassenden 7-Tage-E-Mail-Kurs, der Abonnenten in engagierte Zielgruppen-Mitglieder und potenzielle Kunden verwandelt.

WICHTIG: Gib deine Antwort als gültiges JSON-Objekt mit genau dieser Struktur zurück:

{
    "email_course": {
        "title": "Kurstitel, der Transformation verspricht",
        "description": "Kurze Beschreibung, was Abonnenten lernen werden",
        "target_audience": "Spezifische Zielgruppen-Beschreibung",
        "course_duration": 7,
        "total_lessons": 7,
        "learning_objectives": [
            "Spezifisches Ergebnis 1",
            "Spezifisches Ergebnis 2", 
            "Spezifisches Ergebnis 3"
        ],
        "emails": [
            {
                "day": 1,
                "email_type": "willkommen",
                "subject": "Willkommen! Deine [Kurs-Thema] Reise beginnt jetzt 🚀",
                "preview_text": "Was dich erwartet + deine erste Lektion...",
                "content": "Willkommen zum Kurs! Das lernst du in den nächsten 7 Tagen...\n\nLektion 1: Grundlagen-Konzepte\n\nDein Aktionsschritt für heute: [spezifische Aufgabe]\n\nMorgen tauchen wir ein in [nächstes Thema].",
                "key_points": [
                    "Erwartungen für den Kurs setzen",
                    "Sofortigen Wert liefern",
                    "Aufregung für das Kommende aufbauen"
                ],
                "cta": {
                    "text": "Hol dir deine kostenlose Starter-Vorlage",
                    "url": "[RESOURCE_LINK]",
                    "type": "ressourcen_download"
                },
                "estimated_read_time": "3 Minuten",
                "word_count": 400,
                "personalization_tokens": ["[VORNAME]", "[KURS_THEMA]"]
            },
            {
                "day": 2,
                "email_type": "grundlagen",
                "subject": "Der #1 Fehler, der dich zurückhält",
                "preview_text": "Die meisten machen das falsch (so behebst du es)",
                "content": "Gestern haben wir die Grundlagen behandelt. Heute packen wir das größte Hindernis an...\n\nDer Fehler: [spezifisches Problem]\nWarum es passiert: [Grundursache]\nWie du es behebst: [Lösungsschritte]\n\nAktionsschritt: [spezifische Aufgabe]",
                "key_points": [
                    "Häufigen Fehler identifizieren",
                    "Erklären warum es passiert",
                    "Klare Lösung bereitstellen"
                ],
                "cta": {
                    "text": "Lade die Reparatur-Checkliste herunter",
                    "url": "[CHECKLIST_LINK]",
                    "type": "ressourcen_download"
                },
                "estimated_read_time": "4 Minuten",
                "word_count": 500,
                "personalization_tokens": ["[VORNAME]", "[SPEZIFISCHE_HERAUSFORDERUNG]"]
            },
            {
                "day": 3,
                "email_type": "vertiefung",
                "subject": "Das Framework, das alles verändert hat",
                "preview_text": "Schritt-für-Schritt System von Top-Performern verwendet",
                "content": "Bereit für das Gute? Hier ist das exakte Framework, das [Ergebnis] transformiert...\n\nSchritt 1: [Aktion]\nSchritt 2: [Aktion]\nSchritt 3: [Aktion]\n\nEchtes Beispiel: [Fallstudie-Ausschnitt]\n\nDu bist dran: [spezifische Aufgabe]",
                "key_points": [
                    "Bewährtes Framework vorstellen",
                    "In umsetzbare Schritte aufteilen",
                    "Echtes Beispiel zeigen"
                ],
                "cta": {
                    "text": "Hol dir die komplette Framework-Vorlage",
                    "url": "[FRAMEWORK_LINK]",
                    "type": "ressourcen_download"
                },
                "estimated_read_time": "5 Minuten",
                "word_count": 600,
                "personalization_tokens": ["[VORNAME]", "[ERGEBNIS]", "[BRANCHE]"]
            },
            {
                "day": 4,
                "email_type": "fallstudie",
                "subject": "Wie [Name] in 30 Tagen von Null zum Helden wurde",
                "preview_text": "Echte Ergebnisse + die exakten Schritte die sie nahmen",
                "content": "Lerne [Name] kennen, der genau wie du mit [Problem] kämpfte...\n\nIhre Situation: [Ausgangszustand]\nWas sie taten: [unternommene Aktionen]\nDie Ergebnisse: [spezifische Ergebnisse]\n\nDie wichtigste Erkenntnis: [Haupterkentnis]\n\nWie du das anwenden kannst: [umsetzbare Schritte]",
                "key_points": [
                    "Überzeugende Erfolgsgeschichte teilen",
                    "Transformationsreise zeigen",
                    "Umsetzbare Erkenntnisse extrahieren"
                ],
                "cta": {
                    "text": "Siehe mehr Erfolgsgeschichten",
                    "url": "[TESTIMONIALS_LINK]",
                    "type": "sozialer_beweis"
                },
                "estimated_read_time": "4 Minuten",
                "word_count": 550,
                "personalization_tokens": ["[VORNAME]", "[ÄHNLICHE_SITUATION]"]
            },
            {
                "day": 5,
                "email_type": "fortgeschrittene_taktiken",
                "subject": "Fortgeschrittene Taktiken (nur für ernsthafte Schüler)",
                "preview_text": "Bereit aufzusteigen? Das machen Profis anders",
                "content": "Du hast die Grundlagen gemeistert. Zeit für fortgeschrittene Strategien...\n\nFortgeschrittene Taktik #1: [Strategie]\nWarum es funktioniert: [Erklärung]\nWie zu implementieren: [Schritte]\n\nFortgeschrittene Taktik #2: [Strategie]\nProfi-Tipp: [Insider-Einblick]\n\nWarnung: [häufige Falle zu vermeiden]",
                "key_points": [
                    "Engagement mit fortgeschrittenem Inhalt belohnen",
                    "Ernsthafte Schüler von gelegentlichen Browsern trennen",
                    "Insider-Level Einblicke bieten"
                ],
                "cta": {
                    "text": "Tritt unserer fortgeschrittenen Community bei",
                    "url": "[COMMUNITY_LINK]",
                    "type": "community_beitritt"
                },
                "estimated_read_time": "6 Minuten",
                "word_count": 650,
                "personalization_tokens": ["[VORNAME]", "[FÄHIGKEITSLEVEL]"]
            },
            {
                "day": 6,
                "email_type": "problemlösung",
                "subject": "Steckst du fest? So durchbrichst du die Barriere",
                "preview_text": "Häufige Hindernisse + wie du sie überwindest",
                "content": "Stößt du auf Hindernisse? Das ist völlig normal. Hier sind die häufigsten Herausforderungen und Lösungen...\n\nHerausforderung #1: [Hindernis]\nLösung: [Behebung]\n\nHerausforderung #2: [Hindernis]\nLösung: [Behebung]\n\nHerausforderung #3: [Hindernis]\nLösung: [Behebung]\n\nDenk daran: [Ermutigung]",
                "key_points": [
                    "Häufige Implementierungsherausforderungen ansprechen",
                    "Spezifische Lösungen bereitstellen",
                    "Durchhaltevermögen ermutigen"
                ],
                "cta": {
                    "text": "Hol dir persönliche Hilfe (kostenlos)",
                    "url": "[SUPPORT_LINK]",
                    "type": "support_angebot"
                },
                "estimated_read_time": "5 Minuten",
                "word_count": 575,
                "personalization_tokens": ["[VORNAME]", "[HÄUFIGE_HERAUSFORDERUNG]"]
            },
            {
                "day": 7,
                "email_type": "abschluss",
                "subject": "🎓 Herzlichen Glückwunsch Absolvent! Was kommt als nächstes?",
                "preview_text": "Du hast es geschafft! Plus deine nächsten Schritte...",
                "content": "Herzlichen Glückwunsch! Du hast den 7-Tage-Kurs abgeschlossen. Das hast du erreicht...\n\n✅ [Errungenschaft 1]\n✅ [Errungenschaft 2]\n✅ [Errungenschaft 3]\n\nWas kommt als nächstes?\n1. [Nächster Schritt]\n2. [Nächster Schritt]\n3. [Nächster Schritt]\n\nSpezialangebot für Absolventen: [exklusives Angebot]",
                "key_points": [
                    "Abschluss feiern",
                    "Errungenschaften zusammenfassen",
                    "Nächste Level-Möglichkeit präsentieren"
                ],
                "cta": {
                    "text": "Setze deine Reise fort (Spezialangebot)",
                    "url": "[OFFER_LINK]",
                    "type": "produkt_angebot"
                },
                "estimated_read_time": "4 Minuten",
                "word_count": 500,
                "personalization_tokens": ["[VORNAME]", "[GRÖSSTER_GEWINN]", "[NÄCHSTES_ZIEL]"]
            }
        ],
        "automation_setup": {
            "trigger": "Lead-Magnet-Anmeldung",
            "delay_between_emails": "24 Stunden",
            "send_time": "9:00 Uhr Abonnenten-Zeitzone",
            "tags_to_add": ["email_kurs_abonnent", "interessierter_prospect"],
            "segments": ["kurs_abschließer", "nicht_öffner", "hohe_interaktion"]
        },
        "bonus_content": {
            "welcome_bonus": "Starter-Vorlage/Checkliste",
            "mid_course_bonus": "Framework-Vorlage",
            "completion_bonus": "Erweiterte Anleitung oder Beratungsgespräch",
            "resource_library": ["Vorlagen", "Checklisten", "Video-Tutorials", "Fallstudien"]
        }
    },
    "design_specs": {
        "email_template": "sauber_professionell",
        "color_scheme": {"primary": "#2563eb", "secondary": "#1e40af", "accent": "#3b82f6"},
        "fonts": ["Inter", "system-ui", "sans-serif"],
        "mobile_optimized": true,
        "personalization_level": "hoch",
        "cta_style": "button",
        "header_image": true,
        "social_proof_placement": "fußzeile"
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
            "Emoji vs. kein Emoji testen",
            "Frage vs. Aussage testen",
            "Dringlichkeit vs. Neugier testen"
        ],
        "content_optimization": [
            "E-Mails mit Aufzählungszeichen überschaubar halten",
            "Persönliche Geschichten und Beispiele einbeziehen",
            "Jede E-Mail mit klarem nächsten Schritt beenden"
        ],
        "timing_optimization": [
            "Verschiedene Sendezeiten testen",
            "Abonnenten-Zeitzone berücksichtigen",
            "Engagement-Muster überwachen"
        ],
        "personalization_opportunities": [
            "Vorname durchgehend verwenden",
            "Auf vorherige Interaktionen verweisen",
            "Inhalte an Abonnenten-Interessen anpassen"
        ]
    }
}

Anforderungen:
1. Überzeugende Betreffzeilen erstellen, die geöffnet werden
2. Klares Wertversprechen in jeder E-Mail einschließen
3. Logische Progression von grundlegend zu fortgeschritten aufbauen
4. Spezifische Aktionsschritte in jeder E-Mail einschließen
5. Herunterladbare Ressourcen für Engagement bereitstellen
6. Häufige Einwände und Herausforderungen ansprechen
7. Sozialen Beweis und Erfolgsgeschichten einschließen
8. Natürliche Progression zu bezahlten Angeboten schaffen
9. Für mobile E-Mail-Clients optimieren
10. Automatisierung und Segmentierung-Anleitungen einschließen

Gib NUR das JSON-Objekt zurück, keine zusätzlichen Texte."""
