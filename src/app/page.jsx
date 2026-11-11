import HomePage from '../views/HomePage';
import { SITE_URL } from '../utils/permalink';

export async function generateMetadata() {
  const currentYear = new Date().getFullYear();
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).replace(/\/+$/, '');
  const ogImageUrl = `${baseUrl}/mua-ban-nha-dat-toan-quoc.webp`;
  const ogTitle = `Mua bán nhà đất, cho thuê bất động sản toàn quốc [${currentYear}] - Kênh Nhà Đất 24H`;
  const ogDesc = `Tìm mua bán nhà đất, cho thuê bất động sản trên toàn quốc mới nhất [${currentYear}]. Khám phá nhà riêng, căn hộ, đất nền, dự án và đăng tin bất động sản miễn phí tại Kênh Nhà Đất 24H.`;

  return {
    title: {
      absolute: ogTitle
    },
    description: ogDesc,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${baseUrl}/`,
    },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/`,
      siteName: 'Kênh Nhà Đất 24H',
      title: ogTitle,
      description: ogDesc,
      locale: 'vi_VN',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          type: 'image/webp',
          alt: 'Mua bán nhà đất, cho thuê bất động sản toàn quốc - Kênh Nhà Đất 24H'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDesc,
      images: [ogImageUrl]
    }
  };
}

export default function Page() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Kênh Nhà Đất 24H có hỗ trợ đăng tin bất động sản miễn phí không?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Có. Kênh Nhà Đất 24H hỗ trợ người dùng đăng tin Tin Thường hoàn toàn miễn phí với thời hạn hiển thị lên đến 60 ngày. Ngoài ra, nếu có nhu cầu gia tăng tỷ lệ tiếp cận người mua và thanh khoản nhanh chóng, bạn có thể lựa chọn nâng cấp các gói tin VIP (VIP Kim Cương, VIP Vàng, VIP Bạc) với vị trí ưu tiên và nhãn nhận diện nổi bật trên toàn sàn.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để đăng tin mua bán nhà đất?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn chỉ cần nhấp vào nút "Đăng tin" tại góc trên màn hình hoặc truy cập trang Đăng tin. Hãy nhập đầy đủ thông tin: nhu cầu giao dịch (Bán hoặc Cho thuê), loại hình nhà đất, địa chỉ chi tiết, diện tích, giá bán, tải lên hình ảnh chụp thực tế và số điện thoại liên hệ. Sau khi xác nhận hoàn tất, hệ thống sẽ tiến hành kiểm duyệt tự động và kích hoạt hiển thị tin đăng trên website.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để tìm kiếm bất động sản theo tỉnh thành?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn có thể tra cứu nhà đất theo địa phương qua 2 cách nhanh chóng: (1) Sử dụng bộ lọc thông minh tại đầu trang chủ để chọn Tỉnh/Thành phố và Quận/Huyện mong muốn; hoặc (2) Cuộn xuống khu vực "Tìm Kiếm Bất Động Sản Theo Tỉnh Thành" và nhấp trực tiếp vào Card của tỉnh thành bạn quan tâm (như TP. Hồ Chí Minh, Hà Nội, Đà Nẵng, Bình Dương, Đồng Nai, Khánh Hòa, Bà Rịa - Vũng Tàu, Hải Phòng...) để xem ngay danh sách toàn bộ tin đăng tại khu vực đó.'
        }
      },
      {
        '@type': 'Question',
        name: 'Website có những loại hình bất động sản nào?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Kênh Nhà Đất 24H phân loại khoa học đầy đủ các loại hình sản phẩm trên thị trường, bao gồm: Căn hộ chung cư, Chung cư mini & Căn hộ dịch vụ, Nhà riêng, Nhà phố liền kề, Biệt thự cao cấp, Nhà mặt phố kinh doanh, Shophouse thương mại, Đất nền dự án, Đất thổ cư, Trang trại & Khu nghỉ dưỡng, Kho bãi và Nhà xưởng tiêu chuẩn công nghiệp.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để liên hệ với người đăng tin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Tại trang chi tiết của mỗi bất động sản hoặc trên thẻ tin xem nhanh, hệ thống hiển thị rõ ràng số điện thoại của người bán/môi giới. Bạn có thể nhấn trực tiếp vào nút "Gọi điện" để kết nối thoại ngay hoặc bấm nút "Chat Zalo" để trò chuyện trực tiếp 1-chạm, thỏa thuận mức giá và đặt lịch đi xem thực tế căn nhà mà không phải trả bất kỳ khoản phí trung gian nào.'
        }
      },
      {
        '@type': 'Question',
        name: 'Làm thế nào để chỉnh sửa hoặc gỡ tin đã đăng?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bạn hãy đăng nhập vào tài khoản cá nhân, nhấp vào tên tài khoản và chọn mục "Quản lý tin". Tại bảng điều khiển danh sách tin đăng, bạn có thể dễ dàng chọn nút "Chỉnh sửa" để cập nhật mức giá, bổ sung ảnh hay thay đổi nội dung mô tả; hoặc chọn nút "Hạ tin / Đã giao dịch" khi bất động sản đã bán/cho thuê thành công để ngừng nhận cuộc gọi.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePage />
    </>
  );
}
