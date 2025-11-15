Actions = {
    -- 1. All (คงไว้)
    all = {
        types = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 },
        desc = "All items",
        img = "all.png" -- [NEW]
    },

    -- 2. Weapons & Ammo (รวม types 5 และ 6)
    weapons = { 
        types = { 0, 5, 6 }, 
        desc = "Stores all your weapons and ammunition.", 
        img = "weapon.png" -- [NEW]
    },

    -- 3. Consumables (รวม types 2 และ 3)
    consumables = { 
        types = { 0, 2, 3 }, 
        desc = "Stores all types of medical items and provisions.", 
        img = "medicine.png" -- [NEW]
    },

    -- 4. Apparel (หมวดหมู่ใหม่ - เราจะใช้ type 1)
    -- (คุณต้องไปกำหนด group = 1 ให้กับ Item เสื้อผ้าในฐานข้อมูล)
    apparel = { 
        types = { 0, 1 }, 
        desc = "Stores all your clothing and apparel.", 
        img = "shirts.png" -- [NEW]
    },

    -- 5. Etc. (รวม 4, 7, 8, 9, 10, 11)
    etc = { 
        types = { 0, 7, 8, 9, 10, 11 }, -- [MODIFIED] รวม valuables (9) มาที่นี่
        desc = "Stores documents, animal parts, horse items, herbs, and valuables.", 
        img = "etc.png" -- [NEW]
    },

    -- 6. Tools (คงเดิม - type 4)
    tools = { 
        types = { 0, 4 }, 
        desc = "Stores all types of tools and materials.", 
        img = "tools.png" -- [NEW]
    }
}