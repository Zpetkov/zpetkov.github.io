const javaTypes = {
    boolean: true,
    string: (k) => k,
    str: (k) => k,
    char: "c",
    long: 100000,
    int: 100,
    integer: 100,
    short: 100,
    bigdecimal: 1000000,
    biginteger: 1000000,
    double: 100.30,
    float: 100.30,
    number: 100,
    date: new Date(),
    timestamp: new Date(),
    offsetdatetime: new Date(),
};

const collectionTypes = ["collection", "list", "arraylist", "linkedlist", "set", "hashset", "treeset", "linkedhashset"];
const sampleValues = {};

Object.keys(javaTypes).forEach(t => {
    sampleValues[t] = javaTypes[t];
    const listValue = [javaTypes[t]];
    sampleValues[t + "[]"] = listValue;
    collectionTypes.forEach(collectionType => {
        sampleValues[collectionType + "<" + t + ">"] = listValue;
    });
});

const commentRegex = new RegExp("(\\s*//.*)$");
const semicolonsRegex = new RegExp(";", "g");
const assignment = new RegExp("(=.*)$");
const removePatterns = [commentRegex, semicolonsRegex, assignment];

const whitespaces = new RegExp("\\s+");

function inputPressed() {
    const inputArea = document.getElementById("input-area");
    const text = inputArea.value;

    const lines = text.split("\n");
    const keys = {};
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith("@")) {
            return;
        }
        removePatterns.forEach(function (r) {
            line = line.replace(r, "");
        });

        line = line.trim();

        const tokens = line.split(whitespaces);
        const keyName = tokens[tokens.length - 1];
        const value = determineValue(tokens, keyName);

        if (keyName.length > 0 && typeof keys[keyName] === "undefined") {
            keys[keyName] = value;
        }
    });

    let jsonStringified;
    if (Object.keys(keys).length > 0) {
        jsonStringified = JSON.stringify(keys, null, 3);
    } else {
        jsonStringified = "";
    }

    document.getElementById("output").innerHTML = "<pre class=\"output-pre\">" + jsonStringified + "</pre>";
}

function determineValue(tokens, keyName) {
    for (let i = 0; i < tokens.length - 1; i++) {
        const token = tokens[i];
        const value = sampleValues[token.toLowerCase()];
        if (value) {
            if (typeof (value) === "function") {
                return value(keyName);
            }
            return value;
        }
    }
    return {};
}

function copyToClipboard() {
    const text = document.getElementById("output").firstChild.textContent;
    const bufferArea = document.createElement("textarea");
    bufferArea.classList.add("invis-area");
    bufferArea.value = text;
    document.body.appendChild(bufferArea);
    bufferArea.focus();
    bufferArea.select();

    try {
        document.execCommand('copy');
    } catch (err) {

    }

    document.body.removeChild(bufferArea);
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

window.onload = () => { document.getElementById("input-area").select() };
