export const KEY = 'your-secret-key';

export function hexMd5(str: string): string {
  // 实际项目中请用真实md5库，这里仅作演示
  // 例如：return md5(str);
  return str.split('').reverse().join('') + '_md5'; // 模拟加密
} 