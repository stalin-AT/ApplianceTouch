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

// Get service type from URL parameter
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Service type mapping
const serviceTypeMap = {
    'electrical-installation': 'Electrical Installation',
    'electrical-repair': 'Electrical Repair',
    'appliance-installation': 'Appliance Installation',
    'appliance-repair': 'Appliance Repair',
    'emergency': 'Emergency Service',
    'smart-home': 'Smart Home Solutions'
};

// Pre-fill service type if provided in URL
window.addEventListener('DOMContentLoaded', () => {
    const serviceType = getUrlParameter('service');
    if (serviceType && serviceTypeMap[serviceType]) {
        const serviceSelect = document.getElementById('serviceType');
        if (serviceSelect) {
            serviceSelect.value = serviceType;
        }
    }
});

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
                // Redirect to home page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
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
