'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'fail'>('loading');

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam === 'success') {
      setStatus('success');
      setTimeout(() => router.push('/courses'), 2000);
    } else if (statusParam === 'fail') {
      setStatus('fail');
    }
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto mb-4"></div>
            <p>正在验证 Canvas 授权...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <svg className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
            </svg>
            <p>登录成功！即将跳转到课程列表...</p>
          </>
        )}
        {status === 'fail' && (
          <>
            <svg className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <p>登录失败，请返回重试</p>
            <button onClick={() => router.push('/login')} className="mt-4 px-4 py-2 border rounded">
              返回登录页
            </button>
          </>
        )}
      </div>
    </div>
  );
}