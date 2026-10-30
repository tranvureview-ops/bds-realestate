import { permanentRedirect } from 'next/navigation';
import RentListingsPage from '../../views/RentListingsPage';
import { generateCategoryMetadata, getCanonicalUrl, buildSeoUrl } from '../../utils/permalink';

export async function generateMetadata() {
  const { title, description } = generateCategoryMetadata({ demand: 'rent' }, 2026, 1);
  const canonical = getCanonicalUrl('/nha-dat-cho-thue', 1);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website'
    }
  };
}

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};

  // 301 Redirect nếu URL có query param ?bedroom=... sang Clean URL
  if (sp.bedroom && sp.bedroom !== 'all') {
    const extra = {};
    for (const [k, v] of Object.entries(sp)) {
      if (k !== 'bedroom' && k !== 'page' && v) extra[k] = v;
    }
    const targetUrl = buildSeoUrl({
      demand: 'rent',
      bedroom: sp.bedroom,
      extraParams: extra
    });
    permanentRedirect(targetUrl);
  }

  if (sp.page) {
    const p = parseInt(sp.page, 10);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k !== 'page' && v) params.set(k, String(v));
    }
    const qs = params.toString();
    if (p > 1 && String(p) === sp.page) {
      permanentRedirect(qs ? `/nha-dat-cho-thue/page/${p}/?${qs}` : `/nha-dat-cho-thue/page/${p}/`);
    } else {
      permanentRedirect(qs ? `/nha-dat-cho-thue/?${qs}` : `/nha-dat-cho-thue/`);
    }
  }

  return <RentListingsPage initialPage={1} />;
}
