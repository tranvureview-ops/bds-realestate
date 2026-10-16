import PropertyDetailPage from '../../../views/PropertyDetailPage';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || 'bat-dong-san';
  return {
    title: `Chi Tiết Bất Động Sản (${slug})`,
    description: 'Thông tin quy hoạch, diện tích, giá bán, pháp lý sổ đỏ và liên hệ chính chủ.',
  };
}

export default function Page() {
  return <PropertyDetailPage />;
}
