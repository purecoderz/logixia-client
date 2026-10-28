// components/ui/AlertModal.tsx
import React from "react";

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  variant?: "danger" | "warning" | "info";
  onClose: () => void;
}

const variantStyles = {
  danger: "bg-rose-600 hover:bg-rose-700 text-white",
  warning: "bg-amber-600 hover:bg-amber-700 text-white",
  info: "bg-[#1f6feb] hover:bg-[#388bfd] text-white",
};

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title = "Notice",
  message,
  buttonText = "OK",
  variant = "info",
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onMouseDown={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-2xl space-y-5"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="space-y-2">
          <h3 className="text-base font-bold text-white font-mono leading-snug">{title}</h3>
          <p className="text-xs text-[#8b949e] leading-relaxed font-sans">{message}</p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-colors ${variantStyles[variant]}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};