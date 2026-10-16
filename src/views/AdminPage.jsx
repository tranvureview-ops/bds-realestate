'use client';

import React, { useEffect } from 'react';
import AdminBackendPage from '../components/AdminBackendPage';
import { useRealEstate } from '../context/RealEstateContext';

export default function AdminPage() {
  const { currentUser, switchUserRole } = useRealEstate();

  // Khi truy cập trang riêng /admin, tự động thiết lập phiên quyền Admin
  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      switchUserRole('admin');
    }
  }, [currentUser?.role, switchUserRole]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased">
      <AdminBackendPage />
    </div>
  );
}
