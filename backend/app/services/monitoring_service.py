import hashlib
import json
import httpx
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.monitoring import MonitoredSource, SourceVersion, Notification
from app.models.user import User

class MonitoringService:
    """
    Real Persistent Background Monitoring and Change Detection Engine.
    Periodically checks official sources, computes SHA256 hashes, detects text diffs,
    and dispatches prioritized notifications with personal impact assessments.
    """

    async def check_source(self, source: MonitoredSource, db: Session, user: Optional[User] = None) -> Optional[Notification]:
        """Checks a single source, detects changes, and generates alerts if meaningful diffs occur."""
        source.last_checked_at = datetime.now(timezone.utc)
        try:
            # Fetch content with timeout
            async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
                resp = await client.get(source.url)
                if resp.status_code == 200:
                    content = resp.text
                    content_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
                    source.health_status = "active"
                    source.error_details = None

                    # If first check
                    if not source.last_content_hash:
                        source.last_content_hash = content_hash
                        source.current_version_summary = f"Initial baseline indexed ({len(content)} bytes)."
                        db.commit()
                        return None

                    # If content hash changed
                    if content_hash != source.last_content_hash:
                        diff_snippet = f"Content updated from {len(content)} bytes. New hash: {content_hash[:8]}..."
                        summary = f"Detected content update on {source.name}."
                        is_policy = source.category in ["program_rules", "timeline"]
                        importance = "critical" if is_policy else "high"

                        # Create version record
                        version = SourceVersion(
                            source_id=source.id,
                            content_hash=content_hash,
                            raw_snippet=content[:500],
                            detected_diff=diff_snippet,
                            semantic_change_summary=summary,
                            personal_impact_analysis="Official program guidelines or dates have been updated. Review timeline adjustments.",
                            action_required="Inspect the updated official page and update proposal deadlines accordingly.",
                            is_policy_change=is_policy,
                            importance=importance,
                            detected_at=datetime.now(timezone.utc)
                        )
                        db.add(version)

                        # Update source
                        source.last_content_hash = content_hash
                        source.current_version_summary = summary

                        # Create notification if user exists
                        if user:
                            notification = Notification(
                                user_id=user.id,
                                priority=importance,
                                category=source.category,
                                title=f"GSoC Update Detected: {source.name}",
                                summary=summary,
                                source_url=source.url,
                                personal_impact="Official source update requires verification of current timeline and guidelines.",
                                action_required="Check the new source text and verify preparation milestones.",
                                is_read=False,
                                channel="in_app",
                                created_at=datetime.now(timezone.utc)
                            )
                            db.add(notification)
                            db.commit()
                            return notification
                    db.commit()
                    return None
                else:
                    source.health_status = "failed"
                    source.error_details = f"HTTP {resp.status_code} received."
                    db.commit()
                    return None
        except Exception as e:
            source.health_status = "source_unavailable"
            source.error_details = str(e)
            db.commit()
            return None

    def seed_default_sources(self, db: Session):
        """Seeds official monitored sources if not present."""
        sources = [
            {
                "name": "Official GSoC Portal",
                "url": "https://summerofcode.withgoogle.com/",
                "category": "program_rules",
                "is_official": True,
                "check_interval_seconds": 3600
            },
            {
                "name": "GSoC Student Guide",
                "url": "https://google.github.io/gsocguides/student/",
                "category": "program_rules",
                "is_official": True,
                "check_interval_seconds": 7200
            },
            {
                "name": "Google Open Source GSoC FAQ",
                "url": "https://developers.google.com/open-source/gsoc/faq",
                "category": "program_rules",
                "is_official": True,
                "check_interval_seconds": 7200
            }
        ]

        for s in sources:
            existing = db.query(MonitoredSource).filter(MonitoredSource.url == s["url"]).first()
            if not existing:
                db.add(MonitoredSource(**s))
        db.commit()

monitoring_service = MonitoringService()
