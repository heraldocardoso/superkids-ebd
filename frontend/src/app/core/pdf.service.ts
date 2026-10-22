import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import { capitalize, formatDate, formatLong, formatShort, parseIso, today, WEEKDAYS } from './dates';
import { CONSENT_QUESTIONS, CONSENT_VERSION, consentText } from './consent';
import { Student, fullName } from './student.service';
import { Birthday } from './dashboard.service';

/* --------------------------------------------------------------- report data */

export interface AttendanceReport {
  className: string;
  date: string;
  teachers: string | null;
  topic: string | null;
  enrolled: number;
  rows: { name: string; age: number | null; bible: boolean }[];
}

export interface BirthdayGroup {
  className: string;
  items: Birthday[];
}

/* ------------------------------------------------------------------ palette */

type Rgb = [number, number, number];
const NAVY: Rgb = [24, 32, 63];
const YELLOW: Rgb = [252, 196, 25];
const INK: Rgb = [29, 27, 46];
const MUTED: Rgb = [110, 112, 140];
const LINE: Rgb = [226, 229, 240];
const SOFT: Rgb = [244, 246, 252];
const GREEN: Rgb = [31, 164, 99];
const RED: Rgb = [226, 76, 76];

const FORM_LABEL: Record<string, string> = {
  paper: 'Em papel',
  online: 'Formulário online',
  app: 'Assinada na app'
};

/** jsPDF's built-in fonts are Latin-1: dashes and curly quotes become garbage. */
const latin = (s: string | null | undefined): string =>
  String(s ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...');

const slug = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

/**
 * Printable reports, built in the browser with jsPDF and downloaded straight
 * away. Loaded on demand, so the PDF library never weighs on the first load.
 */
@Injectable({ providedIn: 'root' })
export class PdfService {
  private logo: string | null | undefined;

  async attendance(reports: AttendanceReport[]): Promise<void> {
    const { doc, table } = await this.start();
    reports.forEach((r, i) => {
      if (i) doc.addPage();
      this.header(doc, 'Lista de presenças');
      this.title(doc, r.className);
      this.box(doc, 14, 50, 88, 16, 'Data', capitalize(formatLong(r.date)));
      this.box(doc, 108, 50, 88, 16, 'Professora(s)', r.teachers || '-');
      this.box(doc, 14, 69, 182, 16, 'Lição aplicada', r.topic || '-');
      const withBible = r.rows.filter((x) => x.bible).length;
      let x = 14;
      x += this.chip(doc, x, 90, `${r.rows.length} de ${r.enrolled} presentes`, [223, 246, 236], [20, 120, 80]) + 3;
      this.chip(doc, x, 90, `${withBible} com Bíblia`, [255, 241, 199], [122, 82, 0]);

      table(doc, {
        ...this.tableBase(),
        startY: 103,
        head: [['#', 'Nome', 'Idade', 'Bíblia']],
        body: r.rows.length
          ? r.rows.map((row, k) => [String(k + 1), latin(row.name), row.age ?? '-', row.bible ? 'S' : 'N'])
          : [[{ content: 'Sem presenças registadas neste dia', colSpan: 4, styles: { halign: 'center', textColor: MUTED } }]],
        columnStyles: {
          0: { cellWidth: 12, textColor: MUTED },
          1: { fontStyle: 'bold' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' }
        },
        didParseCell: (c: CellHook) => {
          if (c.section === 'head' && c.column.index >= 2) c.cell.styles.halign = 'center';
          if (c.section === 'body' && c.column.index === 3 && r.rows.length) c.cell.text = [''];
        },
        didDrawCell: (c: CellHook) => {
          this.rowLine(c);
          if (c.section === 'body' && c.column.index === 3 && r.rows.length) {
            this.bibleMark(c.doc, c.cell.x + c.cell.width / 2, c.cell.y + c.cell.height / 2, c.row.raw[3] === 'S');
          }
        }
      });

      let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 22;
      if (y > 270) {
        doc.addPage();
        y = 45;
      }
      doc.setDrawColor(...MUTED);
      doc.setLineWidth(0.3);
      doc.line(14, y, 90, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.text('Assinatura da professora', 14, y + 5);
    });
    this.footer(doc);
    const name = reports.length > 1 ? 'todas' : slug(reports[0]?.className ?? 'turma');
    doc.save(`presencas-${name}-${reports[0]?.date ?? today()}.pdf`);
  }

  async birthdays(periodLabel: string, groups: BirthdayGroup[], fileTag: string): Promise<void> {
    const { doc, table } = await this.start();
    groups.forEach((g, i) => {
      if (i) doc.addPage();
      this.header(doc, `Aniversariantes · ${capitalize(periodLabel)}`);
      this.title(doc, g.className);
      const n = g.items.length;
      this.chip(doc, 14, 49, `${n} aniversariante${n === 1 ? '' : 's'}`, [255, 233, 214], [154, 67, 0]);
      table(doc, {
        ...this.tableBase(),
        startY: 62,
        head: [['Dia', 'Nome', 'Faz', 'Contacto do encarregado']],
        body: n
          ? g.items.map((b) => [
              `${capitalize(WEEKDAYS[parseIso(b.date).getDay()])} ${formatShort(b.date)}`,
              latin(b.name),
              `${b.turning} anos`,
              latin(b.guardianContact || '-')
            ])
          : [[{ content: 'Sem aniversariantes neste período', colSpan: 4, styles: { halign: 'center', textColor: MUTED } }]],
        columnStyles: {
          0: { cellWidth: 34, fontStyle: 'bold', textColor: [154, 67, 0] },
          1: { fontStyle: 'bold' },
          2: { cellWidth: 22 }
        },
        didDrawCell: (c: CellHook) => this.rowLine(c)
      });
    });
    this.footer(doc);
    doc.save(`aniversariantes-${fileTag}.pdf`);
  }

  /** One page for the record; the paper photo or online screenshot follows on page 2. */
  async consentReceipt(
    student: Student,
    className: string,
    attachments: { receipt?: string | null; signature?: string | null }
  ): Promise<void> {
    const { doc, table } = await this.start();
    const c = student.consent;
    this.header(doc, 'Comprovativo de autorização de dados (RGPD)');
    this.title(doc, fullName(student));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    doc.text(
      latin(className + (student.birthDate ? ` · nascida(o) em ${formatDate(student.birthDate)}` : '')),
      14,
      50
    );

    const yesNo = (v: boolean) => (v ? 'Sim, autorizo' : 'Não autorizo');
    const relation: Record<string, string> = { mother: 'Mãe', father: 'Pai', other: 'Outro' };
    const rows: [string, string][] = [
      ['Estado', c.status === 'signed' ? 'Autorização assinada' : c.status === 'refused' ? 'Autorização recusada' : 'Por recolher'],
      ['Forma', c.method ? FORM_LABEL[c.method] : '-'],
      ['Data', c.date ? capitalize(formatLong(c.date)) + (c.time ? `, às ${c.time}` : '') : '-'],
      ['Assinada por', (c.signedBy || '-') + (c.relation && relation[c.relation] ? ` (${relation[c.relation]})` : '')]
    ];
    if (c.method === 'online') rows.push(['Email do formulário', c.email || '-']);
    if (c.textVersion) rows.push(['Versão do texto', c.textVersion]);
    rows.push(
      ['1. ' + CONSENT_QUESTIONS[0].replace('Autorizo a guarda dos ', '').replace('.', ''), c.status === 'refused' ? 'Não autorizo' : 'Sim, autorizo'],
      ['2. Dados de saúde e cuidados', yesNo(c.health)],
      ['3. Fotografia na ficha', yesNo(c.photo)]
    );
    table(doc, {
      ...this.tableBase(),
      startY: 56,
      styles: { ...this.tableBase().styles, fontSize: 9.5, cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 } },
      body: rows.map(([k, v]) => [latin(k), latin(v)]),
      columnStyles: { 0: { cellWidth: 72, fontStyle: 'bold', textColor: MUTED }, 1: { fontStyle: 'bold' } },
      didDrawCell: (cell: CellHook) => this.rowLine(cell)
    });
    let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    if (c.method === 'app') {
      if (attachments.signature) {
        const props = doc.getImageProperties(attachments.signature);
        const w = 62;
        const h = Math.min(28, (w * props.height) / props.width);
        doc.setFillColor(...SOFT);
        doc.setDrawColor(...LINE);
        doc.roundedRect(14, y, 182, h + 22, 2.5, 2.5, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(...MUTED);
        doc.text('ASSINATURA DO ENCARREGADO', 18, y + 6);
        doc.addImage(attachments.signature, 'PNG', 18, y + 8, w, h);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.text(
          doc.splitTextToSize(
            latin(
              `Assinado no ecrã da app Super Kids EBD por ${c.signedBy || '-'} em ${c.date ? formatDate(c.date) : ''} às ${c.time || ''}, depois de ler o texto abaixo (versão ${c.textVersion || CONSENT_VERSION}).`
            ),
            96
          ),
          96,
          y + 12
        );
        y += h + 30;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...INK);
      doc.text('Texto apresentado ao encarregado', 14, y);
      y += 6;
      for (const section of consentText()) {
        const parts: [string, boolean][] = [[section.title, true]];
        (section.paragraphs ?? []).forEach((p) => parts.push([p, false]));
        (section.bullets ?? []).forEach((b) => parts.push(['• ' + b, false]));
        for (const [text, heading] of parts) {
          doc.setFont('helvetica', heading ? 'bold' : 'normal');
          doc.setFontSize(heading ? 9 : 8.5);
          doc.setTextColor(...(heading ? INK : ([74, 72, 96] as Rgb)));
          const lines = doc.splitTextToSize(latin(text), 182);
          if (y + lines.length * 3.9 > 278) {
            doc.addPage();
            y = 20;
          }
          doc.text(lines, 14, y);
          y += lines.length * 3.9 + (heading ? 0.3 : 1.4);
        }
      }
    } else if (attachments.receipt) {
      doc.addPage();
      this.header(doc, c.method === 'online' ? 'Comprovativo da resposta (formulário online)' : 'Papel assinado');
      const props = doc.getImageProperties(attachments.receipt);
      const maxW = 182;
      const maxH = 240;
      let w = maxW;
      let h = (w * props.height) / props.width;
      if (h > maxH) {
        h = maxH;
        w = (h * props.width) / props.height;
      }
      doc.addImage(attachments.receipt, 'JPEG', 14 + (maxW - w) / 2, 38, w, h);
    }
    this.footer(doc);
    doc.save(`autorizacao-${slug(fullName(student))}.pdf`);
  }

  /* ----------------------------------------------------------------- pieces */

  private async start(): Promise<{ doc: jsPDF; table: (doc: jsPDF, options: object) => void }> {
    const [{ jsPDF }, autoTable] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    if (this.logo === undefined) {
      this.logo = await this.logoPng();
    }
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    return { doc, table: (d, o) => autoTable.default(d, o) };
  }

  /** jsPDF cannot draw SVG, so the church logo is rasterised once. */
  private logoPng(): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 160;
        canvas.getContext('2d')!.drawImage(img, 0, 0, 160, 160);
        try {
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = 'logo-ad.svg';
    });
  }

  private header(doc: jsPDF, subtitle: string): void {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, 210, 30, 'F');
    if (this.logo) {
      doc.addImage(this.logo, 'PNG', 14, 7, 16, 16);
    }
    doc.setTextColor(...YELLOW);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Super Kids EBD', 35, 14.5);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(latin(subtitle), 35, 21.5);
    doc.setFillColor(...YELLOW);
    doc.rect(0, 30, 210, 1.2, 'F');
  }

  private title(doc: jsPDF, text: string): void {
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(latin(text), 14, 44);
  }

  private footer(doc: jsPDF): void {
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...LINE);
      doc.line(14, 283, 196, 283);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(latin('Gerado em ' + formatLong(today())), 14, 288);
      doc.text(`Página ${i} de ${pages}`, 196, 288, { align: 'right' });
    }
  }

  private box(doc: jsPDF, x: number, y: number, w: number, h: number, label: string, value: string): void {
    doc.setFillColor(...SOFT);
    doc.setDrawColor(...LINE);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x + 4, y + 5.5);
    doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(latin(value), w - 8).slice(0, 1), x + 4, y + 11.5);
  }

  private chip(doc: jsPDF, x: number, y: number, text: string, fill: Rgb, color: Rgb): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    const w = doc.getTextWidth(text) + 10;
    doc.setFillColor(...fill);
    doc.roundedRect(x, y, w, 7.5, 3.75, 3.75, 'F');
    doc.setTextColor(...color);
    doc.text(text, x + 5, y + 5.1);
    return w;
  }

  /** Green circle with a tick, or red circle with a cross. */
  private bibleMark(doc: jsPDF, cx: number, cy: number, yes: boolean): void {
    doc.setFillColor(...(yes ? GREEN : RED));
    doc.circle(cx, cy, 2.8, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.65);
    doc.setLineCap('round');
    if (yes) {
      doc.lines([[0.95, 0.95], [1.75, -2]], cx - 1.35, cy + 0.15);
    } else {
      doc.line(cx - 1.05, cy - 1.05, cx + 1.05, cy + 1.05);
      doc.line(cx - 1.05, cy + 1.05, cx + 1.05, cy - 1.05);
    }
    doc.setLineWidth(0.2);
  }

  private rowLine(c: CellHook): void {
    if (c.section === 'body') {
      c.doc.setDrawColor(...LINE);
      c.doc.setLineWidth(0.2);
      c.doc.line(c.cell.x, c.cell.y + c.cell.height, c.cell.x + c.cell.width, c.cell.y + c.cell.height);
    }
  }

  private tableBase() {
    return {
      theme: 'plain',
      margin: { left: 14, right: 14, bottom: 20 },
      styles: {
        font: 'helvetica',
        fontSize: 10.5,
        cellPadding: { top: 3.4, bottom: 3.4, left: 3.5, right: 3.5 },
        textColor: INK,
        valign: 'middle'
      },
      headStyles: { fillColor: NAVY, textColor: YELLOW, fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [248, 249, 253] }
    };
  }
}

/** The bits of jspdf-autotable's hook argument these reports use. */
interface CellHook {
  doc: jsPDF;
  section: 'head' | 'body' | 'foot';
  column: { index: number };
  row: { raw: string[] };
  cell: { x: number; y: number; width: number; height: number; text: string[]; styles: { halign: string } };
}
