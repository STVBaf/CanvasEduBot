'use client';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 模拟数据 - 待后端接口
const mockKnowledgeData = [
  { subject: '数据结构', hours: 12 },
  { subject: '算法', hours: 8 },
  { subject: '软件工程', hours: 15 },
  { subject: '机器学习', hours: 10 },
  { subject: '数据库', hours: 6 },
];

const mockStats = {
  totalFiles: 248,
  totalNotes: 56,
  studyHours: 51,
  completionRate: 78,
};

export function KnowledgeBaseWidget() {
  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white"
        >
          <div className="text-3xl font-bold">{mockStats.totalFiles}</div>
          <div className="text-sm text-blue-100 mt-1">文件总数</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white"
        >
          <div className="text-3xl font-bold">{mockStats.totalNotes}</div>
          <div className="text-sm text-purple-100 mt-1">笔记数量</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white"
        >
          <div className="text-3xl font-bold">{mockStats.studyHours}h</div>
          <div className="text-sm text-orange-100 mt-1">学习时长</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white"
        >
          <div className="text-3xl font-bold">{mockStats.completionRate}%</div>
          <div className="text-sm text-green-100 mt-1">完成率</div>
        </motion.div>
      </div>

      {/* 学习时长图表 */}
      <Card>
        <CardHeader>
          <CardTitle>各科目学习时长</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockKnowledgeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="subject" 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar 
                dataKey="hours" 
                fill="url(#colorGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
