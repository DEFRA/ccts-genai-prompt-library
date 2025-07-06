import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const LoginPage = lazy(() => import('../components/LoginPage'));
const MainLayout = lazy(() => import('../layouts/MainLayout'));
const TemplateList = lazy(() => import('../components/TemplateList'));

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<MainLayout />}>
      <Route index element={<TemplateList />} />
      {/* Other routes */}
    </Route>
  </Routes>
); 