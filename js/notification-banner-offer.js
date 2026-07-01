/* Notification Banner Script — Nurture Offer Page
   Description: Shows a personalized offer banner with a countdown driven by countdown-timer-offer.js.
   The banner creates the countdown DOM elements; the timer script populates them with the personalized deadline.
*/

(function ()
{
    "use strict";

    const bannerConfig = {
        enabled: true,

        // Banner content
        message: "Special Offer: <strong>.NET Developer Bootcamp &bull; 20% Off</strong> &bull; Ends In",

        // Button configuration (hidden on bootcamp pages automatically)
        button: {
            text: "ENROLL NOW",
            url: "#pricing"
        },

        // countdown.enabled creates the countdown DOM elements so countdown-timer-offer.js can drive them.
        // endDate is null so this script does NOT start its own fixed-date interval.
        countdown: {
            enabled: true,
            endDate: null
        },

        // Styling — matches the launch sale palette
        backgroundColor: "#E56717",
        textColor: "white",
        buttonBackgroundColor: "#2C3E8C"
    };

    document.addEventListener("DOMContentLoaded", function ()
    {
        adjustHeaderPadding();

        if (!bannerConfig.enabled)
        {
            return;
        }

        const existingFixedTop = document.querySelector('.fixed-top');

        if (!existingFixedTop)
        {
            console.warn('No .fixed-top container found for banner insertion');
            return;
        }

        const isBootcampPage = window.location.pathname.includes('/dotnetbootcamp');

        const bannerHtml = `
            <div id="notification-banner" class="alert alert-info promo-alert text-center mb-0" role="alert"
                style="background-color: ${bannerConfig.backgroundColor}; color: ${bannerConfig.textColor};">
                <div class="d-flex align-items-center justify-content-center flex-wrap">
                    <span class="mr-1">
                        ${bannerConfig.message}
                    </span>
                    ${bannerConfig.countdown.enabled ? `
                    <div id="banner-countdown" class="countdown-timer ml-1 mr-3">
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
                    ${!isBootcampPage ? `
                    <a href="${bannerConfig.button.url}" class="btn btn-sm ml-3"
                        style="font-weight: bold; color: ${bannerConfig.textColor}; text-decoration: none; background-color: ${bannerConfig.buttonBackgroundColor}; border: none; padding: 8px 16px; display: flex; align-items: center; height: 44px;">
                        ${bannerConfig.button.text}</a>
                    ` : ''}
                </div>
            </div>
        `;

        existingFixedTop.insertAdjacentHTML('afterbegin', bannerHtml);

        adjustHeaderPadding();

        // endDate is null — countdown-timer-offer.js drives the banner countdown instead
    });

    function adjustHeaderPadding()
    {
        setTimeout(function ()
        {
            const fixedTopContainer = document.querySelector('.fixed-top');
            const header = document.querySelector('#header');

            if (fixedTopContainer && header)
            {
                const totalFixedHeight = fixedTopContainer.offsetHeight;
                const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                const paddingInRem = (totalFixedHeight + 20) / rootFontSize;
                header.style.paddingTop = paddingInRem + 'rem';
            }
        }, 100);
    }
})();
