import * as fs from 'fs';
import fetch from 'node-fetch';
import { generateJWT } from '../utils/jwt-generator.js';
const confScopes = ['client_paymentrequest'];
const clientDetails = JSON.parse(fs.readFileSync('./keys/client.json').toString('utf-8'));


export function buildAuthorizationUrl(challenge, state, nonce) {
  const search = {
    client_id: clientDetails.id,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    redirect_uri: clientDetails.redirectUrls[0],
    scope: clientDetails.allowedScopes.join(' '),
    response_type: 'code',
    nonce: nonce,
    state: state
  };
  const searchString = Object.entries(search).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  return `https://secure.stitch.money/connect/authorize?${searchString}`;
}

export async function getConfidentialAccessToken() {
  let token = await generateJWT(clientDetails.id);

  const body = {
    client_id: clientDetails.id,
    scope: confScopes.join(' '),
    audience: 'https://secure.stitch.money/connect/token',
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: token
  };

  return await _getAccessTokenHandler(body, 'client_credentials');
}

async function _getAccessTokenHandler(bodyOpts, grantType) {
  const body = {
    grant_type: grantType,
    ...bodyOpts
  };
  const bodyString = Object.entries(body).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  const response = await fetch('https://secure.stitch.money/connect/token', {
      method: 'post',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyString,
  });
  const responseBody = await response.json();
  return responseBody;
}
