import { AuthUser } from "@/types";

const tokenKey = "hc_access_token";
const refreshTokenKey = "hc_refresh_token";
const userKey = "hc_user";

export const storage = {
  setSession(accessToken: string, refreshToken: string, user: AuthUser) {
    if (typeof window === "undefined") return;
    localStorage.setItem(tokenKey, accessToken);
    localStorage.setItem(refreshTokenKey, refreshToken);
    localStorage.setItem(userKey, JSON.stringify(user));
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(refreshTokenKey);
    localStorage.removeItem(userKey);
  },

  getAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(tokenKey);
  },

  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(refreshTokenKey);
  },

  getUser(): AuthUser | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(userKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.id || !parsed.clinicId || !parsed.email || !parsed.firstName || !parsed.lastName || !parsed.role) {
      return null;
    }
    return {
      id: parsed.id,
      clinicId: parsed.clinicId,
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      role: parsed.role,
      permissions: parsed.permissions ?? []
    };
  }
};
