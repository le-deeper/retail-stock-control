let products_names = [];
class Product {
    constructor(name, index) {
        this.name = name
        this.index = index
    }

}
const clear_element = (element) => {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}

const init = () => {
    for (let i = 0; i < products.length; i++) {
        products_names.push(new Product(products[i].name, i))
    }
}

const searchProducts = async () => {
    await display_hide('loading', 'main-loading')
    const search = document.getElementById('search').value
    // Rechercher dans la liste des produits le produit ayant dans son nom la chaine de caractère recherchée peu importe la casse
    const results = products_names.filter(prod => prod.name.toLowerCase().includes(search.toLowerCase()))
    if (results.length !== 0) {
        document.getElementById('no-product-found').classList.add('hidden')
        clear_element(document.getElementById('products'))
        for (let prod of results) {
            const product = products[prod.index]
            const product_div = document.createElement('div')
            product_div.classList.add('product')
            product_div.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-details">
                    <h2>${product.name}</h2>
                    <p>${product.price} ${currency}</p>
                    <p>Quantité: ${product.qty}</p>
                </div>
            `
            document.getElementById('products').appendChild(product_div)
        }
        await display_hide('loading', 'main-loading')
    }
    else {
        document.getElementById('no-product-found').classList.remove('hidden')
        await display_hide('loading', 'main-loading')
    }
}

document.addEventListener('DOMContentLoaded', function() {
    init();
})

document.addEventListener('keydown', async function(event) {
    if (event.key === 'Enter') {
        await searchProducts();
    }
});