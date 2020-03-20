'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios').default;
const httpSignature = require('http-signature');
const crypto = require('crypto')


const router = express.Router();

var d;

var addressToSend = "nope";

var pubKey = ""
var parsed = ""
var sigResult = false

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('ur boi sajo here');
  res.write('hereher');
  res.end()
  console.log("ya boi");
})

router.get('/new', (req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });

    axios.post('https://api.turtlepay.io/v2/new', {
        amount: 100,
        address: "TRTLuycw5LqgHKbJsvYSFLCJP5qnTbReo9rPEeCHSzkwLBqfG6hjcuNX9vamnUcG35BkQy6VfwUy5CsV9YNomioPGGyVhGV1U4P",
        privateViewKey: "66a73b90665cbee550f3c9e4e9390aa93ff2ff2290989b47f9c1abc630d37b0c",
        confirmations: 30,
        // callback: "https://testsajoeexpress.netlify.com/.netlify/functions/server/turtlepay",
       })
       .then((response) => {
            d = JSON.stringify(response.data);

            res.write("<br><br>");
            res.write(d);

            var jd = JSON.parse(d);
            console.log(jd);
            pubKey = jd['callbackPublicKey'];
            addressToSend = jd['sendToAddress'];

            res.write("<br><br>");
            res.write('address: ' + addressToSend);
            res.write("<br>");
            res.write('amount: ' + jd['amount']);

            res.end();
    });
});

router.get('/another', (req, res) => {
    res.json({ route: req.originalUrl, a:"k" });
});

var turtleh = "";
var turtled = "";


router.get('/turtlepay', (req, res) => {
    res.json(
        {
            origAddr: addressToSend,
            headers: turtleh,
            data: turtled,
            pub: pubKey,
            parseR: parsed,
            actualTurtlePay: sigResult,
        }
    );
});

router.post('/turtlepay', (req, res) => {
    turtleh = req.headers;
    turtled = req.body;

    var dataData = JSON.parse(turtled);
    if (dataData['address'] != addressToSend) {
        turtleh = "";
        turtled = "";
    }

    parsed = httpSignature.parseRequest(req);
    sigResult = httpSignature.verifySignature(parsed, pubKey)
});


app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
