import { permanentRedirect } from 'next/navigation';
import { parsePropertyUrl, getPropertyPermalink } from '../../../utils/permalink';
import { INITIAL_PROPERTIES } from '../../../data/mockData';
import { fetchServerProperties, findProperty } from '../../../services/propertyService';

export default async function Page({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || '';
  const currentPath = `/bat-dong-san/${slug}`;
  const parsedPropertyUrl = parsePropertyUrl(currentPath);

  const serverProperties = await fetchServerProperties();
  const matchedProperty = findProperty(serverProperties, parsedPropertyUrl, currentPath) ||
    findProperty(INITIAL_PROPERTIES, parsedPropertyUrl, currentPath);

  // Chuyển hướng vĩnh viễn (301 Permanent Redirect) sang định dạng Canonical duy nhất: /{slug}-pr{id}
  if (matchedProperty) {
    const canonicalPermalink = getPropertyPermalink(matchedProperty);
    permanentRedirect(canonicalPermalink);
  }

  // Nếu không tìm thấy, chuyển về danh sách nhà đất bán để không tạo trang rác
  permanentRedirect('/nha-dat-ban');
}
