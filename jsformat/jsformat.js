
function inputPressed() {
    const inputArea = document.getElementById("input-area");
    const outputArea = document.getElementById("output-area");
    outputArea.innerHTML = "";

    const text = inputArea.value.trim();
    if (text.length == 0) {
        return;
    }

    const outputPre = document.createElement("pre")
    outputPre.classList.add("output-pre");
    try {
        const spaceCount = Number(document.getElementById('select-spaces').value);
        const separator = " ".repeat(spaceCount);
        outputPre.textContent = JSON.stringify(JSON.parse(text), null, separator);
    } catch (exception) {
        outputPre.textContent = exception;
    }
    outputArea.appendChild(outputPre);
}


function inputPasted() {
    inputPressedDelayed();
}

const inputDelayMs = 250;
var inputPressedTimeout = null;
function inputPressedDelayed() {
    if (inputPressedTimeout) {
        clearTimeout(inputPressedTimeout);
    }

    inputPressedTimeout = setTimeout(inputPressed, inputDelayMs);
}

window.onload = () => {
    document.getElementById('select-spaces').addEventListener('change', inputPressed);
    document.getElementById("input-area").select();
};
