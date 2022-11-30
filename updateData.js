const {google} = require("googleapis");
const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: "https://www.googleapis.com/auth/spreadsheets"
})

module.exports = {
    updateData: async function(updatedData){
        const client = await auth.getClient();
        const googleSheets = google.sheets({version: "v4", auth: client});
        const spreadsheetId = "1hM4SepEvLh_TIkyZ0gYNYMSRKEndy_WwIJCsDZSX3UU";
        return new Promise((resolve, reject) => {
            googleSheets.spreadsheets.values.update({
                auth,
                spreadsheetId,
                range:'TEST!B2:C',
                valueInputOption: "USER_ENTERED",
                resource: {range: 'TEST!B2:C', majorDimension: "ROWS", values:updatedData}
            }, (err, resp) => {
                if(err){
                    console.log('Data Error: ',err)
                    reject(err);
                }
                resolve(resp);
            })
        })

}}