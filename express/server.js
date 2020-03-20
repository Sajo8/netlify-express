'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios').default;
const httpSignature = require('http-signature');

const router = express.Router();

router.get('/', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('ur boi sajo here');
  res.write('hereher');
  res.end()
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
            let d = JSON.stringify(response.data);

            res.write("<br><br>");
            res.write(d);

            let jd = JSON.parse(d);
            console.log(jd);
            pubKey = jd['callbackPublicKey'];

            res.write("<br><br>");
            res.write('address: ' + jd['sendToAddress']);
            res.write("<br>");
            res.write('amount: ' + jd['amount']);

            res.end();
    });
});

router.get('/another', (req, res) => {
    res.json({ route: req.originalUrl, a:"l" });
});

router.post('/turtlepay', (req, res) => {
    let turtleh = req.headers;
    let turtled = req.body;
    let address = turtled['address']
    let status = turtled['status']

    if (status != 100) {
        status = false;
    } else {
        status = true
    }

    let parsed;
    let sigResult;

    try {
        parsed = httpSignature.parseRequest(req);
        sigResult = httpSignature.verifySignature(parsed, pubKey);
    } catch (e) {
        parsed = "";
        sigResult = false;
    }

    res.send({
        turtleh,
        turtled,
        done: status,
        addr: address,
        parse: parsed,
        realOrNot: sigResult,
    });

});

router.get('/turtlepay', (req, res) => {
    res.json(
        {
            addr: address,
            headers: turtleh,
            data: turtled,
            // pub: pubKey,
            parseR: parsed,
            actualTurtlePay: sigResult,
        }
    );
});


app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => router); //res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);
