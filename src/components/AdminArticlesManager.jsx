'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRealEstate } from '../context/RealEstateContext';
import { Link } from '../router/RouterContext';

// Danh sách các ảnh thực tế có sẵn trong dự án để chọn nhanh
const PRESET_ARTICLE_IMAGES = [
  {
    url: '/images/articles/nha-mat-pho-co-mat-tien-rong-phuc-vu-kinh-doanh.jpg',
    title: 'Nhà mặt phố có mặt tiền rộng kinh doanh',
    category: 'Mặt bằng kinh doanh'
  },
  {
    url: '/images/articles/khao-sat-luu-luong-giao-thong-tai-tuyen-pho-thuong-mai.jpg',
    title: 'Khảo sát lưu lượng giao thông tuyến phố thương mại',
    category: 'Thực địa'
  },
  {
    url: '/images/articles/via-he-va-khu-vuc-do-xe-truoc-nha-mat-pho.jpg',
    title: 'Vỉa hè và khu vực đỗ xe trước nhà mặt phố',
    category: 'Hạ tầng'
  },
  {
    url: '/images/articles/kiem-tra-thong-tin-quy-hoach-truoc-khi-mua-nha.jpg',
    title: 'Bản đồ quy hoạch phân khu 1/2000',
    category: 'Pháp lý & Quy hoạch'
  },
  {
    url: '/mua-ban-nha-dat-toan-quoc.webp',
    title: 'Thị trường mua bán nhà đất toàn quốc',
    category: 'Tổng quan'
  },
  {
    url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    title: 'Hợp đồng mua bán và chuyển nhượng BĐS',
    category: 'Pháp lý'
  },
  {
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
    title: 'Tòa nhà căn hộ chung cư cao cấp',
    category: 'Căn hộ'
  },
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    title: 'Đất nền dự án và quy hoạch đô thị mới',
    category: 'Đất nền'
  }
];

/**
 * Chuyển đổi Markdown bài viết thành HTML xem trước hiển thị thời gian thực
 */
function formatArticlePreviewHtml(content) {
  if (!content) return '<p class="text-slate-400 italic">Chưa có nội dung bài viết...</p>';

  const formatInline = (text) => {
    return text
      .replace(/\$\$/g, '')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm"><img src="$2" alt="$1" class="w-full h-auto object-cover max-h-[480px]" loading="lazy" /><figcaption class="p-3 text-center text-xs sm:text-sm text-slate-600 font-medium italic border-t border-slate-100 bg-white">$1</figcaption></figure>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-700 hover:text-emerald-800 font-semibold underline decoration-emerald-300 transition-colors">$1</a>');
  };

  const rawBlocks = content.split(/\n\s*\n/);
  const htmlBlocks = [];

  for (let block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // Heading 2
    if (/^##\s+/.test(trimmed)) {
      const title = trimmed.replace(/^##\s+/, '').replace(/\s+\{#.*\}$/, '');
      htmlBlocks.push(`<h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-8 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">${formatInline(title)}</h2>`);
      continue;
    }

    // Heading 3
    if (/^###\s+/.test(trimmed)) {
      const title = trimmed.replace(/^###\s+/, '').replace(/\s+\{#.*\}$/, '');
      htmlBlocks.push(`<h3 class="text-lg sm:text-xl font-bold text-slate-800 mt-6 mb-3">${formatInline(title)}</h3>`);
      continue;
    }

    // Heading 4
    if (/^####\s+/.test(trimmed)) {
      const title = trimmed.replace(/^####\s+/, '');
      htmlBlocks.push(`<h4 class="text-base font-bold text-slate-800 mt-4 mb-2">${formatInline(title)}</h4>`);
      continue;
    }

    // Standalone Image
    if (/^!\[(.*?)\]\((.*?)\)\s*$/.test(trimmed)) {
      const m = trimmed.match(/^!\[(.*?)\]\((.*?)\)\s*$/);
      if (m) {
        const alt = m[1];
        const src = m[2];
        htmlBlocks.push(
          `<figure class="my-6 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
            <img src="${src}" alt="${alt}" class="w-full h-auto object-cover max-h-[480px]" loading="lazy" />
            ${alt ? `<figcaption class="p-3 text-center text-xs sm:text-sm text-slate-600 font-medium italic border-t border-slate-100 bg-white">${alt}</figcaption>` : ''}
          </figure>`
        );
        continue;
      }
    }

    // Blockquote
    if (/^>\s+/.test(trimmed)) {
      const quote = trimmed.split('\n').map(l => l.replace(/^>\s?/, '')).join(' ');
      htmlBlocks.push(`<blockquote class="p-4 sm:p-5 my-5 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-2xl text-slate-700 text-sm sm:text-base italic leading-relaxed">${formatInline(quote)}</blockquote>`);
      continue;
    }

    // Markdown Table
    if (trimmed.includes('|') && trimmed.includes('---')) {
      const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
      let tableHtml = '<div class="my-6 overflow-x-auto"><table class="w-full border-collapse border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">';
      let isThead = true;
      let hasClosedThead = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('---')) {
          if (isThead) {
            tableHtml += '</thead><tbody>';
            isThead = false;
            hasClosedThead = true;
          }
          continue;
        }

        const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cols.length === 0) continue;

        if (isThead) {
          tableHtml += '<thead class="bg-slate-100 text-slate-800 font-bold border-b border-slate-200"><tr>';
          cols.forEach(c => {
            tableHtml += `<th class="p-3 text-left border-r border-slate-200 last:border-r-0">${formatInline(c)}</th>`;
          });
          tableHtml += '</tr>';
        } else {
          const rowBg = i % 2 === 0 ? 'bg-white' : 'bg-slate-50/70';
          tableHtml += `<tr class="${rowBg} border-b border-slate-200/80 hover:bg-emerald-50/30 transition">`;
          cols.forEach(c => {
            tableHtml += `<td class="p-3 text-slate-700 border-r border-slate-200 last:border-r-0">${formatInline(c)}</td>`;
          });
          tableHtml += '</tr>';
        }
      }

      if (!hasClosedThead && isThead) {
        tableHtml += '</thead><tbody>';
      }
      tableHtml += '</tbody></table></div>';
      htmlBlocks.push(tableHtml);
      continue;
    }

    // Unordered List
    if (/^[-*]\s+/.test(trimmed)) {
      const items = trimmed.split('\n').filter(l => /^[-*]\s+/.test(l.trim()));
      htmlBlocks.push(
        `<ul class="list-disc pl-6 my-4 space-y-2 text-slate-700">${items.map(it => `<li>${formatInline(it.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`
      );
      continue;
    }

    // Ordered List
    if (/^\d+\.\s+/.test(trimmed)) {
      const items = trimmed.split('\n').filter(l => /^\d+\.\s+/.test(l.trim()));
      htmlBlocks.push(
        `<ol class="list-decimal pl-6 my-4 space-y-2 text-slate-700">${items.map(it => `<li>${formatInline(it.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`
      );
      continue;
    }

    // Default Paragraph
    htmlBlocks.push(`<p class="my-4 text-slate-700 leading-relaxed text-sm sm:text-base">${formatInline(trimmed)}</p>`);
  }

  return htmlBlocks.join('\n');
}

/**
 * Helper tạo danh sách số trang có dấu ba chấm thông minh
 */
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}

export default function AdminArticlesManager() {
  const {
    articlesList,
    articleCategories,
    createArticle,
    updateArticle,
    deleteArticle,
    toggleArticleStatus,
    duplicateArticle,
    resetArticlesToDefault,
    createArticleCategory,
    updateArticleCategory,
    deleteArticleCategory,
    currentUser,
    showToast
  } = useRealEstate();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'categories'

  // Phân trang danh sách bài viết trong Quản trị
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminItemsPerPage, setAdminItemsPerPage] = useState(10);

  // Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [editorTab, setEditorTab] = useState('write'); // 'write' | 'preview' | 'seo'
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [imagePickerTarget, setImagePickerTarget] = useState('cover'); // 'cover' | 'content'
  const [pickerTab, setPickerTab] = useState('library'); // 'library' | 'upload' | 'url'
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customImageCaption, setCustomImageCaption] = useState('');
  const [deleteConfirmArticle, setDeleteConfirmArticle] = useState(null);
  const savedCursorPos = useRef(null);
  const savedScrollTop = useRef(0);
  const savedFormScrollTop = useRef(0);

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State for Article Editor
  const [formData, setFormData] = useState({
    title: '',
    shortTitle: '',
    slug: '',
    categorySlug: 'thi-truong',
    categoryName: '',
    excerpt: '',
    author: currentUser?.name || 'Chuyên gia BĐS Kênh Nhà Đất 24H',
    authorRole: 'Phòng Nghiên Cứu & Thẩm Định Thị Trường',
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: '8 phút đọc',
    image: '/images/articles/nha-mat-pho-co-mat-tien-rong-phuc-vu-kinh-doanh.jpg',
    tags: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    status: 'published'
  });

  // Category Form State
  const [categoryFormData, setCategoryFormData] = useState({
    slug: '',
    name: '',
    shortName: '',
    badge: '',
    path: '',
    icon: 'fa-solid fa-newspaper',
    color: 'blue',
    description: ''
  });

  const textareaRef = useRef(null);

  // Danh mục map
  const categories = useMemo(() => {
    return articleCategories || [];
  }, [articleCategories]);

  const articles = useMemo(() => {
    return articlesList || [];
  }, [articlesList]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter(a => a.status !== 'draft').length;
    const draft = total - published;
    return { total, published, draft, categoriesCount: categories.length };
  }, [articles, categories]);

  // Tập hợp danh sách ảnh có sẵn (Preset + các ảnh đã dùng trong bài viết)
  const allAvailableImages = useMemo(() => {
    const map = new Map();
    PRESET_ARTICLE_IMAGES.forEach(item => {
      map.set(item.url, item);
    });
    articles.forEach(art => {
      if (art.image && !map.has(art.image)) {
        map.set(art.image, {
          url: art.image,
          title: art.title,
          category: art.categoryName || 'Bài viết'
        });
      }
      if (art.content) {
        const regex = /!\[(.*?)\]\((.*?)\)/g;
        let m;
        while ((m = regex.exec(art.content)) !== null) {
          const alt = m[1] || 'Hình ảnh';
          const url = m[2];
          if (url && !map.has(url)) {
            map.set(url, {
              url,
              title: alt,
              category: 'Nội dung bài viết'
            });
          }
        }
      }
    });
    return Array.from(map.values());
  }, [articles]);

  // Lọc bài viết
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchSearch = !searchTerm || 
        (art.title && art.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (art.slug && art.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (art.author && art.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategoryFilter === 'all' || art.categorySlug === selectedCategoryFilter;
      
      const isDraft = art.status === 'draft';
      const matchStatus = selectedStatusFilter === 'all' || 
        (selectedStatusFilter === 'published' && !isDraft) ||
        (selectedStatusFilter === 'draft' && isDraft);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [articles, searchTerm, selectedCategoryFilter, selectedStatusFilter]);

  // Phân trang danh sách bài viết
  const totalAdminPages = Math.max(1, Math.ceil(filteredArticles.length / adminItemsPerPage));
  const safeAdminPage = Math.min(Math.max(1, adminCurrentPage), totalAdminPages);
  const pagedAdminArticles = useMemo(() => {
    const start = (safeAdminPage - 1) * adminItemsPerPage;
    return filteredArticles.slice(start, start + adminItemsPerPage);
  }, [filteredArticles, safeAdminPage, adminItemsPerPage]);

  // Helper sinh slug tự động
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Mở form tạo mới bài viết
  const handleOpenCreateModal = () => {
    const defaultCat = categories[0] || { slug: 'thi-truong', name: 'Thông Tin Thị Trường' };
    setEditingArticle(null);
    setFormData({
      title: '',
      shortTitle: '',
      slug: '',
      categorySlug: defaultCat.slug,
      categoryName: defaultCat.name,
      excerpt: '',
      author: currentUser?.name || 'Chuyên gia BĐS Kênh Nhà Đất 24H',
      authorRole: 'Phòng Nghiên Cứu & Thẩm Định Thị Trường',
      publishedAt: new Date().toISOString().split('T')[0],
      readTime: '8 phút đọc',
      image: PRESET_ARTICLE_IMAGES[0].url,
      tags: 'Bất động sản, Thị trường BĐS, Kênh Nhà Đất 24H',
      content: `## 1. Giới thiệu tổng quan {#tong-quan}

Nội dung phần 1 chia sẻ thông tin chi tiết về thị trường bất động sản...

## 2. Tiêu chí đánh giá thực tế {#tieu-chi}

- Tiêu chí 1: Pháp lý hoàn chỉnh, sổ đỏ chính quy.
- Tiêu chí 2: Vị trí giao thông kết nối thuận tiện.
- Tiêu chí 3: Tiềm năng tăng giá và dòng tiền cho thuê.

> **Lời khuyên chuyên gia:** Luôn kiểm tra quy hoạch phân khu 1/2000 tại cơ quan có thẩm quyền trước khi xuống cọc.

## 3. Kết luận và khuyến nghị {#ket-luan}

Tóm tắt các điểm lưu ý dành cho nhà đầu tư...
`,
      seoTitle: '',
      seoDescription: '',
      status: 'published'
    });
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  // Mở form chỉnh sửa bài viết
  const handleOpenEditModal = (article) => {
    setEditingArticle(article);
    const cat = categories.find(c => c.slug === article.categorySlug);
    setFormData({
      title: article.title || '',
      shortTitle: article.shortTitle || '',
      slug: article.slug || '',
      categorySlug: article.categorySlug || 'thi-truong',
      categoryName: cat?.name || article.categoryName || '',
      excerpt: article.excerpt || '',
      author: article.author || 'Chuyên gia BĐS Kênh Nhà Đất 24H',
      authorRole: article.authorRole || 'Phòng Nghiên Cứu & Thẩm Định Thị Trường',
      publishedAt: article.publishedAt || new Date().toISOString().split('T')[0],
      readTime: article.readTime || '8 phút đọc',
      image: article.image || PRESET_ARTICLE_IMAGES[0].url,
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : (article.tags || ''),
      content: article.content || '',
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || '',
      status: article.status || 'published'
    });
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  // Xử lý thay đổi tiêu đề -> tự động cập nhật slug nếu slug đang trống hoặc khớp tiêu đề cũ
  const handleTitleChange = (val) => {
    const newSlug = generateSlug(val);
    setFormData(prev => {
      const isAutoSlug = !prev.slug || prev.slug === generateSlug(prev.title);
      return {
        ...prev,
        title: val,
        slug: isAutoSlug ? newSlug : prev.slug,
        seoTitle: prev.seoTitle ? prev.seoTitle : val
      };
    });
  };

  // Lưu bài viết (Tạo mới hoặc Cập nhật)
  const handleSaveArticle = async (e) => {
    if (e) e.preventDefault();

    if (!formData.title.trim()) {
      showToast?.('Vui lòng nhập tiêu đề bài viết!', 'error');
      return;
    }

    const cleanSlug = (formData.slug || generateSlug(formData.title)).trim();
    if (!cleanSlug) {
      showToast?.('Vui lòng nhập đường dẫn (slug) bài viết!', 'error');
      return;
    }

    const selectedCat = categories.find(c => c.slug === formData.categorySlug);
    const parsedTags = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const articlePayload = {
      ...formData,
      slug: cleanSlug,
      categoryName: selectedCat ? selectedCat.name : formData.categoryName,
      tags: parsedTags,
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.excerpt
    };

    if (editingArticle) {
      await updateArticle(editingArticle.id, articlePayload);
    } else {
      await createArticle(articlePayload);
    }

    setIsEditorOpen(false);
  };

  // Xác nhận xóa bài viết
  const handleConfirmDelete = async () => {
    if (deleteConfirmArticle) {
      await deleteArticle(deleteConfirmArticle.id);
      setDeleteConfirmArticle(null);
    }
  };

  // Xử lý tải ảnh đại diện từ máy tính
  const handleUploadImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast?.('Kích thước ảnh tối đa là 5MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result;
      if (base64Url) {
        setFormData(prev => ({ ...prev, image: base64Url }));
        showToast?.('Đã tải ảnh đại diện thành công!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Áp dụng ảnh từ Modal (Chèn vào nội dung bài viết hoặc đặt làm ảnh đại diện)
  const handleApplyImage = (url, caption = '') => {
    const chosenUrl = (url || customImageUrl || '').trim();
    if (!chosenUrl) {
      showToast?.('Vui lòng chọn ảnh hoặc nhập đường dẫn ảnh hợp lệ!', 'error');
      return;
    }

    const chosenCaption = (caption || customImageCaption || '').trim();

    if (imagePickerTarget === 'cover') {
      setFormData(prev => ({ ...prev, image: chosenUrl }));
      showToast?.('Đã chọn ảnh đại diện cho bài viết!', 'success');
    } else {
      // Chèn vào vị trí con trỏ trong nội dung bài viết
      const oldContent = formData.content || '';
      const pos = typeof savedCursorPos.current === 'number' && savedCursorPos.current <= oldContent.length
        ? savedCursorPos.current
        : oldContent.length;

      const altText = chosenCaption || 'Hình ảnh minh họa bất động sản';
      const markdownSnippet = `\n\n![${altText}](${chosenUrl})\n\n`;

      const newContent = oldContent.substring(0, pos) + markdownSnippet + oldContent.substring(pos);
      setFormData(prev => ({ ...prev, content: newContent }));

      showToast?.('Đã chèn ảnh vào nội dung bài viết!', 'success');

      // Khôi phục con trỏ và vị trí cuộn chính xác, không để màn hình nhảy lung tung
      const targetScroll = savedScrollTop.current;
      const targetFormScroll = savedFormScrollTop.current;
      const nextPos = pos + markdownSnippet.length;

      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          try {
            textarea.focus({ preventScroll: true });
          } catch (_) {
            textarea.focus();
          }

          textarea.setSelectionRange(nextPos, nextPos);

          if (typeof targetScroll === 'number') {
            textarea.scrollTop = targetScroll;
          }
          const form = textarea.closest('form');
          if (form && typeof targetFormScroll === 'number') {
            form.scrollTop = targetFormScroll;
          }
        }
      }, 50);
    }

    setIsImagePickerOpen(false);
    setCustomImageUrl('');
    setCustomImageCaption('');
  };

  // Tải ảnh từ máy tính trong modal Image Picker
  const handleModalUploadFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast?.('Kích thước ảnh tối đa là 5MB!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target?.result;
      if (base64Url) {
        setCustomImageUrl(base64Url);
        if (!customImageCaption) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setCustomImageCaption(autoTitle);
        }
        showToast?.('Đã tải ảnh lên! Nhấn nút xác nhận để chèn ảnh.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Chèn nhanh định dạng Markdown vào vị trí con trỏ
  const insertMarkdownText = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevScroll = textarea.scrollTop;
    const form = textarea.closest('form');
    const prevFormScroll = form ? form.scrollTop : 0;

    const oldText = formData.content || '';
    const selectedText = oldText.substring(start, end);

    const replacement = `${prefix}${selectedText || 'nội dung'}${suffix}`;
    const newText = oldText.substring(0, start) + replacement + oldText.substring(end);

    setFormData(prev => ({ ...prev, content: newText }));

    setTimeout(() => {
      try {
        textarea.focus({ preventScroll: true });
      } catch (_) {
        textarea.focus();
      }
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 7));
      textarea.scrollTop = prevScroll;
      if (form) form.scrollTop = prevFormScroll;
    }, 50);
  };

  // Xử lý Danh mục bài viết
  const handleOpenCategoryModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryFormData({
        slug: cat.slug,
        name: cat.name,
        shortName: cat.shortName || cat.name,
        badge: cat.badge || cat.shortName || cat.name,
        path: cat.path || `/kien-thuc/${cat.slug}`,
        icon: cat.icon || 'fa-solid fa-newspaper',
        color: cat.color || 'blue',
        description: cat.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        slug: '',
        name: '',
        shortName: '',
        badge: '',
        path: '',
        icon: 'fa-solid fa-newspaper',
        color: 'blue',
        description: ''
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    if (e) e.preventDefault();
    if (!categoryFormData.name.trim()) {
      showToast?.('Vui lòng nhập tên danh mục!', 'error');
      return;
    }
    const slug = (categoryFormData.slug || generateSlug(categoryFormData.name)).trim();
    const payload = {
      ...categoryFormData,
      slug,
      path: `/kien-thuc/${slug}`
    };

    if (editingCategory) {
      await updateArticleCategory(editingCategory.slug, payload);
    } else {
      await createArticleCategory(payload);
    }
    setIsCategoryModalOpen(false);
  };

  // Render bảng danh sách bài viết
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Thống Kê Nhanh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-lg">
              <i className="fa-solid fa-newspaper" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Quản Lý Bài Viết & Tin Tức</h2>
              <p className="text-xs text-slate-400">Đăng bài, chỉnh sửa danh mục, tối ưu SEO On-page và quản trị hình ảnh bài viết</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'articles' ? 'categories' : 'articles')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition border flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <i className="fa-solid fa-folder-tree" />
            <span>{activeTab === 'categories' ? 'Quay Lại Bài Viết' : 'Quản Lý Danh Mục'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 transition flex items-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-plus text-sm" />
            <span>Đăng Bài Viết Mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ Card Thống Kê */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Tổng bài viết</span>
            <i className="fa-solid fa-file-lines text-slate-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats.total}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-1">
            <span>Đã xuất bản</span>
            <i className="fa-solid fa-circle-check text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.published}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-1">
            <span>Bản nháp (Draft)</span>
            <i className="fa-solid fa-file-pen text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-400">{stats.draft}</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-sky-400 text-xs mb-1">
            <span>Chuyên mục</span>
            <i className="fa-solid fa-tags text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-400">{stats.categoriesCount}</div>
        </div>
      </div>

      {/* 3. NỘI DUNG CHÍNH: TAB BÀI VIẾT HOẶC TAB DANH MỤC */}
      {activeTab === 'articles' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          {/* Thanh Lọc & Tìm Kiếm */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, slug, tác giả..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setAdminCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setAdminCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {/* Lọc danh mục */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  setSelectedCategoryFilter(e.target.value);
                  setAdminCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 transition flex-1 sm:flex-initial"
              >
                <option value="all">Tất cả danh mục ({articles.length})</option>
                {categories.map(cat => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.shortName || cat.name}
                  </option>
                ))}
              </select>

              {/* Lọc trạng thái */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setAdminCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 transition"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </select>

              {/* Nút reset bài mẫu */}
              <button
                type="button"
                onClick={() => {
                  if (confirm('Khôi phục danh sách bài viết về dữ liệu gốc ban đầu?')) {
                    resetArticlesToDefault();
                    setAdminCurrentPage(1);
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition"
                title="Khôi phục danh sách bài viết mặc định"
              >
                <i className="fa-solid fa-rotate-left" />
              </button>
            </div>
          </div>

          {/* Bảng Danh Sách Bài Viết */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4 w-28">Hình ảnh</th>
                  <th className="py-3.5 px-4">Tiêu đề bài viết & URL</th>
                  <th className="py-3.5 px-4 w-44">Danh mục</th>
                  <th className="py-3.5 px-4 w-40">Tác giả & Ngày</th>
                  <th className="py-3.5 px-4 w-28 text-center">Trạng thái</th>
                  <th className="py-3.5 px-4 w-36 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {pagedAdminArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <i className="fa-regular fa-newspaper text-3xl mb-2 block opacity-40" />
                      <span>Không tìm thấy bài viết nào phù hợp.</span>
                    </td>
                  </tr>
                ) : (
                  pagedAdminArticles.map((art, index) => {
                    const itemIndex = (safeAdminPage - 1) * adminItemsPerPage + index + 1;
                    const isDraft = art.status === 'draft';
                    const category = categories.find(c => c.slug === art.categorySlug);

                    return (
                      <tr key={art.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500 font-medium">
                          {itemIndex}
                        </td>

                        {/* Thumbnail Ảnh */}
                        <td className="py-3.5 px-4">
                          <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 shrink-0 relative group">
                            <img
                              src={art.image || PRESET_ARTICLE_IMAGES[0].url}
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/hero.png';
                              }}
                            />
                          </div>
                        </td>

                        {/* Tiêu đề & Slug */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200 hover:text-white line-clamp-2 text-sm leading-snug mb-1">
                            {art.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                            <span className="font-mono text-emerald-400/90 hover:underline">
                              /kien-thuc/{art.slug}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{art.readTime || '6 phút đọc'}</span>
                          </div>
                          {art.excerpt && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 max-w-xl">
                              {art.excerpt}
                            </p>
                          )}
                        </td>

                        {/* Danh mục */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            art.categorySlug === 'thi-truong'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : art.categorySlug === 'kinh-nghiem'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            <i className={`${category?.icon || 'fa-solid fa-tag'} text-[10px]`} />
                            <span>{category?.shortName || art.categoryName || art.categorySlug}</span>
                          </span>
                        </td>

                        {/* Tác giả & Ngày đăng */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-300 truncate">{art.author || 'Chuyên gia BĐS'}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <i className="fa-regular fa-calendar text-[10px]" />
                            <span>{art.publishedAt}</span>
                          </div>
                        </td>

                        {/* Trạng thái (Published / Draft toggle) */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleArticleStatus(art.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition border cursor-pointer ${
                              isDraft
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                            title="Bấm để chuyển đổi trạng thái Xuất bản / Bản nháp"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isDraft ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                            <span>{isDraft ? 'Bản nháp' : 'Hiển thị'}</span>
                          </button>
                        </td>

                        {/* Nút Hành Động */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Xem bài viết */}
                            <a
                              href={`/kien-thuc/${art.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition border border-slate-700"
                              title="Xem trang thực tế"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
                            </a>

                            {/* Chỉnh sửa */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(art)}
                              className="w-8 h-8 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition border border-blue-500/30 cursor-pointer"
                              title="Chỉnh sửa bài viết"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs" />
                            </button>

                            {/* Nhân bản */}
                            <button
                              type="button"
                              onClick={() => duplicateArticle(art.id)}
                              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700 cursor-pointer"
                              title="Nhân bản bài viết này"
                            >
                              <i className="fa-regular fa-copy text-xs" />
                            </button>

                            {/* Xóa */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmArticle(art)}
                              className="w-8 h-8 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white flex items-center justify-center transition border border-rose-500/30 cursor-pointer"
                              title="Xóa bài viết"
                            >
                              <i className="fa-solid fa-trash-can text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Thanh Phân Trang Quản Trị Bài Viết */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3.5 text-xs text-slate-400">
            {/* Bộ chọn số lượng hiển thị & thông tin */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Hiển thị</span>
                <select
                  value={adminItemsPerPage}
                  onChange={(e) => {
                    setAdminItemsPerPage(Number(e.target.value));
                    setAdminCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-semibold cursor-pointer"
                >
                  <option value={5}>5 bài / trang</option>
                  <option value={10}>10 bài / trang</option>
                  <option value={20}>20 bài / trang</option>
                  <option value={50}>50 bài / trang</option>
                </select>
              </div>

              <div className="text-slate-400">
                {filteredArticles.length === 0 ? (
                  <span>0 bài viết</span>
                ) : (
                  <span>
                    Hiển thị <strong className="text-white">{(safeAdminPage - 1) * adminItemsPerPage + 1}</strong> -{' '}
                    <strong className="text-white">{Math.min(safeAdminPage * adminItemsPerPage, filteredArticles.length)}</strong>{' '}
                    trên tổng số <strong className="text-white">{filteredArticles.length}</strong> bài viết (Trang <strong className="text-white">{safeAdminPage}</strong>/{totalAdminPages})
                  </span>
                )}
              </div>
            </div>

            {/* Các nút điều hướng trang */}
            {totalAdminPages > 1 && (
              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                {/* Về trang đầu */}
                <button
                  type="button"
                  disabled={safeAdminPage === 1}
                  onClick={() => setAdminCurrentPage(1)}
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center justify-center transition"
                  title="Về trang đầu tiên"
                >
                  <i className="fa-solid fa-angles-left text-[10px]" />
                </button>

                {/* Về trang trước */}
                <button
                  type="button"
                  disabled={safeAdminPage === 1}
                  onClick={() => setAdminCurrentPage(p => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center justify-center transition"
                  title="Trang trước"
                >
                  <i className="fa-solid fa-chevron-left text-xs" />
                </button>

                {/* Các số trang */}
                {getPageNumbers(safeAdminPage, totalAdminPages).map((p, idx) => {
                  if (p === '...') {
                    return (
                      <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-600 font-bold select-none">
                        ...
                      </span>
                    );
                  }
                  const isActive = p === safeAdminPage;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAdminCurrentPage(p)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center border ${
                        isActive
                          ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                          : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}

                {/* Sang trang sau */}
                <button
                  type="button"
                  disabled={safeAdminPage === totalAdminPages}
                  onClick={() => setAdminCurrentPage(p => Math.min(totalAdminPages, p + 1))}
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center justify-center transition"
                  title="Trang tiếp theo"
                >
                  <i className="fa-solid fa-chevron-right text-xs" />
                </button>

                {/* Đến trang cuối */}
                <button
                  type="button"
                  disabled={safeAdminPage === totalAdminPages}
                  onClick={() => setAdminCurrentPage(totalAdminPages)}
                  className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-25 disabled:cursor-not-allowed border border-slate-800 text-slate-300 flex items-center justify-center transition"
                  title="Đến trang cuối cùng"
                >
                  <i className="fa-solid fa-angles-right text-[10px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB QUẢN LÝ DANH MỤC */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-folder-tree text-amber-400" />
                <span>Danh Mục Kiến Thức & Cẩm Nang ({categories.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Cấu trúc các nhánh chuyên đề bài viết trên sàn</p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenCategoryModal(null)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5"
            >
              <i className="fa-solid fa-plus text-xs" />
              <span>Thêm Danh Mục</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.slug} className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <i className={cat.icon || 'fa-solid fa-tag'} />
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      /{cat.slug}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm mb-1">{cat.name}</h4>
                  <div className="text-xs text-amber-400 font-semibold mb-2">{cat.shortName}</div>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {cat.description || 'Chưa có mô tả cho chuyên mục này.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {articles.filter(a => a.categorySlug === cat.slug).length} bài viết
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white text-xs font-semibold transition"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
                          deleteArticleCategory(cat.slug);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-semibold transition"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MODAL SOẠN THẢO BÀI VIẾT (CREATE / EDIT MODAL) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-5xl my-6 flex flex-col max-h-[92vh] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center text-lg">
                  <i className={editingArticle ? 'fa-solid fa-pen-to-square' : 'fa-solid fa-newspaper'} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {editingArticle ? `Chỉnh Sửa Bài Viết: ${editingArticle.id}` : 'Đăng Bài Viết Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">Trình soạn thảo bài viết & tối ưu hóa tìm kiếm SEO</p>
                </div>
              </div>

              {/* Tab điều hướng trong editor */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      editorTab === 'write' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-pen" />
                    <span>Nội dung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      editorTab === 'preview' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-eye" />
                    <span>Xem trước</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('seo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      editorTab === 'seo' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <i className="fa-solid fa-magnifying-glass" />
                    <span>SEO SERP</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveArticle} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {editorTab === 'write' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Cột Trái: Tiêu đề, Slug, Tóm tắt, Nội dung chính (8 cols) */}
                  <div className="lg:col-span-8 space-y-5">
                    {/* Tiêu đề H1 */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Tiêu đề bài viết (H1) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="VD: Kinh Nghiệm Mua Nhà Mặt Phố Kinh Doanh..."
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
                      />
                    </div>

                    {/* Slug URL */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Đường dẫn tĩnh (Slug URL) <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs">
                        <span className="text-slate-500 shrink-0">https://kenhnhadat24h.com.vn/kien-thuc/</span>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                          className="w-full bg-transparent border-0 text-emerald-400 font-mono font-medium focus:outline-none px-1"
                        />
                      </div>
                    </div>

                    {/* Đoạn Tóm tắt Excerpt */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Tóm tắt mở đầu (Excerpt / Lead)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        placeholder="Tóm tắt ngắn gọn 1-2 câu thu hút người đọc và làm mô tả bài viết..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 transition leading-relaxed"
                      />
                    </div>

                    {/* Soạn Thảo Nội Dung (Markdown Toolbar) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Nội dung bài viết (Markdown / Text)
                        </label>
                        <span className="text-[11px] text-slate-500">
                          {formData.content ? `${formData.content.length} ký tự` : '0 ký tự'}
                        </span>
                      </div>

                      {/* Toolbar Tiện Ích */}
                      <div className="bg-slate-950/80 border border-slate-700 rounded-t-xl p-2 flex flex-wrap items-center gap-1.5 border-b-0 text-xs">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('## Tiêu đề H2 {#id}\n\n')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                          title="Thêm Heading 2"
                        >
                          H2
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('### Tiêu đề H3\n\n')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                          title="Thêm Heading 3"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('**', '**')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
                          title="In đậm (**text**)"
                        >
                          <i className="fa-solid fa-bold" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('*', '*')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 italic"
                          title="In nghiêng (*text*)"
                        >
                          <i className="fa-solid fa-italic" />
                        </button>
                        <span className="w-px h-5 bg-slate-700 mx-1" />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('> **Lưu ý quan trọng:** ')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold"
                          title="Thêm hộp chú thích trích dẫn"
                        >
                          <i className="fa-solid fa-quote-left mr-1" /> Callout
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('- Mục gạch đầu dòng 1\n- Mục gạch đầu dòng 2\n')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Danh sách gạch đầu dòng"
                        >
                          <i className="fa-solid fa-list-ul" />
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('1. Bước thứ nhất\n2. Bước thứ hai\n')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Danh sách số thứ tự"
                        >
                          <i className="fa-solid fa-list-ol" />
                        </button>
                        <span className="w-px h-5 bg-slate-700 mx-1" />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('| STT | Hạng mục | Tiêu chuẩn |\n| :---: | :--- | :--- |\n| 1 | Mặt tiền | Rộng từ 4m trở lên |\n| 2 | Vỉa hè | Rộng từ 2.5m trở lên |\n\n')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold"
                          title="Thêm bảng biểu"
                        >
                          <i className="fa-solid fa-table mr-1" /> Bảng
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => insertMarkdownText('[Tên liên kết](/kien-thuc)')}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400"
                          title="Chèn liên kết nội bộ"
                        >
                          <i className="fa-solid fa-link" /> Link
                        </button>
                        <button
                          type="button"
                          onMouseDown={(e) => {
                            // Ngăn mất tiêu điểm (focus) và lưu ngay lập tức vị trí con trỏ cùng vị trí cuộn
                            e.preventDefault();
                            if (textareaRef.current) {
                              savedCursorPos.current = textareaRef.current.selectionStart;
                              savedScrollTop.current = textareaRef.current.scrollTop;
                              const form = textareaRef.current.closest('form');
                              if (form) savedFormScrollTop.current = form.scrollTop;
                            }
                          }}
                          onClick={() => {
                            if (textareaRef.current) {
                              savedCursorPos.current = textareaRef.current.selectionStart;
                              savedScrollTop.current = textareaRef.current.scrollTop;
                              const form = textareaRef.current.closest('form');
                              if (form) savedFormScrollTop.current = form.scrollTop;
                            } else {
                              savedCursorPos.current = (formData.content || '').length;
                            }
                            setImagePickerTarget('content');
                            setPickerTab('library');
                            setCustomImageUrl('');
                            setCustomImageCaption('');
                            setIsImagePickerOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold transition flex items-center gap-1.5"
                          title="Chèn ảnh vào vị trí con trỏ trong bài viết"
                        >
                          <i className="fa-solid fa-image" />
                          <span>Chèn Ảnh</span>
                        </button>
                      </div>

                      <textarea
                        ref={textareaRef}
                        rows={16}
                        required
                        value={formData.content}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, content: e.target.value }));
                          savedCursorPos.current = e.target.selectionStart;
                          savedScrollTop.current = e.target.scrollTop;
                        }}
                        onSelect={(e) => {
                          savedCursorPos.current = e.target.selectionStart;
                          savedScrollTop.current = e.target.scrollTop;
                          const form = e.target.closest('form');
                          if (form) savedFormScrollTop.current = form.scrollTop;
                        }}
                        onClick={(e) => {
                          savedCursorPos.current = e.target.selectionStart;
                          savedScrollTop.current = e.target.scrollTop;
                          const form = e.target.closest('form');
                          if (form) savedFormScrollTop.current = form.scrollTop;
                        }}
                        onKeyUp={(e) => {
                          savedCursorPos.current = e.target.selectionStart;
                          savedScrollTop.current = e.target.scrollTop;
                        }}
                        onScroll={(e) => {
                          savedScrollTop.current = e.target.scrollTop;
                        }}
                        className="w-full p-4 bg-slate-950 border border-slate-700 rounded-b-xl text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500 transition leading-relaxed resize-y"
                        placeholder="Nhập nội dung bài viết theo định dạng Markdown..."
                      />
                    </div>
                  </div>

                  {/* Cột Phải: Danh mục, Ảnh đại diện, Tác giả, Cài đặt (4 cols) */}
                  <div className="lg:col-span-4 space-y-5">
                    {/* Chọn Danh mục */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Chọn Danh Mục
                        </label>
                        <button
                          type="button"
                          onClick={() => handleOpenCategoryModal(null)}
                          className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <i className="fa-solid fa-plus text-[9px]" /> Thêm
                        </button>
                      </div>
                      <select
                        value={formData.categorySlug}
                        onChange={(e) => {
                          const cat = categories.find(c => c.slug === e.target.value);
                          setFormData(prev => ({
                            ...prev,
                            categorySlug: e.target.value,
                            categoryName: cat?.name || prev.categoryName
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-red-500 transition"
                      >
                        {categories.map(cat => (
                          <option key={cat.slug} value={cat.slug}>
                            {cat.name} ({cat.shortName})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Hình Ảnh Đại Diện */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Hình Ảnh Đại Diện
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setImagePickerTarget('cover');
                            setPickerTab('library');
                            setCustomImageUrl('');
                            setCustomImageCaption('');
                            setIsImagePickerOpen(true);
                          }}
                          className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <i className="fa-solid fa-images" /> Thư viện
                        </button>
                      </div>

                      {/* Khung Xem Trước Ảnh */}
                      <div className="rounded-xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 relative group">
                        <img
                          src={formData.image || PRESET_ARTICLE_IMAGES[0].url}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/hero.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setImagePickerTarget('cover');
                              setPickerTab('library');
                              setCustomImageUrl('');
                              setCustomImageCaption('');
                              setIsImagePickerOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-bold shadow"
                          >
                            Đổi ảnh
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="Nhập đường dẫn URL ảnh hoặc chọn..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-red-500 font-mono"
                      />

                      {/* Tải từ thiết bị */}
                      <div className="pt-1">
                        <label className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer border border-slate-700 transition">
                          <i className="fa-solid fa-upload" />
                          <span>Tải ảnh từ máy tính</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImageFile}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Tác giả & Ngày đăng */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          Tác giả
                        </label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          Chức vụ / Vai trò
                        </label>
                        <input
                          type="text"
                          value={formData.authorRole}
                          onChange={(e) => setFormData(prev => ({ ...prev, authorRole: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Ngày đăng
                          </label>
                          <input
                            type="date"
                            value={formData.publishedAt}
                            onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                            Thời gian đọc
                          </label>
                          <input
                            type="text"
                            value={formData.readTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                            placeholder="8 phút đọc"
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          Thẻ phân loại (Tags, cách nhau dấu phẩy)
                        </label>
                        <input
                          type="text"
                          value={formData.tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="Nhà mặt phố, Pháp lý, Định giá..."
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                          Trạng thái xuất bản
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-200"
                        >
                          <option value="published">🟢 Xuất bản ngay (Published)</option>
                          <option value="draft">🟡 Bản nháp (Draft)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB XEM TRƯỚC (LIVE PREVIEW) */}
              {editorTab === 'preview' && (
                <div className="bg-white rounded-3xl p-6 sm:p-10 text-slate-900 max-w-4xl mx-auto shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      {formData.categoryName || formData.categorySlug}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">{formData.publishedAt}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-500">{formData.readTime}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 leading-snug">
                    {formData.title || 'Chưa nhập tiêu đề bài viết'}
                  </h1>

                  {formData.excerpt && (
                    <div className="p-4 rounded-2xl bg-slate-50 border-l-4 border-emerald-600 text-slate-700 text-sm font-medium mb-6">
                      {formData.excerpt}
                    </div>
                  )}

                  <div className="rounded-2xl overflow-hidden aspect-video mb-8 bg-slate-100 border border-slate-200">
                    <img
                      src={formData.image || PRESET_ARTICLE_IMAGES[0].url}
                      alt={formData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Render nội dung markdown trực quan chuẩn HTML */}
                  <div 
                    className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: formatArticlePreviewHtml(formData.content) }}
                  />
                </div>
              )}

              {/* TAB CẤU HÌNH SEO & GOOGLE SERP PREVIEW */}
              {editorTab === 'seo' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <i className="fa-brands fa-google text-red-400" />
                      <span>Xem Trước Kết Quả Tìm Kiếm Google (SERP Preview)</span>
                    </h4>

                    {/* Hộp xem trước Google Search Snippet */}
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-1">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-sans">
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">K</span>
                        <span>https://kenhnhadat24h.com.vn &gt; kien-thuc &gt; {formData.slug || 'duong-dan-bai-viet'}</span>
                      </div>
                      <h4 className="text-blue-700 hover:underline text-base sm:text-lg font-medium leading-snug cursor-pointer line-clamp-1">
                        {formData.seoTitle || formData.title || 'Tiêu đề bài viết hiển thị trên Google'} | Kênh Nhà Đất 24H
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {formData.seoDescription || formData.excerpt || 'Đoạn mô tả ngắn gọn giúp người tìm kiếm hiểu rõ nội dung bài viết và tăng tỷ lệ nhấp chuột (CTR)...'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase">
                          SEO Meta Title (Tiêu đề Google)
                        </label>
                        <span className={`text-[11px] font-mono ${
                          (formData.seoTitle?.length || 0) > 60 ? 'text-amber-400 font-bold' : 'text-slate-500'
                        }`}>
                          {formData.seoTitle?.length || 0}/60 ký tự
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder={formData.title || 'Tiêu đề chuẩn SEO (khuyến nghị 50-60 ký tự)'}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        * Hệ thống tự động thêm hậu tố &quot; | Kênh Nhà Đất 24H&quot; mà không bị trùng lặp thương hiệu.
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-300 uppercase">
                          SEO Meta Description (Mô tả Google)
                        </label>
                        <span className={`text-[11px] font-mono ${
                          (formData.seoDescription?.length || 0) > 160 ? 'text-amber-400 font-bold' : 'text-slate-500'
                        }`}>
                          {formData.seoDescription?.length || 0}/160 ký tự
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={formData.seoDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                        placeholder={formData.excerpt || 'Mô tả bài viết chuẩn SEO (khuyến nghị 140-160 ký tự)'}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer (Action Buttons) */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Hủy Bỏ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        status: prev.status === 'published' ? 'draft' : 'published'
                      }));
                    }}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition border ${
                      formData.status === 'draft'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {formData.status === 'draft' ? 'Lưu Bản Nháp' : 'Chế Độ Xuất Bản'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition flex items-center gap-2"
                  >
                    <i className="fa-solid fa-cloud-arrow-up" />
                    <span>{editingArticle ? 'Lưu Thay Đổi' : 'Đăng Bài Viết'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL CHỌN / TẢI / CHÈN ẢNH VÀO NỘI DUNG HOẶC BÌA */}
      {isImagePickerOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-inner ${
                  imagePickerTarget === 'content' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}>
                  <i className={`fa-solid ${imagePickerTarget === 'content' ? 'fa-photo-film' : 'fa-image'} text-sm`} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{imagePickerTarget === 'content' ? 'Thư Viện & Chèn Hình Ảnh Vào Bài Viết' : 'Chọn Ảnh Đại Diện Bài Viết'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      imagePickerTarget === 'content' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-sky-500/20 text-sky-300'
                    }`}>
                      {imagePickerTarget === 'content' ? 'Vị trí con trỏ' : 'Ảnh bìa'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {imagePickerTarget === 'content'
                      ? 'Chọn ảnh từ thư viện để chèn tự động vào bài viết tại vị trí con trỏ dưới cú pháp Markdown ![Chú thích](URL)'
                      : 'Ảnh bìa hiển thị nổi bật ở đầu bài viết và khi chia sẻ liên kết mạng xã hội'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImagePickerOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark text-sm" />
              </button>
            </div>

            {/* Navigation Tabs trong Modal */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setPickerTab('library')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  pickerTab === 'library'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-images" />
                <span>Thư Viện Ảnh BĐS ({allAvailableImages.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('upload')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  pickerTab === 'upload'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-cloud-arrow-up" />
                <span>Tải Từ Máy Tính</span>
              </button>

              <button
                type="button"
                onClick={() => setPickerTab('url')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                  pickerTab === 'url'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <i className="fa-solid fa-link" />
                <span>Nhập Đường Dẫn URL</span>
              </button>
            </div>

            {/* Body Nội Dung Modal (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* TAB 1: THƯ VIỆN ẢNH CÓ SẴN */}
              {pickerTab === 'library' && (
                <div className="space-y-4">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                    <i className="fa-solid fa-circle-info text-sky-400 text-xs" />
                    <span>Bấm nút <strong>&quot;Chèn ngay&quot;</strong> trên bất kỳ ảnh nào để thêm vào bài viết, hoặc nhấp vào ảnh để chỉnh sửa chú thích (caption).</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
                    {allAvailableImages.map((item, idx) => {
                      const isSelected = customImageUrl === item.url || (imagePickerTarget === 'cover' && formData.image === item.url);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (imagePickerTarget === 'cover') {
                              handleApplyImage(item.url, item.title);
                            } else {
                              setCustomImageUrl(item.url);
                              setCustomImageCaption(item.title);
                            }
                          }}
                          className={`rounded-xl overflow-hidden border cursor-pointer group transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/50 bg-slate-850'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-950/60'
                          }`}
                        >
                          <div className="aspect-video bg-slate-800 overflow-hidden relative">
                            <img
                              src={item.url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/hero.png';
                              }}
                            />
                          </div>

                          <div className="p-2 bg-slate-950 flex flex-col justify-between flex-1 gap-1.5 text-[11px]">
                            <div>
                              <div className="text-slate-200 font-semibold line-clamp-1 group-hover:text-amber-400 transition">
                                {item.title}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyImage(item.url, item.title);
                              }}
                              className={`w-full py-1.5 px-2 rounded-lg text-white font-bold text-[10px] shadow transition flex items-center justify-center gap-1 ${
                                imagePickerTarget === 'content'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                                  : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                              }`}
                            >
                              <i className="fa-solid fa-plus text-[9px]" />
                              <span>{imagePickerTarget === 'content' ? 'Chèn ảnh này' : 'Chọn làm ảnh bìa'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Thanh chỉnh sửa chú thích và xác nhận chèn cho Tab Thư Viện */}
                  {imagePickerTarget === 'content' && customImageUrl && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-3 shadow-lg">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                        <img src={customImageUrl} alt="Selected" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">
                          Chú thích ảnh tùy chỉnh (Caption / Thẻ Alt SEO):
                        </label>
                        <input
                          type="text"
                          value={customImageCaption}
                          onChange={(e) => setCustomImageCaption(e.target.value)}
                          placeholder="Nhập chú thích ảnh hiển thị dưới hình..."
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyImage(customImageUrl, customImageCaption)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
                      >
                        <i className="fa-solid fa-arrow-down-to-bracket" />
                        <span>Chèn Vào Bài Viết</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TẢI ẢNH TỪ MÁY TÍNH */}
              {pickerTab === 'upload' && (
                <div className="space-y-4">
                  <label className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/40 hover:bg-slate-950/80 transition group text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-slate-700 text-slate-300 group-hover:text-emerald-400 flex items-center justify-center text-xl transition">
                      <i className="fa-solid fa-cloud-arrow-up" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        Nhấn để chọn tệp hình ảnh từ thiết bị
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleModalUploadFile}
                      className="hidden"
                    />
                  </label>

                  {customImageUrl && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                          <img src={customImageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-check text-xs" />
                            <span>Tệp ảnh đã sẵn sàng</span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            Đã nạp vào bộ nhớ tạm để chèn vào tài liệu
                          </p>
                        </div>
                      </div>

                      {imagePickerTarget === 'content' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">
                            Chú thích ảnh (Caption / Thẻ Alt SEO):
                          </label>
                          <input
                            type="text"
                            value={customImageCaption}
                            onChange={(e) => setCustomImageCaption(e.target.value)}
                            placeholder="Nhập chú thích ngắn gọn mô tả hình ảnh..."
                            className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      )}

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => handleApplyImage(customImageUrl, customImageCaption)}
                          className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-lg transition flex items-center gap-2 ${
                            imagePickerTarget === 'content'
                              ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                              : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                          }`}
                        >
                          <i className="fa-solid fa-check" />
                          <span>{imagePickerTarget === 'content' ? 'Chèn Ảnh Này Vào Bài Viết' : 'Đặt Làm Ảnh Đại Diện'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: NHẬP LINK URL TRỰC TIẾP */}
              {pickerTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Đường dẫn ảnh (Image URL) <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        placeholder="https://example.com/hinh-anh-bat-dong-san.jpg"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono"
                      />
                      <i className="fa-solid fa-link absolute left-3 top-3 text-slate-500 text-xs" />
                    </div>
                  </div>

                  {imagePickerTarget === 'content' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Chú thích ảnh (Caption / Thẻ Alt SEO)
                      </label>
                      <input
                        type="text"
                        value={customImageCaption}
                        onChange={(e) => setCustomImageCaption(e.target.value)}
                        placeholder="VD: Bản đồ quy hoạch chi tiết 1/2000..."
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  )}

                  {customImageUrl && (
                    <div className="rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 max-h-56 relative group">
                      <img
                        src={customImageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/hero.png';
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={!customImageUrl.trim()}
                      onClick={() => handleApplyImage(customImageUrl, customImageCaption)}
                      className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-lg transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        imagePickerTarget === 'content'
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                          : 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/30'
                      }`}
                    >
                      <i className="fa-solid fa-check" />
                      <span>{imagePickerTarget === 'content' ? 'Chèn Ảnh Này Vào Bài Viết' : 'Đặt Làm Ảnh Đại Diện'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                * Hình ảnh chèn vào sẽ hiển thị ngay trong tab &quot;Xem trước&quot;
              </span>
              <button
                type="button"
                onClick={() => setIsImagePickerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition ml-auto"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL THÊM / SỬA DANH MỤC */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <i className="fa-solid fa-folder-plus text-amber-400" />
                <span>{editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Tên danh mục <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const slug = generateSlug(val);
                    setCategoryFormData(prev => ({
                      ...prev,
                      name: val,
                      shortName: prev.shortName || val,
                      slug: prev.slug || slug
                    }));
                  }}
                  placeholder="VD: Cẩm Nang Phong Thủy..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Tên ngắn gọn (Short name)
                </label>
                <input
                  type="text"
                  value={categoryFormData.shortName}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, shortName: e.target.value }))}
                  placeholder="VD: Phong Thủy & Nhà Ở"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Đường dẫn (Slug URL) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.slug}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="cam-nang-phong-thuy"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Mô tả chuyên mục
                </label>
                <textarea
                  rows={3}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả nội dung chuyên đề..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  {editingCategory ? 'Lưu Danh Mục' : 'Tạo Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL XÁC NHẬN XÓA BÀI VIẾT */}
      {deleteConfirmArticle && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center text-2xl mx-auto border border-rose-500/20">
              <i className="fa-solid fa-triangle-exclamation" />
            </div>
            <div>
              <h4 className="text-base font-black text-white mb-1">Xác Nhận Xóa Bài Viết?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Bạn có chắc chắn muốn xóa bài viết:
                <br />
                <strong className="text-slate-200">{deleteConfirmArticle.title}</strong>
              </p>
              <p className="text-[11px] text-rose-400 font-medium mt-2">
                Thao tác này sẽ gỡ bỏ bài viết khỏi hệ thống và xóa link tĩnh tương ứng.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmArticle(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/30"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
