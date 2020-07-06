// ==UserScript==
// @name         Kudosu Revamp
// @namespace    http://kudosu.maot.dev/
// @version      0.1
// @description  giving kudosu a utility!
// @author       Maot, Trynna
// @match        https://osu.ppy.sh/users/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      kudosu.maot.dev
// ==/UserScript==

(function () {
    'use strict'
    const hostname = "https://kudosu.maot.dev"
    const currentUser = JSON.parse($("#json-user").text());

    console.log(currentUser.id);

    GM_xmlhttpRequest({
        method: "GET",
        headers: {
            'Accept': 'application/json',
            "Content-Type": "application/json",
        },
        url: `${hostname}/api/user/${currentUser.id}`,
        contentType: 'application/json',
        overrideMimeType: 'application/json',
        onload: function (response) {
            let json = JSON.parse(response.responseText);
            console.log(json);
            if (json.error)
                console.log(json.error);
            if (json.items) {
                if ($('.profile-badges').length == 0) {
                    $('.profile-detail').after('<div class="profile-badges"> </div>');
                }
    
                let badgeGroup = $('.profile-badges');
                let jsonIndex = 1;
                for (let item of json.items) {
                    badgeGroup.append(`<div id="kdsrvmp_badge${jsonIndex}" class="profile-badges__badge" style="background-image: url(&quot;${item.image_url}&quot;);" data-orig-title="${item.title}"></div>`);
                    $(`#kdsrvmp_badge${jsonIndex}`).qtip({
                        content: {
                            text: function (api) {
                                return $(this).attr('data-orig-title');
                            }
                        },
                        position: {
                            my: 'bottom center',
                            at: 'top center',
                            target: $(`#kdsrvmp_badge${jsonIndex}`)
                        },
                        style: {
                            classes: 'qtip qtip-default qtip tooltip-default qtip-pos-bc'
                        }
                    });
    
                    jsonIndex++;
                }
                $('.profile-badges').children().each().qtip({
                    content: {
                        text: function (api) {
                            return $(this).attr('data-orig-title');
                        }
                    },
                    position: {
                        my: 'bottom center',
                        at: 'top center',
                        target: $(this)
                    },
                    style: {
                        classes: 'qtip qtip-default qtip tooltip-default qtip-pos-bc'
                    }
                });
                if ($('.profile-badges').length > 1) {
                    $('.profile-badges').children(":first-child").each().qtip({
                        content: {
                            text: function (api) {
                                return $(this).attr('data-orig-title');
                            }
                        },
                        position: {
                            my: 'bottom left',
                            at: 'top right',
                            target: $(this)
                        },
                        style: {
                            classes: 'qtip qtip-default qtip tooltip-default qtip-pos-bc'
                        }
                    });
                    $('.profile-badges').children(":last-child").each().qtip({
                        content: {
                            text: function (api) {
                                return $(this).attr('data-orig-title');
                            }
                        },
                        position: {
                            my: 'bottom right',
                            at: 'top left',
                            target: $(this)
                        },
                        style: {
                            classes: 'qtip qtip-default qtip tooltip-default qtip-pos-bc'
                        }
                    });
                }
            }
        }      
    });

    /*fetch(`${hostname}/api/user/${currentUser.id}`, {mode: 'no-cors'}).then((response) => {
        return response.text();
    }).then(function (json) {

    })*/
})();