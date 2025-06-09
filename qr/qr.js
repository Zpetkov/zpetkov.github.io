function inputPressed() {
    const output = document.getElementById('output');
    output.innerHTML = '';
    
    const input = document.getElementById('input').value.trim();
    if (!input) {
        return;
    }

    const qrCode = qrcode(0, "L");
    qrCode.addData(input);
    qrCode.make();

    output.innerHTML = qrCode.createSvgTag({ scalable: true });
}


function inputPasted() {
    inputPressedDelayed();
}

const inputDelayMs = 500;
var inputPressedTimeout = null;
function inputPressedDelayed() {
    if (inputPressedTimeout) {
        clearTimeout(inputPressedTimeout);
    }

    inputPressedTimeout = setTimeout(inputPressed, inputDelayMs);
}


window.onload = () => { document.getElementById("input").select(); };