const digitsRegex = new RegExp("^[0-9]+$");

function isOnlyDigits(str) {
    return digitsRegex.test(str);
}

const oridnalRegex = new RegExp("^(([0-9]+)((st)|(nd)|(rd)|(th)))$");
function isOrdinalNumber(str) {
    return str.length >= 3 && oridnalRegex.test(str);
}

function now() {
    return new Date();
}

function day(dayAdjustment) {
    const current = now();
    current.setMilliseconds(0);
    current.setSeconds(0);
    current.setMinutes(0);
    current.setHours(0);
    const multiplier = (1000 * 60 * 60 * 24);
    const day = Math.ceil(dayAdjustment + (current.getTime() / multiplier));
    const date = new Date(day * multiplier);
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);
    return date;
}

function tomorrow() {
    return day(1);
}

function today() {
    return day(0);
}

function yesterday() {
    return day(-1);
}

const commands = {
    now: now,
    tomorrow: tomorrow,
    today: today,
    yesterday: yesterday
}

const months = {
    january: "01",
    jan: "01",
    february: "02",
    feb: "02",
    march: "03",
    mar: "03",
    april: "04",
    apr: "04",
    may: "05",
    june: "06",
    jun: "06",
    july: "07",
    jul: "07",
    august: "08",
    aug: "08",
    september: "09",
    sept: "09",
    sep: "09",
    october: "10",
    oct: "10",
    november: "11",
    nov: "11",
    december: "12",
    dec: "12"
}

const timeZones = {
    ACDT: "+1030",
    ACST: "+0930",
    UT: "+0000",
    GMT: "+0000",
    CAT: "+0200",
    EAT: "+0300",
    WAT: "+0100",
    EEST: "+0300",
    EET: "+0200",
    CEST: "+0200",
    CET: "+0100",
    EDT: "-0400",
    EST: "-0500",
    CDT: "-0500",
    CST: "-0600",
    MDT: "-0600",
    MST: "-0700",
    PDT: "-0700",
    PST: "-0800",
}

const tokenRegex = new RegExp("([a-zA-Z0-9:]+)", 'g');
const meridians = { am: 1, pm: 1 };
const hourMinuteRegex = new RegExp("^\\d{1,2}:\\d{1,2}(:\\d{1,2})?(am|pm|AM|PM)?$");

function extractHourTime(str) {
    const parts = str.split(":");
    const order = ["hour", "minute", "second", "millisecond"];
    const extracted = {};
    for (let i = 0; i < order.length; i++) {
        if (i < parts.length) {
            extracted[order[i]] = parts[i];
        } else {
            extracted[order[i]] = "00";
        }
    }

    if (str.includes("pm")) {
        extracted.meridian = 'pm';
    } else if (str.includes("am")) {
        extracted.meridian = 'am';
    } else if (extracted.hour > 12) {
        extracted.meridian = extracted.hour > 12 ? 'pm' : 'am';
        extracted.hour = extracted.hour > 12 ? (extracted.hour - 12) : extracted.hour;
    }

    if (extracted.hour > 12 && extracted.meridian) {
        extracted.meridian = null;
    }
    return extracted;
}

function pad(num, digits) {
    let result = num;
    while (result.length < digits) {
        result = "0" + result;
    }
    return result;
}

function formatExtractedTime(extracted) {
    return pad(extracted.hour, 2) + ":" + pad(extracted.minute, 2) + ":" + pad(extracted.second, 2) + ":" + pad(extracted.millisecond, 3);
}

function guessParse(input) {
    let day = null;
    let month = null;
    let year = null;
    let hours = null;
    let meridian = null;

    const tokens = input.toLowerCase().match(tokenRegex);
    const typeCandidates = {};
    typeCandidates.unidentifiableCount = 0;
    for (let i = 0; i < tokens.length; i++) {
        typeCandidates[i] = [];
    }

    const extracted = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (months[token]) {
            typeCandidates[i].push("month");

            if (i - 1 >= 0 && ((tokens[i - 1].length <= 2 && isOnlyDigits(tokens[i - 1]))
                || (isOrdinalNumber(tokens[i - 1])))) {
                typeCandidates[i - 1].push("day");
            }

            if (i + 1 < tokens.length && ((tokens[i + 1].length <= 2 && isOnlyDigits(tokens[i + 1]))
                || (isOrdinalNumber(tokens[i + 1])))) {
                typeCandidates[i + 1].push("day");
            }

            if (i - 2 >= 0 && tokens[i - 1] == "of" && (isOnlyDigits(tokens[i - 2]) || isOrdinalNumber(tokens[i - 2]))) {
                typeCandidates[i - 2].push("day");
            }
        } else if (token.length == 4 && isOnlyDigits(token)) {
            typeCandidates[i].push("year");
        } else if (meridians[token]) {
            typeCandidates[i].push("meridian");
        } else if (timeZones[token.toUpperCase()]) {
            typeCandidates[i].push("timezone");
        } else if (token.length >= 4 && hourMinuteRegex.test(token)) {
            typeCandidates[i].push("hourMinute");
        } else {
            typeCandidates.unidentifiableCount++;
        }
    }

    if (typeCandidates.unidentifiableCount == tokens.length) {
        return "Invalid date";
    }

    let extractedHour = null;
    let hourCandidate = null;
    let timezoneCandidate = null;
    for (let i = 0; i < tokens.length; i++) {
        const candidates = typeCandidates[i];
        if (candidates.indexOf("month") > -1) {
            month = months[tokens[i]];
            extracted.push({ name: "month", value: tokens[i] });
        } else if (candidates.indexOf("year") > -1 && year == null) {
            year = tokens[i];
            extracted.push({ name: "year", value: tokens[i] });
        } else if (candidates.indexOf("meridian") > -1) {
            meridian = tokens[i];
            extracted.push({ name: "period", value: tokens[i] });

            if (i - 1 >= 0) {
                hourCandidate = i - 1;
            }
        } else if (candidates.indexOf("hourMinute") > -1) {
            extractedHour = extractHourTime(tokens[i]);
            extracted.push({ name: "time", value: tokens[i] });
        } else if (candidates.indexOf("day") > -1) {
            day = tokens[i];
            if (oridnalRegex.test(day)) {
                day = day.match(oridnalRegex)[2];
            }
            extracted.push({ name: "day", value: tokens[i] });
        } else if (candidates.indexOf("timezone") > -1) {
            if (extractedHour || hourCandidate && !timezoneCandidate) {
                timezoneCandidate = timeZones[tokens[i].toUpperCase()];
                extracted.push({ name: "timezone", value: tokens[i] });
            }
        }
    }

    if (!extractedHour && hourCandidate != null && typeCandidates[hourCandidate].length == 0
        && tokens[hourCandidate].length <= 2 && isOnlyDigits(tokens[hourCandidate])) {
        extractedHour = { hour: pad(tokens[hourCandidate], 2), minute: "00", second: "00", millisecond: "000" };
        extracted.push({ name: "time", value: tokens[hourCandidate] });
    }

    if (extractedHour != null && day == null && month == null && year == null) {
        const todayDate = now();
        day = pad(todayDate.getDate(), 2);
        month = pad(1 + todayDate.getMonth(), 2);
    }

    day = day || "01";
    month = month || "01";
    if (year == null) {
        year = String(now().getFullYear());
    }
    meridian = meridian || (extractedHour ? extractedHour.meridian : "");
    if (!extractedHour) {
        meridian = "";
    }
    hours = extractedHour ? formatExtractedTime(extractedHour) : "00:00:00.000";
    let format = "DD-MM-YYYY hh:mm:ss:sss a";
    if (timezoneCandidate) {
        format = format + " Z";
    } else {
        timezoneCandidate = "";
    }
    return {
        date: moment(day + "-" + month + "-" + year + " " + hours + " " + meridian + " " + timezoneCandidate, format).toDate(),
        extractedFields: extracted
    };
}

function parseTextDate(input) {
    const results = [];
    const command = commands[input.trim()];
    if (command) {
        results.push({ date: command() });
    }

    results.push(guessParse(input));
    return results;
}

function createOutput(result, hints) {
    const table = document.createElement("div");
    table.classList.add("output-block");

    for (let i = 0; i < result.length; i++) {
        const row = document.createElement("div");
        row.classList.add("output-row");

        const span = document.createElement("span");
        span.innerText = result[i].value;
        span.title = result[i].name;
        row.appendChild(span);

        table.appendChild(row);
    }

    const hintsContainer = document.createElement("div");
    hintsContainer.classList.add("output-row");
    for (let i = 0; i < hints.length; i++) {

        const hintPointer = document.createElement("label");
        hintPointer.classList.add("hint-pointer");
        const hintLabel = document.createElement("label");
        hintLabel.classList.add("hint");
        hintLabel.innerHTML = hints[i].name + hintPointer.outerHTML + hints[i].value;

        hintsContainer.appendChild(hintLabel);
    }
    table.appendChild(hintsContainer);

    return table;
}

function empty(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

const displayUnits = [
    { day: 24 * 60 * 60 * 1000 },
    { hour: 60 * 60 * 1000 },
    { minute: 60 * 1000 },
    { second: 1000 },
    { millisecond: 1 },
];

function inputPressed() {
    const input = document.getElementById("date-input").value;
    const outputDiv = document.getElementById("output-div");
    let parsedResults = null;
    if (input && input.length) {
        parsedResults = parseTextDate(input);
    } else {
        empty(outputDiv);
        return;
    }
    if (parsedResults.length) {
        const result = parsedResults[0];
        const outputRows = [];
        const hints = [];

        if (typeof result == "string") {
            outputRows.push({ name: "Looks like something is not right", value: result });

        } else {
            outputRows.push({ name: "Date in your time zone", value: result.date });

            const timeNow = now().getTime();
            const time = result.date.getTime();
            let relative = null;
            let relativeText = null;
            if (timeNow >= time) {
                relative = (timeNow - time);
                relativeText = "ago";
            } else {
                relative = (time - timeNow);
                relativeText = "from now";
            }
            for (let k = 0; k < displayUnits.length; k++) {
                const key = Object.keys(displayUnits[k])[0];
                const unit = displayUnits[k][key];
                if (relative >= unit || (unit == 1)) {
                    relative = relative / unit;

                    relativeText = key + "s " + relativeText;
                    let precision = relative >= 24 ? 0 : 1;
                    if (Number(Number(relative).toFixed(1)) == Number(Number(relative).toFixed(0))) {
                        precision = 0;
                    }
                    relative = Number(relative).toFixed(precision);
                    break;
                }
            }
            outputRows.push({ name: "Time from now", value: relative + " " + relativeText });

            outputRows.push({ name: "ISO format", value: result.date.toISOString() });
            const epoch = Math.round(time / 1000);
            outputRows.push({ name: "Epoch seconds", value: epoch });
            if (result.extractedFields && result.extractedFields.length) {
                for (let j = 0; j < result.extractedFields.length; j++) {
                    hints.push(result.extractedFields[j]);
                }
            }
        }

        const output = createOutput(outputRows, hints);
        empty(outputDiv);
        outputDiv.appendChild(output);
    }
}

function inputPasted() {
    setTimeout(inputPressed, 100);
}

window.onload = () => {
    document.getElementById("date-input").select();
};