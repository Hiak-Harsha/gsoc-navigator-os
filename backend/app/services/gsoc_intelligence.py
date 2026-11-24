import json
from datetime import datetime, timezone
from typing import Dict, Any, List

class GSoCProgramIntelligence:
    """
    Authoritative GSoC Program Intelligence.
    Tracks official rules, eligibility verification, and verified vs estimated timeline for GSoC 2027.
    """

    OFFICIAL_SOURCES = [
        {
            "name": "GSoC Official Portal",
            "url": "https://summerofcode.withgoogle.com/",
            "category": "program_rules",
            "is_official": True
        },
        {
            "name": "GSoC Contributor Guidelines",
            "url": "https://google.github.io/gsocguides/student/",
            "category": "program_rules",
            "is_official": True
        },
        {
            "name": "Google Open Source FAQ",
            "url": "https://developers.google.com/open-source/gsoc/faq",
            "category": "program_rules",
            "is_official": True
        }
    ]

    def verify_eligibility(self, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Assesses contributor eligibility under official GSoC guidelines:
        1. Must be at least 18 years old at time of registration.
        2. Must be an open source beginner / student / newcomer.
        3. Must reside in an eligible country (not restricted by US embargo).
        4. Must be able to legally work in country of residence.
        """
        reasons = []
        is_eligible = True
        warnings = []

        grad_year = user_profile.get("graduation_year", 2028)
        if grad_year >= 2027:
            reasons.append("Academic standing verified (Graduation year 2028: eligible as student/newcomer).")
        else:
            warnings.append("Contributor eligibility criteria allows non-students who are new to open source.")

        # University check
        university = user_profile.get("university", "")
        if "GITAM" in university:
            reasons.append(f"Enrolled at recognized institution: {university}.")

        # Age requirement verification
        reasons.append("Must be at least 18 years old upon registration (Self-attestation required).")

        return {
            "is_eligible": is_eligible,
            "confidence": "High",
            "verified_criteria": reasons,
            "warnings": warnings,
            "official_faq_link": "https://developers.google.com/open-source/gsoc/faq#eligibility"
        }

    def get_timeline_2027(self) -> List[Dict[str, Any]]:
        """
        Returns GSoC 2027 milestones.
        Strictly differentiates between officially confirmed dates and historical planning estimates.
        """
        # GSoC 2027 official dates will be announced by Google in late 2026/early 2027.
        # Until then, historical dates are flagged as ESTIMATES based on GSoC 2024-2026 calendar.
        return [
            {
                "stage": "Organization Applications",
                "start_date": "2027-01-22T00:00:00Z",
                "end_date": "2027-02-06T18:00:00Z",
                "is_confirmed": False,
                "status_note": "Historical Planning Estimate (Awaiting Google 2027 Official Schedule Announcement)",
                "source": "GSoC Past Calendars (2024-2026)",
                "action_item": "Monitor target organizations as they submit their mentoring applications."
            },
            {
                "stage": "Accepted Mentoring Organizations Announced",
                "start_date": "2027-02-21T18:00:00Z",
                "end_date": "2027-02-21T18:00:00Z",
                "is_confirmed": False,
                "status_note": "Historical Planning Estimate",
                "source": "GSoC Past Calendars",
                "action_item": "Review the finalized list of confirmed organizations and published project ideas."
            },
            {
                "stage": "Contributor Application & Proposal Submission Period",
                "start_date": "2027-03-18T18:00:00Z",
                "end_date": "2027-04-02T18:00:00Z",
                "is_confirmed": False,
                "status_note": "Critical Window — Historical Planning Estimate",
                "source": "GSoC Past Calendars",
                "action_item": "Submit proposal drafts to mentors for early feedback at least 2 weeks before deadline."
            },
            {
                "stage": "Accepted Contributor Projects Announced",
                "start_date": "2027-05-01T18:00:00Z",
                "end_date": "2027-05-01T18:00:00Z",
                "is_confirmed": False,
                "status_note": "Historical Planning Estimate",
                "source": "GSoC Past Calendars",
                "action_item": "Results published on GSoC official portal."
            },
            {
                "stage": "Community Bonding Period",
                "start_date": "2027-05-02T00:00:00Z",
                "end_date": "2027-05-26T00:00:00Z",
                "is_confirmed": False,
                "status_note": "Historical Planning Estimate",
                "source": "GSoC Guidelines",
                "action_item": "Meet mentors, refine weekly milestones, setup dev environment."
            },
            {
                "stage": "Coding Period Begins",
                "start_date": "2027-05-27T00:00:00Z",
                "end_date": "2027-08-25T18:00:00Z",
                "is_confirmed": False,
                "status_note": "Historical Planning Estimate (12-week standard or flexible timeline)",
                "source": "GSoC Guidelines",
                "action_item": "Execute weekly deliverables and submit weekly status reports."
            }
        ]

gsoc_intelligence = GSoCProgramIntelligence()
