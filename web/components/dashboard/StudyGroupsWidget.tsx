'use client';
import { motion } from 'framer-motion';
import { Users, MoreHorizontal } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/card';

// 模拟数据 - 待后端接口
interface StudyGroup {
  id: number;
  name: string;
  trainer: string;
  sessionsCompleted: number;
  totalSessions: number;
  members: number;
  color: string;
}

const mockGroups: StudyGroup[] = [
  {
    id: 1,
    name: '数据结构学习',
    trainer: 'Alice McCain',
    sessionsCompleted: 9,
    totalSessions: 12,
    members: 5,
    color: 'from-orange-400 to-red-400',
  },
  {
    id: 2,
    name: '算法分析讨论',
    trainer: 'Jennifer Lubin',
    sessionsCompleted: 6,
    totalSessions: 10,
    members: 4,
    color: 'from-purple-400 to-pink-400',
  },
  {
    id: 3,
    name: '软件工程实践',
    trainer: 'Johnson Cooper',
    sessionsCompleted: 4,
    totalSessions: 8,
    members: 6,
    color: 'from-green-400 to-emerald-400',
  },
  {
    id: 4,
    name: '机器学习研讨',
    trainer: 'Sarah Wilson',
    sessionsCompleted: 8,
    totalSessions: 10,
    members: 5,
    color: 'from-blue-400 to-cyan-400',
  },
];

export function StudyGroupsWidget() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>学习小组</CardTitle>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            新建 +
          </motion.button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {mockGroups.map((group) => (
            <motion.div
              key={group.id}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* 小组图标 */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${group.color} flex items-center justify-center flex-shrink-0`}>
                <Users className="w-6 h-6 text-white" />
              </div>

              {/* 小组信息 */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{group.name}</h4>
                <p className="text-xs text-gray-500">组长: {group.trainer}</p>
              </div>

              {/* 进度条 */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">完成进度:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {group.sessionsCompleted}/{group.totalSessions}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(group.sessionsCompleted / group.totalSessions) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className={`h-full bg-gradient-to-r ${group.color}`}
                  />
                </div>
              </div>

              {/* 更多操作 */}
              <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-400" />
              </button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
