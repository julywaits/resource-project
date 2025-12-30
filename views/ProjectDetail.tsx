import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Project, ProjectFile, STATUS_MAP, COOPERATION_MAP, RecordType, ProjectStatus } from '../types';
import { Button, Input, Select, Textarea } from '../components/UI';
import { 
  ArrowLeft, Share2, Trash2, Download, X, Copy, FileText, Link, Zap, AlertTriangle
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id) {
      db.projects.get(id).then(p => {
        if (!p) navigate('/projects');
        else setProject(p);
      });
      db.files.where('projectId').equals(id).toArray().then(setFiles);
    }
  }, [id, navigate]);

  const saveProject = useCallback(async (data: Project) => {
    setSaving(true);
    await db.projects.put({ ...data, updatedAt: Date.now() });
    setTimeout(() => setSaving(false), 500);
  }, []);

  const handleChange = (field: keyof Project, value: any) => {
    if (!project) return;
    const updated = { ...project, [field]: value };
    setProject(updated);

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveProject(updated), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id) return;
    const newFiles = Array.from(e.target.files) as File[];
    for (const file of newFiles) {
      if (project?.recordType === 'project' && file.type !== 'application/pdf') {
         alert('项目档案仅支持 PDF 格式上传');
         continue;
      }
      
      const reader = new FileReader();
      reader.onload = async () => {
        const fileEntry: ProjectFile = {
          id: crypto.randomUUID(),
          projectId: id,
          name: file.name,
          type: file.type,
          data: reader.result as string,
          uploadDate: Date.now(),
        };
        await db.files.add(fileEntry);
        setFiles(prev => [...prev, fileEntry]);
      };
      reader.readAsDataURL(file);
    }
  };

  const confirmDelete = async () => {
    if (!project) return;
    
    try {
      const targetType = project.recordType;
      const targetId = project.id;
      
      // 1. 删除档案主体
      await db.projects.delete(targetId);
      // 2. 清理所有附件
      await db.files.where('projectId').equals(targetId).delete();
      
      console.log('Successfully deleted record:', targetId);
      
      // 3. 根据类型导航返回
      if (targetType === 'project') {
        navigate('/projects', { replace: true });
      } else {
        navigate('/contacts', { replace: true });
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('删除操作失败，请刷新页面重试');
    }
  };

  const generateShareLink = async () => {
    if (!project) return;
    
    const rawData: any = {
      rt: project.recordType === 'project' ? 'p' : 'r',
      n: project.name,
      s: project.status,
      ct: project.cooperationType,
      cp: project.companies,
      c: project.contacts,
      kc: project.keyContacts,
      i: project.industry,
      m: project.milestones,
      ns: project.nextStep,
      ch: project.challenges,
      rv: project.review
    };

    const urlSafeBase64 = btoa(encodeURIComponent(JSON.stringify(rawData)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const longUrl = `${window.location.origin}${window.location.pathname}#/share?data=${urlSafeBase64}`;
    setShareUrl(longUrl);
    setShowShareModal(true);

    setIsShortening(true);
    try {
      const response = await fetch(`https://tinyurl.com/api-create?url=${encodeURIComponent(longUrl)}`);
      if (response.ok) {
        const short = await response.text();
        setShortUrl(short);
      }
    } catch (e) {
      console.warn('Shortening failed');
    } finally {
      setIsShortening(false);
    }
  };

  // PDF 导出：现代极简风格（中文版）
  const exportCard = () => {
    if (!project) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isProject = project.recordType === 'project';
    const statusInfo = STATUS_MAP[project.status];
    
    // 主题色配置
    const themeColor = isProject ? '#2563eb' : '#059669'; // Blue-600 : Emerald-600
    const themeBg = isProject ? '#eff6ff' : '#ecfdf5'; // Blue-50 : Emerald-50
    const themeText = isProject ? '#1e40af' : '#065f46'; // Blue-800 : Emerald-800

    const fileListHtml = files.map(f => `
      <div class="file-item">
        <div class="file-info">
          <span class="file-icon">📎</span>
          <span class="file-name">${f.name}</span>
        </div>
      </div>
    `).join('');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project.name} - ${isProject ? '项目档案' : '资源档案'}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
            
            @page { margin: 0; size: A4; }
            
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
              color: #1e293b;
              background: #fff;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
            }
            
            .page-container {
              max-width: 100%;
              padding: 48px;
              box-sizing: border-box;
            }

            /* Modern Header */
            header {
              margin-bottom: 48px;
              display: flex;
              flex-direction: column;
              gap: 16px;
              border-bottom: 2px solid #f1f5f9;
              padding-bottom: 32px;
            }
            
            .brand-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            
            .brand {
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #94a3b8;
            }
            
            .date {
              font-size: 11px;
              font-weight: 600;
              color: #cbd5e1;
              font-variant-numeric: tabular-nums;
            }

            h1 {
              font-size: 42px;
              font-weight: 800;
              margin: 0;
              line-height: 1.1;
              color: #0f172a;
              letter-spacing: -0.03em;
            }
            
            .tags {
              display: flex;
              gap: 8px;
              flex-wrap: wrap;
              margin-top: 4px;
            }
            
            .badge {
              display: inline-flex;
              align-items: center;
              padding: 6px 14px;
              border-radius: 99px;
              font-size: 12px;
              font-weight: 700;
              background: ${themeBg};
              color: ${themeText};
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .badge.outline {
              background: #fff;
              border: 1px solid #e2e8f0;
              color: #64748b;
            }

            /* Layout Grid */
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            
            .section-header {
              font-size: 12px;
              font-weight: 800;
              color: #94a3b8;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              margin-bottom: 20px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .section-header::after {
              content: '';
              flex: 1;
              height: 1px;
              background: #f1f5f9;
            }

            /* Key Value Grid */
            .kv-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 24px;
              margin-bottom: 24px;
            }
            
            .kv-item {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            
            .label {
              font-size: 11px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .value {
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
              line-height: 1.4;
            }
            
            /* Text Content */
            .content-block {
              font-size: 15px;
              line-height: 1.75;
              color: #334155;
              white-space: pre-wrap;
              text-align: justify;
            }
            
            .highlight-box {
              background: #f8fafc;
              border-left: 4px solid ${themeColor};
              padding: 24px;
              border-radius: 4px;
              margin-top: 8px;
            }
            
            /* File List */
            .file-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
              gap: 12px;
            }
            
            .file-item {
              display: flex;
              align-items: center;
              gap: 10px;
              padding: 12px 16px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
            }
            
            .file-icon { font-size: 16px; }
            .file-name {
              font-size: 13px;
              font-weight: 600;
              color: #475569;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            /* Footer */
            footer {
              margin-top: 64px;
              padding-top: 24px;
              border-top: 1px solid #f1f5f9;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #cbd5e1;
              font-weight: 500;
              letter-spacing: 0.5px;
            }

            @media print {
              body { background: white; }
              .page-container { padding: 40px; margin: 0; width: 100%; max-width: none; }
            }
          </style>
        </head>
        <body>
          <div class="page-container">
            <header>
              <div class="brand-row">
                <span class="brand">EPMS / ${isProject ? '项目档案' : '资源档案'}</span>
                <span class="date">${new Date().toLocaleDateString('zh-CN')}</span>
              </div>
              <h1>${project.name || '未命名档案'}</h1>
              <div class="tags">
                <span class="badge">${statusInfo.label}</span>
                <span class="badge outline">${COOPERATION_MAP[project.cooperationType]}</span>
                ${project.industry ? `<span class="badge outline">${project.industry}</span>` : ''}
              </div>
            </header>

            <div class="section">
              <div class="section-header">01 // 基础信息</div>
              <div class="kv-grid">
                 <div class="kv-item">
                    <span class="label">${isProject ? '所属行业' : '资源领域'}</span>
                    <span class="value">${project.industry || '-'}</span>
                 </div>
                 <div class="kv-item">
                    <span class="label">${isProject ? '核心联系人' : '法人代表'}</span>
                    <span class="value">${project.contacts || '-'}</span>
                 </div>
                 ${isProject ? `
                 <div class="kv-item" style="grid-column: span 2">
                    <span class="label">关联公司</span>
                    <span class="value">${project.companies || '-'}</span>
                 </div>` : ''}
                 <div class="kv-item" style="grid-column: span 2">
                    <span class="label">关键联系方式</span>
                    <span class="value">${project.keyContacts || '-'}</span>
                 </div>
              </div>
            </div>

            <div class="section">
              <div class="section-header">02 // ${isProject ? '执行状态' : '资源评估'}</div>
              <div class="kv-grid" style="grid-template-columns: 1fr;">
                 <div class="kv-item">
                    <span class="label">${isProject ? '关键节点' : '基本盘评估'}</span>
                    <div class="content-block">${project.milestones || '暂无详细记录'}</div>
                 </div>
                 <div class="kv-item">
                    <span class="label">${isProject ? '下一步计划' : '核心可调用资源'}</span>
                    <div class="content-block highlight-box" style="border-left-color: ${themeColor}">${project.nextStep || '暂无详细计划'}</div>
                 </div>
              </div>
            </div>

            ${isProject && project.challenges ? `
            <div class="section">
               <div class="section-header">03 // 挑战与阻力</div>
               <div class="content-block" style="color: #be123c;">
                  ${project.challenges}
               </div>
            </div>` : ''}

            <div class="section">
               <div class="section-header">${isProject && project.challenges ? '04' : '03'} // 复盘与总结</div>
               <div class="content-block">
                  ${project.review || '暂无总结内容'}
               </div>
            </div>

            ${files.length > 0 ? `
            <div class="section">
               <div class="section-header">附件清单</div>
               <div class="file-grid">${fileListHtml}</div>
            </div>` : ''}

            <footer>
               <span>机密文档</span>
               <span>EPMS 系统生成</span>
            </footer>
          </div>
          <script>
            window.onload = () => setTimeout(() => window.print(), 800);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!project) return null;
  const isProject = project.recordType === 'project';

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="text-black p-1 active:scale-90 transition-transform"><ArrowLeft size={24} /></button>
        <div className="text-center flex flex-col items-center">
            <h2 className="text-sm font-black tracking-tight truncate max-w-[140px]">{project.name || '未命名档案'}</h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{saving ? '自动同步中...' : '已加密保护'}</span>
        </div>
        <div className="flex gap-2">
            <button onClick={generateShareLink} className="text-blue-600 p-1.5 active:scale-90 transition-transform"><Share2 size={20} /></button>
            <button onClick={() => setShowDeleteModal(true)} className="text-red-500 p-1.5 active:scale-90 transition-transform hover:bg-red-50 rounded-full"><Trash2 size={20} /></button>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">核心信息录入</h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 ml-2">名称</label>
              <Input placeholder="输入档案名称" value={project.name} onChange={e => handleChange('name', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 ml-2">所属行业/领域</label>
                  <Input placeholder="例如：新能源" value={project.industry || ''} onChange={e => handleChange('industry', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl" />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 ml-2">合作关系</label>
                  <Select value={project.cooperationType} onChange={e => handleChange('cooperationType', e.target.value)} options={Object.entries(COOPERATION_MAP).map(([v, label]) => ({ label, value: v }))} className="!border-none !bg-slate-50 !rounded-2xl" />
               </div>
            </div>
            {isProject && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 ml-2">关联公司</label>
                <Input placeholder="公司名称清单..." value={project.companies} onChange={e => handleChange('companies', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 ml-2">{isProject ? '项目状态' : '企业性质'}</label>
                  <Select 
                    value={project.status} 
                    onChange={e => handleChange('status', e.target.value)} 
                    options={isProject 
                      ? ['negotiation', 'contract_signed', 'failed', 'executing', 'completed'].map(s => ({ label: STATUS_MAP[s as ProjectStatus].label, value: s }))
                      : ['listed', 'state_owned', 'foreign', 'private'].map(s => ({ label: STATUS_MAP[s as ProjectStatus].label, value: s }))} 
                    className="!border-none !bg-slate-50 !rounded-2xl" 
                  />
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-300 ml-2">{isProject ? '主要联系人' : '法人姓名'}</label>
                  <Input placeholder="姓名" value={project.contacts} onChange={e => handleChange('contacts', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl" />
               </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 ml-2">关键联系方式</label>
              <Input placeholder="电话/微信/职位" value={project.keyContacts || ''} onChange={e => handleChange('keyContacts', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{isProject ? '进展追踪' : '资源评估'}</h3>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-300 ml-2">{isProject ? '关键时间节点' : '基本盘评估'}</label>
             <Textarea placeholder="详情录入..." value={project.milestones} onChange={e => handleChange('milestones', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl min-h-[120px]" />
          </div>
          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-300 ml-2">{isProject ? '下一步计划' : '核心可调用资源'}</label>
             <Textarea placeholder="具体行动项..." value={project.nextStep} onChange={e => handleChange('nextStep', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl min-h-[120px]" />
          </div>
          {isProject && (
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-300 ml-2">遇到的问题/阻力</label>
               <Textarea placeholder="影响进度的阻碍..." value={project.challenges} onChange={e => handleChange('challenges', e.target.value)} className="!border-none !bg-slate-50 !rounded-2xl min-h-[120px]" />
            </div>
          )}
        </section>

        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{isProject ? '实战复盘与经验' : '合作总结与线索'}</h3>
          <Textarea placeholder="撰写详细复盘内容..." value={project.review} onChange={e => handleChange('review', e.target.value)} className="min-h-[300px] !border-none !bg-slate-50 !rounded-2xl leading-relaxed" />
        </section>

        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-50 space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">{isProject ? '项目附件 (PDF)' : '相关附件'}</h3>
             <label className="bg-blue-50 text-blue-600 text-[10px] font-bold px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100 transition-colors">
                上传新文件 <input type="file" multiple hidden accept={isProject ? "application/pdf" : "*"} onChange={handleFileUpload} />
             </label>
          </div>
          <div className="space-y-2">
            {files.length === 0 ? (
               <p className="text-[10px] text-slate-300 text-center py-4 uppercase font-bold">暂无关联附件</p>
            ) : files.map(f => (
              <div key={f.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <span className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{f.name}</span>
                <div className="flex gap-3">
                   <button onClick={() => { const l=document.createElement('a'); l.href=f.data; l.download=f.name; l.click(); }} className="text-blue-500 hover:scale-110 transition-transform"><Download size={16} /></button>
                   <button onClick={() => { if(confirm('确认移除此附件？')) { db.files.delete(f.id); setFiles(fs=>fs.filter(x=>x.id!==f.id)); } }} className="text-red-400 hover:scale-110 transition-transform"><X size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-sm rounded-[48px] p-10 space-y-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
             <div className="text-center space-y-2">
               <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Zap size={32} />
               </div>
               <h3 className="text-2xl font-black tracking-tight">档案分享与导出</h3>
               <p className="text-xs text-slate-400 italic">所有数据均已加密处理，点击复制即可分享</p>
             </div>
             
             <div className="space-y-4">
                <div className="relative">
                  <div className="absolute -top-2 left-4 px-2 bg-white text-[9px] font-black text-blue-500 uppercase tracking-widest z-10">精简分享链</div>
                  <div className="bg-blue-50/50 p-5 rounded-3xl flex items-center justify-between border border-blue-100">
                    <span className="text-xs font-bold text-blue-900 truncate pr-4">
                      {isShortening ? '正在生成极简短链...' : (shortUrl || '生成失败，请使用下方数据链')}
                    </span>
                    {shortUrl && (
                      <button 
                        onClick={() => { navigator.clipboard.writeText(shortUrl); alert('短链接已复制'); }}
                        className="p-2.5 bg-blue-600 text-white rounded-xl active:scale-90 transition-transform shadow-lg shadow-blue-500/20"
                      >
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-3xl space-y-2 border border-slate-100">
                  <div className="text-[10px] font-mono text-slate-400 line-clamp-2 break-all opacity-50 select-all">
                    {shareUrl}
                  </div>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(shareUrl); alert('完整数据链已复制'); }}
                    className="text-[10px] font-bold text-blue-400 flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    <Link size={10} /> 复制原始数据链
                  </button>
                </div>
             </div>

             <div className="flex flex-col gap-3">
                <Button onClick={exportCard} variant="primary" className="!rounded-3xl py-5 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20">
                  <FileText size={20} /> 一键导出专业 PDF 卡片
                </Button>
                <Button onClick={() => setShowShareModal(false)} variant="ghost" className="font-bold text-slate-400 text-xs uppercase tracking-widest py-3">
                  暂不分享
                </Button>
             </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-6 scale-100 animate-in zoom-in-95 duration-200">
             <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                   <AlertTriangle size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900">确认彻底删除？</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                   即将删除【{project.name || '未命名档案'}】。<br/>
                   此操作<span className="text-red-500 font-bold">无法撤销</span>，且将同步移除 {files.length} 个关联附件。
                </p>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm active:scale-95 transition-transform"
                >
                  取消
                </button>
                <button 
                  onClick={confirmDelete}
                  className="py-3 rounded-xl bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
                >
                  确认删除
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;