// Function to display error messages using Bootstrap alerts
function displayError(resultsDiv, message) {
    resultsDiv.innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
}

// Function to create a Bootstrap-styled HTML table
function createTableHTML(data) {
    let tableHTML = `
        <table class="table table-bordered table-hover mt-3">
            <thead class="table-dark">
                <tr>
                    <th>Class Interval</th>
                    <th>Frequency (fi)</th>
                    <th>Class Mark (xi)</th>
                    <th>fi * xi</th>
                </tr>
            </thead>
            <tbody>`;
    
    data.forEach(item => {
        tableHTML += `
            <tr>
                <td>${item.interval}</td>
                <td>${item.frequency}</td>
                <td>${item.classMark.toFixed(2)}</td>
                <td>${item.fxi.toFixed(2)}</td>
            </tr>`;
    });

    tableHTML += `
            </tbody>
        </table>`;
    
    return tableHTML;
}

// Calculate sum of a property
function calculateSum(data, property) {
    return data.reduce((sum, item) => sum + item[property], 0);
}

// Mean calculation
function calculateMean(data) {
    const sumFi = calculateSum(data, 'frequency');
    const sumFiXi = calculateSum(data, 'fxi');
    return sumFiXi / sumFi;
}

// Median calculation
function calculateMedian(data) {
    const n = calculateSum(data, 'frequency');
    let cumulativeFreq = 0;
    let medianClass;

    for (let i = 0; i < data.length; i++) {
        cumulativeFreq += data[i].frequency;
        if (cumulativeFreq >= n / 2) {
            medianClass = data[i];
            break;
        }
    }

    const L = medianClass.lowerBound;
    const f = medianClass.frequency;
    const CF = cumulativeFreq - f;
    const h = medianClass.upperBound - medianClass.lowerBound;

    return L + ((n / 2 - CF) * h) / f;
}

// Mode calculation
function calculateMode(data) {
    let maxFrequency = 0;
    let modes = [];

    data.forEach(item => {
        if (item.frequency > maxFrequency) {
            maxFrequency = item.frequency;
            modes = [item.classMark];
        } else if (item.frequency === maxFrequency) {
            modes.push(item.classMark);
        }
    });

    return modes;
}

// Range calculation
function calculateRange(data) {
    const min = data[0].lowerBound;
    const max = data[data.length - 1].upperBound - 1;
    return max - min;
}

// Display full results
function calculate(data) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `<div class="alert alert-success" role="alert"><strong>Results:</strong></div>`;

    const tableHTML = createTableHTML(data);
    const mean = calculateMean(data).toFixed(2);
    const median = calculateMedian(data).toFixed(2);
    const mode = calculateMode(data).map(m => m.toFixed(2)).join(', ');
    const range = calculateRange(data);
    const sumFi = calculateSum(data, 'frequency');
    const sumFiXi = calculateSum(data, 'fxi').toFixed(2);

    resultsDiv.innerHTML += `
        <div class="mt-3">${tableHTML}</div>
        <p><strong>Sum of Frequencies (Σfi):</strong> ${sumFi}</p>
        <p><strong>Sum of (fi * xi):</strong> ${sumFiXi}</p>
        <p><strong>Mean:</strong> ${mean}</p>
        <p><strong>Median:</strong> ${median}</p>
        <p><strong>Mode:</strong> ${mode}</p>
        <p><strong>Range:</strong> ${range}</p>
    `;
}

// Clear ungrouped input
function clearInput() {
    document.getElementById("numberInput").value = "";
    document.getElementById("levelsInput").value = 5;
    document.getElementById("results").innerHTML = "";
}

// Clear grouped input
function clearExtraInput() {
    document.getElementById("intervalInput").value = "";
    document.getElementById("results").innerHTML = "";
}

// Calculate from ungrouped data
function calculateUngroup() {
    const input = document.getElementById("numberInput").value.trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!input) {
        displayError(resultsDiv, "Please provide numbers separated by commas.");
        return;
    }

    const numbers = input.split(",").map(Number);

    if (numbers.some(isNaN)) {
        displayError(resultsDiv, "Invalid input. Ensure values are numbers separated by commas.");
        return;
    }

    numbers.sort((a, b) => a - b);
    const range = numbers[numbers.length - 1] - numbers[0];
    const levels = parseInt(document.getElementById("levelsInput").value);
    const classSize = Math.ceil(range / levels);

    let frequencies = [];
    let lowerBound = numbers[0];

    for (let i = 0; i < levels; i++) {
        let upperBound = lowerBound + classSize;

        if (i === levels - 1) {
            upperBound = numbers[numbers.length - 1] + 1;
        }

        const classMark = (lowerBound + upperBound) / 2;
        const fi = numbers.filter(n => n >= lowerBound && n < upperBound).length;
        const fxi = fi * classMark;

        frequencies.push({
            interval: `${lowerBound} - ${upperBound - 1}`,
            frequency: fi,
            classMark,
            fxi,
            lowerBound,
            upperBound
        });

        lowerBound = upperBound;
    }

    calculate(frequencies);
}

// Calculate from grouped input
function calculateGroup() {
    const input = document.getElementById("intervalInput").value.trim();
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";

    if (!input) {
        displayError(resultsDiv, "Please provide intervals and frequencies.");
        return;
    }

    const lines = input.split("\n");
    let frequencies = [];

    for (let line of lines) {
        const parts = line.trim().split(",");
        if (parts.length !== 2 || isNaN(parseInt(parts[1].trim()))) {
            displayError(resultsDiv, "Invalid format. Use: lower - upper, frequency");
            return;
        }

        const bounds = parts[0].split("-").map(b => parseInt(b.trim()));
        if (bounds.length !== 2 || isNaN(bounds[0]) || isNaN(bounds[1])) {
            displayError(resultsDiv, "Invalid interval. Use format: 10 - 20");
            return;
        }

        const lowerBound = bounds[0];
        const upperBound = bounds[1] + 1; // to make upper bound exclusive like in ungroup
        const classMark = (lowerBound + upperBound) / 2;
        const frequency = parseInt(parts[1].trim());
        const fxi = frequency * classMark;

        frequencies.push({
            interval: parts[0].trim(),
            frequency,
            classMark,
            fxi,
            lowerBound,
            upperBound
        });
    }

    calculate(frequencies);
}
