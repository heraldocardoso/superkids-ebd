import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideNoopAnimations()]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks for both fields before calling the API', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.componentInstance.signIn();
    expect(fixture.componentInstance.error()).toContain('e-mail');
  });

  it('signs in and opens the app', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const c = fixture.componentInstance;
    c.email = ' admin@adsantarem.org ';
    c.password = 'admin123';
    c.signIn();
    http.expectOne('/api/auth/login').flush({ token: 't', nome: 'Admin', email: 'admin@adsantarem.org', role: 'ADMIN' });
    expect(navigate).toHaveBeenCalledWith(['/']);
  });

  it('says when the password is wrong', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const c = fixture.componentInstance;
    c.email = 'a@b.pt';
    c.password = 'x';
    c.signIn();
    http.expectOne('/api/auth/login').flush({ mensagem: 'x' }, { status: 401, statusText: 'Unauthorized' });
    expect(c.error()).toBe('E-mail ou palavra-passe inválidos.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('inválidos');
  });
});
