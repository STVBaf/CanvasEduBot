'use client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

<<<<<<< HEAD
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
=======
  const handleEnterCourses = () => {
    const token = localStorage.getItem('canvas_token');
    if (!token) {
      alert('未检测到Token，请先在首页保存');
      router.push('/'); // 跳转到首页
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 w-96 p-8 bg-white rounded-3xl shadow-sm">
        <h2 className="text-3xl font-bold text-foreground">准备就绪</h2>
        <p className="text-muted-foreground">Token 已保存，即将进入学习空间</p>
        <button
          onClick={handleEnterCourses}
          className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:opacity-90 transition-opacity"
        >
          进入仪表盘
>>>>>>> 912218083e6d5db2086272c75935fd422a011ff4
        </button>
      </div>
    </div>
  );
}