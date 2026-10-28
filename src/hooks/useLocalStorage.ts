import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
    const [value, setValue] = useState<T>(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? (JSON.parse(saved) as T) : initial;
        } catch {
            return initial;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // storage full or blocked; ignore
        }
    }, [key, value]);

    return [value, setValue] as const;
}