/**
 * Reduce photos before they are uploaded. A phone camera gives 4–12 MB; the
 * API takes up to 5 MB, and a student's face needs a few dozen KB.
 */

function load(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não foi possível ler a imagem.'));
    };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Não foi possível converter a imagem.'))), type, quality)
  );
}

/** Square crop from the centre, at most 480 px — the student's photo. */
export async function squarePhoto(file: Blob, size = 480): Promise<Blob> {
  const img = await load(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const out = Math.min(size, side);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = out;
  canvas.getContext('2d')!.drawImage(
    img,
    (img.naturalWidth - side) / 2,
    (img.naturalHeight - side) / 2,
    side,
    side,
    0,
    0,
    out,
    out
  );
  return toBlob(canvas, 'image/jpeg', 0.82);
}

/** A signed paper or a screenshot: greyscale, legible, under ~300 KB. */
export async function documentScan(file: Blob, maxSide = 1600): Promise<Blob> {
  const img = await load(file);
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.filter = 'grayscale(1) contrast(1.15)';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return toBlob(canvas, 'image/jpeg', 0.7);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
