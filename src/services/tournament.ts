// src/services/tournament.ts
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Tournament } from '../types/tournament';

const TOURNAMENTS_COLLECTION = 'tournaments';

export async function getTournamentByLeague(leagueId: number): Promise<Tournament | null> {
  const tournamentsRef = collection(db, TOURNAMENTS_COLLECTION);
  const q = query(tournamentsRef, where('fplLeagueId', '==', leagueId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Tournament;
}

export interface CreateTournamentData {
  fplLeagueId: number;
  fplLeagueName: string;
  creatorUserId: string;
  startGameweek: number;
  currentRound: number;
  totalRounds: number;
  status: 'active' | 'completed';
  participants: Tournament['participants'];
  rounds: Tournament['rounds'];
  winnerId: number | null;
}

export async function createTournament(data: CreateTournamentData): Promise<Tournament> {
  const tournamentsRef = collection(db, TOURNAMENTS_COLLECTION);

  const now = Timestamp.now();
  const tournamentData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(tournamentsRef, tournamentData);

  return {
    id: docRef.id,
    ...tournamentData,
  } as Tournament;
}

export async function updateTournament(tournament: Tournament): Promise<void> {
  const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournament.id);
  await updateDoc(tournamentRef, {
    ...tournament,
    updatedAt: Timestamp.now(),
  });
}
