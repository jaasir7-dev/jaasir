document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Interactive Parallax Effect on Mouse Movement
    const heroSection = document.getElementById('hero');
    const heroBg = document.getElementById('heroBg');

    heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Calculate offset percentages (-15px to 15px shift)
        const moveX = ((clientX / innerWidth) - 0.5) * 30;
        const moveY = ((clientY / innerHeight) - 0.5) * 30;

        heroBg.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    });

    heroSection.addEventListener('mouseleave', () => {
        heroBg.style.transform = 'translate(0px, 0px) scale(1)';
    });

    // 2. Click-to-Spin Profile Picture Animation
    const profileDp = document.getElementById('profileDp');

    profileDp.addEventListener('click', () => {
        // Prevent stacking animation triggers
        if (profileDp.classList.contains('spin-animation')) return;

        profileDp.classList.add('spin-animation');

        setTimeout(() => {
            profileDp.classList.remove('spin-animation');
        }, 800); // Duration matches CSS spin animation
    });

});
