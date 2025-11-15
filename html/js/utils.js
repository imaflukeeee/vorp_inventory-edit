/* =================================
  UTILITY SCRIPT (MODIFIED)
  =================================
*/

// (ฟังก์ชันเดิม - ไม่แก้ไข)
function processEventValidation(ms = 1000) {
    isValidating = true;
    const timer = setTimeout(() => {
        isValidating = false;
        clearTimeout(timer);
    }, ms);
}
function isInt(n) { return n != "" && !isNaN(n) && Math.round(n) == n; }
function isFloat(n) { return Number(n) === n && n % 1 !== 0; }
// (สิ้นสุดฟังก์ชันเดิม)


// [MODIFIED] อัปเดต Footer หน้าต่างหลัก
function OverSetTitle(title) {
    document.getElementById("information").innerHTML = title || " ";
}
function OverSetDesc(title) {
    document.getElementById("description").innerHTML = title || " ";
}

// [MODIFIED] อัปเดต Footer หน้าต่างรอง
function OverSetTitleSecond(title) {
    document.getElementById("information2").innerHTML = title || " ";
}
function OverSetDescSecond(desc) {
    document.getElementById("description2").innerHTML = desc || " ";
}

// [MODIFIED] อัปเดตชื่อหน้าต่างรอง
function secondarySetTitle(title) {
    document.getElementById("titleHorse").innerHTML = title;
}

/**
 * [MODIFIED] แสดงความจุของ Secondary Inventory (แสดงเป็น Slots เหมือน vorp_banking)
 */
function secondarySetCurrentCapacity(cap, weight) {
    const capacityElement = $("#secondary-capacity");
    const capacityText = $("#secondary-capacity-text");
    
    // นับจำนวนไอเท็มที่ใช้อยู่ (นับจากจำนวน items ใน inventory)
    const itemCards = $('#secondInventoryElement .item-card[data-inventory="second"]');
    const usedSlots = itemCards.length;
    
    if (window.SecondaryWeight != null && weight != null) {
        // แสดงน้ำหนัก (Weight-based)
        const currentWeight = parseFloat(weight).toFixed(2);
        const maxWeight = parseFloat(window.SecondaryWeight).toFixed(2);
        const weightPercent = ((parseFloat(currentWeight) / parseFloat(window.SecondaryWeight)) * 100).toFixed(0);
        
        capacityText.html(`${currentWeight} / ${maxWeight} ${Config.WeightMeasure || 'kg'} (${weightPercent}%)`);
        capacityElement.show();
    } else if (window.SecondaryCapacity != null) {
        // แสดงจำนวน Slots (Capacity-based) - เหมือน vorp_banking
        const maxCapacity = parseInt(window.SecondaryCapacity) || 0;
        const slotsText = maxCapacity > 0 ? `${usedSlots} / ${maxCapacity} Slots` : `${usedSlots} Slots`;
        capacityText.html(slotsText);
        capacityElement.show();
    } else if (cap != null) {
        // ถ้าไม่มี maxCapacity แต่มี cap จาก server
        const maxSlots = parseInt(cap) || 0;
        const slotsText = maxSlots > 0 ? `${usedSlots} / ${maxSlots} Slots` : `${usedSlots} Slots`;
        capacityText.html(slotsText);
        capacityElement.show();
    } else {
        // แสดงแค่จำนวน slots ที่ใช้ (ถ้าไม่มีข้อมูล max capacity)
        capacityText.html(`${usedSlots} Slots`);
        capacityElement.show();
    }
}

/**
 * [MODIFIED] (ข้อ 10) ลบ Logic การอัปเดต UI น้ำหนักออก
 */
function secondarySetCapacity(cap, weight) {
    // [REMOVED] $(\".capacity\").show();
    
    // เก็บค่าสูงสุดไว้ในตัวแปร global เพื่อใช้คำนวณ %
    if (weight) {
        window.SecondaryWeight = parseFloat(weight).toFixed(2);
        window.SecondaryCapacity = null;
        // [REMOVED] $(\".capacity .weight-value\").text(...)
    } else {
        window.SecondaryWeight = null;
        window.SecondaryCapacity = cap;
        // [REMOVED] $(\".capacity .weight-value\").text(...)
    }
}

// (ฟังก์ชันเดิม - ไม่แก้ไข)
function getGroupKey(group) {
    let groupKey;
    if (window.Actions && Object.keys(window.Actions).length > 0) {
        groupKey = Object.keys(window.Actions).find(key =>
            key !== "all" && window.Actions[key].types.includes(group)
        );
    }
    return groupKey;
}
function getColorForDegradation(degradation) {
    if (degradation < 15) return "red";
    else if (degradation < 40) return "orange";
    else if (degradation < 70) return "gold";
    else return "green";
}
function cacheImage(item) {
    if (item.type === "item_weapon") return;
    const image = item.metadata?.image;
    if (image && imageCache[image] == null) {
        preloadImages([image]); // (ฟังก์ชันนี้อยู่ใน invScript.js)
    }
}
// (สิ้นสุดฟังก์ชันเดิม)


/**
 * [MODIFIED] - ฟังก์ชันสำคัญสำหรับดึงข้อมูลไอเท็ม
 * @param {object} item - ไอเท็มจาก VORP
 * @param {boolean} isCustom - true ถ้ามาจากหน้าต่างรอง
 * @returns {{ tooltipData: string, degradation: string, image: string, label: string, weight: number, description: string}}
 */
function getItemMetadataInfo(item, isCustom) {
    cacheImage(item); 

    const tooltipData = item.metadata?.tooltip ? "<br>" + item.metadata.tooltip : "";
    
    // [MODIFIED] เลือกใช้ getDegradationMain หรือ getDegradationCustom
    // [FIX] ตรวจสอบว่าฟังก์ชันมีอยู่จริงก่อนเรียกใช้ (ป้องกัน Error)
    let degradation = "";
    if (isCustom && typeof getDegradationCustom === "function") {
        degradation = getDegradationCustom(item); 
    } else if (!isCustom && typeof getDegradationMain === "function") {
        degradation = getDegradationMain(item);
    }

    // [MODIFIED] ลำดับการดึงข้อมูล (Metadata > ข้อมูล VORP)
    // คืนค่าเป็นชื่อไฟล์เท่านั้น (เช่น "beans")
    const image = (item.type !== "item_weapon")
        ? item.metadata?.image || item.name || "placeholder" // items
        : item.name || "placeholder"; // weapons

    const weight = item.metadata?.weight || item.weight || 0;

    const label = (item.type !== "item_weapon")
        ? item.metadata?.label || item.label // items
        : item?.custom_label || item.label; // weapons

    const description = (item.type !== "item_weapon")
        ? item.metadata?.description || item.desc // items
        : item?.custom_desc || item.desc; // weapons

    return { tooltipData, degradation, image, label, weight, description };
}

/**
 * [REMOVED] ฟังก์ชันนี้ไม่ถูกใช้ในดีไซน์ใหม่
 */
// function getItemTooltipContent(...) { ... }

/**
 * [MODIFIED] ตั้งค่าหน้าต่างที่สอง
 */
function initiateSecondaryInventory(title, capacity, weight) {
    
    // [REMOVED] ลบการสร้าง .controls และช่อง Search เดิม
    // $("#secondInventoryHud").append(...)
    // $("#secondarysearch").bind(...)

    secondarySetTitle(title); // อัปเดต Title ใน Header ใหม่

    // อัปเดต Capacity (แต่ไม่แสดงผล)
    if (capacity) {
        secondarySetCapacity(capacity, weight);
    } else {
        secondarySetCapacity("0")
    }
}

// (ฟังก์ชันเดิม - ไม่แก้ไข)
function initDivMouseOver() {
    if (isOpen === true) {
        var div = document.getElementById("inventoryElement");
        if (!div) return; // [ADD] ป้องกัน Error
        div.mouseIsOver = false;
        div.onmouseover = function () {
            this.mouseIsOver = true;
            $.post(`https://${GetParentResourceName()}/sound`);
        };
        div.onmouseout = function () {
            this.mouseIsOver = false;
        };
        div.onclick = function () {
            if (this.mouseIsOver) {
            }
        };
    }
}

function Interval(time) {
    var timer = false;
    this.start = function () {
        if (this.isRunning()) { clearInterval(timer); timer = false; }
        timer = setInterval(function () { disabled = false; }, time);
    };
    this.stop = function () { clearInterval(timer); timer = false; };
    this.isRunning = function () { return timer !== false; };
}

function disableInventory(ms) {
    disabled = true;
    if (disabledFunction === null) {
        disabledFunction = new Interval(ms);
        disabledFunction.start();
    } else {
        if (disabledFunction.isRunning()) { disabledFunction.stop(); }
        disabledFunction.start();
    }
}

function validatePlayerSelection(player) {
    const data = objToGive;
    secureCallbackToNui("vorp_inventory", "GiveItem", {
        player: player,
        data: data,
    });
    $("#disabler").hide();
    $("#character-selection").hide();
    objToGive = {};
}

function selectPlayerToGive(data) {
    $("#disabler").show();
    objToGive = {};
    objToGive = data; 
    const characters = data.players;
    $("#character-select-title").html(LANGUAGE.toplayerpromptitle);
    characters.sort((a, b) =>
        a.label.toString().localeCompare(b.label.toString())
    );
    $("#character-list").html("");
    characters.forEach((character) => {
        $("#character-list").append(
            `<li class="list-item" id="character-${character.player}" data-player="${character.player}" onclick="validatePlayerSelection(${character.player})">${character.label}</li>`
        );
    });
    $("#character-selection").show();
}

function closeCharacterSelection() {
    objToGive = {};
    $("#disabler").hide();
    $("#character-selection").hide();
}

function dropGetHowMany(item, type, hash, id, metadata, count, degradation) {
    if (type != "item_weapon") {
        if (count && count === 1) {
            secureCallbackToNui("vorp_inventory", "DropItem", {
                item: item, id: id, type: type, number: 1, metadata: metadata, degradation: degradation,
            });
        } else {
            const maxValue = (count && count > 0) ? count : null;
            
            dialog.prompt({
                title: LANGUAGE.prompttitle, 
                button: LANGUAGE.promptaccept, 
                required: true, 
                item: item, 
                type: type,
                maxValue: maxValue,
                input: { type: "number", autofocus: "true", value: "0" },
                validate: function (value, item, type) {
                    if (!value || value <= 0) { dialog.close(); return; }
                    if (type !== "item_money" && type !== "item_gold") { if (!isInt(value)) { return; } }
                    secureCallbackToNui("vorp_inventory", "DropItem", {
                        item: item, id: id, type: type, number: value, metadata: metadata, degradation: degradation,
                    });
                    return true;
                },
            });
        }
    } else {
        secureCallbackToNui("vorp_inventory", "DropItem", {
            item: item, type: type, hash: hash, id: parseInt(id),
        });
    }
}

function giveGetHowMany(item, type, hash, id, metadata, count) {
    if (type != "item_weapon") {
        if (count > 1) {
            const maxValue = count;
            dialog.prompt({
                title: LANGUAGE.prompttitle, 
                button: LANGUAGE.promptaccept, 
                required: false, 
                item: item, 
                type: type,
                maxValue: maxValue,
                input: { type: "number", autofocus: "true", value: "0" },
                validate: function (value, item, type) {
                    if (!value || value <= 0) { dialog.close(); return; }
                    if (!isInt(value)) { dialog.close(); return; }
                    $.post(`https://${GetParentResourceName()}/GetNearPlayers`, JSON.stringify({
                        type: type, what: "give", item: item, id: id, count: value, metadata: metadata,
                    }));
                    return true;
                },
            });
        } else {
            if (!count || count <= 0) return;
            if (!isInt(count)) return;
            $.post(`https://${GetParentResourceName()}/GetNearPlayers`, JSON.stringify({
                type: type, what: "give", item: item, id: id, count: count, metadata: metadata,
            }));
        }
    } else {
        $.post(`https://${GetParentResourceName()}/GetNearPlayers`, JSON.stringify({
                type: type, what: "give", item: item, hash: hash, id: parseInt(id),
            })
        );
    }
}

function giveGetHowManyMoney() {
    // Read the current cash amount from the UI
    const moneyString = $("#money-value").text().replace(/,/g, "");
    const maxValue = parseFloat(moneyString) || 0;

    dialog.prompt({
        title: LANGUAGE.prompttitle, 
        button: LANGUAGE.promptaccept, 
        required: true, 
        item: "money", 
        type: "item_money",
        maxValue: maxValue,
        input: { type: "number", autofocus: "true", value: "0" },
        validate: function (value, item, type) {
            const parsedValue = parseFloat(value);
            if (!value || parsedValue <= 0) { dialog.close(); return; }
            
            $.post(`https://${GetParentResourceName()}/GetNearPlayers`, JSON.stringify({
                type: type, what: "give", item: item, count: value,
            }));
            return true;
        },
    });
}
function giveammotoplayer(ammotype) {
    dialog.prompt({
        title: LANGUAGE.prompttitle, button: LANGUAGE.promptaccept, required: true, item: ammotype, type: "item_ammo",
        input: { type: "number", autofocus: "true", },
        validate: function (value, item, type) {
            if (!value || value <= 0) { dialog.close(); return; }
            if (!isInt(value)) { return; }
            $.post(`https://${GetParentResourceName()}/GetNearPlayers`, JSON.stringify({
                type: type, what: "give", item: item, count: value,
            }));
            return true;
        },
    });
}
function giveGetHowManyGold() {
    // Read the current gold amount from the UI
    const goldString = $("#gold-value").text().replace(/,/g, "");
    const maxValue = parseFloat(goldString) || 0;

    dialog.prompt({
        title: LANGUAGE.prompttitle, 
        button: LANGUAGE.promptaccept, 
        required: true, 
        item: "gold", 
        type: "item_gold",
        maxValue: maxValue,
        input: { type: "number", autofocus: "true", value: "0" },
        validate: function (value, item, type) {
            const parsedValue = parseFloat(value);
            if (!value || parsedValue <= 0) { dialog.close(); return; }
            
            $.post(`https://${GetParentResourceName()}/GetNearPlayers`, JSON.stringify({
                type: type, what: "give", item: item, count: value,
            }));
            return true;
        },
    });
}

// ... (โค้ดส่วนล่างของไฟล์เดิม)

/**
 * [MODIFIED] ฟังก์ชันปิด Inventory (เพิ่มการล้าง UI ใหม่)
 */
function closeInventory() {
    $('.tooltip').remove();
    $("#action-buttons").empty(); // [NEW] ล้างปุ่ม Action เมื่อปิด
    $('.item-card').removeClass('active'); // [NEW] ล้างการเลือกไอเท็ม
    OverSetTitle(" "); // [NEW] ล้าง Footer
    OverSetDesc(" "); // [NEW]
    OverSetTitleSecond(" "); // [NEW]
    OverSetDescSecond(" "); // [NEW]
    $.post(`https://${GetParentResourceName()}/NUIFocusOff`, JSON.stringify({}));
    isOpen = false;
}