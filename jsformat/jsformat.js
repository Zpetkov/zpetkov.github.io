const nonInputAlertingKeys = {};
["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", "CapsLock", "Alt", "Shift", "Control"].forEach(key => { nonInputAlertingKeys[key] = 1; });

function inputPressed() {
    const inputArea = document.getElementById("input-area");
    const outputArea = document.getElementById("output-area");
    outputArea.innerHTML = "";

    const text = inputArea.value;
    if (text.trim().length == 0) {
        return;
    }

    const outputPre = document.createElement("pre")
    outputPre.classList.add("output-pre");
    try {
        const spaceCount = Number(document.getElementById("select-spaces").value);
        const separator = " ".repeat(spaceCount);
        outputPre.textContent = JSON.stringify(JSON.parse(text), null, separator);
    } catch (exception) {
        outputPre.textContent = exception.message;

        const errorSelectableLineColumn = errorHints(exception.message)
        if (errorSelectableLineColumn) {
            const showIndexSpan = document.createElement("span");
            showIndexSpan.classList.add("show-index");
            showIndexSpan.textContent = "Show in text";
            showIndexSpan.addEventListener("click", () => { selectTextAreaPosition(text, inputArea, errorSelectableLineColumn[0], errorSelectableLineColumn[1]); });

            outputPre.appendChild(showIndexSpan);
        }
    }
    outputArea.appendChild(outputPre);
}

function errorHints(errorMessage) {
    errorMessage = errorMessage || "";
    const matches = errorMessage.match(".*at line (\\d+) column (\\d+) of the JSON data");
    if (matches && matches[1] != undefined && matches[2] != undefined) {
        return [matches[1], matches[2]];
    }
    return null;
}

function selectTextAreaPosition(text, element, line, column) {
    const lines = text.split("\n");

    if (line >= 1 && line <= lines.length && column >= 1 && column <= lines[line - 1].length + 1) {
        let index = 0;

        for (let i = 0; i < line - 1; i++) {
            index += lines[i].length + 1;
        }

        index += column - 1;

        element.focus();
        element.setSelectionRange(index, index);
    }
}


function inputPasted() {
    inputPressedDelayed();
}

const inputDelayMs = 250;
let inputPressedTimeout = null;
function inputPressedDelayed(event) {
    if (event && event.key && nonInputAlertingKeys[event.key]) {
        return
    }

    if (inputPressedTimeout) {
        clearTimeout(inputPressedTimeout);
    }

    inputPressedTimeout = setTimeout(() => inputPressed(event), inputDelayMs);
}

window.onload = () => {
    document.getElementById("select-spaces").addEventListener("change", inputPressed);
    document.getElementById("input-area").select();
};
