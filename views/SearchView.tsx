
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Project, STATUS_MAP } from '../types';
import { ChevronLeft, Search as SearchIcon, X } from 'lucide-react';

const COLORS = [
  'bg-[#d8b4fe]', // 紫色
  'bg-[#bbf7d0]', // 绿色
  'bg-[#fef08a]', // 黄色
  'bg-[#93c5fd]', // 蓝色
];

const SearchView: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      const q = query.toLowerCase();
      
      const all = await db.projects.toArray();
      const filtered = all.filter(p => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.companies && p.companies.toLowerCase().includes(q)) ||
          (p.contacts && p.contacts.toLowerCase().includes(q)) ||
          (p.industry && p.industry.toLowerCase().includes(q)) ||
          (p.keyContacts && p.keyContacts.toLowerCase().includes(q))
        );
      });
      
      setResults(filtered);
      setLoading(false);
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const projects = results.filter(r => r.recordType === 'project');
  const resources = results.filter(r => r.recordType === 'resource');

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center gap-4 border-b border-slate-100">
        <button onClick={() => navigate('/')} className="text-black">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 relative">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            autoFocus
            type="text"
            placeholder="搜公司、人名、行业..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 rounded-full outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-2xl mx-auto">
        {!query && (
          <div className="py-20 text-center text-slate-400">
            <SearchIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">输入关键词开始搜索</p>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="py-20 text-center text-slate-400">
            <p className="text-sm font-bold">没有找到相关结果</p>
          </div>
        )}

        {projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">匹配的项目 ({projects.length})</h3>
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
                    <p className="text-[10px] font-bold text-black/30 truncate">{p.industry || '未指定行业'}</p>
                    <p className="text-[10px] font-bold text-black/30 truncate">{p.companies || '未指定公司'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resources.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 px-2">匹配的资源 ({resources.length})</h3>
            <div className="grid grid-cols-2 gap-3">
              {resources.map((p, idx) => (
                <div 
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className={`bg-slate-200 rounded-[32px] p-5 aspect-square flex flex-col justify-between active:scale-95 transition-transform cursor-pointer shadow-sm`}
                >
                  <div>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mb-1">
                      {STATUS_MAP[p.status].label}
                    </p>
                    <h3 className="text-lg font-black leading-tight text-black/80 break-words">
                      {p.name || '未命名资源'}
                    </h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-black/30 truncate">{p.industry || '未指定领域'}</p>
                    <p className="text-[10px] font-bold text-black/30 truncate">{p.contacts || '未指定法人'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchView;
