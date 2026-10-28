import React, { useState, useMemo } from 'react';

// ==========================================
// 1. Types Matching Backend Schema
// ==========================================

export interface CourseRoadmap {
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedHours?: number;
  modulesCount?: number;
  status?: 'published' | 'draft' | 'archived';
  topics?: string[];
  [key: string]: any; // Allows flexible backend dict properties
}

export interface Course {
  id: number;
  title: string;
  description: string;
  language_id: number;
  roadmap: CourseRoadmap | Record<string, any>;
}

export interface CourseStatsData {
  totalCourses: number;
  totalLanguages: number;
  totalHours: number;
  publishedCount: number;
}

// ==========================================
// 2. Language ID Mapping Dictionary
// ==========================================

export const LANGUAGE_MAP: Record<
  number,
  { name: string; badgeClass: string; textClass: string; gradient: string }
> = {
  1: {
    name: 'TypeScript',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    textClass: 'text-sky-400',
    gradient: 'from-sky-950/60 via-slate-900 to-slate-950',
  },
  2: {
    name: 'Python',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    textClass: 'text-amber-400',
    gradient: 'from-amber-950/60 via-slate-900 to-slate-950',
  },
  3: {
    name: 'Rust',
    badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    textClass: 'text-orange-400',
    gradient: 'from-orange-950/60 via-slate-900 to-slate-950',
  },
  4: {
    name: 'Go',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    textClass: 'text-cyan-400',
    gradient: 'from-cyan-950/60 via-slate-900 to-slate-950',
  },
  5: {
    name: 'SQL',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    textClass: 'text-purple-400',
    gradient: 'from-purple-950/60 via-slate-900 to-slate-950',
  },
};

const getLanguageMeta = (languageId: number) => {
  return (
    LANGUAGE_MAP[languageId] || {
      name: `Lang #${languageId}`,
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      textClass: 'text-indigo-400',
      gradient: 'from-indigo-950/60 via-slate-900 to-slate-950',
    }
  );
};

const getInitials = (title: string): string => {
  if (!title) return 'CC';
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// ==========================================
// 3. Sub-Components
// ==========================================

// --- Course Card Component (Grid View - Image Free) ---
export const CourseCard: React.FC<{
  course: Course;
  onSelect?: (id: number) => void;
}> = ({ course, onSelect }) => {
  const lang = getLanguageMeta(course.language_id);
  const initials = getInitials(course.title);
  const roadmap = course.roadmap || {};
  const status = roadmap.status || 'published';

  return (
    <div
      onClick={() => onSelect?.(course.id)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(course.id);
        }
      }}
      className="group relative bg-slate-900/90 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
    >
      {/* Abstract Header (No Image) */}
      <div
        className={`relative h-28 w-full bg-gradient-to-br ${lang.gradient} p-4 flex flex-col justify-between overflow-hidden border-b border-slate-800/60 select-none`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${lang.badgeClass}`}
          >
            {lang.name}
          </span>
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${
              status === 'published'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-200 group-hover:border-indigo-500/40 transition-all">
            {initials}
          </div>
          <span className="font-mono text-[11px] font-semibold text-slate-500">
            ID: #{course.id}
          </span>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {course.title || 'Untitled Course'}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {course.description || 'No description provided.'}
          </p>
        </div>

        {/* Roadmap Metadata Metrics */}
        <div className="space-y-3 pt-3 border-t border-slate-800/60">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Level
              </div>
              <div className="font-semibold text-slate-300">
                {roadmap.level || 'General'}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-950/50 border border-slate-800/50">
              <div className="text-[10px] text-slate-500 uppercase font-semibold">
                Modules
              </div>
              <div className="font-semibold text-slate-300">
                {roadmap.modulesCount ? `${roadmap.modulesCount} Units` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Topics Chips */}
          {Array.isArray(roadmap.topics) && roadmap.topics.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {roadmap.topics.slice(0, 3).map((topic: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 text-[10px] rounded bg-slate-800/60 text-slate-400 border border-slate-700/50"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-indigo-400 transition-colors">
          <span>Manage Curriculum</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- KPI Stats Summary ---
export const CourseStats: React.FC<{ stats: CourseStatsData }> = ({
  stats,
}) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
      <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
        Total Curricula
      </p>
      <p className="text-xl font-extrabold text-slate-100">
        {stats.totalCourses}
      </p>
    </div>
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
      <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
        Active Languages
      </p>
      <p className="text-xl font-extrabold text-indigo-400">
        {stats.totalLanguages}
      </p>
    </div>
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
      <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
        Est. Learning Hours
      </p>
      <p className="text-xl font-extrabold text-emerald-400">
        {stats.totalHours} hrs
      </p>
    </div>
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1">
      <p className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">
        Published
      </p>
      <p className="text-xl font-extrabold text-violet-400">
        {stats.publishedCount}
      </p>
    </div>
  </div>
);

// --- Toolbar Filters Component ---
export const CourseFilters: React.FC<{
  searchQuery: string;
  onSearchChange: (q: string) => void;
  languageFilter: number | 'all';
  onLanguageChange: (lang: number | 'all') => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateCourse?: () => void;
}> = ({
  searchQuery,
  onSearchChange,
  languageFilter,
  onLanguageChange,
  viewMode,
  onViewModeChange,
  onCreateCourse,
}) => (
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
    <div className="flex flex-1 items-center gap-2">
      {/* Search Input */}
      <div className="relative flex-1 max-w-xs">
        <svg
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search courses or roadmaps..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
      </div>

      {/* Language Filter */}
      <select
        value={languageFilter}
        onChange={(e) =>
          onLanguageChange(
            e.target.value === 'all' ? 'all' : Number(e.target.value)
          )
        }
        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
      >
        <option value="all">All Languages</option>
        {Object.entries(LANGUAGE_MAP).map(([id, meta]) => (
          <option key={id} value={id}>
            {meta.name}
          </option>
        ))}
      </select>
    </div>

    <div className="flex items-center gap-2 self-end sm:self-auto">
      {/* View Switcher */}
      <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onViewModeChange('grid')}
          className={`p-1 rounded ${
            viewMode === 'grid'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Grid View"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 002-2h2a2 2 0 002 2v2a2 2 0 00-2 2h-2a2 2 0 00-2-2V5zM11 13a2 2 0 002-2h2a2 2 0 002 2v2a2 2 0 00-2 2h-2a2 2 0 00-2-2v-2z" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`p-1 rounded ${
            viewMode === 'table'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Table View"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Create CTA */}
      <button
        onClick={onCreateCourse}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span>New Course</span>
      </button>
    </div>
  </div>
);

// ==========================================
// 4. Mock Backend Data conforming to Schema
// ==========================================

const MOCK_COURSES: Course[] = [
  {
    id: 101,
    title: 'Full-Stack Web Development Architecture',
    description:
      'Master modern React, TypeScript, Next.js, serverless architecture, and distributed backend systems.',
    language_id: 1,
    roadmap: {
      level: 'Advanced',
      estimatedHours: 48,
      modulesCount: 12,
      status: 'published',
      topics: ['React', 'Next.js', 'TRPC', 'Prisma'],
    },
  },
  {
    id: 102,
    title: 'Applied Machine Learning & Neural Networks',
    description:
      'Hands-on Python course covering PyTorch, data engineering pipelines, and LLM fine-tuning.',
    language_id: 2,
    roadmap: {
      level: 'Intermediate',
      estimatedHours: 36,
      modulesCount: 10,
      status: 'published',
      topics: ['PyTorch', 'Transformers', 'Pandas'],
    },
  },
  {
    id: 103,
    title: 'High-Performance Systems Programming',
    description:
      'Build memory-safe, concurrent, low-latency applications and microservices using modern Rust paradigms.',
    language_id: 3,
    roadmap: {
      level: 'Advanced',
      estimatedHours: 60,
      modulesCount: 14,
      status: 'published',
      topics: ['Async Tokio', 'Memory Safety', 'Wasm'],
    },
  },
  {
    id: 104,
    title: 'Cloud-Native Microservices & APIs',
    description:
      'Construct resilient microservices, gRPC endpoints, and automated Kubernetes orchestration.',
    language_id: 4,
    roadmap: {
      level: 'Intermediate',
      estimatedHours: 30,
      modulesCount: 8,
      status: 'draft',
      topics: ['gRPC', 'Docker', 'Kubernetes'],
    },
  },
];

// ==========================================
// 5. Main Orchestrator Component
// ==========================================

export const CoursesPage: React.FC<{
  onCreateCourse?: () => void;
  onSelectCourse?: (id: number) => void;
}> = ({ onCreateCourse, onSelectCourse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Computed Filter Logic
  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLang =
        languageFilter === 'all' || course.language_id === languageFilter;

      return matchesSearch && matchesLang;
    });
  }, [searchQuery, languageFilter]);

  // Derived KPI Stats
  const statsData: CourseStatsData = useMemo(() => {
    const totalHours = MOCK_COURSES.reduce(
      (acc, c) => acc + (c.roadmap?.estimatedHours || 0),
      0
    );
    const published = MOCK_COURSES.filter(
      (c) => (c.roadmap?.status || 'published') === 'published'
    ).length;
    const uniqueLangs = new Set(MOCK_COURSES.map((c) => c.language_id)).size;

    return {
      totalCourses: MOCK_COURSES.length,
      totalLanguages: uniqueLangs,
      totalHours,
      publishedCount: published,
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">
            Course Catalog
          </h2>
          <p className="text-xs text-slate-400">
            Manage your academy curricula, module content, and roadmap
            structures.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <CourseStats stats={statsData} />

      {/* Toolbar Filters */}
      <CourseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        languageFilter={languageFilter}
        onLanguageChange={setLanguageFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateCourse={onCreateCourse}
      />

      {/* Course List Render */}
      {filteredCourses.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-200">
            No courses match your filter
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or switching language filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onSelect={onSelectCourse}
            />
          ))}
        </div>
      ) : (
        /* Table Layout (Zero-Image Refactored) */
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Level</th>
                  <th className="py-3 px-4">Roadmap Units</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredCourses.map((course) => {
                  const lang = getLanguageMeta(course.language_id);
                  const initials = getInitials(course.title);
                  const roadmap = course.roadmap || {};
                  const status = roadmap.status || 'published';

                  return (
                    <tr
                      key={course.id}
                      onClick={() => onSelectCourse?.(course.id)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Title & Initials Monogram (No Image) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <div className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-xs text-indigo-400 flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                              {course.title}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {course.description}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Language Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${lang.badgeClass}`}
                        >
                          {lang.name}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                        {roadmap.level || 'General'}
                      </td>

                      {/* Roadmap Units */}
                      <td className="py-3 px-4 text-slate-300 font-mono whitespace-nowrap">
                        {roadmap.modulesCount
                          ? `${roadmap.modulesCount} Modules`
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border capitalize ${
                            status === 'published'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCourse?.(course.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-800 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;