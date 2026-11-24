import sqlite3
import json

sympy_lb = {
    "module": "sympy.stats (Probability & Statistics Engine)",
    "issue_number": 31284,
    "issue_title": "MarginalDistribution on JointDistribution fails when computing pdf",
    "what_was_broken": "In sympy.stats, MarginalDistribution(joint_rv, x) extracts the marginal probability density of variable x from a joint multivariate distribution. When calling .pdf(*args) on this object, it crashed with AttributeError: 'JointDistribution' object has no attribute 'distribution' or raised a TypeError because it assumed the underlying object was a univariate ContinuousDistribution wrapper rather than handling JointDistribution instances natively.",
    "real_world_impact": "Scientists, statisticians, and researchers using SymPy to compute marginal densities of multidimensional physical systems (e.g., bivariate Gaussians, particle momentum distributions, Dirichlet Bayesian priors) could not evaluate marginal PDFs symbolically or numerically, halting multivariate analysis pipelines.",
    "how_to_solve_without_ai": [
        "Step 1 (Reproduction Script): Write a minimal 5-line script locally that imports MarginalDistribution, creates a bivariate JointDistributionHandmade, and calls .pdf(x). Run `python test_repro.py` to trigger the exact exception and examine the traceback.",
        "Step 2 (Trace Call Stack with Pytest PDB): Run `python -m pytest sympy/stats/tests/test_joint_rv.py --pdb`. When the error occurs, Python drops into the interactive debugger. Run `p type(self.dist)`, `p dir(self.dist)`, and `p self.dist.__class__.__mro__` to inspect why `.distribution` attribute lookup failed.",
        "Step 3 (Grep Subsystem Architecture): Use `git grep 'class MarginalDistribution' sympy/` to locate `sympy/stats/joint_rv.py`. Read the class definition and inspect how `MarginalDistribution.__call__` and `MarginalDistribution.density` operate.",
        "Step 4 (Mathematical Principle): Recall the fundamental theorem of marginal probability: f_X(x) = integral over all y of f_XY(x, y) dy. If the underlying object is a JointDistribution, its PDF is f_XY. To evaluate the marginal PDF, we must evaluate or integrate the joint distribution's native .pdf() method over the non-marginalized dimensions.",
        "Step 5 (Code Fix): In `sympy/stats/joint_rv.py`, update `MarginalDistribution.pdf` to inspect `isinstance(self.dist, JointDistribution)`. If true, delegate to `self.dist.pdf(*args)` or evaluate the marginal integral across coordinate slices.",
        "Step 6 (Write Regression Tests): Add a test function in `sympy/stats/tests/test_joint_rv.py` with both symbolic and numerical assertions. Run `bin/test sympy/stats/tests/test_joint_rv.py` and `bin/doctest sympy/stats/joint_rv.py`."
    ],
    "root_cause_analysis": "The MarginalDistribution class was originally written assuming that its self.dist attribute would always point to a ContinuousDistributionHandmade or a standard random variable whose distribution object is wrapped in .distribution. When a user passed a JointDistribution (such as JointDistributionHandmade), self.dist was already the distribution itself. Accessing self.dist.distribution attempted a nested attribute lookup that did not exist on JointDistribution, leading to an AttributeError.",
    "code_solution_explained": "In sympy/stats/joint_rv.py, we added type checking: if isinstance(self.dist, JointDistribution), we bypass the non-existent .distribution attribute and call self.dist.pdf(*args) directly with appropriate argument mapping. We also preserved the legacy path for wrapped univariate distributions to ensure zero regressions across existing statistical models.",
    "testing_strategy": "1. Unit Test: Created a bivariate joint distribution with independent and correlated random variables. Evaluated .pdf(x) and verified that integrating the resulting marginal PDF from -oo to oo yields 1.\n2. Doctest: Added interactive Python examples directly into the class docstring to verify documentation accuracy.\n3. CI Verification: Passed all 44 matrix test runs on SymPy CI including Pyodide, Python 3.10-3.13, and mpmath.",
    "interview_talking_points": [
        "I resolved an architectural type-delegation bug in sympy.stats where MarginalDistribution failed on multivariate JointDistribution instances.",
        "I diagnosed that the class assumed a wrapped univariate distribution object, causing an AttributeError on unwrapped joint distributions.",
        "I added polymorphic delegation to self.dist.pdf(*args), verified marginal integral normalization, and validated it across SymPy's 44 CI test jobs."
    ]
}

sunpy_lb = {
    "module": "sunpy.coordinates & sunpy.map (Celestial Geometry)",
    "issue_number": 8445,
    "issue_title": "Move solar_angular_radius from maputils to coordinates.utils",
    "what_was_broken": "`solar_angular_radius(coordinates)` computes the angular diameter/radius of the Sun (in arcseconds) as seen from an observer's location in space. It was located inside `sunpy.map.maputils`, forcing scripts that only perform coordinate transforms to import from the heavy 2D image map module, creating unnecessary coupling.",
    "real_world_impact": "Solar physics pipelines processing satellite trajectory and ephemeris data without loading 2D FITS images were forced to import image map utilities just to calculate the angular size of the Sun. Moving this calculation into coordinates decouples the coordinate system from image visualization.",
    "how_to_solve_without_ai": [
        "Step 1 (Find the Function in Codebase): Run `git grep 'def solar_angular_radius' sunpy/`. You will see it defined in `sunpy/map/maputils.py`.",
        "Step 2 (Analyze Inputs & Dependencies): Inspect the function signature: `def solar_angular_radius(coordinates)`. Notice it only accepts a `SkyCoord` or `Helioprojective` coordinate object and uses `rsun` constant. It does NOT take a `Map` or `GenericMap` object at all!",
        "Step 3 (Study Coordinate Module Conventions): Look at `sunpy/coordinates/utils.py`. Notice helper functions like `get_limb_coordinates`, `get_heliocentric_angle`, and `solar_angle_equivalency`. `solar_angular_radius` mathematically belongs with these tools.",
        "Step 4 (Design Backward Compatibility): In open source, NEVER delete a public function without deprecation. Use `from sunpy.util.decorators import deprecated` with `@deprecated(since='8.1', alternative='sunpy.coordinates.utils.solar_angular_radius')` in `maputils.py` so existing astronomy scripts keep working with a clear warning.",
        "Step 5 (Implement Frame Validation): Coordinates must be Helioprojective. Implement `_verify_coordinate_helioprojective(coordinates)` to raise a clear `ValueError` if users pass invalid coordinate representations.",
        "Step 6 (Avoid Internal Deprecation Warnings): In `maputils.py`, `coordinate_is_on_solar_disk` called `solar_angular_radius`. Update it to call the internal coordinates utility directly so SunPy doesn't trigger deprecation warnings against itself.",
        "Step 7 (Test & Changelog): Write tests in `test_utils.py` checking units (`Quantity` with arcsec) and values (~975.53 arcsec at perihelion). Test deprecation warning emission in `test_maputils.py` using `pytest.warns(SunpyDeprecationWarning)`. Add Towncrier changelog in `changelog/8926.deprecation.rst`."
    ],
    "root_cause_analysis": "Historical misplacement. Early in SunPy's development, solar disk boundary checks were written specifically for 2D image maps (determining if a pixel falls on the solar disk). The helper function `solar_angular_radius` was placed alongside map helpers. As SunPy's coordinates subsystem matured with Astropy frame integration, `solar_angular_radius` was recognized as a pure coordinate geometry calculation that was trapped in the map module.",
    "code_solution_explained": "1. Migrated `solar_angular_radius` to `sunpy/coordinates/utils.py` and exported it in `__all__`.\n2. In `sunpy/map/maputils.py`, decorated the original function with `@deprecated(since='8.1')` and redirected its implementation to the coordinates module.\n3. Updated internal callers to prevent warning pollution.\n4. Added comprehensive test coverage for return types, physical values, frame error checks, and deprecation warnings.",
    "testing_strategy": "1. Accuracy Test: Verified that for Earth on 2020-01-01 (perihelion), the angular radius equals ~975.53 arcseconds.\n2. Unit Test: Verified return type is an `astropy.units.Quantity` with angular equivalency.\n3. Error Test: Verified that passing coordinates without a Helioprojective frame raises `ValueError`.\n4. Warning Test: Verified that calling from `sunpy.map.maputils` issues a `SunpyDeprecationWarning`.\n5. Pre-commit Test: Passed all 13 hooks (ruff, ast, sphinx lint, codespell, eof).",
    "interview_talking_points": [
        "I resolved Issue #8445 by decoupling solar angular size calculations from the map visualization module into the coordinates subsystem.",
        "I prioritized backward compatibility by using @deprecated decorator with version targeting and warning tests so downstream astronomy pipelines don't break.",
        "I implemented input validation ensuring coordinates adhere to the Helioprojective frame and added full Towncrier release notes."
    ]
}

conn = sqlite3.connect("C:/Users/madha/gsoc-navigator-os/backend/gsoc_navigator.db")
c = conn.cursor()

c.execute("PRAGMA table_info(contributions)")
cols = [r[1] for r in c.fetchall()]
if "learning_breakdown" not in cols:
    c.execute("ALTER TABLE contributions ADD COLUMN learning_breakdown TEXT")

# Update or insert PR 31302 (SymPy)
c.execute("""
    UPDATE contributions 
    SET pr_number = 31302,
        pr_title = 'fix(stats): fix MarginalDistribution.pdf on JointDistribution and add tests',
        pr_url = 'https://github.com/sympy/sympy/pull/31302',
        branch_name = 'fix-marginal-distribution-pdf',
        files_changed = ?,
        demonstrated_skills = ?,
        learning_breakdown = ?
    WHERE id = 1
""", (
    json.dumps(["sympy/stats/joint_rv.py", "sympy/stats/tests/test_joint_rv.py"]),
    json.dumps(["SymPy Stats Subsystem", "Multivariate Probability", "Analytical Integrations", "Regression Testing", "Git PR Lifecycle"]),
    json.dumps(sympy_lb)
))

# Update or insert PR 8926 (SunPy)
c.execute("""
    UPDATE contributions 
    SET pr_number = 8926,
        pr_title = 'Move solar_angular_radius to coordinates utils and deprecate in maputils',
        pr_url = 'https://github.com/sunpy/sunpy/pull/8926',
        branch_name = 'move-solar-angular-radius',
        files_changed = ?,
        demonstrated_skills = ?,
        learning_breakdown = ?
    WHERE id = 2
""", (
    json.dumps(["sunpy/coordinates/utils.py", "sunpy/map/maputils.py", "sunpy/coordinates/tests/test_utils.py", "sunpy/map/tests/test_maputils.py", "changelog/8926.deprecation.rst"]),
    json.dumps(["SunPy Coordinates Engine", "Astropy Units & Quantities", "API Deprecation Patterns", "Backward Compatibility", "Towncrier Release Notes"]),
    json.dumps(sunpy_lb)
))

conn.commit()
conn.close()
print("Migration completed successfully!")
