#!/bin/bash

# Claude hook to inject session context at startup
# Triggered on SessionStart (startup, resume, clear, compact)
# Provides: date, git state, environment info

# Use Python for all processing to ensure proper JSON handling
python3 -c '
import sys
import json
import subprocess
import os
from datetime import datetime

def run_git(args):
    """Run git command safely, return output or None on error"""
    try:
        result = subprocess.run(
            ["git"] + args,
            capture_output=True,
            text=True,
            timeout=5,
            cwd=os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
        )
        return result.stdout.strip() if result.returncode == 0 else None
    except Exception:
        return None

try:
    # Read input JSON
    input_data = json.load(sys.stdin)
    source = input_data.get("source", "unknown")

    # Build context sections
    context_parts = []

    # 1. Date/Time
    now = datetime.now()
    date_str = now.strftime("%A, %B %d, %Y at %I:%M %p")
    context_parts.append(f"📅 **Session Started**: {date_str}")
    context_parts.append(f"**Source**: {source}")
    context_parts.append("")

    # 2. Git Information
    git_available = run_git(["status"]) is not None

    if git_available:
        # Current branch
        branch = run_git(["branch", "--show-current"])
        if branch:
            context_parts.append(f"🌿 **Branch**: `{branch}`")

            # Git status summary
            status_output = run_git(["status", "--short"])
            if status_output:
                lines = status_output.split("\n")
                modified = len([l for l in lines if l.startswith(" M") or l.startswith("M ")])
                staged = len([l for l in lines if l.startswith("M") or l.startswith("A")])
                untracked = len([l for l in lines if l.startswith("??")])

                status_summary = []
                if staged > 0:
                    status_summary.append(f"{staged} staged")
                if modified > 0:
                    status_summary.append(f"{modified} modified")
                if untracked > 0:
                    status_summary.append(f"{untracked} untracked")

                if status_summary:
                    context_parts.append(f"**Changes**: {", ".join(status_summary)}")
                else:
                    context_parts.append("**Changes**: Clean working directory")

            # Recent commits (only if NOT on main/master)
            if branch and branch not in ["main", "master"]:
                commits = run_git(["log", "--oneline", "--no-decorate", "-10"])
                if commits:
                    context_parts.append("")
                    context_parts.append("**Recent Commits**:")
                    for commit_line in commits.split("\n")[:10]:
                        if commit_line.strip():
                            context_parts.append(f"  - {commit_line}")
    else:
        context_parts.append("ℹ️  Not in a git repository")

    # Build final context
    context = "\n".join(context_parts)

    # Output JSON with additional context
    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": context
        }
    }

    print(json.dumps(output))
    sys.exit(0)

except Exception as e:
    # Never block session startup - always exit 0
    error_output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": f"⚠️  Session init hook error: {str(e)}"
        }
    }
    print(json.dumps(error_output))
    sys.exit(0)
'

exit 0
