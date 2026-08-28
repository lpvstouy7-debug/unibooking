/**
 * Single source of truth for the auth cookie's name/lifetime so
 * AuthController (sets/clears it) and JwtStrategy (reads it) never drift.
 */
export const ACCESS_TOKEN_COOKIE = 'access_token';

// 1 day -- keep in sync with JWT_EXPIRES_IN in .env (the JWT's own `exp`
// claim is still what's actually enforced; this just controls how long the
// browser holds onto the cookie).
export const ACCESS_TOKEN_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
