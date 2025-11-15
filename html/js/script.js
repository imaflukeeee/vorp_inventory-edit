$(document).ready(function () {
    /*// [MODIFIED] ทำให้หน้าต่างดีไซน์ใหม่ของคุณลากได้ โดยใช้ Header เป็นตัวจับ
    $("#inventoryHud").draggable({ handle: ".inventory-header" });
    $("#secondInventoryHud").draggable({ handle: ".inventory-header" });

    // [NEW FIX] ป้องกันการคลิกบน Currency/ID/Title ทำให้เกิด UI Glitch/Drag Start
    $("#title, #player-id, #cash, #gold, .currency-info, .player-name").on('mousedown', function(e) {
        e.stopPropagation();
    });*/
// [NEW] 1. ตรรกะสำหรับแถบค้นหา (Search Bar)
function setupSearch(inputId, gridId) {
    $(inputId).on("keyup", function () {
        let searchText = $(this).val().toLowerCase().trim();
        let activeTabTypes = Actions[$('.tab.active').data('param')]?.types || Actions.all.types;

        $(`${gridId} .item-card[data-group!="0"]`).each(function () {
            let itemLabel = $(this).data("label").toLowerCase();
            let itemGroup = $(this).data("group");

            // ตรวจสอบทั้ง Search Text และ Tab ที่เลือก
            let matchesSearch = itemLabel.includes(searchText);
            let matchesTab = activeTabTypes.includes(itemGroup);

            if (matchesSearch && matchesTab) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}
setupSearch("#main-search", "#inventoryElement");
setupSearch("#second-search", "#secondInventoryElement");


// [NEW] 2. ตรรกะสำหรับแถบ Opacity Slider
$(".opacity-slider").on("input", function () {
    let newValue = $(this).val(); // ค่า 10 - 100
    let newOpacity = newValue / 100; // แปลงเป็น 0.1 - 1.0

    // ทำให้ UI ทั้งสองมีความโปร่งใสเท่ากัน
    $(".inventory-container").css("opacity", newOpacity);

    // ทำให้ Slider ทั้งสองอันมีค่าตรงกัน
    $(".opacity-slider").val(newValue);

    // [FIX] อัปเดตตัวแปร CSS เพื่อให้ Dialog (กล่องเด้ง) มีความโปร่งใสตามไปด้วย
    document.documentElement.style.setProperty('--bg-glass', `rgba(20, 20, 20, ${newValue / 100 * 0.92})`); // (0.92 คือค่าทึบแสงเดิม)
});

    // [FIX] ตั้งค่า Opacity เริ่มต้นเมื่อโหลด
    let initialOpacity = $(".opacity-slider").val() / 100;
    $(".inventory-container").css("opacity", initialOpacity);
    document.documentElement.style.setProperty('--bg-glass', `rgba(20, 20, 20, ${initialOpacity * 0.92})`);
    // [KEPT] ซ่อน UI ทั้งหมดเมื่อเริ่ม
    $("#inventoryHud").hide();
    $("#secondInventoryHud").hide();
    $('#character-selection').hide();
    $('#disabler').hide();
    $('#transaction-loader').hide(); 

    // [KEPT] Logic การปิดหน้าต่าง (ESC)
    $("body").on("keyup", function (key) {
        if (Config.closeKeys.includes(key.which)) {
            if ($('#character-selection').is(":visible")) {
                $('#character-selection').hide();
                $('#disabler').hide();
            } else {
                closeInventory(); // (ฟังก์ชันนี้อยู่ใน utils.js)
                
                // [NEW] รีเซ็ต Tab ที่ Active เมื่อปิด
                document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
                document.querySelector(`#inventoryHud .tab[data-param="all"]`)?.classList.add('active');
                document.querySelector(`#secondInventoryHud .tab[data-param="all"]`)?.classList.add('active');
            }
        }
    });

    // [KEPT] เริ่มต้น Logic การลาก-วาง ของหน้าต่างที่สอง
    initSecondaryInventoryHandlers(); // (ฟังก์ชันนี้อยู่ใน secondaryInvScript.js)
});

// [KEPT] (ฟังก์ชันเดิม)
window.onload = initDivMouseOver;
let stopTooltip = false;

/**
 * [NEW] ฟังก์ชันจัดการตำแหน่งหน้าต่าง
 * @param {string} inv - "main" (1 หน้าต่าง) หรือ "second" (2 หน้าต่าง)
 */
function moveInventory(inv) {
    const inventoryHud = document.getElementById('inventoryHud');
    if (inv === 'main') {
        // 1. หน้าต่างหลักเปิด (แสดงผลกลางจอ)
        inventoryHud.style.left = '50%';
        inventoryHud.style.transform = 'translate(-50%, -50%)'; // จัดกลาง
        inventoryHud.style.right = 'auto';
        document.getElementById('secondInventoryHud').style.display = 'none'; // ซ่อนหน้าต่างรอง
    } else if (inv === 'second') {
        // 2. หน้าต่างที่สองเปิด (แสดงผลซ้าย-ขวา)
        inventoryHud.style.left = '3%'; 
        inventoryHud.style.transform = 'translateY(-50%)'; // ย้ายไปซ้าย
        inventoryHud.style.right = 'auto';
        document.getElementById('secondInventoryHud').style.display = 'block'; // แสดงหน้าต่างรอง (ทางขวา)
    }
}


// [MODIFIED] นี่คือส่วนที่รับข้อมูลจาก LUA
window.addEventListener('message', function (event) {
    const data = event.data; // [NEW]

    switch (data.action) {
        case "cacheImages":
            preloadImages(data.info); // (ฟังก์ชันนี้อยู่ใน invScript.js)
            break;

        case "initiate":
            LANGUAGE = data.language;
            LuaConfig = data.config;

            // [KEPT] คัดลอก Configs
            Config.UseGoldItem = LuaConfig.UseGoldItem;
            Config.AddGoldItem = LuaConfig.AddGoldItem;
            Config.AddDollarItem = LuaConfig.AddDollarItem;
            Config.AddAmmoItem = LuaConfig.AddAmmoItem;
            Config.DoubleClickToUse = LuaConfig.DoubleClickToUse;
            Config.UseRolItem = LuaConfig.UseRolItem;
            Config.WeightMeasure = LuaConfig.WeightMeasure;
            
            // [NEW] โหลดปุ่ม Filter (Tabs) (ฟังก์ชันนี้อยู่ใน invScript.js)
            loadActionsConfig().then(actionsConfig => {
                generateActionButtons(actionsConfig, 'inventory-tabs-main', 'inventoryElement', 'tab');
                generateActionButtons(actionsConfig, 'inventory-tabs-secondary', 'secondInventoryElement', 'tab');
                // ตั้งค่า 'all' เป็น Active เริ่มต้น
                document.querySelector(`#inventoryHud .tab[data-param="all"]`)?.classList.add('active');
                document.querySelector(`#secondInventoryHud .tab[data-param="all"]`)?.classList.add('active');
            }).catch(console.error);
            break; 

        case "reclabels": 
            ammolabels = data.labels;
            break;
        
        case "updateammo": 
            if (data.ammo) {
                allplayerammo = data.ammo;
            }
            break;

        case "updateStatusHud":
            // อัปเดตเงิน (เชื่อมกับ ID ใหม่)
            if (data.money || data.money === 0) {
                $("#money-value").text(parseFloat(data.money).toFixed(0)); 
            }
            // [FIX] อัปเดตทอง (ลบ Config check เพื่อให้ตัวเลขแสดงผลเสมอ)
            if (data.gold || data.gold === 0) {
                $("#gold-value").text(parseFloat(data.gold).toFixed(0)); 
            }
            // อัปเดต ID ผู้เล่น (เชื่อมกับ ID ใหม่)
            if (data.id) {
                $("#player-id").text("ID: " + data.id);
            }
            break;

        case "changecheck": 
            // [REMOVED] (ข้อ 4 & 10) ลบ Logic การอัปเดตน้ำหนักทั้งหมด
            // checkxy = data.check; 
            // infoxy = data.info;  
            // $('#check .weight-value').text(`${checkxy} / ${infoxy} ${Config.WeightMeasure}`);
            // let weightPercent = (parseFloat(checkxy) / parseFloat(infoxy)) * 100;
            // ...
            // $("#weight-progress").css("width", weightPercent + "%");
            break;

        case "display": 
            stopTooltip = false;

            // [FIX] รีเซ็ต Opacity กลับไปเป็น 100% ทุกครั้งที่เปิด
            const defaultOpacityValue = 100;
            const newOpacity = defaultOpacityValue / 100; // = 1.0

            $(".opacity-slider").val(defaultOpacityValue); // 1. รีเซ็ตแถบเลื่อน
            $(".inventory-container").css("opacity", newOpacity); // 2. รีเซ็ตความทึบ UI
            document.documentElement.style.setProperty('--bg-glass', `rgba(20, 20, 20, ${newOpacity * 0.92})`); // 3. รีเซ็ตความทึบ Dialog
            
            // [NEW] เรียกใช้ฟังก์ชันจัดตำแหน่งหน้าต่าง
            moveInventory(data.type === 'main' ? 'main' : 'second');

            $("#inventoryHud").fadeIn();
            
            type = data.type; 
            
            // [NEW] Logic สำหรับเช็คประเภท Inventory และส่งค่าไปยัง initiateSecondaryInventory
            const typeMap = {
                "player": "playerId",
                "custom": "customId",
                "horse": "horseid",
                "cart": "wagonid",
                "house": "houseId",
                "hideout": "hideoutid",
                "bank": "bankId",
                "clan": "clanid",
                "store": "StoreId",
                "steal": "stealid",
                "Container": "Containerid"
            };
            
            // Loop ตรวจสอบ type
            for (let key in typeMap) {
                if (data.type === key) {
                    // [FIX] แก้ไขการดึง ID ให้ถูกต้อง
                    window[typeMap[key]] = data[key] ?? data.id ?? data.horseid ?? data.wagonid ?? data.houseId ?? data.hideoutId ?? data.bankId ?? data.clanid ?? data.StoreId ?? data.stealid ?? data.Containerid ?? null;
                    
                    // เรียกใช้ฟังก์ชันเปิด Inventory รอง
                    initiateSecondaryInventory(data.title, data.capacity, data.weight ?? undefined);
                    break; 
                }
            }

            disabled = false; // [KEPT]
            
            if (data.autofocus == true) {
                $(document).on('keydown', function (event) {
                    // ( ... )
                });
            }
            break;
        
        case "hide": 
            $('.tooltip').remove();
            $("#inventoryHud").fadeOut();
            $("#secondInventoryHud").fadeOut(); 
            $(".controls").fadeOut();
            $(".site-cm-box").remove();
            if ($('#character-selection').is(":visible")) {
                $('#character-selection').hide();
                $('#disabler').hide();
            }
            dialog.close();
            stopTooltip = true;
            break;
    
        case "setItems": 
            TIME_NOW = data.timenow;

            inventorySetup(data.itemList); 

            if (type != "main") {
                $('.item-card').draggable({
                    helper: function() {
                        // สร้าง helper ที่เป็นแค่รูปภาพ
                        const itemImg = $(this).find('img').clone();
                        const helperDiv = $('<div class="drag-helper"></div>');
                        helperDiv.append(itemImg);
                        return helperDiv;
                    },
                    appendTo: 'body',
                    zIndex: 99999,
                    revert: 'invalid',
                    cursor: 'move',
                    cursorAt: { top: 35, left: 35 },
                    start: function (event, ui) {
                        if (disabled) return false;
                        stopTooltip = true;
                        itemData = $(this).data("item");
                        itemInventory = $(this).data("inventory");
                        $(this).addClass('dragging-item'); 
                    },
                    stop: function () {
                        stopTooltip = false;
                        $(this).removeClass('dragging-item'); 
                    }
                });
            }
            break;
    
        case "setSecondInventoryItems": 
            secondInventorySetup(data.itemList, data.info); 

            let l = data.itemList.length;
            let itemlist = data.itemList;
            let totalItems = 0;
            let totalWeight = 0;
            
            for (let p = 0; p < l; p++) {
                totalItems += Number(itemlist[p].count);
                if (itemlist[p].weight) {
                    totalWeight += (Number(itemlist[p].weight) * Number(itemlist[p].count));
                }
            }
            
            // ส่งจำนวน items ทั้งหมดและน้ำหนักไปอัปเดต slots display
            // ใช้ setTimeout เพื่อให้ DOM อัปเดตเสร็จก่อน
            setTimeout(function() {
                secondarySetCurrentCapacity(totalItems, totalWeight.toFixed(2)); 
            }, 100);
            break;

        case "nearPlayers": 
            if (data.what == "give") {
                selectPlayerToGive(data); 
            }
            break;
        
        case "transaction": 
            let t = data.type;
            if (t == 'started') {
                $('#loading-text').html(data.text);
                $('#transaction-loader').show(); 
            }
            if (t == 'completed') {
                $('#transaction-loader').hide();
            }
            break;
    }
}); 

window.addEventListener("offline", function () {
    closeInventory();
});