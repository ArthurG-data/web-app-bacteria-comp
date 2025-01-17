
async function main(){
    try{
    const {initKnex} = require("../setup/knexConfig.js");
    const knex = require("knex");
    //create table
    const db = await initKnex();
    const sqlManager = require("../server/middlewares/sqlManager.js");
    const fileIds = ['file1', 'file2'];

    const tables = await db.raw("SHOW TABLES");
    const tableNames = tables[0].map(row => Object.values(row)[0]);

    console.log("Existing tables:", tableNames);

    await db.schema
    .createTable('job', (table)=>{
        table.uuid('id').primary();
        table.integer('progress');
        table.timestamp('completionDate');
        table.float('duration');
        table.uuid('resul_file_id');
        table.uuid('account_id').references('id').inTable('accounts').onDelete('CASCADE');
    })
    .createTable('job_file', (table) => {
        table.uuid('job_id').unsigned().references('id').inTable('job'); // Reference to the job
        table.uuid('file_id').unsigned().references('id').inTable('file'); // Reference to the file
        table.primary(['job_id', 'file_id']); // Composite primary key
    })

    await sqlManager.addEntrytoJob(knex, 'job_test', 'user_test');

    await sqlManager.addJobFile(knex, jobId, fileIds);
} catch(error){
    console.log(error);
}
}

if (require.main === module) {
    main();
  }
  