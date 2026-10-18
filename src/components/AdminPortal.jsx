'use client';

import React, { useState, useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { VIP_PACKAGES, MOCK_USERS, LOCATIONS } from '../data/mockData';
import AdminReportsManager from './AdminReportsManager';
import AdminSingleConfigManager from './AdminSingleConfigManager';
import AdminAppointmentsManager from './AdminAppointmentsManager';

export default function AdminPortal() {
  const { 
    properties, 
    transactions, 
    approveProperty, 
    rejectProperty, 
    deleteProperty, 
    openPropertyDetail,
    showToast,
    paymentConfig,
    updatePaymentConfig,
    resetPaymentConfig,
    VIETNAM_BANKS
  } = useRealEstate();

  const [adminTab, setAdminTab] = useState('moderation'); // 'moderation', 'users', 'packages', 'payments', 'analytics'
  const [rejectModalProperty, setRejectModalProperty] = useState(null);
  const [rejectReason, setRejectReason] = useState('Giá chưa chính xác so với thị trường');
  const [formPaymentConfig, setFormPaymentConfig] = useState(paymentConfig || {});

  useEffect(() => {
    if (paymentConfig) {
      setFormPaymentConfig(paymentConfig);
    }
  }, [paymentConfig]);

  // Filter listings
  const pendingProperties = properties.filter(p => p.status === 'pending');
  const activeProperties = properties.filter(p => p.status === 'active');

  // Revenue calculation
  const totalRevenue = transactions
    .filter(t => t.type === 'purchase_vip' || t.type === 'bump_listing')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleRejectSubmit = () => {
    if (rejectModalProperty) {
      rejectProperty(rejectModalProperty.id, rejectReason);
      setRejectModalProperty(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-xl shadow-lg">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-red-400 font-extrabold">
              Hệ Thống Quản Trị Trung Tâm CMS
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Đất Biển Đà Nẵng Administration Portal
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
          <div>
            <div className="text-slate-400">Doanh thu thu về:</div>
            <div className="text-base font-black text-amber-400">
              {totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-slate-400">Tin chờ duyệt:</div>
            <div className="text-base font-black text-rose-400">
              {pendingProperties.length} tin
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Tổng bài đăng</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{properties.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Đang hoạt động: {activeProperties.length}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Cần duyệt ngay</div>
          <div className="text-2xl font-black text-red-600 mt-1">{pendingProperties.length}</div>
          <div className="text-[11px] text-red-500 font-medium mt-1">Ưu tiên duyệt tin VIP</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Môi giới xác thực</div>
          <div className="text-2xl font-black text-blue-600 mt-1">128</div>
          <div className="text-[11px] text-blue-500 font-medium mt-1">Tích xanh kiểm định</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase">Lượt giao dịch VIP</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{transactions.length}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">Thanh toán tự động</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('moderation')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'moderation' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-list-check"></i>
          Kiểm Duyệt Tin Đăng ({pendingProperties.length})
        </button>

        <button
          onClick={() => setAdminTab('appointments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'appointments' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-regular fa-calendar-check text-emerald-500"></i>
          Lịch Hẹn Xem Nhà
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'reports' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-flag text-rose-500"></i>
          Báo Cáo Vi Phạm
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'users' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-users-gear"></i>
          Quản Lý Tài Khoản & Phân Quyền
        </button>

        <button
          onClick={() => setAdminTab('packages')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'packages' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-tags"></i>
          Cấu Hình Gói Dịch Vụ VIP
        </button>

        <button
          onClick={() => setAdminTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'payments' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-credit-card"></i>
          Cấu Hình Phương Thức Thanh Toán
        </button>

        <button
          onClick={() => setAdminTab('single-config')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'single-config' ? 'bg-red-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-file-contract text-rose-500"></i>
          Cấu Hình Single
        </button>

        <button
          onClick={() => setAdminTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${adminTab === 'analytics' ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <i className="fa-solid fa-chart-pie"></i>
          Báo Cáo Doanh Thu
        </button>
      </div>

      {/* TAB 1: MODERATION */}
      {adminTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Hàng Chờ Kiểm Duyệt (Ưu tiên duyệt tin VIP Kim Cương & Vàng trước)
            </h3>
            <span className="text-xs text-slate-500">
              Có <strong>{pendingProperties.length}</strong> tin đăng mới chờ duyệt
            </span>
          </div>

          {pendingProperties.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <i className="fa-solid fa-circle-check text-4xl text-emerald-500 mb-2"></i>
              <h4 className="text-base font-bold text-slate-800">Không có tin nào chờ duyệt!</h4>
              <p className="text-xs text-slate-500 mt-1">Tất cả bài đăng đã được kiểm duyệt an toàn.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingProperties.map(prop => {
                const defaultPkg = VIP_PACKAGES.find(p => p.id === 'normal') || VIP_PACKAGES[VIP_PACKAGES.length - 1];
                const pkg = VIP_PACKAGES.find(p => p.id === prop.vipPackageId) || defaultPkg;

                return (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={prop.images[0]}
                        alt=""
                        className="w-24 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pkg.badgeColor}`}>
                            {pkg.shortName}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">{prop.id}</span>
                          <span className="text-xs text-slate-400">| Người đăng: <strong>{prop.author?.name}</strong></span>
                        </div>
                        <h4 
                          onClick={() => openPropertyDetail(prop)}
                          className="text-xs sm:text-sm font-bold text-slate-900 hover:underline cursor-pointer line-clamp-1"
                        >
                          {prop.title}
                        </h4>
                        <div className="text-xs font-bold text-emerald-700 mt-1">
                          {prop.priceDisplay} • {prop.area} m² • {prop.address}, {prop.district}, {prop.city}
                        </div>
                        {prop.autoApproveAt && (
                          <div className="text-[11px] text-amber-700 font-bold mt-1.5 flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/80 w-fit">
                            <i className="fa-solid fa-clock-rotate-left text-amber-600 animate-spin text-[10px]"></i>
                            <span>
                              {prop.vipPackageId === 'normal' || !prop.vipPackageId ? 'FIFO: ' : ''}Tự động xuất bản sau ~{Math.max(1, Math.ceil((new Date(prop.autoApproveAt).getTime() - Date.now()) / (60 * 1000)))} phút
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Approve / Reject buttons */}
                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => openPropertyDetail(prop)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                      >
                        <i className="fa-solid fa-eye mr-1"></i> Xem trước
                      </button>

                      <button
                        onClick={() => approveProperty(prop.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1"
                      >
                        <i className="fa-solid fa-check"></i> Duyệt Tin
                      </button>

                      <button
                        onClick={() => setRejectModalProperty(prop)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition flex items-center gap-1"
                      >
                        <i className="fa-solid fa-ban"></i> Từ Chối
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: BÁO CÁO VI PHẠM & EMAIL LOGS */}
      {adminTab === 'reports' && (
        <AdminReportsManager />
      )}

      {/* TAB: CẤU HÌNH TRANG SINGLE & MIỄN TRỪ TRÁCH NHIỆM */}
      {adminTab === 'single-config' && (
        <AdminSingleConfigManager />
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Danh Sách Người Dùng & Phân Quyền
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3">Vai trò</th>
                  <th className="p-3 text-right">Số dư ví</th>
                  <th className="p-3 text-center">Xác thực</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_USERS.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 flex items-center gap-2">
                      <img src={u.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                      <span className="font-bold text-slate-800">{u.name}</span>
                    </td>
                    <td className="p-3 text-slate-600">{u.email}</td>
                    <td className="p-3 font-mono text-slate-700">{u.phone}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800' :
                        u.role === 'broker' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {u.roleName}
                      </span>
                    </td>
                    <td className="p-3 text-right font-black text-emerald-700">
                      {u.walletBalance.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="p-3 text-center">
                      {u.isVerified ? (
                        <span className="text-blue-600 font-bold"><i className="fa-solid fa-circle-check"></i> Đã cấp</span>
                      ) : (
                        <span className="text-slate-400">Chưa cấp</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => showToast(`Đã cập nhật trạng thái người dùng ${u.name}`, 'info')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold"
                      >
                        Chỉnh sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PACKAGES CONFIGURATION */}
      {adminTab === 'packages' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
            Cấu Hình Bảng Giá Gói Dịch Vụ Tin Đăng (Realtime Update)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VIP_PACKAGES.map(pkg => (
              <div key={pkg.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">{pkg.name}</div>
                  <div className="text-[11px] text-slate-500">Cấp độ {pkg.level} • Tối thiểu {pkg.minDays} ngày</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={pkg.pricePerDay}
                    className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold text-right"
                  />
                  <span className="text-xs text-slate-500 font-bold">đ/ngày</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => showToast('Đã lưu cấu hình bảng giá mới thành công!', 'success')}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Lưu Thay Đổi Bảng Giá
          </button>
        </div>
      )}

      {/* TAB 4: REVENUE ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Phân Bổ Doanh Thu Theo Gói Tin Đăng
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Gói VIP Kim Cương (VIP 1)</span>
                  <span className="text-red-600 font-black">65% (4.500.000 đ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-red-600 h-full w-[65%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Gói VIP Vàng (VIP 2)</span>
                  <span className="text-amber-500 font-black">20% (1.400.000 đ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[20%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Dịch Vụ Đẩy Tin (Làm mới)</span>
                  <span className="text-blue-600 font-black">15% (1.050.000 đ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-[15%]"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Thị Phần BĐS Theo Tỉnh/Thành Trọng Điểm
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">1. TP. Hồ Chí Minh</span>
                <strong className="text-emerald-700">48% tin đăng</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">2. Hà Nội</span>
                <strong className="text-emerald-700">36% tin đăng</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">3. Đà Nẵng</span>
                <strong className="text-emerald-700">10% tin đăng</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-800">4. Bình Dương & Đồng Nai</span>
                <strong className="text-emerald-700">6% tin đăng</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT CONFIGURATION */}
      {adminTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                <i className="fa-solid fa-gears"></i>
                Backend Payment Gateway Settings
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1">Cấu Hình Cổng Thanh Toán & Tài Khoản Nhận Tiền</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Quản lý số tài khoản ngân hàng thụ hưởng VietQR (MB, Vietcombank...), ví MoMo, VNPAY, chính sách ẩn Ví tài khoản cho khách vãng lai và quy tắc tự động kích hoạt tin đăng sau khi thanh toán thành công.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetPaymentConfig();
                  showToast('Đã khôi phục cấu hình cổng thanh toán mặc định!', 'info');
                }}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition border border-slate-700 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-rotate-left"></i>
                Khôi phục mặc định
              </button>
              <button
                type="button"
                onClick={() => {
                  updatePaymentConfig(formPaymentConfig);
                  showToast('Đã lưu cấu hình cổng thanh toán thành công!', 'success');
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-600/30 flex items-center gap-1.5"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Lưu cấu hình
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột Trái & Giữa: Form cấu hình */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. VietQR Ngân Hàng */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                      <i className="fa-solid fa-qrcode"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        1. VietQR Ngân Hàng Napas 24/7 (Khuyên Dùng)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Hỗ trợ tất cả app ngân hàng (MB, VCB, Techcombank...). Quét mã nhận tiền tức thì 24/7.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPaymentConfig.vietqr?.enabled ?? true}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        vietqr: { ...formPaymentConfig.vietqr, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Chọn Ngân Hàng Thụ Hưởng:
                    </label>
                    <select
                      value={formPaymentConfig.vietqr?.bankCode || 'MB'}
                      onChange={(e) => {
                        const selectedBank = VIETNAM_BANKS.find(b => b.code === e.target.value);
                        if (selectedBank) {
                          setFormPaymentConfig({
                            ...formPaymentConfig,
                            vietqr: {
                              ...formPaymentConfig.vietqr,
                              bankCode: selectedBank.code,
                              bankBin: selectedBank.bin,
                              bankName: selectedBank.name
                            }
                          });
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 hover:border-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition shadow-sm cursor-pointer"
                    >
                      {VIETNAM_BANKS.map(bank => (
                        <option key={bank.code} value={bank.code}>
                          {bank.shortName} - {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mã BIN Định Tuyến Napas:
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formPaymentConfig.vietqr?.bankBin || '970422'}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Số Tài Khoản Nhận Tiền:
                    </label>
                    <input
                      type="text"
                      value={formPaymentConfig.vietqr?.accountNumber || ''}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        vietqr: { ...formPaymentConfig.vietqr, accountNumber: e.target.value }
                      })}
                      placeholder="VD: 0898246607"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tên Chủ Tài Khoản (In Hoa Không Dấu):
                    </label>
                    <input
                      type="text"
                      value={formPaymentConfig.vietqr?.accountName || ''}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        vietqr: { ...formPaymentConfig.vietqr, accountName: e.target.value.toUpperCase() }
                      })}
                      placeholder="VD: CONG TY DAT BIEN DA NANG"
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Tiền Tố Cú Pháp Chuyển Khoản:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={formPaymentConfig.vietqr?.syntaxPrefix || 'BDS'}
                        onChange={(e) => setFormPaymentConfig({
                          ...formPaymentConfig,
                          vietqr: { ...formPaymentConfig.vietqr, syntaxPrefix: e.target.value.trim().toUpperCase() }
                        })}
                        placeholder="VD: BDS"
                        className="w-32 p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-xs text-slate-500">
                        Hệ thống sẽ tự sinh cú pháp cho khách: <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">{formPaymentConfig.vietqr?.syntaxPrefix || 'BDS'} [MÃ_TIN] [SĐT]</code>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Ví Điện Tử MoMo & Cổng VNPAY-QR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* MoMo */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-sm font-bold">
                        <i className="fa-solid fa-mobile-screen-button"></i>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">2. Ví Điện Tử MoMo</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPaymentConfig.momo?.enabled ?? true}
                        onChange={(e) => setFormPaymentConfig({
                          ...formPaymentConfig,
                          momo: { ...formPaymentConfig.momo, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Số điện thoại MoMo:</label>
                    <input
                      type="text"
                      value={formPaymentConfig.momo?.phoneNumber || ''}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        momo: { ...formPaymentConfig.momo, phoneNumber: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tên chủ ví MoMo:</label>
                    <input
                      type="text"
                      value={formPaymentConfig.momo?.accountName || ''}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        momo: { ...formPaymentConfig.momo, accountName: e.target.value.toUpperCase() }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

                {/* VNPAY */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
                        <i className="fa-solid fa-credit-card"></i>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">3. Cổng VNPAY-QR</h4>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formPaymentConfig.vnpay?.enabled ?? true}
                        onChange={(e) => setFormPaymentConfig({
                          ...formPaymentConfig,
                          vnpay: { ...formPaymentConfig.vnpay, enabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-700"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Mã TMN Code:</label>
                    <input
                      type="text"
                      value={formPaymentConfig.vnpay?.tmnCode || ''}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        vnpay: { ...formPaymentConfig.vnpay, tmnCode: e.target.value }
                      })}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold font-mono"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-600 font-semibold">Chế độ Sandbox Thử Nghiệm:</span>
                    <input
                      type="checkbox"
                      checked={formPaymentConfig.vnpay?.sandbox ?? true}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        vnpay: { ...formPaymentConfig.vnpay, sandbox: e.target.checked }
                      })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Ví Tài Khoản Nội Bộ & Quy Tắc Khách Vãng Lai */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
                      <i className="fa-solid fa-wallet"></i>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">
                        4. Ví Tài Khoản Nội Bộ & Quy Tắc Khách Vãng Lai
                      </h3>
                      <p className="text-xs text-slate-500">
                        Trừ tiền trực tiếp từ số dư tài khoản đã nạp sẵn
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPaymentConfig.wallet?.enabled ?? true}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        wallet: { ...formPaymentConfig.wallet, enabled: e.target.checked }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    Quy tắc hiển thị thanh toán thông minh:
                  </div>
                  <p>
                    • <strong>Khách vãng lai (Chưa đăng nhập):</strong> Hệ thống tự động <strong>ẨN</strong> lựa chọn "Ví tài khoản" và chỉ hiển thị <strong>3 phương thức thanh toán trực tiếp</strong> (VietQR Ngân Hàng, Ví MoMo, Cổng VNPAY-QR).
                  </p>
                  <p>
                    • <strong>Thành viên đã đăng nhập:</strong> Hiển thị đầy đủ cả 4 phương thức bao gồm Ví tài khoản với số dư khả dụng thực tế.
                  </p>
                </div>
              </div>

              {/* 4. Quy Tắc Tự Động Duyệt & Kích Hoạt Tin Đăng */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
                    <i className="fa-solid fa-bolt-lightning"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      5. Cơ Chế Kích Hoạt & Xuất Bản Tin Đăng Tự Động (Auto-Approval)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cấu hình hành vi xuất bản tin khi khách thanh toán thành công
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formPaymentConfig.autoApproveVip ?? true}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        autoApproveVip: e.target.checked
                      })}
                      className="mt-0.5 w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Tự động duyệt & kích hoạt ngay tin VIP Kim Cương (Ưu tiên hiển thị tức thì)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Đặc quyền VIP Kim Cương: Sau khi thanh toán thành công, tin đăng chuyển sang trạng thái <strong>Active</strong> ngay lập tức mà không cần Admin kiểm duyệt thủ công.
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100/80 cursor-pointer transition">
                    <input
                      type="checkbox"
                      checked={formPaymentConfig.autoApproveOther ?? true}
                      onChange={(e) => setFormPaymentConfig({
                        ...formPaymentConfig,
                        autoApproveOther: e.target.checked
                      })}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Tự động duyệt & xuất bản các tin khác sau khi nhận tiền chuyển khoản thành công
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Khi ghi nhận giao dịch thành công (qua VietQR, MoMo, VNPAY hoặc Ví), tin đăng sẽ lập tức được hiển thị trực tiếp lên Website cho khách tìm kiếm.
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Cột Phải: Live VietQR Simulator Preview */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <i className="fa-solid fa-eye"></i>
                  Xem Trước Mã VietQR Thực Tế
                </div>

                <div className="bg-white p-4 rounded-2xl text-slate-900 text-center space-y-3 shadow-inner">
                  <div className="text-xs font-bold text-blue-900 uppercase">
                    {formPaymentConfig.vietqr?.bankName || 'MBBank - Ngân Hàng Quân Đội'}
                  </div>
                  <div className="flex justify-center">
                    <img
                      src={`https://img.vietqr.io/image/${formPaymentConfig.vietqr?.bankBin || '970422'}-${formPaymentConfig.vietqr?.accountNumber || '0898246607'}-compact2.png?amount=79800&addInfo=${formPaymentConfig.vietqr?.syntaxPrefix || 'DBDN'}%20DEMO&accountName=${encodeURIComponent(formPaymentConfig.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG')}`}
                      alt="VietQR Napas 24/7 Preview"
                      className="w-48 h-48 object-contain rounded-xl border border-slate-200 shadow-sm"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BDS%20PAYMENT%20DEMO';
                      }}
                    />
                  </div>
                  <div className="text-[11px] font-mono bg-slate-100 p-2 rounded-xl text-slate-800 space-y-0.5">
                    <div>STK: <strong>{formPaymentConfig.vietqr?.accountNumber || '0898246607'}</strong></div>
                    <div>Chủ TK: <strong>{formPaymentConfig.vietqr?.accountName || 'CONG TY DAT BIEN DA NANG'}</strong></div>
                    <div>Số tiền mẫu: <strong className="text-red-600">79.800 đ</strong></div>
                    <div>Cú pháp mẫu: <strong className="text-blue-600">{formPaymentConfig.vietqr?.syntaxPrefix || 'BDS'} 0908123456</strong></div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 space-y-2">
                  <div className="font-bold text-slate-300">Thông tin kỹ thuật:</div>
                  <div className="flex items-center justify-between">
                    <span>Chuẩn định dạng:</span>
                    <strong className="text-slate-200">VietQR Napas 24/7</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tốc độ nhận tiền:</span>
                    <strong className="text-emerald-400">Tức thì (&lt; 3 giây)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kiểm tra tự động:</span>
                    <strong className="text-blue-400">Webhook / Banking Polling</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updatePaymentConfig(formPaymentConfig);
                    showToast('Đã lưu cấu hình cổng thanh toán thành công!', 'success');
                  }}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  Lưu & Áp Dụng Ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CẤU HÌNH SINGLE & MIỄN TRỪ TRÁCH NHIỆM */}
      {adminTab === 'single-config' && (
        <AdminSingleConfigManager />
      )}

      {/* TAB: QUẢN LÝ LỊCH HẸN XEM NHÀ */}
      {adminTab === 'appointments' && (
        <AdminAppointmentsManager />
      )}

      {/* Reject Reason Modal */}
      {rejectModalProperty && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Từ Chối Tin Đăng: {rejectModalProperty.id}
            </h3>
            <p className="text-xs text-slate-500">
              Chọn lý do từ chối để thông báo đến người đăng tin:
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
            >
              <option value="Giá chưa chính xác so với thị trường">Giá chưa chính xác so với thị trường</option>
              <option value="Hình ảnh mờ, trùng lặp hoặc chứa watermark vi phạm">Hình ảnh mờ, trùng lặp hoặc chứa watermark</option>
              <option value="Địa chỉ không đúng thực tế">Địa chỉ không đúng thực tế</option>
              <option value="Nghi vấn tin spam hoặc môi giới không có ủy quyền">Nghi vấn tin spam hoặc không có ủy quyền</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalProperty(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
