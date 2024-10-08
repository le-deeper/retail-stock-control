const downloadOrder = (order_id) => {
    // Ouvrir dans un nouvel onglet la page de téléchargement de la commande
    window.open(`/download-order-${order_id}/`, '_blank');
}


const toggle_modification_mode = (order) => {
    order.querySelectorAll('.command-product').forEach(item => {
        item.querySelector('.set-product-qty').classList.toggle('hidden');
        item.querySelector('.readonly-qty').classList.toggle('hidden');
        item.querySelector('.readonly-price').classList.toggle('hidden');
        item.querySelector('.set-product-price').classList.toggle('hidden');
    });
}

const editOrder = (order) => {
    toggle_modification_mode(order)
    order.querySelector('.edit-order').classList.add('hidden');
    order.querySelector('.save-edits').classList.remove('hidden');
    order.querySelector('.cancel-edits').classList.remove('hidden');
}

const cancelModifications = (order) => {
    order.querySelectorAll('.command-product').forEach(item => {
        item.querySelector('.set-product-qty').value = item.querySelector('.readonly-qty').textContent;
        item.querySelector('.set-product-price').value = parseFloat(item.querySelector('.readonly-price').textContent);
    });
    toggle_modification_mode(order)
    order.querySelector('.edit-order').classList.remove('hidden');
    order.querySelector('.save-edits').classList.add('hidden');
    order.querySelector('.cancel-edits').classList.add('hidden');
}

const saveModifications = async (order) => {
    const products = [];
    const productDivs = order.querySelectorAll('.command-product');

    for (let productDiv of productDivs) {
        const productCode = productDiv.getElementsByClassName('product-id')[0].value;
        const quantity = productDiv.getElementsByClassName('set-product-qty')[0].value;
        const price = productDiv.getElementsByClassName('set-product-price')[0].value;

        if (!productCode || !quantity || !price) {
            continue;
        }

        products.push({
            productCode: productCode,
            quantity: quantity,
            price: price,
        });
    }

    sendRequest('/edit_order/', { order: order.getElementsByClassName('command-id')[0].value,
        products: products }, 'main-loading', 'POST').then(
        data => {
            if (data.status !== 'error') location.reload();
        }
    )
}