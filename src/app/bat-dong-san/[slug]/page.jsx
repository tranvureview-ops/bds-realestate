import PropertyDetailPage from '../../../views/PropertyDetailPage';
import { parsePropertyUrl, toVietnameseSlug, getPropertyPermalink } from '../../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../../data/mockData';
import { isSupabaseConfigured, fetchSupabaseProperties } from '../../../lib/supabase';
import fs from 'fs';
import path from 'path';

async function getServerProperties() {
  try {
    if (isSupabaseConfigured()) {
      try {
        const cloudProps = await fetchSupabaseProperties();
        if (Array.isArray(cloudProps) && cloudProps.length > 0) {
          return cloudProps;
        }
      } catch (err) {
        // fallback
      }
    }
    const dbFile = path.resolve(process.cwd(), 'server-db.json');
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf8');
      const parsed = JSON.parse(content || '{}');
      if (Array.isArray(parsed.bds_properties) && parsed.bds_properties.length > 0) {
        return parsed.bds_properties;
      }
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_PROPERTIES;
}

function findPropertyFromList(properties, propUrlInfo, currentPath) {
  if (!properties || !Array.isArray(properties) || !propUrlInfo) return null;

  // 1. Strict ID Matching (khi URL có -pr{id}, /pr{id}, /bds-{id})
  if (propUrlInfo.normalizedBdsId || propUrlInfo.rawIdNumber) {
    const idMatch = properties.find(p => {
      if (!p) return false;
      if (propUrlInfo.normalizedBdsId && p.id && p.id.toUpperCase() === propUrlInfo.normalizedBdsId.toUpperCase()) return true;
      const pNum = parseInt(String(p.id || '').replace(/\D/g, ''), 10);
      const parsedNum = parseInt(String(propUrlInfo.rawIdNumber || '').replace(/\D/g, ''), 10);
      if (!isNaN(pNum) && !isNaN(parsedNum) && pNum === parsedNum) return true;
      return false;
    });
    if (idMatch) return idMatch;
  }

  // 2. Exact Canonical Permalink matching
  if (currentPath) {
    const permalinkMatch = properties.find(p => {
      if (!p) return false;
      const pLink = getPropertyPermalink(p);
      return pLink === currentPath || pLink.replace(/\/$/, '') === currentPath.replace(/\/$/, '');
    });
    if (permalinkMatch) return permalinkMatch;
  }

  // 3. Slug matching
  if (propUrlInfo.rawSlug) {
    const targetSlug = propUrlInfo.rawSlug.toLowerCase();
    const slugMatches = properties.filter(p => {
      if (!p) return false;
      if (p.slug && p.slug.toLowerCase() === targetSlug) return true;
      if (toVietnameseSlug(p.title) === targetSlug) return true;
      return false;
    });
    if (slugMatches.length > 0) {
      return slugMatches.find(p => p.status === 'active') || slugMatches[0];
    }
  }

  return null;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/bat-dong-san/${slug}`;
  const propUrlInfo = parsePropertyUrl(currentPath);

  const properties = await getServerProperties();
  const matched = findPropertyFromList(properties, propUrlInfo, currentPath) || 
                  findPropertyFromList(INITIAL_PROPERTIES, propUrlInfo, currentPath);

  if (matched) {
    return {
      title: matched.title,
      description: matched.description?.slice(0, 160) || matched.title,
      openGraph: {
        title: matched.title,
        description: matched.description?.slice(0, 160) || matched.title,
        images: matched.images?.length > 0 ? [{ url: matched.images[0] }] : [],
      }
    };
  }

  return {
    title: `Chi Tiết Bất Động Sản (${slug})`,
    description: 'Thông tin quy hoạch, diện tích, giá bán, pháp lý sổ đỏ và liên hệ chính chủ.',
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/bat-dong-san/${slug}`;
  const propUrlInfo = parsePropertyUrl(currentPath);

  const properties = await getServerProperties();
  const matched = findPropertyFromList(properties, propUrlInfo, currentPath) || 
                  findPropertyFromList(INITIAL_PROPERTIES, propUrlInfo, currentPath);

  return <PropertyDetailPage initialProperty={matched} slug={slug} currentPath={currentPath} />;
}
