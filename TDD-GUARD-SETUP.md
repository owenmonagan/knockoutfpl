# TDD Guard Setup Guide

Complete guide for configuring TDD Guard with Claude Code for Knockout FPL.

## What is TDD Guard?

TDD Guard is a tool that enforces Test-Driven Development principles when using Claude Code. It:

- **Blocks code changes** without failing tests (test-first enforcement)
- **Prevents over-implementation** beyond current test requirements
- **Encourages refactoring** when tests are green
- **Validates development workflow** through Claude Code hooks

## Prerequisites

### 1. Install TDD Guard via Homebrew

```bash
brew install nizos/tap/tdd-guard
```

Verify installation:
```bash
tdd-guard --version
```

### 2. Install Project Dependencies

```bash
npm install
```

This installs `tdd-guard-vitest` reporter (already configured in `vite.config.ts`).

## Configuration Steps

### Step 1: Configure Claude Code Hooks

TDD Guard integrates with Claude Code through three hooks. You need to configure these **once** using the `/hooks` command.

#### Open Hooks Configuration

1. Type `/hooks` in Claude Code
2. This opens the hooks configuration interface

#### Configure Hook 1: PreToolUse

This hook validates file changes before they happen.

1. Select **`PreToolUse - Before tool execution`**
2. Choose **`+ Add new matcher...`**
3. Enter: `Write|Edit|MultiEdit|TodoWrite`
4. Press Enter
5. Select **`+ Add new hook...`**
6. Enter: `tdd-guard`
7. Press Enter
8. Choose where to save:
   - **Project** (`.claude/config.json`) - Recommended for team projects
   - **Folder** (`~/.config/claude/folder-config.json`) - For all projects in this folder
   - **Global** (`~/.config/claude/config.json`) - For all Claude Code sessions

**Important:** Remember your choice for the next two hooks!

#### Configure Hook 2: UserPromptSubmit

This hook handles session commands like `/tdd-status`, `/tdd-on`, `/tdd-off`.

1. Select **`UserPromptSubmit - When the user submits a prompt`**
2. Select **`+ Add new hook...`**
3. Enter: `tdd-guard`
4. Press Enter
5. **Choose the same location** as Hook 1

#### Configure Hook 3: SessionStart

This hook auto-enables TDD Guard on new sessions.

1. Select **`SessionStart - When a new session is started`**
2. Select **`+ Add new matcher...`**
3. Enter: `startup|resume|clear`
4. Press Enter
5. Select **`+ Add new hook...`**
6. Enter: `tdd-guard`
7. Press Enter
8. **Choose the same location** as Hooks 1 and 2

### Step 2: Verify Configuration

If you chose "Project" location, verify the hooks were added:

```bash
cat .claude/config.json
```

You should see all three hooks configured.

### Step 3: Generate Test Data

TDD Guard needs test results to enforce TDD. Run tests once:

```bash
npm test -- --run
```

This creates `.claude/tdd-guard/data/test.json` with test results.

Verify:
```bash
ls -la .claude/tdd-guard/data/
```

You should see `test.json`.

## Using TDD Guard

### Session Commands

Once configured, use these commands in Claude Code:

```bash
/tdd-status  # Check TDD Guard state (enabled/disabled)
/tdd-on      # Enable TDD enforcement
/tdd-off     # Temporarily disable enforcement
```

### Development Workflow

#### 1. Red Phase (Write Failing Test)

```typescript
// src/components/ChallengeCard.test.tsx
test('should display challenge creator name', () => {
  render(<ChallengeCard creatorName="Owen" />);
  expect(screen.getByText('Owen')).toBeInTheDocument();
});
```

Run test:
```bash
npm test
```

Test fails ✗ - This is expected!

#### 2. Green Phase (Write Minimal Code)

Ask Claude Code to implement:

```
Create a ChallengeCard component that displays the creator name
```

TDD Guard will:
- Check that tests are failing ✓
- Allow implementation to make tests pass ✓
- Block over-implementation beyond test requirements ✓

#### 3. Refactor Phase (Improve Code)

When tests are green, TDD Guard allows refactoring:

```
Refactor ChallengeCard to use semantic HTML
```

TDD Guard ensures tests stay green during refactoring.

### What TDD Guard Blocks

TDD Guard will **block** Claude Code from:

1. **Writing implementation without failing tests**
   - Error: "No failing tests found. Write a failing test first."

2. **Over-implementing beyond test requirements**
   - Error: "Implementation exceeds test requirements. Keep it minimal."

3. **Modifying code with failing tests**
   - Error: "Tests are failing. Fix tests before modifying code."

### What TDD Guard Allows

TDD Guard **allows** Claude Code to:

1. **Write test files** (always allowed)
2. **Implement code to pass failing tests** (red → green)
3. **Refactor when tests are green** (green → green)
4. **Fix failing tests** (red → green)

## Testing the Setup

### Test 1: Verify TDD Guard is Running

```bash
/tdd-status
```

Should show: "TDD Guard is enabled"

### Test 2: Try Writing Code Without Tests

Ask Claude Code:
```
Create a new UserProfile component
```

**Expected:** TDD Guard blocks the action and suggests writing a test first.

### Test 3: Write Test First, Then Implement

Ask Claude Code:
```
Write a test for a UserProfile component that displays user email
```

Then:
```
Implement the UserProfile component to pass the test
```

**Expected:** TDD Guard allows both actions.

## Troubleshooting

### Issue: TDD Guard Not Running

**Symptoms:** Claude Code creates files without TDD validation

**Solutions:**
1. Check hooks are configured: `/hooks`
2. Verify test results exist: `ls .claude/tdd-guard/data/test.json`
3. Run tests to generate data: `npm test -- --run`
4. Check TDD Guard status: `/tdd-status`

### Issue: "No test results found"

**Cause:** Tests haven't been run yet

**Solution:**
```bash
npm test -- --run
```

### Issue: TDD Guard Blocks Everything

**Cause:** Tests might be failing

**Solutions:**
1. Check test status: `npm test`
2. Fix failing tests
3. Or temporarily disable: `/tdd-off`

### Issue: Hooks Not Found

**Cause:** TDD Guard not in PATH or not installed

**Solutions:**
1. Verify installation: `which tdd-guard`
2. Reinstall if needed: `brew reinstall nizos/tap/tdd-guard`
3. Check PATH includes Homebrew bin: `echo $PATH`

## Alternative: Manual Hooks Configuration

If `/hooks` doesn't work, edit `.claude/config.json` directly:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|TodoWrite",
        "hooks": [
          {
            "type": "command",
            "command": "tdd-guard"
          }
        ]
      }
    ],
    "userpromptsubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "tdd-guard"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup|resume|clear",
        "hooks": [
          {
            "type": "command",
            "command": "tdd-guard"
          }
        ]
      }
    ]
  }
}
```

## Resources

- [TDD Guard Documentation](https://github.com/nizos/tdd-guard)
- [Claude Code Hooks Documentation](https://docs.anthropic.com/en/docs/claude-code/hooks)
- [Vitest Reporter Configuration](https://github.com/nizos/tdd-guard/tree/main/reporters/vitest)

## Need Help?

- Check [TDD Guard Issues](https://github.com/nizos/tdd-guard/issues)
- Review [Claude Code Docs](https://docs.claude.com/en/docs/claude-code)
- Ask in project discussions
