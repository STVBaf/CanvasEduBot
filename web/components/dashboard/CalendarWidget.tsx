'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

// 模拟数据 - 待后端接口
interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: Date;
  status: 'pending' | 'done' | 'scheduled';
}

const mockAssignments: Assignment[] = [
  { id: 1, title: '数据结构作业3', course: '数据结构', dueDate: new Date(2025, 11, 14), status: 'pending' },
  { id: 2, title: '算法设计报告', course: '算法分析', dueDate: new Date(2025, 11, 17), status: 'scheduled' },
  { id: 3, title: '软件工程文档', course: '软件工程', dueDate: new Date(2025, 11, 19), status: 'scheduled' },
  { id: 4, title: '机器学习实验', course: '机器学习', dueDate: new Date(2025, 11, 28), status: 'scheduled' },
];

export function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleDateString('zh-CN', { month: 'long' });

  // 获取某天的作业
  const getAssignmentsForDate = (day: number) => {
    return mockAssignments.filter(assignment => 
      assignment.dueDate.getDate() === day && 
      assignment.dueDate.getMonth() === currentDate.getMonth()
    );
  };

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // 星期标题
    weekDays.forEach((day, index) => (
      days.push(
        <div key={`weekday-${index}`} className="text-center text-xs font-medium text-gray-500 py-2">
          {day}
        </div>
      )
    ));

    // 空白天数
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // 日期
    for (let day = 1; day <= daysInMonth; day++) {
      const assignments = getAssignmentsForDate(day);
      const isToday = day === 1; // 示例中1号高亮
      const hasAssignment = assignments.length > 0;
      const isSelected = day === 5; // 示例中5号选中

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(day)}
          className={`
            relative aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-colors
            ${isToday ? 'bg-yellow-400 text-gray-900' : ''}
            ${isSelected && !isToday ? 'bg-gray-900 text-white' : ''}
            ${!isToday && !isSelected ? 'text-gray-700 hover:bg-gray-100' : ''}
          `}
        >
          {day}
          {hasAssignment && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
          )}
        </motion.button>
      );
    }

    return days;
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">训练日历</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <button className="p-1 hover:bg-gray-700 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>{monthName}</span>
            <button className="p-1 hover:bg-gray-700 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {renderCalendar()}
        </div>

        {/* 状态说明 */}
        <div className="flex items-center gap-4 mt-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span className="text-gray-400">当前日期</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <span className="text-gray-400">已完成</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-gray-400">已安排</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
