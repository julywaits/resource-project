
import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Project, ProjectStatus, CooperationType, STATUS_MAP, COOPERATION_MAP } from '../types';
import { Container, Card } from '../components/Layout';
import { Button, Badge } from '../components/UI';
import { 
  Printer, FileText, Building, 
  User, Clock, Target, Info 
} from 'lucide-react';

const ShareView: React.FC = () => {
  const location = useLocation();

  const data = useMemo<Project | null>(() => {
    const params = new URLSearchParams(location.search);
    let raw = params.get('data');
    if (!raw) return null;
    
    try {
      let base64 = raw.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      
      const parsed = JSON.parse(decodeURIComponent(atob(base64)));
      
      // 兼容缩减后的键名格式，并提供默认值
      if (parsed.rt) {
        return {
          id: 'shared-' + Date.now(),
          recordType: parsed.rt === 'p' ? 'project' : 'resource',
          name: parsed.n || '',
          status: parsed.s || (parsed.rt === 'p' ? 'negotiation' : 'private'),
          cooperationType: parsed.ct || 'cooperative',
          companies: parsed.cp || '',
          contacts: parsed.c || '',
          keyContacts: parsed.kc || '',
          industry: parsed.i || '',
          milestones: parsed.m || '',
          nextStep: parsed.ns || '',
          challenges: parsed.ch || '',
          review: parsed.rv || '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Project;
      }
      
      return parsed;
    } catch (e) {
      console.error('解码失败:', e);
      return null;
    }
  }, [location.search]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400 p-10 text-center">
        <div>
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info size={40} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">链接无法解析</h2>
          <p className="text-sm">分享链接可能已失效或损坏。</p>
        </div>
      </div>
    );
  }

  const isProject = data.recordType === 'project';

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 py-6 md:py-12">
      <Container className="max-w-4xl">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-8 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge 
                label={STATUS_MAP[data.status].label} 
                colorClass={`${STATUS_MAP[data.status].bg} ${STATUS_MAP[data.status].color} border ${STATUS_MAP[data.status].border}`} 
              />
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                {isProject ? '项目报告' : '资源档案'}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">{data.name || (isProject ? '未命名项目' : '未命名资源')}</h1>
            <p className="text-xs text-slate-400 font-mono">生成时间：{new Date().toLocaleString()}</p>
          </div>
          <Button onClick={() => window.print()} variant="secondary" className="no-print self-start md:self-end border-slate-200">
            <Printer size={18} /> 打印报告
          </Button>
        </header>

        <div className="space-y-8">
          <Card title={isProject ? "基础盘概况" : "核心概况"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} className="text-blue-500" /> 合作类型
                </p>
                <p className="text-slate-900 font-bold text-sm">{COOPERATION_MAP[data.cooperationType]}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Building size={12} className="text-blue-500" /> {isProject ? '所属行业' : '资源领域'}
                </p>
                <p className="text-slate-900 font-bold text-sm">{data.industry || '暂无'}</p>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} className="text-blue-500" /> {isProject ? '主要联系人' : '法人/联系人'}
                </p>
                <p className="text-slate-900 font-bold text-sm">{data.contacts || '暂无'}</p>
              </div>
              {isProject && (
                <div className="sm:col-span-2 space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Building size={12} className="text-blue-500" /> 关联公司
                  </p>
                  <p className="text-slate-900 font-bold text-sm">{data.companies || '暂无'}</p>
                </div>
              )}
              <div className="sm:col-span-2 space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock size={12} className="text-blue-500" /> 关键联系方式
                </p>
                <p className="text-slate-900 font-bold text-sm">{data.keyContacts || '暂无'}</p>
              </div>
            </div>
          </Card>

          {data.milestones && (
            <Card title={isProject ? "关键时间节点" : "基本盘评估"}>
              <div className="space-y-5 relative ml-2">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-100 ml-1.5" />
                {data.milestones.split('\n').filter(l => l.trim()).map((m, idx) => (
                  <div key={idx} className="relative pl-8 flex gap-3">
                    <div className="absolute left-0 top-2.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                    <p className="text-slate-700 leading-relaxed text-sm font-medium">{m}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title={isProject ? "下一步计划" : "可调用资源"}>
              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm font-medium">{data.nextStep || '暂无内容'}</p>
            </Card>
            {isProject && (
              <Card title="遇到的问题与挑战">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm font-medium italic">{data.challenges || '当前无明显阻力'}</p>
              </Card>
            )}
          </div>

          {data.review && (
            <Card title={isProject ? "复盘与经验总结" : "合作复盘与线索记录"}>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-sm font-medium">{data.review}</p>
              </div>
            </Card>
          )}

          <div className="no-print pt-10 text-center text-slate-300">
             <p className="text-[10px] font-black uppercase tracking-widest">End of Report</p>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ShareView;
