'use client';
import { useEffect } from 'react';

export default function CallbackPage() {
  useEffect(() => {
    // 可在此处添加从URL获取Token等逻辑（如果需要OAuth回调）
    window.location.href = '/courses';
  }, []);

  return null;
}