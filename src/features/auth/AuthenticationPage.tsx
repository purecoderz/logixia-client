import React, { useState } from 'react';
import { BrandHero } from './components/BrandHero';
import { AuthForm } from './components/AuthForm';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 grid grid-cols-1 lg:grid-cols-2 overflow-x-hidden">
      <BrandHero isLogin={isLogin} />
      <AuthForm isLogin={isLogin} onToggleAuth={() => setIsLogin(!isLogin)} />
    </div>
  );
};

export default AuthPage;