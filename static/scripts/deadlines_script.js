function sendDeadline(elt, finish=false) {
    const idEcheance = elt.querySelector('.id_echeance').value;
    let data = {
        id_echeance: idEcheance,
    };
    if (!finish) {
        const partToAdd = elt.querySelector('.part-to-add').value;
        if (!checkInputs(partToAdd)) return;
        data['part_to_add'] = partToAdd;
    }
    else data['finish_echeance'] = true;

    sendRequest('/deadlines/', data, null, 'POST').then(
        data => {
            if (data.status !== 'error') location.reload();
        }
    )
}
