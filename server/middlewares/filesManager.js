const fs = require('fs');
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const sqlManager = require("./sqlManager.js");
const {uploadFileS3, readFileS3, deleteFileS3, getS3SignUrl} = require("./s3_manager.js");
const {initKnex} = require("../setup/knexConfig.js");
const {getParameter} = require("./parameterManager");
const {logJournalEntry, updateLogEntry, deleteLogEntry} = require("./dynamoDB");
const knex = require('knex');

async function presignedUrlRequest(req, res){
    {/*Get */}
    const randomFileName = uuidv4();
    const filename = req.body.fileId;
    const userId = req.user.username;
    const size = req.body.size;
    try {
        const additionalInfo = {"userId": userId, "size":size, "filename": filename, "fileId":randomFileName};
        //Start logging the journal entry for the request
        await logJournalEntry(
            'UPLOAD',
            randomFileName,
            "file",
            additionalInfo
        );
        //Get the presigned URL
        const bucketName = await getParameter('bucketName')
        const presignedUrl = await getS3SignUrl(bucketName, randomFileName)
        //return presigned url
        console.log("Presigned Url obtained");

        await updateLogEntry(
            'UPLOAD',
            randomFileName,
            "UPLOADED",
        );
        //add the file info in the sql table
        const knex = await initKnex();
        await sqlManager.addEntryToFileTable(knex, filename, randomFileName, size, userId);
        //log the successfull database entry
        await updateLogEntry(
            'UPLOAD',
            randomFileName,
            "UPLOADED",
            metadate=true
        );
        res.status(200).json({presignedUrl})
    }catch (err){
        //log any errors encontered
        await updateLogEntry(
            'UPLOAD',
            randomFileName,
            'FAILED'
        )
        //response with error
        res.status(500).json({message: "Error fetching", error : err})
    }
}

async function addFiles(req, res)
{
    const fileName = req.headers['file-name']
    const file = req.file;
    const userId = req.user;
    const bucketName = await getParameter('bucketName')

    const knex = await initKnex();
    const randomFileName = uuidv4();
    try {
        const upload = await uploadFileS3(bucketName, randomFileName, file.buffer);
        const add = await sqlManager.addEntryToFileTable(knex, file.originalname, randomFileName, file.size, userId.username);
        res.status(200).json({message:'File Uploaded and metadata saved'});
    }catch (error){
        res.status(500).json({message: error.message});
    }
}

async function deletefile(req, res){
    const bucketName = await getParameter('bucketName')
    const knex = await initKnex();
    const fileId = req.params.fileId;
    try {
        // Attempt to delete the file from S3
        const s3Response = await deleteFileS3(bucketName, fileId);
        console.log('File deleted from storage:', s3Response);
        
        // If S3 deletion is successful, proceed to delete the metadata
        if (s3Response) {
            try {
                await sqlManager.deleteEntryFromFileTable(knex, fileId);
                console.log('File deleted from file-table');
                res.status(200).json({ message: "Deletion Successful" });
            } catch (dbError) {
                console.error('Error deleting metadata from database:', dbError);
                res.status(500).json({ message: "File deleted from storage, but metadata could not be removed" });
            }
        } else {
            res.status(404).json({ message: "File not found in storage" });
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(400).json({ message: error.message });
    }
}

async function readFiles(req, res)
{
    const bucketName = await getParameter('bucketName')
    const fileName = req.params.fileId;
    console.log("Received read query:", fileName);
    try {
        const response = await readFileS3(bucketName, fileName);
        res.status(200).json(response);
    }
    catch (error){
        console.log('Error reading file:', fileName) ;
        res.status(400).json({message: error.message});
    }
};

module.exports = {addFiles,deletefile, readFiles, presignedUrlRequest , updateLogEntry, deleteLogEntry};
