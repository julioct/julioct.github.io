/* Parity Deals Script for julioct.github.io
   Description: Handles the parity deals coupon functionality
*/

(function ($)
{
    "use strict";

    // Parity Deals coupon handling
    document.addEventListener("DOMContentLoaded", function ()
    {        // Global variable to store Parity Deals response data
        window.parityDealsInfo = {
            couponCode: "ASPIRE30", // Default coupon code (empty - no hardcoded coupon)
            discountPercentage: "30", // Default discount percentage (no decimals)
            discountDollars: "",  // Manual default discount in dollars (not provided by API)
            paymentPlanCouponCode: "ASPIRE15", // Default payment plan coupon code
            paymentPlanDiscountPercentage: "15", // Default payment plan discount percentage
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        }; const paymentPlanContainer = document.getElementById('payment-plan-container');
        const frequencyElement = document.querySelector('.one-time-payment');
        const fullPriceDiv = document.getElementById('full-price');
        const discountedPriceDiv = document.getElementById('discounted-price'); const oneTimePaymentLink = document.getElementById('one-time-payment-link');
        const paymentPlanLink = document.querySelector('#payment-plan-container #payment-plan-link'); // Payment plan link within payment plan container
        const notificationBanner = document.getElementById('notification-banner');
        const originalHref = "https://learn.dotnetacademy.io/enroll/3177167?price_id=4059720"; const paymentPlanOriginalHref = "https://learn.dotnetacademy.io/enroll/3177167?price_id=4132623"; // Add payment plan original URL
        const originalPrice = 497; // Original price in dollars
        const originalMonthlyPrice = 129; // Original monthly price in dollars

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

            let bannerText = `Containers & .NET Aspire (Course 5) Launch — <strong>Save ${discountText}</strong> + <strong>Early-Bird Bonuses (first 100)</strong>`;

            // If coupon code came from the Parity Deals API, use the country-specific format
            if (window.parityDealsInfo.couponFromAPI)
            {
                bannerText = `Containers & .NET Aspire Launch — Special price for <small><strong>${country}</strong></small> — <strong>Save ${discountText}</strong> — Early-Bird Bonuses <strong>(first 100)</strong>`;
            }

            notificationBanner.innerHTML = bannerText;
            notificationBanner.style.display = 'block';
        };        // Function to update link with coupon code
        const updateCouponLink = function ()
        {
            // Update one-time payment link (not in payment plan container)
            const oneTimeLink = document.querySelector('.col-lg-4:not(#payment-plan-container) #one-time-payment-link');
            if (oneTimeLink)
            {
                const couponCode = window.parityDealsInfo.couponCode;
                if (couponCode)
                {
                    oneTimeLink.href = originalHref + "&coupon=" + couponCode;
                } else
                {
                    oneTimeLink.href = originalHref;
                }
            }            // Update payment plan link (within payment plan container)
            if (paymentPlanLink)
            {
                const paymentPlanCouponCode = window.parityDealsInfo.paymentPlanCouponCode;
                if (paymentPlanCouponCode)
                {
                    paymentPlanLink.href = paymentPlanOriginalHref + "&coupon=" + paymentPlanCouponCode;
                } else
                {
                    paymentPlanLink.href = paymentPlanOriginalHref;
                }
            }
        };// Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function (isPaymentPlan = false)
        {
            let discountPercentage, discountDollars;
            let basePrice = isPaymentPlan ? originalMonthlyPrice : originalPrice;

            if (isPaymentPlan)
            {
                // Use payment plan specific discount
                discountPercentage = parseInt(window.parityDealsInfo.paymentPlanDiscountPercentage) || 0;
                discountDollars = 0; // Payment plan only uses percentage discount
            } else
            {
                // Use one-time payment discount
                discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
                discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;
            }

            let discountedPrice = basePrice;

            // Apply percentage discount if available, otherwise use dollar discount (for one-time only)
            if (discountPercentage > 0)
            {
                discountedPrice = basePrice - (basePrice * discountPercentage / 100);
            } else if (discountDollars > 0 && !isPaymentPlan)
            {
                discountedPrice = basePrice - discountDollars;
            }

            // Ensure the price is not negative and round to whole number
            return Math.max(Math.round(discountedPrice), 0);
        };        // Update discount display information
        const updateDiscountDisplay = function ()
        {
            const discountedPriceValue = document.getElementById('discounted-price-value');
            const originalPriceSpan = document.getElementById('original-price');
            const discountAmountSpan = document.getElementById('discount-amount');

            // Payment plan discount elements (correct IDs from HTML)
            const discountedMonthlyPriceValue = document.getElementById('discounted-monthly-price-value');
            const originalMonthlyPriceSpan = document.getElementById('original-monthly-price');
            const monthlyDiscountAmountSpan = document.getElementById('monthly-discount-amount');

            // Update one-time payment discount display
            if (discountedPriceValue && originalPriceSpan && discountAmountSpan)
            {
                const discountedPrice = calculateDiscountedPrice(false);
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

            // Update payment plan discount display
            if (discountedMonthlyPriceValue && originalMonthlyPriceSpan && monthlyDiscountAmountSpan)
            {
                const discountedMonthlyPrice = calculateDiscountedPrice(true);
                const paymentPlanDiscountPercentage = parseInt(window.parityDealsInfo.paymentPlanDiscountPercentage) || 0;

                // Update the discounted price for payment plan
                discountedMonthlyPriceValue.textContent = discountedMonthlyPrice;

                // Update original price display for payment plan
                originalMonthlyPriceSpan.textContent = `$${originalMonthlyPrice}/mo`;

                // Update the discount text for payment plan
                if (paymentPlanDiscountPercentage > 0)
                {
                    monthlyDiscountAmountSpan.textContent = `${paymentPlanDiscountPercentage}% OFF`;
                }
            }
        };// Function to set payment plan discount percentage (for external configuration)
        window.setPaymentPlanDiscount = function (discountPercentage)
        {
            window.parityDealsInfo.paymentPlanDiscountPercentage = discountPercentage.toString();
            updateUI(); // Update UI to reflect the new discount
        };        // Function to update UI based on coupon code availability
        const updateUI = function ()
        {
            const hasCouponCode = !!window.parityDealsInfo.couponCode;
            const hasPaymentPlanCouponCode = !!window.parityDealsInfo.paymentPlanCouponCode;
            const hasParityDealsCoupon = hasCouponCode && window.parityDealsInfo.couponFromAPI;

            // Show payment plan container - now we show it even with discounts
            if (paymentPlanContainer)
            {
                // Only hide payment plan for parity deals coupons, but show it for regular coupons
                paymentPlanContainer.style.display = hasParityDealsCoupon ? 'none' : 'block';
            }

            // Update frequency element text
            if (frequencyElement)
            {
                frequencyElement.textContent = hasCouponCode ? 'Lifetime Access' : 'Best Value';
            }

            // Update one-time payment price display - show discounted price when coupon code is present
            const oneTimeFullPriceDiv = document.querySelector('.col-lg-4:not(#payment-plan-container) #full-price');
            const oneTimeDiscountedPriceDiv = document.querySelector('.col-lg-4:not(#payment-plan-container) #discounted-price');

            if (oneTimeFullPriceDiv && oneTimeDiscountedPriceDiv)
            {
                oneTimeFullPriceDiv.style.display = hasCouponCode ? 'none' : 'block';
                oneTimeDiscountedPriceDiv.style.display = hasCouponCode ? 'block' : 'none';
            }

            // Update payment plan price display
            const paymentPlanFullPriceDiv = document.querySelector('#payment-plan-container #full-price');
            const paymentPlanDiscountedPriceDiv = document.querySelector('#payment-plan-container #discounted-price');

            if (paymentPlanFullPriceDiv && paymentPlanDiscountedPriceDiv)
            {
                paymentPlanFullPriceDiv.style.display = hasPaymentPlanCouponCode ? 'none' : 'block';
                paymentPlanDiscountedPriceDiv.style.display = hasPaymentPlanCouponCode ? 'block' : 'none';
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
                }                // Add handling for country from the API
                if (data.country)
                {
                    window.parityDealsInfo.country = data.country;
                    uiNeedsUpdate = true;
                }

                // Handle payment plan discount from API if provided
                if (data.paymentPlanDiscountPercentage)
                {
                    window.parityDealsInfo.paymentPlanDiscountPercentage = parseInt(data.paymentPlanDiscountPercentage).toString();
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

        // Initialize the UI based on current state
        updateUI();

        // Fetch from API only once
        fetchParityCoupon();
    });

})(jQuery);
