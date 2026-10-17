'use client';

import React from 'react';
import { evaluatePasswordSecurity } from '../utils/authValidation';

/**
 * Component hiển thị thanh đo độ mạnh mật khẩu và danh sách tiêu chuẩn bảo mật theo thời gian thực
 * @param {string} password Mật khẩu đang nhập
 * @param {string} confirmPassword Mật khẩu xác nhận (tùy chọn)
 * @param {boolean} compact Chế độ hiển thị thu gọn (cho popup modal)
 */
export default function PasswordSecurityChecker({ password = '', confirmPassword, compact = false }) {
  if (!password && !confirmPassword) return null;

  const { score, strengthLabel, strengthColor, strengthTextColor, rules, isValid } = evaluatePasswordSecurity(password);
  const isConfirming = confirmPassword !== undefined && confirmPassword !== null && confirmPassword.length > 0;
  const isMatch = isConfirming && confirmPassword === password;

  const checklist = [
    { label: '8+ ký tự', passed: rules.minLength },
    { label: 'Chữ in hoa (A-Z)', passed: rules.hasUpper },
    { label: 'Chữ in thường (a-z)', passed: rules.hasLower },
    { label: 'Số (0-9)', passed: rules.hasNumber },
    { label: 'Ký tự đặc biệt (!@#$...)', passed: rules.hasSpecial }
  ];

  return (
    <div className="space-y-2 pt-1 pb-1">
      {/* Strength Bar & Label */}
      {password.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Độ mạnh mật khẩu:</span>
            <span className={`font-black ${strengthTextColor}`}>
              {strengthLabel} {isValid && '✓'}
            </span>
          </div>

          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex gap-1">
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 1 ? strengthColor : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 2 ? strengthColor : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 3 ? strengthColor : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 4 ? strengthColor : 'bg-slate-200'}`} />
            <div className={`h-full flex-1 rounded-full transition-all duration-300 ${score >= 5 ? strengthColor : 'bg-slate-200'}`} />
          </div>
        </div>
      )}

      {/* Rules Checklist */}
      <div className={`grid ${compact ? 'grid-cols-2 gap-1.5' : 'grid-cols-2 sm:grid-cols-3 gap-1.5'} pt-0.5`}>
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg transition-colors ${
              item.passed
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}
          >
            <i
              className={`fa-solid text-[9px] ${
                item.passed ? 'fa-check text-emerald-600' : 'fa-circle text-slate-300'
              }`}
            />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Confirm Password Feedback */}
      {isConfirming && (
        <div
          className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all ${
            isMatch
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-600 border border-rose-200'
          }`}
        >
          <i className={`fa-solid ${isMatch ? 'fa-check-circle text-emerald-600' : 'fa-circle-xmark text-rose-500'}`} />
          <span>{isMatch ? 'Mật khẩu xác nhận trùng khớp' : 'Mật khẩu xác nhận chưa trùng khớp'}</span>
        </div>
      )}
    </div>
  );
}
