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

function findAllMatches(text, regexString) {
    const result = [];
    let find;

    const regx = new RegExp(regexString, "g");
    while ((find = regx.exec(text)) !== null) {
        result.push(find);

        if (find[0].length === 0) {
            regx.lastIndex = find.index + 1;
        }
    }

    return result;
}

function createOutput(text, regexPattern) {
    let allMatches;
    let error;
    try {
        allMatches = findAllMatches(text, regexPattern);
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
    [
        newSpan("Match:  "), newSpan((index + 1), "number"), newSpan(", Index:  "), newSpan((data.index), "number")
    ].forEach(s => header.appendChild(s));


    outputEntry.appendChild(header);

    const textDiv = document.createElement("div");

    const groupsTable = document.createElement("table");
    groupsTable.classList.add("groups-table");
    const groupBody = document.createElement("tbody");
    groupsTable.appendChild(groupBody);

    for (let line of lines) {
        if (line.group === 0) {
            const textElement = document.createElement("span");
            textElement.classList.add("output-text");
            textElement.textContent = line.text;
            textDiv.appendChild(textElement);
        } else {
            if (groupBody.childNodes.length === 0) {
                groupBody.appendChild(newRow("Group", "Value"));
            }
            groupBody.appendChild(newRow(line.group, line.text));
        }
    }

    if (groupBody.childNodes.length) {
        textDiv.appendChild(groupsTable);
    }

    outputEntry.appendChild(textDiv);

    return outputEntry;
}

function newSpan(text, cssClass) {
    const sp = document.createElement("span");
    if (cssClass) {
        sp.classList.add(cssClass);
    }
    sp.textContent = text;
    return sp;
}

function newRow(first, second) {
    const row = document.createElement("tr");
    [first, second].forEach(e => {
        const column = document.createElement("td");
        column.textContent = e;
        row.appendChild(column);
    });
    return row;
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
