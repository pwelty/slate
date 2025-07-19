/**
 * Tokyo Night Theme Effects
 * Applies special visual effects when Tokyo Night theme is active
 */

console.log('Tokyo Night effects script loaded');

let rainEffect = null;
let neonFlicker = null;

// Create digital rain effect
function createDigitalRain() {
  console.log('Creating digital rain effect');
  const canvas = document.createElement('canvas');
  canvas.id = 'tokyo-rain-effect';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  canvas.style.opacity = '0.15';
  
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  const charArray = chars.split('');
  const fontSize = 14;
  const columns = canvas.width / fontSize;
  const drops = Array(Math.floor(columns)).fill(1);
  
  function draw() {
    ctx.fillStyle = 'rgba(26, 27, 38, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(122, 162, 247, 0.8)';
    ctx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = charArray[Math.floor(Math.random() * charArray.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);
      
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  rainEffect = setInterval(draw, 100);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Add neon flicker to widget titles
function addNeonFlicker() {
  console.log('Adding neon flicker effect');
  const titles = document.querySelectorAll('.widget-title, h2, h3');
  
  titles.forEach(title => {
    title.style.textShadow = '0 0 5px rgba(122, 162, 247, 0.8)';
    title.style.transition = 'text-shadow 0.1s ease';
  });
  
  function flicker() {
    titles.forEach(title => {
      if (Math.random() > 0.95) {
        title.style.textShadow = '0 0 10px rgba(122, 162, 247, 1), 0 0 20px rgba(122, 162, 247, 0.5)';
        setTimeout(() => {
          title.style.textShadow = '0 0 5px rgba(122, 162, 247, 0.8)';
        }, 50);
      }
    });
  }
  
  neonFlicker = setInterval(flicker, 100);
}

// Apply Tokyo Night effects when theme is loaded
function applyTokyoNightEffects() {
  console.log('Applying Tokyo Night effects');
  const body = document.body;
  
  // Apply page-level effects
  body.setAttribute('data-effect', 'grid-overlay');
  body.classList.add('effect-color-tokyo-blue');
  
  // Add subtle scanlines to main content area
  const dashboardMain = document.querySelector('.dashboard-main');
  if (dashboardMain) {
    dashboardMain.setAttribute('data-effect', 'subtle-scanlines');
    dashboardMain.classList.add('effect-color-tokyo-blue');
  }
  
  // Apply widget-specific effects
  const weatherWidget = document.querySelector('[data-widget="weather"]');
  if (weatherWidget) {
    weatherWidget.setAttribute('data-effect', 'neon-glow-border');
    weatherWidget.classList.add('effect-color-tokyo-blue');
  }
  
  const statusWidget = document.querySelector('[data-widget="status-summary"]');
  if (statusWidget) {
    statusWidget.setAttribute('data-effect', 'subtle-glow');
    statusWidget.classList.add('effect-color-tokyo-blue');
  }
  
  // Add interactive effects
  createDigitalRain();
  addNeonFlicker();
  
  console.log('Tokyo Night effects applied successfully');
}

// Remove existing Tokyo Night effects
function removeTokyoNightEffects() {
  console.log('Removing Tokyo Night effects');
  
  // Clear intervals
  if (rainEffect) {
    clearInterval(rainEffect);
    rainEffect = null;
  }
  
  if (neonFlicker) {
    clearInterval(neonFlicker);
    neonFlicker = null;
  }
  
  // Remove canvas
  const canvas = document.getElementById('tokyo-rain-effect');
  if (canvas) {
    canvas.remove();
  }
  
  // Remove data-effect attributes
  document.body.removeAttribute('data-effect');
  document.body.classList.remove('effect-color-tokyo-blue');
  
  const dashboardMain = document.querySelector('.dashboard-main');
  if (dashboardMain) {
    dashboardMain.removeAttribute('data-effect');
    dashboardMain.classList.remove('effect-color-tokyo-blue');
  }
  
  // Remove widget effects
  document.querySelectorAll('[data-effect]').forEach(el => {
    el.removeAttribute('data-effect');
    el.classList.remove('effect-color-tokyo-blue');
  });
  
  // Remove text shadows
  const titles = document.querySelectorAll('.widget-title, h2, h3');
  titles.forEach(title => {
    title.style.textShadow = '';
  });
  
  console.log('Tokyo Night effects removed');
}

// Expose functions globally for theme switcher
window.TokyoNightTheme = {
  apply: applyTokyoNightEffects,
  remove: removeTokyoNightEffects
};

// Apply effects only if tokyo-night theme is actually active
setTimeout(() => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 
                      localStorage.getItem('dashboard-theme') || 
                      'dark';
  
  if (currentTheme === 'tokyo-night') {
    applyTokyoNightEffects();
  }
}, 100);