import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAdminRequest } from '../../../../utils/adminAuth';
import { getFullSystemDatabase, persistDatabaseSlice } from '../../../../services/serverDbService';
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_CATEGORIES } from '../../../../data/knowledgeArticles';
import { invalidateServerSsrCache } from '../../../../utils/serverDbCache';
import { revalidatePath } from 'next/cache';

const DB_FILE = path.resolve(process.cwd(), 'server-db.json');

/**
 * Helper đọc danh sách bài viết từ server-db.json hoặc fallback mặc định
 */
async function getArticlesAndCategories() {
  try {
    const db = await getFullSystemDatabase();
    const articles = Array.isArray(db.bds_articles) && db.bds_articles.length > 0 
      ? db.bds_articles 
      : KNOWLEDGE_ARTICLES;
    const categories = Array.isArray(db.bds_knowledge_categories) && db.bds_knowledge_categories.length > 0 
      ? db.bds_knowledge_categories 
      : KNOWLEDGE_CATEGORIES;
    return { articles, categories };
  } catch (err) {
    console.error('Lỗi khi đọc bài viết từ database:', err);
    return { articles: KNOWLEDGE_ARTICLES, categories: KNOWLEDGE_CATEGORIES };
  }
}

/**
 * GET /api/admin/articles
 * Lấy danh sách bài viết và danh mục
 */
export async function GET(request) {
  try {
    const { articles, categories } = await getArticlesAndCategories();
    return NextResponse.json({
      success: true,
      articles,
      categories,
      total: articles.length
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/articles
 * Tạo bài viết mới hoặc tạo danh mục mới
 */
export async function POST(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Yêu cầu quyền Quản trị viên!' }, { status: 401 });
    }

    const body = await request.json();
    const { articles, categories } = await getArticlesAndCategories();

    // 1. Nếu là tạo danh mục mới
    if (body.action === 'create_category') {
      const newCategory = body.category;
      if (!newCategory || !newCategory.slug || !newCategory.name) {
        return NextResponse.json({ success: false, error: 'Thiếu thông tin danh mục (tên, slug)' }, { status: 400 });
      }

      if (categories.some(c => c.slug === newCategory.slug)) {
        return NextResponse.json({ success: false, error: 'Đường dẫn (slug) danh mục đã tồn tại!' }, { status: 400 });
      }

      const updatedCategories = [...categories, newCategory];
      await persistDatabaseSlice('bds_knowledge_categories', updatedCategories);

      return NextResponse.json({
        success: true,
        message: 'Tạo danh mục mới thành công!',
        categories: updatedCategories
      });
    }

    // 2. Tạo bài viết mới
    const newArticle = body.article || body;
    if (!newArticle.title) {
      return NextResponse.json({ success: false, error: 'Tiêu đề bài viết không được để trống' }, { status: 400 });
    }

    // Tự sinh ID và slug nếu chưa có
    const articleId = newArticle.id || `art-${Date.now()}`;
    const slug = newArticle.slug || newArticle.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Kiểm tra trùng slug
    if (articles.some(a => a.slug === slug && a.id !== articleId)) {
      return NextResponse.json({ success: false, error: 'Đường dẫn slug bài viết đã tồn tại!' }, { status: 400 });
    }

    const finalizedArticle = {
      ...newArticle,
      id: articleId,
      slug,
      publishedAt: newArticle.publishedAt || new Date().toISOString().split('T')[0],
      status: newArticle.status || 'published',
      tags: Array.isArray(newArticle.tags) ? newArticle.tags : (newArticle.tags ? String(newArticle.tags).split(',').map(t => t.trim()).filter(Boolean) : [])
    };

    const updatedArticles = [finalizedArticle, ...articles];
    await persistDatabaseSlice('bds_articles', updatedArticles);

    invalidateServerSsrCache();
    try {
      revalidatePath('/kien-thuc');
      revalidatePath(`/kien-thuc/${slug}`);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Đăng bài viết mới thành công!',
      article: finalizedArticle,
      articles: updatedArticles
    });
  } catch (error) {
    console.error('Lỗi khi tạo bài viết:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/admin/articles
 * Cập nhật bài viết hoặc danh mục
 */
export async function PUT(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Yêu cầu quyền Quản trị viên!' }, { status: 401 });
    }

    const body = await request.json();
    const { articles, categories } = await getArticlesAndCategories();

    // 1. Cập nhật danh mục
    if (body.action === 'update_category') {
      const { slug, updatedCategory } = body;
      const index = categories.findIndex(c => c.slug === slug);
      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Không tìm thấy danh mục cần sửa' }, { status: 404 });
      }

      const updatedCategories = [...categories];
      updatedCategories[index] = { ...updatedCategories[index], ...updatedCategory };
      await persistDatabaseSlice('bds_knowledge_categories', updatedCategories);

      return NextResponse.json({
        success: true,
        message: 'Cập nhật danh mục thành công!',
        categories: updatedCategories
      });
    }

    // 2. Cập nhật bài viết
    const { id, article: updatedData } = body;
    const targetId = id || updatedData?.id;

    if (!targetId) {
      return NextResponse.json({ success: false, error: 'Thiếu ID bài viết cần sửa' }, { status: 400 });
    }

    const index = articles.findIndex(a => a.id === targetId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    const oldArticle = articles[index];
    const newTags = Array.isArray(updatedData.tags) 
      ? updatedData.tags 
      : (updatedData.tags ? String(updatedData.tags).split(',').map(t => t.trim()).filter(Boolean) : oldArticle.tags);

    const mergedArticle = {
      ...oldArticle,
      ...updatedData,
      id: targetId,
      tags: newTags,
      updatedAt: new Date().toISOString()
    };

    const updatedArticles = [...articles];
    updatedArticles[index] = mergedArticle;

    await persistDatabaseSlice('bds_articles', updatedArticles);

    invalidateServerSsrCache();
    try {
      revalidatePath('/kien-thuc');
      revalidatePath(`/kien-thuc/${mergedArticle.slug}`);
      if (oldArticle.slug !== mergedArticle.slug) {
        revalidatePath(`/kien-thuc/${oldArticle.slug}`);
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Cập nhật bài viết thành công!',
      article: mergedArticle,
      articles: updatedArticles
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật bài viết:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/articles
 * Xóa bài viết hoặc danh mục
 */
export async function DELETE(request) {
  try {
    const adminAuth = verifyAdminRequest(request);
    if (!adminAuth.valid) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Yêu cầu quyền Quản trị viên!' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const categorySlug = searchParams.get('categorySlug');
    const action = searchParams.get('action');

    const { articles, categories } = await getArticlesAndCategories();

    // 1. Xóa danh mục
    if (action === 'delete_category' || categorySlug) {
      const slugToDelete = categorySlug || id;
      const filteredCategories = categories.filter(c => c.slug !== slugToDelete);
      await persistDatabaseSlice('bds_knowledge_categories', filteredCategories);

      return NextResponse.json({
        success: true,
        message: 'Đã xóa danh mục thành công!',
        categories: filteredCategories
      });
    }

    // 2. Xóa bài viết
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID bài viết cần xóa' }, { status: 400 });
    }

    const targetArticle = articles.find(a => a.id === id);
    const filteredArticles = articles.filter(a => a.id !== id);

    await persistDatabaseSlice('bds_articles', filteredArticles);

    invalidateServerSsrCache();
    try {
      revalidatePath('/kien-thuc');
      if (targetArticle?.slug) {
        revalidatePath(`/kien-thuc/${targetArticle.slug}`);
      }
    } catch (_) {}

    return NextResponse.json({
      success: true,
      message: 'Đã xóa bài viết thành công!',
      articles: filteredArticles
    });
  } catch (error) {
    console.error('Lỗi khi xóa bài viết:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
