import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

/* ------------------------------------------------------------------ domain */

export type Role = 'ADMIN' | 'PROFESSOR';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserUpdate {
  name: string;
  role: Role;
  active: boolean;
  password: string | null;
}

/* -------------------------------------------------------------- wire shape */

interface UserPayload {
  id: number;
  nome: string;
  email: string;
  role: Role;
  ativo: boolean;
  criadoEm: string;
}

const toUser = (u: UserPayload): User => ({
  id: u.id,
  name: u.nome,
  email: u.email,
  role: u.role,
  active: u.ativo,
  createdAt: u.criadoEm
});

/* ----------------------------------------------------------------- service */

const API = '/api/admin/utilizadores';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  list() {
    return this.http.get<UserPayload[]>(API).pipe(map((list) => list.map(toUser)));
  }

  create(user: NewUser) {
    return this.http
      .post<UserPayload>(API, { nome: user.name, email: user.email, password: user.password, role: user.role })
      .pipe(map(toUser));
  }

  update(id: number, user: UserUpdate) {
    return this.http
      .put<UserPayload>(`${API}/${id}`, {
        nome: user.name,
        role: user.role,
        ativo: user.active,
        password: user.password
      })
      .pipe(map(toUser));
  }

  remove(id: number) {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
