import { Component, ElementRef, input, model, output, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CONSENT_QUESTIONS, consentText } from '../../core/consent';
import { Choice, ChoicePillsComponent } from '../../shared/choice-pills/choice-pills.component';

export interface SignatureResult {
  data: boolean;
  health: boolean;
  photo: boolean;
  signedBy: string;
  relation: 'mother' | 'father' | 'other';
  signature: string;
}

interface Point {
  x: number;
  y: number;
  w: number;
}

/**
 * The guardian reads the consent text and signs on the teacher's phone or
 * tablet, with a finger or a pen. Nothing is pre-selected: each authorization
 * must be answered.
 */
@Component({
  selector: 'app-signature-dialog',
  standalone: true,
  imports: [FormsModule, ButtonModule, DialogModule, InputTextModule, ChoicePillsComponent],
  templateUrl: './signature-dialog.component.html'
})
export class SignatureDialogComponent {
  readonly visible = model(false);
  readonly childName = input('');
  readonly defaultSigner = input<string | null>(null);
  readonly defaultRelation = input<'mother' | 'father' | 'other'>('mother');
  readonly confirmed = output<SignatureResult>();

  @ViewChild('pad') padRef?: ElementRef<HTMLCanvasElement>;

  readonly text = consentText();
  readonly questions = CONSENT_QUESTIONS;
  readonly answers = signal<(boolean | null)[]>([null, null, null]);
  readonly error = signal<string | null>(null);
  readonly drawn = signal(false);

  signer = '';
  relation: 'mother' | 'father' | 'other' | null = 'mother';

  readonly yesNo: Choice<boolean>[] = [
    { value: true, label: 'Sim, autorizo' },
    { value: false, label: 'Não autorizo' }
  ];
  readonly relations: Choice<'mother' | 'father' | 'other'>[] = [
    { value: 'mother', label: 'Mãe' },
    { value: 'father', label: 'Pai' },
    { value: 'other', label: 'Outro' }
  ];

  private ctx: CanvasRenderingContext2D | null = null;
  private last: Point | null = null;
  private ratio = 1;
  private bounds = { minX: Infinity, minY: Infinity, maxX: 0, maxY: 0 };

  onShow(): void {
    this.answers.set([null, null, null]);
    this.error.set(null);
    this.signer = this.defaultSigner() ?? '';
    this.relation = this.defaultRelation();
    requestAnimationFrame(() => this.setupPad());
  }

  setAnswer(index: number, value: boolean | null): void {
    this.answers.update((a) => a.map((v, i) => (i === index ? value : v)));
  }

  private setupPad(): void {
    const canvas = this.padRef?.nativeElement;
    if (!canvas) {
      return;
    }
    this.ratio = Math.max(1, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * this.ratio);
    canvas.height = Math.round(rect.height * this.ratio);
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.strokeStyle = '#18203f';
      this.ctx.fillStyle = '#18203f';
    }
    this.clear();
  }

  clear(): void {
    const canvas = this.padRef?.nativeElement;
    if (canvas && this.ctx) {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.drawn.set(false);
    this.bounds = { minX: Infinity, minY: Infinity, maxX: 0, maxY: 0 };
  }

  private point(e: PointerEvent): Point {
    const rect = this.padRef!.nativeElement.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      // A pen draws thicker the harder it presses; a finger draws evenly.
      w: e.pointerType === 'pen' ? 1.2 + (e.pressure || 0.5) * 3 : 2.6
    };
  }

  private mark(p: Point): void {
    this.bounds.minX = Math.min(this.bounds.minX, p.x);
    this.bounds.minY = Math.min(this.bounds.minY, p.y);
    this.bounds.maxX = Math.max(this.bounds.maxX, p.x);
    this.bounds.maxY = Math.max(this.bounds.maxY, p.y);
  }

  down(e: PointerEvent): void {
    if (!this.ctx) {
      return;
    }
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    this.last = this.point(e);
    this.ctx.beginPath();
    this.ctx.arc(this.last.x, this.last.y, this.last.w / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.mark(this.last);
    this.drawn.set(true);
  }

  move(e: PointerEvent): void {
    if (!this.last || !this.ctx) {
      return;
    }
    e.preventDefault();
    const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      const p = this.point(ev);
      this.ctx.lineWidth = (this.last.w + p.w) / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.last.x, this.last.y);
      this.ctx.quadraticCurveTo(this.last.x, this.last.y, (this.last.x + p.x) / 2, (this.last.y + p.y) / 2);
      this.ctx.lineTo(p.x, p.y);
      this.ctx.stroke();
      this.mark(p);
      this.last = p;
    }
  }

  up(): void {
    this.last = null;
  }

  /** Crop to the strokes so the stored image is small. */
  private exportSignature(): string {
    const canvas = this.padRef!.nativeElement;
    const m = 8;
    const r = this.ratio;
    const x = Math.max(0, (this.bounds.minX - m) * r);
    const y = Math.max(0, (this.bounds.minY - m) * r);
    const w = Math.min(canvas.width - x, (this.bounds.maxX - this.bounds.minX + 2 * m) * r);
    const h = Math.min(canvas.height - y, (this.bounds.maxY - this.bounds.minY + 2 * m) * r);
    const scale = Math.min(1, 600 / w);
    const out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(w * scale));
    out.height = Math.max(1, Math.round(h * scale));
    out.getContext('2d')!.drawImage(canvas, x, y, w, h, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }

  confirm(): void {
    const [data, health, photo] = this.answers();
    const missing: string[] = [];
    if (data === null || health === null || photo === null) missing.push('responda às 3 autorizações');
    if (!this.signer.trim()) missing.push('escreva o nome do encarregado');
    if (!this.drawn()) missing.push('assine na área indicada');
    if (missing.length) {
      this.error.set('Falta: ' + missing.join(', ') + '.');
      return;
    }
    this.confirmed.emit({
      data: !!data,
      health: !!data && !!health,
      photo: !!data && !!photo,
      signedBy: this.signer.trim(),
      relation: this.relation ?? 'mother',
      signature: this.exportSignature()
    });
    this.visible.set(false);
  }
}
