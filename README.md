# BDS Landmark - Sàn Giao Dịch Bất Động Sản & Hệ Thống Đăng Tin VIP (ReactJS Đa Trang)

Hệ thống website bất động sản thương mại điện tử chuyên nghiệp được xây dựng hoàn toàn bằng **ReactJS**, hoạt động theo **kiến trúc Website Đa Trang (Multi-Page Architecture)** với URL định tuyến chuẩn SEO (hỗ trợ nút Back/Forward, F5 và Bookmark), tích hợp **Hệ thống phân cấp tin đăng VIP (Gói dịch vụ tin VIP 4.0)**, **Biểu mẫu đăng tin chuẩn hóa chuyên nghiệp**, **Trang Single Sản Phẩm Chuyên Sâu**, **Trang Backend Quản Trị Viên (CMS Admin Desk)**, và các công cụ tiện ích tài chính hàng đầu.

---

## 🗺️ 1. Bản Đồ 15 Trang Web (Multi-Page URL Routes)

Hệ thống sử dụng **HashRouter** giúp hoạt động trơn tru 100% trên cả máy chủ phát triển Vite và file chạy độc lập `preview.html` (chạy trực tiếp bằng đúp chuột):

| STT | Tên Trang | URL Route | Mô Tả Chức Năng |
| :---: | :--- | :--- | :--- |
| **1** | **Trang Chủ (Khám Phá)** | `#/` | Hero tìm kiếm đa tiêu chí, thanh danh mục nhanh, Banner VIP Kim Cương & Vàng, danh sách BĐS nổi bật. |
| **2** | **Nhà Đất Cần Bán** | `#/nha-dat-ban` | Chuyên trang mua bán căn hộ chung cư, nhà riêng, nhà mặt phố, biệt thự, đất nền phân lô pháp lý chuẩn. |
| **3** | **Cho Thuê Nhà Đất** | `#/nha-dat-cho-thue` | Chuyên trang cho thuê phòng trọ, căn hộ dịch vụ, nhà nguyên căn, văn phòng và mặt bằng kinh doanh. |
| **4** | **Trang Single Sản Phẩm** | `#/bat-dong-san/:id` | Chi tiết chuyên sâu: Lưới 5 ảnh Mosaic, VR 360°, bản đồ số Leaflet GIS, thông số kỹ thuật, tính lãi vay nhúng, thẻ liên hệ môi giới. |
| **5** | **Đăng Tin BĐS Mới** | `#/dang-tin` | Biểu mẫu đăng tin độc lập chuẩn hóa 4 tầng chuyên nghiệp. |
| **6** | **Bảng Giá Tin Đăng** | `#/bang-gia-tin-dang` | Chi tiết so sánh đặc quyền 5 cấp độ tin đăng (VIP Kim Cương, Vàng, Bạc, Đồng, Thường) và tính năng đẩy tin tự động giờ vàng. |
| **7** | **Công Cụ Tính Lãi Vay** | `#/tinh-lai-vay` | Máy tính tài chính ngân hàng tương tác: Kéo slider số tiền vay, thời hạn (1 - 35 năm), lãi suất, bảng chiết tính dư nợ giảm dần. |
| **8** | **So Sánh Bất Động Sản** | `#/so-sanh` | So sánh trực diện đối đầu 2 - 4 căn nhà/đất cạnh nhau theo bảng ma trận thông số kỹ thuật, đơn giá m², hướng, pháp lý. |
| **9** | **Tin Đã Lưu (Yêu Thích)** | `#/tin-da-luu` | Bộ sưu tập các bất động sản khách hàng đã đánh dấu quan tâm kèm thao tác xóa 1-chạm hoặc xem nhanh. |
| **10** | **Quản Lý Tin Đăng Của Tôi** | `#/quan-ly-tin` | User Dashboard: Theo dõi tin đang hiển thị, chờ duyệt, hết hạn; số lượt xem; nút đẩy tin 5k và nâng cấp gói VIP. |
| **11** | **Hồ Sơ Cá Nhân & KYC** | `#/ho-so-ca-nhan` | Chỉnh sửa thông tin hồ sơ môi giới, đồng bộ SĐT, gửi hồ sơ CCCD xác thực danh tính KYC để nhận Tích Xanh uy tín. |
| **12** | **Nạp Tiền Vào Ví** | `#/nap-tien` | Cổng nạp ví tài khoản với mã VietQR ngân hàng, chọn nhanh mệnh giá (+200k, +500k, +1M, +2M), xem sổ cái giao dịch. |
| **13** | **Đăng Nhập Tài Khoản** | `#/dang-nhap` | Form đăng nhập bằng Email/SĐT + Mật khẩu, tích hợp 3 nút đăng nhập nhanh 1-chạm (Môi Giới Pro, Khách Mua, Admin CMS). |
| **14** | **Đăng Ký Thành Viên** | `#/dang-ky` | Form tạo tài khoản phân loại vai trò (Môi giới hoặc Khách tìm mua), tặng ngay **100.000đ vào ví** khi đăng ký thành công. |
| **15** | **Backend CMS Quản Trị** | `#/admin` | Cổng Admin toàn quyền: Thống kê KPI, duyệt tin đăng chờ duyệt, quản lý BĐS, cấp tích xanh môi giới, sổ cái doanh thu và cấu hình giá VIP. |

---

## 📝 2. Cấu Trúc Đăng Tin Chuẩn Hóa Chuyên Nghiệp

Biểu mẫu đăng tin tại trang `#/dang-tin` được chuẩn hóa theo đúng quy trình 4 giai đoạn của các sàn thương mại điện tử BĐS hàng đầu:

1. **Giai Đoạn 1: Nhu Cầu & Địa Giới Hành Chính 4 Cấp**
   * Nhu cầu: *Bán nhà đất* hoặc *Cho thuê nhà đất*.
   * Loại hình BĐS: Căn hộ chung cư, Nhà riêng/nhà phố, Nhà mặt phố, Biệt thự liền kề, Đất nền dự án, Shophouse.
   * Vị trí 4 cấp: Tỉnh/Thành phố > Quận/Huyện > Phường/Xã > Tên đường / Số nhà.
   * Dự án / Khu đô thị: Chọn hoặc nhập tên dự án (Vinhomes, Goldmark City, Masterise, Eco Green...).

2. **Giai Đoạn 2: Tiêu Đề Chuẩn SEO & Mô Tả Chi Tiết**
   * Tiêu đề tuân thủ nghiêm ngặt quy định **30 đến 99 ký tự** kèm bộ đếm ký tự trực quan.
   * Mô tả mẫu chuyên nghiệp: Gợi ý sẵn cấu trúc diện tích, công năng, ban công, tiện ích nội ngoại khu và pháp lý sang tên.

3. **Giai Đoạn 3: Thông Số Kỹ Thuật Bất Động Sản (Chuẩn AloNhaDat)**
   * Giá bán niêm yết: Tự động quy đổi sang tỷ/triệu đồng và tính đơn giá VNĐ/m².
   * Diện tích sử dụng đất / sàn (m²).
   * **Chiều rộng mặt tiền (m)** và **Độ rộng đường/hẻm vào (m)** (Đặc trưng cốt lõi của AloNhaDat).
   * Hướng nhà & Hướng ban công (8 hướng phong thủy).
   * Số phòng ngủ, số phòng vệ sinh (WC).
   * Tình trạng pháp lý: Sổ hồng chính chủ, Sổ đỏ lâu dài, Hợp đồng mua bán.
   * Bàn giao nội thất: Full nội thất nhập khẩu, Cơ bản, hoặc Bàn giao thô.

4. **Giai Đoạn 4: Gói Dịch Vụ Tin VIP & Lịch Đẩy Tin Giờ Vàng**
   * Chọn gói tin đăng VIP phù hợp (VIP 1 Kim Cương, VIP 2 Vàng, VIP 3 Bạc, VIP 4 Đồng, Tin Thường).
   * Lịch tự động đẩy tin vào các khung giờ vàng có lưu lượng truy cập cao nhất: **8:00 (Sáng), 11:30 (Trưa), 14:00 (Chiều), 19:30 (Tối)**.

---

## 👑 3. Hệ Thống Phân Cấp Tin Đăng VIP (VIP 4.0)

| Cấp Độ Tin | Đơn Giá | Vị Trí Hiển Thị | Nhận Diện & Đặc Quyền | Hiệu Quả Tiếp Cận |
| :--- | :--- | :--- | :--- | :---: |
| **VIP Kim Cương (VIP 1)** | 100.000đ / ngày | **Top 1 toàn sàn** & Trang chủ | Khung viền đỏ hào quang phát sáng, chữ hoa in đậm màu đỏ, tặng 5 lượt đẩy tin giờ vàng/ngày. | **Gấp 30 lần** |
| **VIP Vàng (VIP 2)** | 50.000đ / ngày | **Top 2** ngay dưới VIP 1 | Khung viền vàng gold sang trọng, chữ hoa màu hổ phách, tặng 3 lượt đẩy tin giờ vàng/ngày. | **Gấp 15 lần** |
| **VIP Bạc (VIP 3)** | 25.000đ / ngày | Nổi bật đầu trang danh mục | Khung viền xanh ngọc, huy hiệu VIP Bạc riêng biệt, tặng 1 lượt đẩy tin/ngày. | **Gấp 7 lần** |
| **VIP Đồng (VIP 4)** | 10.000đ / ngày | Ưu tiên trên tin thường | Huy hiệu Bronze, kích thước ảnh tiêu chuẩn. | **Gấp 3 lần** |
| **Tin Thường** | 2.000đ / ngày | Hiển thị sau các tin VIP | Đầy đủ ảnh, thông số, hỗ trợ SĐT và Zalo liên hệ trực tiếp. | **Gấp 1 lần** |

---

## 🚀 4. Hướng Dẫn Khởi Chạy Ứng Dụng

### Cách 1: Xem Ngay Trên Trình Duyệt (Chạy file preview.html không cần cài đặt)
1. Truy cập thư mục `d:\skill\bds-realestate\`
2. Nhấp đúp chuột vào file **`preview.html`** để mở trên trình duyệt (Chrome, Edge, Firefox, Cốc Cốc).
3. Thử nghiệm điều hướng đa trang trực tiếp:
   * Thanh URL tự động đồng bộ theo từng trang: `#/`, `#/nha-dat-ban`, `#/bat-dong-san/BDS-001`, `#/dang-tin`, `#/bang-gia-tin-dang`, `#/tinh-lai-vay`, `#/so-sanh`, `#/tin-da-luu`, `#/quan-ly-tin`, `#/ho-so-ca-nhan`, `#/nap-tien`, `#/dang-nhap`, `#/dang-ky`, `#/admin`.
   * Sử dụng được nút **Back/Forward** của trình duyệt mà không bị lỗi trang.

### Cách 2: Chạy Môi Trường Phát Triển Vite React
Tại thư mục `d:\skill\bds-realestate\`:
```bash
# Cài đặt thư viện (nếu chưa có)
npm install

# Khởi chạy server phát triển
npm run dev
```
Truy cập địa chỉ hiển thị trên terminal: `http://localhost:5173/`

### Kiểm tra build sản phẩm (Production Build):
```bash
npm run build
```
Dự án được tối ưu hóa build hoàn tất chỉ trong ~350ms với 0 lỗi.

---

## 🔗 5. Cấu Trúc Permalink & Schema URL Chuẩn SEO

Hệ thống đã nâng cấp toàn diện hệ thống **Permalink & URL Taxonomy** và **Dữ liệu có cấu trúc Schema.org (JSON-LD)** theo đúng tiêu chuẩn kỹ thuật SEO:

### 1. Permalink Bài Đăng Chi Tiết (Canonical Property Detail URL)
* **Quy tắc**: `/{slug-tieu-de-khong-dau}-pr{idSuffix}`
* **Ý nghĩa thành phần**:
  * `slug-tieu-de-khong-dau`: Chuỗi tiếng Việt không dấu, loại bỏ ký tự đặc biệt, nối bằng gạch ngang `-`, chứa từ khóa đắt giá cho công cụ tìm kiếm.
  * `-pr`: Tiền tố định danh chuẩn (`pr` = Property / Product ID).
  * `{idSuffix}`: Mã số định danh độc nhất của tin trong cơ sở dữ liệu (ví dụ `006`, `001`).
* **Ví dụ thực tế**:
  * Mã `BDS-006` (Nhà mặt phố Lê Thánh Tôn, Quận 1):  
    👉 `/cho-thue-nha-pho-nguyen-can-quan-1-le-thanh-ton-pr006`
  * Mã `BDS-001` (Penthouse Duplex Landmark 81):  
    👉 `/sieu-du-an-penthouse-duplex-landmark-81-tang-cao-view-tron-song-sai-gon-full-noi-that-hang-hieu-y-pr001`
* **Cơ chế tương thích ngược (Backward Compatibility)**:
  * Hệ thống hỗ trợ song song cả URL chuẩn mới và URL alias cũ: `/bat-dong-san/BDS-006` hoặc `/bat-dong-san/:slug` tự động nhận diện và điều hướng mượt mà.

### 2. Schema URL Phân Cấp Danh Mục (Taxonomy & Geographical URLs)
* **Chuyên trang Nhu cầu Cơ bản**:
  * Bán: `/nha-dat-ban`
  * Thuê: `/nha-dat-cho-thue`
* **Phân cấp theo Loại hình BĐS**:
  * Căn hộ chung cư: `/ban-can-ho-chung-cu` / `/cho-thue-can-ho-chung-cu`
  * Nhà riêng, nguyên căn: `/ban-nha-rieng` / `/cho-thue-nha-rieng`
  * Nhà mặt phố kinh doanh: `/ban-nha-mat-pho` / `/cho-thue-nha-mat-pho`
  * Biệt thự liền kề: `/ban-nha-biet-thu-lien-ke` / `/cho-thue-nha-biet-thu-lien-ke`
  * Đất nền dự án, kho bãi: `/ban-dat-nen-du-an` / `/cho-thue-kho-nha-xuong-dat`
  * Văn phòng làm việc: `/cho-thue-van-phong` / `/ban-mat-bang-van-phong`
* **Kết hợp Địa giới Hành chính (City Taxonomy)**:
  * `/nha-dat-ban-ha-noi`, `/nha-dat-ban-tp-hcm`, `/nha-dat-ban-da-nang`
  * `/ban-can-ho-chung-cu-ha-noi`, `/ban-can-ho-chung-cu-tp-hcm`
  * `/cho-thue-van-phong-tp-hcm`
* **Tự động kích hoạt bộ lọc**: Khi truy cập các URL trên, trang danh sách sẽ tự động kích hoạt bộ lọc tương ứng mà không cần người dùng thao tác bấm lọc bằng tay.

### 3. Schema.org JSON-LD Structured Data (Google Rich Snippets)
Mỗi trang chi tiết bất động sản tự động sinh và bơm vào thẻ `<head>` đoạn mã JSON-LD chuẩn Schema.org:
* **`BreadcrumbList`**: Đường dẫn liên kết phân cấp 4 tầng phục vụ hiển thị Breadcrumb trên kết quả tìm kiếm Google.
* **`RealEstateListing` & `SingleFamilyResidence` / `Apartment`**: Khai báo tên, mô tả, ảnh, ngày đăng, số phòng ngủ, số phòng tắm, diện tích sàn (`floorSize` theo chuẩn QuantitativeValue đơn vị MTK).
* **`PostalAddress` & `GeoCoordinates`**: Tọa độ GPS (Vĩ độ `lat`, Kinh độ `lng`), tên đường, quận/huyện, tỉnh/thành.
* **`Offer` & `PriceSpecification`**: Giá bán/thuê chính xác bằng VNĐ kèm tình trạng khả dụng `InStock`.
* **`RealEstateAgent`**: Tên, số điện thoại, ảnh đại diện môi giới phụ trách tin đăng.

### 4. Bộ Điều Hướng Kép (Dual-Mode Router) Xóa Bỏ Ký Tự `/#/`
* **Khi chạy trên HTTP Web Server (`http://localhost:5173/` hoặc deploy production)**:
  * Sử dụng **HTML5 History API** (`window.history.pushState`), loại bỏ hoàn toàn dấu `/#/` ngăn cách, URL hiển thị thanh lịch và sạch tuyệt đối: `http://localhost:5173/cho-thue-nha-pho-nguyen-can-quan-1-le-thanh-ton-pr006`.
* **Khi mở trực tiếp `file:///` bằng đúp chuột (`preview.html`)**:
  * Tự động kích hoạt chế độ **HashRouter fallback** giúp mở file xem ngay không bị lỗi bảo mật Cross-Origin của trình duyệt.


