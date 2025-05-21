document.addEventListener('DOMContentLoaded', function() {
    const monthYearHeader = document.getElementById('month-year-header');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const eventDetailsDisplay = document.getElementById('event-details-display'); // Added later

    let currentDate = new Date();

    // Sample event data
    const events = [
        { date: '2024-07-15', title: 'Team Meeting @ 10 AM' },
        { date: '2024-07-22', title: 'Project Deadline' },
        { date: '2024-08-05', title: 'Doctor Appointment' },
        // Add more sample events as needed
    ];

    function renderCalendar(date) {
        // Clear previous calendar days
        calendarBody.innerHTML = '';

        const year = date.getFullYear();
        const month = date.getMonth(); // 0-indexed (0 for January, 11 for December)

        // Set month and year in header
        monthYearHeader.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0); // Last day of current month
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, ...

        let currentDay = 1;
        let row = document.createElement('tr');

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const cell = document.createElement('td');
            cell.classList.add('empty');
            row.appendChild(cell);
        }

        // Add cells for each day of the month
        while (currentDay <= daysInMonth) {
            if (row.children.length === 7) {
                calendarBody.appendChild(row);
                row = document.createElement('tr');
            }

            const cell = document.createElement('td');
            cell.textContent = currentDay;

            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
            
            const eventForDay = events.find(event => event.date === cellDateStr);

            if (eventForDay) {
                cell.classList.add('event-day');
                cell.dataset.eventTitle = eventForDay.title; // Store event title
                cell.addEventListener('click', () => {
                    if (eventDetailsDisplay) { // Check if the display div exists
                         eventDetailsDisplay.textContent = `Event: ${eventForDay.title}`;
                    } else {
                        alert(`Event: ${eventForDay.title}`); // Fallback to alert
                    }
                });
            }

            // Highlight today's date
            const today = new Date();
            if (year === today.getFullYear() && month === today.getMonth() && currentDay === today.getDate()) {
                cell.classList.add('current-day');
            }

            row.appendChild(cell);
            currentDay++;
        }

        // Add empty cells for remaining days in the last week
        while (row.children.length < 7) {
            const cell = document.createElement('td');
            cell.classList.add('empty');
            row.appendChild(cell);
        }
        calendarBody.appendChild(row); // Append the last row
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

    // Ensure eventDetailsDisplay is available (if added dynamically or script order issues)
    // This is more of a safeguard, best to ensure HTML order or use the DOMContentLoaded correctly.
    if (!eventDetailsDisplay && document.getElementById('event-details-display')) {
        // If it was added to HTML but not grabbed initially (should not happen with DOMContentLoaded)
        // This is defensive coding. The variable should be grabbed at the top.
        // For this task, I'll assume eventDetailsDisplay is correctly fetched if it exists in HTML.
    }
});
