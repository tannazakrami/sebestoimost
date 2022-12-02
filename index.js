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

    const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox']})
    let counter = 1;
    for(let i of arrayUrl){
        const page = await browser.newPage();
        await page.waitForTimeout(1000)
        await page.goto(`https://www.amazon.com/dp/${i[0]}`, {waitUntil: 'networkidle0'})
        await page.waitForTimeout(1000)
        try{
            await page.waitForTimeout(2000)
            let element = await page.$('#d') || "Нет элемента";
            console.log(element)
            element == "Нет элемента" ? i[1] = "Активен" : i[1] = "Бан"
        }
        catch(e){
            console.error(e.message)
        }
        await page.close()
        console.log(`Проверено ${counter} из ${arrayUrl.length}`)
        counter++
    }

    await updateGoogleSheets(arrayUrl);
    await browser.close()
}
//cron.schedule('0 0 6,13 * * *', () => {
//    syncParse();
//})
cron.schedule('0 3 14 * * *', () => {
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
