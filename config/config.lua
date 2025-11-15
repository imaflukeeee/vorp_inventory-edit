Lang = "English"

Config = {
    -- ======================= การพัฒนา (DEVELOPMENT) ==============================
    Debug = false,                   -- ตั้งเป็น true เฉพาะตอนทดสอบ
    InventoryOrder = "items",        -- ไอเท็ม หรือ อาวุธ ที่ควรจะแสดงก่อนในช่องเก็บของ
    DevMode = false,                 -- โหลดช่องเก็บของอัตโนมัติและเพิ่ม /getInv
    dbupdater = true,

    -- ======================= การกำหนดค่า (CONFIGURATION) =========================
    ShowCharacterNameOnGive = false, -- แสดงชื่อผู้เล่นใกล้แทน ID
    DoubleClickToUse = true,         -- ใช้ไอเท็มแบบดับเบิลคลิก
    NewPlayers = false,              -- หลีกเลี่ยงให้ไอเท็มผู้เล่นใหม่
    CoolDownNewPlayer = 120,         -- วินาทีรอก่อนให้ไอเท็ม/เงิน
    UseRolItem = false,               -- แสดงสกุลเงิน Roleplay
    UseGoldItem = true,
    AddGoldItem = true,              -- สร้างไอเท็มแทนค่าทอง
    AddDollarItem = true,             -- สร้างไอเท็มแทนค่าดอลลาร์
    AddAmmoItem = false,               -- สร้างไอเท็มแทนเข็มขัดปืน
    InventorySearchable = true,       -- ให้แถบค้นหาในช่องเก็บของ
    InventorySearchAutoFocus = false,  -- โฟกัสแถบค้นหาอัตโนมัติ
    DisableDeathInventory = true,     -- ป้องกันเข้าถึงช่องเก็บของตอนตาย
    OpenKey = 0xC1989F95,             -- ปุ่มเปิดช่องเก็บของ (I)
    UseFilter = true,                 -- ใช้ฟิลเตอร์/เอฟเฟกต์เบลอ
    Filter = "OJDominoBlur",
    PickupKey = 0x760A9C6F,           -- ปุ่ม G สำหรับเก็บของ
    discordid = true,                  -- ใช้ Discord whitelist
    DeleteOnlyDontDrop = true,        -- ถ้า true ทิ้งไอเท็ม = ลบอย่างเดียว
    UseLanternPutOnBelt = true,        -- ตะเกียงถูกสวมไว้ที่เข็มขัด
    WeightMeasure = "kg",              -- หน่วยน้ำหนัก
    DeleteItemOnUseWhenExpired = true,

    DeletePickups = {
        Enable = true,                -- ลบของตกพื้น
        Time = 0.5,                     -- นาที
    },

    DuelWield = true,                  -- ถืออาวุธคู่
    SpamDelay = 500,                  -- ms ก่อนใช้ไอเท็มถัดไป

    -- ==================== การกำหนดค่าเสียง (SOUND) ============================
    SFX = {
        OpenInventory = true,
        CloseInventory = true,
        ItemHover = true,
        ItemDrop = true,
        MoneyDrop = true,
        GoldDrop = true,
        PickUp = true,
    },

    -- =================== การล้างไอเท็ม อาวุธ เงิน ทอง ========================
    UseClearAll = false,
    OnPlayerRespawn = {
        Money = {
            JobLock = { "police", "doctor" },
            ClearMoney = true,
            MoneyPercentage = false,
        },
        Items = {
            JobLock = { "police", "doctor" },
            itemWhiteList = { "consumable_raspberrywater", "ammorevolvernormal" },
            AllItems = true,
        },
        Weapons = {
            JobLock = { "police", "doctor" },
            WeaponWhitelisted = { "WEAPON_MELEE_KNIFE", "WEAPON_BOW" },
            AllWeapons = true,
        },
        Ammo = {
            JobLock = { "police", "doctor" },
            AllAmmo = true,
        },
        Gold = {
            JobLock = { "police", "doctor" },
            ClearGold = false,
            GoldPercentage = false,
        },
    },

    -- =================== จำนวนอาวุธสูงสุด =========================
    MaxItemsInInventory = {
        Weapons = 100,
    },
    JobsAllowed = {
        police = 10,
    },

    -- =================== ไอเท็มเริ่มต้น ================================
    startItems = {
        consumable_raspberrywater = 2,
        ammorevolvernormal = 1,
    },
    startWeapons = {
        "WEAPON_MELEE_KNIFE"
    },

    -- =================== การกำหนดประเภทอาวุธ ==========================
    notweapons = {
        WEAPON_KIT_BINOCULARS_IMPROVED = true,
        WEAPON_KIT_BINOCULARS = true,
        WEAPON_FISHINGROD = true,
        WEAPON_KIT_CAMERA = true,
        WEAPON_KIT_CAMERA_ADVANCED = true,
        WEAPON_MELEE_LANTERN = true,
        WEAPON_MELEE_DAVY_LANTERN = true,
        WEAPON_MELEE_LANTERN_HALLOWEEN = true,
        WEAPON_KIT_METAL_DETECTOR = true,
        WEAPON_MELEE_HAMMER = true,
        WEAPON_MELEE_KNIFE = true,
    },

    nonAmmoThrowables = {
        WEAPON_MELEE_CLEAVER = true,
        WEAPON_MELEE_HATCHET = true,
        WEAPON_MELEE_HATCHET_HUNTER = true,
    },

    noSerialNumber = {
        WEAPON_MELEE_KNIFE = true,
        WEAPON_MELEE_KNIFE_JAWBONE = true,
        WEAPON_MELEE_KNIFE_TRADER = true,
        WEAPON_MELEE_KNIFE_CIVIL_WAR = true,
        WEAPON_MELEE_KNIFE_HORROR = true,
        WEAPON_MELEE_KNIFE_MINER = true,
        WEAPON_MELEE_KNIFE_RUSTIC = true,
        WEAPON_MELEE_KNIFE_VAMPIRE = true,
        WEAPON_MELEE_MACHETE = true,
        WEAPON_MELEE_MACHETE_COLLECTOR = true,
        WEAPON_MELEE_HAMMER = true,
        WEAPON_MELEE_TORCH = true,
        WEAPON_MELEE_CLEAVER = true,
        WEAPON_MELEE_HATCHET = true,
        WEAPON_MELEE_HATCHET_HUNTER = true,
        WEAPON_MELEE_HATCHET_DOUBLE_BIT = true,
        WEAPON_KIT_BINOCULARS_IMPROVED = true,
        WEAPON_KIT_BINOCULARS = true,
        WEAPON_KIT_CAMERA = true,
        WEAPON_KIT_CAMERA_ADVANCED = true,
        WEAPON_KIT_METAL_DETECTOR = true,
        WEAPON_MELEE_LANTERN = true,
        WEAPON_MELEE_DAVY_LANTERN = true,
        WEAPON_MELEE_LANTERN_HALLOWEEN = true,
        WEAPON_FISHINGROD = true,
        WEAPON_BOW = true,
        WEAPON_BOW_IMPROVED = true,
        WEAPON_LASSO = true,
        WEAPON_LASSO_REINFORCED = true,
        WEAPON_MOONSHINEJUG_MP = true,
    },

    UseWeaponModels = true,
    weaponAdjustments = {
        WEAPON_MELEE_KNIFE = 90.0,
        WEAPON_BOW = 90.0,
        WEAPON_BOW_IMPROVED = 90.0,
        WEAPON_MELEE_KNIFE_RUSTIC = 90.0,
        WEAPON_MELEE_KNIFE_HORROR = 90.0,
        WEAPON_MELEE_KNIFE_CIVIL_WAR = 90.0,
        WEAPON_MELEE_KNIFE_JAWBONE = 90.0,
        WEAPON_MELEE_KNIFE_MINER = 90.0,
        WEAPON_MELEE_KNIFE_VAMPIRE = 90.0,
        WEAPON_MELEE_HATCHET = 90.0,
        WEAPON_MELEE_HATCHET_HUNTER = 90.0,
        WEAPON_MELEE_HATCHET_DOUBLE_BIT = 90.0,
        WEAPON_MELEE_MACHETE_COLLECTOR = 90.0,
        WEAPON_MELEE_MACHETE = 90.0,
        WEAPON_MELEE_CLEAVER = 90.0,
        WEAPON_MELEE_HAMMER = 90.0,
        WEAPON_FISHINGROD = 90.0,
    },

    -- =================== ไอเท็มที่ตกพื้นและโมเดล ======================
    spawnableProps = {
        default_box = "p_cottonbox01x",
        money_bag = "p_moneybag02x",
        gold_bag = "s_pickup_goldbar01x",
    }
}
