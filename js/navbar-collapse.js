document.addEventListener('DOMContentLoaded', function () {
    // Select all links within the navbar
    const navLinks = document.querySelectorAll('.navbar-nav a');
    const navbarCollapse = document.getElementById('navbarSupportedContent');

    // Loop through the links and add a click event listener
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Check if the navbar is currently expanded
            if (navbarCollapse.classList.contains('show')) {
                // Collapse the navbar
                $('.navbar-collapse').collapse('hide');
            }
        });
    });
});
