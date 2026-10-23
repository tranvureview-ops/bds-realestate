import { permanentRedirect, notFound } from 'next/navigation';

/**
 * Tuyến đường cũ /bat-dong-san/[slug] chuyển hướng vĩnh viễn 301 về URL chuẩn /{slug}
 */
export default async function Page({ params }) {
  const { slug } = (await params) || {};
  if (slug) {
    permanentRedirect(`/${slug}`);
  }
  notFound();
}
