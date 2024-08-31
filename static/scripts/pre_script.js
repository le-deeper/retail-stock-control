let showed_elt = {}

let isProcessing = false
let displayingQueue = []
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre',
    'Octobre', 'Novembre', 'Décembre']
const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
let chartsInstances = {}

const checkInputs = (...inputValues) => {
    for (let value of inputValues) {
        if (!value) {
            showPopup('Veuillez remplir tous les champs', true);
            return false;
        }
    }
    return true;
}

async function sendRequest(url, data, loading=null, method='POST') {
    if (loading !== null) await display_hide("loading", loading)
    url = url.endsWith('/') ? url : url + '/';
    let post = {}
    if (method === 'GET') {
        url += '?';
        for (let key in data) {
            url += `${key}=${data[key]}&`;
        }
        url = url.slice(0, -1);
    }
    else {
         post = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        }
    }
    try {
        const response = await fetch(url, post);

        const responseData = await response.json();
        if (loading !== null) await display_hide("loading", loading)
        if (responseData.message) showPopup(responseData.message, responseData.status === 'error');
        return responseData;
    } catch (error) {
        await display_hide("loading", "main-loading")
        if (loading !== null) await display_hide("loading", loading)
    }
}

const set_choice = (elt, updateTotal, ...changes) => {
    prnt = elt.parentElement.parentElement
    product_search = prnt.querySelector(".product-search")
    if (product_search !== null) product_search.classList.remove('red-color')
    console.log(prnt)
    for (let i = 0; i < changes.length; i+=2) {
        if (prnt.getElementsByClassName(changes[i]).length > 0) {
            let value = changes[i+1]
            // Si value est un string, on le remplace par value
            if (typeof value === 'string') {
                value = value.split('%a').join('\'')
            }
            prnt.getElementsByClassName(changes[i])[0].value = value;
        }
    }
    if (elt.parentElement.classList.contains('search-results')) {
        elt.parentElement.classList.toggle('hidden')
    }
    if (updateTotal) calcul_total();
}

const search = (elt, target=null, updateTotal=false, isQtyNeeded=true) => {
    const query = elt.value;
    elt.classList.add('red-color')
    let resultsContainer;
    if (target === null) resultsContainer = elt.parentElement.parentElement.lastElementChild;
    else resultsContainer = document.getElementById(target);

    if (query.length > 0) {
        sendRequest('/search/', {q: query, qty: isQtyNeeded ? 1 : 0}, null, 'GET').then(data => {
            let results = ""
            for (let prod of data) {
                const prix_achat = `${prod.prix_achat} ${currency}` ? prod.prix_achat : ""
                results += `
                    <div class="result" onclick='set_choice(this, ${updateTotal}, "product-code", ${prod.code}, "product-search", "${prod.nom.split('\'').join('%a')}", "price", ${prod.prix}, "quantity", 1)'>
                        <div>
                            <img src="${prod.image}" alt="">
                        </div>
                        <h3 class="result-title">${prod.nom} - ${prod.prix } ${currency} - ${prod.qte} unités - ${prix_achat} ${currency}</h3>
                    </div>
                    `
            }
            if (results === "") results = "<p class='error-text'>Aucun résultat</p>"
            resultsContainer.innerHTML = results
            resultsContainer.classList.remove('hidden');
        })
    } else {
        resultsContainer.classList.add('hidden');
    }
};

const searchByBarcode = (elt, barcode, updateTotal=true) => {

    sendRequest('search_barcode/', {q: barcode}, null, 'GET').then(data => {
        prod = data[0]
        set_choice(elt, updateTotal, "product-code", prod.code, "product-search", prod.nom, "price",
            prod.prix, "quantity", 1)
    });
};

function scanBarcode(elt, callback) {
    // Create the overlay div
    const overlay = document.createElement('div');
    overlay.id = 'barcode-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';
    overlay.innerHTML = '<div style="background: white; padding: 20px; border-radius: 10px; font-size: 20px;">Veuillez scanner le code barre</div>';
    document.body.appendChild(overlay);

    let barcode = '';
    let lastKeyTime = Date.now();

    // Listen for keypress events
    document.addEventListener('keypress', function (e) {
        const currentTime = Date.now();
        if (currentTime - lastKeyTime > 100) {
            barcode = '';
        }
        lastKeyTime = currentTime;

        if (e.key >= '0' && e.key <= '9') {
            barcode += e.key;
        }

        if (barcode.length >= 13) {
            document.body.removeChild(overlay);
            callback(elt, barcode)
            // barcode = '';
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            return '';
        }
    })
}

const display_hide = async (key, ...ids) => {
    if (isProcessing) {
        displayingQueue = [key, ...ids];
    }
    isProcessing = true;
    if (showed_elt[key] === undefined) showed_elt[key] = [];
    else {
        for (let i = showed_elt[key].length - 1; i >= 0; i--) {
            if (ids.includes(showed_elt[key][i])) continue;
            document.getElementById(showed_elt[key][i]).classList.toggle('hidden');
            showed_elt[key].pop()
        }
    }
    for (let id of ids) {
        document.getElementById(id).classList.toggle('hidden');
        if (!document.getElementById(id).classList.contains('hidden')) {
            showed_elt[key].push(id)
        }
    }
    isProcessing = false
    if (displayingQueue.length > 0) {
        await display_hide(...displayingQueue);
    }
};

const displayChart = (idCanvas, data, labels, title, type='line') => {
    const ctx = document.getElementById(idCanvas).getContext('2d');
    if (chartsInstances[idCanvas]) {
        chartsInstances[idCanvas].destroy();
    }

    const myChart = new Chart(ctx, {
        type: type, // Change to 'line', 'pie', bar, etc. for different chart types
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    chartsInstances[idCanvas] = myChart;

}

const setTodayDate = (startDateInput, endDateOutput) => {
    const today = new Date();
    const today_month = today.getMonth() / 10 < 1 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
    const today_day = today.getDate() / 10 < 1 ? `0${today.getDate()}` : today.getDate();
    const todayStr = `${today.getFullYear()}-${today_month}-${today_day}`;
    document.getElementById(startDateInput).value = todayStr;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow_month = tomorrow.getMonth() / 10 < 1 ? `0${tomorrow.getMonth() + 1}` : tomorrow.getMonth() + 1;
    tomorrow_day = tomorrow.getDate() / 10 < 1 ? `0${tomorrow.getDate()}` : tomorrow.getDate();
    const tomorrowStr = `${tomorrow.getFullYear()}-${tomorrow_month}-${tomorrow_day}`;
    document.getElementById(endDateOutput).value = tomorrowStr;
}