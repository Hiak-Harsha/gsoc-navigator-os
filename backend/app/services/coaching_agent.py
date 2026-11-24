import json
from typing import Dict, Any, List
from app.models.issue import CoachingSession, Issue
from app.services.llm_service import llm_service

class CoachingAgent:
    """
    Personal Contribution Coaching Agent.
    Manages the mandatory 8-step engineering workflow:
    1: Understand -> 2: Investigate -> 3: Learn -> 4: Debug -> 5: Implement -> 6: Test -> 7: Review -> 8: Submit
    Supports Mentor Mode (Socratic guidance, prompts, hints) vs Implementation Assistance Mode.
    """

    STEP_NAMES = {
        1: "Understand",
        2: "Investigate",
        3: "Learn",
        4: "Debug",
        5: "Implement",
        6: "Test",
        7: "Review",
        8: "Submit Preparation"
    }

    def initialize_session(self, session: CoachingSession, issue: Issue) -> CoachingSession:
        """Sets up initial step context for the selected issue."""
        session.current_step = 1
        session.problem_summary = (
            f"Problem in #{issue.number}: {issue.title}. "
            f"The issue involves handling unexpected states gracefully according to repository standards."
        )
        session.concepts = json.dumps(["Exception Handling", "Regression Testing", "Repository Conventions"])
        session.investigation_notes = "Ready to begin Step 1: Technical understanding."
        session.hypotheses = json.dumps([])
        session.review_feedback = json.dumps([])
        session.pr_title_draft = f"Fix #{issue.number}: {issue.title[:60]}"
        session.pr_description_draft = (
            f"<!-- Fixes #{issue.number} -->\n\n"
            f"### Description\n"
            f"Resolves the defect described in #{issue.number} by applying proper boundary checks.\n\n"
            f"### Testing\n"
            f"- Added new unit tests reproducing the failure.\n"
            f"- Verified all existing tests pass."
        )
        return session

    def get_step_guidance(self, session: CoachingSession, issue: Issue) -> Dict[str, Any]:
        """Returns step-by-step guidance tailored to the active mode."""
        step = session.current_step
        mode = session.mode

        if step == 1: # Understand
            return {
                "step": 1,
                "name": "Understand",
                "goal": "Grasp what is happening vs what should happen without guessing.",
                "guidance": (
                    f"In this issue (#{issue.number}), examine the unexpected behavior: '{issue.title}'.\n"
                    f"Mentor Prompt: What input causes the failure? What exception or output should the user receive instead?"
                ),
                "action_required": "Summarize the failure condition in your own words before looking at source code."
            }
        elif step == 2: # Investigate
            return {
                "step": 2,
                "name": "Investigate",
                "goal": "Locate relevant source files, entry points, and existing tests.",
                "guidance": (
                    f"Look at the relevant files: {issue.relevant_files or 'core module files'}.\n"
                    f"Strategy: {issue.investigation_strategy}\n"
                    f"Can you run the existing test suite locally and pinpoint which test file covers this subsystem?"
                ),
                "action_required": "Identify the exact function or class where the defect originates."
            }
        elif step == 3: # Learn
            return {
                "step": 3,
                "name": "Learn",
                "goal": "Review required foundational concepts.",
                "guidance": (
                    f"Required concepts: {issue.required_skills}.\n"
                    f"Ensure you understand how the repository structures unit tests and asserts custom exceptions."
                ),
                "action_required": "Read the module's docstrings or related tests to understand the expected conventions."
            }
        elif step == 4: # Debug
            return {
                "step": 4,
                "name": "Debug",
                "goal": "Formulate hypotheses and isolate the confirmed root cause.",
                "guidance": (
                    "Do not guess. Write a 3-line reproduction script that triggers the exact bug locally.\n"
                    "Step through the traceback to verify where the unhandled state escapes."
                ),
                "action_required": "Confirm the root cause and document the reproduction script."
            }
        elif step == 5: # Implement
            return {
                "step": 5,
                "name": "Implement",
                "goal": "Craft a minimal, maintainable fix.",
                "guidance": (
                    f"Possible implementation direction: {issue.possible_direction}\n"
                    f"Mode: {'Mentor Mode (Writing your own fix with hints)' if mode == 'mentor' else 'Assistance Mode (Reviewing suggested diff)'}."
                ),
                "action_required": "Provide your draft code diff."
            }
        elif step == 6: # Test
            return {
                "step": 6,
                "name": "Test",
                "goal": "Verify the fix and write regression tests.",
                "guidance": (
                    f"Testing requirements: {issue.testing_requirements}\n"
                    f"Ensure you test edge cases: {issue.edge_cases}."
                ),
                "action_required": "Run the project test command locally and ensure zero regressions."
            }
        elif step == 7: # Review
            return {
                "step": 7,
                "name": "Review",
                "goal": "Critical peer review of code quality, style, and naming.",
                "guidance": (
                    "Checklist before submitting to maintainers:\n"
                    "1. Is the patch minimal without extraneous formatting changes?\n"
                    "2. Does it conform to PEP8 / repository code style?\n"
                    "3. Are edge cases covered in tests?\n"
                    "4. Is the commit message clear and concise?"
                ),
                "action_required": "Review your diff against the checklist."
            }
        elif step == 8: # Submit Preparation
            return {
                "step": 8,
                "name": "Submit Preparation",
                "goal": "Draft professional PR description and commit message.",
                "guidance": (
                    "Remember: Open source maintainers are busy volunteers. Make their review effortless.\n"
                    f"Suggested Commit Message:\n`fix: {issue.title.lower()} (fixes #{issue.number})`"
                ),
                "draft_pr_title": session.pr_title_draft,
                "draft_pr_description": session.pr_description_draft,
                "action_required": "Review and approve before creating the PR on GitHub."
            }
        return {"step": step, "name": "Complete", "guidance": "Session complete!"}

coaching_agent = CoachingAgent()
