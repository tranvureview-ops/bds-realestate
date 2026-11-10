'use client';

import React, { useMemo, useState } from 'react';

/**
 * 8 hướng phong thủy & địa lý chuẩn Việt Nam
 * Thứ tự góc (0° là 3h, -90° là 12h theo hệ trục SVG tiêu chuẩn):
 * - Bắc: 12h (-90°)
 * - Đông Bắc: 1h30 (-45°)
 * - Đông: 3h (0°)
 * - Đông Nam: 4h30 (45°)
 * - Nam: 6h (90°)
 * - Tây Nam: 7h30 (135°)
 * - Tây: 9h (180°)
 * - Tây Bắc: 10h30 (225°)
 */
export const COMPASS_DIRECTIONS = [
  { id: 'bac', name: 'Bắc', centerAngle: -90 },
  { id: 'dong-bac', name: 'Đông Bắc', centerAngle: -45 },
  { id: 'dong', name: 'Đông', centerAngle: 0 },
  { id: 'dong-nam', name: 'Đông Nam', centerAngle: 45 },
  { id: 'nam', name: 'Nam', centerAngle: 90 },
  { id: 'tay-nam', name: 'Tây Nam', centerAngle: 135 },
  { id: 'tay', name: 'Tây', centerAngle: 180 },
  { id: 'tay-bac', name: 'Tây Bắc', centerAngle: 225 },
];

export const DONG_TU_TRACH = ['Bắc', 'Nam', 'Đông', 'Đông Nam'];
export const TAY_TU_TRACH = ['Tây', 'Tây Bắc', 'Tây Nam', 'Đông Bắc'];

/**
 * Tạo path SVG dạng vành khuyên (annular sector) cho 1 múi 45°
 */
function createDonutSectorPath(cx, cy, rInner, rOuter, startAngleDeg, endAngleDeg) {
  const toRad = deg => (deg * Math.PI) / 180;
  const startRad = toRad(startAngleDeg);
  const endRad = toRad(endAngleDeg);

  const x1 = cx + rOuter * Math.cos(startRad);
  const y1 = cy + rOuter * Math.sin(startRad);
  const x2 = cx + rOuter * Math.cos(endRad);
  const y2 = cy + rOuter * Math.sin(endRad);

  const x3 = cx + rInner * Math.cos(endRad);
  const y3 = cy + rInner * Math.sin(endRad);
  const x4 = cx + rInner * Math.cos(startRad);
  const y4 = cy + rInner * Math.sin(startRad);

  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 0 0 ${x4} ${y4} Z`;
}

/**
 * DirectionCompassSelector
 * Component La bàn / Vòng tròn chọn 8 hướng nhà phong thủy
 *
 * @param {string|string[]} value - Hướng hiện tại ('all', 'Đông', 'Bắc, Đông' hoặc mảng ['Bắc'])
 * @param {function} onChange - Callback khi chọn (newValueString, newArray)
 * @param {boolean} showPresets - Hiển thị các nút tắt Đông Tứ Trạch / Tây Tứ Trạch / Tất cả
 * @param {string} className - Lớp CSS tùy biến bao ngoài
 */
export default function DirectionCompassSelector({
  value = 'all',
  onChange,
  showPresets = true,
  className = ''
}) {
  const [hoveredDir, setHoveredDir] = useState(null);

  // Phân tích mảng các hướng đã chọn từ prop value
  const selectedDirections = useMemo(() => {
    if (!value || value === 'all') return [];
    if (Array.isArray(value)) return value.filter(v => v && v !== 'all');
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== 'all');
    }
    return [];
  }, [value]);

  const isAllSelected = selectedDirections.length === 0;

  // Toggle 1 hướng
  const handleToggleDirection = (dirName) => {
    let nextList;
    if (selectedDirections.includes(dirName)) {
      nextList = selectedDirections.filter(d => d !== dirName);
    } else {
      nextList = [...selectedDirections, dirName];
    }

    notifyChange(nextList);
  };

  const notifyChange = (list) => {
    if (!onChange) return;
    if (list.length === 0 || list.length === 8) {
      onChange('all', []);
    } else if (list.length === 1) {
      onChange(list[0], list);
    } else {
      onChange(list.join(', '), list);
    }
  };

  // Chọn toàn bộ / reset
  const handleSelectAll = () => {
    notifyChange([]);
  };

  // Chọn theo phong thủy Đông tứ trạch
  const handleSelectDongTuTrach = () => {
    notifyChange(DONG_TU_TRACH);
  };

  // Chọn theo phong thủy Tây tứ trạch
  const handleSelectTayTuTrach = () => {
    notifyChange(TAY_TU_TRACH);
  };

  const isDongTuTrachActive = useMemo(() => {
    if (selectedDirections.length !== DONG_TU_TRACH.length) return false;
    return DONG_TU_TRACH.every(d => selectedDirections.includes(d));
  }, [selectedDirections]);

  const isTayTuTrachActive = useMemo(() => {
    if (selectedDirections.length !== TAY_TU_TRACH.length) return false;
    return TAY_TU_TRACH.every(d => selectedDirections.includes(d));
  }, [selectedDirections]);

  // Thông số hình học SVG
  const cx = 150;
  const cy = 150;
  const rOuter = 138;
  const rInner = 56;
  const rText = 98; // Bán kính đặt tâm text nhãn hướng

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Vòng quay la bàn la bàn SVG */}
      <div className="relative w-full max-w-[260px] sm:max-w-[280px] aspect-square flex items-center justify-center">
        <svg
          viewBox="0 0 300 300"
          className="w-full h-full drop-shadow-sm transition-all"
        >
          <defs>
            {/* Bộ lọc bóng đổ mềm cho khối tròn trung tâm */}
            <filter id="compass-center-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
          </defs>

          {/* Vòng tròn nền ngoài */}
          <circle
            cx={cx}
            cy={cy}
            r={rOuter + 1}
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="2"
          />

          {/* 8 múi hướng */}
          {COMPASS_DIRECTIONS.map((dir) => {
            const isSelected = selectedDirections.includes(dir.name);
            const isHovered = hoveredDir === dir.name;
            const startAngle = dir.centerAngle - 22.5;
            const endAngle = dir.centerAngle + 22.5;
            const pathData = createDonutSectorPath(cx, cy, rInner, rOuter, startAngle, endAngle);

            // Tọa độ tâm chữ
            const textRad = (dir.centerAngle * Math.PI) / 180;
            const tx = cx + rText * Math.cos(textRad);
            const ty = cy + rText * Math.sin(textRad);

            // Màu sắc chuẩn theo thiết kế người dùng gửi (Deep Teal/Emerald #00594c)
            let fillColor = '#ffffff';
            let strokeColor = '#e2e8f0';
            let textColor = '#334155';

            if (isSelected) {
              fillColor = isHovered ? '#00473d' : '#00594c';
              strokeColor = '#00594c';
              textColor = '#ffffff';
            } else if (isHovered) {
              fillColor = '#f1f5f9';
              textColor = '#0f172a';
            }

            return (
              <g
                key={dir.id}
                className="cursor-pointer transition-colors"
                onClick={() => handleToggleDirection(dir.name)}
                onMouseEnter={() => setHoveredDir(dir.name)}
                onMouseLeave={() => setHoveredDir(null)}
              >
                <path
                  d={pathData}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  className="transition-colors duration-150"
                />
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={textColor}
                  fontSize="12.5"
                  fontWeight={isSelected ? '700' : '600'}
                  className="pointer-events-none select-none transition-colors"
                  style={{ fontFamily: 'inherit' }}
                >
                  {dir.name}
                </text>
              </g>
            );
          })}

          {/* Vòng tròn trung tâm (Hiển thị trạng thái "ĐÃ CHỌN X HƯỚNG") */}
          <g
            className="cursor-pointer group"
            onClick={handleSelectAll}
            title={selectedDirections.length > 0 ? 'Nhấp để xóa chọn tất cả' : 'Chọn hướng bạn quan tâm'}
          >
            <circle
              cx={cx}
              cy={cy}
              r={rInner - 1}
              fill="#ffffff"
              filter="url(#compass-center-shadow)"
              className="transition-transform group-hover:scale-[1.02]"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {selectedDirections.length > 0 ? (
              <>
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  className="pointer-events-none uppercase"
                >
                  ĐÃ CHỌN
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#00594c"
                  fontSize="14.5"
                  fontWeight="800"
                  className="pointer-events-none"
                >
                  {selectedDirections.length} HƯỚNG
                </text>
              </>
            ) : (
              <>
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontWeight="700"
                  letterSpacing="0.08em"
                  className="pointer-events-none uppercase"
                >
                  HƯỚNG NHÀ
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#475569"
                  fontSize="13.5"
                  fontWeight="700"
                  className="pointer-events-none"
                >
                  Tất cả
                </text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Thanh nút gợi ý phong thủy & đặt lại */}
      {showPresets && (
        <div className="w-full mt-3.5 space-y-2">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                isAllSelected
                  ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              Tất cả hướng
            </button>

            <button
              type="button"
              onClick={handleSelectDongTuTrach}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                isDongTuTrachActive
                  ? 'bg-[#00594c] text-white border-[#00594c] shadow-2xs'
                  : 'bg-white hover:bg-emerald-50/60 text-emerald-800 border-emerald-200'
              }`}
              title="Đông tứ trạch gồm: Bắc, Nam, Đông, Đông Nam"
            >
              Đông tứ trạch
            </button>

            <button
              type="button"
              onClick={handleSelectTayTuTrach}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border cursor-pointer ${
                isTayTuTrachActive
                  ? 'bg-[#00594c] text-white border-[#00594c] shadow-2xs'
                  : 'bg-white hover:bg-emerald-50/60 text-emerald-800 border-emerald-200'
              }`}
              title="Tây tứ trạch gồm: Tây, Tây Bắc, Tây Nam, Đông Bắc"
            >
              Tây tứ trạch
            </button>
          </div>

          {/* Huy hiệu danh sách các hướng đang chọn */}
          {selectedDirections.length > 0 && (
            <div className="flex items-center justify-center flex-wrap gap-1 pt-1 max-w-sm mx-auto">
              {selectedDirections.map(dir => (
                <span
                  key={dir}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#00594c]/10 text-[#00594c] border border-[#00594c]/20"
                >
                  <span>{dir}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleDirection(dir)}
                    className="hover:text-red-600 transition"
                    title={`Bỏ chọn hướng ${dir}`}
                  >
                    <i className="fa-solid fa-xmark text-[10px]"></i>
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition ml-1 underline cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
