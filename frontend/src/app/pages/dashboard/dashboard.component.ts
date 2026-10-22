import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Dashboard, DashboardService } from '../../core/dashboard.service';
import { ClassService } from '../../core/class.service';
import { classMove } from '../../core/class-move';
import { StudentService } from '../../core/student.service';
import { forkJoin } from 'rxjs';
import { capitalize, formatLong, formatShort, MONTHS, parseIso, today, WEEKDAYS } from '../../core/dates';
import { TranslatedComponent } from '../../core/i18n/translated.component';
import { StudentAvatarComponent } from '../../shared/student-avatar/student-avatar.component';
import { DashboardTranslations, dashboardTranslations } from './translations';

interface ChartPoint {
  x: number;
  yPresent: number;
  yBible: number;
  label: string;
  showLabel: boolean;
}

interface ChartModel {
  width: number;
  height: number;
  grid: { y: number; value: number }[];
  points: ChartPoint[];
  presentPath: string;
  biblePath: string;
  area: string;
  last: ChartPoint & { value: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, ButtonModule, StudentAvatarComponent],
  host: { class: 'flex min-w-0 flex-col gap-4 lg:gap-5' },
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends TranslatedComponent<DashboardTranslations> implements OnInit {
  protected readonly translations = dashboardTranslations;

  readonly data = signal<Dashboard | null>(null);
  readonly failed = signal(false);
  readonly todayLabel = capitalize(formatLong(today()));
  readonly today = today();

  /** Narrow screens get a smaller drawing, so the labels stay readable. */
  private readonly narrow = signal(typeof window !== 'undefined' && !window.matchMedia('(min-width: 600px)').matches);

  readonly selectedTotals = computed(() => {
    const d = this.data();
    const day = d?.attendance.find((a) => a.date === d.selectedDay);
    return { present: day?.present ?? 0, withBible: day?.withBible ?? 0 };
  });

  readonly chart = computed<ChartModel | null>(() => {
    const points = this.data()?.attendance ?? [];
    if (!points.length) {
      return null;
    }
    const small = this.narrow();
    const W = small ? 360 : 640;
    const H = small ? 220 : 260;
    const left = 30;
    const right = small ? 14 : 20;
    const top = 26;
    const bottom = 32;
    const n = points.length;
    const max = Math.max(4, ...points.map((p) => p.present));
    const step = Math.ceil(max / 4);
    const ceiling = step * 4;
    const x = (i: number) => (n === 1 ? left + (W - left - right) / 2 : left + (i * (W - left - right)) / (n - 1));
    const y = (v: number) => top + (H - top - bottom) * (1 - v / ceiling);
    const every = n > (small ? 4 : 7) ? 2 : 1;

    const model: ChartPoint[] = points.map((p, i) => ({
      x: x(i),
      yPresent: y(p.present),
      yBible: y(p.withBible),
      label: formatShort(p.date),
      showLabel: i % every === 0 || i === n - 1
    }));
    const line = (key: 'yPresent' | 'yBible') => model.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p[key]}`).join(' ');
    const presentPath = line('yPresent');
    return {
      width: W,
      height: H,
      grid: [0, 1, 2, 3, 4].map((k) => ({ y: y(k * step), value: k * step })),
      points: model,
      presentPath,
      biblePath: line('yBible'),
      area: n > 1 ? `${presentPath} L${x(n - 1)} ${y(0)} L${x(0)} ${y(0)} Z` : '',
      last: { ...model[n - 1], value: points[n - 1].present }
    };
  });

  /** Children who already passed the top age of their class. */
  readonly toMove = signal(0);

  constructor(
    private service: DashboardService,
    private classService: ClassService,
    private students: StudentService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.load(null);
    forkJoin({ classes: this.classService.list(), students: this.students.list() }).subscribe({
      next: ({ classes, students }) => this.toMove.set(students.filter((s) => classMove(s, classes)).length),
      error: () => this.toMove.set(0)
    });
  }

  load(day: string | null): void {
    this.service.get(day).subscribe({
      next: (d) => {
        this.data.set(d);
        this.failed.set(false);
      },
      error: () => this.failed.set(true)
    });
  }

  dayOption(date: string): string {
    return `${formatShort(date)} · ${WEEKDAYS[parseIso(date).getDay()]}`;
  }

  short(date: string): string {
    return formatShort(date);
  }

  weekdayShort(date: string): string {
    return `${WEEKDAYS[parseIso(date).getDay()].slice(0, 3)} ${formatShort(date)}`;
  }

  weekRange(d: Dashboard): string {
    const a = parseIso(d.weekStart);
    const b = parseIso(d.weekEnd);
    return `${a.getDate()} ${MONTHS[a.getMonth()].slice(0, 3)} – ${b.getDate()} ${MONTHS[b.getMonth()].slice(0, 3)}`;
  }

  percent(part: number, total: number): number {
    return total ? (part / total) * 100 : 0;
  }

  goToStudents(filter: string): void {
    void this.router.navigate(['/students'], { queryParams: { filter } });
  }

  goToClasses(): void {
    void this.router.navigate(['/students'], { queryParams: { classes: 1 } });
  }
}
