
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './views/Home';
import ProjectList from './views/ProjectList';
import ProjectDetail from './views/ProjectDetail';
import ContactList from './views/ContactList';
import ShareView from './views/ShareView';
import SearchView from './views/SearchView';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen font-sans selection:bg-yellow-200">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/contacts" element={<ContactList />} />
          <Route path="/share" element={<ShareView />} />
          <Route path="/search" element={<SearchView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
