Welcome to Stitchegration API!

Here you will find the tools you need to make some basic queries and mutations for Stitch API.

There are some basic concepts to understand in order to use these docs:

1. Client tokens
These allow you access to the Stitch API. In order to retrieve a client token you will need to call the /token endpoint.
Using these tokens you can make requests to create payment requests.

2. User tokens
These tokens allow access to user authenticated actions. You will need your client token and user permissions (through linking an account) to receive one.
Using these tokens you can make account data queries, create user constrained payments, etc.

Refer to the Stitch Developer Docs if you need them: https://stitch.money/docs/introduction/about

-----------

To use this project locally, pop your `certificate.pem` and `client.json` files in the `/keys` directory and run `npm i` then `npm run serve`!

This project runs by default on localhost:5000, but can be configured to your preferences.