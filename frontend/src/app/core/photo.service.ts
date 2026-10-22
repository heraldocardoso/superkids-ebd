import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { StudentService } from './student.service';

/**
 * Photos need the Bearer token, so they are fetched as blobs and shown through
 * object URLs. Each student's photo is fetched once and shared by every card
 * that shows it.
 */
@Injectable({ providedIn: 'root' })
export class PhotoService {
  private readonly cache = new Map<number, WritableSignal<string | null>>();

  constructor(private students: StudentService) {}

  url(studentId: number | null, hasPhoto: boolean): Signal<string | null> {
    if (!studentId || !hasPhoto) {
      return signal(null);
    }
    let entry = this.cache.get(studentId);
    if (!entry) {
      entry = signal<string | null>(null);
      this.cache.set(studentId, entry);
      const target = entry;
      this.students.getAttachment(studentId, 'photo').subscribe({
        next: (blob) => target.set(URL.createObjectURL(blob)),
        error: () => target.set(null)
      });
    }
    return entry;
  }

  /** After a new photo is uploaded, or removed. */
  forget(studentId: number): void {
    const entry = this.cache.get(studentId);
    const url = entry?.();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.cache.delete(studentId);
  }
}
