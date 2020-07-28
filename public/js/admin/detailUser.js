let dialog = null;
async function detailUser(user_id) {
    let user = users.find((a) => a._id == user_id);
    let htmlDetailItems = "";

    for(let item of user.items){

        htmlDetailItems += `
        
            <div class="admin-detail-item-list d-flex justify-content-center">${item.title} <a class="link ml-auto mr-1" onclick="deleteItemFromUser('${item.item_id}', '${user._id}')"> <span class="material-icons">
            close
            </span> </a></div>

        `

    }

    dialog = bootbox.dialog({
        title: user.username,
        message: `

            <div>

                <div class="user-info-container mb-3">
                <p style="grid-area: tk">Total Kudosu: ${user.kudosu.total}</p>
                <p style="grid-area: ka">Kudosu Available: ${user.kudosu.available}</p>
                <p style="grid-area: ks">Kudosu Spent: ${user.currency.spent}</p>
                <p style="grid-area: bk">Bonus Kudosu: ${user.currency.bonus}</p>
                </div>

                <p>Items (${user.items.length}):</p>
                <div class="details-items d-flex-column">
                    
                    ${htmlDetailItems}

                </div>
            </div>
        
        
        `,
        buttons: {
            cancel: {
                label: 'Close',
                className: 'btn-secondary'
            }
        }
    })
    dialog.init();

    $("#btn-closemodal").click(()=> {
        dialog.modal('hide');
    })  
}

async function deleteItemFromUser(item_id, user_id) {
    let headers = new Headers();
    headers.append("Content-Type", 'application/json');
            let hostname = window.location.protocol;
            let jsonRequest = {
                "item_id": item_id
            }
    fetch(`${hostname}/api/user/${user_id}`, {
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
                    message: "You've successfully the item from the user!"
                });
            getUserList();
        }
    }).catch((e) => {
        console.log(e)
        dialog.find('.bootbox-body').append(`<div class="alert alert-danger">Error!</div>`);

    });
}