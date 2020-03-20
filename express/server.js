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

const dlcPrice = 5;
const dlcPriceAtomic = dlcPrice * 100;

router.get('/', (req, res) => {
    res.send("<h1> ur boi sajo yondarar </h1>")
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
                result: true,
                locked: false
            })
        } else if (account.balanceLocked >= dlcPriceAtomic) {
            res.json({
                err: "",
                result: true,
                locked: true
            })
        } else {
            res.json({
                err: "",
                result: false,
                locked: false
            })
        }
    } else {
        res.json({
            err: error,
            result: false,
            locked: false
        });
    }
});

app.use(bodyParser.json());
app.use('/.netlify/functions/server', router);  // path must route to lambda
app.use('/', (req, res) => router);

module.exports = app;
module.exports.handler = serverless(app);