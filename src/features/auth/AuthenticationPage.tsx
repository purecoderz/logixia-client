import "./auth-theme.css";
import { ThemeProvider } from "../theme/ThemeProvider";
import { ThemeToggle } from "../theme/ThemeToggle";
import { DepartingPublicHeader } from "../../layouts/PublicLayout/DepartingPublicHeader";
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
    <ThemeProvider>
      <DepartingPublicHeader />
      <div className="absolute right-4 top-4 z-30">
        <ThemeToggle />
      </div>
      <div className="min-h-screen w-full bg-canvas text-body grid grid-cols-1 lg:grid-cols-2">
        <div className="lg:sticky lg:top-0 lg:h-screen">
          <BrandHero isLogin={isLogin} />
        </div>
        <AuthForm isLogin={isLogin} onToggleAuth={toggleAuth} />
      </div>
    </ThemeProvider>
  );
};

export default AuthPage;
