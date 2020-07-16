$("#createItemForm").submit(e => {

    //this function won't let the browser refresh or open a new tab
    e.preventDefault();

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
                    bootbox.alert({
                            size: "small",
                            title: "Error!",
                            message: "Something occourred while adding the item!"
                        });

                } else {
                    bootbox.alert({
                            size: "small",
                            title: "Success!",
                            message: "You've successfully added the item '" + jsonRequest.title +"'!"
                        });
                }
            }).catch((e) => {
                console.log(e)
                bootbox.alert({
                            size: "small",
                            title: "Error!",
                            message: "Something occourred while adding the item!"
                        });
            });

    }

})