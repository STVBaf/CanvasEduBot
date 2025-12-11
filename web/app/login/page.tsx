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
        </button>
      </div>
    </div>
  );
}