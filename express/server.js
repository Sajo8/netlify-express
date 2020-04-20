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

const dlcEnabled = true;

router.get('/', (req, res) => {
    res.send("<h1> ur boi sajo onder </h1>")
})

router.get('/trtlapps/getDlcEnabled', (req, res) => {
    res.json({
        result: dlcEnabled
    })
})

/** Creates new account.
 * Also gets the tonchan qr code
 * So we need the dlctype and stuff
*/
router.post('/trtlapps/newAccount', async (req, res) => {
    let accId = "";
    let typeOfDlc = req.body['dlcType'];

    let recipientName = "";

    if (typeOfDlc == "level") {
        recipientName = "Chukwa's Labyrinth - Level DLC";
    } else if (typeOfDlc == "skin") {
        recipientName = "Chukwa's Labyrinth - Skin DLC";
    } else {
        recipientName = "Chukwa's Labyrinth";
    }

    let [account, error] = await trtlApp.createAccount();
    if (account) {
        accId = account.id
    } else {
        res.json({
            err: error,
            qrErr: false
        })
    }

    let [qrCode, qrError] = await trtlApp.getAccountQrCode(accId, dlcPriceAtomic, recipientName);

    if (qrCode) {
        res.json({
            err: false,
            qrErr: false,
            accountId: account.id,
            address: account.depositAddress,
            qrCode: qrCode,
        });
    } else {
        res.json({
            err: error,
            qrErr: qrError,
        });
    }
});

/** Gets an account.
 * Used so that the client can get account info
 * Must pass the account id in the body
 * Format:
 * {accountId: "foobar"}
 * If this is changed in the save then too bad?
 *
 * It also gets a qr code and returns that because i cant be bothered to make another qr code POST request on the client side
 * For that, we need the type of DLC the person is going to buy
*/
router.post('/trtlapps/getAccount', async (req, res) => {
    let accId = req.body['accountId'];
    let typeOfDlc = req.body['dlcType'];

    let recipientName = "";

    if (typeOfDlc == "level") {
        recipientName = "Chukwa's Labyrinth - Level DLC";
    } else if (typeOfDlc == "skin") {
        recipientName = "Chukwa's Labyrinth - Skin DLC";
    } else {
        recipientName = "Chukwa's Labyrinth";
    }

    let [account, error] = await trtlApp.getAccount(accId);
    let [qrCode, qrError] = await trtlApp.getAccountQrCode(accId, dlcPriceAtomic, recipientName);


    if (account && qrCode) {
        res.json({
            err: false,
            qrErr: false,
            accountId: account.id,
            address: account.depositAddress,
            qrCode: qrCode,
        });
    } else {
        res.json({
            err: error,
            qrErr: qrError,
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
                err: false,
                result: true,
                locked: false
            })
        } else if (account.balanceLocked >= dlcPriceAtomic) {
            res.json({
                err: false,
                result: true,
                locked: true
            })
        } else {
            res.json({
                err: false,
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