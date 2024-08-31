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

const addNewProductOrder = () => {
    const formContainer = document.getElementById('new-command');
    // const newRow = document.createElement('div');
    let new_command = document.getElementsByClassName("product-command")[0]
    const newRow = new_command.cloneNode(true)
    clearInputs(newRow)
    formContainer.appendChild(newRow);
    if (!formContainer.classList.contains('hidden')) {
        newRow.getElementsByClassName('product-search')[0].focus();
    }
}


async function sendOrder(parentDiv) {
    const products = [];
    const productDivs = parentDiv.getElementsByClassName('product-command');
    let isCommandWithOneProduct = false

    for (let productDiv of productDivs) {
        const productCode = productDiv.getElementsByClassName('product-code')[0].value;
        const quantity = productDiv.getElementsByClassName('quantity')[0].value;
        const price = productDiv.getElementsByClassName('price')[0].value;
        const isGift = productDiv.getElementsByClassName('isGift')[0].checked;

        if (!productCode || !quantity || !price) {
            continue;
        }
        else isCommandWithOneProduct = true;

        products.push({
            productCode: productCode,
            quantity: quantity,
            price: price,
            is_gift: isGift
        });
    }
    if (!checkInputs(isCommandWithOneProduct)) return;

    let paiementMethod = document.getElementById('paiement').value;
    if (paiementMethod === 'none') {
        showPopup('Veuillez choisir un mode de paiement', true);
        return;
    }
    const clientName = document.getElementById('client-name').value;
    const comment = document.getElementById("command-comment").value;
    const isBuyingLater = document.getElementById('isBuyingLater').checked;
    sendRequest('/submit/', { products: products , paiement_method: paiementMethod,
        client_name: clientName, comment: comment, is_buying_later: isBuyingLater}, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            clearInputs(parentDiv);
            document.getElementById("command-total").textContent = `Total: 0 ${currency}`;
        }
    });

}

document.addEventListener('keydown', function(event) {
    if (event.key === 'm' && event.ctrlKey) {
        // Call the desired function here
        addNewProductOrder();
    }
});

async function supplyProduct(parentDiv) {
    const productId = document.getElementById('supply-product-id').value;
    const productQuantity = document.getElementById('supply-product-qty').value;
    const productPrice = document.getElementById('supply-product-price').value;
    const productChangePrice = document.getElementById('supply-product-change-price').value;
    const productFour = document.getElementById('supply-product-four').value;
    const buyLater = document.getElementById('supply-product-buy-later').checked

    if (!checkInputs(productId, productQuantity, productPrice)) return;

    sendRequest('/supply_product/', { product_id: productId, quantity: productQuantity, price: productPrice,
        change_price: productChangePrice === 'on', four: productFour, buy_later: buyLater }, "main-loading",
        'POST').then(data => {
        if (data.status !== 'error') {
            clearInputs(parentDiv);
        }
    })
}

async function changerProductBarcode(parentDiv) {
    const productCode = document.getElementById('change-product-barcode-code').value;
    const productBarcode = document.getElementById('change-product-barcode-barcode').value
    if (!checkInputs(productCode, productBarcode)) return;

    sendRequest('/change_product_barcode/', { code: productCode, barcode: productBarcode }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            clearInputs(parentDiv);
        }
    })
}

const setProductChangeBarcodeValue = (elt, code)=> {
    elt.querySelector('#change-product-barcode-barcode').value = code
}