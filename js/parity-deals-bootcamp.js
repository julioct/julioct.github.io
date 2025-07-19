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
            country: "", // Country from Parity Deals API
            couponFromAPI: false // Flag to track if coupon code came from API
        };

        const coreEditionContainer = document.getElementById('core-edition-container');
        const completeEditionContainer = document.getElementById('complete-edition-container');
        const notificationBanner = document.getElementById('notification-banner');

        // Get original URLs from existing links instead of hardcoding them
        const coreEditionLink = document.getElementById('core-edition-payment-link');
        const completeEditionLink = document.getElementById('complete-edition-payment-link');
        const coreEditionOriginalHref = coreEditionLink ? coreEditionLink.href : "";
        const completeEditionOriginalHref = completeEditionLink ? completeEditionLink.href : "";

        // Debug logging
        console.log("Core edition link found:", !!coreEditionLink, coreEditionOriginalHref);
        console.log("Complete edition link found:", !!completeEditionLink, completeEditionOriginalHref);

        // Function to extract price from page elements
        const getCoreEditionPrice = function ()
        {
            // First try to get from the original-price span (when discount is active)
            const coreOriginalPriceSpan = document.querySelector('#core-edition-container #original-price');
            if (coreOriginalPriceSpan && coreOriginalPriceSpan.textContent.trim())
            {
                const priceText = coreOriginalPriceSpan.textContent || coreOriginalPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            // If not found, get from the main price display (when no discount)
            const coreMainPriceSpan = document.querySelector('#core-edition-container .value');
            if (coreMainPriceSpan)
            {
                const priceText = coreMainPriceSpan.textContent || coreMainPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            return 247; // Default fallback price for core edition
        };

        const getCompleteEditionPrice = function ()
        {
            // First try to get from the original-price span (when discount is active)
            const completeOriginalPriceSpan = document.querySelector('#complete-edition-container #original-price');
            if (completeOriginalPriceSpan && completeOriginalPriceSpan.textContent.trim())
            {
                const priceText = completeOriginalPriceSpan.textContent || completeOriginalPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            // If not found, get from the main price display (when no discount)
            const completeMainPriceSpan = document.querySelector('#complete-edition-container .value');
            if (completeMainPriceSpan)
            {
                const priceText = completeMainPriceSpan.textContent || completeMainPriceSpan.innerText || "";
                const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
                if (!isNaN(price)) return price;
            }

            return 497; // Default fallback price for complete edition
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
            // Update core edition link
            if (coreEditionLink && coreEditionOriginalHref)
            {
                const couponCode = window.parityDealsInfo.couponCode;
                if (couponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = coreEditionOriginalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    coreEditionLink.href = baseUrl + separator + "coupon=" + couponCode;
                    console.log("Core edition link updated:", coreEditionLink.href);
                } else
                {
                    coreEditionLink.href = coreEditionOriginalHref;
                }
            } else
            {
                console.log("Core edition link not found or no original href");
            }

            // Update complete edition link
            if (completeEditionLink && completeEditionOriginalHref)
            {
                const couponCode = window.parityDealsInfo.couponCode;
                if (couponCode)
                {
                    // Remove existing coupon parameter if present, then add new one
                    const baseUrl = completeEditionOriginalHref.split('&coupon=')[0].split('?coupon=')[0];
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    completeEditionLink.href = baseUrl + separator + "coupon=" + couponCode;
                    console.log("Complete edition link updated:", completeEditionLink.href);
                } else
                {
                    completeEditionLink.href = completeEditionOriginalHref;
                }
            } else
            {
                console.log("Complete edition link not found or no original href");
            }
        };        // Function to calculate discounted price based on percentage or fixed amount
        const calculateDiscountedPrice = function (editionType = 'complete')
        {
            const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
            const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;

            let basePrice = editionType === 'core' ? getCoreEditionPrice() : getCompleteEditionPrice();
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
            // Core edition discount elements
            const coreDiscountedPriceValue = document.querySelector('#core-edition-container #discounted-price-value');
            const coreOriginalPriceSpan = document.querySelector('#core-edition-container #original-price');
            const coreDiscountAmountSpan = document.querySelector('#core-edition-container #discount-amount');

            // Complete edition discount elements
            const completeDiscountedPriceValue = document.querySelector('#complete-edition-container #discounted-price-value');
            const completeOriginalPriceSpan = document.querySelector('#complete-edition-container #original-price');
            const completeDiscountAmountSpan = document.querySelector('#complete-edition-container #discount-amount');

            const discountPercentage = parseInt(window.parityDealsInfo.discountPercentage) || 0;
            const discountDollars = parseInt(window.parityDealsInfo.discountDollars) || 0;

            // Update core edition discount display
            if (coreDiscountedPriceValue && coreOriginalPriceSpan && coreDiscountAmountSpan)
            {
                const currentCorePrice = getCoreEditionPrice();
                const discountedCorePrice = calculateDiscountedPrice('core');

                // Update the discounted price
                coreDiscountedPriceValue.textContent = discountedCorePrice;

                // Update original price display (only if it's not already showing the correct price)
                const currentDisplayedCorePrice = parseFloat(coreOriginalPriceSpan.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(currentDisplayedCorePrice) || currentDisplayedCorePrice !== currentCorePrice)
                {
                    coreOriginalPriceSpan.textContent = `$${currentCorePrice}`;
                }

                // Determine and update the discount text
                if (discountPercentage > 0)
                {
                    coreDiscountAmountSpan.textContent = `${discountPercentage}% OFF`;
                } else
                {
                    coreDiscountAmountSpan.textContent = `$${discountDollars} OFF`;
                }
            }

            // Update complete edition discount display
            if (completeDiscountedPriceValue && completeOriginalPriceSpan && completeDiscountAmountSpan)
            {
                const currentCompletePrice = getCompleteEditionPrice();
                const discountedCompletePrice = calculateDiscountedPrice('complete');

                // Update the discounted price
                completeDiscountedPriceValue.textContent = discountedCompletePrice;

                // Update original price display (only if it's not already showing the correct price)
                const currentDisplayedCompletePrice = parseFloat(completeOriginalPriceSpan.textContent.replace(/[^0-9.]/g, ''));
                if (isNaN(currentDisplayedCompletePrice) || currentDisplayedCompletePrice !== currentCompletePrice)
                {
                    completeOriginalPriceSpan.textContent = `$${currentCompletePrice}`;
                }

                // Determine and update the discount text
                if (discountPercentage > 0)
                {
                    completeDiscountAmountSpan.textContent = `${discountPercentage}% OFF`;
                } else
                {
                    completeDiscountAmountSpan.textContent = `$${discountDollars} OFF`;
                }
            }
        };        // Function to update UI based on coupon code availability
        const updateUI = function ()
        {
            const hasCouponCode = !!window.parityDealsInfo.couponCode;

            // Update core edition price display - show discounted price when coupon code is present
            const coreFullPriceDiv = document.querySelector('#core-edition-container #full-price');
            const coreDiscountedPriceDiv = document.querySelector('#core-edition-container #discounted-price');

            if (coreFullPriceDiv && coreDiscountedPriceDiv)
            {
                coreFullPriceDiv.style.display = hasCouponCode ? 'none' : 'block';
                coreDiscountedPriceDiv.style.display = hasCouponCode ? 'block' : 'none';
            }

            // Update complete edition price display - show discounted price when coupon code is present
            const completeFullPriceDiv = document.querySelector('#complete-edition-container #full-price');
            const completeDiscountedPriceDiv = document.querySelector('#complete-edition-container #discounted-price');

            if (completeFullPriceDiv && completeDiscountedPriceDiv)
            {
                completeFullPriceDiv.style.display = hasCouponCode ? 'none' : 'block';
                completeDiscountedPriceDiv.style.display = hasCouponCode ? 'block' : 'none';
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
