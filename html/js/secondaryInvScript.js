function PostActionPostQty(eventName, itemData, id, propertyName, qty, info) {
    if (isValidating) return;
    processEventValidation();
    $.post(`https://${GetParentResourceName()}/${eventName}`,
        JSON.stringify({
            item: itemData,
            type: itemData.type,
            number: qty,
            [propertyName]: id,
            info: info
        })
    );
}

let isShiftActive = false
document.onkeydown = function (e) { isShiftActive = e.shiftKey };
document.onkeyup = function (e) { isShiftActive = e.shiftKey };

function PostAction(eventName, itemData, id, propertyName, info) {
    disableInventory(500);
    if (itemData.type != "item_weapon") {
        if (itemData.count === 1 || isShiftActive === true) {
            let qty = (isShiftActive) ? itemData.count : 1;
            PostActionPostQty(eventName, itemData, id, propertyName, qty, info);
            return;
        }
        dialog.prompt({
            title: LANGUAGE.prompttitle,
            button: LANGUAGE.promptaccept,
            required: true,
            item: itemData,
            type: itemData.type,
            maxValue: itemData.count,
            input: { type: "number", autofocus: "true" },
            validate: function (value, item, type) {
                if (!value || value <= 0 || value > Config.MaxItemTransferAmount || !isInt(value)) {
                    $.post(`https://${GetParentResourceName()}/TransferLimitExceeded`, JSON.stringify({
                        max: Config.MaxItemTransferAmount
                    }));
                    dialog.close();
                } else {
                    PostActionPostQty(eventName, itemData, id, propertyName, value, info);
                }
            },
        });
    } else {
        PostActionPostQty(eventName, itemData, id, propertyName, 1, info);
    }
}

const ActionTakeList = {
    custom: { action: "TakeFromCustom", id: () => customId, customtype: "id" },
    player: { action: "TakeFromPlayer", id: () => playerId, customtype: "player" },
    cart: { action: "TakeFromCart", id: () => wagonid, customtype: "wagon" },
    house: { action: "TakeFromHouse", id: () => houseId, customtype: "house" },
    hideout: { action: "TakeFromHideout", id: () => hideoutId, customtype: "hideout" },
    bank: { action: "TakeFromBank", id: () => bankId, customtype: "bank" },
    clan: { action: "TakeFromClan", id: () => clanid, customtype: "clan" },
    steal: { action: "TakeFromsteal", id: () => stealid, customtype: "steal" },
    Container: { action: "TakeFromContainer", id: () => Containerid, customtype: "Container" },
    horse: { action: "TakeFromHorse", id: () => horseid, customtype: "horse" },
};
const ActionMoveList = {
    custom: { action: "MoveToCustom", id: () => customId, customtype: "id" },
    player: { action: "MoveToPlayer", id: () => playerId, customtype: "player" },
    cart: { action: "MoveToCart", id: () => wagonid, customtype: "wagon" },
    house: { action: "MoveToHouse", id: () => houseId, customtype: "house" },
    hideout: { action: "MoveToHideout", id: () => hideoutId, customtype: "hideout" },
    bank: { action: "MoveToBank", id: () => bankId, customtype: "bank" },
    clan: { action: "MoveToClan", id: () => clanid, customtype: "clan" },
    steal: { action: "MoveTosteal", id: () => stealid, customtype: "steal" },
    Container: { action: "MoveToContainer", id: () => Containerid, customtype: "Container" },
    horse: { action: "MoveToHorse", id: () => horseid, customtype: "horse" },
};
function takeFromStoreWithPrice(itemData, qty) {
    if (isValidating) return;
    processEventValidation();
    $.post(`https://${GetParentResourceName()}/TakeFromStore`, JSON.stringify({
        item: itemData, type: itemData.type, number: qty, price: itemData.price, geninfo: geninfo, store: StoreId,
    }));
}


function initSecondaryInventoryHandlers() {
    
    $("#inventoryElement").droppable({
        accept: '.item-card[data-inventory="second"]',
        tolerance: 'pointer',
        drop: function (_, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");
            var info = $("#secondInventoryElement").data("info");

            if (!itemData || !itemInventory) return;

            if (itemInventory === "second") { 
                if (type in ActionTakeList) {
                    const { action, id, customtype } = ActionTakeList[type];
                    const Id = id();
                    PostAction(action, itemData, Id, customtype, info);
                } else if (type === "store") {
                    disableInventory(500);
                    if (itemData.type != "item_weapon") {
                        if (itemData.count === 1 || isShiftActive === true) {
                            let qty = (isShiftActive) ? itemData.count : 1;
                            takeFromStoreWithPrice(itemData, qty);
                            return;
                        }
                        dialog.prompt({
                            title: LANGUAGE.prompttitle, button: LANGUAGE.promptaccept, required: true, item: itemData, type: itemData.type,
                            maxValue: itemData.count,
                            input: { type: "number", autofocus: "true" },
                            validate: function (value) {
                                if (!value) { dialog.close(); return; }
                                if (!isInt(value)) { return; }
                                takeFromStoreWithPrice(itemData, value);
                            },
                        });
                    } else {
                        let qty = 1;
                        takeFromStoreWithPrice(itemData, qty);
                    }
                }
            }
        },
    });

    function moveToStore(itemData, qty) {
        if (isValidating) return;
        processEventValidation();
        $.post(`https://${GetParentResourceName()}/MoveToStore`, JSON.stringify({
            item: itemData, type: itemData.type, number: qty, geninfo: geninfo, store: StoreId,
        }));
    }
    function moveToStoreWithPrice(itemData, qty, price) {
        if (isValidating) return;
        processEventValidation();
        $.post(`https://${GetParentResourceName()}/MoveToStore`, JSON.stringify({
            item: itemData, type: itemData.type, number: qty, price: price, geninfo: geninfo, store: StoreId,
        }));
    }
    function moveToStorePriceDialog(itemData, qty) {
        if (isValidating) return;
        processEventValidation();
        dialog.prompt({
            title: LANGUAGE.prompttitle2, button: LANGUAGE.promptaccept, required: true, item: itemData, type: itemData.type,
            input: { type: "number", autofocus: "true" },
            validate: function (value2, item, type) {
                if (!value2) { dialog.close(); return; }
                moveToStoreWithPrice(itemData, qty, value2);
            },
        });
    }

    $("#secondInventoryElement").droppable({
        accept: '.item-card[data-inventory="main"]',
        tolerance: 'pointer',
        drop: function (_, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");
            var info = $(this).data("info");

            if (!itemData || !itemInventory) return;

            if (itemInventory === "main") { 
                if (type in ActionMoveList) {
                    const { action, id, customtype } = ActionMoveList[type];
                    const Id = id();
                    PostAction(action, itemData, Id, customtype, info);
                } else if (type === "store") {
                    disableInventory(500);
                    if (itemData.type != "item_weapon") {
                        if (itemData.count === 1 || isShiftActive === true) {
                            let qty = (isShiftActive) ? itemData.count : 1;
                            if (geninfo.isowner != 0) { moveToStorePriceDialog(itemData, qty); } else { moveToStore(itemData, qty); }
                            return;
                        }
                        dialog.prompt({
                            title: LANGUAGE.prompttitle, button: LANGUAGE.promptaccept, required: true, item: itemData, type: itemData.type,
                            input: { type: "number", autofocus: "true" },
                            validate: function (value, item, type) {
                                if (!value) { dialog.close(); return; }
                                if (!isInt(value)) { return; }
                                if (geninfo.isowner != 0) { moveToStorePriceDialog(itemData, value); } else { moveToStore(itemData, value); }
                            },
                        });
                    } else {
                        let qty = 1;
                        if (geninfo.isowner != 0) { moveToStorePriceDialog(itemData, qty); } else { moveToStore(itemData, qty); }
                    }
                }
            }
        },
    });
}

function addDataToCustomInv(item, index) {
    const itemElement = $("#item-" + index);

    itemElement.data("item", item);
    itemElement.data("inventory", "second"); 

    itemElement.on('mouseleave', () => {
        /* ไม่ต้องลบออก */
    });

    itemElement.on('click', function() {
        $('#secondInventoryHud .item-card').removeClass('active');
        $(this).addClass('active');

        let { label, description } = getItemMetadataInfo(item, true); 
        if (item.type == "item_weapon" && item.serial_number) {
            description += `<br><span class="serial-number">Serial: ${item.serial_number}</span>`;
        }
        
        OverSetTitleSecond(label);
        OverSetDescSecond(description);
        
        $("#action-buttons").empty();
        $('#inventoryHud .item-card').removeClass('active');
    });
}

function getDegradationCustom(item) {
    if (item.type === "item_weapon" || item.degradation === undefined || item.degradation === null || item.percentage === undefined || item.percentage === null) return "";
    const degradationPercentage = item.percentage
    const color = getColorForDegradation(degradationPercentage); 
    return `<br>${LANGUAGE.labels.decay}<span style="color: ${color}">${degradationPercentage.toFixed(0)}%</span>`;
}

function loadCustomInventoryItem(item, index) {
    const count = item.count;
    const limit = item.limit; 
    const group = item.type != "item_weapon" ? (!item.group ? 1 : item.group) : 5;

    const { tooltipData, degradation, image, label, weight, description } = getItemMetadataInfo(item, true); 

    const imageUrl = imageCache[image] || 'img/items/placeholder.png';
    
    let qtyDisplay = "";
    if (item.type == "item_weapon") {
        qtyDisplay = "x1";
    } else if (limit > 0) { 
        qtyDisplay = `${count}`;
    } else if (count > 1) { 
        qtyDisplay = `x${count}`;
    }

    const itemHtml = `
        <div class="item-card" id="item-${index}" data-group='${group}' data-label='${label}' data-inventory="second">
            <img src="${imageUrl}" alt="${label}" onerror="fallbackImg(this)">
            <p class="item-name">${label}</p>
            ${qtyDisplay ? `<p class="item-qty">${qtyDisplay}</p>` : ""}
            </div>
    `;
    
    $("#secondInventoryElement").append(itemHtml);

    addDataToCustomInv(item, index);
    return true; 
}

function secondInventorySetup(items, info) {
    $("#inventoryElement").html("");
    $("#secondInventoryElement").html("").data("info", info);
    CurrentSecondaryItems = items; 
    var divCount = 0; 
    if (items.length > 0) {
        for (const [index, item] of items.entries()) {
            if (item) {
                if (item.type === "item_money" || item.type === "item_gold") continue;
                if (loadCustomInventoryItem(item, index)) { 
                    divCount++;
                }
            }
        };
    }
    $('#secondInventoryElement .item-card[data-inventory="second"]').draggable({
        helper: function() {
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