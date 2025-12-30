import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Project } from '../types';
import { Plus, X, Briefcase, Users, Search, Compass, Layers, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [showNewMenu, setShowNewMenu] = useState(false);

  const handleCreateProject = async () => {
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

  const handleCreateResource = async () => {
    const newId = crypto.randomUUID();
    const newProject: Project = {
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
    await db.projects.add(newProject);
    navigate(`/projects/${newId}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f1f3] flex flex-col justify-between p-8 pb-12 overflow-hidden selection:bg-blue-100">
      <header className="pt-16 pb-8">
        <div className="font-black tracking-tighter flex flex-col select-none animate-in slide-in-from-top duration-700">
          <span className="text-[64px] leading-[0.9] text-slate-900">收集&</span>
          <span className="text-[64px] leading-[0.9] text-slate-900/30">管理</span>
        </div>
        <div className="mt-6 w-12 h-1 bg-slate-900 rounded-full opacity-20"></div>
      </header>

      <div className="grid grid-cols-2 gap-5 w-full">
        {/* Resources Card */}
        <div 
          onClick={() => navigate('/contacts')}
          className="group relative aspect-square bg-[#b4b4a6] rounded-[36px] p-6 flex flex-col justify-between cursor-pointer active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-stone-400/30 overflow-hidden"
        >
          {/* Content Layer */}
          <div className="relative z-20 flex flex-col h-full justify-between">
            <div className="space-y-1">
               <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-slate-800 mb-3 shadow-sm border border-white/10 group-hover:scale-110 transition-transform">
                  <Layers size={20} strokeWidth={2.5} />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">资源</h2>
               <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest opacity-60">Resources</p>
            </div>
            
            <div className="flex justify-end">
               <div className="w-8 h-8 rounded-full bg-slate-900/5 flex items-center justify-center group-hover:bg-slate-900/10 transition-colors">
                  <ArrowRight size={14} className="text-slate-900 opacity-50 group-hover:translate-x-0.5 transition-transform" />
               </div>
            </div>
          </div>

          {/* Decorative Background */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.08] transform rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 ease-out z-10">
            <Layers size={180} strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Projects Card */}
        <div 
          onClick={() => navigate('/projects')}
          className="group relative aspect-square bg-[#fef08a] rounded-[36px] p-6 flex flex-col justify-between cursor-pointer active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-300/30 overflow-hidden"
        >
          {/* Content Layer */}
           <div className="relative z-20 flex flex-col h-full justify-between">
            <div className="space-y-1">
               <div className="w-10 h-10 bg-yellow-900/5 backdrop-blur-md rounded-full flex items-center justify-center text-yellow-900 mb-3 shadow-sm border border-yellow-900/5 group-hover:scale-110 transition-transform">
                  <Compass size={20} strokeWidth={2.5} />
               </div>
               <h2 className="text-2xl font-black text-yellow-900 tracking-tight">项目</h2>
               <p className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest opacity-60">Projects</p>
            </div>
            
             <div className="flex justify-end">
               <div className="w-8 h-8 rounded-full bg-yellow-900/5 flex items-center justify-center group-hover:bg-yellow-900/10 transition-colors">
                  <ArrowRight size={14} className="text-yellow-900 opacity-50 group-hover:translate-x-0.5 transition-transform" />
               </div>
            </div>
          </div>

          {/* Decorative Background */}
          <div className="absolute -right-8 -bottom-8 opacity-[0.08] transform -rotate-12 group-hover:-rotate-6 group-hover:scale-110 transition-all duration-500 ease-out z-10">
            <Compass size={180} strokeWidth={1.5} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
        </div>
      </div>

      <footer className="grid grid-cols-2 gap-4 pt-10 pb-4">
        <button 
          onClick={() => setShowNewMenu(true)}
          className="group flex flex-col justify-center h-20 pl-6 rounded-3xl bg-white hover:bg-slate-50 border border-slate-100 transition-all active:scale-95 shadow-sm"
        >
            <span className="text-sm font-black text-slate-900 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
              <Plus size={16} className="text-blue-600" /> 新建档案
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-left">Create New</span>
        </button>
        <button 
          onClick={() => navigate('/search')}
          className="group flex flex-col justify-center h-20 pl-6 rounded-3xl bg-white hover:bg-slate-50 border border-slate-100 transition-all active:scale-95 shadow-sm"
        >
            <span className="text-sm font-black text-slate-900 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
               <Search size={16} className="text-slate-400" /> 搜索
            </span>
             <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-left">Search All</span>
        </button>
      </footer>

      {showNewMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white w-full max-sm rounded-[40px] p-8 space-y-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xl font-black tracking-tight text-slate-900">选择档案类型</h3>
              <button 
                onClick={() => setShowNewMenu(false)} 
                className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 active:scale-90 transition-transform"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleCreateProject}
                className="group flex flex-col items-center gap-4 p-8 bg-blue-50/50 text-blue-600 rounded-[32px] hover:bg-blue-50 transition-colors border-2 border-transparent hover:border-blue-100 active:scale-95"
              >
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Briefcase size={28} />
                </div>
                <span className="font-black text-sm uppercase tracking-tight">项目档案</span>
              </button>
              
              <button 
                onClick={handleCreateResource}
                className="group flex flex-col items-center gap-4 p-8 bg-amber-50/50 text-amber-600 rounded-[32px] hover:bg-amber-50 transition-colors border-2 border-transparent hover:border-amber-100 active:scale-95"
              >
                <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <Users size={28} />
                </div>
                <span className="font-black text-sm uppercase tracking-tight">资源档案</span>
              </button>
            </div>

            <button 
              onClick={() => setShowNewMenu(false)}
              className="w-full py-4 rounded-2xl text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              取消操作
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;