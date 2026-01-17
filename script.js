function GetID(element) {
    return document.getElementById(element);
}
function GetClass(element) {
    return document.getElementsByClassName(element);
}

let game = {
    cookie_count: 0,
    total_cookies: 0,
    
    cookies_per_second: 0,
    cookies_per_click: 1,

    building_list: [],
    price_list: [],
    amount_to_buy: 1,
    max_to_buy: [],

    price_increase: 1.1,
    elder_pledge: 0,
};

let elements = {
    cost: GetClass("cost-span"),
    amount: GetClass("amount-span"),
    desc: GetClass("building-desc-span"),
    
    cookies: GetID("cookie-count-span"),
    total: GetID("total-cookies-span"),
    
    per_sec: GetID("cookies-per-second-span"),
    per_click: GetID("cookies-per-click-span"),

    buildings: GetClass("building"),
    buy_max: GetClass("max-amount"),
    buttons: GetClass("buy-multiple-button"),

    news: GetID("news"),
};

class Building {
    constructor(name, desc, cost, ID) {
        this.name = name;
        this.desc = desc;
        this.cost = cost;
        this.ID = ID;

        this.amount = 0;
        this.base = cost;

        game.building_list[ID] = this;
    }
    Buy() {
        if (game.cookie_count >= game.price_list[this.ID]) {
            let click_add_amount = game.amount_to_buy < 0 ? game.max_to_buy[this.ID] : game.amount_to_buy;
            for (let i = 0 ; i < click_add_amount ; i++) {
                this.amount += 1;
                if (this.amount % 25 == 0) {
                    game.cookies_per_click *= 2;
                } else {
                    game.cookies_per_click += 0.1;
                }
            }
            elements.per_click.textContent = Beautify(Math.round(game.cookies_per_click * 10) / 10);
            
            game.cookie_count -= game.price_list[this.ID];
            elements.cookies.textContent = Math.floor(game.cookie_count);
            
            elements.amount[this.ID].textContent = this.amount;

            CheckBuildingAvailability();
            GetCosts();

            UpdateCPS();
        }
    }
}

new Building("Cursor", "Autoclicks every 5 seconds.", 15, 0);
new Building("Grandma", "A nice grandma to bake more cookies.", 100, 1);
new Building("Factory", "Produces large quantities of cookies.", 500, 2);
new Building("Mine", "Mines out cookie dough and chocolate chips.", 2000, 3);
new Building("Shipment", "Brings in fresh cookies from the cookie planet.", 7000, 4);
new Building("Alchemy Lab", "Turns gold into cookies!", 50000, 5);
new Building("Portal", "Opens a door to the Cookieverse.", 1000000, 6);
new Building("Time Machine", "Brings cookies from the past, before they were even eaten.", 123456789, 7);

function Init() {
    for (let i = 0 ; i < game.building_list.length ; i++) {
        elements.cost[i].textContent = Beautify(game.building_list[i].cost);
        elements.desc[i].textContent = game.building_list[i].desc;
    }
    elements.buttons[0].disabled = true;
    elements.buttons[1].disabled = false;
    elements.buttons[2].disabled = false;

    for (let i = 0 ; i < elements.buy_max.length ; i++) {
        elements.buy_max[i].style.display = "none";
    }
}
Init();

function CalculateBuildingCost(base_price, building_number) {
    if (building_number <= 0) {
        return 0;
    } else if (building_number > 1) {
        building_number -= 1;
        base_price = Math.ceil(base_price * game.price_increase);
        return CalculateBuildingCost(base_price, building_number);
    } else {
        return base_price;
    }
}

function CalculateBuildingSum(base_price, amount_owned, amount_to_buy, sum) {
    let next_building_cost = CalculateBuildingCost(base_price, amount_owned + 1);
    sum += next_building_cost;
    
    amount_to_buy -= 1;
    if (amount_to_buy > 0) {
        return CalculateBuildingSum(base_price, amount_owned + 1, amount_to_buy, sum);
    } else {
        return sum;
    }
}

function BuyMax(base_price, current_amount, cash, amount_bought, sum) {
    let price_of_next = CalculateBuildingCost(base_price, current_amount + 1);
    if (cash >= price_of_next) {
        sum += price_of_next;
        cash -= price_of_next;
        current_amount += 1;
        amount_bought += 1;
        return BuyMax(base_price, current_amount, cash, amount_bought, sum);
    } else {
        return [amount_bought, sum];
    }
}

function Beautify(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function ClickCookie() {
    game.cookie_count += game.cookies_per_click;
    game.total_cookies += game.cookies_per_click;

    elements.cookies.textContent = Beautify(Math.floor(game.cookie_count));
    elements.total.textContent = Beautify(Math.floor(game.total_cookies));

    GetCosts();
    CheckBuildingAvailability();
}

function GetCosts() {
    game.price_list = [];
    game.max_to_buy = [];
    for (let i = 0 ; i < game.building_list.length ; i++) {
        if (game.amount_to_buy == 1) {
            game.price_list.push(CalculateBuildingCost(game.building_list[i].base, game.building_list[i].amount + 1));
        } else if (game.amount_to_buy == 10) {
            game.price_list.push(CalculateBuildingSum(game.building_list[i].base, game.building_list[i].amount, 10, 0));
        } else {
            game.price_list.push(BuyMax(game.building_list[i].base, game.building_list[i].amount, game.cookie_count, 0, 0)[1]);
            game.max_to_buy.push(BuyMax(game.building_list[i].base, game.building_list[i].amount, game.cookie_count, 0, 0)[0]);
        }

        elements.cost[i].textContent = Beautify(game.price_list[i]);
        CheckBuildingAvailability();
    }
    for (let i = 0 ; i < elements.buy_max.length ; i++) {
        elements.buy_max[i].textContent = game.max_to_buy[i];
    };
}
GetCosts();

for (let i = 0 ; i < elements.buttons.length ; i++) {
    elements.buttons[i].addEventListener("click", function() {
        game.amount_to_buy = i === 0 ? 1 : i === 1 ? 10 : -1;
        GetCosts();
        CheckBuildingAvailability();

        SetButtons(i);
    });
};

function SetButtons(button) {
    for (let i = 0 ; i < elements.buttons.length ; i++) {
        elements.buttons[i].disabled = false;
    }
    if (button == 2) {
        for (let i = 0 ; i < elements.buy_max.length ; i++) {
            elements.buy_max[i].style.display = "block";
        }
    } else {
        for (let i = 0 ; i < elements.buy_max.length ; i++) {
            elements.buy_max[i].style.display = "none";
        }
    }
    
    elements.buttons[button].disabled = true;
}

function CheckBuildingAvailability() {
    for (let i = 0 ; i < elements.buildings.length ; i++) {
        if ((game.price_list[i] <= game.cookie_count) && (game.price_list[i] != 0)) {
            elements.buildings[i].style.backgroundColor = "green";
        } else {
            elements.buildings[i].style.backgroundColor = "red";
        }
    }
}
CheckBuildingAvailability();

for (let i = 0 ; i < elements.buildings.length ; i++) {
    elements.buildings[i].addEventListener("click", function(e) {
        GetCosts();
        game.building_list[i].Buy();
    })
}

function UpdateCPS() {
    let cursor_CPS = 0.2;
    let grandma_CPS = 0.8;

    let CPS_list = [cursor_CPS, grandma_CPS, 4, 10, 20, 100, 6666 / 5, 123456 / 5];
    let CPS = 0;
    for (let i = 0 ; i < CPS_list.length ; i++) {
        CPS += game.building_list[i].amount * CPS_list[i];
    }
    elements.per_sec.textContent = Beautify(Math.round(CPS * 10) / 10);
    
    game.cookie_count += CPS;
    elements.cookies.textContent = Beautify(Math.floor(game.cookie_count));

    GetCosts();
    CheckBuildingAvailability();
}
setInterval(UpdateCPS, 1000);
































