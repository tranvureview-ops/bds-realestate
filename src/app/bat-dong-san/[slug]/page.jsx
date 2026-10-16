import { notFound } from 'next/navigation';

/**
 * Tuyến đường cũ /bat-dong-san/[slug] đã bị xóa bỏ theo yêu cầu.
 * Luôn trả về 404 Not Found để ngăn chặn việc truy cập.
 */
export default function Page() {
  notFound();
}
