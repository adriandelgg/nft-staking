# Instructions

Marketplace Contract:
The marketplace contract address must be given to "connections.ts" in the "helpers" folder.

Connection to Blockchain:
- Put in your Harmony Connection URL in the "connections.ts" file in the "helpers" folder.

Authorization/Authentication:
1. Create a simple UI to be able to:
  a. Create an account
  b. Login
- Once you have signed in, from the front end you want to save the returned JWT token
  that's given to you via the HTTP headers in a cookie.
  With this cookie, whenever you make a request you want to attach it to the
  "x-auth-token" header so that the backend can do its job.

