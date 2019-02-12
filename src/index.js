import { start } from './server'

start()

// Import the "express" module for more powerful web server capabilities.
import express from "express";
// Import database node module
import { CosmosClient as CosmosClientInterface } from "@azure/cosmos"


// Initialize the express module and make it accessible via the app variable.
const app = express()

app.get('/', async (req, res) => {
    // Configure database access URI and primary key
    const endpoint = "https://node-nosql.documents.azure.com:443/";
    const authKey = "f0R2d0fHWadnTqZtudK2vo6HhxOedOdWtIh5GVdIg9C8W1w32Fix2D7Vaxdiqe1Gj7rkoKDJVICuOHqIEK0WkA==";

    // Database and container IDs
    const databaseId = "ToDoList";
    const containerId = "Items";

    // Create new item in the database with a random ID
    let documentDefinition = {
        "name": "Angus MacGyver",
        "state": "Building stuff"
    };

    // Instantiate the cosmos client, based on the endpoint and authorization key
    const cosmosClient = new CosmosClientInterface({
        endpoint: endpoint,
        auth: {
            masterKey: authKey
        },
        // Set consistency to "session" to ensure read-your-writes level
        // See: https://github.com/Azure/azure-cosmos-js/issues/159
        consistencyLevel: "Session"
    });

    try {
        // Open a reference to the database
        const dbResponse = await cosmosClient.databases.createIfNotExists({
            id: databaseId
        });
        let database = dbResponse.database;

        // Retrieve container
        // Shorter variant: create variable container, which is in reality responsee.container.
        // Longer variant would be:
        // const coResponse = await ...
        // const container = coResponse.container;
        const { container } = await database.containers.createIfNotExists({ id: containerId });

        // Add a new item to the container
        console.log("** Create item **");
        const createResponse = await container.items.create(documentDefinition);
        console.log(createResponse.body);

        // Execute SQL query to retrieve the new item
        console.log("** SQL query **");
        // Three alternatives:
        // 1) Version with escaping the parameter
        //const queryResponse = await container.items.query("SELECT * FROM c WHERE c.id='" + querystring.escape(newItemId) + "'").toArray();


        // 3) Read the item through an API function instead of a query
        //const { body } = await container.item(newItemId).read();
        //console.log(body);

        // Delete item
        // console.log("** Delete item **");
        // const deleteResponse = await container.item(newItemId).delete();
        // console.log(deleteResponse.item.id);

        // Read all items from the container
        console.log("** All items **");
        const docResponse = await container.items.readAll().toArray();


        console.log(docResponse.result);

        res.send(docResponse);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error with database query: " + error.body);
    }

});


// Start the server, listen at port 3000 (-> http://127.0.0.1:3000/)
// Also print a short info message to the console (visible in
// the terminal window where you started the node server).
app.listen(3001, () => console.log('Node.js Cosmos DB client example listening on port 3001!'))
