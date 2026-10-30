import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BrandHero } from "./components/BrandHero";
import { AuthForm } from "./components/AuthForm";

export const AuthPage: React.FC = () => {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();

  const isLogin = !pathname.endsWith("/signup");

  const toggleAuth = () =>
    navigate(isLogin ? "/auth/signup" : "/auth/login", {
      state,
    });

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 grid grid-cols-1 lg:grid-cols-2">
      <div className="lg:sticky lg:top-0 lg:h-screen">
        <BrandHero isLogin={isLogin} />
      </div>
      <AuthForm isLogin={isLogin} onToggleAuth={toggleAuth} />
    </div>
  );
};

export default AuthPage;