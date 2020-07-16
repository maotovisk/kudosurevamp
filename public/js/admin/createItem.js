async function createItem() {
    
    let dialog = bootbox.dialog({
        title: 'Create Item',
        message: `
        <form action="" id="createItemForm" class="container">
            <div class="row">
                <div class="col-4">
                    <label for="item_name">Item Name</label>
                    <input class="admin-input" type="text" id="item_name" name="item_name" placeholder="Item Name">
                </div>
                <div class="col-2">
                    <label for="price">Price</label>
                    <input class="admin-input" type="text"  id="price" name="price" placeholder="500">
                </div>
                <div class="col-6">
                    <label for="image_url">Image URL</label>
                    <input type="text" class="admin-input" id="image_url" name="image_url" placeholder="https://seto.kousuke/nat.jpg">
                </div>
            </div>
            <div class="row mt-3">

                <div class="col-3">
                    <label for="user_role">User Role (Number)</label>
                    <input class="admin-input" type="text" id="user_role" name="user_role" placeholder="2">
                </div>

                <div class="col-4">
                    <label for="coin_type">Coin Type</label>
                    <select class="admin-input" id="coin_type" name="coin_type">
                        <option value="select">Select Option</option>
                        <option selected value="kudosu">Kudosu</option>
                        <option value="qactivity">QActivity</option>
                    </select>
                </div>

                <div class="col-5 d-flex align-text-bottom d-flex align-items-center justify-content-center">
                    <div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input" id="consumable" name="consumable">
                        <label class="custom-control-label" for="consumable">Is it consumable?</label>
                    </div>
                </div>

            </div>
            <input class="btn btn-primary ml-auto mt-4 px-4" type="submit" value="Create Item">
            <a id="btn-closemodal" class="btn btn-danger ml-auto mt-4 px-4">Cancel</a>
        </form>`,
size: 'large'
    })
    dialog.init();

    $("#btn-closemodal").click(()=> {
        dialog.modal('hide');
    })

$("#createItemForm").submit((event) => {

    //this function won't let the browser refresh or open a new tab
    event.preventDefault();

    let coinvar = document.getElementById("coin_type");
    let coinOption = coinvar.options[coinvar.selectedIndex].value;

    let consumablevar = document.getElementById("consumable");
    let consumableOption = consumablevar.value;

    /*
     * Validation process of form Create Item starts here
     */

    item_name_filtered = item_name.value.replace(/ /g, '');
    image_url_filtered = image_url.value.replace(/ /g, '');

    //removes all previously triggered errors

    if (document.getElementById("lowvalue")) document.getElementById("lowvalue").remove();
    if (document.getElementById("invalidname")) document.getElementById("invalidname").remove();
    if (document.getElementById("addcoin")) document.getElementById("addcoin").remove();
    if (document.getElementById("addconsumable")) document.getElementById("addconsumable").remove();
    if (document.getElementById("role")) document.getElementById("role").remove();
    if (document.getElementById("urlerror")) document.getElementById("urlerror").remove();

    //price validation

    let errors = false;

    if (price.value < 500 || Number.isInteger(parseInt(price.value)) == false) {

        errors = true;
        $(".error-class").append(` 
        
        <p id="lowvalue" style="color: red">Your price is too low or invalid, people should spend more points for them to be worth a reward</p>
        
        `);

    }

    //name validation

    if (item_name_filtered == null || item_name_filtered == "") {

        errors = true;
        $(".error-class").append(` 
        
        <p id="invalidname" style="color: red">Your item name is invalid!</p>
        
        `);

    }

    //coin validation

    if (coinOption == "select") {

        errors = true;
        $(".error-class").append(` 
        
        <p id="addcoin" style="color: red">You must select a coin option</p>
        
        `);

    }

    //image validation

    if (image_url_filtered == null || image_url_filtered == "") {

        errors = true;
        $(".error-class").append(` 
        
        <p id="urlerror" style="color: red">You must add an image link</p>
        
        `);

    }

    //consumable validation

    if (consumableOption == "select") {

        errors = true;
        $(".error-class").append(` 
        
        <p id="addconsumable" style="color: red">You must select if an item is consumable or not</p>
        
        `);

    }

    //role validation

    if (user_role.value == "" || Number.isInteger(parseInt(user_role.value)) == false) {
        console.log(user_role.value)

        errors = true;
        $(".error-class").append(` 
        
        <p id="role" style="color: red">User role is invalid</p>
        
        `);
    }

    if (!errors) {
        let form = document.getElementById('createItemForm')
        let formData = new FormData(form);
        let jsonData = Object.fromEntries(formData);
        let hostname = window.location.protocol;
        let headers = new Headers();
        headers.append("Content-Type", 'application/json');
        console.log(jsonData);
        let jsonRequest = {
            title: jsonData.item_name,
            image_url: jsonData.image_url,
            price: jsonData.price,
            is_consumable: (jsonData.is_consumable == 'on') ? true : false,
            user_role: jsonData.user_role //should default to zero
        }


        fetch(`${hostname}/api/item`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(jsonRequest)
            })
            .then(function (res) {
                return res.json();
            })
            .then(function (data) {
                console.log(data);
                if (data.error) {
                    dialog.find('.bootbox-body').append(`<div class="alert alert-danger">Error!</div>`);

                } else {
                    dialog.modal('hide');
                    bootbox.alert({
                            title: "Success!",
                            message: "You've successfully updated the item '" + jsonRequest.title +"'!"
                        });
                }
            }).catch((e) => {
                console.log(e)
                dialog.find('.bootbox-body').append(`<div class="alert alert-danger">Error!</div>`);

            });

    }

})


}