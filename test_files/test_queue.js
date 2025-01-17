const SQS = require("@aws-sdk/client-sqs");
const {getParameter} = require('../server/middlewares/parameterManager.js');

const message = "This is the message that will be queued.";
const sqsQueueUrl = "https://sqs.ap-southeast-2.amazonaws.com/901444280953/n11371200-app-queue";
const client = new SQS.SQSClient({
  region: "ap-southeast-2",
});

async function main() {
   // Send a message
   const sqsQueueUrl = await getParameter("sqsQueue");
   const command = new SQS.SendMessageCommand({
      QueueUrl: sqsQueueUrl,
      DelaySeconds: 10,
      MessageBody: message,
   });

   const response = await client.send(command);
   console.log("Sending a message", response);

   // Receive a message from the queue
   const receiveCommand = new SQS.ReceiveMessageCommand({
      MaxNumberOfMessages: 1,
      QueueUrl: sqsQueueUrl,
      WaitTimeSeconds: 20, // how long to wait for a message before returning if none.
      VisibilityTimeout: 20, // overrides the default for the queue?
   });

   const receiveResponse = await client.send(receiveCommand);
   console.log("Receiving a message", receiveResponse);

   // If there are no messages then you'll still get a result back.
   Messages = receiveResponse.Messages;
   if (!Messages) {
      console.log("No messages");
      return;
   }

   // Retrieve the first message from the body
   console.log("Message contents:", Messages[0].Body);

   // Delete the message after dealt with.
   const deleteCommand = new SQS.DeleteMessageCommand({
      QueueUrl: sqsQueueUrl,
      ReceiptHandle: Messages[0].ReceiptHandle,
   });
   const deleteResponse = await client.send(deleteCommand);
   console.log("Deleting the message", deleteResponse);
}

main();
