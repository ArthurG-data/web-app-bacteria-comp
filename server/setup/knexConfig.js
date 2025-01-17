const  {fetchSecret} = require("../middlewares/secretManager");
const knex = require('knex');
const {getParameter} = require("../middlewares/parameterManager");


let dbInstance;

const initKnex = async () => {
  

  if (!dbInstance) {
    // Fetch secret only once during app load
  const secret_sql = await getParameter("secretSql");
  const dbendpoint = await getParameter("dbEndPoint");
  const databaseName = await getParameter("dbName");
  const secret = await fetchSecret(secret_sql);
    if (secret) {
      dbInstance = knex({
        client: 'mysql2',
        connection: {
          host: dbendpoint,
          user: secret.username,
          password: secret.password,
          database: databaseName,
          port: secret.port || 3306,
        },
      });
      console.log('Knex instance created.');
    } else {
      throw new Error('Failed to fetch database credentials');
    }
  }
  return dbInstance;
};

module.exports = {initKnex};