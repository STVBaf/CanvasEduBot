'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Circle, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';

// === 模拟数据 ===
const initialAssignments = [
  { 
    id: 1, 
    courseName: 'Python 程序设计', 
    courseCode: 'CS101', 
    title: 'Python 基础作业', 
    dueDate: '2025-12-12T23:59:00', 
    displayDue: '今天 23:59', 
    status: 'pending',
  },
  { 
    id: 2, 
    courseName: '线性代数', 
    courseCode: 'MATH202', 
    title: '矩阵运算测验', 
    dueDate: '2025-12-13T12:00:00', 
    displayDue: '明天 12:00', 
    status: 'pending',
  },
  { 
    id: 3, 
    courseName: '大学英语', 
    courseCode: 'ENG105', 
    title: '期中论文大纲', 
    dueDate: '2025-12-15T18:00:00', 
    displayDue: '周五 18:00', 
    status: 'submitted',
  },
  { 
    id: 4, 
    courseName: '数据结构', 
    courseCode: 'CS201', 
    title: '二叉树遍历算法实现', 
    dueDate: '2025-12-20T23:59:00', 
    displayDue: '12月20日 23:59', 
    status: 'pending',
  },
  { 
    id: 5, 
    courseName: '计算机网络', 
    courseCode: 'CS305', 
    title: 'Wireshark 抓包分析', 
    dueDate: '2025-12-24T10:00:00', 
    displayDue: '12月24日 10:00', 
    status: 'pending',
  },
];

const deadlines = [
  { id: 1, course: 'CS101', task: 'Python 基础作业', due: '今天 23:59', urgent: true },
  { id: 2, course: 'MATH202', task: '矩阵运算测验', due: '明天 12:00', urgent: false },
  { id: 3, course: 'ENG105', task: '期中论文大纲', due: '周五 18:00', urgent: false },
];

export default function SchedulePage() {
  const [assignments] = useState(initialAssignments);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const filteredAssignments = assignments.filter(assign => {
    if (showPendingOnly) {
      return assign.status === 'pending';
    }
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">日程安排</h1>
          <p className="text-muted-foreground mt-1">查看所有即将到来的截止日期和考试</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Assignment Table */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div variants={item}>
            <Card className="border-none shadow-sm overflow-hidden bg-white rounded-[2rem]">
              <CardHeader className="border-b border-gray-100 pb-4 px-8 pt-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    作业截止列表
                  </CardTitle>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPendingOnly(!showPendingOnly)}
                      className={`
                        flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all
                        ${showPendingOnly 
                          ? 'bg-black text-white shadow-md' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        }
                      `}
                    >
                      {showPendingOnly ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
                      {showPendingOnly ? '显示全部' : '只看未完成'}
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 font-medium">
                      <tr>
                        <th className="px-8 py-4 text-left tracking-wider">状态</th>
                        <th className="px-6 py-4 text-left tracking-wider">作业名称</th>
                        <th className="px-6 py-4 text-left tracking-wider">课程</th>
                        <th className="px-6 py-4 text-left tracking-wider">截止时间</th>
                        {/* 删除了操作列 Header */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assign) => (
                          <tr key={assign.id} className="group hover:bg-gray-50/80 transition-colors">
                            <td className="px-8 py-5 whitespace-nowrap">
                              {assign.status === 'submitted' ? (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full w-fit">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span className="text-xs font-bold">已提交</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit">
                                  <Circle className="w-4 h-4" />
                                  <span className="text-xs font-bold">进行中</span>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5">
                              {/* 删除了优先级显示，只保留标题 */}
                              <span className="font-bold text-gray-900 group-hover:text-primary transition-colors text-base">
                                {assign.title}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                  {assign.courseCode.substring(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-gray-900">{assign.courseCode}</span>
                                  <span className="text-xs text-muted-foreground">{assign.courseName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <CalendarIcon className="w-4 h-4 text-gray-400" />
                                {assign.displayDue}
                              </div>
                            </td>
                            {/* 删除了操作列 Cell */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-12 text-muted-foreground">
                            没有符合条件的作业 🎉
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Calendar Widget */}
        <div className="space-y-8">
          <motion.div variants={item}>
            <Card className="bg-white sticky top-8 rounded-[2rem] border-none shadow-sm">
              <CardHeader className="pb-2 pt-6 px-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" /> 日历视图
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                  {['一', '二', '三', '四', '五', '六', '日'].map(d => (
                    <div key={d} className="text-muted-foreground text-xs py-1">{d}</div>
                  ))}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === 11;
                    const hasEvent = [5, 11, 15, 24].includes(day);
                    return (
                      <div 
                        key={i} 
                        className={`
                          aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer hover:bg-gray-100 transition-colors
                          ${isToday ? 'bg-black text-white hover:bg-black shadow-md' : ''}
                          ${hasEvent && !isToday ? 'font-bold text-orange-600 bg-orange-50' : ''}
                        `}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                
                <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">即将截止</h3>
                  {deadlines.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-orange-50 transition-colors group cursor-pointer">
                      <div className={`w-2 h-2 mt-2 rounded-full ${item.urgent ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{item.task}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-orange-700">{item.course} • {item.due}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}