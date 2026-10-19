import { permanentRedirect } from 'next/navigation';
import SaleListingsPage from '../../views/SaleListingsPage';
import { generateCategoryMetadata, getCanonicalUrl } from '../../utils/permalink';

export async function generateMetadata() {
  const { title, description } = generateCategoryMetadata({ demand: 'sale' }, 2026, 1);
  const canonical = getCanonicalUrl('/nha-dat-ban', 1);
  return {
    title,
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
  if (sp.page) {
    const p = parseInt(sp.page, 10);
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      if (k !== 'page' && v) params.set(k, String(v));
    }
    const qs = params.toString();
    if (p > 1 && String(p) === sp.page) {
      permanentRedirect(qs ? `/nha-dat-ban/page/${p}/?${qs}` : `/nha-dat-ban/page/${p}/`);
    } else {
      permanentRedirect(qs ? `/nha-dat-ban/?${qs}` : `/nha-dat-ban/`);
    }
  }

  return <SaleListingsPage initialPage={1} />;
}
