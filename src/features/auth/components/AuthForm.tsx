import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { PasswordRequirements } from './PasswordRequirements';
import { SocialAuth } from './SocialAuth';
import authservices from '../../../services/authservice';
import { useAuth } from '../context/AuthContext';

interface AuthFormProps {
    isLogin: boolean;
    onToggleAuth: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin, onToggleAuth }) => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordsMatch = password.length > 0 && password === confirmPassword;

    const { login, profile, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (isLogin) {
            if (!email || !password) {
                setErrorMessage("Email and password required");
                return;
            }

            setIsSubmitting(true);
            try {
                await login({ email, password });
            } catch (err) {
                setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setIsSubmitting(false);
            }
        } else {
            if (!email || !password || !fullName || !username) {
                setErrorMessage("Make sure all fields are filled");
                return;
            }
            if (!passwordsMatch) {
                setErrorMessage("Passwords do not match!");
                return;
            }

            setIsSubmitting(true);
            try {
                const response = await authservices.createAccount({
                    email,
                    password,
                    username,
                    fullname: fullName,
                });
                setSuccessMessage(response.message);
                onToggleAuth();
            } catch (err) {
                setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoading) {
        return <p>Loading.....</p>;
    }

    if (profile) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 min-h-screen w-full bg-[#0d1117] text-[#c9d1d9]">
            <div
                key={isLogin ? 'form-login' : 'form-signup'}
                className="w-full max-w-md mx-auto animate-fade-in"
            >
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#161b22] border border-[#30363d] text-[#58a6ff] text-xs font-mono mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]"></span>
                        <span>Developer Portal v2.4</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        {isLogin ? 'Sign in to workspace' : 'Create developer account'}
                    </h2>
                    <p className="text-[#8b949e] text-sm mt-2">
                        {isLogin ? 'New to Logixia Academy? ' : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={onToggleAuth}
                            className="text-[#58a6ff] font-medium hover:underline transition-all focus:outline-none"
                        >
                            {isLogin ? 'Create an account' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-3">
                        <span>⚠️</span>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Error Alert */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-950 border border-green-700 rounded-xl text-green-400 text-xs font-mono flex items-center gap-3">
                        <span>⚠️</span>
                        <span>{successMessage}</span>
                    </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <>
                            <div className="animate-fade-in">
                                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value.toLowerCase().trim())}
                                    placeholder="e.g. Chuka Nnamdi"
                                    required={!isLogin}
                                    className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all placeholder:text-[#484f58]"
                                />
                            </div>

                            <div className="animate-fade-in">
                                <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e] font-mono text-sm select-none">
                                        @
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                                        placeholder="chukannd"
                                        required={!isLogin}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all placeholder:text-[#484f58] font-mono"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                            placeholder="developer@logixia.io"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all placeholder:text-[#484f58]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value.trim())}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-[#161b22] border border-[#30363d] text-white text-sm focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all placeholder:text-[#484f58] pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white text-xs font-mono"
                            >
                                {showPassword ? 'HIDE' : 'SHOW'}
                            </button>
                        </div>

                        {!isLogin && password.length > 0 && <PasswordRequirements password={password} />}
                    </div>

                    {!isLogin && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required={!isLogin}
                                    className={`w-full px-4 py-3 rounded-xl bg-[#161b22] border text-white text-sm focus:outline-none transition-all placeholder:text-[#484f58] pr-12 ${confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? 'border-[#238636] focus:ring-1 focus:ring-[#238636]'
                                            : 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                                        : 'border-[#30363d] focus:border-[#58a6ff]'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white text-xs font-mono"
                                >
                                    {showConfirmPassword ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                        </div>
                    )}

                    {isLogin && (
                        <div className="flex justify-end">
                            <a href="#forgot" className="text-xs font-mono text-[#8b949e] hover:text-[#58a6ff] transition-colors">
                                Forgot password?
                            </a>
                        </div>
                    )}

                    <button
                        disabled={isSubmitting}
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#238636] hover:bg-[#2ea043] text-white font-bold rounded-xl border border-[rgba(240,246,252,0.1)] transition-all duration-200 active:scale-[0.99] font-mono mt-2 shadow-sm"
                    >

                        {isSubmitting ? "loading.." : isLogin ? 'Sign In ->' : 'Create Free Account ->'}
                    </button>
                </form>

                <SocialAuth />
            </div>
        </div>
    );
};