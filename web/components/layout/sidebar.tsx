'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Users, 
  BrainCircuit, 
  Settings, 
  LogOut 
} from 'lucide-react';

const navItems = [
  { name: '概览', href: '/dashboard', icon: LayoutDashboard },
  { name: '我的课程', href: '/dashboard/courses', icon: BookOpen },
  { name: '日程安排', href: '/dashboard/schedule', icon: CalendarDays },
  { name: '学习小组', href: '/dashboard/groups', icon: Users },
  { name: '知识库', href: '/dashboard/knowledge', icon: BrainCircuit },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-24 lg:w-64 flex flex-col h-screen py-8 px-4 bg-background fixed left-0 top-0 z-10">
      {/* Logo Area */}
      <div className="flex items-center justify-center lg:justify-start lg:px-4 mb-12">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
          C
        </div>
        <span className="hidden lg:block ml-3 text-xl font-bold text-foreground">CanvasBot</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-center lg:justify-start p-3 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-white shadow-sm text-primary" 
                  : "text-muted-foreground hover:bg-white/50 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-2")} />
              <span className={cn("hidden lg:block ml-4 font-medium", isActive && "font-bold")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="mt-auto space-y-4">
        <button className="w-full flex items-center justify-center lg:justify-start p-3 rounded-2xl text-muted-foreground hover:bg-white/50 hover:text-primary transition-all">
          <Settings className="w-6 h-6" />
          <span className="hidden lg:block ml-4 font-medium">设置</span>
        </button>
        
        <div className="pt-4 border-t border-gray-200/50">
          <Link href="/dashboard/profile" className="block">
            <div className="flex items-center justify-center lg:justify-start p-2 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {/* Placeholder Avatar */}
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
              <div className="hidden lg:block ml-3">
                <p className="text-sm font-bold text-foreground">同学你好</p>
                <p className="text-xs text-muted-foreground">在线</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
