// Add this to your JavaScript file or inside a <script> tag

let products;
let productsProblems = {}
let currentIndex = 0;

const startButtonAction = (elt) => {
    elt.classList.add("hidden");
    products = document.querySelectorAll('.product.hidden');
    if (products.length > 0) {
        products[currentIndex].classList.remove('hidden');
    }
}

function sendVerification() {
    sendRequest('/stock_validation/', {products: productsProblems}, null, 'POST').then(
        data => {
            if (data.status !== 'error') {
                location.reload();
            }
        }
    )
}

function signalProduct(elt) {
    if (elt.getElementsByClassName('stock-qty')[0].value === '') {
        showPopup("Veuillez saisir la quantité en stock", true)
        return
    }
    productsProblems[elt.getElementsByClassName('product-id')[0].value] = elt.getElementsByClassName('stock-qty')[0].value
    showNextProduct()
}

function showNextProduct() {
    if (currentIndex < products.length - 1) {
        products[currentIndex].classList.add('hidden');
        currentIndex++;
        products[currentIndex].classList.remove('hidden');
    } else {
        products[currentIndex].classList.add('hidden');
        document.getElementById("finish-verification-btn").classList.remove('hidden');
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'm' && event.ctrlKey) {
        // Call the desired function here
        showNextProduct();
    }
});
