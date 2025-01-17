const {getParameter} = require("./parameterManager");
const DynamoDB = require("@aws-sdk/client-dynamodb");
const DynamoDBLib = require("@aws-sdk/lib-dynamodb");
const { initKnex } = require("../setup/knexConfig");
const sqlManager = require("./sqlManager");

const dynamoClient = new DynamoDB.DynamoDBClient({ region: "ap-southeast-2" });
const docClient = DynamoDBLib.DynamoDBDocumentClient.from(dynamoClient);

async function getJounalContent(req, res){
    try{
        const response = await checkJournalContents();
        console.log("All journal entries fetched");
        res.status(200).json(response);
    }catch(error){
        console.log("Error reading the journal");
        res.status(400).json({"error" : error});
    }
}

async function checkJournalContents(){
    // return all items in the jounal
    const tableName = await getParameter("dynamoDBTable");
    let scanResults = [];

    const params = {
        TableName: tableName,
    };
    try {
        const command = new DynamoDBLib.ScanCommand(params);
        const result = await docClient.send(command);
        scanResults = scanResults.concat(result.Items);
        // The result will contain all the items from the table
        console.log("Journal entries:", scanResults);
        return scanResults;
    } catch (error) {
        console.error("Error scanning journal table:", error);
    }
}

async function logJournalEntry(operation, fileId, table, additionalInfo = {}) {
    //add or update en entry in the journal
  const tableName = await getParameter("dynamoDBTable");
  const qutUsername = await getParameter("qutUsername");
  const timestamp = new Date().toISOString();
  const params = {
    TableName: tableName,
    Item: {
      "qut-username": qutUsername,
      "name" : `${operation}-${fileId}`,
      "fileId": fileId,
      "table" : table,                       //E.g "job_file" or "file"
      "operation": operation,               // E.g., "file-upload" or "metadata-update"
      "status": "PENDING",                     // E.g., "started", "completed", or "failed"
      "timestamp": timestamp,
      "metadata": null,
      ...additionalInfo,                    // Additional info such as file name, S3 URL, etc.
    },
  };

  try {
    await docClient.send(new DynamoDBLib.PutCommand(params));
    console.log(`Journal updated: ${operation} is started for ${fileId}`);
  } catch (err) {
    console.error("Error updating journal:", err);
  }
}

async function updateLogEntry(operation,fileId,status,metadata=false,additionalInfo={}){
  //create an entry in the journal, will have status field as pending and metadata set to null
  const tableName = await getParameter("dynamoDBTable");
  const qutUsername = await getParameter("qutUsername");
  const timestamp = new Date().toISOString();
  const name = `${operation}-${fileId}`;

  const params = {
    TableName: tableName,
    Key: {
      "qut-username": qutUsername,
      "name": name  
    },
    UpdateExpression: "set #status = :status, #timestamp = :timestamp, #metadata = :metadata",
    ExpressionAttributeNames: {
      "#status": "status",
      "#timestamp": "timestamp",          // Update the timestamp field
      "#metadata": "metadata",
    },
    ExpressionAttributeValues: {
      ":status": status,
      ":timestamp": timestamp,         // New timestamp for update time
      ":metadata": metadata || null,
    },
    ReturnValues: "UPDATED_NEW",
  };
  try {
    const result = await docClient.send(new DynamoDBLib.UpdateCommand(params));
    console.log(`Log updated: ${operation} is now ${status}`, result.Attributes);
  } catch (err) {
    console.error("Error updating log entry:", err);
  }
    
}

async function deleteLogEntry(operation, fileId) {
  //the log needs to be updated on ce the file is uploaded, status becompe uploaded and metadata stay null. once metadata is ok, change to True
  const tableName = await getParameter("dynamoDBTable");
  const qutUsername = await getParameter("qutUsername");
  console.log("Deleting log entry");
  const params = {
    TableName: tableName,
    Key: {
      "qut-username": qutUsername,
      "name": `${operation}-${fileId}`         // Key is operation + username
    },
  };

  try {
    await docClient.send(new DynamoDBLib.DeleteCommand(params));
    console.log(`Log entry deleted: ${operation}`);
  } catch (err) {
    console.error("Error deleting log entry:", err);
  }
}

async function requestEmptyJounral(req, res){
  try{
    await resetJournal();
    res.status(200).json("Success deleting all entries in the jounral");
  }catch (err){
    res.error(err)
  }
}

async function resetJournal(){
  //a function to empty the journal
  try {
    // Collect all the transactions in the journal
    const entries = await checkJournalContents(); // Ensure it is awaited
    console.log(`Found ${entries.length} entries to delete`);
    // Iterate over the entries and delete each one
    for (let i = 0; i < entries.length; i++) {
      try {
	console.log("entrie numero i:", entries[i]);
        await deleteLogEntry(entries[i].operation, entries[i].fileId);
        console.log(`Deleted log entry for ${entries[i].operation}-${entries[i].fileId}`);
      } catch (err) {
        throw new Error(`Error deleting log entry for ${entries[i].operation}-${entries[i].fileId}:`, err);
      }
    }
    console.log("Journal reset complete");
  } catch (err) {
    console.error("Error while fetching journal contents:", err);
  }
}
async function requestJournalCheckup(req, res){
  try{await journalCheckup();
    console.log("Transaction Journal checked");
    res.status(200).json("Success reseting the jounral");

  }catch(err){res.error(err); console.error("Error During Jounral checkup");}
}

async function journalCheckup(){
  //collect all the transactions in the journal
  const entries =  await checkJournalContents();
  //loop over all entries
  for (let i=0; i< entries.length; i++){
    const entry = entries[i];
   
    const currentTime = new Date().toISOString();;
    const timestamp = entry.timestamp;

    //if meta has not been uploaded
    let toUpdate = false;
    if (entry.operation == 'UPLOAD' && entry.status=='UPLOADED' && entry.metadata === null ){
      toUpdate = true;
    }
    if (toUpdate){
      const knex = initKnex();
      if (entry.table == 'file'){
        try{
        await sqlManager.addEntryToFileTable(knex, entry.filename, entry.fileId, entry.size, entry.userID );
        } catch (err){
          console.error("Error while updating metadata from Journal:", err)
        }

      }
      if(entry.table == "job"){
        try{
          await sqlManager.addJobFile(knex, entry.jobId, entry.filesId);
          } catch (err){
            console.error("Error while updating metadata from Journal:", err)
          }
        }
      }
      await deleteLogEntry(entry.operation, entry.fileId);
    }
  }

//for whrn the application needs to be rolled back and the upload did not happends
async function updateMetadata(entry) {
  const tableName = await getParameter("dynamoDBTable");
  const newMetadata = await fetchMetadata(entry.fileId);  // Assume fetchMetadata is a function that fetches the metadata for the file

  const params = {
    TableName: tableName,
    Key: {
      "qut-username": entry["qut-username"],
      "name": entry.name,
    },
    UpdateExpression: "set metadate = :metadate, #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":metadate": newMetadata,
      ":status": "completed",   // Update the status to "completed"
    },
    ReturnValues: "UPDATED_NEW",
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    console.log(`Metadata updated for entry: ${entry.name}`);
    return result.Attributes;
  } catch (err) {
    console.error(`Error updating metadata for entry: ${entry.name}`, err);
    return null;
  }
}

module.exports = {logJournalEntry, getJounalContent, updateLogEntry,deleteLogEntry, journalCheckup, requestJournalCheckup,requestEmptyJounral};
