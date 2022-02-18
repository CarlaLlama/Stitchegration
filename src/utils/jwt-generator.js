import crypto from 'crypto';
import * as fs from 'fs';
import jwt from 'jsonwebtoken';


export async function generateJWT(clientId) {
  const issuer = clientId;
  const subject = clientId;
  const pemCert = fs.readFileSync('./keys/certificate.pem').toString('utf-8');
  const keyid = _getKeyId(pemCert);
  const jwtid = crypto.randomBytes(16).toString("hex");
  const audience = 'https://secure.stitch.money/connect/token';
  const options = {
    keyid,
    jwtid,
    notBefore: "0",
    issuer,
    audience,
    subject,
    expiresIn: "5m", // For this example this value is set to 5 minutes, but for machine usage should generally be a lot shorter
    algorithm: "RS256"
  };
  const token = await jwt.sign({}, pemCert, options);
  return token;
}
  
function _getKeyId(cert) {
  const lines = cert.split('\n').filter(x => x.includes('localKeyID:'))[0];
  const result = lines.replace('localKeyID:', '').replace(/\W/g, '');
  return result;
}