import TransactionHistoryPage from '../../views/TransactionHistoryPage';

export const metadata = {
  title: 'Lịch sử giao dịch & ví tiền',
  description: 'Theo dõi chi tiết các biến động số dư: nạp ví, tiền thưởng khuyến mãi, tiền thu hồi 30 ngày và thanh toán dịch vụ.',
};

export default function Page() {
  return <TransactionHistoryPage />;
}
