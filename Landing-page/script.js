document.addEventListener('DOMContentLoaded', function() {
  // Initialize particles.js background
  particlesJS('particles-js', {
    "particles": {
      "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
      "color": { "value": ["#7B2DFF", "#00F7FF", "#FF2D7B"] },
      "shape": { "type": "circle" },
      "opacity": { "value": 0.5, "random": true, "anim": { "enable": true, "speed": 1 } },
      "size": { "value": 3, "random": true, "anim": { "enable": true, "speed": 2 } },
      "line_linked": { "enable": false },
      "move": { "enable": true, "speed": 1, "direction": "none", "random": true }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": { "enable": true, "mode": "repulse" },
        "onclick": { "enable": true, "mode": "push" },
        "resize": true
      }
    },
    "retina_detect": true
  });

  // Cursor glow effect
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX - 30}px, ${e.clientY - 30}px)`;
  });

  // Enhanced custom particles
  const canvas = document.querySelector('#particles-js canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  const mouse = { x: null, y: null, stationary: false, stationaryTime: 0 };
  const colors = ['#7B2DFF', '#00F7FF', '#FF2D7B'];
  const particleCount = 20;
  let clickCount = 0;
  let lastClickTime = 0;
  let burstActive = false;
  let burstTime = 0;

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      baseSize: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * 2 - 1,
      distance: Math.random() * 50 + 50,
      originalX: null,
      originalY: null,
      forming: false,
      scattering: false
    });
  }

  // Mouse tracking
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    mouse.stationary = false;
    mouse.stationaryTime = 0;
  });

  // Triple click detection
  window.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastClickTime < 300) { // 300ms threshold for triple click
      clickCount++;
      if (clickCount >= 2) { // 3 clicks (0, 1, 2)
        triggerBurst(e.x, e.y);
        clickCount = 0;
      }
    } else {
      clickCount = 0;
    }
    lastClickTime = now;
  });

  // Keyboard shortcut for particle burst
  window.addEventListener('keydown', (e) => {
    if (e.key === 'x') {
      triggerBurst(window.innerWidth / 2, window.innerHeight / 2);
    }
  });

  function triggerBurst(x, y) {
    burstActive = true;
    burstTime = Date.now();
    particles.forEach(p => {
      p.scattering = true;
      // Calculate direction away from click point
      const angle = Math.atan2(p.y - y, p.x - x);
      const force = 10 + Math.random() * 10;
      p.speedX = Math.cos(angle) * force;
      p.speedY = Math.sin(angle) * force;
    });
  }

  function animateParticles() {
    // Update mouse stationary status
    if (!mouse.stationary) {
      mouse.stationaryTime = Date.now();
      mouse.stationary = true;
    }

    // Check if mouse has been stationary for 1 second
    const isForming = Date.now() - mouse.stationaryTime > 1000 && mouse.x && mouse.y;
    const burstDuration = Date.now() - burstTime;

    // Reset burst after 1 second
    if (burstActive && burstDuration > 1000) {
      burstActive = false;
      particles.forEach(p => {
        p.scattering = false;
        p.speedX = Math.random() * 2 - 1;
        p.speedY = Math.random() * 2 - 1;
      });
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      if (burstActive && p.scattering) {
        // Continue scattering
        p.x += p.speedX;
        p.y += p.speedY;
        p.size = Math.max(0.5, p.baseSize * (1 - burstDuration / 1000));
      } else if (isForming && !burstActive) {
        // Form big particle
        if (!p.forming) {
          p.originalX = p.x;
          p.originalY = p.y;
          p.forming = true;
        }
        
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = 0.1;
        
        if (distance > 10) {
          p.x += dx * speed;
          p.y += dy * speed;
        }
        
        p.size = p.baseSize * (1 + 2 * (1 - distance / 100));
      } else {
        // Return to normal
        if (p.forming) {
          const dx = p.originalX - p.x;
          const dy = p.originalY - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = 0.05;
          
          if (distance > 2) {
            p.x += dx * speed;
            p.y += dy * speed;
          } else {
            p.forming = false;
          }
        } else {
          // Normal movement
          p.x += p.speedX;
          p.y += p.speedY;
        }
        
        p.size = p.baseSize;
      }

      // Boundary check
      if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Draw glow
      const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.size * 3
      );
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Draw central glow when forming
    if (isForming && !burstActive) {
      const formingParticles = particles.filter(p => p.forming);
      if (formingParticles.length > 0) {
        const centerX = mouse.x;
        const centerY = mouse.y;
        const avgSize = formingParticles.reduce((sum, p) => sum + p.size, 0) / formingParticles.length;
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, avgSize * 10
        );
        gradient.addColorStop(0, 'rgba(123, 45, 255, 0.8)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, avgSize * 10, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    requestAnimationFrame(animateParticles);
  }

  animateParticles();

  // Responsive navigation for mobile
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.createElement('button');
  menuToggle.className = 'menu-toggle';
  menuToggle.innerHTML = '<span></span><span></span><span></span>';
  menuToggle.addEventListener('click', () => {
    navbar.classList.toggle('active');
  });

  // Only add menu toggle on mobile
  function checkScreenSize() {
    if (window.innerWidth <= 768) {
      if (!document.querySelector('.menu-toggle')) {
        document.querySelector('.header').appendChild(menuToggle);
      }
    } else {
      if (document.querySelector('.menu-toggle')) {
        document.querySelector('.menu-toggle').remove();
        navbar.classList.remove('active');
      }
    }
  }

  window.addEventListener('resize', checkScreenSize);
  checkScreenSize();
});