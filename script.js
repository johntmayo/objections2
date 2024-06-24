const spreadsheetId = '2PACX-1vSwyjJPHlGr0B2udmvPZWwXKj6WJnSPrUW1sT5noI-KkeW54I-FbFE0C_1EAAf19hyJTh8DfrKDg4MH';
let currentStep = 'issues';
let currentData = [];
let path = [];

function fetchData() {
    fetch(`https://docs.google.com/spreadsheets/d/e/${spreadsheetId}/pub?output=csv`)
        .then(response => response.text())
        .then(data => {
            currentData = parseCSV(data);
            displayNextStep('issues');
        })
        .catch(error => console.error('Error fetching data:', error));
}

function parseCSV(data) {
    const rows = data.split('\n').filter(row => row.trim() !== '');
    return rows.map(row => {
        const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/; // Split by comma not enclosed in quotes
        return row.split(regex).map(cell => cell.replace(/(^"|"$)/g, '')); // Remove surrounding quotes
    });
}

function displayNextStep(step, value = null) {
    currentStep = step;
    const contentDiv = document.getElementById('content');
    const homeButton = document.getElementById('home-button');
    const breadcrumbsDiv = document.getElementById('breadcrumbs');
    contentDiv.innerHTML = ''; // Clear previous content

    let nextStepData = [];
    switch (step) {
        case 'issues':
            nextStepData = [...new Set(currentData.slice(1).map(row => row[0]))];
            homeButton.style.display = 'none'; // Hide home button on the first screen
            breadcrumbsDiv.style.display = 'none'; // Hide breadcrumbs on the first screen
            path = []; // Reset path on the first screen
            break;
        case 'objections':
            nextStepData = currentData.filter(row => row[0] === value).map(row => row[1]);
            homeButton.style.display = 'block'; // Show home button on subsequent screens
            breadcrumbsDiv.style.display = 'block'; // Show breadcrumbs on subsequent screens
            path.push(value);
            break;
        case 'response':
            const responseRow = currentData.find(row => row[1] === value);
            nextStepData = [{ objection: value, response: responseRow[2] }];
            break;
    }

    if (step === 'objections') {
        nextStepData.forEach(item => {
            const objectionDiv = document.createElement('div');
            objectionDiv.className = 'content';
            objectionDiv.textContent = item;
            contentDiv.appendChild(objectionDiv);

            const button = document.createElement('button');
            button.textContent = 'Response';
            button.onclick = () => displayNextStep('response', item);
            contentDiv.appendChild(button);
        });
    } else if (step === 'response') {
        nextStepData.forEach(item => {
            const objectionDiv = document.createElement('div');
            objectionDiv.className = 'content';
            objectionDiv.innerHTML = `<h4>Objection:</h4><p>${item.objection}</p>`;
            contentDiv.appendChild(objectionDiv);

            const responseDiv = document.createElement('div');
            responseDiv.className = 'content';
            responseDiv.innerHTML = `<h4>Response Topline:</h4><p>${item.response}</p>`;
            contentDiv.appendChild(responseDiv);
        });
    } else {
        nextStepData.forEach(item => {
            const button = document.createElement('button');
            button.className = 'step-button';
            button.textContent = item;
            button.onclick = () => displayNextStep('objections', item);
            contentDiv.appendChild(button);
        });
    }

    updateBreadcrumbs();
}

function updateBreadcrumbs() {
    const pathList = document.getElementById('path-list');
