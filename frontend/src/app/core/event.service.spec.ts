import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { daysUntil, EventService, untilLabel } from './event.service';

describe('EventService', () => {
  it('mixes saved events with the Portuguese dates, in date order', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    let titles: string[] = [];
    TestBed.inject(EventService)
      .calendar('2026-12-01', '2027-01-31')
      .subscribe((l) => (titles = l.map((i) => i.title)));
    http
      .expectOne((r) => r.url === '/api/eventos' && r.params.get('de') === '2026-12-01')
      .flush([{ id: 1, titulo: 'Festa de Natal', data: '2026-12-20', hora: '15:00:00', local: 'Salão', descricao: null }]);
    expect(titles).toEqual(['Festa de Natal', 'Natal', 'Ano Novo']);
    http.verify();
  });

  it('says how far away a date is', () => {
    expect(untilLabel(daysUntil('2026-10-22', '2026-10-22'))).toBe('Hoje');
    expect(untilLabel(daysUntil('2026-10-23', '2026-10-22'))).toBe('Amanhã');
    expect(untilLabel(daysUntil('2026-12-25', '2026-10-22'))).toBe('Daqui a 64 dias');
    expect(untilLabel(daysUntil('2026-10-20', '2026-10-22'))).toBe('Foi há 2 dias');
  });
});
