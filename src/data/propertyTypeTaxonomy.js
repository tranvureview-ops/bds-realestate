/**
 * Cấu trúc phân cấp Loại Nhà Đất chuẩn Batdongsan.com.vn
 * Hỗ trợ chọn đa điểm (Multi-select), phân nhóm cha-con (Hierarchical tree)
 * Áp dụng riêng biệt cho Mua Bán (Sale) và Cho Thuê (Rent)
 */

export const PROPERTY_TYPE_TREE_SALE = [
  {
    id: 'all',
    name: 'Tất cả nhà đất',
    icon: 'fa-solid fa-house-chimney',
    isAll: true
  },
  {
    id: 'apartment',
    name: 'Căn hộ chung cư',
    icon: 'fa-regular fa-building'
  },
  {
    id: 'mini-apartment',
    name: 'Chung cư mini, căn hộ dịch vụ',
    icon: 'fa-solid fa-city'
  },
  {
    id: 'house-group',
    name: 'Các loại nhà bán',
    icon: 'fa-solid fa-house',
    isGroup: true,
    children: [
      { id: 'house', name: 'Nhà riêng' },
      { id: 'villa', name: 'Nhà biệt thự, liền kề' },
      { id: 'street-house', name: 'Nhà mặt phố' },
      { id: 'shophouse', name: 'Shophouse, nhà phố thương mại' }
    ]
  },
  {
    id: 'land-group',
    name: 'Các loại đất bán',
    icon: 'fa-solid fa-mountain-sun',
    isGroup: true,
    children: [
      { id: 'project-land', name: 'Đất nền dự án' },
      { id: 'land', name: 'Đất' }
    ]
  },
  {
    id: 'farm-resort',
    name: 'Trang trại, khu nghỉ dưỡng',
    icon: 'fa-solid fa-tree'
  },
  {
    id: 'condotel',
    name: 'Condotel',
    icon: 'fa-solid fa-hotel'
  },
  {
    id: 'warehouse',
    name: 'Kho, nhà xưởng',
    icon: 'fa-solid fa-warehouse'
  },
  {
    id: 'other',
    name: 'Bất động sản khác',
    icon: 'fa-solid fa-shapes'
  }
];

export const PROPERTY_TYPE_TREE_RENT = [
  {
    id: 'all',
    name: 'Tất cả nhà đất',
    icon: 'fa-solid fa-house-chimney',
    isAll: true
  },
  {
    id: 'apartment',
    name: 'Căn hộ chung cư',
    icon: 'fa-regular fa-building'
  },
  {
    id: 'mini-apartment',
    name: 'Chung cư mini, căn hộ dịch vụ',
    icon: 'fa-solid fa-city'
  },
  {
    id: 'house-rent-group',
    name: 'Các loại nhà cho thuê',
    icon: 'fa-solid fa-house',
    isGroup: true,
    children: [
      { id: 'house', name: 'Nhà riêng' },
      { id: 'villa', name: 'Nhà biệt thự, liền kề' },
      { id: 'street-house', name: 'Nhà mặt phố' },
      { id: 'shophouse', name: 'Shophouse, nhà phố thương mại' }
    ]
  },
  {
    id: 'room',
    name: 'Nhà trọ, phòng trọ',
    icon: 'fa-solid fa-door-open'
  },
  {
    id: 'office',
    name: 'Văn phòng',
    icon: 'fa-solid fa-briefcase'
  },
  {
    id: 'commercial-space',
    name: 'Cửa hàng, mặt bằng bán lẻ',
    icon: 'fa-solid fa-store'
  },
  {
    id: 'warehouse',
    name: 'Kho, nhà xưởng, đất',
    icon: 'fa-solid fa-warehouse'
  },
  {
    id: 'other',
    name: 'Bất động sản khác',
    icon: 'fa-solid fa-shapes'
  }
];

export const SALE_PROPERTY_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả nhà đất', icon: 'fa-solid fa-house-chimney' },
  { value: 'apartment', label: 'Căn hộ chung cư', icon: 'fa-regular fa-building' },
  { value: 'mini-apartment', label: 'Chung cư mini, căn hộ dịch vụ', icon: 'fa-solid fa-city' },
  { value: 'house-group', label: 'Tất cả các loại nhà bán', icon: 'fa-solid fa-house' },
  { value: 'house', label: 'Nhà riêng, nhà phố', icon: 'fa-solid fa-house-user' },
  { value: 'villa', label: 'Nhà biệt thự, liền kề', icon: 'fa-solid fa-landmark-dome' },
  { value: 'street-house', label: 'Nhà mặt phố', icon: 'fa-solid fa-shop' },
  { value: 'shophouse', label: 'Shophouse, nhà phố thương mại', icon: 'fa-solid fa-store' },
  { value: 'land-group', label: 'Tất cả các loại đất bán', icon: 'fa-solid fa-mountain-sun' },
  { value: 'project-land', label: 'Đất nền dự án', icon: 'fa-solid fa-map-location-dot' },
  { value: 'land', label: 'Đất thổ cư, đất ở', icon: 'fa-solid fa-vector-square' },
  { value: 'farm-resort', label: 'Trang trại, khu nghỉ dưỡng', icon: 'fa-solid fa-tree' },
  { value: 'condotel', label: 'Condotel', icon: 'fa-solid fa-hotel' },
  { value: 'warehouse', label: 'Kho, nhà xưởng', icon: 'fa-solid fa-warehouse' },
  { value: 'other', label: 'Bất động sản khác', icon: 'fa-solid fa-shapes' }
];

export const RENT_PROPERTY_TYPE_OPTIONS = [
  { value: 'all', label: 'Tất cả nhà đất cho thuê', icon: 'fa-solid fa-house-chimney' },
  { value: 'apartment', label: 'Căn hộ chung cư', icon: 'fa-regular fa-building' },
  { value: 'mini-apartment', label: 'Chung cư mini, căn hộ dịch vụ', icon: 'fa-solid fa-city' },
  { value: 'house-rent-group', label: 'Tất cả các loại nhà cho thuê', icon: 'fa-solid fa-house' },
  { value: 'house', label: 'Nhà riêng, nhà phố', icon: 'fa-solid fa-house-user' },
  { value: 'villa', label: 'Nhà biệt thự, liền kề', icon: 'fa-solid fa-landmark-dome' },
  { value: 'street-house', label: 'Nhà mặt phố', icon: 'fa-solid fa-shop' },
  { value: 'shophouse', label: 'Shophouse, nhà phố thương mại', icon: 'fa-solid fa-store' },
  { value: 'room', label: 'Nhà trọ, phòng trọ', icon: 'fa-solid fa-door-open' },
  { value: 'office', label: 'Văn phòng', icon: 'fa-solid fa-briefcase' },
  { value: 'commercial-space', label: 'Cửa hàng, mặt bằng bán lẻ', icon: 'fa-solid fa-store' },
  { value: 'warehouse', label: 'Kho, nhà xưởng, đất', icon: 'fa-solid fa-warehouse' },
  { value: 'other', label: 'Bất động sản khác', icon: 'fa-solid fa-shapes' }
];

/**
 * Lấy danh sách tùy chọn phẳng gọn gàng (Select/Radio) theo nhu cầu
 */
export function getPropertyTypeOptions(demand = 'sale') {
  return demand === 'rent' ? RENT_PROPERTY_TYPE_OPTIONS : SALE_PROPERTY_TYPE_OPTIONS;
}

/**
 * Lấy danh sách cây loại hình BĐS theo nhu cầu (demand: 'sale' | 'rent')
 */
export function getPropertyTypeTree(demand = 'sale') {
  return demand === 'rent' ? PROPERTY_TYPE_TREE_RENT : PROPERTY_TYPE_TREE_SALE;
}

/**
 * Trả về danh sách phẳng tất cả các loại hình (lá) cùng tên và nhóm cha
 */
export function getFlatPropertyTypes(demand = 'sale') {
  const tree = getPropertyTypeTree(demand);
  const result = [];

  tree.forEach(item => {
    if (item.isGroup && item.children) {
      item.children.forEach(child => {
        result.push({
          ...child,
          parentId: item.id,
          parentName: item.name,
          icon: item.icon
        });
      });
    } else {
      result.push(item);
    }
  });

  return result;
}

/**
 * Mở rộng danh sách IDs: Nếu chứa ID nhóm (ví dụ: 'house-group'), tự động chuyển thành các ID con
 */
export function expandPropertyTypeIds(ids = []) {
  if (!Array.isArray(ids)) {
    if (typeof ids === 'string' && ids.trim()) {
      ids = ids.split(',').map(s => s.trim());
    } else {
      return [];
    }
  }

  const expanded = new Set();
  const HOUSE_CHILDREN = ['house', 'villa', 'street-house', 'shophouse'];
  const LAND_CHILDREN = ['project-land', 'land'];

  ids.forEach(id => {
    if (id === 'house-group' || id === 'house-rent-group') {
      HOUSE_CHILDREN.forEach(c => expanded.add(c));
    } else if (id === 'land-group') {
      LAND_CHILDREN.forEach(c => expanded.add(c));
    } else if (id && id !== 'all') {
      expanded.add(id);
    }
  });

  return Array.from(expanded);
}

/**
 * Lấy label hiển thị trên nút Trigger của Bộ Lọc
 * - Không chọn hoặc chọn 'all' => "Loại nhà đất"
 * - Chọn 1 loại => Tên loại đó (ví dụ: "Căn hộ chung cư")
 * - Chọn trọn bộ nhóm "Các loại nhà bán" => "Các loại nhà bán"
 * - Chọn trọn bộ nhóm "Các loại đất bán" => "Các loại đất bán"
 * - Chọn 2 loại => "Căn hộ chung cư, Nhà riêng"
 * - Chọn > 2 loại => "3 loại nhà đất"
 */
export function formatPropertyTypeTriggerLabel(rawSelected, demand = 'sale', fallbackLabel = 'Loại nhà đất') {
  if (!rawSelected) return fallbackLabel;

  let selected = [];
  if (Array.isArray(rawSelected)) {
    selected = rawSelected.filter(id => id && id !== 'all');
  } else if (typeof rawSelected === 'string') {
    if (rawSelected === 'all' || !rawSelected.trim()) return fallbackLabel;
    selected = rawSelected.split(',').map(s => s.trim()).filter(id => id && id !== 'all');
  }

  if (selected.length === 0) return fallbackLabel;

  const flatTypes = getFlatPropertyTypes(demand);
  const options = getPropertyTypeOptions(demand);
  const typeMap = new Map();
  options.forEach(t => typeMap.set(t.value, t.label));
  flatTypes.forEach(t => {
    if (!typeMap.has(t.id)) typeMap.set(t.id, t.name);
  });

  // Kiểm tra trọn nhóm nhà
  const houseChildren = ['house', 'villa', 'street-house', 'shophouse'];
  const isFullHouseGroup = houseChildren.every(id => selected.includes(id));
  if (isFullHouseGroup && selected.length === houseChildren.length) {
    return demand === 'rent' ? 'Các loại nhà cho thuê' : 'Các loại nhà bán';
  }

  // Kiểm tra trọn nhóm đất
  const landChildren = ['project-land', 'land'];
  const isFullLandGroup = landChildren.every(id => selected.includes(id));
  if (isFullLandGroup && selected.length === landChildren.length) {
    return 'Các loại đất bán';
  }

  // 1 lựa chọn
  if (selected.length === 1) {
    return typeMap.get(selected[0]) || selected[0];
  }

  // 2 lựa chọn
  if (selected.length === 2) {
    const name1 = typeMap.get(selected[0]) || selected[0];
    const name2 = typeMap.get(selected[1]) || selected[1];
    return `${name1}, ${name2}`;
  }

  // > 2 lựa chọn
  return `${selected.length} loại nhà đất`;
}
