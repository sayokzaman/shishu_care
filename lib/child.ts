import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHILD_KEY = 'shishucare_child';

export interface ChildData {
  id?: number;         // DB primary key — set after onboarding, used for API calls
  name: string;
  dob: string;         // ISO date string (can be future for prenatal)
  gender: 'male' | 'female' | 'other';
  weightKg: number;
  heightCm: number;
  journeyType: 'prenatal' | 'postnatal';
}

export async function saveChild(data: ChildData): Promise<void> {
  await AsyncStorage.setItem(CHILD_KEY, JSON.stringify(data));
}

export async function loadChild(): Promise<ChildData | null> {
  const raw = await AsyncStorage.getItem(CHILD_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Age in months (negative = prenatal weeks expressed as fractional months) */
export function getAgeMonths(dob: string): number {
  const birth = new Date(dob);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 30.44);
}

/** Human-readable age label */
export function formatAge(months: number): string {
  if (months < 0) {
    const weeks = Math.round(-months * 4.33);
    return `${weeks}w prenatal`;
  }
  if (months < 1) return `< 1 month`;
  if (months < 12) return `${Math.round(months)} months`;
  const years = Math.floor(months / 12);
  const rem = Math.round(months % 12);
  return rem > 0 ? `${years}y ${rem}m` : `${years} year${years > 1 ? 's' : ''}`;
}

/**
 * Content bracket for personalising guides, games, nutrition etc.
 * prenatal | 0-1m | 1-6m | 6-12m | 1-2y | 2-3y | 3-5y
 */
export function getAgeBracket(months: number): string {
  if (months < 0) return 'prenatal';
  if (months < 1) return '0-1m';
  if (months < 6) return '1-6m';
  if (months < 12) return '6-12m';
  if (months < 24) return '1-2y';
  if (months < 36) return '2-3y';
  return '3-5y';
}

/** Validate DOB is within allowed range (-9 months to +5 years from today) */
export function validateDob(dob: string): string | null {
  const birth = new Date(dob);
  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth() - 9, now.getDate()); // 9 months ago → but prenatal means DOB can be UP TO 9m in future
  const maxPrenatalDate = new Date(now.getFullYear(), now.getMonth() + 9, now.getDate());
  const maxPostnatalDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  if (birth > maxPrenatalDate) return 'Date of birth cannot be more than 9 months in the future.';
  if (birth < maxPostnatalDate) return 'ShishuCare supports children up to 5 years old.';
  return null;
}
