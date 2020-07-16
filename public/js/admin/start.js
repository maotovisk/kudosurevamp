let items = null;
    let users = null;

    const getItemList = async () => {
        $(".admin-nav-link").removeClass("admin-nav-link-active")
        $("#admin-nav-items").addClass("admin-nav-link-active");
        let itemsResponse = await fetch("/api/item", {
            method: 'GET'
        });
        items = itemsResponse.text();
        items.then(value => {
            console.log(value)
            items = JSON.parse(value); 
            $(".admin-controller").html(`<div class="mx-3 my-1 d-flex mt-3"> 
                                         <div class="flex-grow-1"> 
                                            <input id="item-search" class="admin-input" type="text" placeholder="Search" aria-label="Search"> 
                                         </div>
                                         <div>
                                         <a class='btn btn-success button-buy ml-4 d-flex align-items-center' id='button-buy' onclick='createItem()'><span class="material-icons">
note_add
</span> <span class="ml-2">Create Item </span></a>
                                         </div>
                                         </div>`);
            $("#item-search").keyup(function() {
                renderList("item", ".admin-page", items.filter((x) => x.title.toLowerCase().includes($(this).val())));
            })
            renderList("item", ".admin-page", JSON.parse(value));
        })
    }

    const getUserList = async () => {
        $(".admin-nav-link").removeClass("admin-nav-link-active")
        $("#admin-nav-users").addClass("admin-nav-link-active");
        let usersResponse = await fetch("/api/user", {
            method: 'GET'
        });

        users = usersResponse.text();

        users.then(value => {
            console.log(value)
            users = JSON.parse(value); 
            $(".admin-controller").html(`<div class="mx-3 my-1"> <input id="user-search" class="admin-input" type="text" placeholder="Search" aria-label="Search"></div>`);  
            $("#user-search").keyup(function() {
                renderList("user", ".admin-page", users.filter((x) => x.username.toLowerCase().includes($(this).val().toLowerCase())));
            })
            renderList("user", ".admin-page", JSON.parse(value));
        })
    }
    $(document).ready(getItemList);

    $("#admin-nav-items").click(getItemList);
    $("#admin-nav-users").click(getUserList);

    // render funciton
    function renderList(type, element, json) {
        if (json == undefined)
            json = [];
        if (type == "item")  {
            $(element).html("");

            let rowNumber = 0;
            let firstRun = true;
            let itemsCount = 0;

            for (item of json) {

                    $(element).append(`

                    <div id='${item._id}' class='admin-item'>
                        <div class='admin-item-description'>      
                            <div class='admin-item-title'> 
                                ${item.title}
                            </div>

                            <div>
                                <img class='admin-item-image' src=' ${item.image_url}'/>
                            </div> 

                            <div>
                                Price: ${item.price} kudosu
                            </div> 
                        
                        </div> 

                        <div class='admin-item-control d-flex'>

                            <button class='btn btn-danger button-buy d-flex align-items-center' id='button-buy' onclick='deleteItem( \"${item._id}\")' data-origin='${item._id}'><span class="material-icons">delete_forever</span></button>
                            <button class='btn btn-success button-buy d-flex align-items-center ml-1' id='button-buy' onclick='editItem( \"${item._id}\")' data-origin='${item._id}'><span class="material-icons">edit</span></button>
                                   
                        </div> 

                    </div>`);
            }
        } 
        if (type == "user") {
            $(element).html("");


            for (user of json) {


                    $(element).append(`

                    <div id='${user._id}' class='admin-user'>
                        <div class='admin-user-description'>      
                            <div class='admin-user-title'> 
                                ${user.username}
                            </div>

                            <div>
                                <img class='admin-user-image' src='https://a.ppy.sh/${user.osu_id}'/>
                            </div> 

                            <div>
                                <p>${user.kudosu.total} total kudosu </p>
                                <p> Items: ${user.items.length} </p>
                            </div> 
                        
                        </div> 

                        <div class='admin-user-control'>

                            <button class='btn btn-secondary button-buy d-flex align-items-center' id='button-buy' onclick='detailUser( \"${user._id}\")' data-origin='${user._id}'><span class="material-icons">description</span>Details</button>
                                 
                        </div> 

                    </div>`);
            }
        }
    }