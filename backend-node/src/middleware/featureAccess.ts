/**
 * 定義不同角色的功能權限
 */
const roleFeatureMap: Record<string, string[]> = {
  admin: ['all'],
  user: ['read', 'write'],
  guest: ['read'],
  anonymous: [],
};

/**
 * 根據角色取得功能權限
 * @param role 使用者角色
 * @returns 功能權限陣列
 */
export function getFeatureAccessByRole(role: string): string[] {
  return roleFeatureMap[role] || [];
}

/**
 * 判斷是否允許匿名使用者
 * @returns 是否允許
 */
export function isAnonymousAllowed(): boolean {
  // 這裡可根據需求調整
  return true;
}

/**
 * 取得匿名使用者的功能權限
 * @returns 功能權限陣列
 */
export function getAnonymousFeatures(): string[] {
  return ['read'];
}
