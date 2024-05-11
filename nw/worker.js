
const props = {
    interval: 10000,
    timeout: 5000,
    eventLimit: 500,
    url: '1.p',
    method: 'GET'
};

let inactivityTrack;
let active = false;
let fetchTimeoutId;
let pings = [];

const commands = {

    advanced: function () { postMessage({ type: 'advanced', props: props }); },
    active: function (event) {
        active = Boolean(event.data.active);
        clearTimeout(fetchTimeoutId);

        if (active) {
            inactivityTrack = new Date().getTime();

            if (pings.length) {
                startSchedule();
            } else {
                fetchFn();
            }
        }
    },
    clear: function () { pings = []; },
    update: function (event) {
        Object.keys(props).forEach(key => {
            const newValue = event.data.props[key];
            if (newValue != null) {
                props[key] = newValue;
            }
        });

        props.interval = Math.max(1000, props.interval);

        postMessage({ type: 'advanced', props: props, saved: 1 });
    },
};

onmessage = (event => {
    const command = commands[event.data.type];
    if (command) {
        command(event);
    } else {
        console.log('Unknown: ' + event.data.type);
    }
});

function addResult(code, metadata) {
    const newPing = { ts: new Date().getTime(), s: code };
    if (metadata) {
        newPing.meta = metadata;
    }
    pings.push(newPing);

    let removed = [];
    while (pings.length > props.eventLimit) {
        removed.push(pings.shift());
    }

    postMessage({ type: 'pings', removed: removed, new: [newPing] });
}

function startSchedule() {
    fetchTimeoutId = setTimeout(fetchFn, props.interval);
}

async function fetchFn() {
    if (!active) {
        return;
    }

    const now = new Date().getTime();
    const inactivityDuration = now - inactivityTrack;
    if (inactivityDuration > props.interval + (10 * 1000)) {
        addResult(4, { duration: inactivityDuration });
    }
    inactivityTrack = now;


    const fetchProperties = {
        method: props.method,
        cache: 'no-store',
        signal: AbortSignal.timeout(props.timeout)
    };

    const fetchStart = new Date().getTime();
    try {
        const response = await fetch(props.url, fetchProperties);
        const resultType = response.ok ? 2 : 3;
        const fetchDuration = new Date().getTime() - fetchStart;

        addResult(resultType, { sc: response.status, duration: fetchDuration });

        startSchedule();

    } catch (error) {
        const fetchDuration = new Date().getTime() - fetchStart;

        const errorCode = error.name == 'AbortError' ? 0 : 1;
        addResult(errorCode, { duration: fetchDuration });

        startSchedule();
    }

}