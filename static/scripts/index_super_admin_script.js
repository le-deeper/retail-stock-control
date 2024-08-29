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