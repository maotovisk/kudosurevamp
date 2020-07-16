async function deleteItem(item_id) {
    let item = items.find((a) => a._id == item_id);
    let toDeleteId = item_id;
    let clickedButton = $("button[data-origin='" + item_id + "']");

    bootbox.confirm({
        message: "Do you want to delete '" + item.title + "'?",
        buttons: {
            confirm: {
                label: 'Yes',
                className: 'btn-success'
            },
            cancel: {
                label: 'No',
                className: 'btn-danger'
            }
        },
        callback: (result) => {
            if (result == false)
                return;
            let headers = new Headers();
            headers.append("Content-Type", 'application/json');
            let hostname = window.location.protocol;
            let loading = `<span class="material-icons">refresh</span>`;
            let jsonRequest = {
                "item_id": item_id
            }

            clickedButton.html(loading);
            fetch(`${hostname}/api/item/delete`, {
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
                        clickedButton.text("Delete");
                        bootbox.alert({
                            size: "small",
                            title: "Error!",
                            message: "Something occourred while deleting the item!"
                        });
                    } else {
                        bootbox.alert({
                            size: "small",
                            title: "Success!",
                            message: "You've successfully deleted the item '" + item.title +"'!"
                        });
                        
                        $("#" + toDeleteId).remove();

                    }
                }).catch((e) => {
                    console.log(e)
                    bootbox.alert({
                            size: "small",
                            title: "Error!",
                            message: "Something occourred while deleting the item!"
                        });
                });
        }
    });
}