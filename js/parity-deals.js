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
            couponCode: "", // Default coupon code (empty - no hardcoded coupon)
            discountPercentage: "", // Default discount percentage (no decimals)
            discountDollars: "",  // Manual default discount in dollars (not provided by API)
            allAccessCouponCode: "", // All-access pass coupon code
            allAccessDiscountPercentage: "", // All-access pass discount percentage
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        };

        const frequencyElement = document.querySelector('.one-time-payment');
        const fullPriceDiv = document.getElementById('full-price');
        const discountedPriceDiv = document.getElementById('discounted-price');

        const oneTimePaymentLink = document.getElementById('one-time-payment-link');
        const notificationBanner = document.getElementById('notification-banner');

        // All-access pass elements - look for the second pricing card container
        const allAccessContainer = document.querySelectorAll('.pricing-card-container')[1]; // Second card container
        const allAccessFullPriceDiv = allAccessContainer?.querySelector('#full-price');
        const allAccessDiscountedPriceDiv = allAccessContainer?.querySelector('#discounted-price');
        const allAccessDiscountedPriceValue = allAccessContainer?.querySelector('#discounted-monthly-price-value');
        const allAccessOriginalPriceInDiscount = allAccessContainer?.querySelector('#original-monthly-price');
        const allAccessDiscountAmountSpan = allAccessContainer?.querySelector('#monthly-discount-amount');
        const allAccessPaymentLink = allAccessContainer?.querySelector('#payment-plan-link');

        // Get original URLs from existing links instead of hardcoding them
        const originalHref = oneTimePaymentLink ? oneTimePaymentLink.href : "";
        const allAccessOriginalHref = allAccessPaymentLink ? allAccessPaymentLink.href : "";

        // Function to extract price from page elements
        const getOriginalPrice = function ()
        {
            const originalPriceSpan = document.getElementById('original-price');
            if (originalPriceSpan)
            {
                // Extract numeric value from text content (remove $ and any other non-numeric characters except decimal point)
                const priceText = originalPriceSpan.textContent || originalPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                return isNaN(price) ? 147 : price; // Fallback to 147 if parsing fails
            }
            return 147; // Default fallback price
        };

        const getAllAccessOriginalPrice = function ()
        {
            // Get the price from the all-access card - it shows 199/quarter
            return 199; // Default all-access quarterly price
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
        };

        // Function to update link with coupon code
        const updateCouponLink = function ()
        {
            // Update one-time payment link only
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

            // Do not modify the all-access pass "LEARN MORE" link
            // Keep it as the original /courses/all-access link without any coupon codes
        };

        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function (isAllAccess = false)
        {
            let discountPercentage, discountDollars;
            let basePrice;

            if (isAllAccess)
            {
                // All-access pass logic
                basePrice = getAllAccessOriginalPrice();
                discountPercentage = parseInt(window.parityDealsInfo.allAccessDiscountPercentage) || 0;
                discountDollars = 0; // All-access only uses percentage discount
            } else
            {
                // Use one-time payment discount
                basePrice = getOriginalPrice();
                discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
                discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;
            }

            let discountedPrice = basePrice;

            // Apply percentage discount if available, otherwise use dollar discount (for one-time only)
            if (discountPercentage > 0)
            {
                discountedPrice = basePrice - (basePrice * discountPercentage / 100);
            } else if (discountDollars > 0 && !isAllAccess)
            {
                discountedPrice = basePrice - discountDollars;
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

            // Update all-access pass discount display
            if (allAccessDiscountedPriceValue && allAccessOriginalPriceInDiscount && allAccessDiscountAmountSpan)
            {
                const allAccessOriginalPrice = getAllAccessOriginalPrice();
                const allAccessDiscountedPrice = calculateDiscountedPrice(true);
                const allAccessDiscountPercentage = parseInt(window.parityDealsInfo.allAccessDiscountPercentage) || 0;

                // Update the discounted price for all-access pass
                allAccessDiscountedPriceValue.textContent = allAccessDiscountedPrice;

                // Update original price display for all-access pass
                allAccessOriginalPriceInDiscount.textContent = `$${allAccessOriginalPrice}`;

                // Update the discount text for all-access pass
                if (allAccessDiscountPercentage > 0)
                {
                    allAccessDiscountAmountSpan.textContent = `${allAccessDiscountPercentage}% OFF`;
                }
            }
        };

        // Function to set all-access discount percentage (for external configuration)
        window.setAllAccessDiscount = function (discountPercentage)
        {
            window.parityDealsInfo.allAccessDiscountPercentage = discountPercentage.toString();
            updateUI(); // Update UI to reflect the new discount
        };

        // Function to update UI based on coupon code availability
        const updateUI = function ()
        {
            const hasCouponCode = !!window.parityDealsInfo.couponCode;
            const hasAllAccessCouponCode = !!window.parityDealsInfo.allAccessCouponCode;

            // Update one-time payment price display - show discounted price when coupon code is present
            const oneTimeFullPriceDiv = document.querySelector('.pricing-card-container:first-child #full-price');
            const oneTimeDiscountedPriceDiv = document.querySelector('.pricing-card-container:first-child #discounted-price');

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

            // Update all-access pass price display
            if (allAccessFullPriceDiv && allAccessDiscountedPriceDiv)
            {
                allAccessFullPriceDiv.style.display = hasAllAccessCouponCode ? 'none' : 'block';
                allAccessDiscountedPriceDiv.style.display = hasAllAccessCouponCode ? 'block' : 'none';
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
                    window.parityDealsInfo.allAccessCouponCode = data.couponCode; // Store for display purposes only
                    window.parityDealsInfo.couponFromAPI = true; // Set flag indicating coupon came from API
                    uiNeedsUpdate = true;
                }

                if (data.discountPercentage)
                {
                    // Remove any decimal places from the discount percentage
                    window.parityDealsInfo.discountPercentage = parseInt(data.discountPercentage).toString();
                    window.parityDealsInfo.allAccessDiscountPercentage = parseInt(data.discountPercentage).toString(); // Apply same discount to all-access for display
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

        // Initialize the UI based on current state
        updateUI();

        // Fetch from API only once
        fetchParityCoupon();
    });

})(jQuery);
