function isAscii(string) {
    return /^[\x00-\x7F]*$/.test(string);
}

function empty(node) {
    if (node) {
        node.innerHTML = "";
    }
}

function removeNode(id) {
    const element = document.getElementById(id);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

function spanId(index) {
    return "s_" + index;
}

function createSpan(char, title, ascii, mode, index) {
    const spanClass = ascii ? "ascii-span" : "non-ascii-span";

    const span = document.createElement("span");
    span.ascii = ascii;
    span.classList.add(spanClass);
    if (!mode) {
        span.classList.add("code-span");
    }
    span.id = spanId(index);
    span.setAttribute("data-index", index);
    if (char.indexOf("\n") == -1 && char.indexOf(" ") == -1) {
        span.textContent = char;
        span.title = title;

    } else {
        const innerSpan = document.createElement("span");
        innerSpan.textContent = "@";
        innerSpan.classList.add("invisible-char");

        span.appendChild(innerSpan);

        span.title = char.charCodeAt(0);
    }

    return span;
}

function getSpanAt(index) {
    return document.getElementById(spanId(index));
}

function isSpanAscii(span) {
    return span && span.classList.contains("ascii-span");
}

function getNextSpan(span) {
    if (span) {
        return getSpanAt(Number(span.getAttribute("data-index")) + 1);
    }
    return null;
}

function removeClassFromDocument(className) {
    const elements = document.querySelectorAll("." + className);

    for (let i = 0; i < elements.length; i++) {
        elements[i].classList.remove(className);
    }

}

function scrollToElement(id) {
    const element = document.getElementById(id);
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2);
    window.scrollTo(0, middle);
}

function findNextOccurrence() {
    const end = document.getElementsByClassName("highlighted-span-end");
    let current;
    if (end.length) {
        current = getNextSpan(end[0]);
        while (isSpanAscii(current)) {
            current = getNextSpan(current);
        }
    } else {
        current = document.getElementsByClassName("non-ascii-span")[0];
    }

    ["highlighted-span-begin", "highlighted-span", "highlighted-span-end"].forEach(c => removeClassFromDocument(c));

    if (!current) {
        return;
    }

    current.classList.add("highlighted-span-begin");

    while (true) {
        const next = getNextSpan(current);

        if (next && !isSpanAscii(next)) {
            next.classList.add("highlighted-span");
            current = next;
        } else {
            break;
        }
    }

    current.classList.add("highlighted-span-end");
    scrollToElement(current.id);
}

function inputPressed() {
    const maxTextChunkLength = 10000;
    const inputArea = document.getElementById("input-area");
    const outputArea = document.getElementById("output-area");
    empty(outputArea);

    const text = inputArea.value;
    if (text.length > maxTextChunkLength) {
        let chunkCount = 0;
        for (let i = 0; i < text.length / maxTextChunkLength; i++) {
            outputArea.appendChild(createTextChunk(text, i, maxTextChunkLength));
            chunkCount++;
        }

        document.getElementById("chunk-count").setAttribute("data-chunks", chunkCount);
        document.getElementById("chunked").style.display = "block";

        renderChunk(0);
    } else {

        document.getElementById("chunked").style.display = "none";
        renderText(text);
    }
}

function renderText(text) {
    removeNode("output");

    const outputElement = document.createElement("div");
    outputElement.id = "output";
    const mode = Number(document.getElementById("show-codes-button").getAttribute("data-mode"));

    let showNextOccurrence = false;

    for (let i = 0; i < text.length; i++) {
        const character = mode ? text.charAt(i) : String(text.charCodeAt(i));
        const ascii = isAscii(text.charAt(i));
        const title = (mode ? character.charCodeAt(0) : "") + " [" + text.charAt(i) + "]";
        const span = createSpan(character, title, ascii, mode, i);
        showNextOccurrence = showNextOccurrence || !span.ascii;
        outputElement.appendChild(span);
    }

    document.getElementById("output-area").appendChild(outputElement);
    document.getElementById("next-occurrence").style.display = showNextOccurrence ? "block" : "none";
}

function createTextChunk(text, index, length) {
    const chunk = document.createElement("input");
    chunk.type = "hidden";
    chunk.id = "text-chunk-" + index;
    chunk.setAttribute("data-index", index);
    chunk.value = text.substring(length * index, length * (index + 1));
    return chunk;
}

function renderChunk(index) {
    const chunk = document.getElementById("text-chunk-" + index);
    if (chunk) {
        renderText(chunk.value);

        document.getElementById("output").setAttribute("data-chunk", chunk.getAttribute("data-index"));
        const chunkCount = document.getElementById("chunk-count");
        chunkCount.innerHTML = "<span>&nbsp;</span>" + (index + 1) + " / " + chunkCount.getAttribute("data-chunks") + "<span>&nbsp;</span>";
    }
}

function renderNextChunk() {
    const index = Number(document.getElementById("output").getAttribute("data-chunk"));
    renderChunk(index + 1);
}

function renderPreviousChunk() {
    const index = Number(document.getElementById("output").getAttribute("data-chunk"));
    renderChunk(index - 1);
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

function showCodes() {
    const button = document.getElementById("show-codes-button");
    const mode = Number(document.getElementById("show-codes-button").getAttribute("data-mode"));
    button.setAttribute("data-mode", Number(!mode));
    button.innerText = mode ? "Show Chars" : "Show char codes";

    inputPressed();
}

window.onload = () => { document.getElementById("input-area").select() };
