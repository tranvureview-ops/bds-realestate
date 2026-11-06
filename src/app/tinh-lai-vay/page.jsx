import MortgageCalculatorPage from '../../views/MortgageCalculatorPage';
import { SITE_URL } from '../../utils/permalink';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');

export const metadata = {
  title: {
    absolute: 'Công cụ tính lãi suất vay mua nhà trả góp ngân hàng | Kênh Nhà Đất 24H'
  },
  description: 'Công cụ tính lãi vay mua nhà đất chính xác nhất theo dư nợ giảm dần hoặc niên kim cố định. So sánh lãi suất vay mua nhà các ngân hàng Vietcombank, BIDV, Techcombank mới nhất.',
  alternates: {
    canonical: `${baseUrl}/tinh-lai-vay`,
  },
  openGraph: {
    title: 'Công cụ tính lãi suất vay mua nhà trả góp ngân hàng | Kênh Nhà Đất 24H',
    description: 'Dự toán chính xác số tiền gốc, tiền lãi và tổng số tiền trả góp hàng tháng khi vay mua nhà đất, căn hộ chung cư từ các ngân hàng hàng đầu Việt Nam.',
    url: `${baseUrl}/tinh-lai-vay`,
    type: 'website',
  },
};

export default async function Page({ searchParams }) {
  const resolvedParams = searchParams ? await searchParams : {};
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Công cụ tính lãi suất vay mua nhà trả góp',
            applicationCategory: 'FinanceApplication',
            operatingSystem: 'All',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            description: 'Công cụ trực tuyến hỗ trợ tính toán chi tiết lịch trả nợ gốc và lãi vay mua bất động sản theo phương thức dư nợ giảm dần hoặc niên kim.',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'VND',
            },
          }),
        }}
      />
      <MortgageCalculatorPage initialParams={resolvedParams} />
    </>
  );
}
