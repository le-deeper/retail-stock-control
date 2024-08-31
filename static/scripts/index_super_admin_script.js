async function deleteProduct(parentDiv) {
    const productId = document.getElementById('delete-product-id').value;

    if (!checkInputs(productId)) return;
    sendRequest('/delete_product/', { product_id: productId }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            clearInputs(parentDiv);
        }
    })
}

async function deleteCategory() {
    const categoryId = document.getElementById('category-name').value;

    if (!checkInputs(categoryId)) return;

    sendRequest('/delete_category/', { category_id: categoryId }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}

async function addGerant() {
    const gerantName = document.getElementById('new-gerant-name').value;
    const gerantPwd = document.getElementById('new-gerant-pwd').value;
    const isAdmin = document.getElementById('isAdmin').checked ? 1 : 0;
    const gerantSite = document.getElementById("new-gerant-site").value

    if (!checkInputs(gerantName, gerantPwd, gerantSite)) return;

    sendRequest('/add_gerant/', { gerant_name: gerantName, gerant_pwd: gerantPwd,
        is_admin: isAdmin, site: gerantSite }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}

async function deleteGerant() {
    const gerantId = document.getElementById('delete-gerant-selection').value;

    if (!checkInputs(gerantId)) return;

    sendRequest('/delete_gerant/', { gerant_id: gerantId }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}

async function addSite() {
    const name = document.getElementById('new-site-name').value;
    if (!checkInputs(name)) return;

    sendRequest('/add_site/', { site_name: name }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}

async function promoteGerant() {
    const gerantId = document.getElementById('promote-gerant-selection').value;

    if (!checkInputs(gerantId)) return;
    sendRequest('/promote_gerant/', { gerant_id: gerantId }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}

async function demoteGerant() {
    const gerantId = document.getElementById('demote-gerant-selection').value;

    if (!checkInputs(gerantId)) return;

    sendRequest('/demote_gerant/', { gerant_id: gerantId }, "main-loading", 'POST').then(data => {
        if (data.status !== 'error') {
            location.reload();
        }
    })
}