import TransactionHistoryPage from '../../views/TransactionHistoryPage';

export const metadata = {
  title: 'Lịch Sử Giao Dịch & Ví Tiền',
  description: 'Theo dõi chi tiết các biến động số dư: Nạp ví, tiền thưởng khuyến mãi, tiền thu hồi 30 ngày và thanh toán dịch vụ.',
};

export default function Page() {
  return <TransactionHistoryPage />;
}
