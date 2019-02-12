import mongoose from 'mongoose'
import KeyVault from 'azure-keyvault'
import { AuthenticationContext } from 'adal-node';

export const connect = (clientId, clientSecret, vaultUri) => {
  // Authenticator - retrieves the access token
  var authenticator = function (challenge, callback) {
    // Create a new authentication context.
    var context = new AuthenticationContext(challenge.authorization);
    // Use the context to acquire an authentication token.
    return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function (err, tokenResponse) {
      if (err) throw err;
      // Calculate the value to be set in the request's Authorization header and resume the call.
      var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
      return callback(null, authorizationValue);
    });
  };
  var credentials = new KeyVault.KeyVaultCredentials(authenticator);
  var client = new KeyVault.KeyVaultClient(credentials);
  var connectionString = client.getSecret(vaultUri, "ConnectionString", "256030b0f3624eb39a5b9027ec591baf");
  return mongoose.connect(connectionString)
}
