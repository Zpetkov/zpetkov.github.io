function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.stringify(JSON.parse(jsonPayload), null, 3);
};

function inputPressed() {
    const inputArea = document.getElementById("input-area");
    const text = inputArea.value;
    const outputPre = document.getElementById("output-pre");
    if (!text || text.trim().length === 0) {
        outputPre.textContent = "";
        outputPre.parentNode.classList.add("disabled");
    } else {
        outputPre.parentNode.classList.remove("disabled");
        try {
            const result = parseJwt(text);
            outputPre.textContent = result;
        } catch (e) {
            outputPre.textContent = "Not valid JWT.";
        }
    }
}

window.onload = () => { 
    document.getElementById("input-area").select();
}