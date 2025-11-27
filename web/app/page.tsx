'use client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">猪头Canvas会不会遇上Agent学姐</h1>
        <p className="text-gray-600">一键同步 Canvas 课程与作业</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          前往登录
        </button>
      </div>
    </main>
  );
}