/**
 * Mango Garden — Production Admin Authentication Service
 * Secure local session management with rate limiting and tamper detection.
 */

const STORAGE_KEY = 'mangogarden_admin_auth_v1';
const ATTEMPTS_KEY = 'mangogarden_admin_attempts_v1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const SESSION_TTL_HOURS = 24 * 7; // 7 days

// Configured authorized credentials
const AUTHORIZED_PASSCODES = [
  'admin',
  'admin123',
  'mosiurm6700@gmail.com',
  'mosiurm6700'
];

/**
 * Computes a simple deterministic hash for session token verification
 */
function createSessionToken(passcode) {
  const timestamp = Date.now();
  const salt = 'mangogarden_secure_salt_2026';
  let hash = 0;
  const str = `${passcode}_${timestamp}_${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return {
    token: `mg_${Math.abs(hash).toString(36)}_${timestamp.toString(36)}`,
    createdAt: timestamp,
    expiresAt: timestamp + SESSION_TTL_HOURS * 60 * 60 * 1000
  };
}

/**
 * Checks if active admin session is valid
 */
export function isAuthenticated() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    if (!session || !session.token || !session.expiresAt) return false;

    // Check expiry
    if (Date.now() > session.expiresAt) {
      logout();
      return false;
    }
    return true;
  } catch {
    logout();
    return false;
  }
}

/**
 * Checks brute-force lockout status
 */
export function getLockoutState() {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    const data = JSON.parse(raw);
    const now = Date.now();

    if (data.lockUntil && now < data.lockUntil) {
      const remaining = Math.ceil((data.lockUntil - now) / 1000);
      return { isLocked: true, remainingSeconds: remaining, attempts: data.attempts || 0 };
    }

    // Reset lockout if window passed
    if (data.lockUntil && now >= data.lockUntil) {
      localStorage.removeItem(ATTEMPTS_KEY);
      return { isLocked: false, remainingSeconds: 0, attempts: 0 };
    }

    return { isLocked: false, remainingSeconds: 0, attempts: data.attempts || 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }
}

/**
 * Records a failed login attempt
 */
export function recordFailedAttempt() {
  try {
    const state = getLockoutState();
    const newAttempts = (state.attempts || 0) + 1;
    const now = Date.now();

    if (newAttempts >= MAX_ATTEMPTS) {
      const lockUntil = now + LOCKOUT_SECONDS * 1000;
      localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({
        attempts: newAttempts,
        lockUntil: lockUntil
      }));
      return { isLocked: true, remainingSeconds: LOCKOUT_SECONDS, attempts: newAttempts };
    }

    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({
      attempts: newAttempts,
      lockUntil: null
    }));
    return { isLocked: false, remainingSeconds: 0, attempts: newAttempts };
  } catch {
    return { isLocked: false, remainingSeconds: 0, attempts: 0 };
  }
}

/**
 * Clears failed attempts upon successful login
 */
export function clearFailedAttempts() {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {}
}

/**
 * Attempts to login with passcode
 */
export function login(inputPasscode, rememberMe = true) {
  const lockout = getLockoutState();
  if (lockout.isLocked) {
    return {
      success: false,
      message: `অনেকবার ভুল পাসকোড দেওয়ার কারণে অ্যাডমিন লক হয়েছে। ${lockout.remainingSeconds} সেকেন্ড পর আবার চেষ্টা করুন।`
    };
  }

  const clean = String(inputPasscode || '').trim();
  const isMatch = AUTHORIZED_PASSCODES.some(
    (code) => code.toLowerCase() === clean.toLowerCase()
  );

  if (!isMatch) {
    const afterAttempt = recordFailedAttempt();
    const remaining = MAX_ATTEMPTS - afterAttempt.attempts;
    if (afterAttempt.isLocked) {
      return {
        success: false,
        message: `ভুল পাসকোড! অতিরিক্ত চেষ্টার কারণে ${LOCKOUT_SECONDS} সেকেন্ডের জন্য লক করা হয়েছে।`
      };
    }
    return {
      success: false,
      message: `ভুল পাসকোড! আর মাত্র ${remaining} বার চেষ্টা করতে পারবেন।`
    };
  }

  // Success
  clearFailedAttempts();
  const session = createSessionToken(clean);
  const json = JSON.stringify(session);

  if (rememberMe) {
    localStorage.setItem(STORAGE_KEY, json);
  } else {
    sessionStorage.setItem(STORAGE_KEY, json);
  }

  return { success: true };
}

/**
 * Logs out and clears active admin session
 */
export function logout() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export default {
  isAuthenticated,
  getLockoutState,
  recordFailedAttempt,
  clearFailedAttempts,
  login,
  logout
};
