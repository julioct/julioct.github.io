/* Sale Pricing Script for the .NET Developer Bootcamp
   Description: Applies a hardcoded sale discount (coupon + percentage) to the bootcamp pricing card.
   To run a sale, set couponCode and discountPercentage below. Leave empty to show full price.
*/

(function ($)
{
    "use strict";

    document.addEventListener("DOMContentLoaded", function ()
    {
        // Sale configuration - set these to enable a discount, leave empty for full price
        window.salePricingInfo = {
            couponCode: "BOOTCAMP10", // Coupon appended to the checkout link (e.g., "SUMMER2025")
            discountPercentage: "30", // Discount percentage for the one-time payment (e.g., "20")
            discountDollars: ""       // Alternative: a fixed dollar amount off
        };

        const onetimePaymentLink = document.getElementById('onetime-payment-link');
        const onetimePaymentOriginalHref = onetimePaymentLink ? onetimePaymentLink.href : "";

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

        // Function to update the checkout link with the coupon code
        const updateCouponLink = function ()
        {
            if (onetimePaymentLink && onetimePaymentOriginalHref)
            {
                const couponCode = window.salePricingInfo.couponCode;
                if (couponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = onetimePaymentOriginalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    onetimePaymentLink.href = baseUrl + separator + "coupon=" + couponCode;
                } else
                {
                    onetimePaymentLink.href = onetimePaymentOriginalHref;
                }
            }
        };

        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function ()
        {
            const discountPercentage = parseInt(window.salePricingInfo.discountPercentage) || 0;
            const discountDollars = parseInt(window.salePricingInfo.discountDollars) || 0;

            const basePrice = getOnetimePaymentPrice();
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
        };

        // Update discount display information
        const updateDiscountDisplay = function ()
        {
            const onetimeDiscountedPriceValue = document.querySelector('#onetime-payment-container #discounted-price-value');
            const onetimeOriginalPriceSpan = document.querySelector('#onetime-payment-container #original-price');
            const onetimeDiscountAmountSpan = document.querySelector('#onetime-payment-container #discount-amount');

            const discountPercentage = parseInt(window.salePricingInfo.discountPercentage) || 0;
            const discountDollars = parseInt(window.salePricingInfo.discountDollars) || 0;

            if (onetimeDiscountedPriceValue && onetimeOriginalPriceSpan && onetimeDiscountAmountSpan)
            {
                const currentOnetimePrice = getOnetimePaymentPrice();
                const discountedOnetimePrice = calculateDiscountedPrice();

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
        };

        // Function to update UI based on discount availability
        const updateUI = function ()
        {
            const hasOnetimeDiscount = parseInt(window.salePricingInfo.discountPercentage) > 0 ||
                window.salePricingInfo.discountDollars;

            // Show discounted price when a discount is available, otherwise show full price
            const onetimeFullPriceDiv = document.querySelector('#onetime-payment-container #full-price');
            const onetimeDiscountedPriceDiv = document.querySelector('#onetime-payment-container #discounted-price');

            if (onetimeFullPriceDiv && onetimeDiscountedPriceDiv)
            {
                onetimeFullPriceDiv.style.display = hasOnetimeDiscount ? 'none' : 'block';
                onetimeDiscountedPriceDiv.style.display = hasOnetimeDiscount ? 'block' : 'none';
            }

            // Update discount display values
            updateDiscountDisplay();

            // Update coupon link
            updateCouponLink();
        };

        // Initialize the UI based on current state
        updateUI();
    });

})(jQuery);
