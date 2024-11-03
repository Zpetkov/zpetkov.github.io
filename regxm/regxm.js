function empty(node) {
    if (node) {
        node.innerHTML = "";
    }
}

function inputPressed() {
    const inputArea = document.getElementById("input-area");
    const regxInput = document.getElementById("reg-input");
    const outputArea = document.getElementById("output-area");

    const text = inputArea.value;
    const regex = regxInput.value;

    empty(outputArea);
    if (regex.trim().length == 0) {
        return;
    }

    outputArea.appendChild(createOutput(text, regex));
}

function createOutput(text, regex) {
    let allMatches;
    let error;
    try {
        allMatches = text.matchAll(regex).toArray();
    } catch (e) {
        allMatches = [];
        error = e.message;
    }
    const matchesFound = Boolean(allMatches.length)

    const outputContent = [];
    if (matchesFound) {
        let index = 0;
        for (let entry of allMatches) {
            outputContent.push(createOutputEntryElement(entry, index++));
        }
    } else if (error) {
        const span = document.createElement("span");
        span.textContent = "Error: " + error;
        span.classList.add("reg-error");
        outputContent.push(span);
    } else {
        const span = document.createElement("span");
        span.textContent = "No match.";
        span.classList.add("no-matches");
        outputContent.push(span);
    }

    const output = document.createElement("div");
    output.classList.add("output", "basic-text");
    outputContent.forEach(o => output.appendChild(o));

    return output;
}

function createOutputEntryElement(data, index) {
    const outputEntry = document.createElement("div");
    outputEntry.classList.add("output-entry");

    const lines = []
    for (let i = 0; i < data.length; i++) {
        lines.push({ text: data[i] + "\n", group: i });
    }

    const header = document.createElement("label");
    header.classList.add("output-entry-header");
    header.textContent = "Match: " + (index + 1) + ", Index: " + data.index;

    outputEntry.appendChild(header);

    const textDiv = document.createElement("div");

    for (let line of lines) {
        const textSpan = document.createElement("span");
        textSpan.classList.add("output-text");
        if (line.group === 0) {
            textSpan.textContent = line.text;
        } else {
            textSpan.textContent = "Group: " + line.group + " " + line.text;
            textSpan.classList.add("output-entry-subgroup");
        }

        textDiv.appendChild(textSpan);
    }

    outputEntry.appendChild(textDiv);

    return outputEntry;
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

window.onload = () => { document.getElementById("reg-input").select(); };
