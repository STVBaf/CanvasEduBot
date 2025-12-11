'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  Database,
  Settings,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: Home, label: '首页', href: '/dashboard' },
  { icon: BookOpen, label: '课程', href: '/dashboard/courses' },
  { icon: Calendar, label: '日历', href: '/dashboard/calendar' },
  { icon: Users, label: '小组', href: '/dashboard/groups' },
  { icon: Database, label: '知识库', href: '/dashboard/knowledge' },
  { icon: Settings, label: '设置', href: '/dashboard/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center py-8 z-50">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center">
          <Home className="w-6 h-6 text-gray-900" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-yellow-400 text-gray-900'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-400 rounded-l-full"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem('canvas_token');
          window.location.href = '/';
        }}
        className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-colors"
      >
        <LogOut className="w-6 h-6" />
      </button>
    </aside>
  );
}
