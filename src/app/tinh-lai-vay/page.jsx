import MortgageCalculatorPage from '../../views/MortgageCalculatorPage';

export const metadata = {
  title: 'Công Cụ Tính Lãi Suất Vay Mua Nhà Trả Góp',
  description: 'Tính toán lịch trả nợ gốc và lãi vay mua nhà đất theo dư nợ giảm dần hoặc dư nợ gốc ban đầu từ các ngân hàng hàng đầu Việt Nam.',
};

export default function Page() {
  return <MortgageCalculatorPage />;
}
