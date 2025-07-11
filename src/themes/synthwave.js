/**
 * Synthwave Theme Effects
 * Epic 80s-inspired visual effects for the ultimate retro experience
 */

console.log('🌈 Synthwave effects script loaded - Welcome to the 80s!');

let neonPulse = null;
let gridLines = null;
let retroGlow = null;
let synthWaves = null;

// Initialize global intervals array for cleanup
if (!window.synthwaveIntervals) {
    window.synthwaveIntervals = [];
}

// Create animated neon grid background
function createNeonGrid() {
  console.log('✨ Creating neon grid effect');
  
  const canvas = document.createElement('canvas');
  canvas.id = 'synthwave-grid-effect';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  canvas.style.opacity = '0.3';
  
  document.body.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  let offset = 0;
  
  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create perspective grid
    const gridSize = 50;
    const horizonY = canvas.height * 0.6;
    
    // Draw horizontal lines with perspective
    for (let i = 0; i < 20; i++) {
      const y = horizonY + (i * gridSize) * (1 + i * 0.1);
      if (y > canvas.height) break;
      
      const alpha = Math.max(0.1, 1 - (i * 0.1));
      ctx.strokeStyle = `rgba(255, 0, 128, ${alpha})`;
      ctx.lineWidth = Math.max(1, 3 - (i * 0.1));
      
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Draw vertical lines with perspective
    const centerX = canvas.width / 2;
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      
      const x = centerX + (i * gridSize);
      const alpha = Math.max(0.1, 1 - (Math.abs(i) * 0.05));
      
      ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.lineWidth = Math.max(1, 2 - (Math.abs(i) * 0.1));
      
      ctx.beginPath();
      ctx.moveTo(x, horizonY);
      ctx.lineTo(centerX + (i * gridSize * 0.3), canvas.height);
      ctx.stroke();
    }
    
    offset += 0.5;
  }
  
  gridLines = setInterval(drawGrid, 50);
  window.synthwaveIntervals.push(gridLines);
  
  // Handle window resize
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// Create floating geometric shapes
function createSynthWaves() {
  console.log('🔺 Creating synthwave shapes');
  
  const shapes = [];
  const shapeContainer = document.createElement('div');
  shapeContainer.id = 'synthwave-shapes';
  shapeContainer.style.position = 'fixed';
  shapeContainer.style.top = '0';
  shapeContainer.style.left = '0';
  shapeContainer.style.width = '100%';
  shapeContainer.style.height = '100%';
  shapeContainer.style.pointerEvents = 'none';
  shapeContainer.style.zIndex = '2';
  shapeContainer.style.overflow = 'hidden';
  
  document.body.appendChild(shapeContainer);
  
  function createShape() {
    const shape = document.createElement('div');
    const shapeType = Math.random() > 0.5 ? 'triangle' : 'diamond';
    const size = Math.random() * 30 + 10;
    
    if (shapeType === 'triangle') {
      shape.style.width = '0';
      shape.style.height = '0';
      shape.style.borderLeft = `${size}px solid transparent`;
      shape.style.borderRight = `${size}px solid transparent`;
      shape.style.borderBottom = `${size * 1.5}px solid rgba(255, 0, 255, 0.6)`;
    } else {
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      shape.style.background = 'rgba(0, 255, 255, 0.4)';
      shape.style.transform = 'rotate(45deg)';
      shape.style.borderRadius = '2px';
    }
    
    shape.style.position = 'absolute';
    shape.style.left = Math.random() * window.innerWidth + 'px';
    shape.style.top = '-50px';
    shape.style.filter = 'drop-shadow(0 0 10px rgba(255, 0, 128, 0.8))';
    shape.style.animation = `synthwave-float ${5 + Math.random() * 10}s linear infinite`;
    
    shapeContainer.appendChild(shape);
    
    // Remove shape after animation
    setTimeout(() => {
      if (shape.parentNode) {
        shape.parentNode.removeChild(shape);
      }
    }, 15000);
  }
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes synthwave-float {
      from {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Create shapes periodically
  synthWaves = setInterval(createShape, 3000);
  window.synthwaveIntervals.push(synthWaves);
}

// Add intense neon pulse to widget titles
function addNeonPulse() {
  console.log('💫 Adding neon pulse effect');
  
  const titles = document.querySelectorAll('.widget-title, h2, h3, .group-title');
  
  titles.forEach(title => {
    title.style.textShadow = '0 0 10px rgba(255, 0, 255, 1), 0 0 20px rgba(255, 0, 128, 0.8), 0 0 30px rgba(0, 255, 255, 0.6)';
    title.style.animation = 'synthwave-pulse 2s ease-in-out infinite alternate';
    title.style.color = '#ff00ff';
  });
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes synthwave-pulse {
      from {
        text-shadow: 0 0 10px rgba(255, 0, 255, 1), 0 0 20px rgba(255, 0, 128, 0.8), 0 0 30px rgba(0, 255, 255, 0.6);
        transform: scale(1);
      }
      to {
        text-shadow: 0 0 20px rgba(255, 0, 255, 1), 0 0 40px rgba(255, 0, 128, 1), 0 0 60px rgba(0, 255, 255, 0.8);
        transform: scale(1.05);
      }
    }
    
    @keyframes synthwave-glow-pulse {
      0% {
        box-shadow: 0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 20px rgba(255, 0, 255, 0.2);
      }
      50% {
        box-shadow: 0 0 40px rgba(255, 0, 128, 0.8), inset 0 0 40px rgba(255, 0, 255, 0.4);
      }
      100% {
        box-shadow: 0 0 20px rgba(255, 0, 128, 0.5), inset 0 0 20px rgba(255, 0, 255, 0.2);
      }
    }
  `;
  document.head.appendChild(style);
}

// Create retro scanlines effect
function createRetroScanlines() {
  console.log('📺 Creating retro scanlines');
  
  const scanlines = document.createElement('div');
  scanlines.id = 'synthwave-scanlines';
  scanlines.style.position = 'fixed';
  scanlines.style.top = '0';
  scanlines.style.left = '0';
  scanlines.style.width = '100%';
  scanlines.style.height = '100%';
  scanlines.style.pointerEvents = 'none';
  scanlines.style.zIndex = '10';
  scanlines.style.opacity = '0.1';
  scanlines.style.background = `
    linear-gradient(
      transparent 50%, 
      rgba(255, 0, 128, 0.03) 50%
    )
  `;
  scanlines.style.backgroundSize = '100% 4px';
  scanlines.style.animation = 'synthwave-scanlines 0.1s linear infinite';
  
  document.body.appendChild(scanlines);
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes synthwave-scanlines {
      0% { transform: translateY(0px); }
      100% { transform: translateY(4px); }
    }
  `;
  document.head.appendChild(style);
}

// Apply Synthwave effects when theme is loaded
function applySynthwaveEffects() {
  console.log('🌈 Applying Synthwave effects - Time to get radical!');
  
  const body = document.body;
  
  // Apply page-level effects
  body.setAttribute('data-effect', 'neon-gradient-bg');
  body.classList.add('effect-color-synthwave');
  
  // Apply electric borders to main content
  const dashboardMain = document.querySelector('.dashboard-main');
  if (dashboardMain) {
    dashboardMain.setAttribute('data-effect', 'electric-border');
    dashboardMain.classList.add('effect-color-synthwave');
  }
  
  // Apply widget-specific effects
  const weatherWidget = document.querySelector('[data-widget="weather"]');
  if (weatherWidget) {
    weatherWidget.setAttribute('data-effect', 'neon-glow-border');
    weatherWidget.classList.add('effect-color-synthwave');
    weatherWidget.style.animation = 'synthwave-glow-pulse 3s ease-in-out infinite';
  }
  
  const statusWidget = document.querySelector('[data-widget="status-summary"]');
  if (statusWidget) {
    statusWidget.setAttribute('data-effect', 'electric-border');
    statusWidget.classList.add('effect-color-synthwave');
  }
  
  // Apply effects to all text widgets
  const textWidgets = document.querySelectorAll('[data-widget="text"]');
  textWidgets.forEach(widget => {
    widget.setAttribute('data-effect', 'neon-glow');
    widget.classList.add('effect-color-synthwave');
  });
  
  // Add interactive effects
  createNeonGrid();
  createSynthWaves();
  addNeonPulse();
  createRetroScanlines();
  
  console.log('✨ Synthwave effects applied - Welcome to the neon future!');
}

// Remove Synthwave effects
function removeSynthwaveEffects() {
  console.log('🌈 Removing Synthwave effects');
  
  // Clear all intervals
  if (window.synthwaveIntervals) {
    window.synthwaveIntervals.forEach(interval => clearInterval(interval));
    window.synthwaveIntervals = [];
  }
  
  // Clear local interval references
  if (gridLines) {
    clearInterval(gridLines);
    gridLines = null;
  }
  
  if (neonPulse) {
    clearInterval(neonPulse);
    neonPulse = null;
  }
  
  if (synthWaves) {
    clearInterval(synthWaves);
    synthWaves = null;
  }
  
  // Remove canvas and elements
  const canvas = document.getElementById('synthwave-grid-effect');
  if (canvas) canvas.remove();
  
  const shapes = document.getElementById('synthwave-shapes');
  if (shapes) shapes.remove();
  
  const scanlines = document.getElementById('synthwave-scanlines');
  if (scanlines) scanlines.remove();
  
  // Remove data-effect attributes
  document.body.removeAttribute('data-effect');
  document.body.classList.remove('effect-color-synthwave');
  
  const dashboardMain = document.querySelector('.dashboard-main');
  if (dashboardMain) {
    dashboardMain.removeAttribute('data-effect');
    dashboardMain.classList.remove('effect-color-synthwave');
  }
  
  // Remove widget effects
  document.querySelectorAll('[data-effect]').forEach(el => {
    el.removeAttribute('data-effect');
    el.classList.remove('effect-color-synthwave');
    el.style.animation = '';
  });
  
  // Remove text shadows and animations
  const titles = document.querySelectorAll('.widget-title, h2, h3, .group-title');
  titles.forEach(title => {
    title.style.textShadow = '';
    title.style.animation = '';
    title.style.color = '';
  });
  
  console.log('Synthwave effects removed');
}

// Expose functions globally for theme switcher
window.SynthwaveTheme = {
  apply: applySynthwaveEffects,
  remove: removeSynthwaveEffects
};

// Apply effects immediately when script loads
applySynthwaveEffects();