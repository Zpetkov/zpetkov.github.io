function inputPressed() {
    const canvas = document.getElementById('output-canvas');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const canvasContext = canvas.getContext('2d');
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    const input = document.getElementById('input').value.trim();
    if (!input) {
        return;
    }

    const qrCode = qrcode(0, "L");
    qrCode.addData(input);
    qrCode.make();

    const svgTagRawContent = qrCode.createSvgTag({ scalable: true });
    const objectUrlWrapper = URL.createObjectURL(new Blob([svgTagRawContent], { type: 'image/svg+xml;charset=utf-8' }));
    const squareSide = Math.min(canvas.width, canvas.height);
    const svgImageLoader = new Image();
    svgImageLoader.onload = function () {
        canvasContext.drawImage(svgImageLoader, 0, 0, squareSide, squareSide);
        URL.revokeObjectURL(objectUrlWrapper);
    };
    svgImageLoader.src = objectUrlWrapper;
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