import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot, UrlTree } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './auth.guard';

const run = (guard: typeof authGuard) =>
  TestBed.runInInjectionContext(() => guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));

const signIn = (role: string) =>
  localStorage.setItem('ebd-session', JSON.stringify({ token: 't', name: 'X', email: 'x@y.pt', role }));

describe('auth guards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const setup = () => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });

  it('sends a guest to the login page', () => {
    setup();
    expect((run(authGuard) as UrlTree).toString()).toBe('/login');
    expect(run(guestGuard)).toBe(true);
  });

  it('lets a teacher in but keeps her out of the admin pages', () => {
    signIn('PROFESSOR');
    setup();
    expect(run(authGuard)).toBe(true);
    expect((run(guestGuard) as UrlTree).toString()).toBe('/');
    expect((run(adminGuard) as UrlTree).toString()).toBe('/');
  });

  it('lets an admin manage the teachers', () => {
    signIn('ADMIN');
    setup();
    expect(run(adminGuard)).toBe(true);
  });
});
