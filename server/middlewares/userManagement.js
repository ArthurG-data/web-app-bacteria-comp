const Cognito = require('@aws-sdk/client-cognito-identity-provider');
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const jwt = require("jsonwebtoken");
const {fetchLoginSecret} = require('./secretManager');
const { v4: uuidv4 } = require('uuid');
const AWS = require('aws-sdk');
const sqlManager = require("./sqlManager")
const {initKnex} = require("../setup/knexConfig.js");
const {getParameter} = require("./parameterManager.js");

const client = new Cognito.CognitoIdentityProviderClient({ region: 'ap-southeast-2' });

async function completeNewPassword(req, res) {
  const { username, newPassword, session } = req.body;

  try {
    const response = await completeNewPasswordChallenge(username, newPassword, session);

    await handleSuccessfulAuth(res, response);

  } catch (error) {
    handleError(res, error);
  }
}


async function completeNewPasswordChallenge(username, newPassword, session) {
  const clientId = await getParameter("clientId");
  const command = new Cognito.RespondToAuthChallengeCommand({
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ClientId: clientId,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
    },
    Session: session,
  });

  return await client.send(command);
}


async function signup(req, res) {
  const {username, password, email} = req.body;
   //here randomly generate a user ID that will be stored
  const randomUserName = uuidv4();
  const knex = await initKnex();

  try{
    const clientId = await getParameter("clientId");
    const commande = new Cognito.SignUpCommand({
      ClientId: clientId,
      Username: randomUserName,
      Password: password,
      UserAttributes:[{Name:"email", Value: email}],
    });
    const response = await client.send(commande);
        //update metadata
    const responseAdd = await sqlManager.addEntryToAccountsTable(knex, randomUserName, username);
    res.status(200).json({ message: 'User signed up successfully' })
  } catch (error){
    console.error("Error signing up user:", error);
    res.status(500).json({error: "An error occured while signing up"})
  }
};

async function signin(req, res) {
  const { username, password } = req.body;
  console.log("Getting auth token");
  const knex = await initKnex();
  const user = await knex('accounts').select('id').where({ account_name: username }).first(); 
  if (!user) {
    // Handle the case where the user does not exist
    console.log(`User with account name ${username} not found.`);
    return { error: 'User not found' }; // or throw an error if needed
  }
  console.log(user); 
  //the first step is to query the unique ID from the username
  let userId;
  try {
    const knex = await initKnex();
    const user = await knex('accounts').select('id').where({ account_name: username }).first();

    if (!user) {
      // Handle case where the user is not found
      return res.status(404).json({ error: 'User not found' });
    }
    userId = user.id;
    console.log("userId:", userId)
  }catch (error){
    res.status(404).json({error: "user not found"})
  }

  try {
    const authResponse = await initiateAuth(userId, password);

    if (isNewPasswordRequired(authResponse)) {
      await handleNewPasswordRequired(res, authResponse);
    }
    else if (isMfaRequired(authResponse)){
      await handleMfaRequired(res, authResponse)
    
    }
    else{
      await handleSuccessfulAuth(res, authResponse);
    }

    


  } catch (error) {
    return handleError(res, error);
  }
}

async function initiateAuth(username, password) {
  const clientId = await getParameter("clientId");
  const command = new Cognito.InitiateAuthCommand({
    AuthFlow: Cognito.AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
    ClientId: clientId,
  });

  return await client.send(command);
}

function isNewPasswordRequired(authResponse) {
  return authResponse.ChallengeName === 'NEW_PASSWORD_REQUIRED';
}

function isMfaRequired(authResponse){
  console.log("mfa requires in server good");
  return (
    authResponse.ChallengeName === 'SMS_MFA' || 
    authResponse.ChallengeName === 'SOFTWARE_TOKEN_MFA'
  );
}

async function handleNewPasswordRequired(res, authResponse) {
  res.json({
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    Session: authResponse.Session,
    ChallengeParameters: authResponse.ChallengeParameters,
  });
}

async function handleMfaRequired(res, authResponse) {
  res.json({
    ChallengeName: authResponse.ChallengeName,  
    Session: authResponse.Session,             
    ChallengeParameters: authResponse.ChallengeParameters, 
    message: 'MFA_REQUIRED',              
  });
}

async function handleSuccessfulAuth(res, authResponse) {
  const secret = await fetchLoginSecret();
  const clientId = await getParameter("clientId");
  const userPoolId = await getParameter("userPoolId")

  const accessVerifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: "access",
    clientId: clientId,
  });

  const idVerifier = CognitoJwtVerifier.create({
    userPoolId: userPoolId,
    tokenUse: "id",
    clientId: clientId,
  });
  
   
    if (authResponse.AuthenticationResult) {
    // Process successful authentication
    const accessToken = await accessVerifier.verify(authResponse.AuthenticationResult.AccessToken);
    console.log("Access Token Verified:", accessToken);

    const idToken = await idVerifier.verify(authResponse.AuthenticationResult.IdToken);
    const username = idToken['cognito:username'] || idToken['username'] || 'defaultUsername';
    console.log("Username:", username);
    console.log("ID Token Verified:", idToken);

    const groups = idToken['cognito:groups'] || [];
    console.log("Groups:", groups);
    const isAdmin = groups.includes('admin');

    const customJWT = jwt.sign({ user: idToken, username: username, admin: isAdmin }, secret, { expiresIn: '30m' });
    console.log('User verified and JWT created');

    // Send the JWT back to the client
    res.json({ message: 'success', token: customJWT });
} else {
    // If something went wrong, handle it
    res.status(401).json({ message: 'Authentication failed' });
}
}
 
function handleError(res, error) {
  console.log("Error during sign-in:", error);
  res.status(500).json({ error: "Sign-in failed" });
}   

async function confirmMfa(req, res){
  const { mfaCode, session } = req.body;

    // Assuming cognitoUser and authenticationDetails are initialized elsewhere
 

    const cognitoUser = new CognitoUser({ Pool: userPoolId });
    cognitoUser.setSession(session);

    cognitoUser.sendMFACode(mfaCode, {
        onSuccess: async (authResult) => {
            // Handle successful MFA authentication
            await handleSuccessfulAuth(res, authResult); // Pass the result to your existing success handler
        },
        onFailure: (err) => {
            console.error('MFA confirmation failed:', err);
            res.status(401).json({ message: 'MFA failed', error: err.message });
        },
    });
}

async function confirmMail(req, res) {
  const { username, confirmationCode } = req.body; // Ensure the variable names match
  try {
    console.log("Confirmation started");
    console.log(req.body);
    const command2 = new Cognito.ConfirmSignUpCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: confirmationCode, 
    });

    const response = await client.send(command2);
    console.log(response);
    res.status(200).json({ message: "Confirmation successful" }); 
  } catch (error) {
    console.error("Error confirming email", error);
    res.status(500).json({ error: "An error occurred while confirming email" }); 
  }
}

async function Accounts(req, res){
  try{
    const knex = await initKnex();
    const result = await knex('accounts').select();
    console.log(result);
    res.status(200).json({message :"success", result: result});
  }catch (error){
    res.status(500).json({error: "An error occured while displaying all Accounts"});
  }

}

async function deleteUser(req,res){
  console.log("Starting deletion of the user");
  const userPoolId = await getParameter("userPoolId")


  try {
    const knex = await initKnex();
    const username = req.params.userId;
    console.log("username:", username); 
    const params = {
    UserPoolId: userPoolId,  // Your Cognito User Pool ID
    Username: username,      // The username of the user to be deleted
  };
    const command = new Cognito.AdminDeleteUserCommand(params);
    // Send the command to Cognito
    const response = await client.send(command);
    //delete the user from the user table

    console.log(`User ${username} deleted successfully from client`);
    const response2 = await sqlManager.deleteEntryFromAccountsTable(knex, username);
    console.log(`User ${username} deleted successfully from table`);
    res.status(200).json({message: "success", response: [response, response2]});

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({message: `Failure deleting user ${username}`, response: error})
  }
};

async function showFiles(req, res){
  const user = req.user.username;
  console.log("user:", user);
  try{
    const knex = await initKnex();
    const result = await knex('file').where({account_id : user}).select();
    console.log("result:", result);
    if (result.length > 0) {
      res.status(200).json(result); // Return all the files associated with the user
    } else {
      res.status(404).json({ message: "No files found for this user" }); // Handle case where no files are found
    }
  }catch (error){
    res.status(500).json({error: "An error occured while displaying all files"});
  }

}

async function getJobs(req, res) {
  try {
    const knex = await initKnex();
    const user = req.user.username;
    console.log('getJobs:', user)
    let result;
    // Check if userID parameter is present
    if (user) {
      result = await sqlManager.getJobsInfo(knex, user);
    } 
    console.log("result:", result);
    res.status(200).json(result); // Return the jobs

  } catch (error) {
    console.error("Error fetching jobs:", error); // Log the error for debugging
    res.status(500).json({ error: "An error occurred while displaying jobs" });
  }
}

async function deleJobs(req, res){
  try {
    const knex = await initKnex();
    const jobIdsToDelete = req.body.jobIds; // Get job IDs from request body
        if (!Array.isArray(jobIdsToDelete) || jobIdsToDelete.length === 0) {
            return res.status(400).json({ error: "No job IDs provided" });
        }
        const result = await sqlManager.deleteJobs(knex, jobIdsToDelete);
        console.log("Jobs deleted:", result);
        res.status(200).json({ result, message: 'Jobs deleted' });
  }catch(error){
    console.error("Error deleting jobs:", error);
    res.status(500).json({ error: "An error occurred while deleting jobs" });
  }

}


module.exports = {signup,confirmMfa, signin, confirmMail,Accounts, deleteUser, showFiles, getJobs, deleJobs};
