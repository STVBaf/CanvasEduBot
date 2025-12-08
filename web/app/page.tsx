'use client';
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center space-y-4 w-96">
        <h1 className="text-4xl font-bold text-gray-900">课程同步系统</h1>
        <p className="text-gray-600">一键同步 Canvas 课程与作业</p>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="请粘贴Canvas Access Token"
          className="px-4 py-2 border rounded w-full mb-2"
        />
        <button
          onClick={saveToken}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full"
        >
          保存Token
        </button>
      </div>
    </main>
  );
}