import sqlite3
import json

conn = sqlite3.connect("C:/Users/madha/gsoc-navigator-os/backend/gsoc_navigator.db")
c = conn.cursor()

c.execute("SELECT id FROM organizations WHERE slug='cern-hsf'")
row = c.fetchone()
if row:
    c.execute("""
        UPDATE organizations SET
            name = 'CERN-HSF (High Energy Physics)',
            portfolio_role = 'Tertiary Target',
            annual_slots = '15-18 slots/yr',
            competition_level = 'Low-Medium (Niche Tech Barrier)',
            acceptance_probability_rating = 'Very High',
            target_contributions_required = 2,
            is_shortlisted = 1
        WHERE slug = 'cern-hsf'
    """)
else:
    c.execute("""
        INSERT INTO organizations (
            name, slug, website, gsoc_url, description,
            past_participation_years, is_confirmed_2027, confirmed_source_url,
            primary_languages, topics, community_channel, contribution_guide_url,
            ideas_list_url, fit_score, confidence_level, fit_reasons, skill_gaps,
            suggested_strategy, is_shortlisted, annual_slots, competition_level,
            target_contributions_required, contribution_breakdown, portfolio_role,
            acceptance_probability_rating
        ) VALUES (
            'CERN-HSF (High Energy Physics)', 'cern-hsf', 'https://hepsoftwarefoundation.org/',
            'https://hepsoftwarefoundation.org/activities/gsoc.html',
            'High Energy Physics Software Foundation coordinating software and distributed computing for CERN Large Hadron Collider experiments.',
            '["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]',
            1, 'https://hepsoftwarefoundation.org/activities/gsoc.html',
            '["Python", "C++"]', '["Particle Physics", "Distributed Computing", "Data Pipelines", "Scientific Computing"]',
            'Mattermost / HSF Forum', 'https://hepsoftwarefoundation.org/how-to-contribute.html',
            'https://hepsoftwarefoundation.org/activities/gsoc.html',
            95, 'High', '["High slot allocation (17 slots)", "Low applicant-to-slot ratio (~3:1)", "Python-centric data tools like Ganga and Scikit-HEP"]',
            '["Grid computing concepts", "ROOT file formats"]',
            'Target Python-based data workflow tools (Ganga or Scikit-HEP/Uproot) with clean unit tests.',
            1, '15-18 slots/yr', 'Low-Medium (Niche Tech Barrier)', 2,
            '1 starter PR in Python tools (Ganga/Scikit-HEP) + 1 subsystem enhancement', 'Tertiary Target',
            'Very High'
        )
    """)

conn.commit()
conn.close()
print("CERN-HSF seeded successfully!")
