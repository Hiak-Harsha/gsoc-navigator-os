import sqlite3
import json
from datetime import datetime

conn = sqlite3.connect(r"C:\Users\madha\gsoc-navigator-os\backend\gsoc_navigator.db")
cursor = conn.cursor()

learning_breakdown = {
    "module": "sympy.functions.elementary.trigonometric & sympy.core.expr (Elementary Functions & Core Equivalence)",
    "issue_number": 28926,
    "issue_title": "TypeError: Invalid NaN comparison when calling sp.simplify on Eq with atan2 and reciprocal",
    "what_was_broken": "In sympy.functions.elementary.trigonometric.atan2.eval(y, x), evaluating expressions where x is zoo (ComplexInfinity) or nan (such as atan2(0, zoo) or atan2(0, nan)) fell through to the `if y.is_zero:` block. When checking `if x.is_number:`, it constructed a Piecewise((pi, re(x) < 0), ...) where re(zoo) evaluates to nan. Calling Python's < comparison operator on SymPy nan triggered StrictLessThan(nan, 0), raising an unhandled TypeError: Invalid NaN comparison. When simplify() tested equation equivalence via Expr.is_constant() and Expr.equals(), it tried substituting 0 for free symbols (evaluating 2/a to zoo), causing the TypeError to leak out and crash simplify.",
    "real_world_impact": "Engineers and researchers simplifying algebraic equations involving inverse trigonometry and rational functions (such as robotic kinematics, orbital mechanics, and phase angle calculations) experienced fatal crashes instead of clean algebraic reductions or unevaluated relations.",
    "how_to_solve_without_ai": [
        "Step 1 (Reproduction & Stack Trace Analysis): Write a minimal 4-line repro script: `from sympy import *; a = symbols('a'); simplify(Eq(1, atan2(a, 2/a)))`. Run python with pytest --pdb or inspect the exact line of the traceback: `trigonometric.py, in eval return Piecewise((pi, re(x) < 0)...) StrictLessThan(nan, 0) TypeError: Invalid NaN comparison`.",
        "Step 2 (Isolate the Atomic Trigger): In an interactive IPython shell, test the atomic components: `atan2(0, zoo)` crashes with TypeError! But `atan2(1, zoo)` returns nan, and `atan2(zoo, 0)` returns nan. Why does only `atan2(0, zoo)` crash?",
        "Step 3 (Trace the Branch Conditions): In `trigonometric.py`, trace `atan2.eval(y, x)`: when `y = 0` and `x = zoo`, `x.is_extended_nonzero` is False, but `x.is_number` is True! It attempts `re(x) < 0`. Because `re(zoo) = nan`, `nan < 0` triggers an exception because NaN cannot have a total ordering.",
        "Step 4 (Examine Caller Architecture): Trace where the call came from: `Expr.is_constant()` tries `expr.subs({a: 0})`. When `a = 0`, `2/a` becomes `zoo`. The method only had `except ZeroDivisionError:`, failing to catch `TypeError` or `ValueError` during singular substitutions, allowing exceptions to escape `equals()`.",
        "Step 5 (Dual-Layer Mathematical Resolution): At the function level, return `S.NaN` early if `NaN` or `ComplexInfinity` is present in either argument, and use assumption attributes (`rx.is_negative`, `rx.is_positive`, `rx is S.NaN`) rather than relational `<`. At the core level, guard `Expr.is_constant()` with `except (ZeroDivisionError, TypeError, ValueError):` so trial evaluations never crash the CAS.",
        "Step 6 (Comprehensive Verification): Add unit tests to `test_trigonometric.py` covering all `zoo`/`nan` quadrant combinations, add `test_expr.py` ensuring `equals(0)` returns `None` without exception, and run `bin/mailmap_check.py`."
    ],
    "root_cause_analysis": "The atan2 overloader lacked explicit guards for complex infinity and NaN, allowing non-comparable values to enter relational AST nodes (re(x) < 0). Concurrently, Expr.is_constant() had an overly narrow exception handler that only caught ZeroDivisionError, letting TypeErrors from singularity substitutions escape to user code.",
    "code_solution_explained": "1. In sympy/functions/elementary/trigonometric.py, added early exit: `if S.NaN in (x, y) or S.ComplexInfinity in (x, y): return S.NaN`.\n2. Replaced raw relational `<` evaluation in atan2 with assumption inspection: checking `rx.is_negative` and `rx.is_positive` safely returns None/Boolean without throwing.\n3. In sympy/core/expr.py, widened trial substitution exception handling to `(ZeroDivisionError, TypeError, ValueError)` in `is_constant()`.",
    "testing_strategy": "1. Unit Test: Verified `atan2(0, zoo) is S.NaN`, `atan2(0, nan) is S.NaN`, `atan2(zoo, 0) is S.NaN`, and `atan2(1, zoo) is S.NaN`.\n2. Regression Test: Verified `(1 - atan2(a, 2/a)).equals(0) is None` and `is_constant() is False` without raising TypeError.\n3. Test Runner: Executed all 92 trigonometric tests (passed in 45s) and 75 relational tests (passed in 6s).\n4. Doctests: Ran `bin/doctest` across trigonometric.py (16 passed) and expr.py (36 passed).",
    "interview_talking_points": [
        "I resolved Issue #28926 in SymPy's core mathematics engine, eliminating an unhandled `TypeError: Invalid NaN comparison` crash in `atan2` and `simplify()`.",
        "I diagnosed that substituting trial points in `Expr.is_constant()` evaluated expressions at complex poles, passing `zoo` into `atan2` where `re(zoo) < 0` attempted relational comparison on NaN.",
        "I implemented a two-tier architectural fix: early NaN/ComplexInfinity resolution in `atan2.eval()` with assumption-based sign analysis, and resilient exception containment in `Expr.is_constant()` to prevent leaking TypeErrors during algebraic simplification."
    ]
}

cursor.execute("SELECT id FROM contributions WHERE pr_number = 31314")
existing_contrib = cursor.fetchone()
if not existing_contrib:
    cursor.execute("""
        INSERT INTO contributions (
            user_id, repository_id, issue_id, pr_number, pr_title, pr_url, status,
            branch_name, commits_count, files_changed, lines_added, lines_deleted,
            review_comments_count, review_feedback_summary, code_quality_assessment,
            recurring_weaknesses_identified, demonstrated_skills,
            date_started, created_at, updated_at, learning_breakdown
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        1,
        1,  # sympy repo_id
        28926,
        31314,
        "fix(functions): prevent TypeError during atan2 evaluation with NaN or complex infinity",
        "https://github.com/sympy/sympy/pull/31314",
        "open",
        "fix-atan2-nan-simplify",
        1,
        json.dumps([
            "sympy/functions/elementary/trigonometric.py",
            "sympy/core/expr.py",
            "sympy/functions/elementary/tests/test_trigonometric.py",
            "sympy/core/tests/test_expr.py",
            ".mailmap"
        ]),
        34,
        3,
        0,
        "Pull request opened on sympy/sympy. Fixes Issue #28926. All unit tests and doctests green.",
        "Production grade CAS fix. Adheres strictly to SymPy core assumptions architecture and exception hygiene.",
        "Avoid using raw Python relational operators (<, >) on symbolic quantities that can evaluate to NaN.",
        json.dumps(["SymPy Core", "Trigonometric Subsystem", "Relational Assumptions", "Exception Handling", "Regression Testing"]),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        json.dumps(learning_breakdown)
    ))
    conn.commit()
    print("Contribution 31314 inserted successfully!")
else:
    cursor.execute("""
        UPDATE contributions SET learning_breakdown = ? WHERE pr_number = 31314
    """, (json.dumps(learning_breakdown),))
    conn.commit()
    print("Contribution 31314 updated successfully!")
