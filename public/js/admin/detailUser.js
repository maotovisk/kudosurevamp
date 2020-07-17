async function detailUser(user_id) {
    let user = users.find((a) => a._id == user_id);
    let htmlDetailItems = "";

    for(let item of user.items){

        htmlDetailItems += `
        
            <div class="admin-detail-item-list">${item.title}</div>

        `

    }

    let dialog = bootbox.dialog({
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