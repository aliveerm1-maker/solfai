import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AuthUser = {
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  clientId: string | null;
  googleReady: boolean;
  signIn: () => void;
  signOut: () => void;
  renderButton: (el: HTMLElement | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  clientId: null,
  googleReady: false,
  signIn: () => {},
  signOut: () => {},
  renderButton: () => {},
});

export const useAuth = () => useContext(AuthContext);

const STORAGE_KEY = "solfai_user";

function decodeJwt(token: string): Record<string, string> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

// GIS is loaded via a <script> in index.html; typed loosely to avoid extra deps.
function gis(): any {
  return (window as any).google?.accounts?.id;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? (JSON.parse(s) as AuthUser) : null;
    } catch {
      return null;
    }
  });
  const [clientId, setClientId] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  // 1. Fetch the Google OAuth client id from the backend (env-driven).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => {
        if (!cancelled) setClientId(cfg?.googleClientId || null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Wait for the Google Identity Services script to load.
  useEffect(() => {
    if (gis()) {
      setGoogleReady(true);
      return;
    }
    const t = setInterval(() => {
      if (gis()) {
        setGoogleReady(true);
        clearInterval(t);
      }
    }, 300);
    const to = setTimeout(() => clearInterval(t), 15000);
    return () => {
      clearInterval(t);
      clearTimeout(to);
    };
  }, []);

  // 3. Initialise GIS once both the script and the client id are ready.
  useEffect(() => {
    if (!googleReady || !clientId) return;
    gis().initialize({
      client_id: clientId,
      callback: (resp: { credential: string }) => {
        const p = decodeJwt(resp.credential);
        if (p && p.email) {
          const u: AuthUser = {
            name: p.name || p.email,
            email: p.email,
            picture: p.picture,
            given_name: p.given_name,
          };
          setUser(u);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
          } catch {
            /* ignore */
          }
        }
      },
    });
  }, [googleReady, clientId]);

  const signIn = () => {
    if (googleReady && clientId) {
      gis().prompt();
    } else if (!clientId) {
      alert(
        "Google sign-in isn't configured yet.\nSet GOOGLE_OAUTH_CLIENT_ID on the server (Render) to enable it.",
      );
    }
  };

  const signOut = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    gis()?.disableAutoSelect?.();
  };

  const renderButton = (el: HTMLElement | null) => {
    if (el && googleReady && clientId) {
      el.innerHTML = "";
      gis().renderButton(el, {
        theme: "filled_black",
        size: "large",
        shape: "pill",
        text: "signin_with",
        width: 220,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, clientId, googleReady, signIn, signOut, renderButton }}>
      {children}
    </AuthContext.Provider>
  );
}
