
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Project, STATUS_MAP } from '../types';
import { 
  ChevronLeft, Plus, Grid, Map, CheckCircle2, 
  Activity, AlertCircle, ChevronDown, ChevronUp 
} from 'lucide-react';

const COLORS = [
  'bg-[#fef08a]', // 黄色
  'bg-[#93c5fd]', // 蓝色
  'bg-[#fecaca]', // 红色
  'bg-[#bbf7d0]', // 绿色
  'bg-[#d8b4fe]', // 紫色
];

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isFailedExpanded, setIsFailedExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    db.projects.where('recordType').equals('project').toArray().then(setProjects);
  }, []);

  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => ['negotiation', 'contract_signed', 'executing'].includes(p.status)).length;
    const failed = projects.filter(p => p.status === 'failed').length;
    return { total, completed, inProgress, failed };
  }, [projects]);

  const groupedProjects = useMemo(() => {
    return {
      completed: projects.filter(p => p.status === 'completed'),
      inProgress: projects.filter(p => ['negotiation', 'contract_signed', 'executing'].includes(p.status)),
      failed: projects.filter(p => p.status === 'failed')
    };
  }, [projects]);

  const handleCreate = async () => {
    const newId = crypto.randomUUID();
    const newProject: Project = {
      id: newId,
      recordType: 'project',
      name: '',
      status: 'negotiation',
      cooperationType: 'controlled',
      companies: '',
      contacts: '',
      keyContacts: '',
      milestones: '',
      nextStep: '',
      challenges: '',
      review: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.projects.add(newProject);
    navigate(`/projects/${newId}`);
  };

  const getFirstLine = (text: string) => text.split('\n')[0] || '暂无内容';

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md z-30 px-6 pt-4 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 text-black">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black tracking-tighter text-black/80">所有项目</h1>
          <button onClick={handleCreate} className="p-2 text-blue-600 active:scale-90 transition-transform">
            <Plus size={24} />
          </button>
        </div>

        {/* View Switcher Tab */}
        <div className="flex p-1 bg-slate-100 rounded-2xl w-full mb-2">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-slate-400'}`}
          >
            <Grid size={16} /> 列表视图
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'map' ? 'bg-white text-black shadow-sm' : 'text-black'}`}
          >
            <Map size={16} /> 进度地图
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {viewMode === 'list' ? (
          /* Original List View */
          <div className="grid grid-cols-2 gap-3">
            {projects.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className={`${COLORS[idx % COLORS.length]} rounded-[32px] p-5 aspect-square flex flex-col justify-between active:scale-95 transition-transform cursor-pointer shadow-sm`}
              >
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">
                    {STATUS_MAP[p.status].label}
                  </p>
                  <h3 className="text-lg font-black leading-tight text-black/80 break-words">
                    {p.name || '未命名项目'}
                  </h3>
                </div>
                <div className="flex flex-col gap-1">
                   <div className="w-8 h-8 bg-black/10 rounded-full flex items-center justify-center">
                      <span className="text-xs">{STATUS_MAP[p.status].icon}</span>
                   </div>
                   <p className="text-[10px] font-bold text-black/30 truncate">{p.companies || '未指定公司'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Progress Map View */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Summary */}
            <div className="grid grid-cols-4 gap-2 px-1">
              {[
                { label: '总项目', val: stats.total, color: 'text-slate-900' },
                { label: '进行中', val: stats.inProgress, color: 'text-blue-600' },
                { label: '已完成', val: stats.completed, color: 'text-emerald-600' },
                { label: '已失败', val: stats.failed, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-3 flex flex-col items-center shadow-sm border border-slate-50">
                  <span className={`text-lg font-black ${s.color}`}>{s.val}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Completed Section */}
            {groupedProjects.completed.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <CheckCircle2 size={16} />
                  </div>
                  <h2 className="text-sm font-black text-slate-800">已完成 ({groupedProjects.completed.length})</h2>
                </div>
                <div className="space-y-3">
                  {groupedProjects.completed.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="bg-[#bbf7d0] rounded-[32px] p-6 shadow-sm active:scale-[0.98] transition-all border border-emerald-200/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-black text-emerald-900 leading-tight pr-4">{p.name || '未命名项目'}</h3>
                        <span className="px-3 py-1 bg-white/50 text-emerald-700 text-[10px] font-black rounded-full uppercase">已完成</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white/30 p-4 rounded-2xl">
                          <p className="text-[9px] font-black text-emerald-800/40 uppercase tracking-widest mb-1">成功案例亮点</p>
                          <p className="text-xs font-bold text-emerald-900 leading-relaxed">{getFirstLine(p.review)}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800/40">
                          <p>下一步节点: <span className="text-emerald-700">{getFirstLine(p.nextStep)}</span></p>
                          <p>{p.companies}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* In Progress Section */}
            {groupedProjects.inProgress.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Activity size={16} />
                  </div>
                  <h2 className="text-sm font-black text-slate-800">进行中 ({groupedProjects.inProgress.length})</h2>
                </div>
                <div className="space-y-3">
                  {groupedProjects.inProgress.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="bg-[#fff16e] rounded-[32px] p-6 shadow-sm active:scale-[0.98] transition-all border border-yellow-200/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-black text-yellow-900 leading-tight pr-4">{p.name || '未命名项目'}</h3>
                        <span className="px-3 py-1 bg-black/10 text-yellow-800 text-[10px] font-black rounded-full uppercase">{STATUS_MAP[p.status].label}</span>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-black/5 p-4 rounded-2xl">
                          <p className="text-[9px] font-black text-yellow-900/40 uppercase tracking-widest mb-1">当前阻力/难点</p>
                          <p className="text-xs font-bold text-yellow-900 leading-relaxed">{getFirstLine(p.challenges)}</p>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-yellow-900/40">
                          <p>下一步行动: <span className="text-yellow-800">{getFirstLine(p.nextStep)}</span></p>
                          <p>{new Date(p.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Failed Section */}
            {groupedProjects.failed.length > 0 && (
              <section className="space-y-4">
                <button 
                  onClick={() => setIsFailedExpanded(!isFailedExpanded)}
                  className="flex items-center justify-between w-full px-2 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-red-100 text-red-500 rounded-lg group-hover:bg-red-200 transition-colors">
                      <AlertCircle size={16} />
                    </div>
                    <h2 className="text-sm font-black text-slate-800">已失败 ({groupedProjects.failed.length})</h2>
                  </div>
                  {isFailedExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </button>
                
                {isFailedExpanded && (
                  <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                    {groupedProjects.failed.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="bg-slate-100 rounded-[32px] p-6 shadow-inner active:scale-[0.98] transition-all border border-slate-200"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-black text-slate-600 leading-tight pr-4 line-through decoration-slate-300">{p.name || '未命名项目'}</h3>
                          <span className="px-3 py-1 bg-white text-slate-400 text-[10px] font-black rounded-full uppercase">已失败</span>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white/50 p-4 rounded-2xl border border-white">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">失败核心原因</p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed">{getFirstLine(p.challenges)}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <p>教训总结: <span>{getFirstLine(p.review)}</span></p>
                            <p>{p.companies}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {projects.length === 0 && (
          <div className="py-20 text-center text-slate-300">
            <p className="text-sm font-bold uppercase tracking-widest">点击上方 + 开始新项目</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectList;
