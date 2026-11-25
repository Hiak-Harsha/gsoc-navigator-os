import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.monitoring import Task, Notification
from app.models.organization import Organization
from app.models.contribution import Contribution
from app.models.proposal import Proposal
from app.services.llm_service import llm_service


class StrategyService:
    """
    Daily Execution Command Center, Strategy Engine, and Ollama Copilot Advisor.
    Grounds AI suggestions and Q&A directly in live database telemetry.
    """

    def build_portfolio_snapshot(self, db: Session, user: User) -> Dict[str, Any]:
        unread_notifications = (
            db.query(Notification)
            .filter(Notification.user_id == user.id, Notification.is_read == False)
            .order_by(Notification.created_at.desc())
            .limit(8)
            .all()
        )
        active_tasks = (
            db.query(Task)
            .filter(Task.user_id == user.id, Task.status.in_(["pending", "in_progress"]))
            .order_by(Task.priority.asc())
            .limit(6)
            .all()
        )
        shortlisted_orgs = (
            db.query(Organization).filter(Organization.is_shortlisted == True).all()
        )
        contributions = (
            db.query(Contribution)
            .filter(Contribution.user_id == user.id)
            .order_by(Contribution.created_at.desc())
            .all()
        )
        proposals = db.query(Proposal).filter(Proposal.user_id == user.id).all()

        return {
            "contributor": {
                "name": user.name,
                "stage": user.current_stage,
                "readiness_score": user.overall_readiness_score,
                "university": user.university,
                "graduation_year": user.graduation_year,
            },
            "pull_requests": [
                {
                    "pr_number": c.pr_number,
                    "title": c.pr_title,
                    "status": c.status,
                    "branch": c.branch_name,
                    "summary": c.review_feedback_summary,
                    "url": c.pr_url,
                }
                for c in contributions
            ],
            "unread_notifications": [
                {
                    "id": n.id,
                    "priority": n.priority,
                    "category": n.category,
                    "title": n.title,
                    "summary": n.summary,
                    "action_required": n.action_required,
                }
                for n in unread_notifications
            ],
            "pending_tasks": [
                {
                    "id": t.id,
                    "title": t.title,
                    "priority": t.priority,
                    "estimated_hours": t.estimated_hours,
                }
                for t in active_tasks
            ],
            "shortlisted_orgs": [
                {"name": o.name, "fit_score": o.fit_score} for o in shortlisted_orgs
            ],
            "proposals": [
                {"title": p.title, "review_score": p.review_score} for p in proposals
            ],
        }

    def generate_daily_briefing(self, db: Session, user: User) -> Dict[str, Any]:
        snap = self.build_portfolio_snapshot(db, user)
        return {
            "date": datetime.now(timezone.utc).strftime("%A, %B %d, %Y"),
            "current_stage": f"Stage {user.current_stage}: Repository Familiarity & Guided Contributions",
            "overall_readiness": f"{user.overall_readiness_score}%",
            "top_priorities": [t["title"] for t in snap["pending_tasks"][:3]]
            or ["Explore SymPy and run local test suite."],
            "shortlisted_orgs_count": len(snap["shortlisted_orgs"]),
            "contributions_tracked": len(snap["pull_requests"]),
            "urgent_alerts": [
                n["title"]
                for n in snap["unread_notifications"]
                if n["priority"] in ["critical", "high"]
            ],
        }

    def generate_weekly_review(self, db: Session, user: User) -> Dict[str, Any]:
        contributions = db.query(Contribution).filter(Contribution.user_id == user.id).all()
        completed_tasks = (
            db.query(Task)
            .filter(Task.user_id == user.id, Task.status == "completed")
            .count()
        )
        return {
            "week_ending": datetime.now(timezone.utc).strftime("%B %d, %Y"),
            "tasks_completed_this_week": completed_tasks,
            "contributions_active": len(contributions),
            "demonstrated_competencies": [s.name for s in user.skills if s.estimated_level >= 2],
            "key_weakness_focus": "Deepen test suite navigation and practice writing minimal reproducer scripts.",
            "next_week_objectives": [
                "Keep all open PR CI suites green and address maintainer reviews quickly.",
                "Engage in organization communication channels with concrete technical questions.",
                "Refine GSoC 2027 proposal milestones using merged PR evidence.",
            ],
        }

    async def generate_ai_suggestions(self, db: Session, user: User) -> Dict[str, Any]:
        snap = self.build_portfolio_snapshot(db, user)

        compact_context = {
            "readiness": snap["contributor"]["readiness_score"],
            "prs": [
                {"pr": p["pr_number"], "status": p["status"], "ci": (p["summary"] or "")[:100]}
                for p in snap["pull_requests"][:5]
            ],
            "unread_alerts": [
                {"priority": n["priority"], "title": n["title"]}
                for n in snap["unread_notifications"][:4]
            ],
            "top_tasks": [t["title"] for t in snap["pending_tasks"][:3]],
        }

        system_prompt = (
            "You are GSoC Copilot. Return STRICT JSON ONLY: "
            '{"headline":"...","priority_action":"...","suggestions":[{"title":"...","reason":"...","action_view":"contributions|notifications|issues|proposals|organizations|mentor","urgency":"high|medium|low"}]}. Keep suggestions to 3 crisp items.'
        )
        user_prompt = f"Portfolio:\n{json.dumps(compact_context)}"

        raw_text, source = await llm_service.analyze_with_meta(
            user_prompt, system_prompt=system_prompt, json_mode=True
        )
        parsed = llm_service.extract_json(raw_text) if source != "heuristic" else None

        if parsed and isinstance(parsed.get("suggestions"), list) and parsed.get("headline"):
            return {
                "headline": str(parsed["headline"]),
                "priority_action": str(parsed.get("priority_action") or parsed["suggestions"][0].get("title", "")),
                "suggestions": parsed["suggestions"][:4],
                "generated_by": source,
                "snapshot": snap,
            }

        # Smart data-driven heuristic fallback when LLM is unreachable
        suggestions: List[Dict[str, str]] = []
        urgent_alerts = [n for n in snap["unread_notifications"] if n["priority"] in ("critical", "high")]
        failing_prs = [p for p in snap["pull_requests"] if "failing" in (p.get("summary") or "").lower()]
        merged_prs = [p for p in snap["pull_requests"] if p.get("status") == "merged"]

        if urgent_alerts:
            top_alert = urgent_alerts[0]
            suggestions.append({
                "title": f"Resolve alert: {top_alert['title']}",
                "reason": top_alert.get("action_required") or top_alert["summary"],
                "action_view": "notifications",
                "urgency": "high",
            })

        if failing_prs:
            fp = failing_prs[0]
            suggestions.append({
                "title": f"Inspect CI status on PR #{fp['pr_number']}",
                "reason": fp.get("summary") or "Failing checks detected by Live PR Sentinel.",
                "action_view": "contributions",
                "urgency": "high",
            })
        elif snap["pull_requests"]:
            first_pr = snap["pull_requests"][0]
            suggestions.append({
                "title": f"Monitor review activity on {len(snap['pull_requests'])} tracked PRs",
                "reason": f"PR #{first_pr['pr_number']} is currently '{first_pr['status']}'. Check Masterclass talking points while awaiting review.",
                "action_view": "contributions",
                "urgency": "medium",
            })

        if snap["pending_tasks"]:
            t = snap["pending_tasks"][0]
            suggestions.append({
                "title": t["title"],
                "reason": f"Top {t['priority']}-priority task ({t['estimated_hours']}h est.).",
                "action_view": "overview",
                "urgency": "high" if t["priority"] == "critical" else "medium",
            })

        if len(suggestions) < 3:
            suggestions.append({
                "title": "Run Critical Audit in Proposal Studio",
                "reason": "Connect merged/open PRs cleanly into your 12-week GSoC milestones.",
                "action_view": "proposals",
                "urgency": "low",
            })

        headline = (
            f"{len(merged_prs)} PR(s) merged · {len(snap['pull_requests'])} active PRs · "
            f"{len(snap['unread_notifications'])} unread alert(s)."
        )
        priority_action = suggestions[0]["title"] if suggestions else "Sync live GitHub PR status."

        return {
            "headline": headline,
            "priority_action": priority_action,
            "suggestions": suggestions[:4],
            "generated_by": source,
            "snapshot": snap,
        }

    async def ask_copilot(
        self,
        db: Session,
        user: User,
        question: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        snap = self.build_portfolio_snapshot(db, user)
        system_prompt = (
            "You are GSoC Navigator Copilot running for an open-source contributor targeting GSoC 2027. "
            "Use the provided live portfolio snapshot to give concise, technical, honest answers. "
            "If CI failures or alerts are present, mention exact PR numbers and actionable steps."
        )
        history_text = ""
        if history:
            recent = history[-4:]
            history_text = "\nRecent conversation:\n" + "\n".join(
                f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in recent
            )

        prompt = (
            f"Live Portfolio Context:\n{json.dumps(snap, indent=2)}\n"
            f"{history_text}\n\n"
            f"User Question: {question}"
        )

        text, source = await llm_service.analyze_with_meta(prompt, system_prompt=system_prompt)
        if source == "heuristic":
            text = (
                f"Portfolio Snapshot ({snap['contributor']['readiness_score']}% readiness): "
                f"You have {len(snap['pull_requests'])} tracked PRs, "
                f"{len(snap['unread_notifications'])} unread notifications, and "
                f"{len(snap['pending_tasks'])} pending tasks. "
                "Start local Ollama (`ollama serve` with `llama3.2:latest`) for full conversational reasoning."
            )

        return {
            "answer": text,
            "generated_by": source,
            "snapshot": snap,
        }


strategy_service = StrategyService()
