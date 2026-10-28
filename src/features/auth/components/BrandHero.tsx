import React from 'react';

interface BrandHeroProps {
  isLogin: boolean;
}

export const BrandHero: React.FC<BrandHeroProps> = ({ isLogin }) => {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-[#161b22] border-r border-[#30363d] p-12 lg:p-16 h-screen sticky top-0 text-[#c9d1d9]">
      {/* Top Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#0d1117] border border-[#30363d] text-[#58a6ff] rounded-xl flex items-center justify-center font-mono font-bold text-lg">
          &lt;/&gt;
        </div>
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          Logixia <span className="text-[#58a6ff]">Academy</span>
        </span>
      </div>

      {/* Hero Content */}
      <div
        key={isLogin ? 'hero-login' : 'hero-signup'}
        className="my-auto max-w-lg animate-fade-in"
      >
        <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight mb-6 text-white">
          {isLogin ? 'Welcome back to the workspace.' : 'Build your future in the browser.'}
        </h1>
        <p className="text-[#8b949e] text-base mb-8 leading-relaxed">
          Master full-stack software development with real-time browser compilation and interactive exercises.
        </p>

        {/* Code Box */}
        <div className="font-mono text-xs bg-[#0d1117] p-5 rounded-2xl border border-[#30363d] text-[#c9d1d9] shadow-lg">
          <div className="flex gap-2 mb-4 pb-3 border-b border-[#30363d]">
            <span className="w-3 h-3 rounded-full bg-[#30363d] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#30363d] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#30363d] inline-block"></span>
            <span className="ml-2 text-[#8b949e] text-[11px]">workspace.tsx</span>
          </div>
          <p className="text-[#8b949e]">// Logixia Interactive Compiler</p>
          <p>
            <span className="text-[#ff7b72]">import</span> &#123; Developer &#125;{' '}
            <span className="text-[#ff7b72]">from</span>{' '}
            <span className="text-[#a5d6ff]">'@logixia/core'</span>;
          </p>
          <p className="mt-2">
            <span className="text-[#ff7b72]">const</span> student ={' '}
            <span className="text-[#ff7b72]">new</span>{' '}
            <span className="text-[#79c0ff] font-semibold">Developer</span>();
          </p>
          <p>
            <span className="text-[#ff7b72]">await</span> student.
            <span className="text-[#d2a8ff]">
              {isLogin ? 'resumeLearning' : 'initializeAccount'}
            </span>
            ();
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-[#30363d] flex items-center justify-between text-xs text-[#8b949e] font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse"></span>
          <span>Cloud IDE v2.4 Online</span>
        </div>
        <div>
          <span className="text-white font-bold">100%</span> Browser Execution
        </div>
      </div>
    </div>
  );
};