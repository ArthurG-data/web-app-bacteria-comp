
S3 = require("@aws-sdk/client-s3");

s3Client = new S3.S3Client({ region: 'ap-southeast-2' });
const {initKnex} = require("./setup/knexConfig.js")
const {deleteEntryFromFileTable, addEntryToFileTable, getEntryFromFileTable, addEntryToAccountsTable} = require("./middlewares/sqlManager.js");

filename="test";
fileId="blbberid";
size = 4535;
userID = "f5dde358-bae0-41d8-b18d-6eb3d03b1bcb";

async function main(){
    const knex = await initKnex(); 
 try{
    const exist = await knex('file').select();
    console.log(exist);
    const  add =  await addEntryToFileTable(knex, filename, fileId, size, userID)
    const exist2 = await knex('file').select();
    console.log(exist2);
 }catch (error){throw new Error(`Error: ${error.message}`)}
}



main();
