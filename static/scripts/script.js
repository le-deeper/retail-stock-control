const burger_menu = document.querySelector("#burger");
const menu_elements = document.querySelectorAll("#menu>ul>li");
const submenu_elements = document.querySelectorAll("#menu > ul > li > ul > li");

burger_menu.addEventListener("click", () => {
    // Ajouter a burger_menu la classe active pour qu'il s'anime
    burger_menu.classList.toggle("active");
    // Afficher le menu
    document.querySelector("#menu").classList.toggle("active");
});

menu_elements.forEach((elt) => {
    elt.addEventListener("click", () => {
        // Afficher le sous-menu
        elt.classList.toggle("active");
    });
});

submenu_elements.forEach((elt) => {
    elt.addEventListener("click", () => {
        // Si un élément du sous-menu cliqué,
        // fermer le menu
        burger_menu.classList.toggle("active");
        document.querySelector("#menu").classList.toggle("active");
    });
});

// Fonction pour afficher le pop-up pendant 3 secondes
function showPopup(message, error=false) {
    var popup = document.getElementById("popup");
    popup.innerHTML = message;
    popup.style.display = "block";
    if (error) {
        popup.style.backgroundColor = "rgb(255,0,0)";
    } else {
        popup.style.backgroundColor = "rgb(0,255,0)";
    }
    setTimeout(function() {
        popup.style.display = "none";
    }, 3000); // Affiche le pop-up pendant 3 secondes
}

const setCookie = (name, value, days) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function clearInputs(elt) {
    const inputs = elt.querySelectorAll('input');
    const checkboxes = elt.querySelectorAll('input[type="checkbox"]');
    inputs.forEach(input => {
        input.value = '';
    });
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

const logout = () => {
    setCookie('session', '', -1);
    window.location.href = '/login';
}

const change_site_name = () => {
    let site_name = getCookie('site');
    if (site_name !== null) {
        if (site_name === 'none') site_name = "Tous les sites";
        else site_name = site_name.replace(/^"|"$/g, '');
        document.getElementById('site-name').textContent = site_name;
    }
}

// Ajouter déconnection au click de l'élément deconnexion
document.getElementById('logout').addEventListener('click', logout);

// Add this to your JavaScript file or inside a <script> tag
const infoBubble = document.getElementById('infoBubble');
if (infoBubble) {
    infoBubble.addEventListener('click', function() {
            const expandedInfo = document.getElementById('expandedInfo');
            expandedInfo.style.display = 'block';
            this.style.display = 'none';
        });
}

const expandedInfo = document.getElementById('expandedInfo');

if (expandedInfo) {
    expandedInfo.addEventListener('click', function() {
            this.style.display = 'none';
            document.getElementById('infoBubble').style.display = 'block';
        });
}
