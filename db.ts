import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  Timestamp 
} from 'https://esm.sh/firebase@10.7.1/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'https://esm.sh/firebase@10.7.1/storage';
import { db as firestore, storage } from './firebase-config.js';
import { Project, ProjectFile } from './types';

// Projects 操作
export const projectsCollection = collection(firestore, 'projects');
export const filesCollection = collection(firestore, 'files');

// 添加项目
export async function addProject(projectData: Omit<Project, 'id'>): Promise<string> {
  const docRef = await addDoc(projectsCollection, {
    ...projectData,
    updatedAt: Timestamp.now()
  });
  return docRef.id;
}

// 获取所有项目
export async function getAllProjects(): Promise<Project[]> {
  const querySnapshot = await getDocs(
    query(projectsCollection, orderBy('updatedAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Project));
}

// 根据类型获取项目
export async function getProjectsByType(recordType: string): Promise<Project[]> {
  const q = query(
    projectsCollection, 
    where('recordType', '==', recordType),
    orderBy('updatedAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Project));
}

// 获取单个项目
export async function getProject(id: string): Promise<Project | null> {
  const docRef = doc(firestore, 'projects', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Project;
  }
  return null;
}

// 更新项目
export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  const docRef = doc(firestore, 'projects', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now()
  });
}

// 删除项目
export async function deleteProject(id: string): Promise<void> {
  // 先删除关联的文件
  const files = await getProjectFiles(id);
  for (const file of files) {
    await deleteProjectFile(file.id);
  }
  // 再删除项目
  const docRef = doc(firestore, 'projects', id);
  await deleteDoc(docRef);
}

// 搜索项目
export async function searchProjects(searchTerm: string): Promise<Project[]> {
  const allProjects = await getAllProjects();
  const term = searchTerm.toLowerCase();
  return allProjects.filter(project => 
    project.name?.toLowerCase().includes(term) ||
    project.industry?.toLowerCase().includes(term) ||
    project.description?.toLowerCase().includes(term)
  );
}

// === 文件操作 ===

// 上传文件
export async function uploadProjectFile(
  file: File, 
  projectId: string,
  metadata: Omit<ProjectFile, 'id' | 'url'>
): Promise<string> {
  // 上传文件到 Storage
  const storageRef = ref(storage, `projects/${projectId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  
  // 保存文件元数据到 Firestore
  const fileData = {
    ...metadata,
    projectId,
    url: downloadURL,
    uploadedAt: Timestamp.now()
  };
  
  const docRef = await addDoc(filesCollection, fileData);
  return docRef.id;
}

// 获取项目的所有文件
export async function getProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const q = query(filesCollection, where('projectId', '==', projectId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ProjectFile));
}

// 删除文件
export async function deleteProjectFile(fileId: string): Promise<void> {
  const docRef = doc(firestore, 'files', fileId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const fileData = docSnap.data() as ProjectFile;
    
    // 从 Storage 删除文件
    if (fileData.url) {
      try {
        const fileRef = ref(storage, fileData.url);
        await deleteObject(fileRef);
      } catch (error) {
        console.error('Error deleting file from storage:', error);
      }
    }
    
    // 从 Firestore 删除元数据
    await deleteDoc(docRef);
  }
}

// 为了兼容性,导出一个 db 对象(如果其他地方有用到)
export const db = {
  projects: {
    add: addProject,
    getAll: getAllProjects,
    get: getProject,
    update: updateProject,
    delete: deleteProject,
    search: searchProjects,
    getByType: getProjectsByType
  },
  files: {
    upload: uploadProjectFile,
    getByProject: getProjectFiles,
    delete: deleteProjectFile
  }
};
