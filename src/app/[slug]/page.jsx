import PropertyDetailPage from '../../views/PropertyDetailPage';
import SaleListingsPage from '../../views/SaleListingsPage';
import RentListingsPage from '../../views/RentListingsPage';
import { parsePropertyUrl, parseTaxonomyUrl, toVietnameseSlug, getPropertyPermalink } from '../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../data/mockData';
import { isSupabaseConfigured, fetchSupabaseProperties } from '../../lib/supabase';
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
        // fallback to server-db.json
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

  // 3. Slug matching (khi URL không có ID định danh)
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
  const currentPath = `/${slug}`;

  // Check if it's a property permalink
  const propUrlInfo = parsePropertyUrl(currentPath);
  if (propUrlInfo.isProperty) {
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
      title: 'Chi Tiết Bất Động Sản',
      description: 'Thông tin quy hoạch, diện tích, giá bán, pháp lý sổ đỏ và liên hệ chính chủ.',
    };
  }

  // Check if it's a taxonomy route
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    return {
      title: taxonomyInfo.title,
      description: `Danh sách tin đăng ${taxonomyInfo.title} giá tốt, chính chủ, cập nhật liên tục 24/7.`,
    };
  }

  return {
    title: 'Bất Động Sản',
    description: 'Sàn thương mại điện tử bất động sản uy tín, mua bán cho thuê nhà đất Đà Nẵng và toàn quốc.',
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/${slug}`;

  // 1. Check if it's a taxonomy URL (nha-dat-ban, ban-can-ho-chung-cu, etc.)
  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    if (taxonomyInfo.demand === 'rent') {
      return <RentListingsPage taxonomyInfo={taxonomyInfo} />;
    }
    return <SaleListingsPage taxonomyInfo={taxonomyInfo} />;
  }

  // 2. Check and render PropertyDetailPage with resolved server property
  const propUrlInfo = parsePropertyUrl(currentPath);
  const properties = await getServerProperties();
  const matched = findPropertyFromList(properties, propUrlInfo, currentPath) || 
                  findPropertyFromList(INITIAL_PROPERTIES, propUrlInfo, currentPath);

  return <PropertyDetailPage initialProperty={matched} slug={slug} currentPath={currentPath} />;
}
