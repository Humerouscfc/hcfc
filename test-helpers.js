// test-helpers.js

let testResults = [];
let testsRun = 0;
let testsPassed = 0;

function assertEquals(expected, actual, message) {
    testsRun++;
    if (expected === actual) {
        testsPassed++;
        testResults.push({ name: message, status: 'PASSED', details: `Expected: ${expected}, Actual: ${actual}` });
        return true;
    }
    testResults.push({ name: message, status: 'FAILED', details: `Expected: ${expected}, Actual: ${actual}` });
    console.error(`FAILED: ${message}. Expected: ${expected}, Actual: ${actual}`);
    return false;
}

function assertTrue(condition, message) {
    testsRun++;
    if (condition) {
        testsPassed++;
        testResults.push({ name: message, status: 'PASSED', details: 'Condition was true' });
        return true;
    }
    testResults.push({ name: message, status: 'FAILED', details: 'Condition was false' });
    console.error(`FAILED: ${message}. Condition was false.`);
    return false;
}

function assertNotNull(value, message) {
    testsRun++;
    if (value !== null && value !== undefined) {
        testsPassed++;
        testResults.push({ name: message, status: 'PASSED', details: 'Value is not null/undefined' });
        return true;
    }
    testResults.push({ name: message, status: 'FAILED', details: 'Value was null or undefined' });
    console.error(`FAILED: ${message}. Value was null or undefined.`);
    return false;
}

function displayTestResults() {
    const resultsContainer = document.getElementById('test-results');
    if (!resultsContainer) {
        console.error("Test results container with ID 'test-results' not found.");
        // Log to console as fallback
        console.log(`\n--- Test Summary ---`);
        console.log(`Total tests: ${testsRun}`);
        console.log(`Passed: ${testsPassed}`);
        console.log(`Failed: ${testsRun - testsPassed}`);
        testResults.forEach(result => {
            console.log(`${result.status}: ${result.name} - ${result.details}`);
        });
        return;
    }

    resultsContainer.innerHTML = `<h2>Test Results</h2>
                                <p>Total tests: ${testsRun}</p>
                                <p>Passed: ${testsPassed}</p>
                                <p>Failed: ${testsRun - testsPassed}</p>
                                <ul>`;
    testResults.forEach(result => {
        const listItem = document.createElement('li');
        listItem.textContent = `${result.status}: ${result.name} - ${result.details}`;
        listItem.style.color = result.status === 'PASSED' ? 'green' : 'red';
        resultsContainer.appendChild(listItem);
    });
    resultsContainer.innerHTML += `</ul>`;
}

function simulateClick(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        element.dispatchEvent(event);
        return true;
    }
    console.error(`Element with ID '${elementId}' not found for click simulation.`);
    return false;
}

// Helper to get number of days in month (mirroring logic that would be in script.js)
function getDaysInMonth(year, month) { // month is 0-indexed
    return new Date(year, month + 1, 0).getDate();
}

// Helper to get first day of week (mirroring logic)
function getFirstDayOfWeek(year, month) { // month is 0-indexed
    return new Date(year, month, 1).getDay(); // 0 for Sunday
}

// Helper to format date string for event lookup
function formatDateForEvent(date) { // date is a Date object
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits for month
    const day = String(date.getDate()).padStart(2, '0');     // Ensure 2 digits for day
    return `${year}-${month}-${day}`;
}
