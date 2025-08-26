/* Countdown Timer Script for julioct.github.io
   Description: Handles countdown timer functionality for main countdown and notification banner
*/

(function ($)
{
    "use strict";

    // Configuration object for countdown timers
    const countdownConfig = {
        // Main countdown timer configuration
        main: {
            targetDate: "September 2, 2025 06:00:00 PDT",
            title: "Back to School Sale Ends In",
            selectors: {
                days: "#countdown-days",
                hours: "#countdown-hours",
                minutes: "#countdown-minutes",
                seconds: "#countdown-seconds",
                container: ".countdown-container",
                titleElement: "#countdown-title-text"
            }
        },
        // Banner countdown timer configuration
        banner: {
            targetDate: "September 2, 2025 06:00:00 PDT", // Same date as main countdown
            selectors: {
                days: "#banner-countdown-days",
                hours: "#banner-countdown-hours",
                minutes: "#banner-countdown-minutes",
                seconds: "#banner-countdown-seconds",
                container: "#banner-countdown",
                bannerContainer: "#notification-banner"
            }
        }
    };

    /* Main Countdown Timer */
    function initCountdownTimer()
    {
        const config = countdownConfig.main;

        // Check if the countdown elements exist
        if (!document.querySelector(config.selectors.days)) return;

        const targetDate = new Date(config.targetDate).getTime();
        const daysElement = document.querySelector(config.selectors.days);
        const hoursElement = document.querySelector(config.selectors.hours);
        const minutesElement = document.querySelector(config.selectors.minutes);
        const secondsElement = document.querySelector(config.selectors.seconds);
        const countdownContainer = document.querySelector(config.selectors.container);
        const countdownTitleElement = document.querySelector(config.selectors.titleElement);

        // Check if the countdown has already ended on page load
        const now = new Date().getTime();
        const initialDistance = targetDate - now;

        // Update countdown title based on timer state
        if (countdownTitleElement)
        {
            if (initialDistance > 0)
            {
                countdownTitleElement.textContent = config.title;
            }
        }

        if (initialDistance <= 0)
        {
            if (countdownContainer)
            {
                countdownContainer.style.display = 'none';
            }
            return;
        }

        // Update the countdown every 1 second
        const countdown = setInterval(function ()
        {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0)
            {
                clearInterval(countdown);
                if (countdownContainer)
                {
                    countdownContainer.style.display = 'none';
                }
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysElement.innerHTML = days < 10 ? "0" + days : days;
            hoursElement.innerHTML = hours < 10 ? "0" + hours : hours;
            minutesElement.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            secondsElement.innerHTML = seconds < 10 ? "0" + seconds : seconds;
        }, 1000);
    }

    /* Banner Countdown Timer */
    function initBannerCountdownTimer()
    {
        const config = countdownConfig.banner;

        // Check if the banner countdown elements exist
        if (!document.querySelector(config.selectors.days)) return;

        const targetDate = new Date(config.targetDate).getTime();
        const daysElement = document.querySelector(config.selectors.days);
        const hoursElement = document.querySelector(config.selectors.hours);
        const minutesElement = document.querySelector(config.selectors.minutes);
        const secondsElement = document.querySelector(config.selectors.seconds);
        const countdownContainer = document.querySelector(config.selectors.container);
        const bannerContainer = document.querySelector(config.selectors.bannerContainer);

        // Check if the countdown has already ended on page load
        const now = new Date().getTime();
        const initialDistance = targetDate - now;

        if (initialDistance <= 0)
        {
            // Hide the entire banner if countdown is over
            if (bannerContainer)
            {
                bannerContainer.style.display = 'none';
            }
            return;
        }

        // Show the countdown timer
        if (countdownContainer)
        {
            countdownContainer.style.display = 'flex';
        }

        // Update the countdown every 1 second
        const countdown = setInterval(function ()
        {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0)
            {
                clearInterval(countdown);
                // Hide the entire banner when countdown expires
                if (bannerContainer)
                {
                    bannerContainer.style.display = 'none';
                }
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            daysElement.innerHTML = days < 10 ? "0" + days : days;
            hoursElement.innerHTML = hours < 10 ? "0" + hours : hours;
            minutesElement.innerHTML = minutes < 10 ? "0" + minutes : minutes;
            secondsElement.innerHTML = seconds < 10 ? "0" + seconds : seconds;
        }, 1000);
    }

    // Initialize both countdown timers when document is ready
    $(document).ready(function ()
    {
        initCountdownTimer();
        initBannerCountdownTimer();
    });

})(jQuery);
