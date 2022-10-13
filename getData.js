const {google} = require("googleapis")
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
})

module.exports = async function getData(){
    const client = await auth.getClient()
    const googleSheets = google.sheets({version: "v4", auth: client})
    const spreadsheetId = "1hM4SepEvLh_TIkyZ0gYNYMSRKEndy_WwIJCsDZSX3UU";
    let data = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "TEST!C2:D",
    })
    return data.data.values || undefined;
}

module.exports = async function getBans(){
    const client = await auth.getClient();
    const googleSheets = google.sheets({version:"v4", auth: client})
    const spreadsheetId = "1hM4SepEvLh_TIkyZ0gYNYMSRKEndy_WwIJCsDZSX3UU";
    let data = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: "TEST!A2:C",
    })
    return data.data.values || undefined;
}