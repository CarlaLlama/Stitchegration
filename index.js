
import Koa from 'koa';
import router from './src/router.js';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import forceSSL from 'koa-force-ssl';
import bodyParser from 'koa-bodyparser-graphql';

dotenv.config()
const app = new Koa();

app.on('error', err => {
  console.error('server error', err)
});
app.use(bodyParser());

app.use(async (ctx, next) => {
  await next();
});

app.use(router.routes())
app.use(forceSSL());

// SSL options
var options = {
  cert: fs.readFileSync('./keys/certificate.pem')
};

// start the server
http.createServer(app.callback()).listen(5000);
https.createServer(options, app.callback()).listen(3000);
https.createServer(options, app.callback()).listen(9000);
