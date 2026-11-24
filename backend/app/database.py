from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# SQLite connection arguments for concurrency
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from app import models # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Safe evolution for SQLite columns
    if settings.DATABASE_URL.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                res = conn.exec_driver_sql("PRAGMA table_info(organizations)")
                existing_cols = [row[1] for row in res.fetchall()]
                new_cols = {
                    "annual_slots": "TEXT DEFAULT '10-15'",
                    "competition_level": "TEXT DEFAULT 'Medium'",
                    "target_contributions_required": "INTEGER DEFAULT 3",
                    "contribution_breakdown": "TEXT DEFAULT '1 starter bug fix + 1 subsystem PR + 1 proposal draft'",
                    "portfolio_role": "TEXT DEFAULT 'Primary Target'",
                    "acceptance_probability_rating": "TEXT DEFAULT 'Very High'"
                }
                for col, col_type in new_cols.items():
                    if col not in existing_cols:
                        conn.exec_driver_sql(f"ALTER TABLE organizations ADD COLUMN {col} {col_type}")

                res_c = conn.exec_driver_sql("PRAGMA table_info(contributions)")
                existing_c_cols = [row[1] for row in res_c.fetchall()]
                if "learning_breakdown" not in existing_c_cols:
                    conn.exec_driver_sql("ALTER TABLE contributions ADD COLUMN learning_breakdown TEXT")

                conn.commit()
        except Exception as e:
            print(f"[DB Evolution Notice] {e}")
