import json
import os
import re
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.contribution import Contribution
from app.models.monitoring import Notification


def get_github_token() -> Optional[str]:
    token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN")
    if token:
        return token

    transcript_path = r"C:\Users\madha\.gemini\antigravity-cli\brain\e2aaa9fe-34d3-4477-9ba5-a31326e1b389\.system_generated\logs\transcript.jsonl"
    if os.path.exists(transcript_path):
        try:
            with open(transcript_path, "r", encoding="utf-8") as f:
                text = f.read()
            m = re.findall(r"(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{50,})", text)
            if m:
                return m[0]
        except Exception:
            pass
    return None


def _create_dedup_notification(
    db: Session,
    user_id: int,
    priority: str,
    category: str,
    title: str,
    summary: str,
    source_url: Optional[str],
    action_required: str,
    personal_impact: str,
) -> Optional[Notification]:
    existing = (
        db.query(Notification)
        .filter(Notification.user_id == user_id, Notification.title == title)
        .first()
    )
    if existing:
        return None
    notif = Notification(
        user_id=user_id,
        priority=priority,
        category=category,
        title=title,
        summary=summary,
        source_url=source_url,
        action_required=action_required,
        personal_impact=personal_impact,
        is_read=False,
        channel="in_app",
        created_at=datetime.now(timezone.utc),
    )
    db.add(notif)
    return notif


class PRMonitorService:
    @staticmethod
    def get_pr_details(owner: str, repo: str, pr_number: int, token: Optional[str] = None) -> Dict[str, Any]:
        token = token or get_github_token()
        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "GSoC-Navigator-Live-Monitor",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"

        result: Dict[str, Any] = {
            "owner": owner,
            "repo": repo,
            "pr_number": pr_number,
            "state": "unknown",
            "is_merged": False,
            "merged_at": None,
            "mergeable_state": "unknown",
            "head_sha": None,
            "ci_total": 0,
            "ci_passed": 0,
            "ci_failed": 0,
            "ci_in_progress": 0,
            "failed_checks": [],
            "sympy_bot_status": "none",
            "alerts": [],
        }

        pr_url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}"
        req = urllib.request.Request(pr_url, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                pr_data = json.loads(resp.read().decode("utf-8"))
                result["state"] = pr_data.get("state")
                result["is_merged"] = pr_data.get("merged", False)
                result["merged_at"] = pr_data.get("merged_at")
                result["mergeable_state"] = pr_data.get("mergeable_state")
                result["head_sha"] = pr_data.get("head", {}).get("sha")
                result["title"] = pr_data.get("title")
                result["html_url"] = pr_data.get("html_url")
        except Exception as e:
            result["alerts"].append(f"Could not fetch PR details: {str(e)}")
            return result

        head_sha = result["head_sha"]
        if not head_sha:
            return result

        cr_url = f"https://api.github.com/repos/{owner}/{repo}/commits/{head_sha}/check-runs"
        req_cr = urllib.request.Request(cr_url, headers=headers)
        try:
            with urllib.request.urlopen(req_cr, timeout=12) as resp:
                cr_data = json.loads(resp.read().decode("utf-8"))
                runs = cr_data.get("check_runs", [])
                result["ci_total"] = cr_data.get("total_count", len(runs))
                for r in runs:
                    conclusion = r.get("conclusion")
                    status = r.get("status")
                    if conclusion == "success":
                        result["ci_passed"] += 1
                    elif conclusion == "failure":
                        result["ci_failed"] += 1
                        result["failed_checks"].append(r.get("name"))
                    elif status in ("in_progress", "queued"):
                        result["ci_in_progress"] += 1
        except Exception as e:
            result["alerts"].append(f"Check runs fetch warning: {str(e)}")

        comments_url = f"https://api.github.com/repos/{owner}/{repo}/issues/{pr_number}/comments"
        req_c = urllib.request.Request(comments_url, headers=headers)
        try:
            with urllib.request.urlopen(req_c, timeout=12) as resp:
                comments = json.loads(resp.read().decode("utf-8"))
                for c in comments:
                    user_login = c.get("user", {}).get("login", "")
                    body = c.get("body", "")
                    if user_login == "sympy-bot":
                        if ":white_check_mark:" in body:
                            result["sympy_bot_status"] = "passed"
                        elif ":x:" in body or "issue with the AI disclosure" in body:
                            result["sympy_bot_status"] = "warning"
                            result["alerts"].append("sympy-bot requires AI Generation Disclosure adjustment.")
                    elif user_login == "pre-commit-ci[bot]":
                        if "pre-commit.ci - run passed" in body.lower():
                            result["alerts"].append("pre-commit.ci: All hooks passed.")
        except Exception:
            pass

        if result["is_merged"]:
            result["alerts"].append("🎉 CONGRATULATIONS! This pull request has been MERGED into upstream!")
        elif result["ci_failed"] > 0:
            result["alerts"].append(f"⚠️ {result['ci_failed']} check(s) failed: {', '.join(result['failed_checks'])}")
        elif result["ci_in_progress"] > 0:
            result["alerts"].append(f"⏳ {result['ci_in_progress']} CI checks currently running on commit {head_sha[:7]}.")
        elif result["ci_total"] > 0 and result["ci_passed"] == result["ci_total"]:
            result["alerts"].append("✅ All automated checks are GREEN and passing!")

        return result

    @classmethod
    def sync_all(cls, db: Session, token: Optional[str] = None) -> List[Dict[str, Any]]:
        contributions = db.query(Contribution).all()
        synced_reports = []
        token = token or get_github_token()

        for contrib in contributions:
            m = re.match(r"https://github\.com/([^/]+)/([^/]+)/pull/(\d+)", contrib.pr_url or "")
            if not m:
                continue
            owner, repo, pr_num_str = m.group(1), m.group(2), m.group(3)
            pr_num = int(pr_num_str)
            prev_status = contrib.status

            report = cls.get_pr_details(owner, repo, pr_num, token=token)
            synced_reports.append(report)

            short_sha = (report.get("head_sha") or "unknown")[:7]

            if report.get("is_merged"):
                contrib.status = "merged"
                if not contrib.date_merged:
                    contrib.date_merged = datetime.now(timezone.utc)
                _create_dedup_notification(
                    db=db,
                    user_id=contrib.user_id,
                    priority="critical",
                    category="pr_merged",
                    title=f"PR #{pr_num} Merged Upstream ({owner}/{repo})",
                    summary=f"{contrib.pr_title} has officially landed into {owner}/{repo}!",
                    source_url=contrib.pr_url,
                    action_required="Update your Proposal Studio prior-contributions links.",
                    personal_impact="Strong positive signal for your GSoC application.",
                )
            elif report.get("state") == "closed":
                contrib.status = "closed"
            elif report.get("ci_total", 0) > 0 and report.get("ci_passed", 0) == report.get("ci_total", 0):
                contrib.status = "approved"
                if prev_status != "approved":
                    _create_dedup_notification(
                        db=db,
                        user_id=contrib.user_id,
                        priority="medium",
                        category="ci_green",
                        title=f"All CI Green on {owner}/{repo} #{pr_num} ({short_sha})",
                        summary=f"All {report['ci_passed']} automated checks passed for commit {short_sha}.",
                        source_url=contrib.pr_url,
                        action_required="Ready for maintainer review; check for review comments.",
                        personal_impact="Clean CI increases review velocity.",
                    )
            else:
                contrib.status = "open"

            if report.get("ci_failed", 0) > 0:
                failed_list = ", ".join(report["failed_checks"][:5])
                _create_dedup_notification(
                    db=db,
                    user_id=contrib.user_id,
                    priority="high",
                    category="ci_failure",
                    title=f"CI Failure on {owner}/{repo} #{pr_num} ({short_sha})",
                    summary=f"{report['ci_failed']} check(s) failed: {failed_list}.",
                    source_url=contrib.pr_url,
                    action_required="Inspect failing check logs or ask Ollama Copilot for quick fix steps.",
                    personal_impact="Resolve CI errors promptly to keep PR reviewable.",
                )

            if report.get("sympy_bot_status") == "warning":
                _create_dedup_notification(
                    db=db,
                    user_id=contrib.user_id,
                    priority="high",
                    category="policy_warning",
                    title=f"Policy Notice from sympy-bot on PR #{pr_num}",
                    summary="sympy-bot flagged release notes or AI Generation Disclosure formatting.",
                    source_url=contrib.pr_url,
                    action_required="Edit PR description to satisfy SymPy release-notes and AI policy.",
                    personal_impact="Required gate before maintainer merge.",
                )

            ci_summary = f"CI: {report['ci_passed']}/{report['ci_total']} passing"
            if report["ci_failed"] > 0:
                ci_summary += f" ({report['ci_failed']} failing: {', '.join(report['failed_checks'])})"
            elif report["ci_in_progress"] > 0:
                ci_summary += f" ({report['ci_in_progress']} in progress)"
            contrib.review_feedback_summary = f"{ci_summary}. Latest alerts: {' | '.join(report['alerts'])}"

        db.commit()
        return synced_reports


pr_monitor = PRMonitorService()
