'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleCanvasLogin = () => {
    router.push('/callback?status=loading');//接后端OAuth
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">猪头Canvas会不会遇上Agent学姐</h2>
        <p className="mt-2 text-sm text-gray-600">通过 Canvas 账号登录，同步你的课程</p>
        <button
          onClick={handleCanvasLogin}
          className="w-full flex justify-center items-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          使用 Canvas 登录
        </button>
      </div>
    </div>
  );
}