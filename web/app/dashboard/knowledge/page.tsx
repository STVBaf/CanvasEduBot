'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Folder, 
  FileText, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  Plus, 
  Filter,
  File,
  FileImage,
  FileCode,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock Data
const folders = [
  { id: 1, name: 'CS101 计算机导论', count: 12, color: 'bg-blue-100 text-blue-600' },
  { id: 2, name: 'MATH202 线性代数', count: 8, color: 'bg-purple-100 text-purple-600' },
  { id: 3, name: 'ENG105 学术英语', count: 24, color: 'bg-green-100 text-green-600' },
  { id: 4, name: '个人项目', count: 5, color: 'bg-orange-100 text-orange-600' },
];

const recentFiles = [
  { id: 1, name: 'Lecture_05_Slides.pdf', type: 'pdf', size: '2.4 MB', date: '2小时前', course: 'CS101' },
  { id: 2, name: 'Project_Proposal_Draft.docx', type: 'doc', size: '1.1 MB', date: '5小时前', course: '个人项目' },
  { id: 3, name: 'Linear_Algebra_HW3.pdf', type: 'pdf', size: '856 KB', date: '昨天', course: 'MATH202' },
  { id: 4, name: 'main.py', type: 'code', size: '4 KB', date: '昨天', course: 'CS101' },
];

const allFiles = [
  ...recentFiles,
  { id: 5, name: 'Reading_List.txt', type: 'txt', size: '2 KB', date: '2天前', course: 'ENG105' },
  { id: 6, name: 'Lab_Report_Template.docx', type: 'doc', size: '450 KB', date: '3天前', course: 'CS101' },
  { id: 7, name: 'Screenshot_20241210.png', type: 'image', size: '3.2 MB', date: '1周前', course: '个人项目' },
  { id: 8, name: 'Database_Schema.sql', type: 'code', size: '12 KB', date: '1周前', course: '个人项目' },
];

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <FileImage className="w-5 h-5 text-purple-500" />;
      case 'code': return <FileCode className="w-5 h-5 text-green-500" />;
      default: return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredFiles = allFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">知识库</h1>
          <p className="text-muted-foreground mt-1">集中管理你的课程资料和个人笔记</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="搜索文件..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 bg-white"
            />
          </div>
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">上传文件</span>
          </button>
        </div>
      </div>

      {/* Folders Grid */}
      <motion.div variants={item}>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5 text-primary" /> 文件夹
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div 
              key={folder.id}
              className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${folder.color} flex items-center justify-center`}>
                  <Folder className="w-5 h-5" />
                </div>
                <button className="text-gray-300 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{folder.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{folder.count} 个文件</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Files & All Files Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main File List */}
        <motion.div variants={item} className="lg:col-span-2">
          <Card className="border-none shadow-sm bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="border-b border-gray-100 pb-4 px-8 pt-8 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> 所有文件
              </CardTitle>
              <button className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                <Filter className="w-4 h-4" /> 筛选
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 text-xs uppercase text-gray-400 font-medium">
                    <tr>
                      <th className="px-8 py-4 text-left tracking-wider">名称</th>
                      <th className="px-6 py-4 text-left tracking-wider">所属课程</th>
                      <th className="px-6 py-4 text-left tracking-wider">大小</th>
                      <th className="px-6 py-4 text-right tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredFiles.map((file) => (
                      <tr key={file.id} className="group hover:bg-gray-50/80 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                              {getFileIcon(file.type)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{file.date}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {file.course}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {file.size}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-primary transition-colors" title="下载">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-primary transition-colors" title="分享">
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors" title="删除">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar: Recent Activity / Storage */}
        <motion.div variants={item} className="space-y-6">
          {/* Storage Status */}
          <Card className="bg-black text-white rounded-[2rem] border-none shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">存储空间</h3>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-400">已使用</span>
                <span className="font-medium">4.2 GB / 10 GB</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
                <div className="bg-white h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900 p-3 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mb-2"></div>
                  <p className="text-xs text-gray-400">文档</p>
                  <p className="font-bold">2.1 GB</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mb-2"></div>
                  <p className="text-xs text-gray-400">图片</p>
                  <p className="font-bold">1.5 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white rounded-[2rem] border-none shadow-sm">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" /> 最近访问
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentFiles.slice(0, 3).map((file) => (
                  <div key={file.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">上次打开: {file.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
