-- Knockout FPL PostgreSQL Schema
-- Generated from Firebase Data Connect schema
-- Database: knockoutfpl-dev-database
-- Instance: knockoutfpl-dev-instance

-- Install required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- FPL RECORDS LAYER (Authoritative - must retain)
-- =============================================================================

-- Cached FPL manager/entry data with raw API response
CREATE TABLE "public"."entries" (
  "entry_id" integer NOT NULL,
  "cached_at" timestamptz NOT NULL,
  "name" text NOT NULL,
  "player_first_name" text NULL,
  "player_last_name" text NULL,
  "raw_json" text NOT NULL,
  "season" text NOT NULL,
  "summary_event_points" integer NULL,
  "summary_event_rank" integer NULL,
  "summary_overall_points" integer NULL,
  "summary_overall_rank" integer NULL,
  PRIMARY KEY ("entry_id")
);

-- =============================================================================
-- FPL CACHE LAYER (Can re-fetch from API)
-- =============================================================================

-- Cached FPL event/gameweek data
CREATE TABLE "public"."events" (
  "event" integer NOT NULL,
  "season" text NOT NULL,
  "cached_at" timestamptz NOT NULL,
  "deadline_time" timestamptz NOT NULL,
  "finished" boolean NOT NULL DEFAULT false,
  "is_current" boolean NOT NULL DEFAULT false,
  "is_next" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "raw_json" text NOT NULL,
  PRIMARY KEY ("event", "season")
);

-- Cached FPL classic league data with raw API response
CREATE TABLE "public"."leagues" (
  "league_id" integer NOT NULL,
  "season" text NOT NULL,
  "admin_entry" integer NULL,
  "cached_at" timestamptz NOT NULL,
  "created" timestamptz NULL,
  "name" text NOT NULL,
  "raw_json" text NOT NULL,
  PRIMARY KEY ("league_id", "season")
);

-- =============================================================================
-- USER LAYER
-- =============================================================================

-- Firebase Auth user accounts
CREATE TABLE "public"."user" (
  "uid" text NOT NULL,
  "created_at" timestamptz NOT NULL,
  "email" text NOT NULL,
  "entry_id_2025" integer NULL,
  "updated_at" timestamptz NOT NULL,
  PRIMARY KEY ("uid")
);

-- =============================================================================
-- TOURNAMENT LAYER
-- =============================================================================

-- Knockout tournaments
CREATE TABLE "public"."tournaments" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "creator_uid" text NOT NULL,
  "created_at" timestamptz NOT NULL,
  "current_round" integer NOT NULL DEFAULT 1,
  "fpl_league_id" integer NOT NULL,
  "fpl_league_name" text NOT NULL,
  "participant_count" integer NOT NULL,
  "seeding_method" text NOT NULL DEFAULT 'league_rank',
  "start_event" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "total_rounds" integer NOT NULL,
  "updated_at" timestamptz NOT NULL,
  "winner_entry_id" integer NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "tournaments_creator_uid_fkey" FOREIGN KEY ("creator_uid") REFERENCES "public"."user" ("uid") ON DELETE CASCADE
);

CREATE INDEX "tournaments_creatorUid_idx" ON "public"."tournaments" ("creator_uid");

-- Tournament rounds
CREATE TABLE "public"."rounds" (
  "tournament_id" uuid NOT NULL,
  "round_number" integer NOT NULL,
  "completed_at" timestamptz NULL,
  "event" integer NOT NULL,
  "started_at" timestamptz NULL,
  "status" text NOT NULL DEFAULT 'pending',
  PRIMARY KEY ("tournament_id", "round_number"),
  CONSTRAINT "rounds_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments" ("id") ON DELETE CASCADE
);

CREATE INDEX "rounds_tournamentId_idx" ON "public"."rounds" ("tournament_id");

-- Tournament participants (snapshot from league standings)
CREATE TABLE "public"."participants" (
  "tournament_id" uuid NOT NULL,
  "entry_id" integer NOT NULL,
  "entry_entry_id" integer NOT NULL,
  "user_uid" text NULL,
  "elimination_round" integer NULL,
  "league_points" integer NULL,
  "league_rank" integer NULL,
  "manager_name" text NOT NULL,
  "raw_json" text NOT NULL,
  "seed" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "team_name" text NOT NULL,
  "uid" text NULL,
  PRIMARY KEY ("tournament_id", "entry_id"),
  CONSTRAINT "participants_entry_entry_id_fkey" FOREIGN KEY ("entry_entry_id") REFERENCES "public"."entries" ("entry_id") ON DELETE CASCADE,
  CONSTRAINT "participants_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments" ("id") ON DELETE CASCADE,
  CONSTRAINT "participants_user_uid_fkey" FOREIGN KEY ("user_uid") REFERENCES "public"."user" ("uid") ON DELETE SET NULL
);

CREATE INDEX "participants_entryEntryId_idx" ON "public"."participants" ("entry_entry_id");
CREATE INDEX "participants_tournamentId_idx" ON "public"."participants" ("tournament_id");
CREATE INDEX "participants_userUid_idx" ON "public"."participants" ("user_uid");

-- Individual knockout matches
CREATE TABLE "public"."matches" (
  "tournament_id" uuid NOT NULL,
  "match_id" integer NOT NULL,
  "winner_entry_id" integer NULL,
  "completed_at" timestamptz NULL,
  "is_bye" boolean NOT NULL DEFAULT false,
  "position_in_round" integer NOT NULL,
  "qualifies_to_match_id" integer NULL,
  "round_number" integer NOT NULL,
  "status" text NOT NULL DEFAULT 'pending',
  PRIMARY KEY ("tournament_id", "match_id"),
  CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments" ("id") ON DELETE CASCADE,
  CONSTRAINT "matches_winner_entry_id_fkey" FOREIGN KEY ("winner_entry_id") REFERENCES "public"."entries" ("entry_id") ON DELETE SET NULL
);

CREATE INDEX "matches_tournamentId_idx" ON "public"."matches" ("tournament_id");
CREATE INDEX "matches_winnerEntryId_idx" ON "public"."matches" ("winner_entry_id");

-- Junction table linking matches to participants
CREATE TABLE "public"."match_picks" (
  "tournament_id" uuid NOT NULL,
  "match_id" integer NOT NULL,
  "entry_id" integer NOT NULL,
  "entry_entry_id" integer NOT NULL,
  "slot" integer NOT NULL,
  PRIMARY KEY ("tournament_id", "match_id", "entry_id"),
  CONSTRAINT "match_picks_entry_entry_id_fkey" FOREIGN KEY ("entry_entry_id") REFERENCES "public"."entries" ("entry_id") ON DELETE CASCADE
);

CREATE INDEX "match_picks_entryEntryId_idx" ON "public"."match_picks" ("entry_entry_id");

-- Cached event picks with raw API response
CREATE TABLE "public"."picks" (
  "entry_id" integer NOT NULL,
  "event" integer NOT NULL,
  "entry_entry_id" integer NOT NULL,
  "active_chip" text NULL,
  "cached_at" timestamptz NOT NULL,
  "event_transfers_cost" integer NULL DEFAULT 0,
  "is_final" boolean NOT NULL DEFAULT false,
  "overall_rank" integer NULL,
  "points" integer NOT NULL,
  "rank" integer NULL,
  "raw_json" text NOT NULL,
  "total_points" integer NULL,
  PRIMARY KEY ("entry_id", "event"),
  CONSTRAINT "picks_entry_entry_id_fkey" FOREIGN KEY ("entry_entry_id") REFERENCES "public"."entries" ("entry_id") ON DELETE CASCADE
);

CREATE INDEX "picks_entryEntryId_idx" ON "public"."picks" ("entry_entry_id");
