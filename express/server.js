'use strict';
const express = require('express');
const path = require('path');
const serverless = require('serverless-http');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios').default;
const httpSignature = require('http-signature');

require('dotenv').config()
const trtlApp = require('trtl-apps').TrtlApp
trtlApp.initialize('7ITsOgFe4QQAY7tJh3yU', process.env.APP_SECRET)

const router = express.Router();

const dlcPrice = 7;
const dlcPriceAtomic = dlcPrice * 100;

router.get('/', (req, res) => {
    res.send("<h1> ur boi sajo yobda </h1>")
})

/** Creates new account. */
router.get('/trtlapps/newAccount', async (req, res) => {
    let [account, error] = await trtlApp.createAccount();

    if (account) {
        res.json({
            err: "",
            accountId: account.id,
            balance: account.balanceUnlocked,
            address: account.depositAddress,
            qrCode: account.depositQrCode,
        });
    } else {
        res.json({
            err: error
        });
    }
});

/** Gets an account.
 * Used so that the client can get account info
 * Must pass the account id in the body
 * Format:
 * {accountId: "foobar"}
 * If this is changed in the save then too bad?
*/
router.post('/trtlapps/getAccount', async (req, res) => {

    let accId = req.body['accountId'];
    let [account, error] = await trtlApp.getAccount(accId);

    if (account) {
        res.json({
            err: "",
            accountId: account.id,
            balance: account.balanceUnlocked,
            address: account.depositAddress,
            qrCode: account.depositQrCode,
        });
    } else {
        res.json({
            err: error,
        });
    }
});

/** Checks if the balance is equal to the set price
 * We assume that we create a new account each time, so the inital will always be 0
 */
router.post('/trtlapps/checkIfReceived', async (req, res) => {

    let accId = req.body['accountId'];
    let [account, error] = await trtlApp.getAccount(accId);

    if (account) {
        if (account.balanceUnlocked >= dlcPriceAtomic) {
            res.json({
                err: "",
                result: true
            })
        } else {
            res.json({
                err: "",
                result: false
            })
        }
    } else {
        res.json({
            err: error,
            result: false
        });
    }
});

// router.get('/new', (req, res) => {
//     res.writeHead(200, { 'Content-Type': 'text/html' });

//     axios.post('https://api.turtlepay.io/v2/new', {
//         amount: 100,
//         address: "TRTLuycw5LqgHKbJsvYSFLCJP5qnTbReo9rPEeCHSzkwLBqfG6hjcuNX9vamnUcG35BkQy6VfwUy5CsV9YNomioPGGyVhGV1U4P",
//         privateViewKey: "66a73b90665cbee550f3c9e4e9390aa93ff2ff2290989b47f9c1abc630d37b0c",
//         confirmations: 30,
//         // callback: "https://testsajoeexpress.netlify.com/.netlify/functions/server/turtlepay",
//        })
//        .then((response) => {
//             let d = JSON.stringify(response.data);

//             res.write("<br><br>");
//             res.write(d);

//             let jd = JSON.parse(d);
//             console.log(jd);
//             pubKey = jd['callbackPublicKey'];

//             res.write("<br><br>");
//             res.write('address: ' + jd['sendToAddress']);
//             res.write("<br>");
//             res.write('amount: ' + jd['amount']);

//             res.end();
//     });
// });

// router.get('/another', (req, res) => {
//     res.json({ route: req.originalUrl, a:"l" });
// });

// router.post('/turtlepay', (req, res) => {
//     let turtleh = req.headers;
//     let turtled = req.body;
//     let address = turtled['address']
//     let status = turtled['status']

//     if (status != 100) {
//         status = false;
//     } else {
//         status = true
//     }

//     let parsed;
//     let sigResult;

//     try {
//         parsed = httpSignature.parseRequest(req);
//         sigResult = httpSignature.verifySignature(parsed, pubKey);
//     } catch (e) {
//         parsed = "";
//         sigResult = false;
//     }

//     res.send({
//         turtleh,
//         turtled,
//         done: status,
//         addr: address,
//         parse: parsed,
//         realOrNot: sigResult,
//     });

// });

// router.get('/turtlepay', (req, res) => {
//     res.json(
//         {
//             addr: address,
//             headers: turtleh,
//             data: turtled,
//             // pub: pubKey,
//             parseR: parsed,
//             actualTurtlePay: sigResult,
//         }
//     );
// });

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => router); //res.sendFile(path.join(__dirname, '../index.html')));

module.exports = app;
module.exports.handler = serverless(app);