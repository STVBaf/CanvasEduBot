'use client';
<<<<<<< HEAD
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
=======
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [token, setToken] = useState('');
  const router = useRouter();

  const saveToken = () => {
    const trimmedToken = token.trim();
    if (trimmedToken && trimmedToken.length > 20) {
      localStorage.setItem('canvas_token', trimmedToken);
      alert('Token已保存！即将进入课程列表确认页');
      router.push('/login'); // 保存后跳转到登录确认页
    } else {
      alert('请输入有效的Canvas Access Token（长度需大于20字符）');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 w-96 p-8 bg-white rounded-3xl shadow-sm">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
          C
        </div>
        <h1 className="text-3xl font-bold text-foreground">CanvasBot</h1>
        <p className="text-muted-foreground">一键同步 Canvas 课程与作业</p>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="请粘贴 Canvas Access Token"
          className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          onClick={saveToken}
          className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity"
        >
          保存并继续
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
        </button>
      </div>
    </main>
  );
}