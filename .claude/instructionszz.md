## TDD Fundamentals

### The TDD Cycle
The foundation of TDD is the Red-Green-View-Refactor cycle:

1. **Red Phase**: Write ONE failing test that describes desired behavior
   - The test must fail for the RIGHT reason (not syntax/import errors)
   - Only one test at a time - this is critical for TDD discipline
   - **Adding a single test to a test file is ALWAYS allowed** - no prior test output needed
   - Starting TDD for a new feature is always valid, even if test output shows unrelated work

2. **Green Phase**: Write MINIMAL code to make the test pass
   - Implement only what's needed for the current failing test
   - No anticipatory coding or extra features
   - Address the specific failure message

3. **View Phase**: Verify the change using Playwright when possible
   - Use `mcp__playwright__browser_snapshot` to ensure the change is visible and clear
   - Identify obvious bugs or visual regressions
   - Address the issues

3. **Refactor Phase**: Improve code structure while keeping tests green
   - Only allowed when relevant tests are passing
   - Requires proof that tests have been run and are green
   - Applies to BOTH implementation and test code
   - No refactoring with failing tests - fix them first

### Core Violations

1. **Multiple Test Addition**
   - Adding more than one new test at once
   - Exception: Initial test file setup or extracting shared test utilities

2. **Over-Implementation**  
   - Code that exceeds what's needed to pass the current failing test
   - Frontend Shadcn/ui componets are valid usecases for larger blocks of code, backend services are not
   - Adding untested features, methods, or error handling
   - Implementing multiple methods when test only requires one

3. **Premature Implementation**
   - Adding implementation before a test exists and fails properly
   - Adding implementation without running the test first
   - Refactoring when tests haven't been run or are failing

### Critical Principle: Incremental Development
Each step in TDD should address ONE specific issue:
- Test fails "not defined" → Create empty stub/class only
- Test fails "not a function" → Add method stub only  
- Test fails with assertion → Implement minimal logic only

### General Information
- Sometimes the test output shows as no tests have been run when a new test is failing due to a missing import or constructor. In such cases, allow the agent to create simple stubs. Ask them if they forgot to create a stub if they are stuck.
- It is never allowed to introduce new logic without evidence of relevant failing tests. However, stubs and simple implementation to make imports and test infrastructure work is fine.
- In the refactor phase, it is perfectly fine to refactor both teest and implementation code. That said, completely new functionality is not allowed. Types, clean up, abstractions, and helpers are allowed as long as they do not introduce new behavior.
- Adding types, interfaces, or a constant in order to replace magic values is perfectly fine during refactoring.
- Provide the agent with helpful directions so that they do not get stuck when blocking them.

## E2E Verification with Playwright MCP

### Testing Strategy: The Testing Pyramid

Follow the testing pyramid approach for optimal development workflow:
- **70-80% Unit Tests** (Vitest) - Fast, run constantly during TDD cycle
- **15-20% Integration Tests** - Test component interactions
- **5-10% E2E Tests** (Playwright MCP) - Strategic verification at milestones

**Key Principle:** E2E tests are **NOT run constantly** - they verify milestones after unit tests pass.

### When to Use E2E Tests

**Timing:**
- **After unit tests pass** for the feature
- **At feature completion milestones** (not during every TDD iteration)
- **Before committing user-facing changes**
- **After implementing complete user flows**

**Purpose:**
- Unit tests verify **logic correctness**
- E2E tests verify **user experience works**
- Both are essential, but serve different purposes

### Playwright MCP Integration

This project has **Playwright MCP tools** available for automated browser testing:

**Available MCP Tools:**
- `mcp__playwright__browser_navigate` - Navigate to URLs
- `mcp__playwright__browser_snapshot` - Capture page state (better than screenshots for actions)
- `mcp__playwright__browser_click` - Click elements
- `mcp__playwright__browser_type` - Type into inputs
- `mcp__playwright__browser_fill_form` - Fill multiple form fields
- `mcp__playwright__browser_evaluate` - Run JavaScript in the browser
- `mcp__playwright__browser_console_messages` - Check for console errors
- `mcp__playwright__browser_take_screenshot` - Visual verification

### When E2E Verification is REQUIRED

**ALWAYS verify with Playwright MCP after completing:**

1. **Forms & User Input**
   - Login/signup forms
   - Challenge creation forms
   - FPL team ID input
   - Any form with validation or submission

2. **Authentication Flows**
   - User registration
   - Login/logout
   - Protected route access
   - Session persistence

3. **Navigation & Routing**
   - New pages or routes
   - Navigation menu changes
   - Conditional navigation (logged in/out)
   - Back/forward behavior

4. **External API Integration**
   - FPL API data fetching
   - Firebase API calls
   - Data display from APIs
   - Error handling for API failures

5. **State Management with UI Impact**
   - User authentication state
   - Challenge state (pending/active/completed)
   - Real-time updates
   - Data persistence

6. **Critical User Journeys**
   - Complete signup → FPL connection → challenge creation flow
   - Challenge acceptance flow
   - Dashboard data loading and display

### When E2E Verification is OPTIONAL

**Skip Playwright MCP for:**
- Pure utility functions (no UI)
- Styling/CSS-only changes (unless they affect usability)
- Refactoring with no behavior changes
- Internal logic without UI impact
- Type definitions or interfaces
- Configuration files

### E2E Verification Workflow

**Recommended development flow:**

```
1. Write unit test (Red)
2. Implement code (Green)
3. Refactor (Green)
4. Repeat steps 1-3 until feature complete
5. → MILESTONE: Feature Complete, Unit Tests Passing ✓
6. → Use Playwright MCP to verify E2E
7. → Check console for errors
8. → Commit if verification passes
```

**E2E Verification Steps:**

1. **Start dev server** if not running: `npm run dev`

2. **Use Playwright MCP** to test the complete user flow:
   - Navigate to the relevant page
   - Interact with the UI (click, type, submit)
   - Verify expected behavior (elements appear, state changes)
   - Test error cases (invalid input, network failures)

3. **Critical checkpoints:**
   - Forms submit successfully
   - Navigation works as expected
   - Data displays correctly
   - Error messages appear when appropriate
   - Loading states appear/disappear
   - **No console errors or warnings**

4. **Check console errors:**
   ```
   Use mcp__playwright__browser_console_messages
   Verify no errors or unexpected warnings
   ```

### Example E2E Verification

**Scenario: Implementing Login Form**

```typescript
// 1. Unit tests (run constantly during TDD)
test('LoginForm validates email format', ...)
test('LoginForm calls onSubmit with credentials', ...)
test('LoginForm displays error messages', ...)
// All unit tests passing ✓

// 2. Feature complete milestone → Time for E2E verification
// Use Playwright MCP:
await browser_navigate('http://localhost:5173/login')
await browser_fill_form([
  { field: 'email', value: 'test@example.com' },
  { field: 'password', value: 'password123' }
])
await browser_click({ element: 'Submit button' })
// Verify navigation to dashboard
// Check console for errors
// ✓ E2E verification complete
```

### Reminder

**Unit tests prove the code works. Playwright MCP proves the user experience works.**

Follow the testing pyramid: many fast unit tests, selective strategic E2E tests at feature milestones.
