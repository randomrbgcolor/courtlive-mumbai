// src/utils/constants.ts

import { CourtStatus } from './types';  // ✅ Add this line at the top

export const COURT_STATUS_OPTIONS: CourtStatus[] = [
  'IN_SESSION',
  'RECESS',
  'ADJOURNED',
  'HOLIDAY',
  'JUDGMENT'
];

export const STATUS_DISPLAY: Record<CourtStatus, string> = {
  'IN_SESSION': '⚖️ In Session',
  'RECESS': '☕ Recess',
  'ADJOURNED': '⏸️ Adjourned',
  'HOLIDAY': '🏆 Holiday',
  'JUDGMENT': '📋 Judgment Delivery'
};

export const STATUS_COLORS: Record<CourtStatus, string> = {
  'IN_SESSION': 'bg-green-100 text-green-800 border-green-300',
  'RECESS': 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'ADJOURNED': 'bg-orange-100 text-orange-800 border-orange-300',
  'HOLIDAY': 'bg-blue-100 text-blue-800 border-blue-300',
  'JUDGMENT': 'bg-purple-100 text-purple-800 border-purple-300'
};
