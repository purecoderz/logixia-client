import React from "react";

interface BrandHeroProps {
  isLogin: boolean;
}

export const BrandHero: React.FC<BrandHeroProps> = ({ isLogin }) => {
  return (
    <div className="auth-brand-panel hidden lg:flex flex-col justify-between bg-surface border-r border-line p-12 lg:p-16 h-screen sticky top-0 text-body">
      {/* Top Logo */}
      <div className="flex items-center gap-3">
        <img
          src="/logixialogo.webp"
          alt=""
          className="h-12 w-12 shrink-0 object-contain"
        />
        <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
          Logixia <span className="text-accent">Academy</span>
        </span>
      </div>

      {/* Hero Content */}
      <div
        key={isLogin ? "hero-login" : "hero-signup"}
        className="my-auto max-w-lg animate-fade-in"
      >
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-6 text-foreground">
          {isLogin
            ? "Welcome back to the workspace."
            : "Build your future in the browser."}
        </h1>
        <p className="text-muted text-base mb-8 leading-relaxed">
          Master full-stack software development with real-time browser
          compilation and interactive exercises.
        </p>

        {/* Code Box */}
        <div className="font-mono text-xs bg-input p-5 rounded-2xl border border-line text-body shadow-lg">
          <div className="flex gap-2 mb-4 pb-3 border-b border-line">
            <span className="w-3 h-3 rounded-full bg-hover inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-hover inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-hover inline-block"></span>
            <span className="ml-2 text-muted text-[11px]">workspace.tsx</span>
          </div>
          <p className="text-muted">// Logixia Interactive Compiler</p>
          <p>
            <span className="text-danger">import</span> &#123; Developer &#125;{" "}
            <span className="text-danger">from</span>{" "}
            <span className="text-accent">'@logixia/core'</span>;
          </p>
          <p className="mt-2">
            <span className="text-danger">const</span> student ={" "}
            <span className="text-danger">new</span>{" "}
            <span className="text-accent font-semibold">Developer</span>();
          </p>
          <p>
            <span className="text-danger">await</span> student.
            <span className="text-warning">
              {isLogin ? "resumeLearning" : "initializeAccount"}
            </span>
            ();
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-line flex items-center justify-between text-xs text-muted font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
          <span>Cloud IDE v2.4 Online</span>
        </div>
        <div>
          <span className="text-foreground font-bold">100%</span> Browser
          Execution
        </div>
      </div>
    </div>
  );
};
