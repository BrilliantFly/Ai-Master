/**
 * 法定节假日精确安排
 *
 * 每年国务院公告后更新此文件即可，无需改动代码逻辑。
 * 数据来源：国务院办公厅关于XXXX年部分节假日安排的通知
 *
 * 格式：
 *   'YYYY-MM-DD': { holiday: true,  name: '节日名' }  →  放假，显示 休
 *   'YYYY-MM-DD': { holiday: false, name: '调休'   }  →  上班，显示 班
 */
const schedules = {
    // ================================================================
    // 2026 年 — 国办发明电〔2025〕7 号
    // 春节 2/15(腊月廿八)~2/23(正月初七) 共 9 天
    // 劳动节 5/1~5/5 (5 天，2025 年起法定假增至 2 天)
    // ================================================================
    2026: {
        // --- 元旦 ---
        '2026-01-01': { holiday: true, name: '元旦' },
        '2026-01-02': { holiday: true, name: '元旦' },
        '2026-01-03': { holiday: true, name: '元旦' },
        '2026-01-04': { holiday: false, name: '调休' },

        // --- 春节 ---
        '2026-02-15': { holiday: true, name: '春节' },
        '2026-02-16': { holiday: true, name: '春节' },
        '2026-02-17': { holiday: true, name: '春节' },
        '2026-02-18': { holiday: true, name: '春节' },
        '2026-02-19': { holiday: true, name: '春节' },
        '2026-02-20': { holiday: true, name: '春节' },
        '2026-02-21': { holiday: true, name: '春节' },
        '2026-02-22': { holiday: true, name: '春节' },
        '2026-02-23': { holiday: true, name: '春节' },
        '2026-02-14': { holiday: false, name: '调休' },
        '2026-02-28': { holiday: false, name: '调休' },

        // --- 清明节 ---
        '2026-04-04': { holiday: true, name: '清明节' },
        '2026-04-05': { holiday: true, name: '清明节' },
        '2026-04-06': { holiday: true, name: '清明节' },

        // --- 劳动节 ---
        '2026-05-01': { holiday: true, name: '劳动节' },
        '2026-05-02': { holiday: true, name: '劳动节' },
        '2026-05-03': { holiday: true, name: '劳动节' },
        '2026-05-04': { holiday: true, name: '劳动节' },
        '2026-05-05': { holiday: true, name: '劳动节' },
        '2026-05-09': { holiday: false, name: '调休' },

        // --- 端午节 ---
        '2026-06-19': { holiday: true, name: '端午节' },
        '2026-06-20': { holiday: true, name: '端午节' },
        '2026-06-21': { holiday: true, name: '端午节' },

        // --- 中秋节 ---
        '2026-09-25': { holiday: true, name: '中秋节' },
        '2026-09-26': { holiday: true, name: '中秋节' },
        '2026-09-27': { holiday: true, name: '中秋节' },

        // --- 国庆节 ---
        '2026-10-01': { holiday: true, name: '国庆节' },
        '2026-10-02': { holiday: true, name: '国庆节' },
        '2026-10-03': { holiday: true, name: '国庆节' },
        '2026-10-04': { holiday: true, name: '国庆节' },
        '2026-10-05': { holiday: true, name: '国庆节' },
        '2026-10-06': { holiday: true, name: '国庆节' },
        '2026-10-07': { holiday: true, name: '国庆节' },
        '2026-09-20': { holiday: false, name: '调休' },
        '2026-10-10': { holiday: false, name: '调休' }
    }

    // ================================================================
    // 模板（新增年份时复制此结构）
    // ================================================================
    // 2027: {
    //   '2027-01-01': { holiday: true, name: '元旦' },
    //   // ... 待国务院公告后补充
    // },
}

export default schedules
