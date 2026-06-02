#!/usr/bin/env python3
"""
Daily feedback checker for The List.
Run via cron to get notified of new feedback reports.
Outputs a summary to stdout — pipe to Telegram or email.

Usage: python3 scripts/check-feedback.py
"""

import json, urllib.request, os
from datetime import datetime, timezone, timedelta

API_URL = "https://the-list-ashy-pi.vercel.app/api/feedback"

def main():
    try:
        req = urllib.request.Request(API_URL)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"❌ Failed to fetch feedback: {e}")
        return

    feedback = data.get("feedback", [])
    if not feedback:
        print("✅ No open feedback reports.")
        return

    print(f"\n📬 The List — Daily Feedback Report")
    print(f"   {len(feedback)} open report(s)\n")

    for fb in feedback:
        created = fb.get("created_at", "")[:16] if fb.get("created_at") else "?"
        print(f"  ┌─ [{fb.get('feedback_type', '?')}] — {created}")
        print(f"  │  {fb.get('message', '?')[:200]}")
        if fb.get("item_title"):
            print(f"  │  Item: {fb['item_title']}")
        if fb.get("page_url"):
            print(f"  │  Page: {fb['page_url'][:60]}")
        if fb.get("contact"):
            print(f"  │  Contact: {fb['contact']}")
        print(f"  └─ ID: {fb.get('id', '?')}")
        print()

if __name__ == "__main__":
    main()
