import json
from typing import List, Dict, Any
from app.models.organization import Organization
from app.models.user import User

class OrgMatcherService:
    """
    Organization Discovery and Fit Scoring Engine.
    Evaluates applicant technical readiness AND acceptance probability.
    Prioritizes organizations with favorable slot-to-applicant ratios,
    supportive mentorship cultures, and learnable tech stacks.
    """

    CURATED_ORGS = [
        {
            "name": "SymPy",
            "slug": "sympy",
            "website": "https://www.sympy.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/sympy",
            "description": "HIGH PROBABILITY: A Python library for symbolic mathematics with a structured, welcoming contribution process and high mentor engagement.",
            "past_participation_years": json.dumps([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python"]),
            "topics": json.dumps(["Mathematics", "Science", "Algorithms", "Compilers"]),
            "community_channel": "Gitter / Matrix / GitHub Discussions",
            "contribution_guide_url": "https://github.com/sympy/sympy/blob/master/CONTRIBUTING.md",
            "ideas_list_url": "https://github.com/sympy/sympy/wiki/GSoC-Ideas",
            "repositories": [
                {
                    "name": "sympy",
                    "full_name": "sympy/sympy",
                    "html_url": "https://github.com/sympy/sympy",
                    "primary_language": "Python",
                    "stars_count": 12500,
                    "open_issues_count": 3800,
                    "architecture_summary": "Core algebra engine in sympy/core, solvers in sympy/solvers, printing in sympy/printing.",
                    "entry_points": json.dumps(["sympy/__init__.py", "sympy/core/expr.py"]),
                    "build_instructions": "pip install -e . && pytest sympy/core",
                    "test_instructions": "pytest sympy/core/tests/test_basic.py"
                }
            ]
        },
        {
            "name": "MetaBrainz Foundation",
            "slug": "metabrainz",
            "website": "https://metabrainz.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/metabrainz",
            "description": "HIGH PROBABILITY: Open encyclopedia of music and podcast metadata (MusicBrainz, ListenBrainz). Friendly community, 5–8 slots annually, moderate applicant pool.",
            "past_participation_years": json.dumps([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python", "JavaScript", "SQL"]),
            "topics": json.dumps(["Audio", "Databases", "APIs", "Data Science"]),
            "community_channel": "IRC #metabrainz / Matrix",
            "contribution_guide_url": "https://metabrainz.org/doc/Development",
            "ideas_list_url": "https://wiki.musicbrainz.org/Development/Summer_of_Code",
            "repositories": [
                {
                    "name": "listenbrainz-server",
                    "full_name": "metabrainz/listenbrainz-server",
                    "html_url": "https://github.com/metabrainz/listenbrainz-server",
                    "primary_language": "Python",
                    "stars_count": 1200,
                    "open_issues_count": 350,
                    "architecture_summary": "Flask web service, PostgreSQL/TimescaleDB backend, React front-end.",
                    "entry_points": json.dumps(["listenbrainz/webserver/__init__.py", "listenbrainz/db/listen.py"]),
                    "build_instructions": "docker-compose up -d",
                    "test_instructions": "pytest listenbrainz/tests"
                }
            ]
        },
        {
            "name": "INCF (Neuroinformatics)",
            "slug": "incf",
            "website": "https://www.incf.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/incf",
            "description": "HIGH PROBABILITY: Umbrella organization for neuroscience computing. High slot allocation (10-15 slots) across multiple sub-projects with targeted mentor matching.",
            "past_participation_years": json.dumps([2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python", "C++", "Java"]),
            "topics": json.dumps(["Neuroscience", "AI/ML", "Signal Processing", "Data Science"]),
            "community_channel": "Neurostars.org / Matrix",
            "contribution_guide_url": "https://www.incf.org/training-and-education/google-summer-of-code",
            "ideas_list_url": "https://neurostars.org/c/gsoc/",
            "repositories": [
                {
                    "name": "neo",
                    "full_name": "NeuralEnsemble/neo",
                    "html_url": "https://github.com/NeuralEnsemble/neo",
                    "primary_language": "Python",
                    "stars_count": 650,
                    "open_issues_count": 140,
                    "architecture_summary": "Python library for handling electrophysiology data arrays and annotations.",
                    "entry_points": json.dumps(["neo/core/block.py", "neo/io/baseio.py"]),
                    "build_instructions": "pip install -e .[test]",
                    "test_instructions": "pytest neo/test/coretests"
                }
            ]
        },
        {
            "name": "OSGeo (Open Source Geospatial)",
            "slug": "osgeo",
            "website": "https://www.osgeo.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/osgeo",
            "description": "HIGH PROBABILITY: Geospatial foundations including QGIS and GDAL. Low competition from generic applicants due to niche domain; highly supportive mentors.",
            "past_participation_years": json.dumps([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["C++", "Python"]),
            "topics": json.dumps(["Geospatial", "Mapping", "GIS", "C++ Systems"]),
            "community_channel": "Mailing lists / Matrix #qgis",
            "contribution_guide_url": "https://wiki.osgeo.org/wiki/Google_Summer_of_Code",
            "ideas_list_url": "https://wiki.osgeo.org/wiki/Google_Summer_of_Code_2026_Ideas",
            "repositories": [
                {
                    "name": "QGIS",
                    "full_name": "qgis/QGIS",
                    "html_url": "https://github.com/qgis/QGIS",
                    "primary_language": "C++",
                    "stars_count": 10500,
                    "open_issues_count": 2100,
                    "architecture_summary": "C++ Qt desktop application with Python scripting bindings.",
                    "entry_points": json.dumps(["src/app/main.cpp", "src/core/qgsproject.cpp"]),
                    "build_instructions": "cmake -B build && cmake --build build",
                    "test_instructions": "ctest --output-on-failure"
                }
            ]
        },
        {
            "name": "SunPy / OpenAstronomy",
            "slug": "sunpy",
            "website": "https://sunpy.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/openastronomy",
            "description": "HIGH PROBABILITY: Solar physics data analysis in Python. Welcoming scientific community, comprehensive beginner triage meetings, and consistent slot allocation.",
            "past_participation_years": json.dumps([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python"]),
            "topics": json.dumps(["Astronomy", "Solar Physics", "Data Visualization", "NumPy"]),
            "community_channel": "Matrix #sunpy:openastronomy.org",
            "contribution_guide_url": "https://docs.sunpy.org/en/latest/dev_guide/index.html",
            "ideas_list_url": "https://openastronomy.org/gsoc/gsoc2026/",
            "repositories": [
                {
                    "name": "sunpy",
                    "full_name": "sunpy/sunpy",
                    "html_url": "https://github.com/sunpy/sunpy",
                    "primary_language": "Python",
                    "stars_count": 1400,
                    "open_issues_count": 320,
                    "architecture_summary": "NumPy/Astropy-backed map structures and coordinate transformations.",
                    "entry_points": json.dumps(["sunpy/map/mapbase.py", "sunpy/coordinates/frames.py"]),
                    "build_instructions": "pip install -e .[all]",
                    "test_instructions": "pytest sunpy/map"
                }
            ]
        },
        {
            "name": "Sugar Labs",
            "slug": "sugarlabs",
            "website": "https://www.sugarlabs.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/sugar-labs",
            "description": "HIGH PROBABILITY: Educational learning platform for children. One of the most beginner-welcoming organizations with active IRC mentoring and accessible issues.",
            "past_participation_years": json.dumps([2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python", "JavaScript"]),
            "topics": json.dumps(["Education", "Human-Computer Interaction", "Desktop Apps"]),
            "community_channel": "IRC #sugar / Matrix",
            "contribution_guide_url": "https://wiki.sugarlabs.org/go/Development_Team",
            "ideas_list_url": "https://wiki.sugarlabs.org/go/Summer_of_Code/2026",
            "repositories": [
                {
                    "name": "sugar",
                    "full_name": "sugarlabs/sugar",
                    "html_url": "https://github.com/sugarlabs/sugar",
                    "primary_language": "Python",
                    "stars_count": 450,
                    "open_issues_count": 180,
                    "architecture_summary": "GTK/Python desktop UI and activity launcher for educational devices.",
                    "entry_points": json.dumps(["src/jarabe/main.py", "src/jarabe/desktop/meshbox.py"]),
                    "build_instructions": "pip install -e .",
                    "test_instructions": "pytest tests/"
                }
            ]
        },
        {
            "name": "ScummVM",
            "slug": "scummvm",
            "website": "https://www.scummvm.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/scummvm",
            "description": "HIGH PROBABILITY: Cross-platform game engine virtual machine. Clear C++ architecture, dedicated mentors, and very high selection rate for contributors who complete 1-2 PRs.",
            "past_participation_years": json.dumps([2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["C++", "C"]),
            "topics": json.dumps(["Game Engines", "Virtual Machines", "Systems", "Audio"]),
            "community_channel": "Discord / IRC #scummvm",
            "contribution_guide_url": "https://wiki.scummvm.org/index.php/Commit_Guidelines",
            "ideas_list_url": "https://wiki.scummvm.org/index.php/Open_Tasks",
            "repositories": [
                {
                    "name": "scummvm",
                    "full_name": "scummvm/scummvm",
                    "html_url": "https://github.com/scummvm/scummvm",
                    "primary_language": "C++",
                    "stars_count": 7800,
                    "open_issues_count": 680,
                    "architecture_summary": "Virtual machine subsystems in common/, engines in engines/, graphics backends in graphics/.",
                    "entry_points": json.dumps(["base/main.cpp", "engines/engine.cpp"]),
                    "build_instructions": "./configure && make -j",
                    "test_instructions": "./scummvm --version"
                }
            ]
        },
        {
            "name": "Zulip",
            "slug": "zulip",
            "website": "https://zulip.com/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/zulip",
            "description": "Real-time team chat with unique topic threading. Outstanding developer guides and automated dev environments.",
            "past_participation_years": json.dumps([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python", "JavaScript", "TypeScript"]),
            "topics": json.dumps(["Web", "Communications", "Real-time", "APIs"]),
            "community_channel": "https://chat.zulip.org",
            "contribution_guide_url": "https://zulip.readthedocs.io/en/latest/contributing/index.html",
            "ideas_list_url": "https://zulip.readthedocs.io/en/latest/subsystems/gsoc-ideas.html",
            "repositories": [
                {
                    "name": "zulip",
                    "full_name": "zulip/zulip",
                    "html_url": "https://github.com/zulip/zulip",
                    "primary_language": "Python",
                    "stars_count": 21000,
                    "open_issues_count": 1800,
                    "architecture_summary": "Django backend in zerver/, front-end in web/src/, API endpoints in zerver/views.",
                    "entry_points": json.dumps(["zerver/models.py", "web/src/main.ts"]),
                    "build_instructions": "tools/provision && ./tools/run-dev",
                    "test_instructions": "./tools/test-backend zerver/tests/test_messages.py"
                }
            ]
        },
        {
            "name": "Python Software Foundation (PSF)",
            "slug": "psf",
            "website": "https://www.python.org/psf/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/python-software-foundation",
            "description": "Umbrella organization for Python ecosystem projects including CPython, SciPy, Mailman, and core developer tools.",
            "past_participation_years": json.dumps([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["Python", "C"]),
            "topics": json.dumps(["Programming Languages", "Compilers", "Runtime", "Scientific Computing"]),
            "community_channel": "Discuss.python.org / Zulip",
            "contribution_guide_url": "https://devguide.python.org/",
            "ideas_list_url": "https://wiki.python.org/moin/SummerOfCode/Ideas",
            "repositories": [
                {
                    "name": "cpython",
                    "full_name": "python/cpython",
                    "html_url": "https://github.com/python/cpython",
                    "primary_language": "Python",
                    "stars_count": 65000,
                    "open_issues_count": 7200,
                    "architecture_summary": "Interpreter core in Python/ceval.c, Parser in Parser/, standard library in Lib/.",
                    "entry_points": json.dumps(["Python/ceval.c", "Lib/runpy.py"]),
                    "build_instructions": "./configure && make -j",
                    "test_instructions": "./python -m test test_os"
                }
            ]
        },
        {
            "name": "QEMU",
            "slug": "qemu",
            "website": "https://www.qemu.org/",
            "gsoc_url": "https://summerofcode.withgoogle.com/programs/2026/organizations/qemu",
            "description": "Generic machine emulator and virtualizer. Ideal for low-level systems and operating systems enthusiasts.",
            "past_participation_years": json.dumps([2020, 2021, 2022, 2023, 2024, 2025, 2026]),
            "is_confirmed_2027": False,
            "primary_languages": json.dumps(["C", "Python"]),
            "topics": json.dumps(["Operating Systems", "Virtualization", "Systems Programming"]),
            "community_channel": "IRC #qemu / Mailing List",
            "contribution_guide_url": "https://wiki.qemu.org/Contribute/SubmitAPatch",
            "ideas_list_url": "https://wiki.qemu.org/Google_Summer_of_Code_2026",
            "repositories": [
                {
                    "name": "qemu",
                    "full_name": "qemu/qemu",
                    "html_url": "https://github.com/qemu/qemu",
                    "primary_language": "C",
                    "stars_count": 10500,
                    "open_issues_count": 1200,
                    "architecture_summary": "Hardware emulation in hw/, CPU translation in tcg/.",
                    "entry_points": json.dumps(["system/main.c", "include/qemu/osdep.h"]),
                    "build_instructions": "./configure && ninja",
                    "test_instructions": "make check"
                }
            ]
        }
    ]

    def calculate_fit_score(self, org: Dict[str, Any], user: User) -> Dict[str, Any]:
        """
        Calculates selection probability & fit score.
        Considers:
        - Tech stack base (30%)
        - Historical reliability & Slot allocation (25%)
        - Community accessibility and mentorship (25%)
        - Favorable slot-to-applicant competition ratio (20%)
        """
        user_skills = [s.name.lower() for s in user.skills] if user.skills else ["c", "java", "python", "sql", "git"]
        org_languages = [lang.lower() for lang in json.loads(org.get("primary_languages", "[]"))]

        # 1. Tech stack base (30%)
        overlap = set(user_skills).intersection(set(org_languages))
        tech_score = (len(overlap) / max(len(org_languages), 1)) * 30.0

        # 2. Historical reliability & Slot allocation (25%)
        years = json.loads(org.get("past_participation_years", "[]"))
        history_score = min(len(years) * 3.5, 25.0)

        # 3. Community accessibility and mentorship (25%)
        has_guide = bool(org.get("contribution_guide_url"))
        has_channel = bool(org.get("community_channel"))
        doc_score = (12.5 if has_guide else 0) + (12.5 if has_channel else 0)

        # 4. Selection Probability Boost for high-slot / low-hype domains (20%)
        is_high_prob = "HIGH PROBABILITY" in org.get("description", "") or org.get("slug") in ["sympy", "metabrainz", "incf", "osgeo", "sunpy", "sugarlabs", "scummvm"]
        prob_boost = 20.0 if is_high_prob else 10.0

        total_score = round(tech_score + history_score + doc_score + prob_boost, 1)

        # Determine missing skills that can be acquired
        missing_skills = [lang.title() for lang in org_languages if lang not in user_skills]

        reasons = [
            f"Favorable selection ratio: Active mentors with lower applicant swarm than mainstream mega-orgs.",
            f"Verified GSoC track record across {len(years)} past editions.",
            f"Core language match: {', '.join([o.title() for o in overlap])}." if overlap else "Learnable stack with clear onboarding documentation."
        ]

        if missing_skills:
            strategy = (
                f"1. Target skills to pick up: {', '.join(missing_skills)} (Use AI tutorials and docs for fast onboarding).\n"
                f"2. Clone repository locally and run the test suite.\n"
                f"3. Start by solving a Level 1 good-first-issue or documentation fix to introduce yourself to maintainers.\n"
                f"4. Propose an early draft for GSoC 2027 in their {org.get('community_channel', 'channel')}."
            )
        else:
            strategy = (
                f"1. Immediate fit: You already know the required languages ({', '.join([o.title() for o in overlap])}).\n"
                f"2. Build the repository locally and run existing tests.\n"
                f"3. Submit 1-2 bug fixes to demonstrate reliable code review follow-through."
            )

        return {
            "fit_score": total_score,
            "confidence_level": "High" if total_score > 75 else "Medium",
            "fit_reasons": reasons,
            "skill_gaps": missing_skills,
            "suggested_strategy": strategy
        }

org_matcher = OrgMatcherService()
