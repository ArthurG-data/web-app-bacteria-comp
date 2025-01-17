function signinCallback(authResult) {
    if (authResult['status']['signed_in']) {
  
       // Add the Google access token to the Amazon Cognito credentials login map.
       AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'IDENTITY_POOL_ID',
          Logins: {
             'accounts.google.com': authResult['id_token']
          }
       });
  
       // Obtain AWS credentials
       AWS.config.credentials.get(function(){
          // Access AWS resources here.
       });
    }
  }