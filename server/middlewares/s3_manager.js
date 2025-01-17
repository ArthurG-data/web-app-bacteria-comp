S3 = require("@aws-sdk/client-s3");
const S3Presigner = require("@aws-sdk/s3-request-presigner");
const s3Client = new S3.S3Client({ region: 'ap-southeast-2' });
const {getParameter} = require("./parameterManager");


async function uploadFileS3(bucketName, key, parsed){
    try{
        const response = await s3Client.send(
            new S3.PutObjectCommand({
                Bucket: bucketName,
                Key: key,
                Body: parsed
            })
        );
        console.log(response);
        return response;
    } catch(err){
        console.log("Error loading the file to S3");
    }

}

async function getS3SignUrl(bucketName, filename) {
    try{
    const command = new S3.PutObjectCommand({
        Bucket: bucketName,
        Key: filename,
    });
    const presignedURL = await S3Presigner.getSignedUrl(s3Client, command, {expiresIn: 3600} );

    console.log('Pre-signed URL to get the object:')
    console.log(presignedURL);
    return presignedURL;
} catch (err){
    console.log("Error fetching presigned Url for upload");
    throw new Error("Error fetching presigned Url for upload:",err);
}
}



async function deleteFileS3(bucketName, Key){
    try {
    const response = await s3Client.send(
        new S3.DeleteObjectCommand({
            Bucket: bucketName,
            Key: Key,
        })
    )
    console.log('File deleted successfully from S3');
    return response;
    }catch (error){
        console.error('Error deleting file from S3', error);
    }
}

async function readFileS3(bucketName, fileName){
    try{
        const response = await s3Client.send(
            new S3.GetObjectCommand({
                Bucket: bucketName,
                Key: fileName
            })
        );
        const str = await streamToString(response.Body);
        const result = {
            fileName: fileName,
            fileContent: str
        };
        console.log("File read successfully:", result);
        return result
    }catch(error){
        console.log("Error while reading the Ec3 file");
        throw error;
    };
}

const streamToString = (stream) => new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    stream.on('error', reject);
});

async function getS3Url(bucketName, objectKey){
    try {
        const command = new S3.GetObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
            });
        const presignedURL = await S3Presigner.getSignedUrl(s3Client, command, {expiresIn: 3600} );
        
        console.log('Pre-signed URL to get the object:')
        console.log(presignedURL);
        return presignedURL;
    
    } catch (err) {
        console.log("Error while getting presigned url:",err);
        throw err;
    }
}

async function getUrlapi(req,res){
    console.log("Req for download:", req)
    const bucketName = await getParameter("bucketName");
    const fileId = req.params.jobId;
    try{
        const presignedURL = await getS3Url(bucketName, fileId);
        console.log('File fetched from s3');
        res.status(200).json({ message: 'success', url: presignedURL });
    }catch (error){
        console.error('Error getting the URL:', error);
        res.status(500).json({ error: 'Failed to get the URL' });
    }
}

module.exports = {
    uploadFileS3, readFileS3, deleteFileS3, getUrlapi, getS3SignUrl
}
