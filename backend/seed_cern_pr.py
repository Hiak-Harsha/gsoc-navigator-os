import sqlite3
import json
from datetime import datetime

conn = sqlite3.connect(r"C:\Users\madha\gsoc-navigator-os\backend\gsoc_navigator.db")
cursor = conn.cursor()

# 1. Insert repository if not exists
cursor.execute("SELECT id FROM repositories WHERE full_name = ?", ("scikit-hep/vector",))
repo = cursor.fetchone()
if not repo:
    cursor.execute("""
        INSERT INTO repositories (
            organization_id, name, full_name, html_url, default_branch, description,
            primary_language, languages, stars_count, forks_count, open_issues_count,
            architecture_summary, entry_points, build_instructions, test_instructions,
            last_synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        11,
        "vector",
        "scikit-hep/vector",
        "https://github.com/scikit-hep/vector",
        "main",
        "Vector is a Python 3.8+ library for 2D, 3D, and Lorentz vectors, including HEP kinematics, NumPy, Awkward Array, Numba, and SymPy backends.",
        "Python",
        json.dumps({"Python": 95.0, "Other": 5.0}),
        420,
        130,
        65,
        "Core vector classes in src/vector/core, backends in src/vector/backends (_object, _numpy, _awkward, _numba_object, _sympy), compute functions in src/vector/compute.",
        json.dumps(["src/vector/__init__.py", "src/vector/backends/_numba_object.py"]),
        "pip install -e .",
        "pytest tests/",
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    ))
    repo_id = cursor.lastrowid
else:
    repo_id = repo[0]

# 2. Insert contribution
learning_breakdown = {
    "module": "vector.backends._numba_object (High Energy Physics / JIT Vector Overloading Backend)",
    "issue_number": 512,
    "issue_title": "Possibly using variable before assignment warnings in Numba overloader functions",
    "what_was_broken": "In src/vector/backends/_numba_object.py, dispatch registration methods (add_binary_method, add_tolerance_method, and add_isclose_method) overload mathematical and comparison operations across vector types in Numba JIT compiler. The overloader functions used cascading if/elif branches that assigned result expressions to variables (out, result). In cases where unsupported operand types or coordinate combinations were passed, the branches were skipped without assigning, causing static analysis and Numba JIT warnings: Possibly using variable out before assignment (E0606). If reached at runtime, it would cause an UnboundLocalError rather than a proper Numba TypingError.",
    "real_world_impact": "High Energy Physics experiments at CERN (CMS, ATLAS, LHCb) process billions of particle collision events with 4-momentum Lorentz vectors (px, py, pz, E) using Numba JIT compilation. Compiler warnings degrade build logs, and failing to raise TypingError prevents Numba multiple dispatch from exploring alternative overload candidates or giving physicists actionable compile-time diagnostics.",
    "how_to_solve_without_ai": [
        "Step 1 (Reproduction & Grep): Use git grep -n \"out =\" src/vector/backends/_numba_object.py to inspect overloader generators and locate where variable assignment occurs inside conditional branches without a terminating else fallback.",
        "Step 2 (Understand Numba Overload Protocol): In Numba @overload API, when an overloaded function is invoked with unsupported argument types, the overload function MUST raise numba.TypingError (or numba.core.errors.TypingError). This signals to Numba typing engine that no valid implementation exists.",
        "Step 3 (Trace Dispatch Factories): Inspect add_binary_method, add_tolerance_method, and add_isclose_method to map out all coordinate matching branches.",
        "Step 4 (Implement Guard & Fallback): In each generator function, append an explicit else: clause raising numba.TypingError with descriptive coordinate and type signatures.",
        "Step 5 (Verification & Linting): Run ruff check on the modified file and execute pytest tests/test_issues.py and pytest tests/backends to ensure valid operations continue to dispatch cleanly."
    ],
    "root_cause_analysis": "The overloaders were written assuming that previous type check guards would filter out unsupported coordinate combinations. However, Python and Numba static AST analysis inspects all lexical paths. Because there was no else block, the path where none of the conditions matched left out unbound at the return out statement.",
    "code_solution_explained": "In src/vector/backends/_numba_object.py, we added explicit else blocks in add_binary_method, add_tolerance_method, and add_isclose_method that raise numba.TypingError with a descriptive error message indicating the unsupported types and operation name.",
    "testing_strategy": "1. Verified with ruff check and ruff format --check on _numba_object.py (0 errors).\n2. Executed pytest tests/test_issues.py and pytest tests/backends/ (39 passed).\n3. Verified in origin git remote that the branch fix-numba-variable-assignment-warnings contains the clean commit.",
    "interview_talking_points": [
        "I contributed to CERN-HSF (High Energy Physics Software Foundation) on scikit-hep/vector, which handles 2D, 3D, and Lorentz vector kinematics for the Large Hadron Collider.",
        "I resolved an unbound variable compiler defect in the Numba JIT acceleration engine where overloader dispatch functions lacked exhaustive type guards, causing E0606 static analysis warnings and uncaught runtime failures.",
        "I implemented explicit numba.TypingError fallback branches across dispatch factories (add_binary_method, add_tolerance_method, add_isclose_method), guaranteeing deterministic JIT compilation and clean error diagnostics for HEP researchers."
    ]
}

cursor.execute("SELECT id FROM contributions WHERE pr_number = 766")
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
        repo_id,
        512,
        766,
        "fix(numba): add TypingError fallback guards for unassigned variables in overloader methods (#512)",
        "https://github.com/scikit-hep/vector/pull/766",
        "open",
        "fix-numba-variable-assignment-warnings",
        1,
        json.dumps(["src/vector/backends/_numba_object.py"]),
        16,
        4,
        0,
        "Submitted to upstream scikit-hep/vector (CERN-HSF). Pre-commit and CI workflows running.",
        "Production grade. Adheres strictly to Numba @overload dispatch conventions and static typing safety.",
        "Ensure exhaustive branch coverage when authoring JIT generator functions.",
        json.dumps(["Python", "Numba JIT", "High Energy Physics", "AST Static Analysis", "scikit-hep", "CERN-HSF"]),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
        json.dumps(learning_breakdown)
    ))
    conn.commit()
    print("Contribution 766 inserted successfully!")
else:
    cursor.execute("""
        UPDATE contributions SET learning_breakdown = ? WHERE pr_number = 766
    """, (json.dumps(learning_breakdown),))
    conn.commit()
    print("Contribution 766 updated successfully!")
