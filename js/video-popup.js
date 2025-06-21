// Handles the video popup overlay for Vimeo videos
(function ()
{
    const popupOverlay = document.getElementById('popupOverlay');
    const videoIframe = document.getElementById('videoIframe');
    const closePopup = document.getElementById('closePopup');

    // Function to open the popup with a specified video
    window.openVideoPopup = function (videoId, videoHash)
    {
        videoIframe.src = `https://player.vimeo.com/video/${videoId}?h=${videoHash}&autoplay=1`;
        popupOverlay.style.display = 'flex';
    };

    // Close the popup and stop the video
    closePopup.addEventListener('click', () =>
    {
        videoIframe.src = '';
        popupOverlay.style.display = 'none';
    });

    // Close the popup if clicked outside the content
    popupOverlay.addEventListener('click', (e) =>
    {
        if (e.target === popupOverlay)
        {
            videoIframe.src = '';
            popupOverlay.style.display = 'none';
        }
    });

    // Attach click event to each "Free Preview" button
    document.querySelectorAll('.preview-button').forEach(button =>
    {
        button.addEventListener('click', () =>
        {
            const videoId = button.getAttribute('data-video-id');
            const videoHash = button.getAttribute('data-video-hash');
            window.openVideoPopup(videoId, videoHash);
        });
    });
})();
