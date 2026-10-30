import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LoginPayload, User } from "../../../services/authservice";
import authservices from "../../../services/authservice";
import { AUTH_EXPIRED_EVENT } from "../../../lib/http";

interface AuthContextType {
    profile: User | null
    login: (payload: LoginPayload) => Promise<void>;
    isLoading: boolean
    logout: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [profile, setProfile] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const login = async (payload: LoginPayload) => {
        await authservices.userLogin(payload)
        const response = await authservices.getCurrentUser()
        setProfile(response)
    }

    const logout = () => {
        authservices.logout()
        setProfile(null)
        queryClient.clear()
    }

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await authservices.getCurrentUser()
                setProfile(res)
            } catch {
                setProfile(null)
            } finally {
                setIsLoading(false)
            }
        }
        checkLogin()
    }, [])

    // session really expired (refresh failed): clear everything, the protected route redirects
    useEffect(() => {
        const onExpired = () => {
            setProfile(null)
            queryClient.clear()
        }
        window.addEventListener(AUTH_EXPIRED_EVENT, onExpired)
        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired)
    }, [queryClient])

    return (
        <AuthContext value={{ profile, login, isLoading, logout }}>
            {children}
        </AuthContext>
    )
}

export { AuthProvider }

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context
}