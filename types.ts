export interface Student {
  id: string;
  name: string;
  email: string;
  instrument: string;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  joinedDate: string;
}

export enum AppView {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  TOOL_TUNER = 'TOOL_TUNER',
  TOOL_PROFELOFONO = 'TOOL_PROFELOFONO',
  TOOL_CIRCLE = 'TOOL_CIRCLE',
  LOGIN = 'LOGIN'
}

export interface Note {
  name: string;
  frequency: number;
  color: string;
  textColor: string;
  label: string;
}

export interface KeySignature {
  key: string;
  relativeMinor: string;
  accidentals: string; // e.g., "1#" or "2b"
  notes: string[]; // Major scale notes
}

export type InstrumentType = 'profelofono' | 'piano' | 'guitar' | 'flute';