'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
// import { api } from '@/lib/api'; 接后端

interface Group {
  id: number;
  name: string;
  members: string[];
  leader: string;
}

export default function GroupPage() {
  const params = useParams();
  const courseId = Number(params.courseId);
  const currentUser = "我";

  /*真实数据
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // const data = await api.getCourseGroups(courseId);
        // setGroups(data);
      } catch (err) {
        console.error("加载小组失败", err);
      }
    };
    fetchGroups();
    */

  //模拟小组数据（假数据）
  const [groups, setGroups] = useState<Group[]>([
    { id: 1, name: '第一组：EDG', members: ['张磊', '李一凡'], leader: '张磊' },
    { id: 2, name: '第二组：TE', members: ['张桐瑞轩'], leader: '张桐瑞轩'},
  ]);

  const [newGroupName, setNewGroupName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  //加入小组
  const handleJoinGroup = (groupName: string, groupId: number) => {
    const alreadyInGroup = groups.some(g => g.members.includes(currentUser));
    if (alreadyInGroup) {
      alert("你已经加入了一个小组，请先退出或解散当前小组！");
      return;
    }

    if (!confirm(`确认要加入小组“${groupName}”吗？`)) {
        return;
      }

    /* 后端接口: await api.joinGroup(groupId); */

    //Mock
    const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return { ...group, members: [...group.members, currentUser] };
        }
        return group;
      });
      setGroups(updatedGroups);
  };

  //退出小组
  const handleQuitGroup = (groupName: string, groupId: number) => {
    /* 后端接口: await api.quitGroup(groupId); */

    if (!confirm(`确认要退出小组“${groupName}”吗？`)) {
        return;
      }

    //Mock
    const updatedGroups = groups.map(group => {
        if (group.id === groupId) {
          return { ...group, members: group.members.filter(m => m !== currentUser) };
        }
        return group;
      });
      setGroups(updatedGroups);
  };

  //解散小组
  const handleDisbandGroup = (groupId: number) => {
    if (!confirm("确定要解散这个小组吗？此操作不可恢复。")) return;

    /* 后端接口: await api.deleteGroup(groupId); */

    //Mock
    const updatedGroups = groups.filter(group => group.id !== groupId);
    setGroups(updatedGroups);
  };

  //点击创建按钮
  const handleCreateClick = () => {
    if (!newGroupName.trim()) {
      alert("请输入小组名称");
      return;
    }
    setIsModalOpen(true); // 打开弹窗
  };

  //确认创建
  const confirmCreateGroup = () => {
    /* 后端接口: await api.createGroup(courseId, newGroupName); */

    //Mock
    const newGroup: Group = {
      id: Date.now(),
      name: newGroupName,
      members: [currentUser],
      leader: currentUser
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setIsModalOpen(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 relative">
      <div className="mb-6">
        <Link href={`/courses/${params.courseId}`} className="text-gray-500 hover:text-gray-900">
          &larr; 返回课程详情
        </Link>
        <h1 className="text-2xl font-bold mt-2">👥 课程分组协作</h1>
        <p className="text-gray-600">选择一个小组加入，或者创建你自己的小组。</p>
      </div>

      {/*创建小组区域*/}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">新建小组名称</label>
          <input 
            type="text" 
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="例如：EDG"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button 
          onClick={handleCreateClick}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 h-10"
        >
          创建并加入
        </button>
      </div>

      {/*小组列表展示*/}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(group => {
          const isMember = group.members.includes(currentUser);
          const isLeader = group.leader === currentUser;
          
          return (
            <div key={group.id} className="border rounded-lg p-6 bg-white hover:shadow-md transition relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {group.members.length} 人
                  </span>
                  
                  {isLeader && (
                    <button 
                      onClick={() => handleDisbandGroup(group.id)}
                      className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                    >
                      解散小组
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-1">小组成员：</p>
                <p className="text-sm text-gray-800">
                  {group.members.length > 0 ? (
                    group.members.map(member => 
                      member === group.leader ? `${member}(组长)` : member
                    ).join('，') 
                  ) : (
                    <span className="text-gray-400">暂无成员</span>
                  )}
                </p>
              </div>

              {/*底部按钮：加入/退出*/}
              <div className="mt-auto">
                {isMember ? (
                  isLeader ? (
                    <button disabled className="w-full bg-gray-100 text-gray-400 py-2 rounded cursor-not-allowed text-sm">
                      你是组长 (请解散以移除)
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleQuitGroup(group.name, group.id)}
                      className="w-full border border-red-200 text-red-600 py-2 rounded hover:bg-red-50"
                    >
                      退出小组
                    </button>
                  )
                ) : (
                  <button 
                    onClick={() => handleJoinGroup(group.name, group.id)}
                    className="w-full border border-indigo-600 text-indigo-600 py-2 rounded hover:bg-indigo-50"
                  >
                    加入该组
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/*创造小组确认*/}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-4">确认创建小组</h3>
            <p className="text-gray-600 mb-6">
              小组名称：<span className="font-semibold text-indigo-600">{newGroupName}</span>
              <br/>
              <span className="text-sm text-gray-500">创建后你将自动成为<span className="font-bold text-indigo-600">组长</span>。</span>
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                取消
              </button>
              <button 
                onClick={confirmCreateGroup}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                确定创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}