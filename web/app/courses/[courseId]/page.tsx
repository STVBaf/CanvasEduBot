'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// import { api } from '@/lib/api'; 接后端

//作业
interface Assignment {
  id: number;
  name: string;
  due_at: string | null; // DDL
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.courseId; // 获取URL中的课程ID

  const [aiSummary, setAiSummary] = useState("正在生成课程智能总结...");
  
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const [loading, setLoading] = useState(true);

  //连接口的
  /*useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. 获取 AI 总结
        // const summaryData = await api.getCourseSummary(Number(courseId));
        // setAiSummary(summaryData.content);

        // 2. 获取作业列表
        // const assignmentsData = await api.getCourseAssignments(Number(courseId));
        // setAssignments(assignmentsData);
      } catch (error) {
        console.error("获取课程详情失败", error);
        setAiSummary("获取总结失败，请稍后重试。");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    */

  useEffect(() => {
    setTimeout(() => {
      setAiSummary(`
        【AI 课程助手总结】
        (这里是预留给 Agent 输出的区域)
      `);
    });

    const mockAssignments = [
      { id: 1, name: '期末大作业', due_at: '2025-12-20T23:59:00' },
      { id: 2, name: '第一次平时作业', due_at: '2025-09-15T23:59:00' },
      { id: 3, name: '小组汇报PPT', due_at: '2025-10-01T12:00:00' },
      { id: 4, name: '未设置DDL的练习', due_at: null },//假数据
    ];

    const sorted = mockAssignments.sort((a, b) => {
      if (!a.due_at) return 1;
      if (!b.due_at) return -1;
      return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
    });

    setAssignments(sorted);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <Link href="/courses" className="text-gray-500 hover:text-gray-900">
          &larr; 返回课程列表
        </Link>
        <h1 className="text-2xl font-bold">课程详情 (ID: {courseId})</h1>
        <Link 
          href={`/courses/${courseId}/groups`}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          进入分组协作 &rarr;
        </Link>
      </div>

      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
        <h2 className="text-xl font-bold text-indigo-900 mb-3">🤖 AI 智能总结 (Agent Output)</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm text-gray-700 whitespace-pre-line min-h-[100px]">
          {aiSummary}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">📅 作业列表 (按 DDL 排序)</h2>
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作业名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">截止时间 (DDL)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((work) => (
                <tr key={work.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{work.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {work.due_at ? new Date(work.due_at).toLocaleString() : '无截止日期'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {work.due_at && new Date(work.due_at) < new Date() ? (
                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">已截止</span>
                    ) : (
                      <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">进行中</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}