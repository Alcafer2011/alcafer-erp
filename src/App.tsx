import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Clienti from './pages/Clienti';
import Preventivi from './pages/Preventivi';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clienti" element={<Clienti />} />
          <Route path="/preventivi" element={<Preventivi />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;