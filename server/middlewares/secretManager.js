const SecretsManager = require("@aws-sdk/client-secrets-manager");
const client = new SecretsManager.SecretsManagerClient({region:"ap-southeast-2"});
const {getParameter} = require("./parameterManager");


let cachedSecret;



async function fetchSecret(secret_name){
    try{
        const response = await client.send(new SecretsManager.GetSecretValueCommand({SecretId : secret_name}));
        if ('SecretString' in response){
	  const secret = JSON.parse(response.SecretString);
      console.log('secret fetched:', secret_name);
	  return secret;
	} else{
		throw new Error("Secret is in binary format.")
		}
    } catch(error){
        console.error("Failed to retrieve secret:", error);
        throw error;
    }
}


async function fetchLoginSecret(){
	 if (cachedSecret){
        return cachedSecret;
    }

    try{
        const authSecret = await getParameter("secretAuth");
	const secret = await fetchSecret(authSecret);
        cachedSecret = secret.secret;
        console.log("cached secret:",cachedSecret);
	return cachedSecret;
}catch (error) {
console.error("Login secret retrieval failed:", error);
throw new Error('Login secret retrieval failed')};
};



module.exports =
 {fetchSecret, fetchLoginSecret };
