/**
 * Lightweight JWT decoding helper.
 * No external dependency (no jwt-decode package) - decodes the payload
 * segment of a JWT manually using atob (browser only).
 *
 * The backend (UCCD_App) issues tokens using `System.Security.Claims.ClaimTypes`
 * directly, so the claim keys inside the token payload are the full
 * .NET / XML claim-type URIs, e.g.:
 *  - ClaimTypes.NameIdentifier -> "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
 *  - ClaimTypes.GivenName      -> "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
 *  - ClaimTypes.Email          -> "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
 *  - ClaimTypes.Role           -> "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
 *
 * We read both the long URI form and short form for resilience in case the
 * backend claim mapping changes in the future.
 */

export interface DecodedToken {
  nameIdentifier?: string;
  fullName?: string;
  email?: string;
  roles: string[];
  exp?: number;
  raw: Record<string, any>;
}

const CLAIM_NAME_IDENTIFIER = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const CLAIM_GIVEN_NAME = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
const CLAIM_EMAIL = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
const CLAIM_ROLE = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function base64UrlDecode(input: string): string {
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad === 2) base64 += '==';
  else if (pad === 3) base64 += '=';
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(base64);
  }
}

export function decodeJwt(token: string | null | undefined): DecodedToken | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    const payloadJson = base64UrlDecode(parts[1]);
    const raw = JSON.parse(payloadJson);

    let roles: string[] = [];
    const roleClaim = raw[CLAIM_ROLE] ?? raw['role'] ?? raw['roles'];
    if (Array.isArray(roleClaim)) {
      roles = roleClaim;
    } else if (typeof roleClaim === 'string') {
      roles = [roleClaim];
    }

    return {
      nameIdentifier: raw[CLAIM_NAME_IDENTIFIER] ?? raw['nameid'] ?? raw['sub'],
      fullName: raw[CLAIM_GIVEN_NAME] ?? raw['given_name'] ?? raw['fullName'],
      email: raw[CLAIM_EMAIL] ?? raw['email'],
      roles,
      exp: raw['exp'],
      raw,
    };
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string | null | undefined): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return decoded.exp <= nowInSeconds;
}
