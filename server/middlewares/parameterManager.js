SSM = require("@aws-sdk/client-ssm");
const { SSMClient} = require('@aws-sdk/client-ssm');
const client = new SSM.SSMClient({ region: "ap-southeast-2" });

let parameterCache = {};

async function getParameter(parameterName) {
    // Check if the parameter is already in the cache
    const path = "/n11371200/web-app"
    if (parameterCache[parameterName]) {
        return parameterCache[parameterName]; // Return cached value
    }

    const client = new SSMClient({ region: "ap-southeast-2" });
    
    try {
        const response = await client.send(
            new SSM.GetParameterCommand({
                Name: `${path}/${parameterName}`
            })
        );

        // Cache the fetched parameter value
        parameterCache[parameterName] = response.Parameter.Value;
        console.log("Param feteched:", parameterName);
        return response.Parameter.Value;
    } catch (error) {
        console.error(`Error fetching parameter ${parameterName}:`, error);
        throw error; // re-throwing the error so you can handle it outside the function if needed
    }
}

module.exports = { getParameter };
