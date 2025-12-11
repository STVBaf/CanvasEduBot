'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Key, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [token, setToken] = useState('');
  const router = useRouter();

  const saveToken = () => {
    const trimmedToken = token.trim();
    if (trimmedToken && trimmedToken.length > 20) {
      localStorage.setItem('canvas_token', trimmedToken);
      router.push('/dashboard'); 
    } else {
      alert('请输入有效的 Canvas 访问令牌 (>20 字符)');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F2EB] relative overflow-hidden p-4 font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFD54F]/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FF8A65]/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-white/50">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gray-900 text-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-6 hover:rotate-0 transition-transform duration-300">
              <ShieldCheck size={36} className="text-[#FFD54F]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Canvas 助手</h1>
            <p className="text-gray-500 font-medium text-base">连接你的学习之旅</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-4">访问令牌 (Access Token)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-gray-900 transition-colors">
                  <Key size={20} />
                </div>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="在此粘贴您的 Canvas 令牌..."
                  className="w-full pl-14 pr-6 py-5 bg-[#F5F2EB]/50 border-2 border-transparent focus:border-gray-900/10 focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-gray-900 placeholder:text-gray-400/50 shadow-inner"
                />
              </div>
            </div>

            <button
              onClick={saveToken}
              className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-bold text-lg shadow-lg hover:bg-[#FFD54F] hover:text-gray-900 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
            >
              开始使用
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 font-medium">
              您的令牌仅存储在本地，绝不会被共享。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}