import { notFound, permanentRedirect } from 'next/navigation';
import { parseTaxonomyUrl, buildSeoUrl, getPaginationPath } from '../../../utils/permalink';
import { buildTaxonomyMetadata, renderTaxonomyPage } from '../page';

export async function generateMetadata({ params }) {
  const { slug, subslug } = (await params) || {};
  const currentPath = `/${slug || ''}/${subslug || ''}`;

  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    return buildTaxonomyMetadata(taxonomyInfo);
  }

  return { title: 'Không tìm thấy trang', robots: { index: false, follow: false } };
}

export default async function Page({ params, searchParams }) {
  const { slug, subslug } = (await params) || {};
  const sp = (await searchParams) || {};
  const currentPath = `/${slug || ''}/${subslug || ''}`;

  const taxonomyInfo = parseTaxonomyUrl(currentPath);
  if (taxonomyInfo.isTaxonomy) {
    // 301 Redirect nếu URL có query param ?bedroom=... sang Clean URL chuẩn Batdongsan
    if (sp.bedroom && sp.bedroom !== 'all') {
      const extra = {};
      for (const [k, v] of Object.entries(sp)) {
        if (k !== 'bedroom' && k !== 'page' && v) extra[k] = v;
      }
      const targetUrl = buildSeoUrl({
        demand: taxonomyInfo.demand,
        propertyType: taxonomyInfo.propertyType !== 'all' ? taxonomyInfo.propertyType : null,
        city: taxonomyInfo.city || null,
        district: taxonomyInfo.district || null,
        ward: taxonomyInfo.ward || null,
        project: taxonomyInfo.project || null,
        priceRange: taxonomyInfo.priceRange !== 'all' ? taxonomyInfo.priceRange : null,
        minPrice: taxonomyInfo.minPrice,
        maxPrice: taxonomyInfo.maxPrice,
        areaRange: taxonomyInfo.areaRange !== 'all' ? taxonomyInfo.areaRange : null,
        minArea: taxonomyInfo.minArea,
        maxArea: taxonomyInfo.maxArea,
        bedroom: sp.bedroom,
        extraParams: extra
      });

      if (sp.page) {
        const p = parseInt(sp.page, 10);
        if (p > 1 && String(p) === sp.page) {
          permanentRedirect(getPaginationPath(targetUrl, p));
        }
      }
      permanentRedirect(targetUrl);
    }

    if (sp.page) {
      const p = parseInt(sp.page, 10);
      const queryParams = new URLSearchParams();
      for (const [k, v] of Object.entries(sp)) {
        if (k !== 'page' && v) queryParams.set(k, String(v));
      }
      const qs = queryParams.toString();
      if (p > 1 && String(p) === sp.page) {
        permanentRedirect(qs ? `/${slug}/${subslug}/page/${p}/?${qs}` : `/${slug}/${subslug}/page/${p}/`);
      } else {
        permanentRedirect(qs ? `/${slug}/${subslug}/?${qs}` : `/${slug}/${subslug}/`);
      }
    }

    return renderTaxonomyPage(taxonomyInfo, 1);
  }

  notFound();
}
