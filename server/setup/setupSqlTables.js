const {initKnex} = require("../setup/knexConfig.js");

async function createTables() {
  const db = await initKnex();
  try {
     // Await knex initialization if async

    // Check if tables exist
    const tables = await db.raw("SHOW TABLES");
    const tableNames = tables[0].map(row => Object.values(row)[0]);

    console.log("Existing tables:", tableNames);

    if (tableNames.includes('file')) {
      console.log("Dropping table 'file'");
      await db.schema.dropTableIfExists('file');
    }

    // Drop existing tables if they exist
    if (tableNames.includes('accounts')) {
      console.log("Dropping table 'accounts'");
      await db.schema.dropTableIfExists('accounts');
    }

    if (tableNames.includes('job')) {
      console.log("Dropping table 'accounts'");
      await db.schema.dropTableIfExists('job');
    }

    if (tableNames.includes('job_file')) {
      console.log("Dropping table 'accounts'");
      await db.schema.dropTableIfExists('job_file');
    }
  
    // Create tables
    await db.schema
      .createTable('accounts', (table) => {
        table.uuid('id').primary();
        table.string('account_name').notNullable();
      })
      .createTable('file', (table) => {
        table.uuid('id').primary();
        table.string('filename');
        table.integer('size');
        table.uuid('account_id').references('id').inTable('accounts').onDelete('CASCADE');
      })
      .createTable('WebSocketConnections', (table)=>{
        table.id('connectionId')
      })
      //a table to store the jobs
      .createTable('job', (table)=>{
        table.uuid('id').primary();
        table.integer('progress');
        table.timestamp('completionDate');
        table.float('duration');
        table.uuid('resul_file_id');
        table.uuid('account_id').references('id').inTable('accounts').onDelete('CASCADE');
      })
      .createTable('job_file', (table) => {
        table.uuid('job_id').references('id').inTable('job'); // Reference to the job
        table.uuid('file_id').references('id').inTable('file'); // Reference to the file
        table.primary(['job_id', 'file_id']); // Composite primary key
    })
    console.log("Tables created successfully.");
    // Verify tables creation
    const newTables = await db.raw("SHOW TABLES");
    const newTableNames = newTables[0].map(row => Object.values(row)[0]);

    console.log("Existing tables after creation:", newTableNames);

    if (newTableNames.includes('accounts') && newTableNames.includes('file')) {
      console.log("Tables 'accounts' and 'file' exist.");
    } else {
      console.log("One or both tables are missing.");
    }

  } catch (error) {
    console.error("Error creating or checking SQL tables:", error);
  } finally {
    await db.destroy(); // Close the connection after table creation and check
  }
};

// Execute the function directly if the script is run
if (require.main === module) {
  createTables();
}

module.exports = {createTables};
