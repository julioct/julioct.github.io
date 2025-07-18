/* Countdown Timer Script for julioct.github.io
   Description: Handles dynamic countdown timer functionality with personalized 48-hour deadlines
   Features: Deadline Funnel-style personalized countdown timers
*/

(function ($)
{
    "use strict";

    // Configuration object for countdown timers
    const countdownConfig = {
        // Dynamic deadline configuration (72 hours from first visit or email click)
        deadlineHours: 72,
        fallbackDate: "July 25, 2025 06:00:00 PDT", // Fallback if no dynamic deadline can be set
        storageKeys: {
            deadline: 'dealDeadline',
            emailTimestamp: 'emailSentTime'
        },
        // Main countdown timer configuration
        main: {
            title: "Limited Time Deal Ends In",
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

    /* Utility Functions for Dynamic Deadline Management */

    /**
     * Gets or creates a personalized deadline for the user
     * Priority: 1) URL parameter, 2) Stored deadline, 3) Current time + 48h, 4) Fallback date
     */
    function getPersonalizedDeadline()
    {
        try
        {
            // Check for email timestamp in URL (when user clicks email link)
            const urlParams = new URLSearchParams(window.location.search);
            const emailTime = urlParams.get('emailTime') || urlParams.get('et');

            if (emailTime)
            {
                // Convert email timestamp and add 48 hours
                const emailTimestamp = parseInt(emailTime) * 1000; // Convert to milliseconds
                const deadline = emailTimestamp + (countdownConfig.deadlineHours * 60 * 60 * 1000);

                // Store this deadline for future visits
                localStorage.setItem(countdownConfig.storageKeys.deadline, deadline.toString());
                localStorage.setItem(countdownConfig.storageKeys.emailTimestamp, emailTimestamp.toString());

                return deadline;
            }

            // Check for existing stored deadline
            const storedDeadline = localStorage.getItem(countdownConfig.storageKeys.deadline);
            if (storedDeadline)
            {
                return parseInt(storedDeadline);
            }

            // If no email timestamp, create deadline from current time (first visit)
            const now = new Date().getTime();
            const newDeadline = now + (countdownConfig.deadlineHours * 60 * 60 * 1000);

            // Store for future visits
            localStorage.setItem(countdownConfig.storageKeys.deadline, newDeadline.toString());

            return newDeadline;

        } catch (error)
        {
            console.warn('Error getting personalized deadline, using fallback:', error);
            // Return fallback date if anything goes wrong
            return new Date(countdownConfig.fallbackDate).getTime();
        }
    }

    /**
     * Clears stored deadline data (useful for testing or reset)
     */
    function clearDeadlineData()
    {
        localStorage.removeItem(countdownConfig.storageKeys.deadline);
        localStorage.removeItem(countdownConfig.storageKeys.emailTimestamp);
    }

    /**
     * Gets deadline info for debugging
     */
    function getDeadlineInfo()
    {
        const deadline = localStorage.getItem(countdownConfig.storageKeys.deadline);
        const emailTime = localStorage.getItem(countdownConfig.storageKeys.emailTimestamp);

        return {
            deadline: deadline ? new Date(parseInt(deadline)) : null,
            emailTime: emailTime ? new Date(parseInt(emailTime)) : null,
            hasStoredDeadline: !!deadline,
            timeRemaining: deadline ? parseInt(deadline) - new Date().getTime() : 0
        };
    }

    // Expose utility functions globally for debugging
    window.deadlineFunnel = {
        clearData: clearDeadlineData,
        getInfo: getDeadlineInfo,
        getDeadline: getPersonalizedDeadline
    };

    /* Main Countdown Timer */
    function initCountdownTimer()
    {
        const config = countdownConfig.main;

        // Check if the countdown elements exist
        if (!document.querySelector(config.selectors.days)) return;

        // Get personalized deadline instead of fixed date
        const targetDate = getPersonalizedDeadline();

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

        // Get personalized deadline instead of fixed date
        const targetDate = getPersonalizedDeadline();

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
