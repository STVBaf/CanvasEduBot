'use client';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopbarProps {
  userName?: string;
}

export function Topbar({ userName = 'Amanda' }: TopbarProps) {
  return (
    <header className="fixed top-0 left-20 right-0 h-20 bg-gray-50/80 backdrop-blur-sm border-b border-gray-200 z-40">
      <div className="h-full px-8 flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hi, {userName}!</h1>
          <p className="text-sm text-gray-500">让我们看看你今天的活动</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索课程资料..."
              className="pl-10 pr-4 py-2 w-80 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
          </div>

          {/* Upgrade Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            升级
          </motion.button>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-200 rounded-xl transition-colors">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-2 hover:bg-gray-200 px-3 py-2 rounded-xl transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full"></div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
