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

async function saveNewProduct() {
    display_hide("loading", "main-loading")
    const productName = document.getElementById('product-name').value;
    const productCategory = document.getElementById('product-category').value;
    const productBarcode = document.getElementById('product-barcode').value;
    const productPrice = document.getElementById('new-product-price').value;
    const productImage = document.getElementById('product-image').files[0];
    const productImageUrl = document.getElementById('product-image-url').value;
    const productWarningQty = document.getElementById("new-product-warning-qty").value

    if (!productName || !productCategory || !productPrice ||
        (!productImage && !productImageUrl) || !productWarningQty) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('name', productName);
    formData.append('category', productCategory);
    formData.append('barcode', productBarcode);
    formData.append('price', productPrice);
    if (productImage) formData.append('image', productImage);
    formData.append('image_url', productImageUrl);
    formData.append('warning_quantity', productWarningQty);

    try {
        const response = await fetch('/add_product/', {
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
        showPopup(responseData.message);
        if (response.ok) clearInputs(document.getElementById("new-product"))

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true)
    }
}

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

async function changeProductPrice() {
    display_hide("loading", "main-loading")
    const productId = document.getElementById('change-product-price-id').value;
    const newPrice = document.getElementById('change-product-price-price').value;

    if (!productId || !newPrice) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('new_price', newPrice);

    try {
        const response = await fetch('/change_product_price/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });
        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) clearInputs(document.getElementById("change-price-product"));

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function deleteProduct() {
    display_hide("loading", "main-loading")
    const productId = document.getElementById('delete-product-id').value;

    if (!productId) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('product_id', productId);

    try {
        const response = await fetch('/delete_product/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) clearInputs(document.getElementById("delete-product"));

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function addCategory() {
    display_hide("loading", "main-loading")
    const categoryName = document.getElementById('new-category-name').value;

    if (!categoryName) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('category_name', categoryName);

    try {
        const response = await fetch('/add_category/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) {
            clearInputs(document.getElementById("new-category"));
            location.reload();
        }

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function deleteCategory() {
    display_hide("loading", "main-loading")
    const categoryId = document.getElementById('category-name').value;

    if (!categoryId) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez sélectionner une catégorie', true);
        return;
    }

    const formData = new FormData();
    formData.append('category_id', categoryId);

    try {
        const response = await fetch('/delete_category/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) {
            clearInputs(document.getElementById("delete-category"));
            location.reload();
        }

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function addGerant() {
    display_hide("loading", "main-loading")
    const gerantName = document.getElementById('new-gerant-name').value;
    const gerantPwd = document.getElementById('new-gerant-pwd').value;
    const isAdmin = document.getElementById('isAdmin').checked ? 1 : 0;
    const gerantSite = document.getElementById("new-gerant-site").value

    if (!gerantName || !gerantSite || !gerantPwd) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez remplir tous les champs', true);
        return;
    }

    const formData = new FormData();
    formData.append('gerant_name', gerantName);
    formData.append('gerant_pwd', gerantPwd);
    formData.append('is_admin', isAdmin);
    formData.append('site', gerantSite)

    try {
        const response = await fetch('/add_gerant/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) {
            clearInputs(document.getElementById("new-gerant"));
            location.reload();
        }

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function deleteGerant() {
    display_hide("loading", "main-loading")
    const gerantId = document.getElementById('delete-gerant-selection').value;

    if (!gerantId) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez sélectionner un gérant', true);
        return;
    }

    const formData = new FormData();
    formData.append('gerant_id', gerantId);

    try {
        const response = await fetch('/delete_gerant/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        showPopup(responseData.message);
        if (response.ok) {
            clearInputs(document.getElementById("delete-gerant"));
            location.reload();
        }

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function addSite() {
    display_hide("loading", "main-loading")
    const name = document.getElementById('new-site-name').value;

    if (!name) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez saisir un nom', true);
        return;
    }

    const formData = new FormData();
    formData.append('site_name', name);

    try {
        const response = await fetch('/add_site/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formData
        });

        const responseData = await response.json();
        display_hide("loading", "main-loading")
        if (responseData.status === 'error') {
            showPopup(responseData.message, true);
        }
        else showPopup(responseData.message);
        if (response.ok) clearInputs(document.getElementById("add-site"));
        location.reload();


    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function promoteGerant() {
    display_hide("loading", "main-loading")
    const gerantId = document.getElementById('promote-gerant-selection').value;

    if (!gerantId) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez sélectionner un gérant', true);
        return;
    }

    const formData = new FormData();
    formData.append('gerant_id', gerantId);

    try {
        const response = await fetch('/promote_gerant/', {
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
        showPopup(responseData.message);
        if (response.ok) {
            clearInputs(document.getElementById("promote-gerant"));
            location.reload();
        }

    } catch (error) {
        display_hide("loading", "main-loading")
        showPopup("Erreur serveur", true);
    }
}

async function demoteGerant() {
    display_hide("loading", "main-loading")
    const gerantId = document.getElementById('demote-gerant-selection').value;

    if (!gerantId) {
        display_hide("loading", "main-loading")
        showPopup('Veuillez sélectionner un gérant', true);
        return;
    }

    const formData = new FormData();
    formData.append('gerant_id', gerantId);

    try {
        const response = await fetch('/demote_gerant/', {
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
        showPopup(responseData.message);

        if (response.ok) {
            clearInputs(document.getElementById("demote-gerant"));
            location.reload();
        }

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

const demoteGerantBtn = document.getElementById('demote-gerant-btn');
if (demoteGerantBtn !== null) {
    demoteGerantBtn.addEventListener('click', demoteGerant);
}

const setProductChangeBarcodeValue = (elt, code)=> {
    elt.querySelector('#change-product-barcode-barcode').value = code
}