async function addEntryToFileTable(knex, filename, fileId, size, userID ) {
  //implement transactions later
    try {
        const result = await knex('file').insert({ id:fileId ,filename: filename,    
            size: size,
            account_id: userID});
        console.log('Entry added:', result);
        return result;
    } catch (error) {
        console.error('Error adding entry:', error);
    }
}

async function deleteEntryFromFileTable(knex, fileId) {
    try {
        const result = await knex('file').where('id', fileId).del();
        console.log(`Deleted ${result} entry from file table`);
        return result;
    } catch (error) {
        console.error('Error deleting entry:', error);
    }
}
async function updateFilename(knex, fileId, newFilename) {
  try {
      const result = await knex('file').where('id', fileId).update({ filename: newFilename });
      console.log(`Updated ${result} entry in file table`);
      return result;
  } catch (error) {
      console.error('Error updating filename:', error);
  }
}

async function getEntryFromFileTable(knex, fileId) {
  try {
      const result = await knex('file').where('id', fileId).first();
      if (result) {
          console.log('Entry found:', result);
          return result;
      } else {
          console.log(`No entry found for fileId: ${fileId}`);
          return null;
      }
  } catch (error) {
      console.error('Error fetching entry:', error);
      throw error;
  }
}

async function deleteEntryFromAccountsTable(knex, accountId) {
    try {
        const result = await knex('accounts').where('id', accountId).del();
        console.log(`Deleted ${result} entry from accounts table`);
        return result;
    } catch (error) {
        console.error('Error deleting entry:', error);
    }
}

async function addEntryToAccountsTable(knex, account_id, account_name) {
  try {
      const result = await knex('accounts').insert({ 
         id  : account_id,
         account_name : account_name,
      });
      console.log('Account added:', result);
      const tableContents = await knex('accounts').select('*');
      console.log('Updated accounts table:', tableContents);
      return result;
  } catch (error) {
      console.error('Error adding entry:', error);
  }
}

async function getEntryFromAccountsTable(knex, accountId) {
  try {
      const result = await knex('accounts').where('id', accountId).first();
      if (result) {
          console.log('Entry found:', result);
          return result;
      } else {
          console.log(`No entry found for accountId: ${accountId}`);
          return null;
      }
  } catch (error) {
      console.error('Error fetching entry:', error);
      throw error;
  }
}

async function getEntryByAccountName(knex, account_name) {
  try {
      const result = await knex('accounts').where('account_name', account_name).first();
      if (result) {
          console.log('Entry found:', result);
          return result;
      } else {
          console.log(`No entry found for account_name: ${account_name}`);
          return null;
      }
  } catch (error) {
      console.error('Error fetching entry by account name:', error);
      throw error;
  }
}

async function addEntrytoJob(knex, jobId, userId){
    try{
        const response =await knex('job').insert({
            id : jobId,
            progress : 0,
            account_id : userId
        })
        console.log(`Job ${jobId} added to table successfuly`);
        return response;
    }catch (error)
    {
        console.error('Error adding entry:', error);
    }
} 

//A function to update the job fields
async function updateProgress(knex, jobId, progress=0, completionDate=-1, duration=-1){
    try {
        const updateFields = { progress }; // Always update progress
        console.log('Job ID:', jobId, 'Progress:', progress, 'Completion Date:', completionDate, 'Duration:', duration);

        // Check if computation is over by inspecting completionDate and duration
        if (completionDate !== -1 && duration !== -1) {
            updateFields.completionDate = completionDate;
            updateFields.duration = duration;
        }

        const response = await knex('job')
            .where({ id: jobId })
            .update(updateFields);
        const newRow = await knex('job')
        .where({ id: jobId }).select();
  
        console.log("Job entry updated:", newRow);
    } catch (error) {
        console.log('Error updating job entry:', error);
    }
}

async function addJobFile(knex, jobId, fileIds) {
    try{
        const jobFileEntries = fileIds.map(fileId=>({
            job_id: jobId,
            file_id: fileId
        }));
        const reponse = await knex('job_file').insert(jobFileEntries);
        console.log("File added to the job successfully");
        return reponse;
    }catch(error){
        console.error('Error adding files to the job:',error)
    }
    
}
async function getJobsInfo(knex, userId){
    try{
        const response = await knex('job').where('account_id', userId).select();
        console.log('Job fetched for:', userId);
        return response;
    } catch (error){
        console.log('Error fetching jobs:', error);
    }
}

async function getAllJobs(knex){
    try{
        const response = await knex('job').select();
        console.log('Job fetched:', response);
        return response;
    } catch (error){
        console.log('Error fetching jobs');
    }
}

async function deleteJobs(knex, jobIds) {
    try {
        const response = await knex('job')
            .whereIn('id', jobIds) // Use whereIn to specify multiple IDs
            .del();
        
        console.log('Jobs deleted:', response);
        return response;
    } catch (error) {
        console.log('Error deleting jobs:', error);
        throw error;
    }
}
module.exports = {
   addEntryToFileTable,
    deleteEntryFromFileTable,
    updateFilename,
    getEntryFromFileTable,
    deleteEntryFromAccountsTable,
    addEntryToAccountsTable,
    getEntryFromAccountsTable,
    getEntryByAccountName,
    addEntrytoJob,
    updateProgress,
    addJobFile,
    getJobsInfo,
    getAllJobs,
    deleteJobs
};
