'use client';

import React, { useEffect } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { useRouter, Link } from '../router/RouterContext';
import SinglePropertyPage from '../components/SinglePropertyPage';
import ListingCard from '../components/ListingCard';
import { parsePropertyUrl, getPropertyPermalink, generatePropertyJsonLd, toVietnameseSlug } from '../utils/permalink';

export default function PropertyDetailPage({ initialProperty = null, slug = '', currentPath: propPath = '' }) {
  const { properties, selectedPropertyDetail, setSelectedPropertyDetail, getPropertyExpirationInfo, currentUser } = useRealEstate();
  const { currentPath: routerPath, goBack } = useRouter();

  // 1. Phân tích đường dẫn URL theo chuẩn Batdongsan.com.vn (*-pr{id})
  const effectivePath = propPath || (slug ? (slug.startsWith('/') ? slug : `/${slug}`) : '') || routerPath || '';
  const parsed = parsePropertyUrl(effectivePath);

  // 2. Tìm bất động sản phù hợp bằng quy tắc Ưu Tiên ID Tuyệt Đối (Strict ID-First Matching)
  let targetProperty = initialProperty || null;

  // Tiêu chí 1: Strict ID Matching (khi URL chứa -pr{id})
  if (!targetProperty && (parsed.normalizedBdsId || parsed.rawIdNumber)) {
    targetProperty = properties.find(p => {
      if (!p) return false;
      if (parsed.normalizedBdsId && p.id?.toUpperCase() === parsed.normalizedBdsId.toUpperCase()) return true;
      const pNum = parseInt(String(p.id || '').replace(/\D/g, ''), 10);
      const parsedNum = parseInt(String(parsed.rawIdNumber || '').replace(/\D/g, ''), 10);
      return !isNaN(pNum) && !isNaN(parsedNum) && pNum === parsedNum;
    });
  }

  // Tiêu chí 2: Exact Canonical Permalink Matching
  if (!targetProperty && effectivePath) {
    targetProperty = properties.find(p => {
      if (!p) return false;
      const pLink = getPropertyPermalink(p);
      return pLink === effectivePath || pLink.replace(/\/$/, '') === effectivePath.replace(/\/$/, '');
    });
  }

  // Tiêu chí 3: Slug Matching (Chỉ dùng khi URL không có ID định danh hoặc ID không tìm thấy trong properties)
  if (!targetProperty && parsed.rawSlug) {
    const slugMatches = properties.filter(p => {
      if (!p) return false;
      if (p.slug && p.slug.toLowerCase() === parsed.rawSlug.toLowerCase()) return true;
      if (toVietnameseSlug(p.title) === parsed.rawSlug.toLowerCase()) return true;
      return false;
    });
    if (slugMatches.length > 0) {
      targetProperty = slugMatches.find(p => p.status === 'active') || slugMatches[0];
    }
  }

  // Đồng bộ với bản ghi mới nhất từ Context (nếu Client Context đã cập nhật trạng thái/gia hạn/hết hạn)
  if (targetProperty && properties && properties.length > 0) {
    const liveProp = properties.find(p => p.id === targetProperty.id);
    if (liveProp) {
      targetProperty = { ...targetProperty, ...liveProp };
    }
  }

  // Tiêu chí 5: Fallback qua selectedPropertyDetail từ Context nếu trùng ID hoặc URL
  if (!targetProperty && selectedPropertyDetail) {
    if (parsed.normalizedBdsId && selectedPropertyDetail.id?.toUpperCase() === parsed.normalizedBdsId.toUpperCase()) {
      targetProperty = selectedPropertyDetail;
    } else if (getPropertyPermalink(selectedPropertyDetail) === effectivePath) {
      targetProperty = selectedPropertyDetail;
    }
  }

  // 3. Đồng bộ hóa với Context & Bơm Schema.org JSON-LD vào thẻ <head>
  useEffect(() => {
    if (targetProperty) {
      if (!selectedPropertyDetail || selectedPropertyDetail.id !== targetProperty.id) {
        setSelectedPropertyDetail(targetProperty);
      }

      // Tạo & Bơm thẻ <script type="application/ld+json"> cho Google Rich Results
      const jsonLdData = generatePropertyJsonLd(targetProperty);
      let scriptTag = document.getElementById('bds-property-jsonld');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'bds-property-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);

      // Cập nhật Canonical URL
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', `https://datbiendanang.vn${getPropertyPermalink(targetProperty)}`);

      return () => {
        if (scriptTag && scriptTag.parentNode) {
          scriptTag.parentNode.removeChild(scriptTag);
        }
      };
    }
  }, [targetProperty, selectedPropertyDetail, setSelectedPropertyDetail]);

  if (!targetProperty) {
    const suggestedProperties = properties.filter(p => p.status === 'active').slice(0, 3);

    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        <div className="max-w-xl mx-auto text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">Không tìm thấy bài viết bất động sản</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Bài đăng có mã số hoặc đường dẫn này có thể đã được gỡ bỏ, chưa được phê duyệt, hoặc bạn truy cập bằng liên kết cũ không còn tồn tại trên sàn.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => goBack('/nha-dat-ban')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Quay lại trang trước</span>
            </button>
            <Link
              to="/"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-2"
            >
              <i className="fa-solid fa-house"></i>
              <span>Về Trang Chủ</span>
            </Link>
            <Link
              to="/nha-dat-ban"
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>Tìm BĐS khác</span>
            </Link>
          </div>
        </div>

        {/* Gợi ý bất động sản nổi bật dành cho người dùng */}
        {suggestedProperties.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <i className="fa-solid fa-fire text-rose-500"></i>
                  Gợi ý bất động sản nổi bật tại Đà Nẵng
                </h3>
                <p className="text-xs text-slate-500">Các tin đăng được xác thực và quan tâm nhiều nhất hôm nay</p>
              </div>
              <Link to="/nha-dat-ban" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                <span>Xem tất cả</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedProperties.map(prop => (
                <ListingCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const isPending = targetProperty.status === 'pending';
  const expInfo = getPropertyExpirationInfo ? getPropertyExpirationInfo(targetProperty) : null;
  const isExpired = targetProperty.status === 'expired' || Boolean(expInfo?.isExpired);
  const isExpiringSoon = Boolean(expInfo?.isExpiringSoon) && !isExpired && targetProperty.status === 'active';

  // Kiểm tra quyền: Chỉ tác giả bài viết và ban quản trị mới có quyền gia hạn hoặc xem chế độ xem trước
  const isAdmin = currentUser?.role === 'admin';
  const isAuthor = Boolean(
    currentUser && (
      (targetProperty.author?.id && targetProperty.author.id === currentUser.id) ||
      (targetProperty.userId && targetProperty.userId === currentUser.id) ||
      ((!currentUser || currentUser.role === 'guest' || currentUser.id === 'guest') && 
        (targetProperty.isGuest || targetProperty.author?.isGuest || String(targetProperty.author?.id).startsWith('guest'))) ||
      (currentUser.phone && (
        (targetProperty.author?.phone && targetProperty.author.phone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, '')) ||
        (targetProperty.contactPhone && targetProperty.contactPhone.replace(/\s+/g, '') === currentUser.phone.replace(/\s+/g, ''))
      )) ||
      (currentUser.email && (
        (targetProperty.author?.email && targetProperty.author.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (targetProperty.contactEmail && targetProperty.contactEmail.toLowerCase() === currentUser.email.toLowerCase())
      ))
    )
  );
  const canManage = isAdmin || isAuthor;

  return (
    <div>
      {/* 1. Banner cảnh báo bài viết đã hết hạn theo chuẩn Batdongsan.com.vn */}
      {isExpired && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white px-4 py-3 shadow-md border-b border-rose-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-rose-800/80 flex items-center justify-center shrink-0 text-yellow-300">
                <i className="fa-solid fa-triangle-exclamation text-base"></i>
              </div>
              <div>
                <span className="font-extrabold uppercase tracking-wide">THÔNG BÁO HẾT HẠN HIỂN THỊ</span>
                <p className="text-rose-100 text-xs font-normal mt-0.5">
                  Tin đăng này đã hết hạn hiển thị vào ngày <strong>{targetProperty.expiresAt ? new Date(targetProperty.expiresAt).toLocaleDateString('vi-VN') : 'vừa qua'}</strong> theo quy chế thời gian hiển thị. Tin hiện không xuất hiện trên các trang tìm kiếm công khai.
                </p>
              </div>
            </div>
            {canManage && (
              <div className="flex items-center gap-2 shrink-0">
                <Link to="/quan-ly-tin" className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5">
                  <i className="fa-solid fa-arrows-rotate"></i>
                  <span>Gia Hạn Tin Ngay</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Banner thông báo xem trước nếu tin chưa được Active */}
      {isPending && !isExpired && canManage && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-b border-amber-600">
          <i className="fa-solid fa-circle-info text-sm"></i>
          <span>
            CHẾ ĐỘ XEM TRƯỚC: Tin đăng này đang trong Hàng đợi kiểm duyệt ({targetProperty.approvalNote || 'Chờ duyệt'}). Tin sẽ hiển thị công khai trên toàn hệ thống sau khi kích hoạt!
          </span>
        </div>
      )}
      
      <SinglePropertyPage propertyOverride={targetProperty} />
    </div>
  );
}

