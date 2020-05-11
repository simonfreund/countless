async function getBalances(url) {
    var xhr = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 300) {
                    reject("Error, status code = " + xhr.status)
                } else {
                    resolve(xhr.responseText);
                }
            }
        }
        xhr.open('get', url, true)
        xhr.send();
    });
}
async function addBalances() {
    try {
        let bankBalance = await getBalances('https://raw.githubusercontent.com/simonfreund/countless/master/docs/bank.json')
        let stripeBalance = await getBalances('https://raw.githubusercontent.com/simonfreund/countless/master/docs/stripe.json')
        let debtBalance = await getBalances('https://raw.githubusercontent.com/simonfreund/countless/master/docs/debt.json')
        await displayCurrentBalance(bankBalance, stripeBalance, debtBalance)
    } catch (err) {
        console.log(err)
    }
}
addBalances()

async function displayCurrentBalance(bankBalance, stripeBalance, debtBalance) {
    const currentBalanceBank = JSON.parse(bankBalance).balances.account
    const currentBalanceStripe = JSON.parse(stripeBalance).available[0].amount / 100
    const currentBalanceDebt = JSON.parse(debtBalance).debt
    const sum = currentBalanceBank + currentBalanceStripe - currentBalanceDebt
    const modifiedNumber = sum.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(/\-/g, "– ")

    if (sum >= 0) { document.getElementById("info").classList.add("positive") }

    document.getElementById("saldo").innerText = modifiedNumber
}





