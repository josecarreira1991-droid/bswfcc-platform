import { toast } from "sonner";

const CONNECTION_ERROR = "Erro de conexão. Tente novamente.";

/**
 * Wraps a server action with standardized error handling and toast notifications.
 *
 * Handles the three outcomes every server action can produce:
 *   1. The action returns `{ error: string }` — shows an error toast.
 *   2. The action succeeds (no error field) — shows a success toast and runs `onSuccess`.
 *   3. The action throws (network failure, etc.) — shows a connection error toast.
 *
 * Returns `true` when the action succeeded, `false` otherwise.
 */
export async function safeAction<T>(
  action: () => Promise<T>,
  options: {
    successMsg: string;
    errorMsg?: string;
    onSuccess?: (result: T) => void;
  },
): Promise<boolean> {
  try {
    const result = await action();

    const hasError =
      result != null &&
      typeof result === "object" &&
      "error" in result &&
      (result as Record<string, unknown>).error;

    if (hasError) {
      toast.error(String((result as Record<string, unknown>).error));
      return false;
    }

    toast.success(options.successMsg);
    options.onSuccess?.(result);
    return true;
  } catch {
    toast.error(options.errorMsg ?? CONNECTION_ERROR);
    return false;
  }
}
