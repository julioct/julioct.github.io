/* Countdown Timer Script for julioct.github.io
   Description: Handles the countdown timer functionality
*/

(function ($)
{
    "use strict";

    /* Countdown Timer */
    function initCountdownTimer()
    {
        // Check if the countdown elements exist
        if (!document.getElementById("countdown-days")) return;

        // Set the date to count down to - April 20, 2025 at 6am Seattle time (PDT)
        const targetDate = new Date("June 23, 2025 06:00:00 PDT").getTime();

        // Custom countdown title (if needed)
        const customCountdownTitle = "Bootcamp Doors Close In";

        // Elements
        const daysElement = document.getElementById("countdown-days");
        const hoursElement = document.getElementById("countdown-hours");
        const minutesElement = document.getElementById("countdown-minutes");
        const secondsElement = document.getElementById("countdown-seconds");
        const countdownContainer = document.querySelector('.countdown-container');
        const countdownTitleElement = document.getElementById('countdown-title-text');

        // Check if the countdown has already ended on page load
        const now = new Date().getTime();
        const initialDistance = targetDate - now;

        // Update countdown title based on timer state
        if (countdownTitleElement)
        {
            if (initialDistance > 0)
            {
                // Timer active, use custom title
                countdownTitleElement.textContent = customCountdownTitle;
            }
        }

        if (initialDistance <= 0)
        {
            if (countdownContainer)
            {
                countdownContainer.style.display = 'none';
            }
            return; // Exit early if countdown already finished
        }

        // Update the countdown every 1 second
        const countdown = setInterval(function ()
        {
            // Get current date and time
            const now = new Date().getTime();

            // Find the distance between now and the countdown date
            const distance = targetDate - now;

            // Time calculations for days, hours, minutes and seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result with leading zeros
            daysElement.innerHTML = days < 10 ? "0" + days : days;
            hoursElement.innerHTML = hours < 10 ? "0" + hours : hours;
            minutesElement.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            secondsElement.innerHTML = seconds < 10 ? "0" + seconds : seconds;

            // If the countdown is finished, hide the countdown container
            if (distance < 0)
            {
                clearInterval(countdown);
                if (countdownContainer)
                {
                    countdownContainer.style.display = 'none';
                }
                // Reset to default title if timer expires while on page
                if (countdownTitleElement)
                {
                    countdownTitleElement.textContent = defaultCountdownTitle;
                }
            }
        }, 1000);
    }

    // Initialize the countdown timer when document is ready
    $(document).ready(function ()
    {
        initCountdownTimer();
    });

})(jQuery);
