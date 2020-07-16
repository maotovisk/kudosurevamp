async function editItem(item_id) {
    let item = items.find((a) => a._id == item_id);
    let dialog = bootbox.dialog({
        title: 'Edit Item',
        message: `
        <form action="" id="editItemForm" class="container">
            <div class="row">
                <div class="col-4">
                    <label for="item_name">Item Name</label>
                    <input class="admin-input" type="text" id="item_name" value="${item.title}" name="item_name" placeholder="Item Name">
                </div>
                <div class="col-2">
                    <label for="price">Price</label>
                    <input class="admin-input" type="text" value="${item.price}" id="price" name="price" placeholder="500">
                </div>
                <div class="col-6">
                    <label for="image_url">Image URL</label>
                    <input type="text" class="admin-input" id="image_url" name="image_url" value="${item.image_url}" placeholder="https://seto.kousuke/nat.jpg">
                </div>
            </div>
            <div class="row mt-3">

                <div class="col-3">
                    <label for="user_role">User Role (Number)</label>
                    <input class="admin-input" type="text" id="user_role" value="${item.user_role == undefined ? 0 : item.user_role}" name="user_role" placeholder="2">
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
                        <input type="checkbox" ${item.is_consumable == true ? "checked" : ""} class="custom-control-input" id="consumable" name="consumable">
                        <label class="custom-control-label" for="consumable">Is it consumable?</label>
                    </div>
                </div>

            </div>
            <input class="btn btn-primary ml-auto mt-4 px-4" type="submit" value="Update Item">
            <a id="btn-closemodal" class="btn btn-danger ml-auto mt-4 px-4">Cancel</a>
        </form>`,
size: 'large'
    })
    dialog.init();

    $("#btn-closemodal").click(()=> {
        dialog.modal('hide');
    })
    $("#editItemForm").submit((event) => {
        event.preventDefault();
        
        let form = document.getElementById('editItemForm')
        let formData = new FormData(form);
        let jsonData = Object.fromEntries(formData);
        let hostname = window.location.protocol;
        let headers = new Headers();
        headers.append("Content-Type", 'application/json');
        console.log(jsonData);
        let jsonRequest = {
            item_id: item_id,
            title: jsonData.item_name,
            image_url: jsonData.image_url,
            price: jsonData.price,
            is_consumable: (jsonData.is_consumable == 'on') ? true : false,
            user_role: jsonData.user_role //should default to zero
        }


        fetch(`${hostname}/api/item/update`, {
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

    })
}