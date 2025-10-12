#!/bin/bash

# shadcn/ui Component Reminder Hook
# Reminds Claude to use shadcn/ui components instead of raw HTML
# Triggers when modifying React component files (.tsx, .jsx)

set -e

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# Get the modified file from environment variables set by Claude
# Check both staged and unstaged changes
python3 <<'PYTHON'
import os
import sys
import subprocess
import re

project_dir = os.environ.get('PROJECT_DIR', os.getcwd())

try:
    # Check git diff for modified files
    status_result = subprocess.run(
        ['git', 'diff', '--name-only', 'HEAD'],
        capture_output=True,
        text=True,
        cwd=project_dir
    )

    # Also check staged changes
    staged_result = subprocess.run(
        ['git', 'diff', '--name-only', '--cached'],
        capture_output=True,
        text=True,
        cwd=project_dir
    )

    modified_files = status_result.stdout + staged_result.stdout

    # Check if any React component files were modified
    component_patterns = [
        r'\.tsx$',
        r'\.jsx$',
    ]

    modified_components = []
    for line in modified_files.split('\n'):
        if line.strip():
            for pattern in component_patterns:
                if re.search(pattern, line):
                    modified_components.append(line)
                    break

    # Only show reminder if component files were modified
    if modified_components:
        print("\n" + "="*70)
        print("🎨 SHADCN/UI COMPONENT REMINDER")
        print("="*70)
        print("\n📦 Modified component files:")
        for comp in modified_components[:5]:  # Show max 5 files
            print(f"   • {comp}")
        if len(modified_components) > 5:
            print(f"   ... and {len(modified_components) - 5} more")

        print("\n✨ Remember to use shadcn/ui components:")
        print("   • Check https://ui.shadcn.com before using raw HTML elements")
        print("   • AVOID: <div>, <button>, <input>, <label>, <form>")
        print("   • USE: <Card>, <Button>, <Input>, <Label>, <Form> (from shadcn)")
        print("   • Only use raw HTML for truly custom concepts without shadcn equivalent")
        print("\n📚 Quick reference:")
        print("   • npx shadcn@latest add [component-name]")
        print("   • import { Button } from '@/components/ui/button'")
        print("="*70 + "\n")

except Exception as e:
    # Silently fail - this is a non-blocking reminder
    sys.exit(0)

PYTHON
