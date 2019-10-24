function isAscii(string) {
    return /^[\x00-\x7F]*$/.test(string);
}

function empty(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function createSpan(char) {
    let spanClass = isAscii(char) ? "asci-span" : "non-asci-span";

    let span = document.createElement("span");
    span.classList.add(spanClass);
    if (char.indexOf("\n") == -1 && char.indexOf(" ") == -1) {
        span.innerHTML = char;
        span.title = char.charCodeAt(0) + " [" + char + "]";

    } else {
        let innerSpan = document.createElement("span");
        innerSpan.innerHTML = '@';
        innerSpan.classList.add("invisible-char");

        span.appendChild(innerSpan);

        span.title = char.charCodeAt(0);
    }

    return span;
}

function inputPressed() {
    let inputArea = document.getElementById("input-area");
    let text = inputArea.value;
    let outputElement = document.getElementById("output");
    empty(outputElement);

    for (let i = 0; i < text.length; i++) {
        outputElement.appendChild(createSpan(text.charAt(i)));
    }

}


function inputPasted() {
    setTimeout(inputPressed, 100);
}

window.onload = document.getElementById("input-area").select();
