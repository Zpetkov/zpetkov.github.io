const pingWorker = new Worker('worker.js');

pingWorker.onmessage = (message => {
    const resultsDiv = document.getElementById('results-div');

    if (message.data.type == 'pings') {
        message.data.new.forEach(d => {
            const element = createResultElement(d);
            resultsDiv.appendChild(element);
        });

        message.data.removed.forEach(d => {
            const element = document.getElementById(d.ts);
            if (element) {
                element.parentNode.removeChild(element);
            }
        });
    } else if (message.data.type == 'advanced') {
        createAdvancedProperties(message.data);
    } else if (message.data.type == 'schedule') {
        renderProgressBar(message);
    }
});

function setupClick(element, functionActive, functionInactive) {
    element.addEventListener('click', () => {
        const newMode = Math.abs(1 - Number(element.getAttribute('data-click')));
        element.setAttribute('data-click', newMode);

        if (newMode) {
            functionActive(element);
        } else {
            functionInactive(element);
        }
    });
}

const advancedDiv = document.getElementById('advanced-div');
const advancedTableDiv = document.getElementById('advanced-table-div');

setupClick(document.getElementById('gear-button'),
    (element) => {
        element.classList.add('command-active');
        advancedDiv.classList.remove('invisible');
        pingWorker.postMessage({ type: 'advanced' });
    },
    (element) => {
        element.classList.remove('command-active');
        advancedDiv.classList.add('invisible');
        advancedTableDiv.innerHTML = '';
    }
);

const progressBarHolder = document.getElementById('progress-bar-holder');

setupClick(document.getElementById('start-button'),
    (startButton) => {
        startButton.classList.remove('start');
        startButton.classList.add('stop');
        pingWorker.postMessage({ type: 'active', active: 1 });

        progressBarHolder.classList.add('progress-bar-active');
    },
    (startButton) => {
        startButton.classList.add('start');
        startButton.classList.remove('stop');
        pingWorker.postMessage({ type: 'active', active: 0 });
        progressBarHolder.innerHTML = '';
        progressBarHolder.classList.remove('progress-bar-active');
    }
);

const clearButton = document.getElementById('clear-button');
clearButton.addEventListener('click', () => {
    pingWorker.postMessage({ type: 'clear' });
    document.getElementById('results-div').innerHTML = '';
});

document.getElementById('save-button').addEventListener('click', () => {
    const props = {};
    Array.from(document.getElementsByClassName('advanced-value-input'))
        .forEach(input => {
            props[input.getAttribute('data-key')] = input.value;
        });

    pingWorker.postMessage({ type: 'update', props: props });
});

const colors = {
    0: 'orange',
    1: 'red',
    2: 'green',
    3: 'yellow',
    4: 'gray'
}

const descriptions = {
    0: 'Aborted due to timeout',
    1: 'Error',
    2: 'Success',
    3: 'Non OK response',
    4: 'Browser inactivity'
}

function createResultElement(pingData) {
    const resultBox = document.createElement('div')
    resultBox.id = pingData.ts;
    resultBox.classList.add('ping-result');

    resultBox.setAttribute('data-click', 0);
    if (pingData.meta && pingData.meta.duration != null) {
        resultBox.setAttribute('data-duration', pingData.meta.duration);
    }
    resultBox.setAttribute('data-state', pingData.s);

    resultBox.classList.add(colors[pingData.s]);

    setupClick(resultBox,
        () => { showSelected(resultBox.id); },
        () => { showSelected(resultBox.id); });

    return resultBox;
}

function showSelected(id) {
    let newBox = true;
    Array.from(document.getElementsByClassName('clicked-event')).forEach(e => {
        if (e.id == id) {
            newBox = false;
        }

        e.classList.remove('clicked-event');
    });

    const element = document.getElementById(id);
    const select = [];
    if (newBox) {
        element.classList.add('clicked-event');
        select.push(element);
    }

    const newContainer = document.createElement('div');
    newContainer.classList.add('selected-container');

    select.forEach(selectedBox => {
        const box = document.createElement('div');
        const state = selectedBox.getAttribute('data-state');
        const date = new Date(Number(selectedBox.id));
        box.classList.add(colors[state], 'ping-result');

        const statusDiv = document.createElement('div');
        statusDiv.appendChild(box);

        statusDiv.classList.add('status-div');

        const text = document.createElement('span');
        text.classList.add('basic-text', 'selected-text');

        text.innerText = descriptions[state];
        newContainer.appendChild(statusDiv);
        newContainer.appendChild(text);

        if (selectedBox.getAttribute('data-duration') != null) {
            const durationSpan = document.createElement('span');
            durationSpan.innerText = selectedBox.getAttribute('data-duration') + ' ms';
            durationSpan.classList.add('basic-text', 'selected-text');
            const durationDiv = document.createElement('div');
            durationDiv.appendChild(durationSpan);

            newContainer.appendChild(durationDiv);
        }

        const dateText = document.createElement('span');
        dateText.classList.add('basic-text', 'selected-text');

        dateText.innerText = date;

        const dateDiv = document.createElement('div');
        dateDiv.appendChild(dateText);

        newContainer.appendChild(dateDiv);
    });

    const selectedDiv = document.getElementById('selected-div');
    selectedDiv.replaceChild(newContainer, selectedDiv.childNodes[0]);
}

function createAdvancedProperties(message) {
    const rows = [];
    for (const [key, value] of Object.entries(message.props)) {

        const keyColumn = document.createElement('td');
        keyColumn.textContent = key;
        keyColumn.classList.add('advanced-key');

        const valueInput = document.createElement('input');
        valueInput.classList.add('advanced-value-input', 'basic-text');
        valueInput.value = value;
        valueInput.setAttribute('data-key', key);

        const valueColumn = document.createElement('td');
        valueColumn.appendChild(valueInput);
        valueColumn.classList.add('advanced-value');

        const entryRow = document.createElement('tr');
        entryRow.appendChild(keyColumn);
        entryRow.appendChild(valueColumn);

        rows.push(entryRow);
    }

    const table = document.createElement('table');
    table.classList.add('advanced-table');
    rows.forEach(t => { table.appendChild(t); });

    advancedTableDiv.innerHTML = '';
    advancedTableDiv.appendChild(table);

    if (message.saved) {
        const saveButton = document.getElementById('save-button');
        saveButton.classList.add('flash');
        setTimeout(() => { saveButton.classList.remove('flash'); }, 1000);
    }
}

function renderProgressBar(event) {
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.style.animation = 'updateProgress linear forwards';
    progressBar.style.animationDuration = (1000 * event.data.time) + "ms";

    progressBarHolder.innerHTML = '';
    progressBarHolder.appendChild(progressBar);
}