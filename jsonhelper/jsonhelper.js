const javaTypes = {
    boolean: true,
    string: "string",
    str: "string",
    char: 'c',
    long: 100000,
    int: 100,
    integer: 100,
    short: 100,
    bigdecimal: 1000000,
    double: 100.30,
    float: 100.30,
    date: new Date(),
    timestamp: new Date(),
    offsetdatetime: new Date(),
};

const collectionTypes = ["collection", "list", "arraylist", "linkedlist", "set", "hashset", "treeset", "linkedhashset"];
const sampleValues = {};

Object.keys(javaTypes).forEach(t => {
    sampleValues[t] = javaTypes[t];
    var listValue = [javaTypes[t]]
    sampleValues[t + "[]"] = listValue;
    collectionTypes.forEach(collectionType => {
        sampleValues[collectionType + "<" + t + ">"] = listValue;
    });
});

const commentRegex = new RegExp("(\\s*//.*)$");
const semicolonsRegex = new RegExp(";", "g");
const removePatterns = [commentRegex, semicolonsRegex];

const whitespaces = new RegExp("\\s+");

function inputPressed() {
    var inputArea = document.getElementById("input-area");
    var text = inputArea.value;

    var lines = text.split("\n");
    var keys = {};
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith("@")) {
            return;
        }
        removePatterns.forEach(function (r) {
            line = line.replace(r, "");
        });

        line = line.trim();

        var tokens = line.split(whitespaces);
        var first = tokens[tokens.length - 1];
        var value;
        if (isNaN(first)) {
            value = determineValue(tokens);
        } else if (tokens.length >= 2) {
            value = parseInt(first);
            first = tokens[tokens.length - 2];
        } else {
            value = {};
        }

        if (first.length > 0 && typeof keys[first] === "undefined") {
            keys[first] = value;
        }
    });

    var jsonStringified;
    if (Object.keys(keys).length > 0) {
        jsonStringified = JSON.stringify(keys, null, 3);
    } else {
        jsonStringified = "";
    }

    document.getElementById("output").innerHTML = "<pre class=\"output-pre\">" + jsonStringified + "</pre>";
}

function determineValue(tokens) {
    var result = {};

    for (var i = 0; i < tokens.length - 1; i++) {
        var token = tokens[i];
        var value = sampleValues[token.toLowerCase()];
        if (value) {
            result = value;
            break;
        }
    }
    return result;
}

function copyToClipboard() {
    var text = document.getElementById("output").firstChild.textContent;
    var bufferArea = document.createElement("textarea");
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
    setTimeout(inputPressed, 100);
}