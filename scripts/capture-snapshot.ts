#!/usr/bin/env npx tsx
/**
 * Local FPL Snapshot Capture Script
 *
 * Captures FPL API data directly (no Firebase required).
 * Useful for quickly capturing test data during development.
 *
 * Usage:
 *   npx tsx scripts/capture-snapshot.ts
 *   npx tsx scripts/capture-snapshot.ts --output=my-snapshot.json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';
const FLOAWO_LEAGUE_ID = 634129;

interface BootstrapEvent {
  id: number;
  name: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  deadline_time: string;
}

interface Fixture {
  id: number;
  event: number;
  started: boolean;
  finished: boolean;
  team_h: number;
  team_a: number;
  team_h_score: number | null;
  team_a_score: number | null;
}

interface LeagueEntry {
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  total: number;
}

interface PicksEntryHistory {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  overall_rank: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

interface PicksResponse {
  picks: any[];
  entry_history: PicksEntryHistory;
  active_chip: string | null;
}

interface HistoryEvent {
  event: number;
  points: number;
  total_points: number;
  rank: number;
  overall_rank: number;
}

async function fetchJSON<T>(url: string): Promise<T> {
  console.log(`  Fetching: ${url.replace(FPL_API_BASE, '')}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`FPL API error: ${response.status} for ${url}`);
  }
  return response.json() as Promise<T>;
}

function determineGameweekStatus(fixtures: Fixture[]): 'not_started' | 'in_progress' | 'finished' {
  if (fixtures.length === 0) return 'not_started';
  if (fixtures.every(f => f.finished)) return 'finished';
  if (fixtures.some(f => f.started)) return 'in_progress';
  return 'not_started';
}

async function captureSnapshot() {
  console.log('🔄 Capturing FPL snapshot...\n');

  // 1. Get bootstrap data (current gameweek)
  console.log('📊 Fetching bootstrap data...');
  const bootstrap = await fetchJSON<{ events: BootstrapEvent[] }>(`${FPL_API_BASE}/bootstrap-static/`);
  const currentEvent = bootstrap.events.find(e => e.is_current);

  if (!currentEvent) {
    throw new Error('No current gameweek found');
  }

  const gameweek = currentEvent.id;
  console.log(`  Current gameweek: ${gameweek} (${currentEvent.name})`);
  console.log(`  Finished: ${currentEvent.finished}`);

  // 2. Get fixtures for current gameweek
  console.log('\n📅 Fetching fixtures...');
  const fixtures = await fetchJSON<Fixture[]>(`${FPL_API_BASE}/fixtures/?event=${gameweek}`);
  const status = determineGameweekStatus(fixtures);
  console.log(`  Status: ${status}`);
  console.log(`  Fixtures: ${fixtures.filter(f => f.finished).length}/${fixtures.length} finished`);

  // 3. Get league standings
  console.log('\n🏆 Fetching league standings...');
  const standings = await fetchJSON<{ league: { name: string }; standings: { results: LeagueEntry[] } }>(
    `${FPL_API_BASE}/leagues-classic/${FLOAWO_LEAGUE_ID}/standings/`
  );
  console.log(`  League: ${standings.league.name}`);
  console.log(`  Participants: ${standings.standings.results.length}`);

  // 4. Get picks for each entry (current GW and previous completed GW)
  console.log('\n👥 Fetching entry data...');
  const entryData: Record<number, {
    entry: { id: number; name: string; player_name: string };
    history: HistoryEvent[];
    picks: Record<number, PicksResponse>;
  }> = {};

  const previousGW = gameweek - 1;

  for (const entry of standings.standings.results) {
    console.log(`  Entry ${entry.entry} (${entry.entry_name})...`);

    // Get history for all past GWs
    const historyResponse = await fetchJSON<{ current: HistoryEvent[] }>(
      `${FPL_API_BASE}/entry/${entry.entry}/history/`
    );

    const picks: Record<number, PicksResponse> = {};

    // Get current GW picks
    try {
      picks[gameweek] = await fetchJSON<PicksResponse>(
        `${FPL_API_BASE}/entry/${entry.entry}/event/${gameweek}/picks/`
      );
    } catch (e) {
      console.log(`    ⚠️ No picks for GW${gameweek}`);
    }

    // Get previous GW picks (completed)
    if (previousGW > 0) {
      try {
        picks[previousGW] = await fetchJSON<PicksResponse>(
          `${FPL_API_BASE}/entry/${entry.entry}/event/${previousGW}/picks/`
        );
      } catch (e) {
        console.log(`    ⚠️ No picks for GW${previousGW}`);
      }
    }

    entryData[entry.entry] = {
      entry: {
        id: entry.entry,
        name: entry.entry_name,
        player_name: entry.player_name,
      },
      history: historyResponse.current,
      picks,
    };
  }

  // 5. Assemble snapshot
  const capturedAt = new Date().toISOString();

  const snapshot = {
    capturedAt,
    gameweek,
    gameweekStatus: status,
    leagueId: FLOAWO_LEAGUE_ID,
    currentEvent,
    fixtures: fixtures.map(f => ({
      id: f.id,
      event: f.event,
      started: f.started,
      finished: f.finished,
      team_h: f.team_h,
      team_a: f.team_a,
      team_h_score: f.team_h_score,
      team_a_score: f.team_a_score,
    })),
    leagueStandings: standings.standings.results,
    entryData,
  };

  return snapshot;
}

async function main() {
  try {
    const snapshot = await captureSnapshot();

    // Generate filename
    const timestamp = snapshot.capturedAt.slice(0, 16).replace(':', '-').replace('T', 'T');
    const filename = `gw${snapshot.gameweek}-${timestamp}.json`;

    // Ensure directory exists
    const snapshotsDir = resolve(process.cwd(), 'test-fixtures', 'snapshots');
    if (!existsSync(snapshotsDir)) {
      mkdirSync(snapshotsDir, { recursive: true });
    }

    const filePath = join(snapshotsDir, filename);
    writeFileSync(filePath, JSON.stringify(snapshot, null, 2));

    console.log('\n✅ Snapshot captured successfully!');
    console.log(`\n📁 File: ${filePath}`);
    console.log(`📅 Gameweek: ${snapshot.gameweek}`);
    console.log(`📊 Status: ${snapshot.gameweekStatus}`);
    console.log(`👥 Entries: ${Object.keys(snapshot.entryData).length}`);

    // Summary of picks data captured
    const gwPicksCounts: Record<number, number> = {};
    for (const entry of Object.values(snapshot.entryData)) {
      for (const gw of Object.keys(entry.picks)) {
        gwPicksCounts[Number(gw)] = (gwPicksCounts[Number(gw)] || 0) + 1;
      }
    }
    console.log('\n📊 Picks captured:');
    for (const [gw, count] of Object.entries(gwPicksCounts).sort((a, b) => Number(a[0]) - Number(b[0]))) {
      console.log(`   GW${gw}: ${count} entries`);
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
