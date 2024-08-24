function sendDeadline(elt, finish=false) {
    const idEcheance = elt.querySelector('.id_echeance').value;
    let data = {
        id_echeance: idEcheance,

    };
    if (!finish) {
        const partToAdd = elt.querySelector('.part-to-add').value;
        data['part_to_add'] = partToAdd;
    }
    else {
        data['finish_echeance'] = true;
    }
    // const url = '/deadlines_providers/';

    fetch('/deadlines/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken') // Include CSRF token if using Django
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                showPopup(data.message, true);
            }
            else {
                showPopup(data.message);
                location.reload();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    // Rafraichir la page

}
