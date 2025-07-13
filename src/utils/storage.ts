export const SessionStorage = {
  get(key: string): any {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  set(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string): void {
    sessionStorage.removeItem(key);
  },
  clear(): void {
    sessionStorage.clear();
  }
}; 