'use client';
import React from 'react';
import { Home, BookOpen, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('canvas_token');
    router.push('/');
  };

  const navItems = [
    { icon: Home, label: '主页', path: '/courses' },
    { icon: BookOpen, label: '课程', path: '/courses' },
    { icon: Calendar, label: '日程', path: '/calendar' },
    { icon: Users, label: '小组', path: '/groups' },
    { icon: Settings, label: '设置', path: '/settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-24 h-[calc(100vh-2rem)] m-4 bg-white rounded-[2rem] shadow-sm items-center py-8 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="mb-12 w-12 h-12 bg-accent-dark rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
        C
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-6 w-full px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path === '/courses' && pathname === '/courses');
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={clsx(
                "relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 group",
                isActive ? "bg-accent-yellow text-accent-dark shadow-md" : "text-gray-400 hover:bg-cream-100 hover:text-accent-dark"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              
              {/* Tooltip */}
              <span className="absolute left-16 bg-accent-dark text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="mt-auto w-12 h-12 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
        title="退出登录"
      >
        <LogOut size={24} />
      </button>
    </aside>
  );
}
