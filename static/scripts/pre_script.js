let showed_elt = {}

let isProcessing = false
let displayingQueue = []
const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre',
    'Octobre', 'Novembre', 'Décembre']
const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
let chartsInstances = {}

const calcul_total = () => {
    const products = document.getElementById("new-command").getElementsByClassName('product-command');
    let total = 0;
    for (let product of products) {
        const product_exist = product.getElementsByClassName('product-code')[0].value > 0;
        if (!product_exist) {
            continue;
        }
        if (product.getElementsByClassName('isGift')[0].checked) {
            continue
        }
        const quantity = product.getElementsByClassName('quantity')[0].value;
        const price = product.getElementsByClassName('price')[0].value;
        total += (quantity * price);

    }
    document.getElementById('command-total').innerText = `Total: ${total} ${currency}`;
}

const set_choice = (elt, updateTotal, ...changes) => {
    prnt = elt.parentElement.parentElement
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

const search = (elt, target=null, updateTotal=true, isQtyNeeded=true) => {
    const query = elt.value;
    let resultsContainer;
    if (target === null) {
        resultsContainer = elt.parentElement.parentElement.lastElementChild;
    }
    else {
        resultsContainer = document.getElementById(target);
    }
    if (query.length > 0) {
        // Simulate search results
        // const results = ['Produit 1', 'Produit 2', 'Produit 3'].filter(p => p.toLowerCase().includes(query.toLowerCase()));
        // faire une requête post à l'adresse search/ avec comme paramètre q = query
        fetch(`/search/?q=${query}&qty=${isQtyNeeded ? 1 : 0}`)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    showPopup(data.message, true)
                    return
                }
                let results = ""
                for (let prod of data) {
                    prix_achat = `${prod.prix_achat} ${currency}` ? prod.prix_achat : ""
                    results += `
                    <div class="result" onclick='set_choice(this, ${updateTotal}, "product-code", ${prod.code}, "product-search", "${prod.nom.split('\'').join('%a')}", "price", ${prod.prix}, "quantity", 1)'>
                        <div>
                            <img src="${prod.image}" alt="">
                        </div>
                        <h3 class="result-title">${prod.nom} - ${prod.prix } ${currency} - ${prod.qte} unités - ${prix_achat}</h3>
                    </div>
                    `
                }
                resultsContainer.innerHTML = results
                resultsContainer.classList.remove('hidden');
            })

        // add_search_reaction()
    } else {
        resultsContainer.classList.add('hidden');
    }
};

const searchByBarcode = (elt, barcode, updateTotal=true) => {

    // Simulate search results
    // const results = ['Produit 1', 'Produit 2', 'Produit 3'].filter(p => p.toLowerCase().includes(query.toLowerCase()));
    // faire une requête post à l'adresse search/ avec comme paramètre q = query
    fetch(`/search_barcode/?q=${barcode}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                showPopup(data.message, true)
                return
            }
            prod = data[0]
            set_choice(elt, updateTotal, "product-code", prod.code, "product-search", prod.nom, "price",
                prod.prix, "quantity", 1)
        })
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

const display_hide = (key, ...ids) => {
    if (isProcessing) {
        displayingQueue.push([key, ...ids])
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
        display_hide(...displayingQueue.pop());
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
    const todayStr = `${today.getFullYear()}-${today_month}-${today.getDate()}`;
    document.getElementById(startDateInput).value = todayStr;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow_month = tomorrow.getMonth()/10 < 1 ? `0${tomorrow.getMonth() + 1}` : tomorrow.getMonth() + 1;
    const tomorrowStr = `${tomorrow.getFullYear()}-${tomorrow_month}-${tomorrow.getDate()}`;
    document.getElementById(endDateOutput).value = tomorrowStr;
}