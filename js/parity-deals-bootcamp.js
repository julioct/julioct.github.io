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
            couponCode: "BLACKFRIDAY25", // Set this to enable hardcoded discount for onetime payment (e.g., "SUMMER2025")
            couponCodePaymentPlan: "BLACKFRIDAY25", // Set this to enable hardcoded discount for payment plan (e.g., "PAYMENT20")
            discountPercentage: "40", // Set this to the discount percentage for onetime payment (e.g., "20")
            discountPercentagePaymentPlan: "40", // Set this to the discount percentage for payment plan (e.g., "15")
            discountDollars: "",  // Alternative: set this to a fixed dollar amount
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        };

        const paymentPlanContainer = document.getElementById('payment-plan-container');

        // Get original URLs from existing links instead of hardcoding them
        const onetimePaymentLink = document.getElementById('onetime-payment-link');
        const paymentPlanLink = document.getElementById('payment-plan-link');
        const onetimePaymentOriginalHref = onetimePaymentLink ? onetimePaymentLink.href : "";
        const paymentPlanOriginalHref = paymentPlanLink ? paymentPlanLink.href : "";

        // Debug logging
        console.log("Onetime payment link found:", !!onetimePaymentLink, onetimePaymentOriginalHref);
        console.log("Payment plan link found:", !!paymentPlanLink, paymentPlanOriginalHref);

        // Function to extract price from page elements
        const getOnetimePaymentPrice = function ()
        {
            // First try to get from the original-price span (when discount is active)
            const onetimeOriginalPriceSpan = document.querySelector('#onetime-payment-container #original-price');
            if (onetimeOriginalPriceSpan && onetimeOriginalPriceSpan.textContent.trim())
            {
                const priceText = onetimeOriginalPriceSpan.textContent || onetimeOriginalPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            // If not found, get from the main price display (when no discount)
            const onetimeMainPriceSpan = document.querySelector('#onetime-payment-container .value');
            if (onetimeMainPriceSpan)
            {
                const priceText = onetimeMainPriceSpan.textContent || onetimeMainPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            return 497; // Default fallback price for onetime payment
        };

        const getPaymentPlanPrice = function ()
        {
            // First try to get from the original-monthly-price span (when discount is active)
            const paymentPlanOriginalPriceSpan = document.querySelector('#payment-plan-container #original-monthly-price');
            if (paymentPlanOriginalPriceSpan && paymentPlanOriginalPriceSpan.textContent.trim())
            {
                const priceText = paymentPlanOriginalPriceSpan.textContent || paymentPlanOriginalPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            // If not found, get from the main price display (when no discount)
            const paymentPlanMainPriceSpan = document.querySelector('#payment-plan-container .value');
            if (paymentPlanMainPriceSpan)
            {
                const priceText = paymentPlanMainPriceSpan.textContent || paymentPlanMainPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            return 129; // Default fallback price for payment plan
        };

        // Function to update link with coupon code
        const updateCouponLink = function ()
        {
            // Update onetime payment link - apply coupon if it exists
            if (onetimePaymentLink && onetimePaymentOriginalHref)
            {
                const couponCode = window.parityDealsInfo.couponCode;
                if (couponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = onetimePaymentOriginalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    onetimePaymentLink.href = baseUrl + separator + "coupon=" + couponCode;
                    console.log("Onetime payment link updated:", onetimePaymentLink.href);
                } else
                {
                    onetimePaymentLink.href = onetimePaymentOriginalHref;
                }
            } else
            {
                console.log("Onetime payment link not found or no original href");
            }

            // Update payment plan link - apply coupon if it exists
            if (paymentPlanLink && paymentPlanOriginalHref)
            {
                const couponCode = window.parityDealsInfo.couponCodePaymentPlan;
                if (couponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = paymentPlanOriginalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    paymentPlanLink.href = baseUrl + separator + "coupon=" + couponCode;
                    console.log("Payment plan link updated:", paymentPlanLink.href);
                } else
                {
                    paymentPlanLink.href = paymentPlanOriginalHref;
                }
            } else
            {
                console.log("Payment plan link not found or no original href");
            }
        };        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function (paymentType = 'onetime')
        {
            const discountPercentage = paymentType === 'onetime'
                ? parseInt(window.parityDealsInfo.discountPercentage) || 0
                : parseInt(window.parityDealsInfo.discountPercentagePaymentPlan) || 0;
            const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;

            let basePrice = paymentType === 'onetime' ? getOnetimePaymentPrice() : getPaymentPlanPrice();
            let discountedPrice = basePrice;

            // Apply percentage discount if available, otherwise use dollar discount
            if (discountPercentage > 0)
            {
                discountedPrice = basePrice - (basePrice * discountPercentage / 100);
            } else if (discountDollars > 0)
            {
                discountedPrice = basePrice - discountDollars;
            }

            // Ensure the price is not negative and round to whole number
            return Math.max(Math.round(discountedPrice), 0);
        };        // Update discount display information
        const updateDiscountDisplay = function ()
        {
            // Onetime payment discount elements
            const onetimeDiscountedPriceValue = document.querySelector('#onetime-payment-container #discounted-price-value');
            const onetimeOriginalPriceSpan = document.querySelector('#onetime-payment-container #original-price');
            const onetimeDiscountAmountSpan = document.querySelector('#onetime-payment-container #discount-amount');

            // Payment plan discount elements
            const paymentPlanDiscountedPriceValue = document.querySelector('#payment-plan-container #discounted-monthly-price-value');
            const paymentPlanOriginalPriceSpan = document.querySelector('#payment-plan-container #original-monthly-price');
            const paymentPlanDiscountAmountSpan = document.querySelector('#payment-plan-container #monthly-discount-amount');

            const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
            const discountPercentagePaymentPlan = parseInt(window.parityDealsInfo.discountPercentagePaymentPlan) || 0;
            const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;

            // Update onetime payment discount display
            if (onetimeDiscountedPriceValue && onetimeOriginalPriceSpan && onetimeDiscountAmountSpan)
            {
                const currentOnetimePrice = getOnetimePaymentPrice();
                const discountedOnetimePrice = calculateDiscountedPrice('onetime');

                // Update the discounted price
                onetimeDiscountedPriceValue.textContent = discountedOnetimePrice;

                // Update original price display (only if it's not already showing the correct price)
                const currentDisplayedOnetimePrice = parseFloat(onetimeOriginalPriceSpan.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(currentDisplayedOnetimePrice) || currentDisplayedOnetimePrice !== currentOnetimePrice)
                {
                    onetimeOriginalPriceSpan.textContent = `$${currentOnetimePrice}`;
                }

                // Determine and update the discount text
                if (discountPercentage > 0)
                {
                    onetimeDiscountAmountSpan.textContent = `${discountPercentage}% OFF`;
                } else
                {
                    onetimeDiscountAmountSpan.textContent = `$${discountDollars} OFF`;
                }
            }

            // Update payment plan discount display (only if not a parity deals discount)
            if (paymentPlanDiscountedPriceValue && paymentPlanOriginalPriceSpan && paymentPlanDiscountAmountSpan && !window.parityDealsInfo.couponFromAPI)
            {
                const currentPaymentPlanPrice = getPaymentPlanPrice();
                const discountedPaymentPlanPrice = calculateDiscountedPrice('paymentplan');

                // Update the discounted price
                paymentPlanDiscountedPriceValue.textContent = discountedPaymentPlanPrice;

                // Update original price display (only if it's not already showing the correct price)
                const currentDisplayedPaymentPlanPrice = parseFloat(paymentPlanOriginalPriceSpan.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(currentDisplayedPaymentPlanPrice) || currentDisplayedPaymentPlanPrice !== currentPaymentPlanPrice)
                {
                    paymentPlanOriginalPriceSpan.textContent = `$${currentPaymentPlanPrice}`;
                }

                // Determine and update the discount text (use payment plan specific discount)
                if (discountPercentagePaymentPlan > 0)
                {
                    paymentPlanDiscountAmountSpan.textContent = `${discountPercentagePaymentPlan}% OFF`;
                } else
                {
                    paymentPlanDiscountAmountSpan.textContent = `$${discountDollars} OFF`;
                }
            }
        };        // Function to update UI based on coupon code availability
        const updateUI = function ()
        {
            const hasCouponCode = !!(window.parityDealsInfo.couponCode || window.parityDealsInfo.couponCodePaymentPlan);
            const hasOnetimeCoupon = !!window.parityDealsInfo.couponCode;
            const hasPaymentPlanCoupon = !!window.parityDealsInfo.couponCodePaymentPlan;
            const isParityDealsDiscount = window.parityDealsInfo.couponFromAPI;

            // Check if we have any discount available (percentage or dollar amount)
            const hasOnetimeDiscount = parseInt(window.parityDealsInfo.discountPercentage) > 0 ||
                window.parityDealsInfo.discountDollars;
            const hasPaymentPlanDiscount = parseInt(window.parityDealsInfo.discountPercentagePaymentPlan) > 0 ||
                window.parityDealsInfo.discountDollars;

            // Hide payment plan container if there's a parity deals coupon
            if (paymentPlanContainer)
            {
                if (isParityDealsDiscount)
                {
                    paymentPlanContainer.style.display = 'none';
                } else
                {
                    paymentPlanContainer.style.display = 'block';
                }
            }

            // Update onetime payment frequency text based on whether payment plan is showing
            const onetimeFrequencyDivs = document.querySelectorAll('#onetime-payment-container .frequency.one-time-payment');
            onetimeFrequencyDivs.forEach(div =>
            {
                if (isParityDealsDiscount)
                {
                    div.textContent = 'Lifetime Access';
                } else
                {
                    div.textContent = 'Best Value';
                }
            });

            // Update onetime payment price display - show discounted price when discount is available
            const onetimeFullPriceDiv = document.querySelector('#onetime-payment-container #full-price');
            const onetimeDiscountedPriceDiv = document.querySelector('#onetime-payment-container #discounted-price');

            if (onetimeFullPriceDiv && onetimeDiscountedPriceDiv)
            {
                onetimeFullPriceDiv.style.display = hasOnetimeDiscount ? 'none' : 'block';
                onetimeDiscountedPriceDiv.style.display = hasOnetimeDiscount ? 'block' : 'none';
            }

            // Update payment plan price display - show discounted price when discount is available and not parity deals
            const paymentPlanFullPriceDiv = document.querySelector('#payment-plan-container #full-price');
            const paymentPlanDiscountedPriceDiv = document.querySelector('#payment-plan-container #discounted-price');

            if (paymentPlanFullPriceDiv && paymentPlanDiscountedPriceDiv && !isParityDealsDiscount)
            {
                paymentPlanFullPriceDiv.style.display = hasPaymentPlanDiscount ? 'none' : 'block';
                paymentPlanDiscountedPriceDiv.style.display = hasPaymentPlanDiscount ? 'block' : 'none';
            }

            // Update discount display values
            updateDiscountDisplay();

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
                    // Override any hardcoded discount with parity deals discount for both onetime and payment plan
                    window.parityDealsInfo.couponCode = data.couponCode;
                    window.parityDealsInfo.couponCodePaymentPlan = data.couponCode; // Use same coupon for payment plan
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
