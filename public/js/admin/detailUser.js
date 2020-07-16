async function detailUser(user_id) {
    let user = users.find((a) => a._id == user_id);
    let htmlDetailItems = "";

    for(let item of user.items){

        htmlDetailItems += `
        
            <div class="admin-detail-item-list">Title: ${item.title}</div>

        `

    }

    let dialog = bootbox.dialog({
        title: user.username,
        message: `

            <div>

                <p>Total Kudosu: ${user.kudosu.total}</p>
                <p>Kudosu Available: ${user.kudosu.available}</p>
                <p>Kudosu Spent: ${user.currency.spent}</p>
                <p>Bonus Kudosu: ${user.currency.bonus}</p>

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