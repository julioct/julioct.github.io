/* Parity Deals Script for julioct.github.io
   Description: Handles the parity deals coupon functionality
*/

(function ($)
{
    "use strict";

    // Parity Deals coupon handling
    document.addEventListener("DOMContentLoaded", function ()
    {
        // Global variable to store Parity Deals response data
        window.parityDealsInfo = {
            couponCode: "CLOUD100", // Default coupon code (if defined here, banner shows immediately)
            discountPercentage: "", // Default discount percentage (no decimals)
            discountDollars: "100",  // Manual default discount in dollars (not provided by API)
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        };

        const paymentPlanContainer = document.getElementById('payment-plan-container');
        const frequencyElement = document.querySelector('.one-time-payment');
        const fullPriceDiv = document.getElementById('full-price');
        const discountedPriceDiv = document.getElementById('discounted-price');
        const oneTimePaymentLink = document.getElementById('one-time-payment-link');
        const notificationBanner = document.getElementById('notification-banner');
        const originalHref = "https://learn.dotnetacademy.io/enroll/3177167?price_id=4059720";
        const originalPrice = 497; // Original price in dollars

        // Make sure banner is completely hidden by default (in case CSS doesn't do this)
        if (notificationBanner)
        {
            notificationBanner.style.display = 'none';
        }

        // Function to update notification banner with discount information
        const updateNotificationBanner = function ()
        {
            if (!notificationBanner) return;

            const couponCode = window.parityDealsInfo.couponCode;

            // If there's no coupon code, don't show the banner at all
            if (!couponCode)
            {
                notificationBanner.style.display = 'none';
                return;
            }

            const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
            const discountDollars = window.parityDealsInfo.discountDollars;
            const country = window.parityDealsInfo.country || "your country";

            let discountText = "";

            // Determine whether to use percentage or dollar amount
            if (discountPercentage > 0)
            {
                discountText = `${discountPercentage}%`;
            } else
            {
                discountText = `$${discountDollars}`;
            }

            let bannerText = `Course 4 Launch Sale: Get <strong>${discountText} Off</strong> + <strong>Bonus Course</strong> until Sunday 4/20!`;

            // If coupon code came from the Parity Deals API, use the country-specific format
            if (window.parityDealsInfo.couponFromAPI)
            {
                bannerText = `Course 4 Launch Sale: Special offer for <strong>${country}</strong> – <strong>${discountText} Off</strong> + Bonus Course until Sunday 4/20!`;
            }

            notificationBanner.innerHTML = bannerText;
            notificationBanner.style.display = 'block';
        };

        // Function to update link with coupon code
        const updateCouponLink = function ()
        {
            if (oneTimePaymentLink)
            {
                const couponCode = window.parityDealsInfo.couponCode;
                if (couponCode)
                {
                    oneTimePaymentLink.href = originalHref + "&coupon=" + couponCode;
                } else
                {
                    oneTimePaymentLink.href = originalHref;
                }
            }
        };

        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function ()
        {
            const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
            const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;
            let discountedPrice = originalPrice;

            // Apply percentage discount if available, otherwise use dollar discount
            if (discountPercentage > 0)
            {
                discountedPrice = originalPrice - (originalPrice * discountPercentage / 100);
            } else if (discountDollars > 0)
            {
                discountedPrice = originalPrice - discountDollars;
            }

            // Ensure the price is not negative and round to whole number
            return Math.max(Math.round(discountedPrice), 0);
        };

        // Update discount display information
        const updateDiscountDisplay = function ()
        {
            const discountedPriceValue = document.getElementById('discounted-price-value');
            const originalPriceSpan = document.getElementById('original-price');
            const discountAmountSpan = document.getElementById('discount-amount');

            if (discountedPriceValue && originalPriceSpan && discountAmountSpan)
            {
                const discountedPrice = calculateDiscountedPrice();
                const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
                const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;

                // Update the discounted price
                discountedPriceValue.textContent = discountedPrice;

                // Update original price display
                originalPriceSpan.textContent = `$${originalPrice}`;

                // Determine and update the discount text
                if (discountPercentage > 0)
                {
                    discountAmountSpan.textContent = `${discountPercentage}% OFF`;
                } else
                {
                    discountAmountSpan.textContent = `$${discountDollars} OFF`;
                }
            }
        };

        // Function to update UI based on coupon code availability
        const updateUI = function ()
        {
            const hasCouponCode = !!window.parityDealsInfo.couponCode;

            // Show/hide payment plan container based on coupon code
            if (paymentPlanContainer)
            {
                paymentPlanContainer.style.display = hasCouponCode ? 'none' : 'block';
            }

            // Update frequency element text
            if (frequencyElement)
            {
                frequencyElement.textContent = hasCouponCode ? 'Lifetime Access' : 'Best Value';
            }

            // Update price display - show discounted price when coupon code is present
            if (fullPriceDiv && discountedPriceDiv)
            {
                fullPriceDiv.style.display = hasCouponCode ? 'none' : 'block';
                discountedPriceDiv.style.display = hasCouponCode ? 'block' : 'none';
            }

            // Update discount display values
            updateDiscountDisplay();

            // Update notification banner
            updateNotificationBanner();

            // Update coupon link
            updateCouponLink();
        };

        // Function to fetch coupon from Parity Deals API (only called once)
        const fetchParityCoupon = async function ()
        {
            try
            {
                const apiUrl = `https://api.paritydeals.com/api/v1/deals/discount/?url=${encodeURIComponent(window.location.href)}`;
                const response = await fetch(apiUrl);

                if (!response.ok)
                {
                    console.log("Failed to fetch coupon from Parity Deals API");
                    return;
                }

                const data = await response.json();
                console.log("Parity Deals API response:", data);

                // Store the API response globally and update UI if needed
                let uiNeedsUpdate = false;

                if (data.couponCode)
                {
                    window.parityDealsInfo.couponCode = data.couponCode;
                    window.parityDealsInfo.couponFromAPI = true; // Set flag indicating coupon came from API
                    uiNeedsUpdate = true;
                }

                if (data.discountPercentage)
                {
                    // Remove any decimal places from the discount percentage
                    window.parityDealsInfo.discountPercentage = parseInt(data.discountPercentage).toString();
                    uiNeedsUpdate = true;
                }

                // Add handling for country from the API
                if (data.country)
                {
                    window.parityDealsInfo.country = data.country;
                    uiNeedsUpdate = true;
                }

                if (uiNeedsUpdate)
                {
                    updateUI();
                }
            } catch (error)
            {
                console.log("Error fetching coupon from Parity Deals API:", error);
            }
        };

        // Initialize the UI based on current state (handling hardcoded value)
        updateUI();

        // Fetch from API only once
        fetchParityCoupon();
    });

})(jQuery);
