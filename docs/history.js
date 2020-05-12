const wrapperElement = document.getElementById('balance-wrapper')

writeHistory()

async function writeHistory() {
    try {
        let historyData = await getHistory('https://raw.githubusercontent.com/simonfreund/countless/master/docs/history.json')
        await displayHistory(historyData)
    } catch (err) {
        console.log(err)
    }
}

async function getHistory(url) {
    let xhr = new XMLHttpRequest()
    return new Promise(function (resolve, reject) {
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status >= 300) {
                    reject("Error, status code = " + xhr.status)
                } else {
                    resolve(xhr.responseText)
                }
            }
        }
        xhr.open('get', url, true)
        xhr.send()
    })
}

async function displayHistory(historyData) {
    const dataAsJSON = JSON.parse(historyData)
    for (let [timestamp, value] of Object.entries(dataAsJSON)) {
        const secondWrapper = document.createElement('div')
        secondWrapper.className = 'flex'
        wrapperElement.appendChild(secondWrapper)

        const date = new Date(parseInt(timestamp)).toISOString()
        const day = date.substr(8, 2)
        const month = date.substr(5, 2)
        const year = date.substr(0, 4)
        const actualDate = `${day}.${month}.${year}`

        const newDivDate = document.createElement('div')
        secondWrapper.appendChild(newDivDate)
        const newContentDate = document.createTextNode(actualDate)
        newDivDate.appendChild(newContentDate)
        newDivDate.className = 'date'

        const stripe = value['stripe']
        const bank = value['bank']
        const debt = value['debt']
        const sum = stripe + bank - debt

        const modifiedNumber = sum.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, " ").replace(/\-/g, "– ")

        const newDivSum = document.createElement('div')
        secondWrapper.appendChild(newDivSum)
        const newContentSum = document.createTextNode(modifiedNumber)
        newDivSum.appendChild(newContentSum)

        if (sum > 0) {
            newDivSum.className = 'positive'
        }
        else {
            newDivSum.className = 'negative'
        }
    }
}