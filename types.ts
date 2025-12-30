
export type RecordType = 'project' | 'resource';

// 合并后的状态：包含企业性质（资源）和项目进度（项目）
export type ProjectStatus = 
  | 'listed' | 'state_owned' | 'foreign' | 'private' // 资源状态
  | 'negotiation' | 'contract_signed' | 'failed' | 'executing' | 'completed'; // 项目状态

export type CooperationType = 'controlled' | 'cooperative' | 'watch';

export interface Project {
  id: string;
  recordType: RecordType; // 新增：区分档案类型
  name: string;
  status: ProjectStatus;
  cooperationType: CooperationType;
  companies: string;
  contacts: string; 
  keyContacts: string; 
  industry?: string; // 新增：行业
  milestones: string; 
  nextStep: string; 
  challenges: string;
  review: string; 
  createdAt: number;
  updatedAt: number;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  type: string;
  data: string; // Base64
  uploadDate: number;
}

// 统一状态配置
export const STATUS_MAP: Record<ProjectStatus, { label: string; bg: string; color: string; border: string; icon: string }> = {
  // 资源类状态
  listed: { label: '上市', bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100', icon: '📈' },
  state_owned: { label: '国央企', bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100', icon: '🏛️' },
  foreign: { label: '外企', bg: 'bg-green-50', color: 'text-green-600', border: 'border-green-100', icon: '🌍' },
  private: { label: '私企', bg: 'bg-slate-50', color: 'text-slate-600', border: 'border-slate-100', icon: '🏢' },
  // 项目类状态
  negotiation: { label: '洽谈中', bg: 'bg-orange-50', color: 'text-orange-600', border: 'border-orange-100', icon: '💬' },
  contract_signed: { label: '合同签署', bg: 'bg-indigo-50', color: 'text-indigo-600', border: 'border-indigo-100', icon: '✍️' },
  failed: { label: '已黄', bg: 'bg-red-50', color: 'text-red-600', border: 'border-red-100', icon: '✖️' },
  executing: { label: '执行中', bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100', icon: '⚙️' },
  completed: { label: '已完成', bg: 'bg-slate-50', color: 'text-slate-600', border: 'border-slate-100', icon: '✅' },
};

export const COOPERATION_MAP: Record<CooperationType, string> = {
  controlled: '可控',
  cooperative: '可合作',
  watch: '可留意',
};
