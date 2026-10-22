import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/** Wire shape of POST /api/auth/login. */
interface LoginPayload {
  token: string;
  nome: string;
  email: string;
  role: string;
}

export interface Session {
  token: string;
  name: string;
  email: string;
  role: string;
}

const API = '/api';
const SESSION_KEY = 'ebd-session';

/**
 * Same contract as the Escola de Louvor's AuthService. The session lives in
 * localStorage (not sessionStorage) because the teachers use their own phone
 * every Sunday and should not have to sign in each time they open the app.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<Session | null>(this.readStored());

  readonly user = computed(() => this.session());
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isAdmin = computed(() => this.session()?.role === 'ADMIN');

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<LoginPayload>(`${API}/auth/login`, { email, password }).pipe(
      map((payload): Session => {
        const session: Session = {
          token: payload.token,
          name: payload.nome,
          email: payload.email,
          role: payload.role
        };
        this.store(session);
        this.session.set(session);
        return session;
      })
    );
  }

  logout(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* storage disabled — nothing to clear */
    }
    this.session.set(null);
  }

  get token(): string | null {
    return this.session()?.token ?? null;
  }

  private store(session: Session): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      /* private mode — the session just won't survive a reload */
    }
  }

  private readStored(): Session | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }
}
