Actions = {
    -- 1. All (คงไว้)
    all = {
        types = { 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 },
        desc = "All items",
        img = "all.png"
    },

    -- [NEW] Food Category (ลำดับ 2)
    food = { 
        types = { 0, 2 }, -- ดึง Group 2 (Food/Provisions) มาใช้
        desc = "Stores all food and consumable provisions.", 
        img = "food.png" -- ต้องมีไฟล์ food.png ใน /html/img/itemtypes/
    },

    -- 2. Weapons & Ammo (รวม types 5 และ 6)
    weapons = { 
        types = { 0, 5, 6 }, 
        desc = "Stores all your weapons and ammunition.", 
        img = "weapon.png"
    },

    favorites = {
        types = { "favorites" }, 
        desc = "Your favorite items",
        img = "favorite.png" 
    },

    -- [MODIFIED] Consumables -> เหลือแค่ Medical (Group 3)
    consumables = { 
        types = { 0, 3 }, -- เปลี่ยนจาก {0, 2, 3} ให้เหลือแค่ Group 3 (Medical/Tonics)
        desc = "Stores all types of medical items and tonics.", 
        img = "medicine.png"
    },

    -- 4. Apparel
    apparel = { 
        types = { 0, 1 }, 
        desc = "Stores all your clothing and apparel.", 
        img = "shirts.png" 
    },

    -- 5. Etc.
    etc = { 
        types = { 0, 7, 8, 9, 10, 11 }, 
        desc = "Stores documents, animal parts, horse items, herbs, and valuables.", 
        img = "etc.png" 
    },

    -- 6. Tools
    tools = { 
        types = { 0, 4 }, 
        desc = "Stores all types of tools and materials.", 
        img = "tools.png" 
    }
}