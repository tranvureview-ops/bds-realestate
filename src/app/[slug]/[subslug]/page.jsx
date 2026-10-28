import { notFound, permanentRedirect } from 'next/navigation';
import { parseTaxonomyUrl } from '../../../utils/permalink';
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
