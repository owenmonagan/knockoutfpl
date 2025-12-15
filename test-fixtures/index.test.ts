/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { FPLSnapshot } from '../src/types/fpl-snapshot';

// Create hoisted mocks
const mockFsExports = vi.hoisted(() => ({
  default: {},
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// Mock fs module with hoisted functions
vi.mock('fs', () => mockFsExports);

// Import after mocking
import { loadScenario, loadSnapshot, listScenarios, listSnapshots } from './index';

const { existsSync, readFileSync, readdirSync } = mockFsExports;

describe('Fixture Loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadScenario', () => {
    it('loads a scenario by name', () => {
      const mockSnapshot: FPLSnapshot = {
        capturedAt: '2025-12-15T14:00:00Z',
        gameweek: 16,
        gameweekStatus: 'finished',
        leagueId: 634129,
        bootstrapStatic: { events: [], teams: [], elements: [], element_types: [] },
        fixtures: [],
        fixturesCurrentGW: [],
        liveScores: null,
        eventStatus: { status: [] },
        dreamTeam: null,
        setPieceNotes: { teams: [] },
        leagueStandings: { league: { id: 634129, name: 'FLOAWO' }, standings: { results: [] } },
        teamData: {},
        playerSummaries: {},
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockSnapshot));

      const result = loadScenario('gw-finished');

      expect(result.gameweek).toBe(16);
      expect(result.gameweekStatus).toBe('finished');
    });

    it('throws when scenario not found', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(() => loadScenario('nonexistent')).toThrow('Scenario not found');
    });
  });

  describe('listScenarios', () => {
    it('returns list of available scenarios', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue(['gw-finished.json', 'gw-in-progress.json', '.gitkeep'] as any);
      const result = listScenarios();
      expect(result).toEqual(['gw-finished', 'gw-in-progress']);
    });
  });

  describe('listSnapshots', () => {
    it('returns list of downloaded snapshots', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue(['gw16-2025-12-15T14-00.json', 'gw16-2025-12-15T15-00.json', '.gitkeep'] as any);
      const result = listSnapshots();
      expect(result).toEqual(['gw16-2025-12-15T14-00', 'gw16-2025-12-15T15-00']);
    });
  });
});
