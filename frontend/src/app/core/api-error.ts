/** Error body the backend returns: `{ mensagem, codigo }`. */
interface ApiErrorPayload {
  mensagem?: string;
  codigo?: string;
}

interface HttpErrorLike {
  status?: number;
  error?: ApiErrorPayload;
}

const asHttpError = (error: unknown): HttpErrorLike =>
  typeof error === 'object' && error !== null ? (error as HttpErrorLike) : {};

/** Server-supplied message, or the caller's translated fallback. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  return asHttpError(error).error?.mensagem ?? fallback;
}

export function apiErrorCode(error: unknown): string | null {
  return asHttpError(error).error?.codigo ?? null;
}

export function apiErrorStatus(error: unknown): number | null {
  return asHttpError(error).status ?? null;
}
