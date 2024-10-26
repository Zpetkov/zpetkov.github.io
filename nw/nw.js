window.onload = () => {
    const pingWorker = new Worker('worker.js');

    const totals = {};
    totals.add = function (c) {
        if (totals[c]) {
            totals[c]++;
        } else {
            totals[c] = 1;
        }
    }

    pingWorker.onmessage = (message => {
        const resultsDiv = document.getElementById('results-div');

        if (message.data.type == 'pings') {
            message.data.new.forEach(d => {
                totals.add(d.s);
                const element = createResultElement(d);
                resultsDiv.appendChild(element);
            });

            message.data.removed.forEach(d => {
                const element = document.getElementById(d.ts);
                if (element) {
                    element.parentNode.removeChild(element);
                }
            });
            renderTotals();
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
        0: 'darkmagenta',
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

    const totalsDiv = document.getElementById('totals-container');
    setupClick(document.getElementById('totals-button'),
        (element) => {
            element.classList.add('command-active');
            totalsDiv.classList.remove('invisible');
        },
        (element) => {
            element.classList.remove('command-active');
            totalsDiv.classList.add('invisible');
        }
    );

    function renderTotals() {
        const tbody = document.getElementById("totals-body");
        tbody.innerHTML = '';
        Object.keys(totals).filter(e => e !== 'add').sort().forEach(c => {
            const row = document.createElement('tr');
            row.classList.add('totals-div');

            const label = document.createElement('td');
            label.classList.add('basic-text', 'total-label');
            label.textContent = `${totals[c]}`;

            row.appendChild(label);

            const colorBox = document.createElement('div')
            colorBox.classList.add(colors[c], 'ping-result');

            const colorColumn = document.createElement('td');
            colorColumn.appendChild(colorBox);

            row.appendChild(colorColumn);

            tbody.appendChild(row);
        })
    }

    const propsShortDisruptions = {
        interval: 1,
        timeout: 0.3,
        eventLimit: 110,
    }
    document.getElementById("short-button").addEventListener('click', () => {
        pingWorker.postMessage({ type: 'update', props: propsShortDisruptions });
    });

    function processQueryParams() {
        const queryParams = new URLSearchParams(new URL(window.location.href).search);

        if (queryParams.get('tt') == 1) {
            totalsDiv.classList.remove('invisible');
        }

        if (queryParams.get('as') == 1) {
            document.getElementById('start-button').click();
        }

        if (queryParams.get('sd') == 1) {
            pingWorker.postMessage({ type: 'update', props: propsShortDisruptions });
        }
    }


    processQueryParams();

}