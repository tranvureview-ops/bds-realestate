'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  VIETNAM_ADMINISTRATIVE_DATA,
  findProvinceByName,
  getDistrictsOfProvince,
  findDistrictByName,
  getWardsOfDistrict,
  getStreetsOfDistrict,
  getProjectsOfDistrict,
  findAdministrativeMerger
} from '../data/vietnamAdministrativeData';
import CustomSelect from './CustomSelect';

/**
 * AddressSelectModal - Hộp thoại Chọn Địa Chỉ chuẩn Batdongsan.com.vn
 * (Tham khảo giao diện https://batdongsan.com.vn/nguoi-ban/dang-tin)
 */
export default function AddressSelectModal({
  isOpen,
  onClose,
  initialData = {},
  onConfirm
}) {
  // Toggle: Tìm theo địa chỉ mới (Sáp nhập đơn vị hành chính)
  const [isNewAddressMode, setIsNewAddressMode] = useState(initialData.isNewAddressMode || false);
  const [selectedAddressType, setSelectedAddressType] = useState('new'); // 'new' | 'old'

  // Form states (Khởi tạo rỗng, không gán dữ liệu mẫu mặc định)
  const [selectedCity, setSelectedCity] = useState(initialData.city || '');
  const [selectedDistrict, setSelectedDistrict] = useState(initialData.district || '');
  const [selectedWard, setSelectedWard] = useState(initialData.ward || '');
  const [selectedStreet, setSelectedStreet] = useState(initialData.street || '');
  const [detailedAddress, setDetailedAddress] = useState(initialData.detailedAddress || '');
  const [selectedProject, setSelectedProject] = useState(initialData.project || '');

  // Custom street & project text input state (khi người dùng muốn tự nhập ngoài danh mục gợi ý)
  const [customStreetInput, setCustomStreetInput] = useState('');
  const [isCustomStreet, setIsCustomStreet] = useState(false);
  const [isCustomProject, setIsCustomProject] = useState(false);
  const [customProjectInput, setCustomProjectInput] = useState('');

  // Sync initialData khi modal mở
  useEffect(() => {
    if (isOpen) {
      if (initialData.city) setSelectedCity(initialData.city);
      if (initialData.district) setSelectedDistrict(initialData.district);
      if (initialData.ward) setSelectedWard(initialData.ward);
      if (initialData.street) {
        setSelectedStreet(initialData.street);
        setCustomStreetInput(initialData.street);
      }
      if (initialData.detailedAddress) setDetailedAddress(initialData.detailedAddress);
      if (initialData.project) {
        setSelectedProject(initialData.project);
        setCustomProjectInput(initialData.project);
      }
    }
  }, [isOpen, initialData]);

  // Danh sách Tỉnh/Thành
  const cityOptions = useMemo(() => {
    return VIETNAM_ADMINISTRATIVE_DATA.map((p) => ({
      value: p.name,
      label: p.name,
      sublabel: p.region
    }));
  }, []);

  // Danh sách Quận/Huyện theo Tỉnh/Thành đã chọn
  const districtList = useMemo(() => {
    return getDistrictsOfProvince(selectedCity);
  }, [selectedCity]);

  const districtOptions = useMemo(() => {
    return districtList.map((d) => ({
      value: d.name,
      label: d.name
    }));
  }, [districtList]);

  // Danh sách Phường/Xã theo Quận/Huyện đã chọn
  const wardList = useMemo(() => {
    return getWardsOfDistrict(selectedCity, selectedDistrict);
  }, [selectedCity, selectedDistrict]);

  const wardOptions = useMemo(() => {
    return wardList.map((w) => ({
      value: w,
      label: w
    }));
  }, [wardList]);

  // Danh sách Đường/Phố theo Quận/Huyện đã chọn
  const streetList = useMemo(() => {
    return getStreetsOfDistrict(selectedCity, selectedDistrict);
  }, [selectedCity, selectedDistrict]);

  const streetOptions = useMemo(() => {
    const list = streetList.map((s) => ({
      value: s,
      label: s
    }));
    return [
      ...list,
      { value: '__CUSTOM_STREET__', label: '+ Tự nhập tên đường khác...', badge: 'Nhập tay' }
    ];
  }, [streetList]);

  // Danh sách Dự án theo Quận/Huyện hoặc Tỉnh/Thành
  const projectList = useMemo(() => {
    return getProjectsOfDistrict(selectedCity, selectedDistrict);
  }, [selectedCity, selectedDistrict]);

  const projectOptions = useMemo(() => {
    const list = projectList.map((prj) => ({
      value: prj,
      label: prj
    }));
    return [
      { value: '', label: '-- Không thuộc dự án nào --' },
      ...list,
      { value: '__CUSTOM_PROJECT__', label: '+ Tự nhập tên dự án khác...', badge: 'Nhập tay' }
    ];
  }, [projectList]);

  // Xử lý đổi Tỉnh/Thành -> Reset các cấp bên dưới
  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');
    setSelectedWard('');
    setSelectedStreet('');
    setCustomStreetInput('');
    setIsCustomStreet(false);
    setSelectedProject('');
    setCustomProjectInput('');
    setIsCustomProject(false);
  };

  // Xử lý đổi Quận/Huyện -> Reset các cấp bên dưới
  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    setSelectedWard('');
    setSelectedStreet('');
    setCustomStreetInput('');
    setIsCustomStreet(false);
    setSelectedProject('');
    setCustomProjectInput('');
    setIsCustomProject(false);
  };

  // Xử lý chọn Đường/Phố
  const handleStreetSelect = (val) => {
    if (val === '__CUSTOM_STREET__') {
      setIsCustomStreet(true);
      setSelectedStreet('');
    } else {
      setIsCustomStreet(false);
      setSelectedStreet(val);
      setCustomStreetInput(val);
    }
  };

  // Xử lý chọn Dự án
  const handleProjectSelect = (val) => {
    if (val === '__CUSTOM_PROJECT__') {
      setIsCustomProject(true);
      setSelectedProject('');
    } else {
      setIsCustomProject(false);
      setSelectedProject(val);
      setCustomProjectInput(val);
    }
  };

  // Tự động tổng hợp chuỗi địa chỉ đầy đủ
  const effectiveStreet = isCustomStreet ? customStreetInput.trim() : selectedStreet;
  const effectiveProject = isCustomProject ? customProjectInput.trim() : selectedProject;

  // Tra cứu xem địa chỉ đang chọn có thuộc diện sáp nhập đơn vị hành chính không
  const mergerSuggestion = useMemo(() => {
    return findAdministrativeMerger({
      city: selectedCity,
      district: selectedDistrict,
      ward: selectedWard,
      street: effectiveStreet
    });
  }, [selectedCity, selectedDistrict, selectedWard, effectiveStreet]);

  // Khi có mergerSuggestion hoặc bật toggle địa chỉ mới, tự động ưu tiên 'new'
  useEffect(() => {
    if (mergerSuggestion || isNewAddressMode) {
      setSelectedAddressType('new');
    }
  }, [mergerSuggestion, isNewAddressMode]);

  const computedFullAddress = useMemo(() => {
    if (mergerSuggestion && selectedAddressType === 'new') {
      const parts = [
        detailedAddress.trim(),
        effectiveProject ? `(Dự án: ${effectiveProject})` : '',
        mergerSuggestion.newAddress
      ].filter(Boolean);
      return parts.join(', ');
    }
    const parts = [
      detailedAddress.trim(),
      effectiveStreet ? `Đường ${effectiveStreet.replace(/^(đường|phố)\s+/i, '')}` : '',
      effectiveProject ? `(Dự án: ${effectiveProject})` : '',
      selectedWard,
      selectedDistrict,
      selectedCity
    ].filter(Boolean);
    return parts.join(', ');
  }, [detailedAddress, effectiveStreet, effectiveProject, selectedWard, selectedDistrict, selectedCity, mergerSuggestion, selectedAddressType]);

  // Xác nhận
  const handleConfirm = () => {
    if (!selectedCity) {
      alert('Vui lòng chọn Tỉnh/Thành phố');
      return;
    }
    if (!selectedDistrict) {
      alert('Vui lòng chọn Quận/Huyện');
      return;
    }
    if (!selectedWard) {
      alert('Vui lòng chọn Phường/Xã');
      return;
    }

    const finalCity = (selectedAddressType === 'new' && mergerSuggestion?.newCity) ? mergerSuggestion.newCity : selectedCity;
    const finalDistrict = (selectedAddressType === 'new' && mergerSuggestion?.newDistrict) ? mergerSuggestion.newDistrict : selectedDistrict;
    const finalWard = (selectedAddressType === 'new' && mergerSuggestion?.newWard) ? mergerSuggestion.newWard : selectedWard;

    onConfirm &&
      onConfirm({
        city: finalCity,
        district: finalDistrict,
        ward: finalWard,
        street: effectiveStreet,
        detailedAddress: detailedAddress.trim(),
        project: effectiveProject,
        fullAddress: computedFullAddress,
        oldAddress: mergerSuggestion ? mergerSuggestion.oldAddress : computedFullAddress,
        newAddress: mergerSuggestion ? mergerSuggestion.newAddress : computedFullAddress,
        isAdministrativeMerged: Boolean(mergerSuggestion),
        selectedAddressType: selectedAddressType,
        isNewAddressMode: isNewAddressMode,
        mergerResolution: mergerSuggestion?.resolution || ''
      });

    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= HEADER BAR (Chuẩn Batdongsan.com.vn) ================= */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/30 text-red-500 flex items-center justify-center text-sm font-bold border border-red-500/40">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              Chọn địa chỉ
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm transition"
            title="Đóng hộp thoại"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* ================= BODY CONTENT ================= */}
        <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Sub-header: Tìm theo địa chỉ mới (Toggle switch) */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Tìm theo địa chỉ mới
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={isNewAddressMode}
              onClick={() => setIsNewAddressMode(!isNewAddressMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isNewAddressMode ? 'bg-red-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isNewAddressMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isNewAddressMode && (
            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <i className="fa-solid fa-circle-info text-amber-600 mt-0.5"></i>
              <span>Chế độ <strong>Địa chỉ mới</strong>: Bạn có thể chọn danh mục sẵn có hoặc nhập tay tên đường, ngõ hẻm và dự án mới hoàn toàn.</span>
            </div>
          )}

          {/* 1. Tỉnh/Thành * */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Tỉnh/Thành <span className="text-red-600">*</span>
            </label>
            <CustomSelect
              value={selectedCity}
              onChange={handleCityChange}
              options={cityOptions}
              placeholder="Chọn tỉnh/thành"
              showSearch={true}
              searchPlaceholder="Tìm tỉnh/thành (63 tỉnh toàn quốc)..."
              className="py-2.5 bg-slate-50 border-slate-200 text-xs font-semibold rounded-2xl"
            />
          </div>

          {/* 2. Quận/Huyện * */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Quận/Huyện <span className="text-red-600">*</span>
            </label>
            <CustomSelect
              value={selectedDistrict}
              onChange={handleDistrictChange}
              options={districtOptions}
              placeholder="Chọn quận/huyện"
              disabled={!selectedCity || districtOptions.length === 0}
              showSearch={true}
              searchPlaceholder="Tìm quận/huyện..."
              className="py-2.5 bg-slate-50 border-slate-200 text-xs font-semibold rounded-2xl"
            />
          </div>

          {/* 3. Phường/Xã * */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Phường/Xã <span className="text-red-600">*</span>
            </label>
            <CustomSelect
              value={selectedWard}
              onChange={(val) => setSelectedWard(val)}
              options={wardOptions}
              placeholder="Chọn phường/xã"
              disabled={!selectedDistrict || wardOptions.length === 0}
              showSearch={true}
              searchPlaceholder="Tìm phường/xã..."
              className="py-2.5 bg-slate-50 border-slate-200 text-xs font-semibold rounded-2xl"
            />
          </div>

          {/* 4. Đường/Phố */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Đường/Phố
              </label>
              {isCustomStreet ? (
                <button
                  type="button"
                  onClick={() => setIsCustomStreet(false)}
                  className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <i className="fa-solid fa-list-ul"></i>
                  <span>Chọn từ danh sách</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomStreet(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Tự nhập tay
                </button>
              )}
            </div>

            {isCustomStreet ? (
              <input
                type="text"
                value={customStreetInput}
                onChange={(e) => setCustomStreetInput(e.target.value)}
                placeholder="Nhập tên đường, phố..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <CustomSelect
                value={selectedStreet}
                onChange={handleStreetSelect}
                options={streetOptions}
                placeholder="Chọn đường/phố"
                showSearch={true}
                searchPlaceholder="Tìm tên đường/phố..."
                className="py-2.5 bg-slate-50 border-slate-200 text-xs font-semibold rounded-2xl"
              />
            )}
          </div>

          {/* 5. Địa chỉ chi tiết */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Địa chỉ chi tiết
            </label>
            <input
              type="text"
              value={detailedAddress}
              onChange={(e) => setDetailedAddress(e.target.value)}
              placeholder="Nhập số nhà, khu phố, ngõ hẻm..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* 6. Dự án */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Dự án
              </label>
              {isCustomProject ? (
                <button
                  type="button"
                  onClick={() => setIsCustomProject(false)}
                  className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <i className="fa-solid fa-list-ul"></i>
                  <span>Chọn từ danh sách</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomProject(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Tự nhập dự án
                </button>
              )}
            </div>

            {isCustomProject ? (
              <input
                type="text"
                value={customProjectInput}
                onChange={(e) => setCustomProjectInput(e.target.value)}
                placeholder="Nhập tên dự án / khu đô thị..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500"
              />
            ) : (
              <CustomSelect
                value={selectedProject}
                onChange={handleProjectSelect}
                options={projectOptions}
                placeholder="Chọn dự án"
                showSearch={true}
                searchPlaceholder="Tìm dự án..."
                className="py-2.5 bg-slate-50 border-slate-200 text-xs font-semibold rounded-2xl"
              />
            )}
          </div>

          {/* ======================================================== */}
          {/* KHỐI ĐỐI CHIẾU ĐỊA CHỈ MỚI SÁP NHẬP ĐƠN VỊ HÀNH CHÍNH      */}
          {/* Chuẩn giao diện Batdongsan.com.vn                         */}
          {/* ======================================================== */}
          {mergerSuggestion && (
            <div className="pt-2 pb-1 space-y-3 animate-in fade-in duration-200">
              
              {/* 1. ĐỊA CHỈ CŨ */}
              <div 
                onClick={() => setSelectedAddressType('old')}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                  selectedAddressType === 'old' 
                    ? 'bg-slate-50 border-slate-700 shadow-xs' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
                title="Bấm để giữ Địa chỉ cũ"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] shadow-xs shrink-0">
                      <i className="fa-solid fa-location-dot"></i>
                    </span>
                    <span className="text-xs sm:text-sm font-black text-slate-900">
                      Địa chỉ cũ
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 pl-7 leading-relaxed font-medium">
                    {mergerSuggestion.oldAddress}
                  </div>
                </div>

                <div className="pt-1 shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                    selectedAddressType === 'old' ? 'border-slate-900' : 'border-slate-300'
                  }`}>
                    {selectedAddressType === 'old' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mũi tên chuyển giao ↓ */}
              <div className="pl-4 text-slate-400">
                <i className="fa-solid fa-arrow-down text-base"></i>
              </div>

              {/* 2. ĐỊA CHỈ MỚI */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[11px] shadow-xs shrink-0">
                    <i className="fa-solid fa-location-dot"></i>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-red-600">
                    Địa chỉ mới
                  </span>
                </div>

                {/* Box Địa chỉ do hệ thống gợi ý - Chuẩn y hệt ảnh người dùng */}
                <div
                  onClick={() => setSelectedAddressType('new')}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    selectedAddressType === 'new'
                      ? 'bg-white border-red-500 shadow-md ring-1 ring-red-500/20'
                      : 'bg-white border-slate-300 hover:border-red-300'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] font-medium text-slate-500">
                      {mergerSuggestion.suggestionLabel || 'Địa chỉ do hệ thống gợi ý'}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-900 leading-relaxed">
                      {effectiveStreet ? `Đường ${effectiveStreet.replace(/^(đường|phố)\s+/i, '')}, ` : ''}
                      <strong className="font-extrabold text-slate-950">
                        {mergerSuggestion.highlightText || mergerSuggestion.newWard}
                      </strong>
                      {mergerSuggestion.newDistrict ? `, ${mergerSuggestion.newDistrict}` : ''}
                      {`, ${mergerSuggestion.newCity}`}
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      selectedAddressType === 'new' ? 'border-red-600' : 'border-slate-300'
                    }`}>
                      {selectedAddressType === 'new' && (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                      )}
                    </div>
                  </div>
                </div>

                {mergerSuggestion.resolution && (
                  <div className="text-[10px] text-slate-500 pl-2 flex items-center gap-1.5 pt-0.5">
                    <i className="fa-solid fa-circle-info text-amber-500"></i>
                    <span>Căn cứ: {mergerSuggestion.resolution}</span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Live Preview Box */}
          <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs">
            <div className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1">
              <i className="fa-solid fa-map-pin text-red-600"></i>
              <span>Địa chỉ hiển thị trên tin đăng:</span>
            </div>
            <div className="font-bold text-slate-900">
              {computedFullAddress || 'Vui lòng chọn thông tin địa chỉ'}
            </div>
          </div>
        </div>

        {/* ================= FOOTER CONTROLS ================= */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-950 transition"
          >
            Quay lại
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-7 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-full shadow-md shadow-red-600/30 transition flex items-center gap-2"
          >
            <span>Xác nhận</span>
            <i className="fa-solid fa-check text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
