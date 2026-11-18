/* Sale Pricing Script for the .NET Developer Bootcamp
   Description: Applies a hardcoded sale discount to the bootcamp pricing cards.
   One-time card: set couponCode and discountPercentage (or discountDollars).
   Installment card: set installmentPriceId (a Thinkific price created for the sale) and
   installmentSalePrice (that price's amount per payment, for display).
   Leave the values empty to show full price.
*/

(function ($)
{
    "use strict";

    document.addEventListener("DOMContentLoaded", function ()
    {
        // Sale configuration - set these to enable a discount, leave empty for full price
        window.salePricingInfo = window.salePricingInfo || {
            couponCode: "BLACKFRIDAY26", // Coupon appended to the checkout link (e.g., "SUMMER2025")
            discountPercentage: "40", // Discount percentage for the one-time payment (e.g., "20")
            discountDollars: "",       // Alternative: a fixed dollar amount off
            installmentPriceId: "4922459", // Sale price_id that replaces the regular one in the installment checkout link
            installmentSalePrice: "99" // Sale amount per installment payment (whole dollars)
        };

        const onetimePaymentLink = document.getElementById('onetime-payment-link');
        const onetimePaymentOriginalHref = onetimePaymentLink ? onetimePaymentLink.href : "";

        const paymentPlanContainer = document.getElementById('payment-plan-container');
        const paymentPlanLink = document.getElementById('payment-plan-link');
        const paymentPlanOriginalHref = paymentPlanLink ? paymentPlanLink.href : "";

        // Returns the href with the coupon applied, or the original href when there is no coupon
        const withCoupon = function (originalHref, couponCode)
        {
            if (!couponCode) return originalHref;
            const baseUrl = originalHref.split('&coupon=')[0].split('?coupon=')[0];
            const separator = baseUrl.includes('?') ? '&' : '?';
            return baseUrl + separator + "coupon=" + couponCode;
        };

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

            return 597; // Default fallback price for onetime payment
        };

        // Function to update the checkout link with the coupon code
        const updateCouponLink = function ()
        {
            if (onetimePaymentLink && onetimePaymentOriginalHref)
            {
                onetimePaymentLink.href = withCoupon(onetimePaymentOriginalHref, window.salePricingInfo.couponCode);
            }

            // During the installment sale, point the checkout link at the sale price_id
            if (paymentPlanLink && paymentPlanOriginalHref)
            {
                if (hasInstallmentDiscount())
                {
                    const url = new URL(paymentPlanOriginalHref);
                    url.searchParams.set('price_id', window.salePricingInfo.installmentPriceId);
                    paymentPlanLink.href = url.toString();
                } else
                {
                    paymentPlanLink.href = paymentPlanOriginalHref;
                }
            }
        };

        // Installment sale is on only when both a sale price_id and a sale amount are set
        const hasInstallmentDiscount = function ()
        {
            return !!window.salePricingInfo.installmentPriceId &&
                parseInt(window.salePricingInfo.installmentSalePrice) > 0;
        };

        // Shows the sale installment block (count × sale amount, struck-through full amount, sale total)
        const updateInstallmentDisplay = function ()
        {
            if (!paymentPlanContainer) return;

            const fullDiv = paymentPlanContainer.querySelector('#plan-full-price');
            const saleDiv = paymentPlanContainer.querySelector('#plan-discounted-price');
            if (!fullDiv || !saleDiv) return;

            const onSale = hasInstallmentDiscount();
            fullDiv.style.display = onSale ? 'none' : 'block';
            saleDiv.style.display = onSale ? 'block' : 'none';
            if (!onSale) return;

            const count = parseInt(paymentPlanContainer.dataset.installments) || 4;
            const fullAmountEl = paymentPlanContainer.querySelector('#plan-full-amount');
            const fullAmount = fullAmountEl ? parseFloat(fullAmountEl.textContent.replace(/[^0-9.]/g, '')) : NaN;
            const saleAmount = parseInt(window.salePricingInfo.installmentSalePrice);

            const saleValue = paymentPlanContainer.querySelector('#plan-discounted-price-value');
            const originalSpan = paymentPlanContainer.querySelector('#plan-original-price');
            const saleTotal = paymentPlanContainer.querySelector('#plan-discounted-total');

            if (saleValue) saleValue.textContent = saleAmount;
            if (originalSpan && !isNaN(fullAmount)) originalSpan.textContent = `${count} × $${fullAmount}`;
            if (saleTotal) saleTotal.textContent = `Total: $${count * saleAmount}`;
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

            // Update the installment card
            updateInstallmentDisplay();

            // Update coupon link
            updateCouponLink();
        };

        // Initialize the UI based on current state
        updateUI();
    });

})(jQuery);
