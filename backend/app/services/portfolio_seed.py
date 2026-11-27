import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.organization import Organization, Repository
from app.models.contribution import Contribution
from app.models.user import User


SYMPY_31302_LB = {
    "module": "sympy.stats (Probability & Statistics Engine)",
    "issue_number": 31284,
    "issue_title": "MarginalDistribution on JointDistribution fails when computing pdf",
    "what_was_broken": "In sympy.stats, MarginalDistribution(joint_rv, x) extracts the marginal probability density of variable x from a joint multivariate distribution. When calling .pdf(*args), it crashed with AttributeError: 'JointDistribution' object has no attribute 'distribution'.",
    "real_world_impact": "Scientists and statisticians computing marginal densities of multidimensional physical systems could not evaluate marginal PDFs symbolically or numerically.",
    "how_to_solve_without_ai": [
        "Write a minimal 5-line script instantiating MarginalDistribution(JointDistributionHandmade(...), x) and calling .pdf(x).",
        "Run pytest --pdb to inspect type(self.dist) when AttributeError triggers.",
        "Locate class MarginalDistribution in sympy/stats/joint_rv.py via git grep.",
        "Update MarginalDistribution.pdf to detect isinstance(self.dist, JointDistribution) and integrate over non-marginalized dimensions.",
        "Add unit tests in sympy/stats/tests/test_joint_rv.py checking marginal integral normalization."
    ],
    "root_cause_analysis": "MarginalDistribution assumed self.dist wrapped an inner .distribution object, whereas JointDistribution already represents the distribution itself.",
    "code_solution_explained": "Added polymorphic JointDistribution handling in sympy/stats/joint_rv.py while preserving legacy univariate wrappers.",
    "testing_strategy": "Verified marginal PDF evaluation and integral normalization across unit tests and doctests.",
    "interview_talking_points": [
        "Resolved a type-delegation bug in sympy.stats where MarginalDistribution failed on multivariate JointDistribution instances.",
        "Diagnosed the invalid nested .distribution lookup on unwrapped JointDistribution objects.",
        "Validated across SymPy's full CI matrix (all 29 active checks passing)."
    ],
}

SUNPY_8926_LB = {
    "module": "sunpy.coordinates & sunpy.map (Celestial Geometry)",
    "issue_number": 8445,
    "issue_title": "Move solar_angular_radius from maputils to coordinates.utils",
    "what_was_broken": "solar_angular_radius(coordinates) was placed inside sunpy.map.maputils, forcing pure coordinate workflows to import heavy 2D image map modules.",
    "real_world_impact": "Decouples solar geometry calculations from 2D image visualization pipelines.",
    "how_to_solve_without_ai": [
        "Grep for def solar_angular_radius across sunpy/ to trace all callers.",
        "Inspect arguments: it only requires a Helioprojective coordinate, not a GenericMap.",
        "Move implementation and _verify_coordinate_helioprojective into sunpy/coordinates/utils.py.",
        "Decorate the legacy wrapper in sunpy/map/maputils.py with @deprecated(since='8.1').",
        "Update internal callers like coordinate_is_on_solar_disk to avoid self-deprecation warnings and add changelog/8926.deprecation.rst."
    ],
    "root_cause_analysis": "Historical coupling left coordinate geometry helper solar_angular_radius inside maputils.",
    "code_solution_explained": "Migrated solar_angular_radius to sunpy/coordinates/utils.py, exported in __all__, deprecated maputils wrapper cleanly, and updated tests + Towncrier changelog.",
    "testing_strategy": "Tested perihelion angular radius (~975.53 arcsec), frame ValueError checks, deprecation warnings, and pre-commit.ci hooks.",
    "interview_talking_points": [
        "Decoupled solar geometry calculation from sunpy.map into sunpy.coordinates.",
        "Preserved backward compatibility using @deprecated warnings and dedicated warning tests.",
        "Verified Towncrier changelog rules and pre-commit hooks cleanly."
    ],
}

SYMPY_31314_LB = {
    "module": "sympy.functions.elementary.trigonometric & sympy.core.expr",
    "issue_number": 28926,
    "issue_title": "TypeError: Invalid NaN comparison when calling sp.simplify on Eq with atan2 and reciprocal",
    "what_was_broken": "atan2(0, zoo) evaluated re(zoo) < 0 (i.e. nan < 0), raising TypeError: Invalid NaN comparison, which leaked out of Expr.is_constant() during simplify().",
    "real_world_impact": "Symbolic equation simplification involving inverse trigonometry and rational poles crashed instead of returning clean unevaluated expressions.",
    "how_to_solve_without_ai": [
        "Reproduce with simplify(Eq(1, atan2(a, 2/a))) and inspect traceback to atan2.eval.",
        "Isolate atomic trigger atan2(0, zoo) vs atan2(1, zoo).",
        "Handle S.NaN and S.ComplexInfinity early in atan2.eval and use assumption flags (is_negative/is_positive) instead of `<`.",
        "Catch (ZeroDivisionError, TypeError, ValueError) in Expr.is_constant() during trial point substitutions.",
        "Add unit tests in test_trigonometric.py and test_expr.py and verify mailmap + code quality."
    ],
    "root_cause_analysis": "atan2.eval ran relational comparison `<` on re(zoo)=nan, and Expr.is_constant only caught ZeroDivisionError.",
    "code_solution_explained": "Returned S.NaN early in atan2.eval on NaN/zoo, replaced relational `<` with assumption checks, and widened is_constant trial-point exception handling.",
    "testing_strategy": "Verified atan2 zoo/nan combinations, Eq simplification, code_quality EOF newline check, and full 29/29 active SymPy CI suite.",
    "interview_talking_points": [
        "Fixed core CAS crash TypeError: Invalid NaN comparison in atan2 and simplify().",
        "Combined function-level NaN/ComplexInfinity short-circuiting with Expr.is_constant exception containment.",
        "Passed all 29 active SymPy CI jobs including Slow Tests, Code Quality, and Check Authors."
    ],
}

CERN_766_LB = {
    "module": "vector.backends._numba_object (CERN-HSF / Scikit-HEP Numba Backend)",
    "issue_number": 512,
    "issue_title": "Possibly using variable before assignment warnings in Numba overloader methods",
    "what_was_broken": "Dispatch generators add_binary_method, add_tolerance_method, and add_isclose_method lacked exhaustive else branches raising numba.TypingError.",
    "real_world_impact": "Improves Numba static safety and diagnostic errors in High Energy Physics Lorentz vector pipelines.",
    "how_to_solve_without_ai": [
        "Inspect dispatch factories in src/vector/backends/_numba_object.py.",
        "Follow Numba @overload protocol by raising numba.TypingError on unmatched dimension/type branches.",
        "Add fallback else guards raising descriptive numba.TypingError messages.",
        "Add regression test asserting numba.TypingError on mismatched isclose dimensions."
    ],
    "root_cause_analysis": "Overloader generators left local dispatch variables potentially unassigned without a terminating else TypingError.",
    "code_solution_explained": "Added descriptive numba.TypingError fallback branches and dimension-mismatch Numba test in tests/backends/test_numba_object.py.",
    "testing_strategy": "Executed all 46 tests in tests/backends/test_numba_object.py locally and verified full matrix across Python 3.11-3.15.",
    "interview_talking_points": [
        "Contributed to CERN-HSF scikit-hep/vector Numba JIT backend.",
        "Added exhaustive TypingError overload fallback guards and regression tests for mismatched vector dimensions.",
        "Verified across Python 3.11-3.15 full test matrices and ROOT comparison suite."
    ],
}


def ensure_cern_org_seeded(db: Session) -> Organization:
    now = datetime.now(timezone.utc)
    org = db.query(Organization).filter(Organization.slug == "cern-hsf").first()
    if not org:
        org = Organization(
            name="CERN-HSF (High Energy Physics)",
            slug="cern-hsf",
            website="https://hepsoftwarefoundation.org/",
            gsoc_url="https://hepsoftwarefoundation.org/activities/gsoc.html",
            description="High Energy Physics Software Foundation coordinating software and distributed computing for CERN Large Hadron Collider experiments.",
            past_participation_years=json.dumps(["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"]),
            is_confirmed_2027=True,
            confirmed_source_url="https://hepsoftwarefoundation.org/activities/gsoc.html",
            primary_languages=json.dumps(["Python", "C++"]),
            topics=json.dumps(["Particle Physics", "Scientific Computing", "Scikit-HEP", "Numba"]),
            community_channel="Mattermost / HSF Forum",
            contribution_guide_url="https://hepsoftwarefoundation.org/how-to-contribute.html",
            ideas_list_url="https://hepsoftwarefoundation.org/activities/gsoc.html",
            fit_score=95.0,
            confidence_level="High",
            fit_reasons=json.dumps([
                "High slot allocation (15-18 slots)",
                "Strong Python scientific computing & Numba match",
                "Active Scikit-HEP ecosystem",
            ]),
            skill_gaps=json.dumps(["Grid computing concepts", "ROOT file formats"]),
            suggested_strategy="Target Python-based Scikit-HEP & Vector tools with strong regression tests.",
            is_shortlisted=True,
            annual_slots="15-18 slots/yr",
            competition_level="Low-Medium (Niche Tech Barrier)",
            target_contributions_required=2,
            contribution_breakdown="1 starter PR in Scikit-HEP/Vector + 1 subsystem enhancement",
            portfolio_role="Tertiary Target",
            acceptance_probability_rating="Very High",
            created_at=now,
            updated_at=now,
        )
        db.add(org)
        db.commit()
        db.refresh(org)

    vector_repo = db.query(Repository).filter(Repository.full_name == "scikit-hep/vector").first()
    if not vector_repo:
        vector_repo = Repository(
            organization_id=org.id,
            name="vector",
            full_name="scikit-hep/vector",
            html_url="https://github.com/scikit-hep/vector",
            default_branch="main",
            description="Vector is a Python library for 2D, 3D, and Lorentz vectors across Object, NumPy, Awkward, and Numba backends.",
            primary_language="Python",
            languages=json.dumps({"Python": 95.0, "Other": 5.0}),
            stars_count=420,
            forks_count=130,
            open_issues_count=65,
            architecture_summary="Core vector classes in src/vector/core, backends in src/vector/backends (_object, _numpy, _awkward, _numba_object).",
            entry_points=json.dumps(["src/vector/__init__.py", "src/vector/backends/_numba_object.py"]),
            build_instructions="pip install -e .",
            test_instructions="pytest tests/",
            last_synced_at=now,
        )
        db.add(vector_repo)
        db.commit()
        db.refresh(org)
    return org


def ensure_portfolio_seeded(db: Session, user: User) -> None:
    now = datetime.now(timezone.utc)
    cern_org = ensure_cern_org_seeded(db)

    sympy_repo = db.query(Repository).filter(Repository.full_name == "sympy/sympy").first()
    sunpy_repo = db.query(Repository).filter(Repository.full_name == "sunpy/sunpy").first()
    vector_repo = db.query(Repository).filter(Repository.full_name == "scikit-hep/vector").first()

    sympy_id = sympy_repo.id if sympy_repo else 1
    sunpy_id = sunpy_repo.id if sunpy_repo else sympy_id
    vector_id = vector_repo.id if vector_repo else cern_org.id

    portfolio_prs = [
        {
            "pr_number": 31302,
            "repository_id": sympy_id,
            "issue_id": 31284,
            "pr_title": "fix(stats): fix MarginalDistribution.pdf on JointDistribution and add tests",
            "pr_url": "https://github.com/sympy/sympy/pull/31302",
            "status": "open",
            "branch_name": "fix-marginal-distribution-pdf",
            "commits_count": 1,
            "files_changed": json.dumps(["sympy/stats/joint_rv.py", "sympy/stats/tests/test_joint_rv.py"]),
            "lines_added": 39,
            "lines_deleted": 5,
            "review_feedback_summary": "All 29 active CI checks green. sympy-bot approved.",
            "code_quality_assessment": "100% compliant with SymPy AI Policy, PR template, and test guidelines.",
            "demonstrated_skills": json.dumps(["SymPy Stats Subsystem", "Multivariate Probability", "Regression Testing", "Git PR Lifecycle"]),
            "learning_breakdown": json.dumps(SYMPY_31302_LB),
        },
        {
            "pr_number": 31314,
            "repository_id": sympy_id,
            "issue_id": 28926,
            "pr_title": "fix(functions): prevent TypeError during atan2 evaluation with NaN or complex infinity",
            "pr_url": "https://github.com/sympy/sympy/pull/31314",
            "status": "open",
            "branch_name": "fix-atan2-nan-simplify",
            "commits_count": 3,
            "files_changed": json.dumps(["sympy/functions/elementary/trigonometric.py", "sympy/core/expr.py", "sympy/core/tests/test_expr.py", ".mailmap"]),
            "lines_added": 34,
            "lines_deleted": 4,
            "review_feedback_summary": "All 29 active CI checks green including Code Quality & Slow Tests.",
            "code_quality_assessment": "Production CAS fix with .mailmap verified and AI disclosure approved.",
            "demonstrated_skills": json.dumps(["SymPy Core", "Trigonometric Subsystem", "Assumptions Engine", "Code Quality Compliance"]),
            "learning_breakdown": json.dumps(SYMPY_31314_LB),
        },
        {
            "pr_number": 8926,
            "repository_id": sunpy_id,
            "issue_id": 8445,
            "pr_title": "Move solar_angular_radius to coordinates utils and deprecate in maputils",
            "pr_url": "https://github.com/sunpy/sunpy/pull/8926",
            "status": "open",
            "branch_name": "move-solar-angular-radius",
            "commits_count": 3,
            "files_changed": json.dumps(["sunpy/coordinates/utils.py", "sunpy/map/maputils.py", "sunpy/coordinates/tests/test_utils.py", "sunpy/map/tests/test_maputils.py", "changelog/8926.deprecation.rst"]),
            "lines_added": 74,
            "lines_deleted": 9,
            "review_feedback_summary": "changelog: found & pre-commit.ci green. Awaiting maintainer GitHub Actions workflow approval.",
            "code_quality_assessment": "Clean deprecation migration with Towncrier changelog and frame validation.",
            "demonstrated_skills": json.dumps(["SunPy Coordinates", "Astropy Units", "API Deprecation", "Towncrier Changelog"]),
            "learning_breakdown": json.dumps(SUNPY_8926_LB),
        },
        {
            "pr_number": 766,
            "repository_id": vector_id,
            "issue_id": 512,
            "pr_title": "fix(numba): add TypingError fallback guards for unassigned variables in overloader methods (#512)",
            "pr_url": "https://github.com/scikit-hep/vector/pull/766",
            "status": "open",
            "branch_name": "fix-numba-variable-assignment-warnings",
            "commits_count": 2,
            "files_changed": json.dumps(["src/vector/backends/_numba_object.py", "tests/backends/test_numba_object.py"]),
            "lines_added": 26,
            "lines_deleted": 4,
            "review_feedback_summary": "Python 3.11-3.15 test matrices & ROOT tests passing; updated coverage + test pushed.",
            "code_quality_assessment": "Numba @overload TypingError guards + regression test.",
            "demonstrated_skills": json.dumps(["Python", "Numba JIT", "CERN-HSF", "Scikit-HEP Vector", "Static Analysis"]),
            "learning_breakdown": json.dumps(CERN_766_LB),
        },
    ]

    for item in portfolio_prs:
        existing = db.query(Contribution).filter(Contribution.pr_number == item["pr_number"]).first()
        if not existing:
            c = Contribution(
                user_id=user.id,
                date_started=now,
                created_at=now,
                updated_at=now,
                recurring_weaknesses_identified=json.dumps([]),
                **item,
            )
            db.add(c)
        elif not existing.learning_breakdown:
            existing.learning_breakdown = item["learning_breakdown"]
    db.commit()
