const add_new_product = () => {
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
    display_hide("loading", "main-loading")
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
    if (!isCommandWithOneProduct) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir au moins un produit', true);
        return;
    }

    let paiementMethod = document.getElementById('paiement').value;
    const clientName = document.getElementById('client-name').value;
    const comment = document.getElementById("command-comment").value;
    const isBuyingLater = document.getElementById('isBuyingLater').checked;

    try {
        const response = await fetch('/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ products: products , paiement_method: paiementMethod,
                client_name: clientName, comment: comment, is_buying_later: isBuyingLater})
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message, responseData.status === 'error');
        if (responseData.status !== 'error') {
            clearInputs(parentDiv);
            document.getElementById("command-total").textContent = `Total: 0 ${currency}`;
        }
    } catch (error) {
        console.error('Failed to submit order:', error);
        display_hide("loading", "main-loading")
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'm' && event.ctrlKey) {
        // Call the desired function here
        add_new_product();
    }
});

async function supplyProduct() {
    display_hide("loading", "main-loading")
    const productId = document.getElementById('supply-product-id').value;
    const productQuantity = document.getElementById('supply-product-qty').value;
    const productPrice = document.getElementById('supply-product-price').value;
    const productChangePrice = document.getElementById('supply-product-change-price').value;
    const productFour = document.getElementById('supply-product-four').value;
    const buyLater = document.getElementById('supply-product-buy-later').checked

    if (!productId || !productQuantity || !productPrice) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', productQuantity);
    formData.append('price', productPrice);
    formData.append('change_price', productChangePrice === 'on')
    formData.append('four', productFour)
    formData.append('buy_later', buyLater)


    try {
        const response = await fetch('/supply_product/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) clearInputs(document.getElementById("supply-product"));

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function changerProductBarcode() {
    display_hide("loading", "main-loading")
    const productCode = document.getElementById('change-product-barcode-code').value;
    const productBarcode = document.getElementById('change-product-barcode-barcode').value

    if (!productBarcode || !productCode) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('code', productCode);
    formData.append('barcode', productBarcode);

    try {
        const response = await fetch('/change_product_barcode/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        if (responseData.status === 'error'){
            showPopup(responseData.message, true);
        }
        else showPopup(responseData.message);

        if (response.ok) {
            clearInputs(document.getElementById("change-product-barcode"));
        }

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

const setProductChangeBarcodeValue = (elt, code)=> {
    elt.querySelector('#change-product-barcode-barcode').value = code
}