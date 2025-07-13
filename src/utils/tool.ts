export class Tool {
    /**
     * 深拷贝对象
     * @param obj 要拷贝的对象
     * @returns 深拷贝后的对象
     */
    static copy<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * 将平铺数组转换为树形结构
     * @param list 平铺数组
     * @param parentId 父级ID
     * @returns 树形结构数组
     */
    static arrayToTree(list: any[], parentId: number): any[] {
        return list
            .filter(item => item.parent == parentId)
            .map(item => ({
                ...item,
                children: Tool.arrayToTree(list, item.id)
            }));
    }
} 