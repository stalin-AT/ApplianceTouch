
// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Sliding scroll animation for navigation links
function slideTo(targetPosition, duration = 800) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function for smooth sliding (ease-in-out)
        const ease = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + distance * ease);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            slideTo(offsetTop, 800);
        }
    });
});

// Active navigation link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinksArray = document.querySelectorAll('.nav-link');

function highlightNavigation() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinksArray.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Initialize EmailJS
let emailjsAvailable = false;
if (typeof emailjs !== 'undefined') {
    try {
        emailjs.init("E3VIFeomzcce4nR3y");
        emailjsAvailable = true;
    } catch (error) {
        console.error('EmailJS initialization error:', error);
    }
}

// Check if site is served over HTTP/HTTPS (required for EmailJS)
const isLocalFile = window.location.protocol === 'file:';

// Booking Form Handling
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);
        
        // Validate date is not in the past
        const selectedDate = new Date(data.preferredDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            alert('Please select a date in the future.');
            return;
        }
        
        // Get submit button
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Check if EmailJS is available and site is not local file
        if (!emailjsAvailable || isLocalFile) {
            // Fallback: Use mailto link with form data
            const subject = encodeURIComponent('New Booking Request - Appliance Touch');
            const body = encodeURIComponent(`New Service Booking Request

Customer Details:
- Name: ${data.name}
- Email: ${data.email}
- Phone: ${data.phone}
- Suburb: ${data.suburb}
- Address: ${data.address}

Service Details:
- Service Type: ${data.serviceType}
- Appliance/Equipment: ${data.applianceType || 'N/A'}
- Preferred Date: ${data.preferredDate}
- Preferred Time: ${data.preferredTime}
- Urgency: ${data.urgency}

Job Description:
${data.description}

---
This booking request was submitted through the Appliance Touch website.`);
            
            const mailtoLink = `mailto:Service@appliancetouch.com.au?subject=${subject}&body=${body}`;
            
            // Show message
            if (isLocalFile) {
                alert('To send emails automatically, please host this website. Opening email client as fallback...\n\nAfter sending the email, you can close this window.');
            }
            
            // Open email client
            window.location.href = mailtoLink;
            
            // Reset form after a delay
            setTimeout(() => {
                bookingForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                alert('Thank you for your booking request! Please send the email that opened, and we will contact you within 2 hours.');
            }, 1000);
            
            return;
        }
        
        // Prepare email template parameters for EmailJS
        const templateParams = {
            to_email: 'Service@appliancetouch.com.au',
            from_name: data.name,
            from_email: data.email,
            phone: data.phone,
            suburb: data.suburb,
            address: data.address,
            service_type: data.serviceType,
            appliance_type: data.applianceType || 'N/A',
            preferred_date: data.preferredDate,
            preferred_time: data.preferredTime,
            urgency: data.urgency,
            description: data.description,
            reply_to: data.email
        };
        
        // Send email using EmailJS
        emailjs.send('service_gdnoanp', 'template_n0hpnot', templateParams)
            .then(function(response) {
                // Success
                alert('Thank you for your booking request! We will contact you within 2 hours to confirm your appointment and provide a quote.');
                bookingForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                slideTo(0, 600);
            }, function(error) {
                // Error handling with detailed message
                console.error('EmailJS Error Details:', error);
                let errorMessage = 'There was an error sending your request.\n\n';
                
                if (error.text) {
                    errorMessage += `Error: ${error.text}\n\n`;
                }
                
                errorMessage += 'Please try:\n';
                errorMessage += '1. Call us directly at 0494 313 141\n';
                errorMessage += '2. Email Service@appliancetouch.com.au\n';
                errorMessage += '3. Make sure the website is hosted (not opened as a file)';
                
                alert(errorMessage);
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
    });
}

// Set minimum date for date input to today
const preferredDateInput = document.getElementById('preferredDate');
if (preferredDateInput) {
    const today = new Date().toISOString().split('T')[0];
    preferredDateInput.setAttribute('min', today);
}

// Image lazy loading enhancement
const images = document.querySelectorAll('img');
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s';
                setTimeout(() => {
                    img.style.opacity = '1';
                }, 100);
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards and other elements
document.querySelectorAll('.service-card, .area-category, .stat-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s, transform 0.6s';
    observer.observe(el);
});

// Service Button Click Handler - Redirect to booking page
document.querySelectorAll('.btn-service').forEach(button => {
    button.addEventListener('click', function() {
        const serviceType = this.getAttribute('data-service-type');
        // Redirect to booking page with service type parameter
        window.location.href = `booking.html?service=${serviceType}`;
    });
});
