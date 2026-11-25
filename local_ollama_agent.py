"""
GSoC Navigator OS — Local Ollama Companion & Windows Toast Notifier

Runs locally on Windows alongside Ollama (`llama3.2:latest` at http://127.0.0.1:11434).
1. Triggers live PR + GSoC source synchronization against your target API
   (either http://127.0.0.1:8000 locally or https://gsoc-navigator-os.onrender.com).
2. Asks local Ollama `llama3.2:latest` for a crisp next-step recommendation
   whenever unread alerts, CI failures, or PR merges appear.
3. Sends native Windows Toast Notifications without requiring external packages.
"""

import argparse
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional


DEFAULT_API_BASE = os.getenv("GSOC_API_BASE", "https://gsoc-navigator-os.onrender.com/api")
OLLAMA_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434").rstrip("/")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:latest")


def http_json(url: str, method: str = "GET", payload: Optional[Dict[str, Any]] = None, timeout: int = 20) -> Any:
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    headers = {"User-Agent": "GSoC-Navigator-Ollama-Companion"}
    if data is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def ask_ollama_suggestion(snapshot: Dict[str, Any]) -> Optional[str]:
    prompt = (
        "You are GSoC Navigator Copilot. Read this live portfolio snapshot and write "
        "a 1-2 sentence concrete recommendation on what the contributor should do right now "
        "(mention exact PR # or CI failures if present).\n\n"
        f"{json.dumps(snapshot, indent=2)}"
    )
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "options": {"temperature": 0.2},
    }
    try:
        res = http_json(f"{OLLAMA_URL}/api/chat", method="POST", payload=payload, timeout=35)
        return (res.get("message", {}) or {}).get("content", "").strip()
    except Exception as exc:
        print(f"[Ollama] Unavailable at {OLLAMA_URL}: {exc}")
        return None


def send_windows_toast(title: str, message: str) -> None:
    """Dispatches a native Windows 10/11 desktop toast notification via PowerShell WinRT."""
    safe_title = title.replace("'", "''").replace('"', "'")[:120]
    safe_msg = message.replace("'", "''").replace('"', "'")[:240]
    ps_script = f"""
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $textNodes = $template.GetElementsByTagName('text')
    $textNodes.Item(0).AppendChild($template.CreateTextNode('{safe_title}')) > $null
    $textNodes.Item(1).AppendChild($template.CreateTextNode('{safe_msg}')) > $null
    $toast = [Windows.UI.Notifications.ToastNotification]::new($template)
    $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('GSoC Navigator OS')
    $notifier.Show($toast)
    """
    try:
        subprocess.run(
            ["powershell", "-NoProfile", "-WindowStyle", "Hidden", "-Command", ps_script],
            check=False,
            capture_output=True,
        )
    except Exception as exc:
        print(f"[Toast] Could not show Windows toast: {exc}")


def run_cycle(api_base: str, seen_titles: set[str], notify_on_startup: bool = False) -> None:
    base = api_base.rstrip("/")
    print(f"[Sync] Checking {base} ...")
    try:
        http_json(f"{base}/contributions/sync-live-status", method="POST", payload={}, timeout=25)
    except Exception as exc:
        print(f"[Sync Warning] PR sync error: {exc}")

    try:
        notifs: List[Dict[str, Any]] = http_json(f"{base}/monitoring/notifications?unread_only=true", timeout=15) or []
        snapshot: Optional[Dict[str, Any]] = None
        try:
            snapshot = http_json(f"{base}/dashboard/context-snapshot", timeout=15)
        except Exception:
            snapshot = None

        if not isinstance(snapshot, dict) or not snapshot:
            contribs = http_json(f"{base}/contributions", timeout=15) or []
            tasks = http_json(f"{base}/dashboard/tasks", timeout=15) or []
            snapshot = {
                "pull_requests": [
                    {"pr": c.get("pr_number"), "status": c.get("status"), "title": c.get("pr_title")}
                    for c in contribs
                ],
                "unread_notifications": [
                    {"priority": n.get("priority"), "title": n.get("title")} for n in notifs
                ],
                "pending_tasks": [t.get("title") for t in tasks if t.get("status") != "completed"],
            }
    except Exception as exc:
        print(f"[Fetch Error] Could not read dashboard snapshot: {exc}")
        return

    new_alerts = [n for n in notifs if n.get("title") not in seen_titles]
    for n in notifs:
        if n.get("title"):
            seen_titles.add(n["title"])

    advice = ask_ollama_suggestion(snapshot)
    if advice:
        print(f"\n[Ollama {OLLAMA_MODEL} Suggestion]\n{advice}\n")

    if new_alerts:
        top = new_alerts[0]
        body = top.get("summary", "")
        if advice:
            body = f"{body} | Copilot: {advice}"
        send_windows_toast(f"GSoC Navigator: {top.get('title', 'Update')}", body)
    elif notify_on_startup and advice:
        send_windows_toast("GSoC Navigator + Ollama Ready", advice)


def main() -> int:
    parser = argparse.ArgumentParser(description="GSoC Navigator OS Ollama Companion & Windows Notifier")
    parser.add_argument("--api", default=DEFAULT_API_BASE, help="Backend API URL (local or Render)")
    parser.add_argument("--interval", type=int, default=300, help="Polling interval in seconds (default: 300)")
    parser.add_argument("--once", action="store_true", help="Run a single check + suggestion cycle and exit")
    parser.add_argument("--toast-now", action="store_true", help="Show Windows Toast immediately even if no new alerts")
    args = parser.parse_args()

    seen: set[str] = set()
    if args.once:
        run_cycle(args.api, seen, notify_on_startup=args.toast_now)
        return 0

    print(f"GSoC Navigator Ollama Companion started (API={args.api}, Model={OLLAMA_MODEL}, Interval={args.interval}s)")
    first = True
    while True:
        run_cycle(args.api, seen, notify_on_startup=(first and args.toast_now))
        first = False
        time.sleep(args.interval)


if __name__ == "__main__":
    sys.exit(main())
