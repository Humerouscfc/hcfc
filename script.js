var calendarApp = (function() {
    let currentDate = new Date();
    let events = []; // Initial empty events, will be populated in DOMContentLoaded

    // Query DOM elements once and store them.
    // These will be checked for existence in DOMContentLoaded.
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventDetailsDisplay = document.getElementById('event-details-display');

    function setEvents(newEventArray) {
        if (!Array.isArray(newEventArray)) {
            console.error("setEvents: input is not an array. Events not changed.");
            return;
        }
        events = [...newEventArray]; // Replace events with a copy of the new array
        // Optionally, re-render the calendar if events change dynamically
        // renderCalendar(currentDate); 
    }

    function getEvents() {
        return [...events]; // Return a copy of the current events
    }

    function generateCalendarData(date, eventsArray) {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            console.error("generateCalendarData: Invalid date parameter.", date);
            // Return a structure that won't break renderCalendar, or renderCalendar should handle this.
            // For now, let renderCalendar handle it by checking the return.
            return null; 
        }
        if (!Array.isArray(eventsArray)) {
            console.warn("generateCalendarData: eventsArray was not an array. Defaulting to empty array.", eventsArray);
            eventsArray = [];
        }

        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday

        const calendarData = {
            year: year,
            month: month,
            monthName: date.toLocaleString('default', { month: 'long' }),
            // days: [], // This was unused, 'weeks' is the primary data structure for days
            today: new Date(), // For checking current day highlighting
            weeks: []
        };

        let dayCells = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            dayCells.push({ type: 'empty' });
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // Ensure eventForDay and its title are handled carefully
            const eventForDay = eventsArray.find(event => event && event.date === cellDateStr);

            dayCells.push({
                type: 'day',
                dayOfMonth: day,
                dateStr: cellDateStr,
                isToday: (year === calendarData.today.getFullYear() && month === calendarData.today.getMonth() && day === calendarData.today.getDate()),
                event: (eventForDay && typeof eventForDay.title === 'string') ? { title: eventForDay.title } : null
            });
        }
        
        // Group dayCells into weeks (rows)
        let weeks = [];
        let currentWeek = [];
        dayCells.forEach(cell => {
            currentWeek.push(cell);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        });
        // Add remaining empty cells for the last week if it's not full
        if (currentWeek.length > 0) {
             while (currentWeek.length < 7) {
                currentWeek.push({ type: 'empty' });
            }
            weeks.push(currentWeek);
        }
        
        calendarData.weeks = weeks;
        return calendarData;
    }

    function renderCalendar(date) {
        if (!calendarBody || !monthYearHeader) {
            // This check is good, DOMContentLoaded also checks for button availability.
            console.error("renderCalendar: Essential calendar elements (calendarBody or monthYearHeader) not found in DOM.");
            return;
        }
        
        const calendarData = generateCalendarData(date, events); // Use internal events for rendering

        if (!calendarData || !calendarData.monthName || typeof calendarData.year === 'undefined') {
            console.error("renderCalendar: Failed to generate calendar data or data is malformed.", calendarData);
            calendarBody.innerHTML = '<tr><td colspan="7">Error loading calendar data.</td></tr>';
            monthYearHeader.textContent = 'Error';
            return;
        }

        // Clear previous calendar days
        calendarBody.innerHTML = '';

        // Set month and year in header
        monthYearHeader.textContent = `${calendarData.monthName} ${calendarData.year}`;

        if (!Array.isArray(calendarData.weeks)) {
            console.error("renderCalendar: calendarData.weeks is not an array.", calendarData);
            calendarBody.innerHTML = '<tr><td colspan="7">Error loading calendar weeks.</td></tr>';
            return;
        }

        calendarData.weeks.forEach(week => {
            if (!Array.isArray(week)) {
                console.warn("renderCalendar: A week in calendarData.weeks is not an array. Skipping row.", week);
                return; // Skip this week/row
            }
            const row = document.createElement('tr');
            week.forEach(dayCell => {
                if (!dayCell || typeof dayCell.type !== 'string') {
                    console.warn("renderCalendar: Invalid dayCell data. Skipping cell.", dayCell);
                    const cell = document.createElement('td');
                    cell.classList.add('empty'); // Render as empty for safety
                    row.appendChild(cell);
                    return; // Skip this cell
                }

                const cell = document.createElement('td');
                if (dayCell.type === 'empty') {
                    cell.classList.add('empty');
                } else if (dayCell.type === 'day') {
                    cell.textContent = dayCell.dayOfMonth;
                    // Ensure event and title exist before adding class and listener
                    if (dayCell.event && typeof dayCell.event.title === 'string') {
                        cell.classList.add('event-day');
                        cell.dataset.eventTitle = dayCell.event.title; // Safe: title is string
                        cell.addEventListener('click', () => {
                            if (eventDetailsDisplay) {
                                eventDetailsDisplay.textContent = `Event: ${dayCell.event.title}`;
                            } else {
                                // Fallback if eventDetailsDisplay is somehow null, though checked at top level
                                console.warn("renderCalendar: eventDetailsDisplay element not found at time of click, using alert.");
                                alert(`Event: ${dayCell.event.title}`);
                            }
                        });
                    }
                    if (dayCell.isToday) {
                        cell.classList.add('current-day');
                    }
                }
                row.appendChild(cell);
            });
            calendarBody.appendChild(row);
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        // Check essential DOM elements needed for the script to function
        if (!monthYearHeader) console.error("DOMContentLoaded: monthYearHeader element not found.");
        if (!calendarBody) console.error("DOMContentLoaded: calendarBody element not found.");
        if (!prevMonthBtn) console.error("DOMContentLoaded: prevMonthBtn element not found.");
        if (!nextMonthBtn) console.error("DOMContentLoaded: nextMonthBtn element not found.");
        // eventDetailsDisplay is optional for core functionality, but good to check if expected
        if (!eventDetailsDisplay) console.warn("DOMContentLoaded: eventDetailsDisplay element not found. Event details will not be shown on the page.");

        // Stop initialization if critical elements are missing
        if (!monthYearHeader || !calendarBody || !prevMonthBtn || !nextMonthBtn) {
            console.error("DOMContentLoaded: Critical calendar elements missing. Calendar initialization aborted.");
            if (calendarBody) { // Try to inform user via UI if possible
                calendarBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">Calendar failed to load. Required HTML elements are missing.</td></tr>';
            }
            return;
        }

        // Initialize sample events
        const sampleEvents = [
            { date: '2024-07-15', title: 'Team Meeting @ 10 AM' },
            { date: '2024-07-22', title: 'Project Deadline' },
            { date: '2024-08-05', title: 'Doctor Appointment' },
            { date: '2024-08-10' }, // Event with no title
            { title: 'Event with no date' }, // Event with no date
            null, // Invalid event entry
        ];
        // setEvents will now handle non-array input, but sampleEvents is an array here.
        // Filter out invalid event entries before setting for cleaner initial data
        const validSampleEvents = sampleEvents.filter(event => event && typeof event.date === 'string' && typeof event.title === 'string');
        setEvents(validSampleEvents); 
        
        if (sampleEvents.length !== validSampleEvents.length) {
            console.warn("DOMContentLoaded: Some sample events were invalid and have been filtered out.", sampleEvents);
        }


        // Event listeners for navigation buttons
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });

        // Initial render
        renderCalendar(currentDate);
    });

    // Return object of public functions
    return {
        renderCalendar,
        setEvents,
        getEvents,
        generateCalendarData
        // any other functions needed for tests
    };
})();
