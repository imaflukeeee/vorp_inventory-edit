local Core <const>       = exports.vorp_core:GetCore()
local InventoryBeingUsed = {}
local T <const>          = TranslationInv.Langs[Lang]

if Config.DevMode then
    Log.Warning("^1[DEV] ^7You are in dev mode, dont use this in production live servers")
end

RegisterServerEvent("syn:stopscene")
AddEventHandler("syn:stopscene", function(x)
    local _source <const> = source
    TriggerClientEvent("inv:dropstatus", _source, x)
end)

RegisterServerEvent("vorpinventory:netduplog", function()
    local _source <const> = source
    local playername <const> = GetPlayerName(_source)
    local description <const> = Logs.NetDupWebHook.Language.descriptionstart .. playername .. Logs.NetDupWebHook.Language.descriptionend

    if Logs.NetDupWebHook.Active then
        local info <const> = {
            source = _source,
            title = Config.NetDupWebHook.Language.title,
            name = playername,
            description = description,
            webhook = Logs.NetDupWebHook.webhook,
            color = Logs.NetDupWebHook.color
        }
        SvUtils.SendDiscordWebhook(info)
    else
        print('[' .. Logs.NetDupWebHook.Language.title .. '] ', description)
    end
end)

RegisterServerEvent("vorp_inventory:Server:UnlockCustomInv", function()
    local _source <const> = source
    for i, value in pairs(InventoryBeingUsed) do
        if value == _source then
            InventoryBeingUsed[i] = nil
            break
        end
    end
end)

AddEventHandler('playerDropped', function()
    local _source <const> = source
    if _source then
        local user <const>    = Core.getUser(_source)
        local weapons <const> = UsersWeapons.default

        if AmmoData[_source] then
            AmmoData[_source] = nil
        end

        for i, value in pairs(InventoryBeingUsed) do
            if value == _source then
                InventoryBeingUsed[i] = nil
                break
            end
        end

        if not user then return end

        local charid <const> = user.getUsedCharacter.charIdentifier

        for key, value in pairs(weapons) do
            if value.charId == charid then
                UsersWeapons.default[key] = nil
                break
            end
        end
    end
end)

Core.Callback.Register("vorpinventory:get_slots", function(source, cb, _)
    local user <const> = Core.getUser(source)
    if not user then return end

    local character <const>      = user.getUsedCharacter
    local totalItems <const>     = InventoryAPI.getUserTotalCountItems(character.identifier, character.charIdentifier)
    local totalWeapons <const>   = InventoryAPI.getUserTotalCountWeapons(character.identifier, character.charIdentifier, true)
    local totalInvWeight <const> = (totalItems + totalWeapons)
    return cb({
        totalInvWeight = totalInvWeight,
        slots = character.invCapacity,
        money = character.money,
        gold = character.gold,
        rol = character.rol
    })
end)

Core.Callback.Register("vorp_inventory:Server:CanOpenCustom", function(source, cb, id)
    id = tostring(id)
    if not InventoryBeingUsed[id] then
        InventoryBeingUsed[id] = source
        return cb(true)
    end

    Core.NotifyObjective(source, T.SomeoneUseing, 5000)
    return cb(false)
end)

-- =========================================================================
-- == VORP INVENTORY NEW - SERVER-SIDE COMPATIBILITY LAYER
-- == (ตัวกลางเชื่อมสำหรับ Script เก่า)
-- ==
-- == โค้ดส่วนนี้จะดักจับ Server Event "เก่า" ที่ Script อื่นๆ 
-- == (เช่น vorp_banking, vorp_housing) เรียกใช้
-- == แล้วแปลงเป็น Client Event "ใหม่" ที่ NUIController.lua กำลังรอฟัง
-- =========================================================================

-- ตารางจับคู่: [อีเวนต์ Server "เก่า"] = [อีเวนต์ Client "ใหม่"]
local oldServerEventToNewClientEvent = {
    ["vorp_banking:server:OpenBankInventory"]   = "vorp_inventory:OpenBankInventory",
    ["vorp_housing:server:OpenHouseInventory"]  = "vorp_inventory:OpenHouseInventory",
    ["vorp_cart:server:OpenCartInventory"]      = "vorp_inventory:OpenCartInventory",
    ["vorp_steal:server:OpenstealInventory"]    = "vorp_inventory:OpenstealInventory",
    ["vorp_horse:server:OpenHorseInventory"]    = "vorp_inventory:OpenHorseInventory",
    ["vorp_store:server:OpenStoreInventory"]    = "vorp_inventory:OpenStoreInventory",
    ["vorp_hideout:server:OpenHideoutInventory"] = "vorp_inventory:OpenHideoutInventory",
    ["vorp_clan:server:OpenClanInventory"]       = "vorp_inventory:OpenClanInventory",
    ["vorp_container:server:OpenContainerInventory"] = "vorp_inventory:OpenContainerInventory"
}

-- วนลูปเพื่อลงทะเบียนตัวดักฟังทั้งหมด
for oldServerEvent, newClientEvent in pairs(oldServerEventToNewClientEvent) do
    RegisterNetEvent(oldServerEvent)
    AddEventHandler(oldServerEvent, function(...)
        -- เมื่อได้รับอีเวนต์ Server "เก่า"
        local src = source            -- เอา source ของผู้เล่นที่เรียกมา
        local args = {...}            -- เอา arguments ทั้งหมดที่ส่งมา (เช่น bankName, houseId)
        
        -- ยิงอีเวนต์ Client "ใหม่" กลับไปหาผู้เล่นคนนั้น
        -- NUIController.lua ที่ฝั่ง Client จะได้รับอีเวนต์นี้และเปิดหน้าต่างให้เอง
        TriggerClientEvent(newClientEvent, src, table.unpack(args))
    end)
end