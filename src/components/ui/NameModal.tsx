// components/NameModal.tsx
import { useEffect, useRef, useState } from "react";

type NameModalProps = {
    title: string;
    confirmLabel?: string;
    initialValue?: string;
    validate?: (name: string) => string | null; // return an error message or null
    onSubmit: (name: string) => void;
    onClose: () => void;
};

export function NameModal({
    title,
    confirmLabel = "Create",
    initialValue = "",
    validate,
    onSubmit,
    onClose,
}: NameModalProps) {
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    const submit = () => {
        const name = value.trim();
        const err = !name ? "Name is required" : validate?.(name) ?? null;
        if (err) return setError(err);
        onSubmit(name);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onMouseDown={onClose}
        >
            <div
                className="w-80 rounded-md border border-[#30363d] bg-[#161b22] p-4 text-[#c9d1d9] shadow-xl"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h2 className="mb-3 text-sm font-semibold">{title}</h2>

                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setError(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submit();
                        if (e.key === "Escape") onClose();
                    }}
                    className={`w-full rounded-sm border bg-[#0d1117] px-2 py-1 text-sm outline-none ${
                        error ? "border-red-500" : "border-[#30363d] focus:border-[#58a6ff]"
                    }`}
                />
                {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="rounded-md border border-[#30363d] px-3 py-1 text-sm hover:bg-[#30363d]/60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={submit}
                        className="rounded-md bg-[#238636] px-3 py-1 text-sm text-white hover:bg-[#2ea043]"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}