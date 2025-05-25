'use client';

import ResumeOptimizer from '@/components/ResumeOptimizer';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-black bg-gradient-to-b from-black via-[#0a0a23] to-black relative overflow-x-hidden">
      {/* 우주 별빛 효과 */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* 랜덤 별빛 (간단한 예시) */}
        <div className="absolute top-10 left-1/4 w-1 h-1 bg-white/80 rounded-full blur-[1.5px] animate-pulse" />
        <div className="absolute top-1/2 left-1/3 w-0.5 h-0.5 bg-yellow-200/80 rounded-full blur-[1.5px] animate-pulse" />
        <div className="absolute top-2/3 left-2/3 w-1.5 h-1.5 bg-blue-300/80 rounded-full blur-[2px] animate-pulse" />
        <div className="absolute top-1/4 left-3/4 w-0.5 h-0.5 bg-pink-300/80 rounded-full blur-[1.5px] animate-pulse" />
        <div className="absolute top-3/4 left-1/5 w-1 h-1 bg-white/60 rounded-full blur-[1.5px] animate-pulse" />
        {/* ...더 추가 가능 */}
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-zinc-900/80 shadow-2xl border border-zinc-800 p-8 backdrop-blur-md">
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-lg">
            AI Resume Optimizer
          </h1>
          <p className="text-zinc-300 mb-8 text-lg drop-shadow">
            Optimize your resume for specific job descriptions using AI
          </p>
          <ResumeOptimizer />
        </div>
      </div>
    </main>
  );
}
