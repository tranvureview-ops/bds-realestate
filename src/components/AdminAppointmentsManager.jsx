'use client';

import React, { useState, useMemo } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { normalizePhone } from '../utils/authValidation';

export default function AdminAppointmentsManager() {
  const {
    appointmentsList,
    updateAppointmentStatus,
    deleteAppointment,
    showToast
  } = useRealEstate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tempNote, setTempNote] = useState('');

  // 1. Thống kê KPI lịch hẹn
  const stats = useMemo(() => {
    const list = Array.isArray(appointmentsList) ? appointmentsList : [];
    return {
      total: list.length,
      pending: list.filter(a => a.status === 'pending').length,
      confirmed: list.filter(a => a.status === 'confirmed').length,
      completed: list.filter(a => a.status === 'completed').length,
      cancelled: list.filter(a => a.status === 'cancelled').length
    };
  }, [appointmentsList]);

  // 2. Lọc và tìm kiếm danh sách
  const filteredAppointments = useMemo(() => {
    const list = Array.isArray(appointmentsList) ? appointmentsList : [];
    return list.filter(appt => {
      // Lọc theo trạng thái
      if (statusFilter !== 'all' && appt.status !== statusFilter) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchTitle = (appt.propertyTitle || '').toLowerCase().includes(q);
        const matchCustPhone = (appt.customerPhone || '').toLowerCase().includes(q);
        const matchCustName = (appt.customerName || '').toLowerCase().includes(q);
        const matchBrokerName = (appt.brokerName || '').toLowerCase().includes(q);
        const matchId = (appt.id || '').toLowerCase().includes(q);
        if (!matchTitle && !matchCustPhone && !matchCustName && !matchBrokerName && !matchId) {
          return false;
        }
      }
      return true;
    });
  }, [appointmentsList, statusFilter, searchTerm]);

  const handleSaveNote = async (id) => {
    await updateAppointmentStatus(id, undefined, tempNote);
    setEditingNoteId(null);
    setTempNote('');
    showToast('Đã lưu ghi chú quản trị viên!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER & KPI STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-emerald-500'
              : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tổng Lịch Hẹn</div>
          <div className="text-2xl font-black mt-1">{stats.total}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            statusFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
              : 'bg-white text-slate-900 border-slate-200 hover:bg-amber-50/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Chờ Xác Nhận</div>
          <div className="text-2xl font-black mt-1 text-amber-600">{stats.pending}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('confirmed')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            statusFilter === 'confirmed'
              ? 'bg-blue-600 text-white border-blue-700 shadow-md ring-2 ring-blue-300'
              : 'bg-white text-slate-900 border-slate-200 hover:bg-blue-50/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Đã Xác Nhận</div>
          <div className="text-2xl font-black mt-1 text-blue-600">{stats.confirmed}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('completed')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            statusFilter === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
              : 'bg-white text-slate-900 border-slate-200 hover:bg-emerald-50/50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Hoàn Thành</div>
          <div className="text-2xl font-black mt-1 text-emerald-600">{stats.completed}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('cancelled')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            statusFilter === 'cancelled'
              ? 'bg-slate-700 text-white border-slate-800 shadow-md ring-2 ring-slate-400'
              : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-rose-500">Đã Hủy</div>
          <div className="text-2xl font-black mt-1 text-rose-600">{stats.cancelled}</div>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Tìm theo SĐT khách, tên bài đăng, môi giới..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-semibold">
            Hiển thị <strong>{filteredAppointments.length}</strong> / {stats.total} lịch hẹn
          </span>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-xs text-emerald-600 font-bold hover:underline ml-2"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>

      {/* 3. APPOINTMENTS TABLE */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl">
            <i className="fa-regular fa-calendar-xmark"></i>
          </div>
          <div className="font-bold text-slate-800 text-sm">Không tìm thấy lịch hẹn xem nhà nào</div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'Thử thay đổi từ khóa tìm kiếm hoặc bấm "Xem tất cả" để xem toàn bộ danh sách.'
              : 'Chưa có khách hàng nào đặt lịch hẹn xem nhà trực tiếp trên hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                  <th className="py-3.5 px-4">Mã & Ngày Đặt</th>
                  <th className="py-3.5 px-4">Bất Động Sản</th>
                  <th className="py-3.5 px-4">Khách Hàng & Liên Hệ</th>
                  <th className="py-3.5 px-4">Môi Giới Phụ Trách</th>
                  <th className="py-3.5 px-4">Thời Gian Hẹn</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => {
                  const custPhone = appt.customerPhone || '';
                  const normPhone = normalizePhone(custPhone);
                  return (
                    <tr key={appt.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* Mã & Ngày tạo */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-mono font-bold text-slate-800">{appt.id}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {appt.createdAt ? new Date(appt.createdAt).toLocaleString('vi-VN') : '—'}
                        </div>
                      </td>

                      {/* Bất động sản */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="flex items-start gap-2.5">
                          {appt.propertyCover && (
                            <img
                              src={appt.propertyCover}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate" title={appt.propertyTitle}>
                              {appt.propertyTitle}
                            </div>
                            <div className="text-[11px] text-rose-600 font-bold">
                              {appt.propertyPrice}
                            </div>
                            {appt.propertyAddress && (
                              <div className="text-[10px] text-slate-400 truncate">
                                📍 {appt.propertyAddress}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Khách hàng */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-900">{appt.customerName || 'Khách hàng'}</div>
                        <div className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                          {custPhone}
                        </div>
                        {appt.customerNote && (
                          <div className="text-[10.5px] text-slate-500 italic mt-1 max-w-[200px]">
                            "{appt.customerNote}"
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                          <a
                            href={`tel:${custPhone}`}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold border border-rose-200 transition flex items-center gap-1"
                            title="Gọi điện trực tiếp"
                          >
                            <i className="fa-solid fa-phone text-[9px]"></i>
                            <span>Gọi</span>
                          </a>
                          <a
                            href={`https://zalo.me/${normPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200 transition flex items-center gap-1"
                            title="Mở chat Zalo"
                          >
                            <i className="fa-solid fa-comment-dots text-[9px]"></i>
                            <span>Zalo</span>
                          </a>
                        </div>
                      </td>

                      {/* Môi giới */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-800">{appt.brokerName || '—'}</div>
                        {appt.brokerPhone && (
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            📞 {appt.brokerPhone}
                          </div>
                        )}
                        {appt.brokerEmail && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            ✉️ {appt.brokerEmail}
                          </div>
                        )}
                      </td>

                      {/* Thời gian hẹn */}
                      <td className="py-4 px-4 align-top">
                        <div className="inline-block px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                          ⏰ {appt.appointmentDate}
                        </div>
                      </td>

                      {/* Trạng thái & Chuyển đổi */}
                      <td className="py-4 px-4 align-top">
                        <select
                          value={appt.status}
                          onChange={(e) => updateAppointmentStatus(appt.id, e.target.value)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs border focus:outline-none cursor-pointer transition ${
                            appt.status === 'pending' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            appt.status === 'confirmed' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                            appt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="pending">⏳ Chờ Xác Nhận</option>
                          <option value="confirmed">✓ Đã Xác Nhận</option>
                          <option value="completed">🎉 Hoàn Thành</option>
                          <option value="cancelled">✕ Đã Hủy</option>
                        </select>
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 align-top text-right space-x-1.5">
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa lịch hẹn #${appt.id} này khỏi cơ sở dữ liệu?`)) {
                              deleteAppointment(appt.id);
                            }
                          }}
                          className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition inline-flex items-center justify-center text-xs"
                          title="Xóa lịch hẹn"
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
