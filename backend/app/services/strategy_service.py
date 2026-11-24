from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.monitoring import Task, Notification
from app.models.organization import Organization
from app.models.contribution import Contribution

class StrategyService:
    """
    Daily Execution Command Center and Strategy Engine.
    Answers: Where do I stand today, and what should I do next?
    Produces daily briefings, weekly reviews, and prioritized actionable tasks.
    """

    def generate_daily_briefing(self, db: Session, user: User) -> Dict[str, Any]:
        """Generates a concise, high-impact daily briefing for the contributor."""
        unread_notifications = db.query(Notification).filter(
            Notification.user_id == user.id,
            Notification.is_read == False
        ).order_by(Notification.created_at.desc()).limit(3).all()

        active_tasks = db.query(Task).filter(
            Task.user_id == user.id,
            Task.status.in_(["pending", "in_progress"])
        ).order_by(Task.priority.asc()).limit(3).all()

        shortlisted_orgs = db.query(Organization).filter(
            Organization.is_shortlisted == True
        ).count()

        contributions_count = db.query(Contribution).filter(
            Contribution.user_id == user.id
        ).count()

        return {
            "date": datetime.now(timezone.utc).strftime("%A, %B %d, %Y"),
            "current_stage": f"Stage {user.current_stage}: Repository Familiarity & Guided Contributions",
            "overall_readiness": f"{user.overall_readiness_score}%",
            "top_priorities": [t.title for t in active_tasks] or ["Explore SymPy and run local test suite."],
            "shortlisted_orgs_count": shortlisted_orgs,
            "contributions_tracked": contributions_count,
            "urgent_alerts": [n.title for n in unread_notifications if n.priority in ["critical", "high"]]
        }

    def generate_weekly_review(self, db: Session, user: User) -> Dict[str, Any]:
        """Produces a strategic weekly progress summary."""
        contributions = db.query(Contribution).filter(Contribution.user_id == user.id).all()
        completed_tasks = db.query(Task).filter(Task.user_id == user.id, Task.status == "completed").count()

        return {
            "week_ending": datetime.now(timezone.utc).strftime("%B %d, %Y"),
            "tasks_completed_this_week": completed_tasks,
            "contributions_active": len(contributions),
            "demonstrated_competencies": [s.name for s in user.skills if s.estimated_level >= 2],
            "key_weakness_focus": "Deepen test suite navigation and practice writing minimal reproducer scripts.",
            "next_week_objectives": [
                "Submit first pull request solving a verified 'Start Now' issue.",
                "Engage in organization communication channel with concrete technical questions.",
                "Begin outlining GSoC 2027 project proposal architecture."
            ]
        }

strategy_service = StrategyService()
