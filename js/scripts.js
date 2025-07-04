/* Template: Tivo SaaS App Website Bootstrap HTML Template
   Author: Inovatik
   Description: Custom JS file
*/


(function ($)
{
    "use strict";

    /* Navbar Scripts */
    // jQuery to collapse the navbar on scroll
    $(window).on('scroll load', function ()
    {
        if ($('.navbar').length)
        {
            if ($(".navbar").offset().top > 60)
            {
                $(".fixed-top").addClass("top-nav-collapse");
            } else
            {
                $(".fixed-top").removeClass("top-nav-collapse");
            }
        }
    });

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $(function ()
    {
        $(document).on('click', 'a.page-scroll', function (event)
        {
            var $anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $($anchor.attr('href')).offset().top
            }, 600, 'easeInOutExpo');
            event.preventDefault();
        });
    });

    // offcanvas script from Bootstrap + added element to close menu on click in small viewport
    $('[data-toggle="offcanvas"], .navbar-nav li a:not(.dropdown-toggle').on('click', function ()
    {
        $('.offcanvas-collapse').toggleClass('open')
    })

    // hover in desktop mode
    function toggleDropdown(e)
    {
        const _d = $(e.target).closest('.dropdown'),
            _m = $('.dropdown-menu', _d);
        setTimeout(function ()
        {
            const shouldOpen = e.type !== 'click' && _d.is(':hover');
            _m.toggleClass('show', shouldOpen);
            _d.toggleClass('show', shouldOpen);
            $('[data-toggle="dropdown"]', _d).attr('aria-expanded', shouldOpen);
        }, e.type === 'mouseleave' ? 300 : 0);
    } $('body')
        .on('mouseenter mouseleave', '.dropdown', toggleDropdown)
        .on('click', '.dropdown-menu a', toggleDropdown);


    /* Move Form Fields Label When User Types */
    // for input and textarea fields
    $("input, textarea").keyup(function ()
    {
        if ($(this).val() != '')
        {
            $(this).addClass('notEmpty');
        } else
        {
            $(this).removeClass('notEmpty');
        }
    });


    /* Back To Top Button */
    // create the back to top button
    // $('body').prepend('<a href="body" class="back-to-top page-scroll">Back to Top</a>');
    // var amountScrolled = 700;
    // $(window).scroll(function ()
    // {
    //     if ($(window).scrollTop() > amountScrolled)
    //     {
    //         $('a.back-to-top').fadeIn('500');
    //     } else
    //     {
    //         $('a.back-to-top').fadeOut('500');
    //     }
    // });


    /* Removes Long Focus On Buttons */
    $(".button, a, button").mouseup(function ()
    {
        $(this).blur();
    });

    /* Counter - CountTo */
    var a = 0;
    $(window).scroll(function ()
    {
        if ($('#counter').length)
        { // checking if CountTo section exists in the page, if not it will not run the script and avoid errors	
            var oTop = $('#counter').offset().top - window.innerHeight;
            if (a == 0 && $(window).scrollTop() > oTop)
            {
                $('.counter-value').each(function ()
                {
                    var $this = $(this),
                        countTo = $this.attr('data-count');
                    $({
                        countNum: $this.text()
                    }).animate({
                        countNum: countTo
                    },
                        {
                            duration: 2000,
                            easing: 'swing',
                            step: function ()
                            {
                                $this.text(Math.floor(this.countNum));
                            },
                            complete: function ()
                            {
                                $this.text(this.countNum);
                                //alert('finished');
                            }
                        });
                });
                a = 1;
            }
        }
    });

    // The countdown timer and parity deals logic have been moved to separate files:
    // - countdown-timer.js
    // - parity-deals.js

})(jQuery);