'use client';

import React, { useState } from 'react';
import { useRealEstate } from '../context/RealEstateContext';

export default function AdminMenuConfigManager({ onSwitchToHeader = null }) {
  const {
    navMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemVisibility,
    moveMenuItem,
    addSubMenuItem,
    deleteSubMenuItem,
    resetNavMenu,
    showToast
  } = useRealEstate();

  // Menu Modal States
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    title: '',
    path: '',
    icon: 'fa-solid fa-link',
    badge: '',
    badgeColor: 'bg-emerald-500 text-white',
    isVisible: true,
    target: '_self'
  });

  // Submenu Modal States
  const [activeSubmenuParentId, setActiveSubmenuParentId] = useState(null);
  const [subFormData, setSubFormData] = useState({ title: '', path: '', icon: 'fa-solid fa-chevron-right' });
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  // Menu Management Handlers
  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    setMenuFormData({
      title: '',
      path: '',
      icon: 'fa-solid fa-link',
      badge: '',
      badgeColor: 'bg-emerald-500 text-white',
      isVisible: true,
      target: '_self'
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item) => {
    setEditingMenuItem(item);
    setMenuFormData({
      title: item.title,
      path: item.path,
      icon: item.icon || 'fa-solid fa-link',
      badge: item.badge || '',
      badgeColor: item.badgeColor || 'bg-emerald-500 text-white',
      isVisible: item.isVisible !== undefined ? item.isVisible : true,
      target: item.target || '_self'
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenuItem = (e) => {
    e.preventDefault();
    if (!menuFormData.title || !menuFormData.path) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và đường dẫn URL', 'warning');
      return;
    }
    if (editingMenuItem) {
      updateMenuItem(editingMenuItem.id, menuFormData);
      showToast('Đã cập nhật mục menu thành công!', 'success');
    } else {
      addMenuItem(menuFormData);
      showToast('Đã thêm mục menu mới thành công!', 'success');
    }
    setIsMenuModalOpen(false);
  };

  const handleOpenAddSubItem = (parentId) => {
    setActiveSubmenuParentId(parentId);
    setSubFormData({ title: '', path: '', icon: 'fa-solid fa-chevron-right' });
    setIsSubModalOpen(true);
  };

  const handleSaveSubItem = (e) => {
    e.preventDefault();
    if (!subFormData.title || !subFormData.path) {
      showToast('Vui lòng nhập đầy đủ tên và đường dẫn menu con', 'warning');
      return;
    }
    if (activeSubmenuParentId) {
      addSubMenuItem(activeSubmenuParentId, subFormData);
      showToast('Đã thêm mục menu con thành công!', 'success');
      setIsSubModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center text-sm">
              <i className="fa-solid fa-bars-staggered"></i>
            </span>
            <h2 className="text-lg font-black text-white">
              Cấu Hình Menu Điều Hướng (Navigation Menu Manager)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Tùy biến các nút menu trên thanh Header website: thêm mục mới, điều chỉnh thứ tự (lên/xuống), bật/tắt hiển thị, gắn huy hiệu nổi bật (HOT, VIP) và quản lý danh mục con (Dropdown).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Khôi phục toàn bộ danh sách menu về mặc định ban đầu?')) {
                resetNavMenu();
                showToast('Đã khôi phục danh sách menu về mặc định!', 'info');
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
            title="Khôi phục danh sách menu về mặc định ban đầu"
          >
            <i className="fa-solid fa-rotate-left text-slate-400"></i>
            <span>Khôi Phục Mặc Định</span>
          </button>

          <button
            onClick={handleOpenAddMenu}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
          >
            <i className="fa-solid fa-plus-circle"></i>
            <span>+ Thêm Mục Menu Mới</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Tổng Số Mục Menu</div>
            <div className="text-xl font-black text-white mt-1">{(navMenuItems || []).length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center text-base">
            <i className="fa-solid fa-list"></i>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Đang Hiển Thị</div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              {(navMenuItems || []).filter(m => m.isVisible).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-base">
            <i className="fa-solid fa-eye"></i>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Đang Ẩn Khỏi Header</div>
            <div className="text-xl font-black text-slate-400 mt-1">
              {(navMenuItems || []).filter(m => !m.isVisible).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 flex items-center justify-center text-base">
            <i className="fa-solid fa-eye-slash"></i>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase">Mục Con Dropdown</div>
            <div className="text-xl font-black text-blue-400 mt-1">
              {(navMenuItems || []).reduce((acc, m) => acc + (m.children?.length || 0), 0)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center text-base">
            <i className="fa-solid fa-folder-tree"></i>
          </div>
        </div>
      </div>

      {/* Quick Link to Header Customizer */}
      {onSwitchToHeader && (
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm shrink-0">
              <i className="fa-solid fa-window-maximize"></i>
            </span>
            <div>
              <div className="font-bold text-white text-sm">Cần đổi Logo Thương Hiệu hoặc Độ Rộng Header?</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Bạn có thể chuyển sang mục <b>"Header"</b> để đổi logo ảnh/chữ và chọn độ rộng (Full-width, Wide, Boxed).
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onSwitchToHeader}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 shrink-0"
          >
            <i className="fa-solid fa-paintbrush"></i>
            <span>Mở Header ➔</span>
          </button>
        </div>
      )}

      {/* Main Menu Configuration Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <i className="fa-solid fa-list-check text-slate-400"></i>
            <span>Danh Sách Các Nút Menu Điều Hướng</span>
          </div>
          <span className="text-xs text-slate-500">
            Dùng nút ▲ / ▼ để sắp xếp thứ tự hiển thị từ trái sang phải
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3 w-16 text-center">Thứ tự</th>
                <th className="p-3">Tiêu đề & Biểu tượng</th>
                <th className="p-3">Đường dẫn URL</th>
                <th className="p-3">Huy hiệu (Badge)</th>
                <th className="p-3">Menu con (Dropdown)</th>
                <th className="p-3 text-center">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {[...navMenuItems]
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === navMenuItems.length - 1;
                  return (
                    <React.Fragment key={item.id}>
                      <tr className={`hover:bg-slate-900/50 transition ${!item.isVisible ? 'opacity-50 bg-slate-950/40' : ''}`}>
                        {/* Order & Reorder Buttons */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => moveMenuItem(item.id, 'up')}
                              disabled={isFirst}
                              className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 flex items-center justify-center text-[10px]"
                              title="Di chuyển lên / sang trái"
                            >
                              ▲
                            </button>
                            <span className="font-mono font-bold text-slate-400 text-xs w-4">
                              {index + 1}
                            </span>
                            <button
                              onClick={() => moveMenuItem(item.id, 'down')}
                              disabled={isLast}
                              className="w-6 h-6 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-slate-300 flex items-center justify-center text-[10px]"
                              title="Di chuyển xuống / sang phải"
                            >
                              ▼
                            </button>
                          </div>
                        </td>

                        {/* Title & Icon */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 text-xs shrink-0">
                              <i className={item.icon || 'fa-solid fa-link'}></i>
                            </div>
                            <div>
                              <span className="font-bold text-white text-sm">
                                {item.title}
                              </span>
                              {item.target === '_blank' && (
                                <span className="ml-1.5 text-[10px] text-blue-400 font-mono" title="Mở trong tab mới">
                                  ↗
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Path */}
                        <td className="p-3 font-mono text-emerald-400 text-[11px]">
                          {item.path}
                        </td>

                        {/* Badge Tag */}
                        <td className="p-3">
                          {item.badge ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${item.badgeColor || 'bg-emerald-500 text-white'}`}>
                              {item.badge}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[11px]">--</span>
                          )}
                        </td>

                        {/* Submenu Dropdown Counter */}
                        <td className="p-3">
                          {item.children && item.children.length > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[11px] font-semibold flex items-center gap-1 w-fit">
                              <i className="fa-solid fa-folder-tree text-[10px]"></i>
                              {item.children.length} mục con
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenAddSubItem(item.id)}
                              className="text-[11px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition"
                            >
                              <i className="fa-solid fa-plus text-[9px]"></i> Thêm submenu
                            </button>
                          )}
                        </td>

                        {/* Visibility Toggle */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleMenuItemVisibility(item.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                              item.isVisible
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            <i className={`fa-solid ${item.isVisible ? 'fa-eye' : 'fa-eye-slash'} mr-1`}></i>
                            {item.isVisible ? 'Hiển thị' : 'Ẩn'}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenAddSubItem(item.id)}
                              className="p-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-400 border border-blue-900/50 text-xs transition"
                              title="Thêm mục con cho menu này"
                            >
                              <i className="fa-solid fa-folder-plus"></i>
                            </button>
                            <button
                              onClick={() => handleOpenEditMenu(item)}
                              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition"
                              title="Chỉnh sửa menu"
                            >
                              <i className="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa mục menu "${item.title}"?`)) {
                                  deleteMenuItem(item.id);
                                  showToast('Đã xóa mục menu!', 'info');
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 text-xs transition"
                              title="Xóa menu"
                            >
                              <i className="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-menu rows (nested) */}
                      {item.children && item.children.length > 0 && (
                        <tr className="bg-slate-950/80">
                          <td colSpan="7" className="p-2.5 pl-12 border-b border-slate-900">
                            <div className="space-y-1.5">
                              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold flex items-center gap-1.5">
                                <i className="fa-solid fa-turn-down text-blue-500"></i>
                                <span>Danh sách mục con của "{item.title}":</span>
                                <button
                                  onClick={() => handleOpenAddSubItem(item.id)}
                                  className="ml-2 text-blue-400 hover:underline font-bold text-[10px]"
                                >
                                  + Thêm mục con
                                </button>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                {item.children.map(sub => (
                                  <div
                                    key={sub.id}
                                    className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2"
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <i className={`${sub.icon || 'fa-solid fa-chevron-right'} text-[10px] text-blue-400 shrink-0`}></i>
                                      <span className="font-bold text-slate-200 text-xs truncate">{sub.title}</span>
                                      <span className="text-[10px] font-mono text-slate-500 truncate">({sub.path})</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        if (window.confirm(`Xóa menu con "${sub.title}"?`)) {
                                          deleteSubMenuItem(item.id, sub.id);
                                          showToast('Đã xóa menu con!', 'info');
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 text-xs p-1 rounded hover:bg-red-950/50 transition"
                                      title="Xóa menu con này"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: THÊM / CHỈNH SỬA MỤC MENU */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 my-8 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-bars-staggered"></i>
                </div>
                <h3 className="text-base font-black text-white">
                  {editingMenuItem ? `Sửa Menu: ${editingMenuItem.title}` : 'Thêm Mục Menu Mới'}
                </h3>
              </div>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMenuItem} className="space-y-4 text-xs">
              {/* Tiêu đề Menu */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Tiêu Đề Menu (Nhãn hiển thị): <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Dự Án Mới, Nhà Đất Bán, Bản Đồ BĐS..."
                  value={menuFormData.title}
                  onChange={(e) => setMenuFormData({ ...menuFormData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold placeholder:text-slate-600 focus:border-red-500 outline-none"
                />
              </div>

              {/* Đường dẫn URL */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Đường Dẫn URL (Route): <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: /nha-dat-ban hoặc /ban-can-ho-chung-cu"
                  value={menuFormData.path}
                  onChange={(e) => setMenuFormData({ ...menuFormData, path: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold placeholder:text-slate-600 focus:border-red-500 outline-none"
                />

                {/* Quick suggestions */}
                <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Gợi ý nhanh:</span>
                  {[
                    { label: 'Bán', path: '/nha-dat-ban' },
                    { label: 'Căn Hộ', path: '/ban-can-ho-chung-cu' },
                    { label: 'Nhà Phố', path: '/ban-nha-mat-pho' },
                    { label: 'Cho Thuê', path: '/nha-dat-cho-thue' },
                    { label: 'Văn Phòng', path: '/cho-thue-van-phong' },
                    { label: 'Bảng Giá VIP', path: '/bang-gia-vip' },
                    { label: 'Lãi Vay', path: '/tinh-lai-vay' },
                    { label: 'So Sánh', path: '/so-sanh' },
                    { label: 'Đăng Tin', path: '/dang-tin' },
                    { label: 'Quản Lý Tin', path: '/quan-ly-tin' }
                  ].map(s => (
                    <button
                      type="button"
                      key={s.path}
                      onClick={() => setMenuFormData({ ...menuFormData, path: s.path, title: menuFormData.title || s.label })}
                      className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-400 hover:text-emerald-400 border border-slate-800 font-mono"
                    >
                      {s.path}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon */}
              <div>
                <label className="block text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>Biểu Tượng (FontAwesome Icon Class):</span>
                  {menuFormData.icon && (
                    <span className="text-emerald-400 text-sm flex items-center gap-1 font-normal">
                      Xem trước: <i className={menuFormData.icon}></i>
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder="fa-solid fa-house-chimney"
                  value={menuFormData.icon}
                  onChange={(e) => setMenuFormData({ ...menuFormData, icon: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:border-red-500 outline-none"
                />

                {/* Quick Icon Selector */}
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  {[
                    { icon: 'fa-solid fa-house-chimney', name: 'Nhà' },
                    { icon: 'fa-solid fa-building', name: 'Chung cư' },
                    { icon: 'fa-solid fa-key', name: 'Thuê' },
                    { icon: 'fa-solid fa-crown', name: 'VIP' },
                    { icon: 'fa-solid fa-calculator', name: 'Lãi vay' },
                    { icon: 'fa-solid fa-compass', name: 'Khám phá' },
                    { icon: 'fa-solid fa-map-location-dot', name: 'Bản đồ' },
                    { icon: 'fa-solid fa-shop', name: 'Mặt phố' },
                    { icon: 'fa-solid fa-briefcase', name: 'Văn phòng' },
                    { icon: 'fa-solid fa-newspaper', name: 'Tin tức' }
                  ].map(ic => (
                    <button
                      type="button"
                      key={ic.icon}
                      onClick={() => setMenuFormData({ ...menuFormData, icon: ic.icon })}
                      className={`px-2 py-1 rounded-lg text-xs flex items-center gap-1 border transition ${
                        menuFormData.icon === ic.icon 
                          ? 'bg-red-600 text-white border-red-500 font-bold' 
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                      title={ic.name}
                    >
                      <i className={ic.icon}></i>
                      <span className="text-[10px]">{ic.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Huy hiệu (Badge Text & Badge Color) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Huy Hiệu (Badge Tag):
                  </label>
                  <input
                    type="text"
                    placeholder="HOT, MỚI, VIP 4.0..."
                    value={menuFormData.badge}
                    onChange={(e) => setMenuFormData({ ...menuFormData, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold placeholder:text-slate-600 focus:border-red-500 outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Màu Sắc Huy Hiệu:
                  </label>
                  <select
                    value={menuFormData.badgeColor}
                    onChange={(e) => setMenuFormData({ ...menuFormData, badgeColor: e.target.value })}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold focus:border-red-500 outline-none"
                  >
                    <option value="bg-emerald-500 text-white">Xanh Lá (Emerald)</option>
                    <option value="bg-red-500 text-white">Đỏ Rực (Red)</option>
                    <option value="bg-amber-500 text-slate-900">Vàng Ánh Kim (Amber)</option>
                    <option value="bg-blue-500 text-white">Xanh Dương (Blue)</option>
                    <option value="bg-purple-600 text-white">Tím Quý Phái (Purple)</option>
                  </select>
                </div>
              </div>

              {/* Target & Visibility Options */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Mở Trong Tab Mới:</div>
                  <div className="text-[10px] text-slate-400">Dùng khi liên kết tới website khác hoặc trang ngoài</div>
                </div>
                <select
                  value={menuFormData.target}
                  onChange={(e) => setMenuFormData({ ...menuFormData, target: e.target.value })}
                  className="p-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold text-xs"
                >
                  <option value="_self">Tab hiện tại (_self)</option>
                  <option value="_blank">Tab mới (_blank)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Kích Hoạt Hiển Thị:</div>
                  <div className="text-[10px] text-slate-400">Bật để xuất hiện trên Header website ngay lập tức</div>
                </div>
                <input
                  type="checkbox"
                  checked={menuFormData.isVisible}
                  onChange={(e) => setMenuFormData({ ...menuFormData, isVisible: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMenuModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs shadow-lg transition flex items-center gap-2"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>{editingMenuItem ? 'Lưu Thay Đổi Menu' : 'Thêm Mục Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM MENU CON (DROPDOWN SUBMENU) */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-folder-tree"></i>
                </div>
                <h3 className="text-base font-black text-white">Thêm Mục Menu Con</h3>
              </div>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-900 text-slate-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Tên Mục Menu Con: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bán Biệt Thự Liền Kề"
                  value={subFormData.title}
                  onChange={(e) => setSubFormData({ ...subFormData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-bold placeholder:text-slate-600 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Đường Dẫn URL: <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: /ban-nha-biet-thu-lien-ke"
                  value={subFormData.path}
                  onChange={(e) => setSubFormData({ ...subFormData, path: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold placeholder:text-slate-600 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Biểu Tượng FontAwesome:
                </label>
                <input
                  type="text"
                  placeholder="fa-solid fa-building"
                  value={subFormData.icon}
                  onChange={(e) => setSubFormData({ ...subFormData, icon: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-600 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition"
                >
                  + Thêm Menu Con
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
