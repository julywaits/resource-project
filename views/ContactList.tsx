
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Project, STATUS_MAP, COOPERATION_MAP, ProjectStatus } from '../types';
import { ChevronLeft, Plus, Grid, PieChart, ChevronDown, ChevronUp, User } from 'lucide-react';

// 配色方案 - 图表用
const CHART_COLORS = ['#fff16e', '#93c5fd', '#d8b4fe', '#bbf7d0', '#fecaca'];

// 资源卡片背景色 - 列表视图用
const RESOURCE_CARD_COLORS = [
  'bg-[#d8b4fe]', // 紫色
  'bg-[#bbf7d0]', // 绿色
  'bg-[#fef08a]', // 黄色
  'bg-[#93c5fd]', // 蓝色
  'bg-[#fecaca]', // 红色
];

const ContactList: React.FC = () => {
  const [resources, setResources] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [expandedIndustries, setExpandedIndustries] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    db.projects.where('recordType').equals('resource').toArray().then(setResources);
  }, []);

  // 数据聚合计算
  const stats = useMemo(() => {
    const total = resources.length;
    const controlled = resources.filter(r => r.cooperationType === 'controlled').length;
    const cooperative = resources.filter(r => r.cooperationType === 'cooperative').length;
    const watch = resources.filter(r => r.cooperationType === 'watch').length;
    
    // 行业分组
    const industryMap: Record<string, Project[]> = {};
    resources.forEach(r => {
      const ind = r.industry || '未分类';
      if (!industryMap[ind]) industryMap[ind] = [];
      industryMap[ind].push(r);
    });

    const industries = Object.entries(industryMap).map(([name, items]) => ({
      name,
      items,
      count: items.length,
      controlled: items.filter(i => i.cooperationType === 'controlled').length,
      cooperative: items.filter(i => i.cooperationType === 'cooperative').length,
      watch: items.filter(i => i.cooperationType === 'watch').length,
    })).sort((a, b) => b.count - a.count);

    return { total, controlled, cooperative, watch, industries };
  }, [resources]);

  const toggleIndustry = (name: string) => {
    setExpandedIndustries(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  const handleCreateResource = async () => {
    const newId = crypto.randomUUID();
    const newResource: Project = {
      id: newId,
      recordType: 'resource',
      name: '',
      status: 'private',
      cooperationType: 'cooperative',
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
    await db.projects.add(newResource);
    navigate(`/projects/${newId}`);
  };

  // 简易 SVG 圆环图组件
  const DoughnutChart = ({ data }: { data: { name: string, count: number }[] }) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    return (
      <div className="relative w-48 h-48 mx-auto my-8">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
          {data.map((slice, i) => {
            const startPercent = cumulativePercent;
            const slicePercent = slice.count / total;
            const endPercent = startPercent + slicePercent;
            cumulativePercent = endPercent;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(endPercent);
            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
            const pathData = [
              `M ${startX} ${startY}`,
              `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              `L 0 0`,
            ].join(' ');

            return <path key={slice.name} d={pathData} fill={CHART_COLORS[i % CHART_COLORS.length]} />;
          })}
          <circle r="0.6" fill="#e9e9e7" /> {/* 中心空洞 */}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black text-black/30 uppercase">核心行业</span>
          <span className="text-sm font-black text-black truncate max-w-[80px]">{data[0]?.name || '-'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#e9e9e7]">
      <header className="px-8 pt-12 pb-6 space-y-6">
        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <button onClick={() => navigate('/')} className="mb-4 w-10 h-10 bg-black/5 rounded-full flex items-center justify-center active:scale-90 transition-transform">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-[40px] font-black tracking-tighter leading-none text-black">资源</h1>
            <p className="text-xs font-bold text-black/30 uppercase tracking-widest mt-1">Resource Archive</p>
          </div>
          <button onClick={handleCreateResource} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center active:scale-90 shadow-lg shadow-black/10">
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex p-1 bg-black/5 rounded-2xl w-full">
          <button 
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-sm' : 'text-black/30'}`}
          >
            <Grid size={14} /> 列表视图
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${viewMode === 'map' ? 'bg-white text-black shadow-sm' : 'text-black/30'}`}
          >
            <PieChart size={14} /> 资源全景
          </button>
        </div>
      </header>

      <main className="px-6 pb-24">
        {viewMode === 'list' ? (
          /* 网格视图 - 使用多色卡片 */
          <div className="grid grid-cols-2 gap-4">
            {resources.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className={`${RESOURCE_CARD_COLORS[idx % RESOURCE_CARD_COLORS.length]} rounded-[32px] p-6 aspect-square flex flex-col justify-between active:scale-95 transition-all cursor-pointer shadow-sm hover:shadow-md group`}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-black/40 uppercase tracking-widest mb-1">{STATUS_MAP[p.status].label}</span>
                  <h3 className="text-lg font-black leading-tight text-black break-words group-hover:translate-x-1 transition-transform">{p.name || '未命名'}</h3>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center"><span className="text-xs opacity-60">{STATUS_MAP[p.status].icon}</span></div>
                  <p className="text-[10px] font-bold text-black/30 truncate uppercase tracking-tighter">{p.industry || '未指定行业'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 资源全景（原地图视图） */
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. 统计看板 */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '总数', val: stats.total },
                { label: '可控', val: stats.controlled },
                { label: '合作', val: stats.cooperative },
                { label: '留意', val: stats.watch },
              ].map(s => (
                <div key={s.label} className="bg-white/40 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center shadow-sm">
                  <span className="text-lg font-black text-black">{s.val}</span>
                  <span className="text-[8px] font-black text-black/30 uppercase tracking-widest">{s.label}</span>
                </div>
              ))}
            </div>

            {/* 2. 行业占比图表 */}
            <div className="bg-white/40 backdrop-blur-sm rounded-[40px] p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30 text-center mb-4">行业分布</h3>
              <DoughnutChart data={stats.industries} />
              <div className="grid grid-cols-2 gap-y-3 gap-x-6 mt-4">
                {stats.industries.slice(0, 4).map((ind, i) => (
                  <div key={ind.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}></div>
                    <span className="text-[9px] font-black text-black/60 truncate uppercase">{ind.name}</span>
                    <span className="ml-auto text-[9px] font-black text-black/20">{ind.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. 行业分组列表 */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-black/30 px-2">按行业分组</h3>
              {stats.industries.map((ind) => {
                const isExpanded = expandedIndustries.includes(ind.name);
                return (
                  <div key={ind.name} className="space-y-3">
                    <button 
                      onClick={() => toggleIndustry(ind.name)}
                      className="w-full bg-black/5 hover:bg-black/10 rounded-[24px] px-6 py-5 flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-black">{ind.name}</span>
                        <span className="px-2 py-0.5 bg-black/5 rounded-full text-[8px] font-black text-black/40 uppercase">{ind.count} 个资源</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex gap-2">
                          <span className="text-[8px] font-black text-green-600/60 uppercase">可控:{ind.controlled}</span>
                          <span className="text-[8px] font-black text-blue-600/60 uppercase">合作:{ind.cooperative}</span>
                        </div>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="grid grid-cols-1 gap-2 pl-4 animate-in slide-in-from-top-2 duration-300">
                        {ind.items.map(asset => (
                          <div 
                            key={asset.id}
                            onClick={() => navigate(`/projects/${asset.id}`)}
                            className="bg-white rounded-[20px] p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center text-lg">{STATUS_MAP[asset.status].icon}</div>
                              <div className="flex flex-col">
                                <h4 className="text-xs font-black text-black group-hover:translate-x-1 transition-transform">{asset.name || '未命名资源'}</h4>
                                <div className="flex gap-2 mt-1">
                                  <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded-sm ${asset.cooperationType === 'controlled' ? 'bg-green-100 text-green-700' : asset.cooperationType === 'cooperative' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {COOPERATION_MAP[asset.cooperationType]}
                                  </span>
                                  <span className="text-[7px] font-black text-black/20 uppercase tracking-tighter">{STATUS_MAP[asset.status].label}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex -space-x-2">
                              {asset.contacts ? asset.contacts.split(/[,，]/).slice(0, 2).map((c, i) => (
                                <div key={i} className="w-6 h-6 rounded-full bg-black/10 border-2 border-white flex items-center justify-center text-[8px] font-black text-black/40">
                                  {c.trim()[0]}
                                </div>
                              )) : <User size={12} className="text-black/10" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {resources.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xs font-bold text-black/20 uppercase tracking-widest">档案库为空</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ContactList;
