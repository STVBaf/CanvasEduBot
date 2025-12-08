'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleEnterCourses = () => {
    const token = localStorage.getItem('canvas_token');
    if (!token) {
      alert('未检测到Token，请先在首页保存');
      router.push('/'); // 跳转到首页
    } else {
      router.push('/courses');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center space-y-4 w-96">
        <h2 className="text-3xl font-bold">已保存 Token？</h2>
        <p className="text-gray-600">点击按钮进入课程列表</p>
        <button
          onClick={handleEnterCourses}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full"
        >
          进入课程列表
        </button>
      </div>
    </div>
  );
}