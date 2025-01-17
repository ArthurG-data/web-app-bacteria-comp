const initKnex= require('../setup/knexConfig');
const knex = initKnex();

exports.up = function(knex) {
    return knex.schema.createTable('WebSocketConnections', (table) => {
        table.string('connectionId').primary(); // Use string type and set as primary key
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('WebSocketConnections');
};

exports.handler = async (event) => {
    try {
        const connectionId = event.requestContext.connectionId;

        // Insert the connection ID into the SQL database
        await knex('WebSocketConnections').insert({ connectionId });

        return {
            statusCode: 200,
            body: 'Connected'
        };
    } catch (error) {
        console.error('Error connecting:', error);
        return {
            statusCode: 500,
            body: 'Error connecting'
        };
    }
};