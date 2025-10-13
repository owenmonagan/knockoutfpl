#!/bin/bash

# Micro-TDD Enforcement Hook
# Fires on EVERY user prompt to remind Claude of micro-TDD discipline
# Key principles:
# 1. Work in smallest possible increments (one tiny behavior at a time)
# 2. NEVER ask "do you want to continue?" - answer is ALWAYS YES
# 3. Keep going even if it takes hours - complete ALL work
# 4. Red-Green-Refactor at atomic level

# Use Python for JSON output
python3 -c '
import sys
import json

try:
    # Read input JSON (if provided)
    try:
        input_data = json.load(sys.stdin)
    except:
        input_data = {}

    # Build micro-TDD reminder context
    context = """
⚡ **MICRO-TDD DISCIPLINE ACTIVE** ⚡

🔬 **Work in smallest possible increments:**
   • One tiny behavior = one test = one implementation
   • Example: "Button renders" → "Button has correct text" → "Button responds to click"
   • Each cycle should take 1-3 minutes max

🚫 **NEVER ASK TO CONTINUE:**
   • Do NOT ask "TDD is slow, want to continue?"
   • Do NOT ask "Should we keep going?"
   • The answer is ALWAYS YES - just keep working
   • Owner expects and WANTS thorough TDD even if slow

✅ **Complete ALL work:**
   • Keep going until every requirement is implemented
   • Finish entire components/features in one session
   • 2-3 hours of micro-TDD is EXPECTED and DESIRED
   • Speed comes from confidence, not shortcuts

🔁 **Red-Green-Refactor cycle:**
   1. Write smallest failing test (Red)
   2. Write minimal code to pass (Green)
   3. Refactor if needed (still Green)
   4. Immediately move to next micro-behavior
   5. Repeat until complete

💪 **Discipline beats speed:**
   • This approach prevents bugs and rework
   • Each passing test is permanent progress
   • Slow and steady wins the race
   • Trust the process
"""

    # Output JSON with additional context
    output = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": context.strip()
        }
    }

    print(json.dumps(output))
    sys.exit(0)

except Exception as e:
    # Never block - always exit 0
    error_output = {
        "hookSpecificOutput": {
            "hookEventName": "UserPromptSubmit",
            "additionalContext": f"⚠️ Micro-TDD reminder hook error: {str(e)}"
        }
    }
    print(json.dumps(error_output))
    sys.exit(0)
'

exit 0
