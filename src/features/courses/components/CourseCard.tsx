import React from 'react';

export interface CreateCourse {
  title: string;
  description: string;
}

interface CourseCardProps {
  course: CreateCourse;
  onSelect?: () => void;
}

/**
 * Utility to extract 1-2 character monogram initials from the course title.
 */
const getTitleInitials = (title: string): string => {
  if (!title) return 'CC';
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const initials = getTitleInitials(course.title);

  return (
    <div
      onClick={onSelect}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    >
      {/* 1. Subtle Gradient Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 2. Background Ambient Glow Effect */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500 pointer-events-none" />

      <div className="space-y-4 relative z-10">
        {/* Monogram Icon & Interaction Chevron */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 group-hover:border-indigo-500/40 group-hover:text-indigo-300 group-hover:scale-105 transition-all duration-300 shadow-inner">
            {initials}
          </div>

          <div className="w-7 h-7 rounded-lg bg-slate-950/50 border border-slate-800/60 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:translate-x-0.5 transition-all duration-300">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Course Title & Description Block */}
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
            {course.title || 'Untitled Course'}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-normal">
            {course.description || 'No description provided for this course yet.'}
          </p>
        </div>
      </div>

      {/* Subtle Bottom Accent Line */}
      <div className="pt-4 mt-4 border-t border-slate-800/50 flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
        <span>Course Overview</span>
        <span className="font-mono text-indigo-400/80 opacity-0 group-hover:opacity-100 transition-opacity">
          Open →
        </span>
      </div>
    </div>
  );
};

export default CourseCard;