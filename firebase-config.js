import { initializeApp } from 'https://esm.sh/firebase@10.7.1/app';
import { getFirestore } from 'https://esm.sh/firebase@10.7.1/firestore';
import { getStorage } from 'https://esm.sh/firebase@10.7.1/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAOnyErMndyq2Lfrj8I0jB0cbTvNpxoGjI",
  authDomain: "resource-project-84d5d.firebaseapp.com",
  projectId: "resource-project-84d5d",
  storageBucket: "resource-project-84d5d.firebasestorage.app",
  messagingSenderId: "303714677572",
  appId: "1:303714677572:web:c8b6bccabb947300c41d11"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
