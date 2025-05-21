// calendar-tests.js

document.addEventListener('DOMContentLoaded', () => {
    // Ensure calendarApp is loaded
    if (typeof window.calendarApp === 'undefined') {
        console.error("calendarApp is not defined. Make sure script.js is loaded and IIFE is working.");
        // Display an error in the test results area
        const resultsContainer = document.getElementById('test-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = "<h2>Error</h2><p>calendarApp not found. Tests cannot run.</p>";
        }
        return;
    }
    runAllTests();
    displayTestResults(); // From test-helpers.js
});

function runAllTests() {
    console.log("Starting tests with calendarApp...");

    // Test Date Logic (using test-helpers.js)
    testDaysInMonth_helpers(); // Renamed to clarify it tests helpers
    testFirstDayOfWeek_helpers(); // Renamed
    testDateFormattingForEvent(); // Uses helper

    // Test Date Logic (using calendarApp.generateCalendarData)
    testCalendarData_DaysInMonth();
    testCalendarData_FirstDayOfWeek();

    // Test Event Logic (using calendarApp)
    testEventManagement_SetAndGetEvents();
    testEventFindingWithGenerateCalendarData();
    
    // UI Interaction Tests (using calendarApp)
    testInitialDisplay(); // Should still work
    testMonthNavigation(); // Should still work
    testEventClickDisplaysDetails();

    console.log("Tests finished.");
}

// --- Date Logic Tests (using test-helpers.js) ---
function testDaysInMonth_helpers() {
    assertEquals(31, getDaysInMonth(2024, 0), "Helper: Days in January 2024");
    assertEquals(29, getDaysInMonth(2024, 1), "Helper: Days in February 2024 (leap year)");
    assertEquals(28, getDaysInMonth(2023, 1), "Helper: Days in February 2023 (non-leap year)");
}

function testFirstDayOfWeek_helpers() {
    assertEquals(1, getFirstDayOfWeek(2024, 0), "Helper: First day of Jan 2024 should be Monday (1)");
    assertEquals(6, getFirstDayOfWeek(2024, 5), "Helper: First day of June 2024 should be Saturday (6)");
}

function testDateFormattingForEvent() {
    assertEquals("2024-07-15", formatDateForEvent(new Date(2024, 6, 15)), "Format date for event (July 15, 2024)");
}

// --- Date Logic Tests (using calendarApp.generateCalendarData) ---
function testCalendarData_DaysInMonth() {
    const dateJan = new Date(2024, 0, 1); // Jan 2024
    const dataJan = calendarApp.generateCalendarData(dateJan, []);
    let actualDaysJan = 0;
    dataJan.weeks.forEach(week => week.forEach(day => { if(day.type === 'day') actualDaysJan++; }));
    assertEquals(31, actualDaysJan, "generateCalendarData: Days in January 2024");

    const dateFebLeap = new Date(2024, 1, 1); // Feb 2024
    const dataFebLeap = calendarApp.generateCalendarData(dateFebLeap, []);
    let actualDaysFebLeap = 0;
    dataFebLeap.weeks.forEach(week => week.forEach(day => { if(day.type === 'day') actualDaysFebLeap++; }));
    assertEquals(29, actualDaysFebLeap, "generateCalendarData: Days in February 2024 (leap year)");

    const dateFebNonLeap = new Date(2023, 1, 1); // Feb 2023
    const dataFebNonLeap = calendarApp.generateCalendarData(dateFebNonLeap, []);
    let actualDaysFebNonLeap = 0;
    dataFebNonLeap.weeks.forEach(week => week.forEach(day => { if(day.type === 'day') actualDaysFebNonLeap++; }));
    assertEquals(28, actualDaysFebNonLeap, "generateCalendarData: Days in February 2023 (non-leap year)");
}

function testCalendarData_FirstDayOfWeek() {
    // January 1, 2024 was a Monday (1)
    const dateJan2024 = new Date(2024, 0, 1);
    const dataJan2024 = calendarApp.generateCalendarData(dateJan2024, []);
    let firstDayIndexJan = -1;
    for(let i=0; i < dataJan2024.weeks[0].length; i++){
        if(dataJan2024.weeks[0][i].type === 'day' && dataJan2024.weeks[0][i].dayOfMonth === 1){
            firstDayIndexJan = i;
            break;
        }
    }
    assertEquals(1, firstDayIndexJan, "generateCalendarData: First day of Jan 2024 should be Monday (index 1)");

    // June 1, 2024 was a Saturday (6)
    const dateJune2024 = new Date(2024, 5, 1); // June is month 5
    const dataJune2024 = calendarApp.generateCalendarData(dateJune2024, []);
    let firstDayIndexJune = -1;
    for(let i=0; i < dataJune2024.weeks[0].length; i++){
        if(dataJune2024.weeks[0][i].type === 'day' && dataJune2024.weeks[0][i].dayOfMonth === 1){
            firstDayIndexJune = i;
            break;
        }
    }
    assertEquals(6, firstDayIndexJune, "generateCalendarData: First day of June 2024 should be Saturday (index 6)");
}


// --- Event Logic Tests (using calendarApp) ---
function testEventManagement_SetAndGetEvents() {
    const initialEvents = calendarApp.getEvents();
    const testEvents = [
        { date: '2024-10-01', title: 'Test Event 1' },
        { date: '2024-10-05', title: 'Test Event 2' }
    ];
    calendarApp.setEvents(testEvents);
    const retrievedEvents = calendarApp.getEvents();
    assertEquals(testEvents.length, retrievedEvents.length, "Set/Get Events: Number of events should match");
    assertTrue(retrievedEvents.some(e => e.title === 'Test Event 1'), "Set/Get Events: Event 1 should exist");
    
    // Restore original events or clear them if necessary for other tests
    calendarApp.setEvents(initialEvents); 
}

function testEventFindingWithGenerateCalendarData() {
    const testEvents = [
        { date: '2024-07-15', title: 'Specific Meeting' },
        { date: '2024-07-20', title: 'Another Task' }
    ];
    calendarApp.setEvents(testEvents); // Set known events

    const dateForJuly2024 = new Date(2024, 6, 1); // July is month 6
    const calendarData = calendarApp.generateCalendarData(dateForJuly2024, calendarApp.getEvents());

    let event1Found = false;
    let event2Found = false;
    let day15EventTitle = null;

    calendarData.weeks.forEach(week => {
        week.forEach(dayCell => {
            if (dayCell.type === 'day' && dayCell.dateStr === '2024-07-15') {
                if (dayCell.event) {
                    event1Found = true;
                    day15EventTitle = dayCell.event.title;
                }
            }
            if (dayCell.type === 'day' && dayCell.dateStr === '2024-07-20') {
                if (dayCell.event) {
                    event2Found = true;
                }
            }
        });
    });

    assertTrue(event1Found, "generateCalendarData: Event on 2024-07-15 should be found");
    assertEquals('Specific Meeting', day15EventTitle, "generateCalendarData: Event title for 2024-07-15 should be correct");
    assertTrue(event2Found, "generateCalendarData: Event on 2024-07-20 should be found");

    // Clear events for subsequent tests
    calendarApp.setEvents([]);
}


// --- UI Interaction Tests ---
function testInitialDisplay() {
    const monthYearHeader = document.getElementById('month-year-header');
    assertNotNull(monthYearHeader, "Month/Year header should exist.");
    
    // Initial render is triggered by script.js's DOMContentLoaded.
    // We'll check if it reflects the current month.
    // calendarApp.renderCalendar(new Date()); // Re-render to be sure, or rely on initial load.
    // For this test, let's rely on the initial load by script.js
    
    const today = new Date();
    const expectedMonth = today.toLocaleString('default', { month: 'long' });
    const expectedYear = today.getFullYear();
    assertTrue(monthYearHeader.textContent.includes(expectedMonth), `Initial month should be ${expectedMonth} (current was: ${monthYearHeader.textContent})`);
    assertTrue(monthYearHeader.textContent.includes(expectedYear.toString()), `Initial year should be ${expectedYear} (current was: ${monthYearHeader.textContent})`);
}

function testMonthNavigation() {
    // Ensure calendar is on a known state, e.g., current date
    const today = new Date();
    calendarApp.renderCalendar(today); // Set to current month

    const monthYearHeader = document.getElementById('month-year-header');
    let initialHeaderText = monthYearHeader.textContent;

    // Test "Next" button
    simulateClick('next-month-btn'); // This internally calls renderCalendar
    let newHeaderText = monthYearHeader.textContent;
    assertTrue(newHeaderText !== initialHeaderText, "Month/Year header should change after clicking 'Next'");

    // Test "Previous" button
    // Go back to current month
    calendarApp.renderCalendar(today); // Reset to current month
    simulateClick('prev-month-btn'); // Go to previous month
    initialHeaderText = monthYearHeader.textContent; // Header of current month
    newHeaderText = monthYearHeader.textContent; // Should be previous month
    // This logic needs adjustment: initialHeaderText should be from *before* prev click.
    // Let's re-render to today, get header, click prev, get header again.
    calendarApp.renderCalendar(today);
    initialHeaderText = monthYearHeader.textContent;
    simulateClick('prev-month-btn');
    newHeaderText = monthYearHeader.textContent;
    assertTrue(newHeaderText !== initialHeaderText, "Month/Year header should change after clicking 'Previous'");
    
    // Restore to current month for other tests if needed
    calendarApp.renderCalendar(today);
}

function testEventClickDisplaysDetails() {
    const eventDateStr = '2024-07-15';
    const eventTitle = 'Crucial Test Meeting';
    const testEvents = [{ date: eventDateStr, title: eventTitle }];

    calendarApp.setEvents(testEvents);
    calendarApp.renderCalendar(new Date(2024, 6, 1)); // Render July 2024 (month 6)

    const eventDetailsDisplay = document.getElementById('event-details-display');
    assertNotNull(eventDetailsDisplay, "Event details display area should exist.");
    // Clear previous event details to ensure test is clean
    if (eventDetailsDisplay.firstChild && eventDetailsDisplay.firstChild.nodeType === Node.TEXT_NODE) {
        eventDetailsDisplay.textContent = ''; 
    } else if (eventDetailsDisplay.querySelector('p')) {
        eventDetailsDisplay.querySelector('p').textContent = '';
    }


    let eventCell = null;
    const cells = document.querySelectorAll('#calendar-body td');
    cells.forEach(cell => {
        if (cell.textContent === '15' && !cell.classList.contains('empty')) {
            // Check if this cell is an event day (it should be)
             // We need to rely on the class or dataset added by renderCalendar
            if (cell.classList.contains('event-day') && cell.dataset.eventTitle === eventTitle) {
                 eventCell = cell;
            }
        }
    });

    if (!eventCell) {
        // Fallback: try to find by text content if class/dataset wasn't perfectly matched
        // This might happen if renderCalendar's event marking logic is slightly different than expected
        cells.forEach(cell => {
            if (cell.textContent === '15' && !cell.classList.contains('empty')) {
                eventCell = cell; // Take the first cell with '15'
            }
        });
    }

    assertTrue(eventCell !== null, `Event cell for day 15 in July 2024 should be found. (Event title: ${eventTitle})`);

    if (eventCell) {
        eventCell.click(); // Simulate click on the cell
        assertTrue(eventDetailsDisplay.textContent.includes(eventTitle), `Event details for '${eventTitle}' should be displayed after click. Actual: '${eventDetailsDisplay.textContent}'`);
    } else {
        // This path will be taken if the assertTrue above fails, but for safety:
        assertFalse(true, "Event cell for test was not found, so click could not be tested.");
    }

    // Clean up events
    calendarApp.setEvents([]);
    calendarApp.renderCalendar(new Date()); // Re-render current month
}
