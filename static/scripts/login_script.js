async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!checkInputs(username, password)) return;

    const csrftoken = getCookie('csrftoken');
    sendRequest('/login/', { username: username, password: password }, null, 'POST').then(
        data => {
            if (data.status !== 'error') {
                setCookie('session', data.session, 5)
                window.location.href = '/';
            }
        }
    )
}

document.addEventListener('keydown', async function (event) {
    if (event.key === 'Enter') {
        await login();
    }
});
