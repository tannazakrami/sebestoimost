const fs = require('fs');
require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const httpsProxyAgent = require('https-proxy-agent');
const axios = require("axios");
const cron = require('node-cron');
const { proxy }  = JSON.parse(fs.readFileSync('./proxy.json').toString())
const { userAgent } = JSON.parse(fs.readFileSync('./userAgents.json').toString())
const data = require("./getData");
const bans = require("./getBans");
const update = require("./updateData")
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const syncParse = async () => {
    let arrayUrl = await data();
    console.log(arrayUrl)
    const opts = { 
        headers: {
          accept: '*/*',
          'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'sec-ch-ua':
            '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'saa-fp': '140afb08af2eaad6f7f55865af4c96e9',
          'saa-seller-id': 'null',
          'saa-installation-id': '5e961e73-53f5-42f2-8ea0-c7bb005fcfae',
          'accept-encoding': 'gzip, deflate, br',
          cookie: `_gcl_au=1.1.414883987.1654864485;_gid=GA1.2.900111928.1654864491;G_ENABLED_IDPS=google;id=18424;key=c47803c5a34a3282ad7a01c2be0ca3a8;amp_206c6a=2TNklfK0T5tNF8rS0qF6Et.MTg0MjQ=..1g56pockq.1g56prrau.5.4.9;_ga=GA1.2.1299645822.1654864485;spark_token=eyJpdiI6Im1Lc3lGVnM4K1RIV0NXV0RNNDBmdEE9PSIsInZhbHVlIjoibURRSXI5YmRraVlIWG8xcm1mSUJyMkIwS2xOeXg5blczUnJnSzVBdkVtdEcyXC81Tk10cEhGOHN1aFwvcFltc2s2dXdKaDJ6cmhJNEo2c1RySXcxdzVSZWlFM2VjNmV4cW9rektXREdmUUo0XC9MM3R1NWxCV3YwOStRQ0REOTVYYVVXeWpjcTZUaGlNa2FVZzFRSFdxRWdsaUdWWFFiWllERHF6b3Jpc25zYlpCYTFVUkd5MWVxNTdwZ1RBbnFVN0dnT2p4dWM2OTJ2Y25HcGc0ZDhKWFdsYXFMSUlZbWt6OWx6VUR4MkZDQUYraDhrR2s2dk55N0NFUTlEaVBQNHFGN1wvY0tNMm1IanByd3Z6cG1xZm9ROVlnPT0iLCJtYWMiOiI1MWZjNjIxZjE1MjNlZjMwYjg0NDlkM2JlYjMyMTE2ZjE1Njg1YmI3ZWQ2YWRiNGM1YTgwYmMwMTUxMjNjY2ZmIn0%3D;XSRF-TOKEN=eyJpdiI6ImZNUnU2cnJGOFZmeVZtOG1sc1wvQ3NRPT0iLCJ2YWx1ZSI6IlJySlo5cjc3WlpqNlNUQWYyeEZTT0VvMHp4U2Zwb1VERTgxMm5KNjA3WGQxTlBVRml4T1VzM1wvYk84N2taOXdSIiwibWFjIjoiYzUxMTQ2ZjZiYzEzZDMxZGM3MTdiZDRhZDNjOWJjYmM1YzYxMDYxYmVhNjA1ZWNmZTJkOWE0ODUyZjM4NjZiMCJ9;seller_assistant_app_session=eyJpdiI6IldMRDRuWkVcLyt2TkZEVG05c1FrZmpBPT0iLCJ2YWx1ZSI6IkpIOUVhRWtZbXBheVd3NEV2VlNLSXp0WWIrTGl3V05EaStsaEl2R2JzaG11V3VJUlAyQVJBbzlUOGI3Y0V1M2QiLCJtYWMiOiIzYTIyMTkyODdkODNiNDViYmM0YWE2ZTM5ZWJmMWMwYmM2MDc5ZTQ1MGQ2MDFiMzczNTAyNGNiNDk2MjJmNTI0In0%3D;_ga_QZP6PSZWY9=GS1.1.1654864484.1.1.1654865831.56`,
          Referer: 'https://app.sellerboard.com/en/dashboard/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        }
    }

    for await(let i of arrayUrl){
        try{
            const proxyServer = proxy[Math.floor(Math.random() * proxy.length)];
            const httpAgent = new httpsProxyAgent.HttpsProxyAgent(proxyServer);
            const axiosProxy = axios.create({httpAgent});
            opts.headers['User-Agent'] = userAgent[Math.floor(Math.random() * userAgent.length)]
            var { status } = await axiosProxy.get(i[1], opts)
            console.log(i[1], status)
            i[0] = "Активен"
        }
        catch(e){
            const proxyServer = proxy[Math.floor(Math.random() * proxy.length)];
            const httpAgent = new httpsProxyAgent.HttpsProxyAgent(proxyServer);
            const axiosProxy = axios.create({httpAgent});
            opts.headers['User-Agent'] = userAgent[Math.floor(Math.random() * userAgent.length)]
            await axiosProxy.get(i[1], opts)
                .then((res) => {
                    i[0] = "Активен"
                    console.log(i[1], res.status)
                })
                .catch(async (err) => {
                    if(err.response.status == 404){
                        i[0] = "Бан"
                    }
                    else{
                        const proxyServer = proxy[Math.floor(Math.random() * proxy.length)];
                        const httpAgent = new httpsProxyAgent.HttpsProxyAgent(proxyServer);
                        const axiosProxy = axios.create({httpAgent});
                        opts.headers['User-Agent'] = userAgent[Math.floor(Math.random() * userAgent.length)]
                        await axiosProxy.get(i[1], opts)
                            .then((res) => {
                                i[0] = "Активен"
                                console.log(i[1], res.status)
                            })
                            .catch((err) => {
                                if(err.response.status == 404){
                                    i[0] = "Бан"
                                }
                                else{
                                    i[0] = "Активен"
                                }
                            })
                    }
                    console.log(i[1],err.response.status)
                })
        }
    }

    updateGoogleSheets(arrayUrl);
    console.log(update);
    console.log(arrayUrl);
}

cron.schedule('0 0 6,13 * * *', () => {
    syncParse();
})

const syncGetBans = async () => {
    let arrayBans = await bans();

    let bannedASIN = arrayBans.filter(array => array[2] == "Бан")
    let message = "Забаненные асины на текущий момент: \n"
    
    bannedASIN.forEach((el, i) => {
        i !== bannedASIN.length-1 ? message += `${el[0]} - ${el[3]}\n` : message += `${el[0]} - ${el[3]}\n`
    })

    bot.sendMessage("-586466586", message)
    console.log(message)
}

cron.schedule('0 30 6,13 * * *', () => {
    syncGetBans();
})

const updateGoogleSheets = (array) => {
    update.updateData(array);
}