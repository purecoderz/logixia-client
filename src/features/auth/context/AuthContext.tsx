import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginPayload, User } from "../../../services/authservice";
import authservices from "../../../services/authservice";


interface AuthContextType {
    profile: User | null
    login: (payload: LoginPayload) => Promise<void>;
    isLoading: boolean
    logout: ()=>void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const login = async (payload: LoginPayload) => {
        await authservices.userLogin(payload)
        const response = await authservices.getCurrentUser()
        setProfile(response)
    }

    const logout = ()=>{
        authservices.logout()
        setProfile(null)
    }

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await authservices.getCurrentUser()
                setProfile(res)
            } catch (err) {
                authservices.logout()
            } finally {
                setIsLoading(false)
            }
        }
        checkLogin()
    }, [])




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