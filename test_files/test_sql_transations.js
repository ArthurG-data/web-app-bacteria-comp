const DynamoDB = require("@aws-sdk/client-dynamodb");
const DynamoDBLib = require("@aws-sdk/lib-dynamodb");

const qutUsername =  process.env.qutUsername;
const tableName = process.env.TABLE_NAME;
const sortKey = "name";


async function createJournalTable() {
    const client = new DynamoDB.DynamoDBClient({ region: "ap-southeast-2" });
    const docClient = DynamoDBLib.DynamoDBDocumentClient.from(client);
 
   // Add more content here
   command = new DynamoDB.CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: [
        {
          AttributeName: "qut-username",
          AttributeType: "S",
        },
        {
          AttributeName: "name",
          AttributeType: "S", // Setting the sort key to String type
        },
    ],
    KeySchema: [
        {
          AttributeName: "qut-username",
          KeyType: "HASH",
        },
        {
          AttributeName: "name",
          KeyType: "RANGE",
        },
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
    },
  });
  try {
    const response = await client.send(command);
    console.log("Journal Table Created successfully:", response);
  } catch (err) {
    console.log('Error creating Jounral table', err);
  }
 }
 
 createJournalTable();
