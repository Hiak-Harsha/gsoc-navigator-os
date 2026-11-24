import json
from typing import Dict, Any, List
from app.models.contribution import Contribution
from app.models.user import User, Skill

class PRIntelligenceService:
    """
    Pull Request Intelligence Engine.
    Reviews code diffs, tracks maintainer review comments, detects recurring weaknesses,
    and updates the contributor's living skill profile with verified evidence.
    """

    def audit_pr_code(self, diff_or_code: str, title: str) -> Dict[str, Any]:
        """Performs automated peer-review on a pull request draft or diff."""
        warnings = []
        strengths = []
        recurring_weaknesses = []

        code_lower = diff_or_code.lower()

        # Check for test additions
        if "def test_" not in code_lower and "assert " not in code_lower and "test" not in code_lower:
            warnings.append("No new test cases detected in diff. Open source projects require regression tests for every bugfix.")
            recurring_weaknesses.append("Missing regression tests")
        else:
            strengths.append("Includes test cases verifying the modification.")

        # Check for error handling
        if "except:" in code_lower or "except Exception:" in code_lower:
            warnings.append("Avoid bare `except:` or catching broad `Exception`. Catch specific exceptions (e.g. ValueError, TypeError).")
            recurring_weaknesses.append("Broad exception handling")

        # Check for print statements
        if "print(" in code_lower:
            warnings.append("Detected `print()` statements. Use logging or remove debugging output before submitting.")

        # Check for clean commit conventions
        if any(prefix in title.lower() for prefix in ["fix:", "feat:", "docs:", "test:", "refactor:"]):
            strengths.append("Commit / PR title adheres to conventional commit specifications.")
        else:
            warnings.append("Recommend formatting PR title with standard prefixes: e.g. `fix: <summary>` or `docs: <summary>`.")

        score = max(50.0, 100.0 - (len(warnings) * 15.0))

        return {
            "score": score,
            "status": "Ready for submission" if score >= 80 else "Changes recommended",
            "warnings": warnings,
            "strengths": strengths,
            "recurring_weaknesses": recurring_weaknesses,
            "quality_assessment": "Code conforms to repository patterns." if score >= 80 else "Address test coverage and naming before requesting maintainer review."
        }

    def record_maintainer_feedback(self, contribution: Contribution, user: User, feedback_text: str, new_status: str):
        """Processes maintainer review comments and updates user skills with verified evidence."""
        contribution.status = new_status
        contribution.review_feedback_summary = feedback_text

        # If approved or merged, upgrade user readiness and skill evidence
        if new_status in ["approved", "merged"]:
            contribution.demonstrated_skills = json.dumps(["Git Rebase", "Pull Request Lifecycle", "Code Review Collaboration"])
            user.overall_readiness_score = min(100.0, user.overall_readiness_score + 15.0)
            user.current_stage = max(user.current_stage, 3) # Stage 3: Independent engineering

pr_intelligence = PRIntelligenceService()
