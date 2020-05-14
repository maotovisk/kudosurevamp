const fetch = require("node-fetch");


const v2URI = "https://osu.ppy.sh/api/v2/"



async function getUserInfoByBearer(bearerToken) {
    return new Promise(
        (resolve, reject) => {
            fetch(`${v2URI}me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${bearerToken}`,
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }).then(async function (response) {
                return response.text();
            }).then(async function (body) {
                resolve(body);
            }).catch(console.log);
        }
    )
}

module.exports = {getUserInfoByBearer}