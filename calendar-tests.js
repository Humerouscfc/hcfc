// calendar-tests.js

// Wait for the main script's DOMContentLoaded to finish, then run tests.
// This is a simple way to ensure the calendar is initialized.
document.addEventListener('DOMContentLoaded', () => {
    runAllTests();
    displayTestResults(); // From test-helpers.js
});

function runAllTests() {
    console.log("Starting tests...");

    // Test Date Logic
    testDaysInMonth();
    testFirstDayOfWeek();
    testDateFormattingForEvent();

    // Test Event Logic (using script.js's internal events array indirectly)
    testEventFinding(); // Needs script.js's `events` array to be accessible or mocked

    // UI Interaction Tests
    testInitialDisplay();
    testMonthNavigation();
    testEventClickDisplaysDetails(); // This will also test event finding in practice

    console.log("Tests finished.");
}

// --- Date Logic Tests ---
function testDaysInMonth() {
    assertEquals(31, getDaysInMonth(2024, 0), "Days in January 2024"); // Jan is month 0
    assertEquals(29, getDaysInMonth(2024, 1), "Days in February 2024 (leap year)"); // Feb is month 1
    assertEquals(28, getDaysInMonth(2023, 1), "Days in February 2023 (non-leap year)");
    assertEquals(31, getDaysInMonth(2024, 6), "Days in July 2024"); // July is month 6
    assertEquals(30, getDaysInMonth(2024, 8), "Days in September 2024"); // Sep is month 8
}

function testFirstDayOfWeek() {
    // Test with known dates. new Date(year, month, 1).getDay() where Sunday is 0.
    // January 1, 2024 was a Monday (1)
    assertEquals(1, getFirstDayOfWeek(2024, 0), "First day of Jan 2024 should be Monday (1)");
    // July 1, 2024 was a Monday (1)
    assertEquals(1, getFirstDayOfWeek(2024, 6), "First day of July 2024 should be Monday (1)");
    // June 1, 2024 was a Saturday (6)
    assertEquals(6, getFirstDayOfWeek(2024, 5), "First day of June 2024 should be Saturday (6)");
}

function testDateFormattingForEvent() {
    assertEquals("2024-07-15", formatDateForEvent(new Date(2024, 6, 15)), "Format date for event (July 15, 2024)");
    assertEquals("2024-01-05", formatDateForEvent(new Date(2024, 0, 5)), "Format date for event (Jan 5, 2024)");
}

// --- Event Logic Tests ---
// This test relies on the 'events' array defined in script.js.
// It tests if the logic in renderCalendar (which we can't call directly) correctly marks event days.
// We check this by observing the DOM after script.js has run.
function testEventFinding() {
    // These are sample events from script.js
    // { date: '2024-07-15', title: 'Team Meeting @ 10 AM' }
    // { date: '2024-07-22', title: 'Project Deadline' }
    // { date: '2024-08-05', title: 'Doctor Appointment' }

    // To test this, we need to ensure the calendar is rendered for July 2024 and August 2024.
    // The initial render is for the current month. We'll assume script.js has its own event list.
    // We'll check if the cells for these dates have the 'event-day' class.

    // Navigate to July 2024 if not already there (tricky without knowing current test date)
    // For simplicity, this test will be more robust if we can set the calendar to a specific month.
    // Let's assume script.js has `currentDate` and `renderCalendar` globally accessible for tests (not ideal but practical here)
    // Or, we rely on the UI navigation tests to bring us to these months.

    // For now, let's focus on checking an event from the *currently rendered* month if possible.
    // If script.js's `events` array were exported or mockable, this would be cleaner.
    // We will test this more through the UI interaction test `testEventClickDisplaysDetails`.
    
    // A simple check for the event array (if accessible, which it isn't directly)
    // This is more of a placeholder for how one *would* test it if events were easily accessible.
    // For now, we'll rely on the UI test for event functionality.
    if (typeof events !== 'undefined' && events.length > 0) {
         assertTrue(events.some(e => e.date === '2024-07-15'), "Event 'Team Meeting' should exist in sample data");
    } else {
        console.warn("Skipping direct event data test: `events` array not accessible from `calendar-tests.js`.");
    }
}


// --- UI Interaction Tests ---
function testInitialDisplay() {
    const monthYearHeader = document.getElementById('month-year-header');
    assertNotNull(monthYearHeader, "Month/Year header should exist.");

    const today = new Date();
    const expectedMonth = today.toLocaleString('default', { month: 'long' });
    const expectedYear = today.getFullYear();
    assertTrue(monthYearHeader.textContent.includes(expectedMonth), `Initial month should be ${expectedMonth}`);
    assertTrue(monthYearHeader.textContent.includes(expectedYear.toString()), `Initial year should be ${expectedYear}`);
}

function testMonthNavigation() {
    const monthYearHeader = document.getElementById('month-year-header');
    let initialHeaderText = monthYearHeader.textContent;

    // Test "Next" button
    simulateClick('next-month-btn');
    let newHeaderText = monthYearHeader.textContent;
    assertTrue(newHeaderText !== initialHeaderText, "Month/Year header should change after clicking 'Next'");
    // We could add more specific checks if we parse the date from header text

    // Test "Previous" button
    simulateClick('prev-month-btn'); // Go back to initial month
    simulateClick('prev-month-btn'); // Go to previous month
    initialHeaderText = newHeaderText; // This is now the month after the initial one
    newHeaderText = monthYearHeader.textContent; // This is the state after one next and two prev
    assertTrue(newHeaderText !== initialHeaderText, "Month/Year header should change after clicking 'Previous'");
    
    // Go back to current month for subsequent tests
    simulateClick('next-month-btn'); 
}

function testEventClickDisplaysDetails() {
    // This test assumes the calendar is currently showing July 2024 OR that an event exists in the current month.
    // For robustness, we'd want to navigate to a month with a known event.
    // Let's try to navigate to July 2024 first.
    // This is highly dependent on the current date the test is run.
    // A better way would be to have a function in script.js to `setCurrentDateAndRender(year, month)` for testing.

    // Manually set calendar to July 2024 for testing this specific event
    // This requires `currentDate` and `renderCalendar` to be accessible globally from script.js
    // If not, this test is fragile.
    if (typeof currentDate !== 'undefined' && typeof renderCalendar === 'function') {
        currentDate = new Date(2024, 6, 1); // Set to July 2024 (month is 0-indexed)
        renderCalendar(currentDate); // Re-render calendar
    } else {
        console.warn("Cannot programmatically set calendar to July 2024 for event click test. Test may be less reliable.");
        // Attempt to navigate to July 2024 using buttons - this is very flaky
        // This assumes current test date is close to July 2024
        const header = document.getElementById('month-year-header');
        let safety = 0; // prevent infinite loop
        while (!header.textContent.includes("July 2024") && safety < 12) {
            simulateClick('next-month-btn');
            safety++;
        }
         if (!header.textContent.includes("July 2024")) {
            console.warn("Failed to navigate to July 2024. Event click test might fail or test the wrong thing.");
         }
    }


    const eventDetailsDisplay = document.getElementById('event-details-display');
    assertNotNull(eventDetailsDisplay, "Event details display area should exist.");
    const initialEventText = eventDetailsDisplay.querySelector('p') ? eventDetailsDisplay.querySelector('p').textContent : eventDetailsDisplay.textContent;

    // Find the cell for July 15, 2024 (known event date)
    // This requires the calendar for July 2024 to be rendered.
    const cells = document.querySelectorAll('#calendar-body td');
    let eventCell = null;
    cells.forEach(cell => {
        if (cell.textContent === '15' && !cell.classList.contains('empty')) {
            // Check if this cell is an event day (it should be if it's July 15, 2024)
            if (cell.classList.contains('event-day')) {
                 eventCell = cell;
            }
        }
    });

    if (eventCell) {
        console.log("Found cell for July 15, attempting click.");
        eventCell.click(); // Directly click the cell
        assertTrue(eventDetailsDisplay.textContent.includes("Team Meeting @ 10 AM"), "Event details for 'Team Meeting' should be displayed after click.");
    } else {
        // If the specific event cell for July 15 isn't found (e.g., wrong month displayed),
        // try to find *any* event cell in the current view and click it.
        const anyEventCell = document.querySelector('#calendar-body td.event-day');
        if (anyEventCell) {
            console.warn("Could not find cell for July 15, 2024. Clicking the first available event cell instead.");
            anyEventCell.click();
            // We can't assert specific text, but we can check it changed from initial
            assertTrue(eventDetailsDisplay.textContent !== initialEventText, "Event details display should change after clicking an event cell.");
        } else {
            assertTrue(false, "No event cell found for July 15, 2024, and no other event cell found in current view to test click.");
        }
    }
}
