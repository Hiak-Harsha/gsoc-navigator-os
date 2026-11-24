import json
from typing import Dict, Any, List
from app.models.proposal import Proposal

class ProposalStudioService:
    """
    GSoC Proposal Development Studio and Quality Auditor.
    Provides rigorous, critical evaluation against official GSoC criteria:
    - Clear problem scope and architectural solution.
    - 12-week structured milestones with tangible deliverables.
    - Mandatory buffer weeks to absorb exams or unforeseen roadblocks.
    - Concrete testing and regression strategy.
    - Verified link to applicant's prior contributions in the organization.
    """

    def audit_proposal(self, proposal: Proposal) -> Dict[str, Any]:
        warnings = []
        strengths = []

        # 1. Abstract & Problem Statement
        if not proposal.problem_statement or len(proposal.problem_statement.strip()) < 100:
            warnings.append("Problem statement is too brief. Clearly define what limitation in the codebase this project solves.")
        else:
            strengths.append("Problem statement clearly articulates the technical challenge.")

        # 2. Proposed Architecture & Solution
        if not proposal.proposed_solution or len(proposal.proposed_solution.strip()) < 150:
            warnings.append("Solution architecture lacks technical depth. Include diagrams, affected classes, and API designs.")
        else:
            strengths.append("Proposed architecture specifies affected modules and design abstractions.")

        # 3. Weekly Milestones & Buffer Weeks
        milestones = []
        try:
            milestones = json.loads(proposal.weekly_milestones or "[]")
        except Exception:
            pass

        if len(milestones) < 6:
            warnings.append(f"Only {len(milestones)} milestones provided. GSoC requires a detailed week-by-week timeline (minimum 8-12 weeks).")
        else:
            strengths.append(f"Comprehensive milestone breakdown across {len(milestones)} weeks.")

        # Check for buffer week
        milestone_text = json.dumps(milestones).lower()
        if "buffer" not in milestone_text and "catch-up" not in milestone_text:
            warnings.append("Crucial omission: Missing a designated 'Buffer Week' before midterm or final evaluation for handling unexpected delays.")
        else:
            strengths.append("Includes designated buffer period for risk mitigation.")

        # 4. Testing Strategy
        if not proposal.testing_strategy or len(proposal.testing_strategy.strip()) < 50:
            warnings.append("Testing strategy is missing or too generic. Specify framework (e.g. pytest), benchmark metrics, and mock strategies.")
        else:
            strengths.append("Explicit testing strategy provided.")

        # 5. Prior Contributions
        prior_contribs = []
        try:
            prior_contribs = json.loads(proposal.prior_contributions or "[]")
        except Exception:
            pass

        if not prior_contribs:
            warnings.append("No prior contributions listed. Mentors prioritize applicants who have demonstrated ability with merged or open PRs in their repo.")
        else:
            strengths.append(f"Linked {len(prior_contribs)} prior contributions establishing credibility.")

        # Compute Review Score (0 to 100)
        base_score = 100.0 - (len(warnings) * 12.0)
        review_score = max(20.0, min(95.0, round(base_score, 1)))

        readiness_summary = (
            f"Proposal readiness is at {review_score}%. "
            + ("Ready for mentor draft review!" if review_score >= 80 else "Requires refinement before sending to mentors.")
        )

        proposal.review_score = review_score
        proposal.audit_warnings = json.dumps(warnings)
        proposal.strengths = json.dumps(strengths)

        return {
            "review_score": review_score,
            "audit_warnings": warnings,
            "strengths": strengths,
            "readiness_summary": readiness_summary
        }

proposal_service = ProposalStudioService()
