function parseJwt(token) {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split("").map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));

    return JSON.parse(jsonPayload);
};

function inputPressed() {
    const inputArea = document.getElementById("input-area");
    const text = inputArea.value;
    const outputPre = document.getElementById("output-pre");
    if (!text || text.trim().length === 0) {
        outputPre.innerHTML = "";
        outputPre.parentNode.classList.add("inactive");
    } else {
        outputPre.parentNode.classList.remove("inactive");
        try {
            const result = parseJwt(text);
            if (getActiveViewFormat() === "jsonFormat") {
                outputPre.innerHTML = "";
                outputPre.textContent = JSON.stringify(result, null, 3);
            } else {

                const rows = [];
                for (const [jwtKey, jwtValue] of Object.entries(result)) {
                    const jwtEntryRow = document.createElement("tr");

                    const keyColumn = document.createElement("td");
                    keyColumn.textContent = jwtKey;
                    keyColumn.classList.add("jwt-key");
                    jwtEntryRow.appendChild(keyColumn);

                    const valueColumn = document.createElement("td");
                    valueColumn.textContent = jwtValue;
                    valueColumn.classList.add("jwt-key");

                    jwtEntryRow.appendChild(valueColumn);

                    rows.push(jwtEntryRow);
                }

                outputPre.innerHTML = "";

                const table = document.createElement("table");
                table.classList.add("jwt-table");
                rows.forEach(t => { table.appendChild(t); });

                outputPre.appendChild(table);
            }
        } catch (e) {
            outputPre.textContent = "Not valid JWT.";
        }
    }
}

function setViewFormat(elementId) {
    const button = document.getElementById(elementId);
    button.classList.remove("view-format-inactive");
    button.setAttribute("data-active", 1)

    Array.from(document.getElementsByClassName("view-format-label"))
        .filter(e => e.id != elementId)
        .forEach(otherLabel => {
            otherLabel.classList.add("view-format-inactive");
            otherLabel.setAttribute("data-active", 0);
        });

    inputPressed();
}

function getActiveViewFormat() {
    return Array.from(document.getElementsByClassName("view-format-label")).filter(v => 1 == v.getAttribute("data-active"))[0].id
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
    document.getElementById("input-area").select();
}