let imageCache = {};
let favoriteItems = JSON.parse(localStorage.getItem('vorp_inventory_favorites')) || [];

function updateFavoritesStorage() {
    localStorage.setItem('vorp_inventory_favorites', JSON.stringify(favoriteItems));
}

/**
 * [MODIFIED] Preload images (ทำให้การโหลดรูปภาพมีความยืดหยุ่นมากขึ้น)
 * @param {Array} images - The array of images to preload
 */
function preloadImages(images) {
    const promises = [];

    $.each(images, function (_, image) {
        if (imageCache[image]) return; // Skip if already cached
        
        const img = new Image();
        img.crossOrigin = "anonymous"; // ป้องกันปัญหา CORS

        const promise = new Promise((resolve) => {
            img.onload = () => {
                // [FIX] เก็บ Path ตรงๆ แทน url()
                imageCache[image] = `img/items/${image}.png`; 
                resolve();
            };
            img.onerror = () => {
                imageCache[image] = `img/items/placeholder.png`;
                resolve();
            };
            
            // ใช้ setTimeout เล็กน้อยเพื่อไม่ให้ main thread ถูกบล็อกนานเกินไป
            setTimeout(() => {
                img.src = `img/items/${image}.png`;
            }, 0);
        });
        promises.push(promise);
    });

    // ใช้ Promise.all เพื่อรอให้ทุกรูปถูกพยายามโหลด (สำเร็จ/ไม่สำเร็จ)
    return Promise.all(promises);
}


// [ADD-REVISED] ฟังก์ชันที่ขาดหายไป (จำเป็นสำหรับ utils.js)
function getItemDegradationPercentage(item) {
    if (item.maxDegradation === 0) return 1;
    const now = TIME_NOW
    const maxDegradeSeconds = item.maxDegradation * 60;
    const elapsedSeconds = now - item.degradation;
    const degradationPercentage = Math.max(0, ((maxDegradeSeconds - elapsedSeconds) / maxDegradeSeconds) * 100);
    return degradationPercentage;
}

// [ADD-REVISED] ฟังก์ชันที่ขาดหายไป (จำเป็นสำหรับ utils.js)
function getDegradationMain(item) {
    if (item.type === "item_weapon" || item.degradation === undefined || item.degradation === null || TIME_NOW === undefined) return "";
    const degradationPercentage = (item.percentage !== undefined && item.percentage !== null) ? item.percentage : getItemDegradationPercentage(item);
    const color = getColorForDegradation(degradationPercentage); // (ฟังก์ชันนี้อยู่ใน utils.js)
    return `<br>${LANGUAGE.labels.decay}<span style="color: ${color}">${degradationPercentage.toFixed(0)}%</span>`;
}


/* =================================
  FILTER / TAB LOGIC (MODIFIED)
  =================================
*/

// (ฟังก์ชันเดิม)
function bindButtonEventListeners() {
    document.querySelectorAll('#inventoryHud .tab[data-type="itemtype"]').forEach(button => {
        button.addEventListener('mouseenter', function () {
            OverSetTitle(this.getAttribute('data-param'));
            OverSetDesc(this.getAttribute('data-desc'));
        });
        button.addEventListener('mouseleave', function () {
            OverSetTitle(" ");
            OverSetDesc(" ");
        });
    });
}

// (ฟังก์ชันเดิม - ใช้กับหน้าต่างที่สอง)
function bindSecondButtonEventListeners() {
    document.querySelectorAll('#secondInventoryHud .tab[data-type="itemtype"]').forEach(button => {
        button.addEventListener('mouseenter', function () {
            OverSetTitleSecond(this.getAttribute('data-param'));
            OverSetDescSecond(this.getAttribute('data-desc'));
        });
        button.addEventListener('mouseleave', function () {
            OverSetTitleSecond(" ");
            OverSetDescSecond(" ");
        });
    });
}

// (ฟังก์ชันเดิม)
let actionsConfigLoaded; 
function loadActionsConfig() {
    if (!actionsConfigLoaded) {
        actionsConfigLoaded = new Promise((resolve, reject) => {
            fetch(`https://${GetParentResourceName()}/getActionsConfig`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' }
            })
            .then(response => response.json())
            .then(actionsConfig => {
                window.Actions = actionsConfig;
                resolve(actionsConfig);
            })
            .catch(error => reject(error));
        });
    }
    return actionsConfigLoaded;
}

/**
 * [FIXED] สร้างปุ่ม Filter (Tabs) - (ใช้ 6 หมวดหมู่ใหม่ + Icons และเรียงตามลำดับ)
 */
function generateActionButtons(actionsConfig, containerId, inventoryContext, buttonClass) {
    const container = document.getElementById(containerId);

    if (container) {
        container.innerHTML = ''; 
        
        // [NEW] กำหนดลำดับคีย์ (Tabs) ที่ต้องการตาม groups.lua
        const desiredOrder = [
            "all",
            "food",
            "consumables",
            "weapons",
            "tools",
            "etc",
            "apparel",
            "favorites" // หมวดหมู่ Favorites ที่เพิ่มล่าสุด
        ];

        // [MODIFIED] ใช้อาร์เรย์ desiredOrder ในการวนซ้ำแทน Object.keys()
        desiredOrder.forEach(key => {
            const action = actionsConfig[key];
            
            // ตรวจสอบว่า action นั้นมีอยู่ใน actionsConfig จริง
            if (!action) return; 

            const button = document.createElement('button');
            button.className = buttonClass; 
            button.type = 'button';
            button.setAttribute('data-type', 'itemtype');
            button.setAttribute('data-param', key);
            button.setAttribute('data-desc', action.desc);
            button.setAttribute('onclick', `action('itemtype', '${key}', '${inventoryContext}')`);
            
            // [NEW] สร้าง Icon (รูปภาพ)
            const icon = document.createElement('img');
            icon.src = `img/itemtypes/${action.img}`; // ใช้ img path จาก groups.lua
            icon.alt = key; // ใช้ key (เช่น 'weapons') เป็น alt text
            
            button.appendChild(icon); // เพิ่ม <img> เข้าไปใน <button>
            container.appendChild(button);
        });

        bindButtonEventListeners();
        bindSecondButtonEventListeners();
    }
}

/**
 * [FINAL FIXED] กรองไอเท็ม (ลบไอเท็มที่ไม่ตรงออกไปจาก DOM เมื่อมีการค้นหา)
 */
function action(type, param, inv) {
    if (type === 'itemtype') {
        const hudId = (inv === "inventoryElement") ? '#inventoryHud' : '#secondInventoryHud';
        
        document.querySelectorAll(`${hudId} .tab[data-type="itemtype"]`).forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`${hudId} .tab[data-param="${param}"][data-type="itemtype"]`);
        if (activeButton) activeButton.classList.add('active');

        // [FIXED] ต้องเรียก showItemsByType ตรงนี้
        if (param in Actions) {
            const action = Actions[param];
            showItemsByType(action.types, inv);
        } else {
            const defaultAction = Actions['all'];
            showItemsByType(defaultAction.types, inv);
        }
    } 
    // ... (ส่วนอื่น ๆ ของ action function ถ้ามี)
}

/**
 * [FINAL FIXED] กรองไอเท็ม (Aggressive Rerender - แก้ปัญหาช่องว่างจากการค้นหา)
 */
function showItemsByType(itemTypesToShow, inv) {
    
    // 1. ตรวจสอบสถานะการค้นหา
    let searchInputId = (inv === "inventoryElement") ? "#main-search" : "#second-search";
    let searchText = $(searchInputId).val().toLowerCase().trim();
    
    const isSearchActive = searchText.length > 0;
    const isFavoriteTab = itemTypesToShow.includes("favorites");
    const container = $(`#${inv}`);

    // 2. [AGGRESSIVE RESET] ล้าง DOM ทั้งหมด
    container.html(''); 

    let itemDiv = 0;
    
    // 3. กรองและวาดใหม่จากข้อมูลที่เรียงแล้ว (window.CurrentItems)
    if (window.CurrentItems && window.CurrentItems.length > 0) {
        
        const itemsToProcess = window.CurrentItems;
        
        itemsToProcess.forEach(item => {
            
            // ข้าม Money/Gold
            if (item.type === "item_money" || item.type === "item_gold") return; 

            // Get metadata required for filtering
            const itemLabel = getItemMetadataInfo(item, false).label.toLowerCase(); 
            // [FIX] ใช้ Number(item.group) เพื่อแก้ปัญหา String/Number Mismatch
            const numGroup = item.type != "item_weapon" ? (!item.group ? 1 : Number(item.group)) : 5; 
            
            // Check Tab Match
            let matchesTab = false;
            if (isFavoriteTab) {
                matchesTab = favoriteItems.includes(item.name);
            } else {
                matchesTab = itemTypesToShow.includes(numGroup);
            }

            // Check Search Match
            let matchesSearch = itemLabel.includes(searchText);

            // Final Condition
            let shouldShow = matchesTab;
            if (isSearchActive) {
                shouldShow = matchesTab && matchesSearch;
            }
            
            // 4. ถ้า Item ตรงตามเงื่อนไข ให้วาดใหม่
            if (shouldShow) {
                // loadInventoryItem function appends to container and calls addData (event binding)
                // itemDiv เป็น index ที่ปลอดภัยสำหรับการวาดใหม่
                if (loadInventoryItem(item, itemDiv)) {
                    itemDiv++;
                }
            }
        });
    }
    
    // 5. เติมช่องว่าง (Empty Slots)
    const minSlots = 40;
    if (itemDiv < minSlots) { 
        const emptySlots = minSlots - itemDiv;
        for (let i = 0; i < emptySlots; i++) {
            container.append(`<div data-group="0" class="item-card" style="background: var(--bg-card); border: 1px solid var(--border-color); cursor: default; box-shadow: none; user-select: none;"></div>`);
        }
    }
}

/**
 * [MODIFIED] สร้างไอเท็ม 1 ชิ้น (ข้อ 1)
 * @returns {boolean} - คืนค่า true ถ้าวาดไอเท็ม, false ถ้าข้าม
 */
function loadInventoryItem(item, index) {
    
    if (item.type === "item_money" || item.type === "item_gold") return false; 
    
    const count = item.count;
    const limit = item.limit; 
    const group = item.type != "item_weapon" ? (!item.group ? 1 : item.group) : 5;
    
    const { tooltipData, degradation, image, label, weight, description } = getItemMetadataInfo(item, false);
    
    const imageUrl = imageCache[image] || 'img/items/placeholder.png';
    // const itemWeight = (weight * count).toFixed(2); // [REMOVED] (ข้อ 6)
    
    // [MODIFIED] (ข้อ 7 & 9) - เพิ่มการแสดง 'x1' สำหรับอาวุธ
    let qtyDisplay = "";
    if (item.type == "item_weapon") {
        qtyDisplay = "x1";
    } else if (limit > 0) { // Stackable
        qtyDisplay = `${count} / ${limit}`;
    } else if (count > 1) { // Non-stackable
        qtyDisplay = `x${count}`;
    }
    // ถ้า count <= 1 (สำหรับ item ทั่วไป) qtyDisplay จะยังคงเป็น "" (ไม่แสดงผล)
    const isFav = favoriteItems.includes(item.name);
    const favDisplay = isFav ? 'block' : 'none';
    // [MODIFIED] (ข้อ 1, 5, 6, 7, 9)
    const itemHtml = `
        <div class="item-card" id="item-${index}" data-name="${item.name}" data-group='${group}' data-label='${label}' data-inventory="main" data-tooltip="Weight: ${weight} ${Config.WeightMeasure} ${degradation}">
            <img src="${imageUrl}" alt="${label}" onerror="fallbackImg(this)">
            
            ${qtyDisplay ? `<p class="item-qty">${qtyDisplay}</p>` : ""}

            <div class="favorite-icon" style="display: ${favDisplay}; position: absolute; top: 2px; right: 4px; z-index: 10;">
                <img src="img/itemtypes/favorite-mark.png" style="width: 12px; height: 12px;">
            </div>

            <p class="item-name">${label}</p>
            
            <div class="equipped-icon" style="display: ${!item.used && !item.used2 ? "none" : "block"};"></div>
        </div>
    `;
    
    $("#inventoryElement").append(itemHtml);

    addData(index, item);
    return true;
}


/**
 * [HEAVILY MODIFIED] ผูก Event ให้กับไอเท็ม (คลิก, ดับเบิลคลิก, ปุ่ม Action)
 */
/**
 * [HEAVILY MODIFIED] ผูก Event ให้กับไอเท็ม (คลิก, ดับเบิลคลิก, ปุ่ม Action)
 */
function addData(index, item) {
    const itemElement = $("#item-" + index);

    itemElement.data("item", item);
    itemElement.data("inventory", "main");

    // [REMOVED] (Desc on Click) ลบ Logic on('mouseenter') ออก
    /*
    itemElement.on('mouseenter', () => {
        // ...
    });
    */

    // 2. ดับเบิลคลิก
    if (Config.DoubleClickToUse) {
        itemElement.dblclick(function () {
            if (item.used || item.used2) {
                $(this).find('.equipped-icon').hide();
                $.post(`https://${GetParentResourceName()}/UnequipWeapon`, JSON.stringify({
                    item: item.name, id: item.id,
                }));
            } else {
                if (item.type == "item_weapon") {
                    $(this).find('.equipped-icon').show();
                }
                $.post(`https://${GetParentResourceName()}/UseItem`, JSON.stringify({
                    item: item.name, type: item.type, hash: item.hash, amount: item.count, id: item.id,
                }));
            }
        });
    }
    
    // 4. [NEW] คลิกซ้าย (แทนที่ Context Menu เดิม)
    itemElement.on('click', function() {
        // ไฮไลท์ไอเท็ม
        $('.item-card').removeClass('active');
        $(this).addClass('active');

        // [MODIFIED] (Desc on Click) อัปเดตข้อมูล Footer
        let { label, description } = getItemMetadataInfo(item, false);
        
        // [NEW] (Serial in Desc) เพิ่ม Serial ลงใน Description
        if (item.type == "item_weapon" && item.serial_number) {
            description += `<br><span class="serial-number">Serial: ${item.serial_number}</span>`;
        }
        
        OverSetTitle(label);
        OverSetDesc(description);
        
        // ล้างปุ่ม Action เก่า
        const actionButtons = $("#action-buttons");
        actionButtons.empty();

        // สร้างปุ่ม Action ใหม่จาก Logic เดิมของ VORP
        
        // --- ปุ่ม Use / Equip ---
        let lang = LANGUAGE.use;
        let actionFunc = function() {
            if (item.type == "item_weapon") $(this).find('.equipped-icon').show();
            $.post(`https://${GetParentResourceName()}/UseItem`, JSON.stringify({
                item: item.name, type: item.type, hash: item.hash, amount: item.count, id: item.id,
            }));
        };

        if (item.used || item.used2) {
            lang = LANGUAGE.unequip;
            actionFunc = function() {
                $(this).find('.equipped-icon').hide();
                $.post(`https://${GetParentResourceName()}/UnequipWeapon`, JSON.stringify({
                    item: item.name, id: item.id,
                }));
            };
        } else if (item.type == "item_weapon") {
            lang = LANGUAGE.equip;
        }

        actionButtons.append(
            $(`<button class="btn primary">${lang}</button>`).on('click', actionFunc)
        );

        // --- ปุ่ม Give & Drop (ถ้าไอเท็มอนุญาต) ---
        if (item.canRemove) {
            actionButtons.append(
                $(`<button class="btn">${LANGUAGE.give}</button>`).on('click', function() {
                    giveGetHowMany(item.name, item.type, item.hash, item.id, item.metadata, item.count);
                })
            );
            actionButtons.append(
                $(`<button class="btn">${LANGUAGE.drop}</button>`).on('click', function() {
                    dropGetHowMany(item.name, item.type, item.hash, item.id, item.metadata, item.count, item.degradation, item.percentage);
                })
            );
        }

        // [REMOVED] (Serial in Desc) ลบปุ่ม Copy Serial

        // --- ปุ่ม Custom Context (จาก `item.metadata.context`) ---
        if (item.metadata?.context) {
            item.metadata.context.forEach(option => {
                actionButtons.append(
                    $(`<button class="btn">${option.text}</button>`).on('click', function() {
                        option.itemid = item.id;
                        $.post(`https://${GetParentResourceName()}/ContextMenu`, JSON.stringify(option));
                    })
                );
            });
        }
    });

    // [NEW] คลิกขวาเพื่อ Add/Remove Favorite
    itemElement.on('contextmenu', function(e) {
        e.preventDefault(); // ปิดเมนูคลิกขวาของ Browser

        const name = item.name;
        const idx = favoriteItems.indexOf(name);
        const favIcon = $(this).find('.favorite-icon'); 

        if (idx > -1) {
            favoriteItems.splice(idx, 1);
            favIcon.hide();
        } else {
            favoriteItems.push(name);
            favIcon.show();
        }
        updateFavoritesStorage(); 

        // [MODIFIED] 1. ดึงค่าแท็บที่กำลังเปิดอยู่
        const activeTab = $('#inventoryHud .tab.active').data('param');

        // [MODIFIED] 2. สั่งวาดใหม่ และส่งค่า activeTab ที่ดึงมา
        if (window.CurrentItems) {
            inventorySetup(window.CurrentItems, activeTab); 
        }
    });
}

/**
 * [HEAVILY MODIFIED] ฟังก์ชันหลักในการวาด Inventory
 */
/**
 * [FINAL FIXED] ฟังก์ชันหลักในการวาด Inventory (แก้ไขการเก็บรายการที่เรียงแล้ว)
 */
function inventorySetup(items, activeTab) { // รับ activeTab เข้ามา
    $("#inventoryElement").html("");
    let divAmount = 0; 

    // 1. แยกรายการไอเท็มเป็น Favorites และ Non-Favorites
    let favoriteItemsList = [];
    let nonFavoriteItemsList = [];

    if (items.length > 0) {
        for (const item of items) {
            if (item) {
                if (favoriteItems.includes(item.name)) {
                    favoriteItemsList.push(item);
                } else {
                    nonFavoriteItemsList.push(item);
                }
            }
        }
    }

    // 2. เรียงลำดับใหม่
    const sortedItems = [...favoriteItemsList, ...nonFavoriteItemsList];
    
    // [CRITICAL FIX] เก็บรายการที่เรียงแล้วไว้ในตัวแปร Global
    window.CurrentItems = sortedItems; 

    // 3. วาดไอเท็มตามลำดับใหม่
    if (sortedItems.length > 0) {
        for (const [index, item] of sortedItems.entries()) {
            if (item) {
                if (loadInventoryItem(item, index)) { 
                    divAmount++;
                }
            }
        };
    }

    // [MODIFIED] กำหนด Tab ที่จะ Activate: ใช้ค่าที่ส่งมา ถ้าไม่มีให้ใช้ 'all'
    const tabToActivate = activeTab || 'all'; 
    action('itemtype', tabToActivate, 'inventoryElement'); 

    // [ADD-REVISED] ผูก Logic ไอเท็มพิเศษ (Gunbelt, Money, Gold)
    // ... (โค้ดส่วนนี้เป็นโค้ดเดิม) ...

    const gunbelt_label = LANGUAGE.gunbeltlabel;
    const gunbelt_desc = LANGUAGE.gunbeltdescription;
    var dataAmmo = []; 

    let empty = true;
    if (allplayerammo) {
        for (const [ind, tab] of Object.entries(allplayerammo)) {
            if (tab > 0) {
                empty = false;
                dataAmmo.push({ 
                    text: `${ammolabels[ind]} : ${tab}`,
                    action: function () {
                        giveammotoplayer(ind); 
                    },
                });
            }
        }
    }

    if (empty) {
        dataAmmo.push({
            text: LANGUAGE.empty,
            action: function () { },
        });
    }

    // [FIX] ITEM พิเศษ: Gunbelt
    if (Config.AddAmmoItem) {
        $("#ammobox").show(); 
        $("#ammobox").contextMenu([dataAmmo], { 
            offsetX: 1,
            offsetY: 1,
            // [NEW] (ข้อ 2) ลบเมนูอื่นก่อนแสดง
            beforeShow: function() { 
                $(".site-cm-box").remove(); 
                return true; 
            }
        });
        // [REMOVED] (Desc on Click) ลบ on('hover') ออก
    } else {
         $("#ammobox").hide();
    }


    // [ADD-REVISED] ผูก Logic ไอเท็มพิเศษ (Money)
    const m_item = "money";
    const m_label = LANGUAGE.inventorymoneylabel;
    const m_desc = LANGUAGE.inventorymoneydescription;
    var dataMoney = [];

    dataMoney.push({
        text: LANGUAGE.givemoney,
        action: function () {
            giveGetHowManyMoney(); 
        },
    });

    // [FIX] ITEM พิเศษ: Money
    $("#cash").show(); 
    if (Config.AddDollarItem) { 
        $("#cash").contextMenu([dataMoney], {
            offsetX: 1,
            offsetY: 1,
            // [NEW] (ข้อ 2) ลบเมนูอื่นก่อนแสดง
            beforeShow: function() { 
                $(".site-cm-box").remove(); 
                return true; 
            }
        });
        // [REMOVED] (Desc on Click) ลบ on('hover') ออก
    }


    // [ADD-REVISED] ผูก Logic ไอเท็มพิเศษ (Gold)
    const g_item = "gold";
    const g_label = LANGUAGE.inventorygoldlabel;
    const g_desc = LANGUAGE.inventorygolddescription;
    let dataGold = [];

    dataGold.push({
        text: LANGUAGE.givegold,
        action: function () {
            giveGetHowManyGold(); 
        },
    });

    $("#gold").show(); 
    if (Config.AddGoldItem) {
        $("#gold").contextMenu([dataGold], {
            offsetX: 1,
            offsetY: 1,
            // [NEW] (ข้อ 2) ลบเมนูอื่นก่อนแสดง
            beforeShow: function() { 
                $(".site-cm-box").remove(); 
                return true; 
            }
        });
        // [REMOVED] (Desc on Click) ลบ on('hover') ออก
    }
    // [FIX] ตรวจสอบ Config.UseGoldItem ด้วย
    if (!Config.UseGoldItem) {
        $("#gold").hide();
    }


    isOpen = true; 
    initDivMouseOver(); 

    // [MODIFIED] เติมช่องว่าง
    const minSlots = 40; 
    if (divAmount < minSlots) {
        const emptySlots = minSlots - divAmount;
        for (let i = 0; i < emptySlots; i++) {
            $("#inventoryElement").append(`<div data-group="0" class="item-card" style="background: var(--bg-card); border: 1px solid var(--border-color); cursor: default; box-shadow: none; user-select: none;"></div>`);
        }
    }
    
    // [NEW] ตั้งค่า draggable สำหรับ main inventory items (เมื่อมี secondary inventory เปิดอยู่)
    if (type != "main") {
        $('#inventoryElement .item-card[data-inventory="main"]').draggable({
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
}