const javaTypes = {
    string: "string",
    str: "string",
    char: 'c',
    long: 100000,
    int: 100,
    integer: 100,
    short: 100,
    boolean: true,
    double: 100.30,
    float: 100.30,
    date: new Date(),
    timestamp: new Date(),
    offsetdatetime: new Date(),
};

function inputPressed() {
    var inputArea = document.getElementById("input-area");
    var text = inputArea.value;

    var lines = text.split("\n");
    var keys = {};
    lines.forEach(line => {
        var tokens = line.trim().split(new RegExp("\\s+"));
        var first = tokens[tokens.length - 1];
        first = first.replace(";", "");
        var value;
        if (isNaN(first)) {
            value = determineType(tokens);
        } else {
            value = parseInt(first);
            first = tokens[Math.max(tokens.length - 2, 0)];
        }

        if (first.length > 0 && typeof keys[first] === "undefined") {
            keys[first] = value;
        }
    });

    var jsonStringified = JSON.stringify(keys, null, 3);

    document.getElementById("output").innerHTML = "<pre class=\"output-pre\">" + jsonStringified + "</pre>";

}

function determineType(tokens) {
    var result = {};
    for (var i = 0; i < tokens.length - 1; i++) {
        var token = tokens[i];
        var returnType = javaTypes[token.toLowerCase()];
        if (returnType) {
            result = returnType;
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
