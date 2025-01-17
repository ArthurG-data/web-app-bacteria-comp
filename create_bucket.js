S3 = require("@aws-sdk/client-s3");

async function createNewBucket(bucketName){
    s3Client = new S3.S3Client({ region: 'ap-southeast-2' });

    // Command for creating a bucket
    command = new S3.CreateBucketCommand({
        Bucket: bucketName
    });

    try {
        const response = await s3Client.send(command);
        console.log(response.Location)
        console.log("Bucket created: ", bucketName );
        return true;
    } catch (err) {
        console.log("Error creating the bucket:",err);
    }
}

async function tagBucket(bucketName, qutUsername, purpose){
    command = new S3.PutBucketTaggingCommand({
        Bucket: bucketName,
        Tagging: {
            TagSet: [
                {
                    Key: 'qut-username',
                    Value: qutUsername,
                },
                {
                    Key: 'purpose',
                    Value: purpose
                }
            ]
        }
    });
    // Send the command to tag the bucket
    try {
        const response = await s3Client.send(command);
        console.log("Bucket tagged:",response);
        return true;
    } catch (err) {
        console.log("Error while tagging the bucket: ", err);
    } 
}

async function main() {
    const bucketName = 'n11371200-blob';
    const qutUsername = 'n11371200@qut.edu.au';
    const purpose = 'files-web-app';
    try{
        const creation = await createNewBucket(bucketName);
        const tagg = await tagBucket(bucketName, qutUsername, purpose)
    } catch (error){
        console.log(error);
    }
}


main();
