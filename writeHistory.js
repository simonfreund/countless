const fs = require('fs')
const dateNow = Date.now()

getCurrentBalances()

async function getCurrentBalances() {
    try {
        const jsonStripe = await fs.readFileSync('docs/stripe.json', 'utf8')
        const jsonBank = await fs.readFileSync('docs/bank.json', 'utf8')
        const jsonDebt = await fs.readFileSync('docs/debt.json', 'utf8')

        const dataStripe = JSON.parse(jsonStripe).available[0].amount / 100
        const dataBank = JSON.parse(jsonBank).balances.account
        const dataDebt = JSON.parse(jsonDebt).debt

        await writeData(dataBank, dataStripe, dataDebt)
    } catch (error) { return error }
}

async function writeData(dataBank, dataStripe, dataDebt) {
    const historyJSON = await fs.readFileSync('docs/history.json', 'utf8')
    let history = JSON.parse(historyJSON)
    history[dateNow] = { stripe: dataStripe, bank: dataBank, debt: dataDebt }
    await fs.writeFileSync('docs/history.json', JSON.stringify(history))
}