document.addEventListener("DOMContentLoaded", function () {
    const queueList = document.getElementById('queueList');
    const nameInput = document.getElementById('nameInput');
    const addButton = document.getElementById('addButton');
    const datePicker = document.getElementById('datePicker');
    const hourGrid = document.getElementById('hourGrid');
    const calendar = document.getElementById('calendar');
    const downloadButton = document.getElementById('downloadButton');

    // Load queue from localStorage or start with an empty object
    let queue = JSON.parse(localStorage.getItem('escapeRoomQueue')) || {};

    // Hours available for booking
    const hours = [
        "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
    ];

    let selectedTime = ''; // Variable to store the selected time

    // Hide the calendar initially
    calendar.style.display = 'none';

    // Render the queue list from localStorage
    function renderQueue() {
        // Clear current list (if needed for a visual, can be omitted)
        queueList.innerHTML = '';

        // Generate the hour grid based on existing bookings
        generateHourGrid();
    }

    // Add a person to the queue
    function addToQueue(name, date, time) {
        if (!queue[date]) {
            queue[date] = [];
        }

        const isTimeTaken = queue[date].some(entry => entry.time === time);
        if (isTimeTaken) {
            alert("Booking failed. This time slot is already booked. Please select a different time.");
            return;
        }

        if (name && date && time) {
            queue[date].push({ name, time });
            updateLocalStorage();
            alert("Booking successful!");  // Show success message
            generateHourGrid(); // Refresh hour grid after booking
        } else {
            alert("Booking failed. Please enter a name, select a date, and provide a time.");
        }
    }

    // Update localStorage with the current queue
    function updateLocalStorage() {
        localStorage.setItem('escapeRoomQueue', JSON.stringify(queue));
    }

    // Generate the hour grid dynamically
    function generateHourGrid() {
        const selectedDate = datePicker.value;
        hourGrid.innerHTML = '';  // Clear the previous grid

        if (!selectedDate) return; // Exit if no date is selected

        hours.forEach(hour => {
            const button = document.createElement('button');
            button.textContent = hour;
            button.classList.add('bg-gray-800', 'text-white', 'py-2', 'px-4', 'rounded-lg', 'hover:bg-[#ff00ff]', 'focus:outline-none', 'duration-200');

            // Disable the button if the hour is already booked
            if (queue[selectedDate] && queue[selectedDate].some(entry => entry.time === hour)) {
                button.disabled = true;
                button.classList.add('bg-gray-500', 'cursor-not-allowed');
            }

            // Event listener for selecting the hour
            button.addEventListener('click', () => {
                // Unselect previously selected button
                const previouslySelectedButton = hourGrid.querySelector('.selected');
                if (previouslySelectedButton) {
                    previouslySelectedButton.classList.remove('selected', 'bg-[#ff00ff]');
                    previouslySelectedButton.classList.add('bg-gray-800'); // Reset background color
                }

                // Select the new button
                selectedTime = hour;  // Store selected hour
                button.classList.add('selected', 'bg-[#ff00ff]');
                checkInputs();  // Check if inputs are valid to enable 'Add to Queue'
            });

            hourGrid.appendChild(button);
        });
    }

    // Check if the "Add to Queue" button should be enabled
    function checkInputs() {
        const name = nameInput.value.trim();
        const date = datePicker.value.trim();

        // Enable button only if name, date, and selected time are valid
        if (name && date && selectedTime) {
            addButton.disabled = false;
        } else {
            addButton.disabled = true;
        }
    }

    // Event listener for adding a name to the queue
    addButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const date = datePicker.value.trim();
        const time = selectedTime;  // Use the selected time
        addToQueue(name, date, time);
        nameInput.value = '';  // Clear the input fields after adding
        datePicker.value = '';
        selectedTime = '';  // Reset selected time
        addButton.disabled = true;  // Disable button after adding
        generateHourGrid();         // Refresh hour grid
    });

    // Show calendar when the user types in the name input
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim()) {
            calendar.style.display = 'block'; // Show calendar when name is entered
        } else {
            calendar.style.display = 'none';  // Hide if the input is cleared
        }
    });

    // Show time picker when a date is selected
    datePicker.addEventListener('input', () => {
        if (datePicker.value) {
            generateHourGrid(); // Generate hour grid based on the selected date
        }
    });

    // Initial render of the queue when the page loads
    renderQueue();

    // Download function remains unchanged
    function downloadQueue() {
        try {
            const bookings = [];
            for (const [date, entries] of Object.entries(queue)) {
                entries.forEach(entry => {
                    bookings.push({
                        name: entry.name,
                        date: date,
                        time: entry.time
                    });
                });
            }

            bookings.sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

            const exportData = {
                exportDate: new Date().toISOString(),
                totalBookings: bookings.length,
                bookings: bookings
            };

            const jsonData = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `escape-room-queue-${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('There was an error downloading the queue. Please check the console for details.');
        }
    }

    // Attach event listener to download button
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadQueue);
    }
});

// SendMail function remains unchanged
function SendMail() {
    var params = {
        nameInput: document.getElementById("nameInput").value,
        datePicker: document.getElementById("datePicker").value,
        hourGrid: document.getElementById("hourGrid").value
    }
    emailjs.send("service_9wx24ml", "template_za69wn8", params).then(function (res) {
        alert("Success! " + res.status);
    });
}
