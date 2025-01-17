const {computeCorrelation} = require("../utils/sequenceCompare.js");
const {processFileStream} = require("../utils/sequenceCompare.js");
const {initKnex} = require("../setup/knexConfig.js");
const sqlManager = require('./sqlManager.js');
const s3Manager = require('./s3_manager.js');
const {getParameter} = require('./parameterManager.js');
const { v4: uuidv4 } = require('uuid');
const {logJournalEntry, updateLogEntry} = require('./dynamoDB.js');


async function computeStochastic(req,res){
    const bucketName = await getParameter('bucketName');

    const fileId = req.params.fileId;
    const errorMessage = "Error while computing stochastic array";
    const result = await processFileStream(bucketName, fileId);
    res.status(200).json({message: "Stoch array successfully computed", result : result});
} 
async function startComputation(req, res){
    try{
    const user = req.user.username;
    const jobId = uuidv4();
    let { fileIds } = req.query;  // Use query parameters for SSE
    
    if (!fileIds) {
        fileIds = req.body.fileIds; // Fallback to body if no query params
    }
    res.status(202).json({ jobId });
    //log the start of the computation
    await compareBacterias(jobId, user, fileIds);
    } catch (error) { 
        console.log("Failed to start computing:", error);
        throw new Error("Failed to start computation");
    }
}

async function compareBacterias(jobId, user, fileIds){
    console.log("User:", user);
    console.log("jobId:", jobId);
    console.log("fileIds:", fileIds);

    
    
    const results = [];
    const knex = await initKnex();
     try {  
        if (!fileIds){
        
            const files = await knex('file').where('account_id', user).select('id');
            fileIds = files.map(file => file.id);
        }
        if  (!Array.isArray(fileIds)|| fileIds.length <2 ||fileIds.length>50){
        };
        //create the job after verification
        const additionalInfo = {'filesIds':fileIds };
        await logJournalEntry(
            'UPLOAD',
             jobId,
            "job",
            fileIds
        );
        await sqlManager.addEntrytoJob(knex, jobId, user);
        //log the addition of the job to the table
 
        await sqlManager.addJobFile(knex, jobId, fileIds);

        await updateLogEntry(
            'UPLOAD',
             jobId,
            "PENDING",
            metadate=true
        );
        } catch (error) {
            return;
        }

    try{
        const bucketName = await getParameter('bucketName');
        const bacteriaInstances = await Promise.all(fileIds.map(fileId => processFileStream(bucketName, fileId)));;
        console.log(`${bacteriaInstances.length} Vectors created.`);

        const totalComparisons = (bacteriaInstances.length * (bacteriaInstances.length - 1)) / 2;
        
        let completedComparisons = 0;
        const start = performance.now();
        for (let i=0; i< bacteriaInstances.length-1; i++){
            for (let j= i+1; j<bacteriaInstances.length;j++){
                const correlation = await computeCorrelation(bacteriaInstances[i], bacteriaInstances[j]);
                results.push({
                    name1: bacteriaInstances[i].name,
                    name2: bacteriaInstances[j].name,
                    correlation: correlation
                });
                completedComparisons++;
                const progress = Math.floor((completedComparisons / totalComparisons) * 100);
                await sqlManager.updateProgress(knex, jobId, progress);

            }
        }
        //send a finale update message
        const end = performance.now();
        
        const duration = (end - start)/1000;
        const currentDate = new Date()
        const isoString = currentDate.toISOString();
        await sqlManager.updateProgress(knex,jobId, 100, isoString, duration); 
        await createResultFile(bucketName, jobId, user, isoString, duration, results);
        await updateLogEntry(
            'UPLOAD',
             jobId,
            "UPLOADED",
            metadate=true
        );
        console.log("All bacteria compared successfully.");
        await updateLogEntry(
            'UPLOAD',
             jobId,
            "COMPLETED"
        );
    }catch (error)
    {
        console.log('Error while comparing bacterias')
        throw error 
    }
}

async function createResultFile(bucketName, jobId, userId, completionDate, duration, results){
    const resultContent = {
        jobId,
        userId,
        results: results, // Assuming jobData has a results field
        completionDate: completionDate,
        duration: duration,
      };
      const fileContent = JSON.stringify(resultContent, null, 2);
      try{
        const response = await s3Manager.uploadFileS3(bucketName, jobId,fileContent);
        console.log(`File uploaded successfully:`, response);
      }catch (error){
        //rollback, will happend in the compare function
        console.error('Error uploading file to S3:', error);
        throw new Error('Failed to create result file');
      }
}

async function similarityToDistance(similarityMatrix) {
    const size = similarityMatrix.length;
    let distanceMatrix = Array.from(Array(size), () => new Array(size));
  
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        distanceMatrix[i][j] = 1 - similarityMatrix[i][j]; // Convert similarity to distance
      }
    }
    return distanceMatrix;
  }

async function createMatrix(){
    
}

module.exports = 
{
    computeStochastic,startComputation, createResultFile
};
