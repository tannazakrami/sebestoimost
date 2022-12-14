require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const data = require("./getData");
const bans = require("./getBans");
const update = require("./updateData")
const puppeteer = require('puppeteer')
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

const syncParse = async () => {
    let arrayUrl = await data();
    console.log(arrayUrl)

    let counter = 1;
    for(let i of arrayUrl){
        const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']})
        const page = await browser.newPage();
        await page.waitForTimeout(1000)
        await page.goto(`https://www.amazon.com/dp/${i[0]}`)
        try{
            await page.waitForTimeout(3000)
            let element = await page.$('#g') || "Нет элемента";
            console.log(element)
            element == "Нет элемента" ? i[1] = "Активен" : i[1] = "Бан"
        }
        catch(e){
            console.error(e.message)
        }
        console.log(`Проверено ${counter} из ${arrayUrl.length}`)
        counter++
        await browser.close()
    }

    await updateGoogleSheets(arrayUrl);
}
cron.schedule('0 50 8,15 * * *', () => {
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

cron.schedule('0 30 9,16 * * *', () => {
    syncGetBans();
})

const updateGoogleSheets = (array) => {
    update.updateData(array);
}
