let imageCache = {};
let favoriteItems = JSON.parse(localStorage.getItem('vorp_inventory_favorites')) || [];

var Actions = {
    "all": {
        types: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        desc: "All items",
        img: "all.png"
    },
    "food": {
        types: [0, 2],
        desc: "Stores all food and consumable provisions.",
        img: "food.png"
    },
    "weapons": {
        types: [0, 5, 6],
        desc: "Stores all your weapons and ammunition.",
        img: "weapon.png"
    },
    "favorites": {
        types: ["favorites"],
        desc: "Your favorite items",
        img: "favorite.png"
    },
    "consumables": {
        types: [0, 3],
        desc: "Stores all types of medical items and tonics.",
        img: "medicine.png"
    },
    "apparel": {
        types: [0, 1],
        desc: "Stores all your clothing and apparel.",
        img: "shirts.png"
    },
    "etc": {
        types: [0, 7, 8, 9, 10, 11],
        desc: "Stores documents, animal parts, horse items, herbs, and valuables.",
        img: "etc.png"
    },
    "tools": {
        types: [0, 4],
        desc: "Stores all types of tools and materials.",
        img: "tools.png"
    }
};

function updateFavoritesStorage() {
    localStorage.setItem('vorp_inventory_favorites', JSON.stringify(favoriteItems));
}

function preloadImages(images) {
    const promises = [];

    $.each(images, function (_, image) {
        if (imageCache[image]) return; 
        
        const img = new Image();
        img.crossOrigin = "anonymous"; 

        const promise = new Promise((resolve) => {
            img.onload = () => {
                imageCache[image] = `img/items/${image}.png`; 
                resolve();
            };
            img.onerror = () => {
                imageCache[image] = `img/items/placeholder.png`;
                resolve();
            };
            
            setTimeout(() => {
                img.src = `img/items/${image}.png`;
            }, 0);
        });
        promises.push(promise);
    });

    return Promise.all(promises);
}

function getItemDegradationPercentage(item) {
    if (item.maxDegradation === 0) return 1;
    const now = TIME_NOW
    const maxDegradeSeconds = item.maxDegration * 60;
    const elapsedSeconds = now - item.degradation;
    const degradationPercentage = Math.max(0, ((maxDegradeSeconds - elapsedSeconds) / maxDegradeSeconds) * 100);
    return degradationPercentage;
}

function getDegradationMain(item) {
    if (item.type === "item_weapon" || item.degradation === undefined || item.degradation === null || TIME_NOW === undefined) return "";
    const degradationPercentage = (item.percentage !== undefined && item.percentage !== null) ? item.percentage : getItemDegradationPercentage(item);
    const color = getColorForDegradation(degradationPercentage); 
    return `<br>${LANGUAGE.labels.decay}<span style="color: ${color}">${degradationPercentage.toFixed(0)}%</span>`;
}


/* =================================
  FILTER / TAB LOGIC 
  =================================
*/

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

function generateActionButtons(actionsConfig, containerId, inventoryContext, buttonClass) {
    const container = document.getElementById(containerId);

    if (container) {
        container.innerHTML = ''; 
        
        const desiredOrder = [
            "all",
            "food",
            "consumables",
            "weapons",
            "tools",
            "etc",
            "apparel",
            "favorites" 
        ];

        desiredOrder.forEach(key => {
            const action = actionsConfig[key];
            
            if (!action) return; 

            const button = document.createElement('button');
            button.className = buttonClass; 
            button.type = 'button';
            button.setAttribute('data-type', 'itemtype');
            button.setAttribute('data-param', key);
            button.setAttribute('data-desc', action.desc);
            button.setAttribute('onclick', `action('itemtype', '${key}', '${inventoryContext}')`);
            
            const icon = document.createElement('img');
            icon.src = `img/itemtypes/${action.img}`; 
            icon.alt = key; 
            
            button.appendChild(icon); 
            container.appendChild(button);
        });

        bindButtonEventListeners();
        bindSecondButtonEventListeners();
    }
}

function action(type, param, inv) {
    if (type === 'itemtype') {
        const hudId = (inv === "inventoryElement") ? '#inventoryHud' : '#secondInventoryHud';
        document.querySelectorAll(`${hudId} .tab[data-type="itemtype"]`).forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`${hudId} .tab[data-param="${param}"][data-type="itemtype"]`);
        if (activeButton) activeButton.classList.add('active');
        let typesToShow;
        if (param in Actions) {
            typesToShow = Actions[param].types;
        } else {
            typesToShow = Actions['all'].types;
        }
        if (inv === "inventoryElement") {
            showItemsByType(typesToShow, inv);
        } else {
            if (typeof showSecondaryItemsByType === "function") {
                showSecondaryItemsByType(typesToShow);
            }
        }
    } 
}

function showItemsByType(itemTypesToShow, inv) {
    let searchInputId = (inv === "inventoryElement") ? "#main-search" : "#second-search";
    let searchText = $(searchInputId).val().toLowerCase().trim();
    const isSearchActive = searchText.length > 0;
    const isFavoriteTab = itemTypesToShow.includes("favorites");
    const container = $(`#${inv}`);
    container.html(''); 
    let itemDiv = 0;
    if (window.CurrentItems && window.CurrentItems.length > 0) {
        
        const itemsToProcess = window.CurrentItems;
        
        itemsToProcess.forEach(item => {
            
            if (item.type === "item_money" || item.type === "item_gold") return; 
            const itemLabel = getItemMetadataInfo(item, false).label.toLowerCase(); 
            const numGroup = item.type != "item_weapon" ? (!item.group ? 1 : Number(item.group)) : 5; 
            let matchesTab = false;
            if (isFavoriteTab) {
                matchesTab = favoriteItems.includes(item.name);
            } else {
                matchesTab = itemTypesToShow.includes(numGroup);
            }
            let matchesSearch = itemLabel.includes(searchText);
            let shouldShow = matchesTab;
            if (isSearchActive) {
                shouldShow = matchesTab && matchesSearch;
            }
            
            if (shouldShow) {
                if (loadInventoryItem(item, itemDiv)) {
                    itemDiv++;
                }
            }
        });
    }

    if (inv === "inventoryElement") {
        $('#inventoryElement .item-card[data-inventory="main"]').draggable({
            helper: function() {
                const itemImg = $(this).find('img').eq(0).clone();
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

function loadInventoryItem(item, index) {
    
    if (item.type === "item_money" || item.type === "item_gold") return false; 
    
    const count = item.count;
    const limit = item.limit; 
    const group = item.type != "item_weapon" ? (!item.group ? 1 : item.group) : 5;
    
    const { tooltipData, degradation, image, label, weight, description } = getItemMetadataInfo(item, false);
    
    const imageUrl = imageCache[image] || 'img/items/placeholder.png';
    
    let qtyDisplay = "";
    if (item.type == "item_weapon") {
        qtyDisplay = "x1";
    } else if (limit > 0) { 
        qtyDisplay = `${count} / ${limit}`;
    } else if (count > 1) { 
        qtyDisplay = `x${count}`;
    }
    const isFav = favoriteItems.includes(item.name);
    const favDisplay = isFav ? 'block' : 'none';
    const itemHtml = `
        <div class="item-card" id="item-${index}" data-name="${item.name}" data-group='${group}' data-label='${label}' data-inventory="main" data-tooltip="Weight: ${weight} ${Config.WeightMeasure} ${degradation}">
            <img class="item-image" src="${imageUrl}" alt="${label}" onerror="fallbackImg(this)">
            
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

function addData(index, item) {
    const itemElement = $("#item-" + index);

    itemElement.data("item", item);
    itemElement.data("inventory", "main");

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
    
    itemElement.on('click', function() {
        $('.item-card').removeClass('active');
        $(this).addClass('active');

        let { label, description } = getItemMetadataInfo(item, false);
        
        if (item.type == "item_weapon" && item.serial_number) {
            description += `<br><span class="serial-number">Serial: ${item.serial_number}</span>`;
        }
        
        OverSetTitle(label);
        OverSetDesc(description);
        
        const actionButtons = $("#action-buttons");
        actionButtons.empty();

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

    itemElement.on('contextmenu', function(e) {
        e.preventDefault(); 

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

        const activeTab = $('#inventoryHud .tab.active').data('param');

        if (window.CurrentItems) {
            inventorySetup(window.CurrentItems, activeTab); 
        }
    });
}

function inventorySetup(items, activeTab) { 
    $("#inventoryElement").html("");
    let divAmount = 0; 

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

    const sortedItems = [...favoriteItemsList, ...nonFavoriteItemsList];
    
    window.CurrentItems = sortedItems; 

    if (sortedItems.length > 0) {
        for (const [index, item] of sortedItems.entries()) {
            if (item) {
                if (loadInventoryItem(item, index)) { 
                    divAmount++;
                }
            }
        };
    }

    const tabToActivate = activeTab || 'all'; 
    action('itemtype', tabToActivate, 'inventoryElement'); 

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

    if (Config.AddAmmoItem) {
        $("#ammobox").show(); 
        $("#ammobox").contextMenu([dataAmmo], { 
            offsetX: 1,
            offsetY: 1,
            beforeShow: function() { 
                $(".site-cm-box").remove(); 
                return true; 
            }
        });
    } else {
         $("#ammobox").hide();
    }


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

    $("#cash").show(); 
    if (Config.AddDollarItem) { 
        $("#cash").contextMenu([dataMoney], {
            offsetX: 1,
            offsetY: 1,
            beforeShow: function() { 
                $(".site-cm-box").remove(); 
                return true; 
            }
        });
    }


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
            beforeShow: function() { 
                $(".site-cm-box").remove(); 
                return true; 
            }
        });
    }
    if (!Config.UseGoldItem) {
        $("#gold").hide();
    }


    isOpen = true; 
    initDivMouseOver(); 

    // *** ลบ Logic สร้างช่องว่างที่นี่ ***
    
    if (type != "main") {
        $('#inventoryElement .item-card[data-inventory="main"]').draggable({
            helper: function() {
                const itemImg = $(this).find('img').eq(0).clone();
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