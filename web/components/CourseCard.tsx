import React from 'react';
import { ArrowRight, FolderSync } from 'lucide-react';
import type { Course } from '@/lib/types';
import clsx from 'clsx';

interface CourseCardProps {
  course: Course;
  onSync: (id: number) => void;
}

export default function CourseCard({ course, onSync }: CourseCardProps) {
  return (
    <div className="relative p-6 rounded-[2rem] bg-[#EBE5D9] hover:bg-[#E3DDCF] transition-colors duration-300 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            {course.course_code || 'NO CODE'}
          </span>
          <h3 className="text-xl font-bold text-accent-dark leading-tight line-clamp-2">
            {course.name}
          </h3>
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onSync(course.id); }}
          className="w-10 h-10 flex items-center justify-center bg-accent-dark text-white rounded-full hover:bg-accent-yellow hover:text-accent-dark transition-all shadow-md"
          title="同步文件"
        >
          <FolderSync size={18} />
        </button>
      </div>

      {/* Footer Info */}
      <div className="flex items-end justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-orange"></span>
            <span className="text-xs font-medium text-gray-600">进行中</span>
          </div>
          <p className="text-xs text-gray-400">
            {course.start_at ? new Date(course.start_at).toLocaleDateString() : 'No Date'}
          </p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-accent-dark hover:shadow-md transition-all group-hover:translate-x-1">
          详情 <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
