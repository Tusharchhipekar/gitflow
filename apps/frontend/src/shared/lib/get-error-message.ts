import { isAxiosError } from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      { message?: unknown; error?: unknown } | undefined;

    if (typeof data?.message === "string") return data.message;
    if (typeof data?.error === "string") return data.error;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}
