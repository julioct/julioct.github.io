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
            couponCode: "", // Default coupon code (empty - no hardcoded coupon)
            discountPercentage: "", // Default discount percentage (no decimals)
            discountDollars: "",  // Manual default discount in dollars (not provided by API)
            paymentPlanCouponCode: "", // Default payment plan coupon code
            paymentPlanDiscountPercentage: "", // Default payment plan discount percentage
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        }; const paymentPlanContainer = document.getElementById('payment-plan-container');
        const frequencyElement = document.querySelector('.one-time-payment');
        const fullPriceDiv = document.getElementById('full-price');
        const discountedPriceDiv = document.getElementById('discounted-price'); const oneTimePaymentLink = document.getElementById('one-time-payment-link');
        const paymentPlanLink = document.querySelector('#payment-plan-container #payment-plan-link'); // Payment plan link within payment plan container
        const notificationBanner = document.getElementById('notification-banner');

        // Get original URLs from existing links instead of hardcoding them
        const originalHref = oneTimePaymentLink ? oneTimePaymentLink.href : "";
        const paymentPlanOriginalHref = paymentPlanLink ? paymentPlanLink.href : "";

        // Function to extract price from page elements
        const getOriginalPrice = function ()
        {
            const originalPriceSpan = document.getElementById('original-price');
            if (originalPriceSpan)
            {
                // Extract numeric value from text content (remove $ and any other non-numeric characters except decimal point)
                const priceText = originalPriceSpan.textContent || originalPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                return isNaN(price) ? 497 : price; // Fallback to 497 if parsing fails
            }
            return 497; // Default fallback price
        };

        const getOriginalMonthlyPrice = function ()
        {
            const originalMonthlyPriceSpan = document.getElementById('original-monthly-price');
            if (originalMonthlyPriceSpan)
            {
                // Extract numeric value from text content (remove $, /mo and any other non-numeric characters except decimal point)
                const priceText = originalMonthlyPriceSpan.textContent || originalMonthlyPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                return isNaN(price) ? 129 : price; // Fallback to 129 if parsing fails
            }
            return 129; // Default fallback price
        };

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

            let bannerText = `☀️ Summer Sale: <strong>${discountText} OFF EVERYTHING</strong> • Ends&nbsp;July&nbsp;6`;

            // If coupon code came from the Parity Deals API, use the country-specific format
            if (window.parityDealsInfo.couponFromAPI)
            {
                bannerText = `Pricing adjusted for <strong>${country}</strong> — <strong>${discountText} OFF</strong>`;
            }

            notificationBanner.innerHTML = bannerText;
            notificationBanner.style.display = 'block';
        };        // Function to update link with coupon code
        const updateCouponLink = function ()
        {
            // Update one-time payment link
            if (oneTimePaymentLink && originalHref)
            {
                const couponCode = window.parityDealsInfo.couponCode;
                if (couponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = originalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    oneTimePaymentLink.href = baseUrl + separator + "coupon=" + couponCode;
                } else
                {
                    oneTimePaymentLink.href = originalHref;
                }
            }

            // Update payment plan link (within payment plan container)
            if (paymentPlanLink && paymentPlanOriginalHref)
            {
                const paymentPlanCouponCode = window.parityDealsInfo.paymentPlanCouponCode;
                if (paymentPlanCouponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = paymentPlanOriginalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    paymentPlanLink.href = baseUrl + separator + "coupon=" + paymentPlanCouponCode;
                } else
                {
                    paymentPlanLink.href = paymentPlanOriginalHref;
                }
            }
        };        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function (isPaymentPlan = false)
        {
            let discountPercentage, discountDollars;
            let basePrice = isPaymentPlan ? getOriginalMonthlyPrice() : getOriginalPrice();

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
                const currentOriginalPrice = getOriginalPrice();
                const discountedPrice = calculateDiscountedPrice(false);
                const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
                const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;

                // Update the discounted price
                discountedPriceValue.textContent = discountedPrice;

                // Update original price display (only if it's not already showing the correct price)
                const currentDisplayedPrice = parseFloat(originalPriceSpan.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(currentDisplayedPrice) || currentDisplayedPrice !== currentOriginalPrice)
                {
                    originalPriceSpan.textContent = `$${currentOriginalPrice}`;
                }

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
                const currentOriginalMonthlyPrice = getOriginalMonthlyPrice();
                const discountedMonthlyPrice = calculateDiscountedPrice(true);
                const paymentPlanDiscountPercentage = parseInt(window.parityDealsInfo.paymentPlanDiscountPercentage) || 0;

                // Update the discounted price for payment plan
                discountedMonthlyPriceValue.textContent = discountedMonthlyPrice;

                // Update original price display for payment plan (only if it's not already showing the correct price)
                const currentDisplayedMonthlyPrice = parseFloat(originalMonthlyPriceSpan.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(currentDisplayedMonthlyPrice) || currentDisplayedMonthlyPrice !== currentOriginalMonthlyPrice)
                {
                    originalMonthlyPriceSpan.textContent = `$${currentOriginalMonthlyPrice}/mo`;
                }

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

            // Update one-time payment price display - show discounted price when coupon code is present
            const oneTimeFullPriceDiv = document.querySelector('.col-lg-4:not(#payment-plan-container) #full-price');
            const oneTimeDiscountedPriceDiv = document.querySelector('.col-lg-4:not(#payment-plan-container) #discounted-price');

            if (oneTimeFullPriceDiv && oneTimeDiscountedPriceDiv)
            {
                oneTimeFullPriceDiv.style.display = hasCouponCode ? 'none' : 'block';
                oneTimeDiscountedPriceDiv.style.display = hasCouponCode ? 'block' : 'none';
            }
            // Fallback: try to find elements without the container restriction if the above doesn't work
            else if (fullPriceDiv && discountedPriceDiv)
            {
                fullPriceDiv.style.display = hasCouponCode ? 'none' : 'block';
                discountedPriceDiv.style.display = hasCouponCode ? 'block' : 'none';
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
