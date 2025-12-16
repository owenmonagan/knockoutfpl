# Phase 2: User Profile & FPL Connection - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the user profile page with FPL team display/editing and display name editing, then add E2E test coverage for the profile and FPL connection flows.

**Architecture:** ProfilePage will be refactored to fetch user profile from Firestore and FPL data from the API, then render FPLConnectionCard (which already supports 3 states: not connected, connected, editing) plus a new ProfileForm component for display name editing. All state management happens in ProfilePage; child components receive data via props.

**Tech Stack:** React 18, TypeScript, Vitest, Playwright, Firebase Firestore, FPL API via Vite proxy

---

## Prerequisites

Before starting:
```bash
# Terminal 1: Start test watcher
npm run test:watch

# Terminal 2: Start dev server
npm run dev
```

---

## Task 1: ProfilePage - Fetch User Profile from Firestore

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Test: `src/pages/ProfilePage.test.tsx`

### Step 1: Write failing test for user profile loading

```typescript
// In src/pages/ProfilePage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProfilePage } from './ProfilePage';
import { AuthContext } from '../contexts/AuthContext';
import * as userService from '../services/user';

// Mock the user service
vi.mock('../services/user');

const mockAuthUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

const mockAuthContext = {
  user: mockAuthUser,
  loading: false,
  isAuthenticated: true,
  connectionError: false,
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches user profile on mount', async () => {
    const mockGetUserProfile = vi.mocked(userService.getUserProfile);
    mockGetUserProfile.mockResolvedValue({
      userId: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      fplTeamId: 158256,
      fplTeamName: 'Test FC',
      wins: 0,
      losses: 0,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
    });

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <ProfilePage />
      </AuthContext.Provider>
    );

    expect(mockGetUserProfile).toHaveBeenCalledWith('test-user-123');
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: FAIL - ProfilePage doesn't call getUserProfile

### Step 3: Implement user profile fetching

```typescript
// In src/pages/ProfilePage.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/user';
import { Skeleton } from '../components/ui/skeleton';
import type { User } from '../types/user';

export function ProfilePage() {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!authUser?.uid) return;

      setIsLoading(true);
      try {
        const profile = await getUserProfile(authUser.uid);
        setUserProfile(profile);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [authUser?.uid]);

  if (!authUser || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      {/* Will add FPLConnectionCard next */}
    </main>
  );
}
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/pages/ProfilePage.tsx src/pages/ProfilePage.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): fetch user profile from Firestore on mount

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: ProfilePage - Fetch FPL Data When Connected

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Test: `src/pages/ProfilePage.test.tsx`

### Step 1: Write failing test for FPL data fetching

```typescript
// Add to src/pages/ProfilePage.test.tsx
import * as fplService from '../services/fpl';

vi.mock('../services/fpl');

it('fetches FPL data when user has fplTeamId', async () => {
  const mockGetUserProfile = vi.mocked(userService.getUserProfile);
  const mockGetFPLTeamInfo = vi.mocked(fplService.getFPLTeamInfo);

  mockGetUserProfile.mockResolvedValue({
    userId: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    fplTeamId: 158256,
    fplTeamName: 'Test FC',
    wins: 0,
    losses: 0,
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
  });

  mockGetFPLTeamInfo.mockResolvedValue({
    teamId: 158256,
    teamName: 'Test FC',
    managerName: 'Test Manager',
    gameweekPoints: 65,
    gameweekRank: 500000,
    overallPoints: 450,
    overallRank: 100000,
    teamValue: 102.5,
  });

  render(
    <AuthContext.Provider value={mockAuthContext}>
      <ProfilePage />
    </AuthContext.Provider>
  );

  await waitFor(() => {
    expect(mockGetFPLTeamInfo).toHaveBeenCalledWith(158256);
  });
});

it('does not fetch FPL data when fplTeamId is 0', async () => {
  const mockGetUserProfile = vi.mocked(userService.getUserProfile);
  const mockGetFPLTeamInfo = vi.mocked(fplService.getFPLTeamInfo);

  mockGetUserProfile.mockResolvedValue({
    userId: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    fplTeamId: 0,
    fplTeamName: '',
    wins: 0,
    losses: 0,
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
  });

  render(
    <AuthContext.Provider value={mockAuthContext}>
      <ProfilePage />
    </AuthContext.Provider>
  );

  await waitFor(() => {
    expect(mockGetUserProfile).toHaveBeenCalled();
  });

  expect(mockGetFPLTeamInfo).not.toHaveBeenCalled();
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: FAIL - getFPLTeamInfo not called

### Step 3: Implement FPL data fetching

```typescript
// In src/pages/ProfilePage.tsx - add to imports
import { getFPLTeamInfo, type FPLTeamInfo } from '../services/fpl';

// Add state for FPL data
const [fplData, setFplData] = useState<FPLTeamInfo | null>(null);
const [fplLoading, setFplLoading] = useState(false);

// Add effect to fetch FPL data when userProfile changes
useEffect(() => {
  async function fetchFplData() {
    if (!userProfile || userProfile.fplTeamId === 0) return;

    setFplLoading(true);
    try {
      const data = await getFPLTeamInfo(userProfile.fplTeamId);
      setFplData(data);
    } finally {
      setFplLoading(false);
    }
  }

  fetchFplData();
}, [userProfile?.fplTeamId]);
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/pages/ProfilePage.tsx src/pages/ProfilePage.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): fetch FPL data when user has connected team

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: ProfilePage - Render FPLConnectionCard

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Test: `src/pages/ProfilePage.test.tsx`

### Step 1: Write failing test for FPLConnectionCard rendering

```typescript
// Add to src/pages/ProfilePage.test.tsx
it('renders FPLConnectionCard with user and FPL data', async () => {
  const mockGetUserProfile = vi.mocked(userService.getUserProfile);
  const mockGetFPLTeamInfo = vi.mocked(fplService.getFPLTeamInfo);

  mockGetUserProfile.mockResolvedValue({
    userId: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    fplTeamId: 158256,
    fplTeamName: 'Test FC',
    wins: 0,
    losses: 0,
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
  });

  mockGetFPLTeamInfo.mockResolvedValue({
    teamId: 158256,
    teamName: 'Test FC',
    managerName: 'Test Manager',
    gameweekPoints: 65,
    gameweekRank: 500000,
    overallPoints: 450,
    overallRank: 100000,
    teamValue: 102.5,
  });

  render(
    <AuthContext.Provider value={mockAuthContext}>
      <ProfilePage />
    </AuthContext.Provider>
  );

  // FPLConnectionCard shows team name as title when connected
  await waitFor(() => {
    expect(screen.getByText('Test FC')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: FAIL - FPLConnectionCard not rendered

### Step 3: Implement FPLConnectionCard rendering

```typescript
// In src/pages/ProfilePage.tsx - add to imports
import { FPLConnectionCard } from '../components/dashboard/FPLConnectionCard';
import { connectFPLTeam, updateUserProfile } from '../services/user';

// Add error state
const [error, setError] = useState<string | null>(null);

// Add handlers
const handleConnect = async (teamId: number) => {
  if (!authUser?.uid) return;
  setError(null);
  try {
    await connectFPLTeam(authUser.uid, teamId);
    // Refresh profile after connect
    const profile = await getUserProfile(authUser.uid);
    setUserProfile(profile);
  } catch (e) {
    setError('Failed to connect team. Please check the ID and try again.');
  }
};

const handleUpdate = async (teamId: number) => {
  if (!authUser?.uid) return;
  setError(null);
  try {
    await connectFPLTeam(authUser.uid, teamId);
    // Refresh profile after update
    const profile = await getUserProfile(authUser.uid);
    setUserProfile(profile);
  } catch (e) {
    setError('Failed to update team. Please check the ID and try again.');
  }
};

const handleClearError = () => setError(null);

// In return statement, replace placeholder with:
return (
  <main className="container mx-auto px-4 py-8 space-y-6">
    <h1 className="text-2xl font-bold">Profile</h1>

    <FPLConnectionCard
      user={userProfile}
      fplData={fplData}
      isLoading={fplLoading}
      error={error}
      onConnect={handleConnect}
      onUpdate={handleUpdate}
      onClearError={handleClearError}
    />
  </main>
);
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/pages/ProfilePage.tsx src/pages/ProfilePage.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): render FPLConnectionCard with connect/update handlers

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: ProfileForm Component - Display Name Editing

**Files:**
- Create: `src/components/profile/ProfileForm.tsx`
- Create: `src/components/profile/ProfileForm.test.tsx`

### Step 1: Write failing test for ProfileForm rendering

```typescript
// In src/components/profile/ProfileForm.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';

describe('ProfileForm', () => {
  const defaultProps = {
    displayName: 'Test User',
    email: 'test@example.com',
    onUpdateDisplayName: vi.fn(),
    isLoading: false,
  };

  it('renders the component', () => {
    render(<ProfileForm {...defaultProps} />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: FAIL - Component doesn't exist

### Step 3: Create minimal ProfileForm component

```typescript
// In src/components/profile/ProfileForm.tsx
import { Card } from '../ui/card';

export interface ProfileFormProps {
  displayName: string;
  email: string;
  onUpdateDisplayName: (name: string) => Promise<void>;
  isLoading: boolean;
}

export function ProfileForm(props: ProfileFormProps) {
  return <Card role="article"></Card>;
}
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/profile/ProfileForm.tsx src/components/profile/ProfileForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): create ProfileForm component scaffold

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: ProfileForm - Show Title and Email

**Files:**
- Modify: `src/components/profile/ProfileForm.tsx`
- Modify: `src/components/profile/ProfileForm.test.tsx`

### Step 1: Write failing test for title

```typescript
// Add to src/components/profile/ProfileForm.test.tsx
it('shows "Account Details" title', () => {
  render(<ProfileForm {...defaultProps} />);
  expect(screen.getByText('Account Details')).toBeInTheDocument();
});

it('shows user email', () => {
  render(<ProfileForm {...defaultProps} />);
  expect(screen.getByText('test@example.com')).toBeInTheDocument();
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: FAIL - No title or email shown

### Step 3: Implement title and email display

```typescript
// In src/components/profile/ProfileForm.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

export function ProfileForm({ displayName, email, onUpdateDisplayName, isLoading }: ProfileFormProps) {
  return (
    <Card role="article">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Display name editing will go here */}
      </CardContent>
    </Card>
  );
}
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/profile/ProfileForm.tsx src/components/profile/ProfileForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add title and email display to ProfileForm

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: ProfileForm - Display Name Field (View Mode)

**Files:**
- Modify: `src/components/profile/ProfileForm.tsx`
- Modify: `src/components/profile/ProfileForm.test.tsx`

### Step 1: Write failing test for display name field

```typescript
// Add to src/components/profile/ProfileForm.test.tsx
it('shows display name label', () => {
  render(<ProfileForm {...defaultProps} />);
  expect(screen.getByText('Display Name')).toBeInTheDocument();
});

it('shows current display name', () => {
  render(<ProfileForm {...defaultProps} />);
  expect(screen.getByText('Test User')).toBeInTheDocument();
});

it('shows Edit button', () => {
  render(<ProfileForm {...defaultProps} />);
  expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: FAIL - Display name and edit button not shown

### Step 3: Implement display name field in view mode

```typescript
// In src/components/profile/ProfileForm.tsx - update CardContent
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export function ProfileForm({ displayName, email, onUpdateDisplayName, isLoading }: ProfileFormProps) {
  return (
    <Card role="article">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Display Name</Label>
              <p className="text-sm">{displayName}</p>
            </div>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/profile/ProfileForm.tsx src/components/profile/ProfileForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add display name field in view mode

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: ProfileForm - Edit Mode Toggle

**Files:**
- Modify: `src/components/profile/ProfileForm.tsx`
- Modify: `src/components/profile/ProfileForm.test.tsx`

### Step 1: Write failing test for edit mode

```typescript
// Add to src/components/profile/ProfileForm.test.tsx
import userEvent from '@testing-library/user-event';

it('shows input field when Edit is clicked', async () => {
  const user = userEvent.setup();
  render(<ProfileForm {...defaultProps} />);

  await user.click(screen.getByRole('button', { name: /edit/i }));

  expect(screen.getByRole('textbox')).toBeInTheDocument();
});

it('pre-fills input with current display name', async () => {
  const user = userEvent.setup();
  render(<ProfileForm {...defaultProps} />);

  await user.click(screen.getByRole('button', { name: /edit/i }));

  expect(screen.getByRole('textbox')).toHaveValue('Test User');
});

it('shows Save and Cancel buttons in edit mode', async () => {
  const user = userEvent.setup();
  render(<ProfileForm {...defaultProps} />);

  await user.click(screen.getByRole('button', { name: /edit/i }));

  expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: FAIL - No edit mode implemented

### Step 3: Implement edit mode toggle

```typescript
// In src/components/profile/ProfileForm.tsx
import { useState } from 'react';
import { Input } from '../ui/input';

export function ProfileForm({ displayName, email, onUpdateDisplayName, isLoading }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(displayName);

  const handleEditClick = () => {
    setEditedName(displayName);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedName(displayName);
  };

  return (
    <Card role="article">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm">Save</Button>
                <Button variant="outline" size="sm" onClick={handleCancelClick}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Display Name</Label>
                <p className="text-sm">{displayName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/profile/ProfileForm.tsx src/components/profile/ProfileForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add edit mode toggle for display name

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: ProfileForm - Save Display Name

**Files:**
- Modify: `src/components/profile/ProfileForm.tsx`
- Modify: `src/components/profile/ProfileForm.test.tsx`

### Step 1: Write failing test for save functionality

```typescript
// Add to src/components/profile/ProfileForm.test.tsx
it('calls onUpdateDisplayName when Save is clicked', async () => {
  const user = userEvent.setup();
  const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

  render(<ProfileForm {...defaultProps} onUpdateDisplayName={mockOnUpdate} />);

  await user.click(screen.getByRole('button', { name: /edit/i }));
  await user.clear(screen.getByRole('textbox'));
  await user.type(screen.getByRole('textbox'), 'New Name');
  await user.click(screen.getByRole('button', { name: /save/i }));

  expect(mockOnUpdate).toHaveBeenCalledWith('New Name');
});

it('exits edit mode after successful save', async () => {
  const user = userEvent.setup();
  const mockOnUpdate = vi.fn().mockResolvedValue(undefined);

  render(<ProfileForm {...defaultProps} onUpdateDisplayName={mockOnUpdate} />);

  await user.click(screen.getByRole('button', { name: /edit/i }));
  await user.click(screen.getByRole('button', { name: /save/i }));

  await waitFor(() => {
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});

it('shows loading state while saving', async () => {
  const user = userEvent.setup();
  let resolvePromise: () => void;
  const mockOnUpdate = vi.fn().mockImplementation(() => {
    return new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
  });

  render(<ProfileForm {...defaultProps} onUpdateDisplayName={mockOnUpdate} />);

  await user.click(screen.getByRole('button', { name: /edit/i }));
  await user.click(screen.getByRole('button', { name: /save/i }));

  expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

  resolvePromise!();
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: FAIL - Save doesn't call onUpdateDisplayName

### Step 3: Implement save functionality

```typescript
// In src/components/profile/ProfileForm.tsx
export function ProfileForm({ displayName, email, onUpdateDisplayName, isLoading }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = () => {
    setEditedName(displayName);
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedName(displayName);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onUpdateDisplayName(editedName);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card role="article">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveClick} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancelClick} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Display Name</Label>
                <p className="text-sm">{displayName}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/components/profile/ProfileForm.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/components/profile/ProfileForm.tsx src/components/profile/ProfileForm.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): implement save display name functionality

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: ProfilePage - Add ProfileForm

**Files:**
- Modify: `src/pages/ProfilePage.tsx`
- Modify: `src/pages/ProfilePage.test.tsx`

### Step 1: Write failing test for ProfileForm in ProfilePage

```typescript
// Add to src/pages/ProfilePage.test.tsx
it('renders ProfileForm with user data', async () => {
  const mockGetUserProfile = vi.mocked(userService.getUserProfile);
  mockGetUserProfile.mockResolvedValue({
    userId: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    fplTeamId: 0,
    fplTeamName: '',
    wins: 0,
    losses: 0,
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
  });

  render(
    <AuthContext.Provider value={mockAuthContext}>
      <ProfilePage />
    </AuthContext.Provider>
  );

  await waitFor(() => {
    expect(screen.getByText('Account Details')).toBeInTheDocument();
  });
});
```

### Step 2: Run test to verify it fails

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: FAIL - ProfileForm not rendered

### Step 3: Add ProfileForm to ProfilePage

```typescript
// In src/pages/ProfilePage.tsx - add import
import { ProfileForm } from '../components/profile/ProfileForm';

// Add handler
const handleUpdateDisplayName = async (name: string) => {
  if (!authUser?.uid) return;
  await updateUserProfile(authUser.uid, { displayName: name });
  // Refresh profile
  const profile = await getUserProfile(authUser.uid);
  setUserProfile(profile);
};

// Add ProfileForm to return statement
return (
  <main className="container mx-auto px-4 py-8 space-y-6">
    <h1 className="text-2xl font-bold">Profile</h1>

    <ProfileForm
      displayName={userProfile?.displayName ?? ''}
      email={userProfile?.email ?? authUser?.email ?? ''}
      onUpdateDisplayName={handleUpdateDisplayName}
      isLoading={false}
    />

    <FPLConnectionCard
      user={userProfile}
      fplData={fplData}
      isLoading={fplLoading}
      error={error}
      onConnect={handleConnect}
      onUpdate={handleUpdate}
      onClearError={handleClearError}
    />
  </main>
);
```

### Step 4: Run test to verify it passes

Run: `npm run test -- src/pages/ProfilePage.test.tsx`
Expected: PASS

### Step 5: Commit

```bash
git add src/pages/ProfilePage.tsx src/pages/ProfilePage.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add ProfileForm to ProfilePage with display name editing

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Remove Old FPLTeamConnect Component

**Files:**
- Delete: `src/components/profile/FPLTeamConnect.tsx`
- Delete: `src/components/profile/FPLTeamConnect.test.tsx`
- Modify: `src/pages/ProfilePage.tsx` (already done - just verify no imports)

### Step 1: Verify FPLTeamConnect is no longer imported

```bash
grep -r "FPLTeamConnect" src/
```
Expected: No results from ProfilePage.tsx

### Step 2: Delete old component files

```bash
rm src/components/profile/FPLTeamConnect.tsx
rm src/components/profile/FPLTeamConnect.test.tsx
```

### Step 3: Run all tests to verify nothing is broken

Run: `npm run test`
Expected: All tests pass

### Step 4: Commit

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor(profile): remove deprecated FPLTeamConnect component

FPLConnectionCard now handles all FPL team connection functionality

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: E2E Test - Profile Page Load

**Files:**
- Create: `e2e/profile.spec.ts`

### Step 1: Create E2E test file with profile page load test

```typescript
// In e2e/profile.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login with test user
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Wait for redirect (either to /connect or /leagues depending on state)
    await page.waitForURL(/\/(connect|leagues|dashboard)/);
  });

  test('loads profile page @profile @smoke', async ({ page }) => {
    await page.goto('/profile');

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText('Account Details')).toBeVisible();
  });
});
```

### Step 2: Run E2E test

Run: `npm run test:e2e -- --grep @profile`
Expected: PASS

### Step 3: Commit

```bash
git add e2e/profile.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): add profile page load smoke test

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: E2E Test - Display Name Editing

**Files:**
- Modify: `e2e/profile.spec.ts`

### Step 1: Add display name editing E2E test

```typescript
// Add to e2e/profile.spec.ts
test('can edit display name @profile', async ({ page }) => {
  await page.goto('/profile');

  // Click Edit button in Account Details section
  const accountSection = page.locator('article').filter({ hasText: 'Account Details' });
  await accountSection.getByRole('button', { name: /edit/i }).click();

  // Verify input appears
  const input = accountSection.getByRole('textbox');
  await expect(input).toBeVisible();

  // Clear and type new name
  await input.clear();
  await input.fill('Updated Test User');

  // Save
  await accountSection.getByRole('button', { name: /save/i }).click();

  // Verify edit mode exits and new name shows
  await expect(input).not.toBeVisible();
  await expect(accountSection.getByText('Updated Test User')).toBeVisible();
});

test('can cancel display name edit @profile', async ({ page }) => {
  await page.goto('/profile');

  const accountSection = page.locator('article').filter({ hasText: 'Account Details' });
  await accountSection.getByRole('button', { name: /edit/i }).click();

  const input = accountSection.getByRole('textbox');
  const originalName = await input.inputValue();

  await input.clear();
  await input.fill('Should Not Save');

  // Cancel
  await accountSection.getByRole('button', { name: /cancel/i }).click();

  // Verify original name is still shown
  await expect(input).not.toBeVisible();
  await expect(accountSection.getByText(originalName)).toBeVisible();
});
```

### Step 2: Run E2E tests

Run: `npm run test:e2e -- --grep @profile`
Expected: PASS

### Step 3: Commit

```bash
git add e2e/profile.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): add display name editing tests

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: E2E Test - FPL Connection from Profile

**Files:**
- Modify: `e2e/profile.spec.ts`

### Step 1: Add FPL connection E2E test

```typescript
// Add to e2e/profile.spec.ts
test('shows FPL connection card on profile @profile', async ({ page }) => {
  await page.goto('/profile');

  // FPLConnectionCard should be visible
  // If connected, shows team name; if not, shows "Connect Your FPL Team"
  const fplSection = page.locator('article').filter({
    hasText: /(Connect Your FPL Team|Your FPL Team)/
  });
  await expect(fplSection).toBeVisible();
});

test('can update FPL team from profile @profile', async ({ page }) => {
  await page.goto('/profile');

  const fplSection = page.locator('article').filter({
    hasText: /(Connect Your FPL Team|Your FPL Team)/
  });

  // If already connected, click Edit
  const editButton = fplSection.getByRole('button', { name: /edit/i });
  if (await editButton.isVisible()) {
    await editButton.click();
  }

  // Enter a valid team ID
  const input = fplSection.getByRole('textbox');
  await input.clear();
  await input.fill('158256');

  // Click Connect or Update
  const actionButton = fplSection.getByRole('button', { name: /(connect|update)/i });
  await actionButton.click();

  // Wait for success - card should show team stats
  await expect(fplSection.getByText('GW Points')).toBeVisible({ timeout: 10000 });
});
```

### Step 2: Run E2E tests

Run: `npm run test:e2e -- --grep @profile`
Expected: PASS

### Step 3: Commit

```bash
git add e2e/profile.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): add FPL connection tests for profile page

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: E2E Test - Connect Page Flow

**Files:**
- Create: `e2e/connect.spec.ts`

### Step 1: Create connect page E2E tests

```typescript
// In e2e/connect.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Connect Page', () => {
  test.beforeEach(async ({ page }) => {
    // Note: This test requires a fresh user without FPL connection
    // For now, we test the page structure
  });

  test('shows connect form for users without FPL team @connect @smoke', async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    // Navigate to connect page
    await page.goto('/connect');

    // Should show connect form
    await expect(page.getByRole('heading', { name: /connect your fpl team/i })).toBeVisible();
    await expect(page.getByLabel(/fpl team id/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /find my team/i })).toBeVisible();
  });

  test('has help dialog for finding team ID @connect', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.goto('/connect');

    // Click help link
    await page.getByText(/where.*team id/i).click();

    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/finding your team id/i)).toBeVisible();
  });

  test('validates team ID and shows error @connect', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('testuser@knockoutfpl.com');
    await page.getByLabel('Password').fill('TestPass123!');
    await page.getByRole('button', { name: /log in/i }).click();

    await page.goto('/connect');

    // Enter invalid team ID
    await page.getByLabel(/fpl team id/i).fill('999');
    await page.getByRole('button', { name: /find my team/i }).click();

    // Should show error (team not found)
    await expect(page.getByText(/team not found/i)).toBeVisible({ timeout: 10000 });
  });
});
```

### Step 2: Run E2E tests

Run: `npm run test:e2e -- --grep @connect`
Expected: PASS

### Step 3: Commit

```bash
git add e2e/connect.spec.ts
git commit -m "$(cat <<'EOF'
test(e2e): add connect page flow tests

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Update PRODUCT.md - Mark Phase 2 Complete

**Files:**
- Modify: `PRODUCT.md`

### Step 1: Update Phase 2 checklist in PRODUCT.md

Update the Phase 2 section to show all items complete:

```markdown
### ✅ Phase 2: User Profile & FPL Connection (COMPLETED)
- ✅ Firebase Auth UI (sign up/login) - completed in Phase 1
- ✅ Protected routes - completed in Phase 1
- ✅ FPL Team ID connection flow (input validation, team verification)
- ✅ User profile page with connected FPL team display
- ✅ Update user document with FPL team info in Firestore
- ✅ Fetch and display FPL team name from API
- ✅ Profile edit functionality (change display name, update FPL ID)
- ✅ E2E tests for profile and FPL connection flow
```

### Step 2: Commit

```bash
git add PRODUCT.md
git commit -m "$(cat <<'EOF'
docs: mark Phase 2 (User Profile & FPL Connection) as complete

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Summary

**Tasks Completed:**
1. ProfilePage fetches user profile from Firestore
2. ProfilePage fetches FPL data when connected
3. ProfilePage renders FPLConnectionCard
4. ProfileForm component created (scaffold)
5. ProfileForm shows title and email
6. ProfileForm shows display name in view mode
7. ProfileForm edit mode toggle
8. ProfileForm save display name
9. ProfilePage includes ProfileForm
10. Remove deprecated FPLTeamConnect
11. E2E test - profile page load
12. E2E test - display name editing
13. E2E test - FPL connection from profile
14. E2E test - connect page flow
15. Update PRODUCT.md

**Files Changed:**
- `src/pages/ProfilePage.tsx` (refactored)
- `src/pages/ProfilePage.test.tsx` (expanded)
- `src/components/profile/ProfileForm.tsx` (new)
- `src/components/profile/ProfileForm.test.tsx` (new)
- `src/components/profile/FPLTeamConnect.tsx` (deleted)
- `src/components/profile/FPLTeamConnect.test.tsx` (deleted)
- `e2e/profile.spec.ts` (new)
- `e2e/connect.spec.ts` (new)
- `PRODUCT.md` (updated)

**Total Commits:** 15
