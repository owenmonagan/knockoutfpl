# E2E Verification with Playwright MCP

You are now in **E2E Verification Mode**. Follow this guided workflow to verify the user experience with Playwright MCP.

## Prerequisites Check

Before starting E2E verification:

1. ✅ **Unit tests must be passing**
   - Run `npm test` to verify
   - If tests are failing, fix them first

2. ✅ **Feature implementation complete**
   - All code for the feature is written
   - Development and testing cycle complete

3. ✅ **Dev server must be running**
   - Check if server is running on http://localhost:5173
   - If not, start with: `npm run dev`

## E2E Verification Workflow

### Step 1: Identify Feature Type

What type of feature are you verifying?

**A. Form (login, signup, challenge creation)**
- Verify form fields render correctly
- Test input validation
- Verify submission and navigation
- Check error message display

**B. Authentication Flow**
- Test complete auth journey (signup/login → dashboard)
- Verify protected route access
- Test logout and session handling

**C. Navigation/Routing**
- Verify new routes are accessible
- Test navigation menu clicks
- Check conditional rendering (logged in/out states)

**D. API Integration (FPL API, Firebase)**
- Verify data fetching and display
- Test loading states
- Verify error handling for API failures

**E. Critical User Journey**
- Test complete user flow (multiple steps)
- Verify state persistence across navigation
- Test real-time updates if applicable

### Step 2: Execute E2E Tests

Use the following Playwright MCP tools to verify the feature:

#### Navigation
```
mcp__playwright__browser_navigate
url: http://localhost:5173/[your-route]
```

#### Capture Initial State
```
mcp__playwright__browser_snapshot
(Better than screenshots for actions)
```

#### Interact with UI
```
mcp__playwright__browser_click
element: [describe element]
ref: [exact selector from snapshot]

mcp__playwright__browser_type
element: [input field description]
ref: [exact selector]
text: [test value]

mcp__playwright__browser_fill_form
fields: [array of form fields]
```

#### Verify Results
```
mcp__playwright__browser_snapshot
(Capture state after interaction)

mcp__playwright__browser_console_messages
onlyErrors: true
(Check for console errors - CRITICAL!)
```

### Step 3: E2E Verification Checklist

Go through this checklist systematically:

- [ ] **Navigate to feature** - Page loads without errors
- [ ] **Verify initial UI state** - All elements render correctly
- [ ] **Test user interactions** - Clicks, typing, form submission work
- [ ] **Verify expected behavior** - Navigation, state changes, data display
- [ ] **Test error cases** - Invalid input, network failures (if applicable)
- [ ] **Check console errors** - Use `browser_console_messages({ onlyErrors: true })`
- [ ] **Verify loading states** - Spinners/skeletons appear/disappear correctly
- [ ] **Test responsive design** - Mobile viewport if needed

### Step 4: Common E2E Patterns

#### Pattern 1: Form Verification
```typescript
// 1. Navigate to form page
await browser_navigate('http://localhost:5173/login')
await browser_snapshot()

// 2. Fill form with valid data
await browser_fill_form([
  { name: 'email', type: 'textbox', ref: '[data-testid="email"]', value: 'test@example.com' },
  { name: 'password', type: 'textbox', ref: '[data-testid="password"]', value: 'Test123!' }
])

// 3. Submit
await browser_click({ element: 'Submit button', ref: 'button[type="submit"]' })

// 4. Verify navigation/result
await browser_snapshot()  // Capture result
const errors = await browser_console_messages({ onlyErrors: true })
// Verify no errors

// 5. Test validation (invalid input)
await browser_navigate('http://localhost:5173/login')
await browser_type({ element: 'Email', ref: '[data-testid="email"]', text: 'invalid-email' })
await browser_click({ element: 'Submit button', ref: 'button[type="submit"]' })
// Verify error message appears
```

#### Pattern 2: Navigation Verification
```typescript
// 1. Start at homepage
await browser_navigate('http://localhost:5173')
await browser_snapshot()

// 2. Click navigation item
await browser_click({ element: 'Dashboard link', ref: 'nav a[href="/dashboard"]' })

// 3. Verify new page loaded
await browser_wait_for({ text: 'Dashboard' })
await browser_snapshot()

// 4. Check console
const errors = await browser_console_messages({ onlyErrors: true })
```

#### Pattern 3: API Integration Verification
```typescript
// 1. Navigate to page with API data
await browser_navigate('http://localhost:5173/dashboard')

// 2. Wait for loading state to complete
await browser_wait_for({ time: 2 })  // Wait for API call

// 3. Verify data displayed
await browser_snapshot()

// 4. Check console for errors
const errors = await browser_console_messages({ onlyErrors: true })

// 5. Verify no network errors in console
```

### Step 5: Decision

After completing E2E verification:

**If all checks pass ✅:**
- Console has no errors
- Feature works as expected
- User flow is smooth
- **Ready to commit!**

**If issues found ❌:**
- Document the issues
- Go back to unit tests if logic is broken
- Fix UI/integration issues
- Re-run E2E verification

## Quick Tips

1. **Always check console errors** - Critical for production quality
2. **Use `browser_snapshot` liberally** - Captures accessibility tree + refs
3. **Test both happy path AND error cases** - Invalid input, network failures
4. **Verify loading states** - Important for UX quality
5. **Test mobile viewport** - Use `browser_resize` if needed

## When to Skip E2E Verification

You can skip E2E verification if:
- Pure utility function (no UI)
- Styling/CSS-only changes (no behavior change)
- Refactoring with no user-facing changes
- Type definitions or configuration files

## Done?

After successful E2E verification:
1. Document any findings
2. Commit your changes with confidence
3. Consider adding formal Playwright test in `/e2e` directory for critical flows

---

**Remember:** E2E tests verify the user experience, not just code correctness. Take your time and be thorough!
