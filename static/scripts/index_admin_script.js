async function saveNewProduct(parentDiv) {
    const productName = document.getElementById('product-name').value;
    const productCategory = document.getElementById('product-category').value;
    const productBarcode = document.getElementById('product-barcode').value;
    const productPrice = document.getElementById('new-product-price').value;
    const productImage = document.getElementById('product-image').files[0];
    const productImageUrl = document.getElementById('product-image-url').value;
    const productWarningQty = document.getElementById("new-product-warning-qty").value

    if (!checkInputs(productName, productCategory, productPrice)) return;
    const data = { name: productName, category: productCategory, barcode: productBarcode,
        price: productPrice, image: productImage ? productImage : false,
        image_url: productImageUrl, warning_quantity: productWarningQty }
    sendRequest('/add_product/', data, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            clearInputs(parentDiv);
        }
    })
}

async function changeProductPrice(parentDiv) {
    const productId = document.getElementById('change-product-price-id').value;
    const newPrice = document.getElementById('change-product-price-price').value;

    if (!checkInputs(productId, newPrice)) return;

    sendRequest('/change_product_price/', { product_id: productId, new_price: newPrice }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            clearInputs(parentDiv);
        }
    })
}

async function addCategory() {
    const categoryName = document.getElementById('new-category-name').value;

    if (!checkInputs(categoryName)) return;
    sendRequest('/add_category/', { category_name: categoryName }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}