import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let http: HttpTestingController;

  const create = () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthService);
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => http.verify());

  it('starts signed out', () => {
    const service = create();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.token).toBeNull();
  });

  it('maps the Portuguese login payload and keeps the session in localStorage', () => {
    const service = create();
    service.login('admin@adsantarem.org', 'admin123').subscribe();
    const req = http.expectOne('/api/auth/login');
    expect(req.request.body).toEqual({ email: 'admin@adsantarem.org', password: 'admin123' });
    req.flush({ token: 'jwt', nome: 'Ana', email: 'a@b.pt', role: 'ADMIN' });

    expect(service.user()?.name).toBe('Ana');
    expect(service.isAdmin()).toBe(true);
    expect(JSON.parse(localStorage.getItem('ebd-session')!).token).toBe('jwt');
  });

  it('restores a stored session and forgets it on logout', () => {
    localStorage.setItem('ebd-session', JSON.stringify({ token: 't', name: 'Bruno', email: 'b@c.pt', role: 'PROFESSOR' }));
    const service = create();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(false);

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('ebd-session')).toBeNull();
  });
});
