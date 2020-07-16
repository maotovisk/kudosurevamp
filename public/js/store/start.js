let items = [];
let user = null;

let user_id = document.currentScript.getAttribute('user_id');

const getItemList = async () => {
    let itemsResponse = await fetch("/api/item", {
        method: 'GET'
    });
    let userResponse = await fetch("/api/user/" + user_id, {
        method: 'GET'
    });

    items = itemsResponse.text();
    user = userResponse.text();
    items.then(async value => {
        console.log(value)
        items = JSON.parse(value);
        user.then(async userValue => {
            user = JSON.parse(userValue);
            $(".controls").html(`<div class="mx-3 my-1 d-flex mt-3"> 
                                                <div class="flex-grow-1"> 
                                                <input id="item-search" class="admin-input" type="text" placeholder="Search" aria-label="Search"> 
                                                </div>
                                                </div>`);
            $("#item-search").keyup(function () {
                renderList("item", `.products-container`, items.filter((x) => x.title.toLowerCase().includes($(this).val())), user);;
            })
            renderList("item", `.products-container`, items, user);
        })
    })
}

const buyItem = (e) => {
    let productId = e;
    let clickedButton = $("button[data-origin='" + e + "']");
    let headers = new Headers();
    let hostname = window.location.protocol;

    let loading = `<span class="material-icons">refresh</span>`;
    clickedButton.html(loading);
    console.log(productId);
    fetch(`${hostname}/api/item/buy/${productId}`, {
        method: "POST",
        headers: headers
    })
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            console.log(data);
            if (data.error) {
                $("#alert").text("Something went wrong!");
                $("#alert").addClass("alert-danger");
                $("#alert").removeClass("alert-hidden");
                clickedButton.text("Unlock");
            } else {
                console.log(productId)
                let boughtItem = items.find((a) => (a._id == productId));

                $("#alert").text("You have unlocked the item '" + boughtItem.title + "'.");
                $("#alert").addClass("alert-success");
                $("#alert").removeClass("alert-hidden");

                clickedButton.text("Already Unlocked");
                clickedButton.addClass("disabled");
                clickedButton.removeClass("btn-danger")
                clickedButton.addClass("btn-primary");
                clickedButton.removeAttr("onclick");
            }
        }).catch((e) => {
            console.log(e)
            $("#alert").text("Something went wrong!");
            $("#alert").addClass("alert-danger");
            $("#alert").removeClass("alert-hidden");
        });
};


// render funciton
function renderList(type, element, json, user) {

    if (json == undefined) json = [];

    if (type == "item") {
        $(element).html("");

        for (item of json) {

            $(element).append(`

            <div id='${item._id}' class='product'>
                <div class='product-description'>
                    <div class='product-title'> 
                        ${item.title}
                    </div>
                    <div>
                        <img class='product-image' src=' ${item.image_url}'/>
                    </div> 
                    <div>
                        Unlock at ${item.price} kudosu
                    </div> 
                </div> 

                <div class='product-buy'>
                        ${ (!item.is_consumable ? ((user.items
                    .find((a) => a.title == item.title) == undefined) ? (
                        ((user.kudosu.total + user.currency.bonus >= item.price) ? `<button class='btn btn-danger button-buy' id='button-buy' onclick='buyItem(\"${item._id}\")' data-origin='${item._id}'>Unlock</button>`
                            : "<btn class='btn btn-primary disabled'>Not enough kudosu</btn>")) :
                    `<btn class='btn btn-primary disabled'>Already Unlocked</btn>`) : ((user.items
                        .find((a) => a.title == item.title) == undefined) ? (
                            ((user.kudosu.total - user.currency.spent + user.currency.bonus >= item.price) ? `<button class='btn btn-danger button-buy' id='button-buy' onclick='buyItem(\"${item._id}\")' data-origin='${item._id}'>Buy</button>`
                                : "<btn class='btn btn-primary disabled'>Not enough kudosu</btn>")) :
                        `<btn class='btn btn-primary disabled'>Already Bought</btn>`))}
                        
                </div> 

            </div>`);
        }
    }
}


$(document).ready(getItemList);
