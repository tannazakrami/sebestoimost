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

    const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox']})
    let counter = 1;
    for(let i of arrayUrl){
        const page = await browser.newPage();

        await page.goto(`https://www.amazon.com/dp/${i[0]}`, {waitUntil: 'networkidle0'})

        try{
            await page.click('#g')
            i[1] = "Бан"

            let pages = await browser.pages();
            if(pages.length >= 3){
                await pages[1].close()
            }
        }
        catch{
            i[1] = "Активен"
        }
        page.close()
        console.log(`Проверено ${counter} из ${arrayUrl.length}`)
        counter++
    }

    await updateGoogleSheets(arrayUrl);
    await browser.close()
}
cron.schedule('0 0 6,13 * * *', () => {
    syncParse();
})

cron.schedule('0 30 9 * * *', () => {
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
syncParse();