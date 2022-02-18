import Router from 'koa-router';
const router = new Router();
import { generateVerifierChallengePair, generateRandomStateOrNonce } from './utils/code-verifier.js';
import { buildAuthorizationUrl, getConfidentialAccessToken } from './services/stitch-requests.js';
import APIRequestService from './services/api-requests.js';

let localVerifier = {};
let localAuth;

/**
 * Use this method to manually retrieve client access token
 */
router.get('/token', async ctx => {
  try {
    let results = await getConfidentialAccessToken();

    ctx.status = 200;
    ctx.body = {
      message: 'Successfully authed with client',
      accessToken: results['access_token']
    }

  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = `Could not request token. ${e.message}`;
  }
});

/**
 * Regular payment endpoint can only be used for confidential clients
 * Query params: amount, currency
 * Eg: /payment?amount=1&currency=ZAR
 */
router.get('/payment', async ctx => {
  try {
    let results = await getConfidentialAccessToken();
    localAuth = new APIRequestService(results['access_token'], results['refresh_token']);

    let response = await localAuth.requestPayment(ctx.query.amount, ctx.query.currency);

    if (
      response.data &&
      response.data.clientPaymentInitiationRequestCreate &&
      response.data.clientPaymentInitiationRequestCreate.paymentInitiationRequest &&
      response.data.clientPaymentInitiationRequestCreate.paymentInitiationRequest.url ) {
      const url = `${response.data.clientPaymentInitiationRequestCreate.paymentInitiationRequest.url}?redirect_uri=${process.env.CONFIDENTIAL_REDIRECT_URI}`;
      
      console.log('Payment request Id: ', response.data.clientPaymentInitiationRequestCreate.paymentInitiationRequest.id);

      ctx.redirect(url);
    } else {
      ctx.throw(`Payment failed: ${JSON.stringify(response.errors)}`);
    }
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = `Could not make payment. ${e}`;
  }
});

/**
 * Use this query to retrieve details of a payment request using the paymentRequestId
 * Query params: payment request id
 * Eg: /payment-status?id=cGF5cmVxL2RmNTIzMWViLWRkZmMtNGVkMy1iMzY3LTE1ODliMWEzMTEyNg==
 */
router.get('/payment-status', async ctx => {
  try {
    let results = await getConfidentialAccessToken();
    localAuth = new APIRequestService(results['access_token'], results['refresh_token']);
    let response = await localAuth.getPaymentStatus(ctx.query.id);
    ctx.body = response;
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = `Could not request token. ${e.message}`;
  }
});

/**
 * Use this method to authorize a user and receive an authorization code
 */
router.get('/authorize', async ctx => {
  let [verifier, challenge] = await generateVerifierChallengePair();
  let state = generateRandomStateOrNonce();
  let nonce = generateRandomStateOrNonce();
  localVerifier[state] = verifier;
  ctx.redirect(buildAuthorizationUrl(challenge, state, nonce));
});

/**
 * Use this method with a user token to retrieve an authorized user's account data
 */
router.get('/account', async ctx => {
  try {
    localAuth = new APIRequestService(ctx.body['access_token'], ctx.body['refresh_token']);
    ctx.body = await localAuth.getAccounts();
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = `Could not make account request. ${e.message}`;
  }
})

/**
 * Use this method with a user token to retrieve an authorized user's account ids
 */
router.get('/account-ids', async ctx => {
  try {
    localAuth = new APIRequestService(ctx.body['access_token'], ctx.body['refresh_token']);
    ctx.body = await localAuth.getAccountIds();
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = `Could not make account request. ${e.message}`;
  }
})

/**
 * User-constrained Endpoints
 * Query params: amount, currency
 * Requires user token to be retrieved from query body
 * Eg: /payment?amount=1&currency=ZAR
 */
router.get('/user-payment', async ctx => {
  try {
    localAuth = new APIRequestService(ctx.body['access_token'], ctx.body['refresh_token']);

    let accountId = await localAuth.getFirstAccountId();
    if (accountId) {
      let response = await localAuth.requestUserConstrainedPayment(ctx.query.amount, ctx.query.currency, accountId);
      if (
        response.data &&
        response.data.userPaymentInitiationRequestCreate &&
        response.data.userPaymentInitiationRequestCreate.paymentInitiationRequest &&
        response.data.userPaymentInitiationRequestCreate.paymentInitiationRequest.url ) {
        const url = `${response.data.userPaymentInitiationRequestCreate.paymentInitiationRequest.url}?redirect_uri=${process.env.CONFIDENTIAL_REDIRECT_URI}`;
        paymentId = response.data.userPaymentInitiationRequestCreate.paymentInitiationRequest.id;
        ctx.redirect(url);
      } else {
        ctx.throw(`Payment failed: `, response);
      }      
    }

  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = `Could not request token. ${e.message}`;
  }
});

export default router;