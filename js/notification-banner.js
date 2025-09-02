/* Global Notification Banner Script
   Description: Centrally manages notification banner        }
    }

    function initializeCountdown() {s
*/

(function ()
{
    "use strict";

    // Banner configuration - change these values to update the banner site-wide
    const bannerConfig = {
        // Set to true to show the banner, false to hide it
        enabled: false,

        // Banner content
        message: "📚 Back to School Sale: <strong>30% OFF EVERYTHING</strong> • Ends&nbsp;September&nbsp;2",

        // Button configuration
        button: {
            text: "SAVE 30% NOW",
            url: "/courses"
        },

        // Countdown timer configuration (set endDate to null to disable countdown)
        countdown: {
            enabled: true, // Set to true to enable countdown timer
            endDate: new Date('September 2, 2025 06:00:00 PDT') // Same as countdown-timer.js
        },

        // Styling
        backgroundColor: "#E56717",
        textColor: "white",
        buttonBackgroundColor: "#2C3E8C"
    };

    document.addEventListener("DOMContentLoaded", function ()
    {
        // Always adjust header padding, whether banner is enabled or not
        adjustHeaderPadding();

        // Only proceed with banner creation if banner is enabled
        if (!bannerConfig.enabled)
        {
            return;
        }

        // Find the existing fixed-top div (navigation container)
        const existingFixedTop = document.querySelector('.fixed-top');

        if (!existingFixedTop)
        {
            console.warn('No .fixed-top container found for banner insertion');
            return;
        }

        // Check if we're on the courses page to conditionally hide the button
        const isCoursesPage = window.location.pathname.includes('/courses') || window.location.pathname.endsWith('/courses/');

        // Create just the banner HTML (without the fixed-top wrapper)
        const bannerHtml = `
            <div id="notification-banner" class="alert alert-info promo-alert text-center mb-0" role="alert"
                style="background-color: ${bannerConfig.backgroundColor}; color: ${bannerConfig.textColor};">
                <div class="d-flex align-items-center justify-content-center flex-wrap">
                    <span class="mr-3">
                        ${bannerConfig.message}
                    </span>
                    ${bannerConfig.countdown.enabled ? `
                    <div id="banner-countdown" class="countdown-timer mx-3">
                        <span class="countdown-item">
                            <span id="banner-countdown-days">00</span>
                            <small>days</small>
                        </span>
                        <span class="countdown-separator">:</span>
                        <span class="countdown-item">
                            <span id="banner-countdown-hours">00</span>
                            <small>hrs</small>
                        </span>
                        <span class="countdown-separator">:</span>
                        <span class="countdown-item">
                            <span id="banner-countdown-minutes">00</span>
                            <small>min</small>
                        </span>
                        <span class="countdown-separator">:</span>
                        <span class="countdown-item">
                            <span id="banner-countdown-seconds">00</span>
                            <small>sec</small>
                        </span>
                    </div>
                    ` : ''}
                    ${!isCoursesPage ? `
                    <a href="${bannerConfig.button.url}" class="btn btn-sm ml-3"
                        style="font-weight: bold; color: ${bannerConfig.textColor}; text-decoration: none; background-color: ${bannerConfig.buttonBackgroundColor}; border: none; padding: 8px 16px; display: flex; align-items: center; height: 44px;">
                        ${bannerConfig.button.text}</a>
                    ` : ''}
                </div>
            </div>
        `;

        // Insert the banner as the first child of the existing fixed-top container
        existingFixedTop.insertAdjacentHTML('afterbegin', bannerHtml);

        // Re-adjust header padding now that banner is added
        adjustHeaderPadding();

        // Initialize countdown timer if enabled
        if (bannerConfig.countdown.enabled && bannerConfig.countdown.endDate)
        {
            initializeCountdown();
        }
    });

    function adjustHeaderPadding()
    {
        // Wait a bit for the banner to be fully rendered and styled
        setTimeout(function ()
        {
            const fixedTopContainer = document.querySelector('.fixed-top');
            const header = document.querySelector('#header');

            if (fixedTopContainer && header)
            {
                // Get the actual height of the entire fixed navigation (banner + nav)
                const totalFixedHeight = fixedTopContainer.offsetHeight;

                // Convert to rem (assuming 1rem = 16px, but we'll calculate it)
                const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                const paddingInRem = (totalFixedHeight + 20) / rootFontSize; // +20px for breathing room

                // Apply the calculated padding
                header.style.paddingTop = paddingInRem + 'rem';

                console.log(`Auto-adjusted header padding to ${paddingInRem.toFixed(2)}rem (${totalFixedHeight + 20}px)`);
            }
        }, 100); // Small delay to ensure CSS is applied
    }

    function adjustPagePadding()
    {
        // Don't add any extra padding to body - let the existing layout handle spacing
        // The original layout already has proper padding-top on the header element

        // Just ensure the banner doesn't create any unwanted spacing
        const banner = document.getElementById('notification-banner');
        if (banner)
        {
            // Remove any default margins that might create white space
            banner.style.marginBottom = '0';
            banner.style.marginTop = '0';
        }
    }

    function initializeCountdown()
    {
        if (!bannerConfig.countdown.endDate) return;

        function updateCountdown()
        {
            const now = new Date().getTime();
            const distance = bannerConfig.countdown.endDate.getTime() - now;

            if (distance < 0)
            {
                // Timer expired - hide the banner and readjust header padding
                const banner = document.getElementById('notification-banner');
                if (banner)
                {
                    banner.style.display = 'none';
                    // Re-adjust header padding after hiding banner
                    adjustHeaderPadding();
                }
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById("banner-countdown-days").innerHTML = days.toString().padStart(2, '0');
            document.getElementById("banner-countdown-hours").innerHTML = hours.toString().padStart(2, '0');
            document.getElementById("banner-countdown-minutes").innerHTML = minutes.toString().padStart(2, '0');
            document.getElementById("banner-countdown-seconds").innerHTML = seconds.toString().padStart(2, '0');
        }

        // Update countdown immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
})();
