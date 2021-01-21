const fs = require('fs');
const stripe = require('stripe')(process.env.API_KEY)
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const dateNow = Date.now()

async function getStripeBalance() {
    await stripe.balance.retrieve((err, balance) => {
        console.log('stripe', balance);
        if (err) { return false }
        balance.date = dateNow
        fs.writeFile('docs/stripe.json', JSON.stringify(balance), 'utf8', (err) => {
            if (err) console.log(err)
        })
        return true
    })
}

getStripeBalance()

async function getBankBalance() {
    const url = 'https://kunde.comdirect.de/lp/wt/login?execution=e2s1'
    const browser = await puppeteer.launch({
        headless: false
    })
    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9')
    await page.setViewport({
        width: 1280,
        height: 780,
        deviceScaleFactor: 1,
    })

    await page.goto(url)
    await page.waitFor(2000)

    let buttonCookie = ''

    const buttonCookie1 = await page.$('#uc-btn-accept-banner')
    const buttonCookie2 = await page.$('#privacy-init-wall-button-accept')

    if (buttonCookie1) {
        buttonCookie = buttonCookie1
    }

    if (buttonCookie2) {
        buttonCookie = buttonCookie2
    }
    
    if (buttonCookie) { await buttonCookie.click() }

    await page.waitForSelector('#param1Input')
    await page.waitFor(1000)
    await page.type('#param1Input', process.env.BANK_1)
    await page.waitFor(1000)
    await page.type('#param3Input', process.env.BANK_2)

    await page.waitForSelector('#loginAction')
    const buttonSignin = await page.$('#loginAction')
    await buttonSignin.click()

    await page.waitFor(1000)
    await page.waitForSelector('table')
    const balanceWrapper = await page.$$('[data-label="Kontostand"]')

    const balance = balanceWrapper[1]
    const balanceValue = await page.evaluate(balance => balance.innerText, balance)
    const balanceClean = balanceValue.split('€')[0].trim()
    const balanceFloat = parseFloat(balanceClean.replace(/\./g, '').replace(/\,/g, '.'))
    const balancesObject = { balances: { account: balanceFloat, date: dateNow } }

    fs.writeFile('docs/bank.json', JSON.stringify(balancesObject), 'utf8', (err) => {
        if (err) console.log(err)
    })

    await page.waitFor(2000)
    await page.waitForSelector('#llLink')
    const buttonLogout = await page.$('#llLink')
    await buttonLogout.click()

    await browser.close()
}

getBankBalance()
