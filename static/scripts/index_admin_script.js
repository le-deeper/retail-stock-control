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