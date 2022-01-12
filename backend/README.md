# Instructions

To see more details about each API route & how it works, visit the `routes` folder and look through the different end points in the files there.

Main endpoint starters are:
`/api/login`,
`/api/listings`,
`/api/contracts`,
`/api/nftOwners`,
`/api/purchases`.

### Paste-In's

__MongoDB__: Add your MongoDB cluster URL to the `index.ts` file. The one that's currently there is for local testing. Do not test with the production one if there are actual real entries already on there.

![2022-01-11_18-44](https://user-images.githubusercontent.com/32179921/149054591-e2594b8a-8c11-4251-b253-022dda994db0.png)

__Marketplace Contract__: The marketplace contract address must be given to `connections.ts` in the `helpers` folder.

__Connection to Blockchain__: Put in your Harmony Connection URL in the `connections.ts` file in the `helpers` folder.

![2022-01-11_18-26](https://user-images.githubusercontent.com/32179921/149052902-31736fdc-d1ad-4c7b-bcbc-3fcbcdd2f920.png)


### Authorization/Authentication
1. Create a simple UI to be able to:
  a. Create an account (POST `/api/login/newUser`)
  b. Login (POST `/api/login`)
  
❗ __IMPORTANT__: Once you have created the LogIn form, in order to get admin access you must go into the DB manually & update the `isAdmin` to `true` for whatever accounts you want to allow to remove and add NFT/Staking contracts.

Also important to note that you must _NOT_ add in the NFT/Staking contracts manually because the API endpoints handle creating a new listener for the address you provide.

However, if the DB is down, you may add it in manually since whenever the DB starts it will setup listeners for all the addressess that are in the DB. Advisable to not do this though because it leaves room for error since the API endpoint has checks in place to make sure the address you provide is valid & will work properly.

2. Once you have signed in, the API POST request (`/api/login`) will return a JWT token in the `x-auth-header` HTTP header. 
3. With this token value, you want to then add it to a cookie to then be able to send it back to the backend.
4. For the backend to work properly, the `x-auth-header` should have this JWT token on the request header. It relies on being able to see this value in that exact header, so it's important to include that. 
   - If the account that has the JWT token is not an admin by `isAdmin: true` it will fail to allow you to use the end point.


