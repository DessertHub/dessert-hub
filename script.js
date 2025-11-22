// Subtle parallax effect on scroll
document.addEventListener('DOMContentLoaded', function() {
    const parallaxElements = document.querySelectorAll('.parallax-slow, .parallax-medium, .parallax-fast');
    
    // Parallax speed multipliers (lower = slower movement, more subtle)
    const speeds = {
        'parallax-slow': 0.2,
        'parallax-medium': 0.3,
        'parallax-fast': 0.4
    };

    function updateParallax() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        parallaxElements.forEach(element => {
            const className = Array.from(element.classList).find(cls => cls.startsWith('parallax-'));
            const speed = speeds[className] || 0.3;
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top + scrollY;
            
            // Only apply parallax when element is in or near viewport
            if (rect.bottom >= -windowHeight && rect.top <= windowHeight * 2) {
                // Calculate parallax based on scroll position
                const scrolled = scrollY - (elementTop - windowHeight);
                const translateY = scrolled * speed * 0.12; // Very subtle multiplier
                
                // Store parallax value in data attribute
                element.dataset.parallaxY = translateY;
                
                // Apply transform - will combine with hover scale via CSS
                element.style.setProperty('--parallax-translate', `${translateY}px`);
            }
        });
    }

    // Add CSS for parallax transform that works with hover
    const style = document.createElement('style');
    style.textContent = `
        .parallax-slow, .parallax-medium, .parallax-fast {
            transform: translate3d(0, var(--parallax-translate, 0), 0);
        }
        .parallax-slow:hover, .parallax-medium:hover, .parallax-fast:hover {
            transform: translate3d(0, var(--parallax-translate, 0), 0) scale(1.02);
        }
        .ingredient-image.parallax-slow:hover,
        .ingredient-image.parallax-medium:hover,
        .ingredient-image.parallax-fast:hover {
            transform: translate3d(0, var(--parallax-translate, 0), 0) scale(1.05);
        }
    `;
    document.head.appendChild(style);

    // Throttle scroll events for performance
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateParallax();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial call
    updateParallax();
});

// Hero carousel functionality
document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    let carouselInterval;
    let isTransitioning = false;

    function showSlide(index) {
        if (isTransitioning || index === currentSlide) return;
        
        isTransitioning = true;

        // Remove active class from current slide and dot
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');

        // Add active class to new slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentSlide = index;

        // Reset transition flag after transition completes
        setTimeout(() => {
            isTransitioning = false;
        }, 1600);
    }

    function nextSlide() {
        if (isTransitioning) return;
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function startCarousel() {
        if (carouselInterval) clearInterval(carouselInterval);
        carouselInterval = setInterval(nextSlide, 8000); // Change slide every 8 seconds
    }

    function stopCarousel() {
        if (carouselInterval) {
            clearInterval(carouselInterval);
            carouselInterval = null;
        }
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (isTransitioning || index === currentSlide) return;
            stopCarousel();
            showSlide(index);
            startCarousel();
        });
    });

    // Pause on hover
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopCarousel);
        carouselContainer.addEventListener('mouseleave', startCarousel);
    }

    // Preload images and start carousel
    const images = document.querySelectorAll('.carousel-slide img');
    let loadedCount = 0;
    
    const checkAllLoaded = () => {
        if (loadedCount === images.length) {
            // Ensure first slide is visible
            slides[0].classList.add('active');
            setTimeout(startCarousel, 1000);
        }
    };

    images.forEach((img, index) => {
        if (img.complete && img.naturalHeight !== 0) {
            loadedCount++;
            checkAllLoaded();
        } else {
            img.addEventListener('load', () => {
                loadedCount++;
                checkAllLoaded();
            });
            img.addEventListener('error', () => {
                loadedCount++;
                checkAllLoaded();
            });
        }
    });
});
