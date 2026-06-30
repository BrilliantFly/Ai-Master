import { defineStore } from 'pinia'
import { getDictTypeList, getDictList } from '@/api/system/dict'

interface DictItem {
    label: string
    value: string
    [key: string]: any
}

interface DictState {
    dictData: Record<string, DictItem[]>
    dictTypeList: any[]
    loaded: boolean
}

/**
 * 字典缓存Store
 * 用于存储和管理字典数据，支持根据dictType获取字典列表
 */
export const useDictStore = defineStore({
    id: 'dictStore',
    state: (): DictState => ({
        dictData: {},
        dictTypeList: [],
        loaded: false
    }),
    getters: {
        /**
         * 根据字典类型获取字典列表
         */
        getDictList:
            (state) =>
            (dictType: string): DictItem[] => {
                return state.dictData[dictType] || []
            },

        /**
         * 根据字典类型和值获取标签
         */
        getDictLabel:
            (state) =>
            (dictType: string, value: string): string => {
                const list = state.dictData[dictType] || []
                const item = list.find((i) => i.dictValue === value || i.dictValue == value)
                return item?.dictLabel || value
            }
    },
    actions: {
        /**
         * 加载所有字典数据
         */
        async loadDictData() {
            try {
                // 获取字典类型列表
                const typeList = await getDictTypeList()
                this.dictTypeList = typeList || []

                // 加载每个类型的字典数据
                for (const type of this.dictTypeList) {
                    try {
                        const dataList = await getDictList(type.id)
                        if (dataList) {
                            this.dictData[type.dictType] = dataList
                        }
                    } catch (e) {
                        console.error(`加载字典[${type.dictType}]失败:`, e)
                    }
                }

                this.loaded = true
            } catch (e) {
                console.error('加载字典数据失败:', e)
            }
        },

        /**
         * 刷新字典数据
         */
        async refreshDictData() {
            this.dictData = {}
            this.dictTypeList = []
            this.loaded = false
            await this.loadDictData()
        },

        /**
         * 获取字典选项列表（用于picker等组件）
         * return: [{ label, value, ... }]
         */
        getDictOptions(dictType: string): DictItem[] {
            const list = this.dictData[dictType] || []
            return list.map((item) => ({
                label: item.dictLabel,
                value: item.dictValue,
                ...item
            }))
        }
    }
})

export default useDictStore
