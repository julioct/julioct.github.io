/* Parity Deals Script for All-Access Page
   Description: Handles the parity deals coupon functionality for the all-access subscription page
*/

(function ($)
{
    "use strict";

    // Parity Deals coupon handling
    document.addEventListener("DOMContentLoaded", function ()
    {
        // Global variable to store Parity Deals response data
        window.parityDealsInfo = {
            couponCode: "", // Default coupon code
            discountPercentage: "", // Default discount percentage (no decimals)
            discountDollars: "",  // Manual default discount in dollars (not provided by API)
            annualCouponCode: "ALLACCESS30", // Annual plan coupon code
            annualDiscountPercentage: "30", // Annual plan discount percentage
            quarterlyCouponCode: "ALLACCESS20", // Quarterly plan coupon code
            quarterlyDiscountPercentage: "20", // Quarterly plan discount percentage
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        };

        // Default pricing structure for all-access plans
        const defaultPricing = {
            annual: 570,    // Annual plan original price
            quarterly: 199, // Quarterly plan original price
            monthly: 79     // Monthly plan original price (currently hidden)
        };

        const notificationBanner = document.getElementById('notification-banner');

        // Get annual and quarterly plan elements
        const annualPlanContainer = document.querySelector('.col-lg-4.order-lg-2');
        const quarterlyPlanContainer = document.querySelector('.col-lg-4.order-lg-3');

        // Annual plan elements
        const annualFullPriceDiv = annualPlanContainer?.querySelector('#full-price');
        const annualDiscountedPriceDiv = annualPlanContainer?.querySelector('#discounted-price');
        const annualOriginalPriceSpan = annualPlanContainer?.querySelector('#original-price');
        const annualDiscountedPriceValue = annualPlanContainer?.querySelector('#discounted-monthly-price-value');
        const annualOriginalPriceInDiscount = annualPlanContainer?.querySelector('#original-monthly-price');
        const annualDiscountAmountSpan = annualPlanContainer?.querySelector('#monthly-discount-amount');
        const annualPaymentLink = annualPlanContainer?.querySelector('#payment-plan-link');

        // Quarterly plan elements
        const quarterlyFullPriceDiv = quarterlyPlanContainer?.querySelector('#full-price');
        const quarterlyDiscountedPriceDiv = quarterlyPlanContainer?.querySelector('#discounted-price');
        const quarterlyOriginalPriceSpan = quarterlyPlanContainer?.querySelector('#original-price');
        const quarterlyDiscountedPriceValue = quarterlyPlanContainer?.querySelector('#discounted-monthly-price-value');
        const quarterlyOriginalPriceInDiscount = quarterlyPlanContainer?.querySelector('#original-monthly-price');
        const quarterlyDiscountAmountSpan = quarterlyPlanContainer?.querySelector('#monthly-discount-amount');
        const quarterlyPaymentLink = quarterlyPlanContainer?.querySelector('#payment-plan-link');

        // Get original URLs from existing links
        const annualOriginalHref = annualPaymentLink ? annualPaymentLink.href : "";
        const quarterlyOriginalHref = quarterlyPaymentLink ? quarterlyPaymentLink.href : "";

        // Make sure banner is completely hidden by default
        if (notificationBanner)
        {
            notificationBanner.style.display = 'none';
        }

        // Function to get the dynamic deadline date (integrates with countdown timer logic)
        const getDynamicDeadlineDate = function ()
        {
            try
            {
                // Check if the countdown timer's deadline funnel is available
                if (window.deadlineFunnel && typeof window.deadlineFunnel.getDeadline === 'function')
                {
                    const deadline = window.deadlineFunnel.getDeadline();
                    const deadlineDate = new Date(deadline);

                    // Format the date as "July 20" or "Jul 20" based on preference
                    const options = { month: 'long', day: 'numeric' };
                    return deadlineDate.toLocaleDateString('en-US', options);
                }

                // Fallback: try to replicate the countdown timer logic here
                const urlParams = new URLSearchParams(window.location.search);
                const emailTime = urlParams.get('emailTime') || urlParams.get('et');

                if (emailTime)
                {
                    // Convert email timestamp and add 72 hours
                    const emailTimestamp = parseInt(emailTime) * 1000;
                    const deadline = emailTimestamp + (72 * 60 * 60 * 1000); // 72 hours
                    const deadlineDate = new Date(deadline);
                    const options = { month: 'long', day: 'numeric' };
                    return deadlineDate.toLocaleDateString('en-US', options);
                }

                // Check localStorage for stored deadline
                const storedDeadline = localStorage.getItem('dealDeadline');
                if (storedDeadline)
                {
                    const deadlineDate = new Date(parseInt(storedDeadline));
                    const options = { month: 'long', day: 'numeric' };
                    return deadlineDate.toLocaleDateString('en-US', options);
                }

                // Create new 72-hour deadline from current time
                const now = new Date().getTime();
                const newDeadline = now + (72 * 60 * 60 * 1000);
                localStorage.setItem('dealDeadline', newDeadline.toString());

                const deadlineDate = new Date(newDeadline);
                const options = { month: 'long', day: 'numeric' };
                return deadlineDate.toLocaleDateString('en-US', options);

            } catch (error)
            {
                console.warn('Error getting dynamic deadline date:', error);
                // Fallback to a reasonable future date
                const fallback = new Date();
                fallback.setDate(fallback.getDate() + 2); // 2 days from now
                const options = { month: 'long', day: 'numeric' };
                return fallback.toLocaleDateString('en-US', options);
            }
        };

        // Function to update notification banner with discount information
        const updateNotificationBanner = function ()
        {
            if (!notificationBanner) return;

            const couponCode = window.parityDealsInfo.couponCode;
            const annualCouponCode = window.parityDealsInfo.annualCouponCode;
            const quarterlyCouponCode = window.parityDealsInfo.quarterlyCouponCode;

            // If there's no coupon code (any of the three), don't show the banner at all
            if (!couponCode && !annualCouponCode && !quarterlyCouponCode)
            {
                notificationBanner.style.display = 'none';
                return;
            }

            const parityDiscountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
            const discountDollars = window.parityDealsInfo.discountDollars;
            const annualDiscountPercentage = parseInt(window.parityDealsInfo.annualDiscountPercentage) || 0;
            const country = window.parityDealsInfo.country || "your country";

            let discountText = "";

            // Prioritize Parity Deals discount, fall back to annual discount percentage
            if (parityDiscountPercentage > 0)
            {
                discountText = `${parityDiscountPercentage}%`;
            } else if (discountDollars && parseInt(discountDollars) > 0)
            {
                discountText = `$${discountDollars}`;
            } else if (annualDiscountPercentage > 0)
            {
                discountText = `${annualDiscountPercentage}%`;
            }

            // Get the dynamic deadline date
            const deadlineDate = getDynamicDeadlineDate();

            let bannerText = `Limited Time Deal: <strong>${discountText} OFF the Annual Pass</strong> • Ends&nbsp;${deadlineDate}`;

            // If coupon code came from the Parity Deals API, use the country-specific format
            if (window.parityDealsInfo.couponFromAPI)
            {
                bannerText = `Special pricing for <strong>${country}</strong>: <strong>${discountText} OFF the Annual Pass</strong> • Ends&nbsp;${deadlineDate}`;
            }

            notificationBanner.innerHTML = bannerText;
            notificationBanner.style.display = 'block';
        };

        // Function to update links with coupon codes
        const updateCouponLinks = function ()
        {
            // Update annual plan link
            if (annualPaymentLink && annualOriginalHref)
            {
                const annualCouponCode = window.parityDealsInfo.annualCouponCode;
                if (annualCouponCode)
                {
                    const url = new URL(annualOriginalHref);
                    url.searchParams.set('coupon', annualCouponCode);
                    annualPaymentLink.href = url.toString();
                } else
                {
                    // Remove coupon parameter if no coupon code
                    const url = new URL(annualOriginalHref);
                    url.searchParams.delete('coupon');
                    annualPaymentLink.href = url.toString();
                }
            }

            // Update quarterly plan link
            if (quarterlyPaymentLink && quarterlyOriginalHref)
            {
                const quarterlyCouponCode = window.parityDealsInfo.quarterlyCouponCode;
                if (quarterlyCouponCode)
                {
                    const url = new URL(quarterlyOriginalHref);
                    url.searchParams.set('coupon', quarterlyCouponCode);
                    quarterlyPaymentLink.href = url.toString();
                } else
                {
                    // Remove coupon parameter if no coupon code
                    const url = new URL(quarterlyOriginalHref);
                    url.searchParams.delete('coupon');
                    quarterlyPaymentLink.href = url.toString();
                }
            }
        };

        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function (originalPrice, planType)
        {
            let discountPercentage, discountDollars;

            if (planType === 'annual')
            {
                discountPercentage = parseInt(window.parityDealsInfo.annualDiscountPercentage) || 0;
                discountDollars = 0; // Annual plan only uses percentage discount
            } else if (planType === 'quarterly')
            {
                discountPercentage = parseInt(window.parityDealsInfo.quarterlyDiscountPercentage) || 0;
                discountDollars = 0; // Quarterly plan only uses percentage discount
            } else
            {
                // Default to main discount values
                discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
                discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;
            }

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
            // Update annual plan discount display
            if (annualOriginalPriceSpan)
            {
                const annualOriginalPrice = defaultPricing.annual;
                annualOriginalPriceSpan.textContent = annualOriginalPrice;
            }

            if (annualDiscountedPriceValue && annualOriginalPriceInDiscount && annualDiscountAmountSpan)
            {
                const annualOriginalPrice = defaultPricing.annual;
                const annualDiscountedPrice = calculateDiscountedPrice(annualOriginalPrice, 'annual');
                const annualDiscountPercentage = parseInt(window.parityDealsInfo.annualDiscountPercentage) || 0;

                // Update the discounted price for annual plan
                annualDiscountedPriceValue.textContent = annualDiscountedPrice;

                // Update original price display in discount section for annual plan
                annualOriginalPriceInDiscount.textContent = `$${annualOriginalPrice}`;

                // Update the discount text for annual plan
                if (annualDiscountPercentage > 0)
                {
                    annualDiscountAmountSpan.textContent = `${annualDiscountPercentage}% OFF`;
                }
            }

            // Update quarterly plan discount display
            if (quarterlyOriginalPriceSpan)
            {
                const quarterlyOriginalPrice = defaultPricing.quarterly;
                quarterlyOriginalPriceSpan.textContent = quarterlyOriginalPrice;
            }

            if (quarterlyDiscountedPriceValue && quarterlyOriginalPriceInDiscount && quarterlyDiscountAmountSpan)
            {
                const quarterlyOriginalPrice = defaultPricing.quarterly;
                const quarterlyDiscountedPrice = calculateDiscountedPrice(quarterlyOriginalPrice, 'quarterly');
                const quarterlyDiscountPercentage = parseInt(window.parityDealsInfo.quarterlyDiscountPercentage) || 0;

                // Update the discounted price for quarterly plan
                quarterlyDiscountedPriceValue.textContent = quarterlyDiscountedPrice;

                // Update original price display in discount section for quarterly plan
                quarterlyOriginalPriceInDiscount.textContent = `$${quarterlyOriginalPrice}`;

                // Update the discount text for quarterly plan
                if (quarterlyDiscountPercentage > 0)
                {
                    quarterlyDiscountAmountSpan.textContent = `${quarterlyDiscountPercentage}% OFF`;
                }
            }
        };

        // Function to set plan-specific discount percentages (for external configuration)
        window.setAnnualDiscount = function (discountPercentage)
        {
            window.parityDealsInfo.annualDiscountPercentage = discountPercentage.toString();
            updateUI(); // Update UI to reflect the new discount
        };

        window.setQuarterlyDiscount = function (discountPercentage)
        {
            window.parityDealsInfo.quarterlyDiscountPercentage = discountPercentage.toString();
            updateUI(); // Update UI to reflect the new discount
        };

        // Function to update UI based on coupon code availability
        const updateUI = function ()
        {
            const hasAnnualCouponCode = !!window.parityDealsInfo.annualCouponCode;
            const hasQuarterlyCouponCode = !!window.parityDealsInfo.quarterlyCouponCode;

            // Update annual plan price display - show discounted price when coupon code is present
            if (annualFullPriceDiv && annualDiscountedPriceDiv)
            {
                annualFullPriceDiv.style.display = hasAnnualCouponCode ? 'none' : 'block';
                annualDiscountedPriceDiv.style.display = hasAnnualCouponCode ? 'block' : 'none';
            }

            // Update quarterly plan price display - show discounted price when coupon code is present
            if (quarterlyFullPriceDiv && quarterlyDiscountedPriceDiv)
            {
                quarterlyFullPriceDiv.style.display = hasQuarterlyCouponCode ? 'none' : 'block';
                quarterlyDiscountedPriceDiv.style.display = hasQuarterlyCouponCode ? 'block' : 'none';
            }

            // Update discount display values
            updateDiscountDisplay();

            // Update notification banner
            updateNotificationBanner();

            // Update coupon links
            updateCouponLinks();
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
                    console.log("Parity Deals API response not OK:", response.status);
                    return;
                }

                const data = await response.json();
                console.log("Parity Deals API response:", data);

                // Store the API response globally and update UI if needed
                let uiNeedsUpdate = false;

                if (data.couponCode)
                {
                    window.parityDealsInfo.couponCode = data.couponCode;
                    window.parityDealsInfo.annualCouponCode = data.couponCode;
                    window.parityDealsInfo.quarterlyCouponCode = data.couponCode;
                    window.parityDealsInfo.couponFromAPI = true;
                    uiNeedsUpdate = true;
                }

                if (data.discountPercentage)
                {
                    window.parityDealsInfo.discountPercentage = data.discountPercentage.toString();
                    window.parityDealsInfo.annualDiscountPercentage = data.discountPercentage.toString();
                    window.parityDealsInfo.quarterlyDiscountPercentage = data.discountPercentage.toString();
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
                console.error("Error fetching parity coupon:", error);
            }
        };

        // Initialize the UI based on current state
        updateUI();

        // Fetch from API only once
        fetchParityCoupon();
    });

})(jQuery);
