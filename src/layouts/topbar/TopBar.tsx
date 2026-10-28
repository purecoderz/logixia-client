import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, LogOut, Menu, Search, Settings } from "lucide-react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { CohortSwitcher } from "./CohortSwitcher";


interface TopbarProps {
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Topbar({ isCollapsed, onToggleCollapse }: TopbarProps) {
    const { profile, logout } = useAuth();
    const label = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // close on outside click and on Escape
    useEffect(() => {
        if (!menuOpen) return;
        const onClick = (e: MouseEvent) => {
            if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [menuOpen]);


    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#30363d] bg-[#161b22] px-4 md:px-6">
                <button
                    type="button"
                    onClick={onToggleCollapse}
                    title={label}
                    aria-label={label}
                    aria-expanded={!isCollapsed}
                    className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff] md:flex"
                >
                    <Menu size={20} aria-hidden />
                </button>

                <div className="relative hidden max-w-md flex-1 sm:block">
                    <Search
                        size={16}
                        aria-hidden
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]"
                    />
                    <input
                        type="search"
                        placeholder="Search"
                        aria-label="Search"
                        className="h-9 w-full rounded-lg border border-[#30363d] bg-[#0d1117] pl-9 pr-3 text-sm text-[#c9d1d9] placeholder:text-[#8b949e] outline-none focus:border-[#58a6ff]"
                    />
                </div>

                <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
                    {profile && <CohortSwitcher />}

                    <button
                        type="button"
                        aria-label="Notifications"
                        title="Notifications"
                        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#c9d1d9] transition-colors hover:bg-[#21262d] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
                    >
                        <Bell size={20} aria-hidden />
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#da3633]" />
                    </button>

                    {profile ? (
                        <div
                            ref={menuRef}
                            className="relative"
                            onMouseEnter={() => setMenuOpen(true)}
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            <button
                                type="button"
                                onClick={() => setMenuOpen((o) => !o)}
                                aria-haspopup="menu"
                                aria-expanded={menuOpen}
                                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#21262d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#58a6ff]"
                            >
                                <span
                                    aria-hidden
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#21262d] text-xs font-bold uppercase text-white"
                                >
                                    {profile.username.charAt(0)}
                                </span>
                                <div className="hidden flex-col text-left leading-tight sm:flex">
                                    <span className="font-mono text-sm font-semibold text-white">
                                        {profile.username}
                                    </span>
                                    <span className="font-mono text-[10px] text-[#8b949e]">Student</span>
                                </div>
                            </button>

                            {menuOpen && (
                                // pt-2 keeps the hover area connected, so the menu doesn't close crossing the gap
                                <div className="absolute right-0 top-full z-50 w-48 pt-2">
                                    <div
                                        role="menu"
                                        className="overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] py-1 shadow-xl"
                                    >
                                        <Link
                                            to="/settings"
                                            role="menuitem"
                                            onClick={() => setMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2 font-mono text-xs text-[#c9d1d9] hover:bg-[#21262d] hover:text-white"
                                        >
                                            <Settings size={15} aria-hidden />
                                            Profile settings
                                        </Link>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setMenuOpen(false);
                                                setIsLogoutModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-2.5 px-3 py-2 text-left font-mono text-xs text-[#f85149] hover:bg-[#21262d]"
                                        >
                                            <LogOut size={15} aria-hidden />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg bg-[#238636] px-4 py-1.5 text-sm font-medium text-white"
                        >
                            Sign in
                        </Link>
                    )}
                </div>
            </header>
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                title="Sign Out of Logixia?"
                message="You will lose access to your active live session until you log back in."
                confirmText="Yes, Sign Out"
                variant="danger"
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={() => {
                    logout();
                    setIsLogoutModalOpen(false);
                }}
            />
        </>
    );
}