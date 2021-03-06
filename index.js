require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
const server = require('http').createServer(app);
const puppeteer = require('puppeteer');
const CronJob = require('cron').CronJob;
require('log-timestamp');
const superagent = require('superagent');

const App = require('./src/app');

server.listen(process.env.PORT, () => {
    console.log('Server listening at port %d', process.env.PORT);
});

// https://stackoverflow.com/questions/53681161/why-puppeteer-needs-no-sandbox-to-launch-chrome-in-cloud-functions
puppeteer.launch({
    headless: process.env.HEADLESS === '1',
    ignoreHTTPSErrors: true,
    userDataDir: './tmp',
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
    ]
}).then(async (browser) => {
    const betclicBet = new App(browser);
    console.log('ready');
    // betclicBet.addBets(
    //     [{
    //         choiceName: '%2%',
    //         matchName: 'test matchName',
    //         matchId: '2652243',
    //         betCode: 'lol',
    //         guadeloupeDate: 'lol',
    //         choiceOdd: 'lol',
    //         maxOdd: 'lol',
    //     }]
    // );

    const job = new CronJob('0 1,6,11,16,21,26,31,36,41,46,51,56 * * * *', () => {
        superagent.get(process.env.BET_URL)
            .then(res => {
                console.log(res.body);
                betclicBet.addBets(res.body.matchs);
            })
            .catch(err => {
                console.log('err get matchs', err);
            });
    }, null, true, 'UTC');
    job.start();
});
