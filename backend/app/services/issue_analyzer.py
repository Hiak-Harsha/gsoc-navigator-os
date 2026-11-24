import json
from typing import Dict, Any, List
from app.models.issue import Issue
from app.models.user import User

class IssueAnalyzer:
    """
    Intelligent Issue Discovery and Bug Classification Engine.
    Implements mandatory dual-axis classification:
    - Severity: S0 (Critical), S1 (High), S2 (Medium), S3 (Low), S4 (Cosmetic)
    - Difficulty: L1 (Beginner), L2 (Basic), L3 (Intermediate), L4 (Advanced), L5 (Expert)
    - Groups into: Start Now, Stretch Goals, Advanced Opportunities.
    """

    def analyze_and_classify(self, raw_issue: Dict[str, Any], user: User) -> Dict[str, Any]:
        title = raw_issue.get("title", "")
        body = raw_issue.get("body", "")
        labels = [l.lower() for l in raw_issue.get("labels", [])]
        combined_text = f"{title} {body}".lower()

        # 1. Determine Severity (S0 to S4)
        if any(term in combined_text for term in ["security", "vulnerability", "cve", "crash", "segfault", "corruption"]):
            severity = "S0" # Critical
        elif any(term in combined_text for term in ["regression", "fails to build", "broken functionality", "exception raised"]):
            severity = "S1" # High
        elif any(term in combined_text for term in ["incorrect result", "wrong answer", "unhandled error", "division by zero"]):
            severity = "S2" # Medium
        elif any(term in combined_text for term in ["docstring", "typo", "formatting", "pep8", "style", "clean up"]):
            severity = "S4" # Cosmetic
        else:
            severity = "S3" # Low

        # 2. Determine Implementation Difficulty (Level 1 to 5)
        if any(lbl in labels for lbl in ["good first issue", "easy", "beginner", "documentation", "doc"]):
            difficulty = "L1" # Beginner
        elif any(term in combined_text for term in ["add validation", "docstring", "raise error", "test case"]):
            difficulty = "L2" # Basic
        elif any(term in combined_text for term in ["performance", "concurrency", "parser", "algorithm", "architecture"]):
            difficulty = "L4" # Advanced
        elif any(term in combined_text for term in ["compiler", "memory leak", "ir", "rewriter"]):
            difficulty = "L5" # Expert
        else:
            difficulty = "L3" # Intermediate

        # 3. Categorization
        if difficulty in ["L1", "L2"]:
            category = "start_now"
        elif difficulty == "L3":
            category = "stretch"
        else:
            category = "advanced"

        # 4. Match Score & Required Skills
        required_skills = ["Python", "Git"]
        missing_skills = []
        if "matrices" in combined_text:
            required_skills.append("Linear Algebra")
        if "ode" in combined_text or "solver" in combined_text:
            required_skills.append("Differential Equations")
        if "test" in combined_text:
            required_skills.append("pytest")

        user_skills = [s.name.lower() for s in user.skills] if user.skills else ["python", "c", "git"]
        for req in required_skills:
            if req.lower() not in user_skills:
                missing_skills.append(req)

        match_score = 90.0 if not missing_skills else (75.0 if len(missing_skills) == 1 else 60.0)

        # 5. Engineering Investigation Strategy & Edge Cases
        if "rational exponent" in combined_text or "division by zero" in combined_text:
            strategy = (
                "1. Locate `simplify()` implementation in `sympy/simplify/simplify.py`.\n"
                "2. Reproduce with minimal script: `from sympy import simplify, Rational; simplify(1/(x - x))`.\n"
                "3. Trace the evaluation tree to identify where raw ZeroDivisionError escapes without being caught and mapped to `S.ComplexInfinity`."
            )
            edge_cases = ["Zero denominator", "Symbolic denominator that evaluates to zero under assumptions", "Negative exponents"]
            possible_direction = "Add guard clause checking for zero evaluation in denominator reduction step."
            testing_reqs = "Add regression test in `sympy/simplify/tests/test_simplify.py` verifying no unhandled exception."
            effort = 3.5
        elif "matrix exponential" in combined_text or "square matrix" in combined_text:
            strategy = (
                "1. Inspect `exp()` method in `sympy/matrices/dense.py`.\n"
                "2. Check matrix dimensions using `self.rows` and `self.cols` before invoking series expansion.\n"
                "3. Raise `NonSquareMatrixError` with descriptive message if dimensions mismatch."
            )
            edge_cases = ["1x1 matrix", "NxM rectangular matrix (N != M)", "Empty 0x0 matrix"]
            possible_direction = "Guard at top of method: `if not self.is_square: raise NonSquareMatrixError('exp() requires square matrix')`."
            testing_reqs = "Add test cases in `sympy/matrices/tests/test_dense.py` using `pytest.raises(NonSquareMatrixError)`."
            effort = 2.5
        else:
            strategy = "Inspect the relevant module, locate existing unit tests, reproduce locally, and isolate the condition."
            edge_cases = ["Null input", "Unexpected types", "Boundary values"]
            possible_direction = "Apply minimal maintainable patch following repository conventions."
            testing_reqs = "Run existing test suite and add a new regression test."
            effort = 4.0

        return {
            "severity": severity,
            "difficulty": difficulty,
            "category": category,
            "match_score": match_score,
            "match_rationale": f"Matches your preparation level. Categorized as {category.replace('_', ' ').title()} with {difficulty} difficulty.",
            "required_skills": required_skills,
            "missing_skills": missing_skills,
            "investigation_strategy": strategy,
            "possible_direction": possible_direction,
            "testing_requirements": testing_reqs,
            "edge_cases": edge_cases,
            "estimated_effort_hours": effort,
            "learning_value": "Deepens practical debugging, test-driven bugfixing, and codebase navigation.",
            "gsoc_relevance": "Demonstrates code quality, test rigor, and familiarization with the project's internal abstractions to GSoC mentors."
        }

issue_analyzer = IssueAnalyzer()
