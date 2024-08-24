async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const csrftoken = getCookie('csrftoken');

    try {
        const response = await fetch('/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ username: username, password: password })
        });

        const responseData = await response.json();
        if (responseData.status === 'error') {
            showPopup(responseData.message, error=true);
        }
        else {
            showPopup(responseData.message);
        }
        if (response.ok) {
            setCookie('session', responseData.session, 5)
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Failed to login:', error);
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        login();
    }
});
