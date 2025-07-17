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

    /**
     * 递归查找所有子分类 id（包含自身）
     * @param list 分类平铺数组
     * @param id 当前分类 id
     * @returns 所有子分类 id 数组
     */
    static getAllCategoryIds(list: any[], id: number): number[] {
        const ids = [id];
        function findChildren(parentId: number) {
            list.forEach(item => {
                if (item.parent === parentId) {
                    ids.push(item.id);
                    findChildren(item.id);
                }
            });
        }
        findChildren(id);
        return ids;
    }
} 