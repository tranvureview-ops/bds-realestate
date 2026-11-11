import React from 'react';
import FengShuiPage from '../../views/FengShuiPage';
import { SITE_URL } from '../../utils/permalink';

export const metadata = {
  title: {
    absolute: 'Xem tuổi mua đất xây nhà & mượn tuổi làm nhà chuẩn phong thủy | Kênh Nhà Đất 24H'
  },
  description: 'Công cụ tra cứu phong thủy xem tuổi mua đất, làm nhà, động thổ khởi công chuẩn nhất. Tính hạn Tam Tai, Kim Lâu, Hoang Ốc, cung Bát Trạch và gợi ý tuổi đẹp mượn tuổi làm nhà.',
  alternates: {
    canonical: `${SITE_URL.replace(/\/+$/, '')}/xem-tuoi-mua-dat-xay-nha`
  },
  openGraph: {
    title: 'Xem tuổi mua đất xây nhà & mượn tuổi làm nhà chuẩn phong thủy | Kênh Nhà Đất 24H',
    description: 'Tra cứu tuổi làm nhà, mua đất hợp phong thủy. Đánh giá 3 đại kỵ Tam Tai, Kim Lâu, Hoang Ốc và danh sách các tuổi đẹp mượn tuổi động thổ trong năm.',
    url: `${SITE_URL.replace(/\/+$/, '')}/xem-tuoi-mua-dat-xay-nha`,
    type: 'website',
    images: [
      {
        url: `${SITE_URL.replace(/\/+$/, '')}/hero.png`,
        width: 1200,
        height: 630,
        alt: 'Xem tuổi mua đất xây nhà - Kênh Nhà Đất 24H'
      }
    ]
  }
};

export default function Page() {
  return <FengShuiPage />;
}
