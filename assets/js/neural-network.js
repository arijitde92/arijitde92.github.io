/**
 * neural-network.js
 * Interactive canvas-based neural network animation.
 * Nodes float and connect based on proximity; mouse acts as an attractor.
 */

(function () {
  'use strict';

  const CONFIG = {
    nodeCount:        80,
    linkDistance:     150,
    mouseRadius:      200,
    mouseAttrStrength: 0.015,
    nodeSpeed:        0.4,
    nodeRadius:       { min: 1.5, max: 3.5 },
    colorCyan:        '#00D4FF',
    colorPurple:      '#7B2FBE',
    bgDeep:           '#050A13',
    fpsTarget:        60,
  };

  let canvas, ctx, nodes, mouse, animFrame, lastTime;

  function init(canvasId) {
    canvas = document.getElementById(canvasId);
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    mouse = { x: -9999, y: -9999, active: false };

    resize();
    buildNodes();
    bindEvents();
    lastTime = performance.now();
    animFrame = requestAnimationFrame(loop);
  }

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function buildNodes() {
    nodes = [];
    for (let i = 0; i < CONFIG.nodeCount; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const speed  = (Math.random() * 0.6 + 0.2) * CONFIG.nodeSpeed;
      nodes.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r:  Math.random() * (CONFIG.nodeRadius.max - CONFIG.nodeRadius.min) + CONFIG.nodeRadius.min,
        // slight hue variation
        hue: Math.random() < 0.15 ? 'purple' : 'cyan',
      });
    }
  }

  function bindEvents() {
    // Mouse / pointer
    canvas.closest('.hero').addEventListener('mousemove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    canvas.closest('.hero').addEventListener('mouseleave', function () {
      mouse.active = false;
      mouse.x = -9999;
      mouse.y = -9999;
    });
    // Touch
    canvas.closest('.hero').addEventListener('touchmove', function (e) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.active = true;
    }, { passive: true });
    canvas.closest('.hero').addEventListener('touchend', function () {
      mouse.active = false;
    });

    // Resize
    window.addEventListener('resize', function () {
      cancelAnimationFrame(animFrame);
      resize();
      buildNodes();
      animFrame = requestAnimationFrame(loop);
    });
  }

  function loop(ts) {
    const dt = Math.min((ts - lastTime) / (1000 / CONFIG.fpsTarget), 3);
    lastTime = ts;

    update(dt);
    draw();

    animFrame = requestAnimationFrame(loop);
  }

  function update(dt) {
    const W = canvas.width;
    const H = canvas.height;

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // Mouse attraction
      if (mouse.active) {
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius && dist > 1) {
          const force = CONFIG.mouseAttrStrength * (1 - dist / CONFIG.mouseRadius);
          n.vx += (dx / dist) * force * dt;
          n.vy += (dy / dist) * force * dt;
        }
      }

      // Clamp speed
      const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      const maxSpd = CONFIG.nodeSpeed * 1.6;
      if (spd > maxSpd) {
        n.vx = (n.vx / spd) * maxSpd;
        n.vy = (n.vy / spd) * maxSpd;
      }

      // Move
      n.x += n.vx * dt;
      n.y += n.vy * dt;

      // Soft bounce from edges
      const pad = 20;
      if (n.x < pad)    { n.vx += 0.05 * dt; }
      if (n.x > W - pad) { n.vx -= 0.05 * dt; }
      if (n.y < pad)    { n.vy += 0.05 * dt; }
      if (n.y > H - pad) { n.vy -= 0.05 * dt; }

      // Hard clamp
      n.x = Math.max(0, Math.min(W, n.x));
      n.y = Math.max(0, Math.min(H, n.y));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections between nodes
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[j].x - nodes[i].x;
        const dy   = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.linkDistance) {
          const alpha = (1 - dist / CONFIG.linkDistance) * 0.4;
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw connections from nodes to mouse
    if (mouse.active) {
      for (let i = 0; i < nodes.length; i++) {
        const dx   = mouse.x - nodes[i].x;
        const dy   = mouse.y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const alpha = (1 - dist / CONFIG.mouseRadius) * 0.7;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      // Draw mouse node
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
      ctx.shadowColor = '#00D4FF';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      if (n.hue === 'purple') {
        ctx.fillStyle = 'rgba(123, 47, 190, 0.85)';
        ctx.shadowColor = '#7B2FBE';
      } else {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.75)';
        ctx.shadowColor = '#00D4FF';
      }
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Expose
  window.NeuralNetwork = { init };
})();
