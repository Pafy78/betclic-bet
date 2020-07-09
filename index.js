require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const server = require('http').createServer(app);
const puppeteer = require('puppeteer');

const App = require('./src/app');

server.listen(process.env.PORT, () => {
    console.log('Server listening at port %d', process.env.PORT);
});

puppeteer.launch({headless: process.env.HEADLESS === '1'}).then(async (browser) => {
    const betclicBet = new App(browser);
    betclicBet.login();

    app.get('/test', async (req, res) => {
        res.send(true);
    });
});