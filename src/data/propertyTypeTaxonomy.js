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
    name: 'Nhà đất khác',
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
    name: 'Nhà đất khác',
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
  { value: 'other', label: 'Nhà đất khác', icon: 'fa-solid fa-shapes' }
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
  { value: 'other', label: 'Nhà đất khác', icon: 'fa-solid fa-shapes' }
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
 * Danh từ tiếng Việt chuẩn hóa cho tất cả các loại hình & nhóm loại hình BĐS
 */
export const PROPERTY_TYPE_NAMES = {
  // Nhóm phân cấp
  'house-group': 'Các loại nhà bán',
  'house-rent-group': 'Các loại nhà cho thuê',
  'land-group': 'Các loại đất bán',
  
  // Các loại hình cụ thể
  'all': 'Tất cả nhà đất',
  'apartment': 'Căn hộ chung cư',
  'mini-apartment': 'Chung cư mini, căn hộ dịch vụ',
  'house': 'Nhà riêng, nhà phố',
  'villa': 'Nhà biệt thự, liền kề',
  'street-house': 'Nhà mặt phố',
  'shophouse': 'Shophouse, nhà phố thương mại',
  'project-land': 'Đất nền dự án',
  'land': 'Đất thổ cư, đất ở',
  'farm-resort': 'Trang trại, khu nghỉ dưỡng',
  'condotel': 'Condotel',
  'warehouse': 'Kho, nhà xưởng',
  'office': 'Văn phòng',
  'commercial-space': 'Cửa hàng, mặt bằng bán lẻ',
  'room': 'Nhà trọ, phòng trọ',
  'other': 'Nhà đất khác'
};

/**
 * Trả về tên tiếng Việt hiển thị thân thiện cho bất kỳ ID loại hình hoặc nhóm loại hình BĐS
 */
export function getPropertyTypeDisplayName(id, demand = 'sale') {
  if (!id || id === 'all') return demand === 'rent' ? 'Tất cả nhà đất cho thuê' : 'Tất cả nhà đất';
  
  if (id === 'house-group') return demand === 'rent' ? 'Các loại nhà cho thuê' : 'Các loại nhà bán';
  if (id === 'house-rent-group') return 'Các loại nhà cho thuê';
  if (id === 'land-group') return demand === 'rent' ? 'Các loại đất cho thuê' : 'Các loại đất bán';
  
  if (PROPERTY_TYPE_NAMES[id]) return PROPERTY_TYPE_NAMES[id];

  const flat = getFlatPropertyTypes(demand);
  const found = flat.find(f => f.id === id);
  if (found?.name) return found.name;

  const options = getPropertyTypeOptions(demand);
  const opt = options.find(o => o.value === id);
  if (opt?.label) return opt.label;

  return id;
}

/**
 * Trả về danh sách phẳng tất cả các loại hình (lá) cùng tên và nhóm cha
 */
export function getFlatPropertyTypes(demand = 'sale') {
  const tree = getPropertyTypeTree(demand);
  const result = [];

  tree.forEach(item => {
    if (item.isGroup && item.children) {
      result.push({
        id: item.id,
        name: item.name,
        icon: item.icon,
        isGroup: true
      });
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
 * Bảng ánh xạ Category ID (cId) chuẩn Batdongsan.com.vn
 * Ví dụ: https://batdongsan.com.vn/ban-can-ho-chung-cu-mini?cIds=362,324
 */
export const BATDONGSAN_CID_MAP = {
  // Bán (Sale)
  'apartment': 324,
  'mini-apartment': 362,
  'house': 41,
  'villa': 325,
  'street-house': 163,
  'shophouse': 361,
  'project-land': 40,
  'land': 283,
  'farm-resort': 44,
  'condotel': 360,
  'warehouse': 45,
  'other': 38,
  'office': 49,
  'commercial-space': 42,
  'room': 48,
  
  // Thuê (Rent)
  'rent-apartment': 326,
  'rent-mini-apartment': 577,
  'rent-house': 43,
  'rent-villa': 327,
  'rent-street-house': 164,
  'rent-shophouse': 363,
  'rent-room': 48,
  'rent-office': 50,
  'rent-commercial-space': 52,
  'rent-warehouse': 47
};

export const BATDONGSAN_ID_TO_TYPE_MAP = {
  // Bán & Chung
  324: 'apartment',
  362: 'mini-apartment',
  41: 'house',
  325: 'villa',
  163: 'street-house',
  361: 'shophouse',
  40: 'project-land',
  283: 'land',
  44: 'farm-resort',
  360: 'condotel',
  45: 'warehouse',
  38: 'other',
  49: 'office',
  42: 'commercial-space',
  
  // Thuê
  326: 'apartment',
  577: 'mini-apartment',
  43: 'house',
  327: 'villa',
  164: 'street-house',
  363: 'shophouse',
  48: 'room',
  50: 'office',
  52: 'commercial-space',
  47: 'warehouse'
};

/**
 * Chuyển chuỗi query ?loai= (ví dụ "apartment,mini-apartment" hoặc "362,324") thành danh sách type ID nội bộ
 */
export function parseCIdsParam(loaiStr, demand = 'sale') {
  if (!loaiStr) return [];
  const parts = String(loaiStr).split(',').map(s => s.trim()).filter(Boolean);
  const types = [];
  parts.forEach(part => {
    if (/^\d+$/.test(part)) {
      // Hỗ trợ backward compat với số ID cũ
      const numId = parseInt(part, 10);
      if (BATDONGSAN_ID_TO_TYPE_MAP[numId]) {
        types.push(BATDONGSAN_ID_TO_TYPE_MAP[numId]);
      }
    } else {
      // Slug type trực tiếp: 'apartment', 'mini-apartment', ...
      types.push(part);
    }
  });
  return Array.from(new Set(types));
}

/**
 * Chuyển danh sách loại hình thành chuỗi slug cho param ?loai=
 * Ví dụ: ['mini-apartment', 'apartment'] => "mini-apartment,apartment"
 * Nhóm cha (house-group, land-group) được tự động mở rộng thành các type con
 */
export function formatCIdsParam(typeList, demand = 'sale') {
  if (!typeList || typeList.length === 0) return '';
  const cleanList = Array.isArray(typeList) ? typeList : String(typeList).split(',');
  const slugs = [];
  cleanList.forEach(t => {
    if (!t || t === 'all') return;
    if (t === 'house-group') {
      slugs.push('house', 'villa', 'street-house', 'shophouse');
      return;
    }
    if (t === 'house-rent-group') {
      slugs.push('house', 'villa', 'street-house', 'shophouse');
      return;
    }
    if (t === 'land-group') {
      slugs.push('project-land', 'land');
      return;
    }
    slugs.push(t);
  });
  return Array.from(new Set(slugs)).join(',');
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

  ids.forEach(rawId => {
    const id = /^\d+$/.test(String(rawId)) ? (BATDONGSAN_ID_TO_TYPE_MAP[parseInt(rawId, 10)] || rawId) : rawId;
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

  // Kiểm tra trọn nhóm nhà (Chấp nhận cả id 'house-group' / 'house-rent-group' hoặc đủ 4 mục con)
  const houseChildren = ['house', 'villa', 'street-house', 'shophouse'];
  const hasHouseGroupDirect = selected.includes('house-group') || selected.includes('house-rent-group');
  const hasAllHouseChildren = houseChildren.every(id => selected.includes(id));
  const hasOnlyHouseItems = selected.every(id => houseChildren.includes(id) || id === 'house-group' || id === 'house-rent-group');

  if ((hasHouseGroupDirect || hasAllHouseChildren) && hasOnlyHouseItems) {
    return demand === 'rent' ? 'Các loại nhà cho thuê' : 'Các loại nhà bán';
  }

  // Kiểm tra trọn nhóm đất (Chấp nhận id 'land-group' hoặc đủ mục con)
  const landChildren = ['project-land', 'land'];
  const hasLandGroupDirect = selected.includes('land-group');
  const hasAllLandChildren = landChildren.every(id => selected.includes(id));
  const hasOnlyLandItems = selected.every(id => landChildren.includes(id) || id === 'land-group');

  if ((hasLandGroupDirect || hasAllLandChildren) && hasOnlyLandItems) {
    return demand === 'rent' ? 'Các loại đất cho thuê' : 'Các loại đất bán';
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
