import React from 'react';
import  type { CourseStatsData } from '../types/course.types';

interface CourseStatsProps {
  stats: CourseStatsData;
}

export const CourseStats: React.FC<CourseStatsProps> = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Courses',
      value: stats.totalCourses,
      subtext: `${stats.publishedCourses} Published`,
      icon: (
        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      label: 'Enrolled Students',
      value: stats.totalStudents.toLocaleString(),
      subtext: 'Across all cohorts',
      icon: (
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    },
    {
      label: 'Avg Completion Rate',
      value: `${stats.avgCompletionRate}%`,
      subtext: '+3.2% this month',
      icon: (
        <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statItems.map((item, idx) => (
        <div
          key={idx}
          className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-sm"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400">{item.label}</p>
            <p className="text-2xl font-bold text-slate-100 tracking-tight">{item.value}</p>
            <p className="text-[11px] text-slate-500">{item.subtext}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex-shrink-0">
            {item.icon}
          </div>
        </div>
      ))}
    </div>
  );
};