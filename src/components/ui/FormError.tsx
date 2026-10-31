interface FormErrorProps {
  message: string;
  onDismiss?: () => void;
}

/** Red bar for a failed save. */
export function FormError({ message, onDismiss }: FormErrorProps) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3.5l9 15.5H3L12 3.5z" />
        <path d="M12 10v4M12 17v.1" />
      </svg>
      <span className="min-w-44 flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-11 rounded-lg px-2 font-semibold text-red-100 hover:bg-red-400/10"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}