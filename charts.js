// Minimal charts without external libs
function drawPie(canvas, values, labels, colors){
  // Make canvas responsive
  const parent = canvas.parentElement;
  const isMobile = window.innerWidth <= 768;
  if(isMobile){
    canvas.width = Math.min(parent.clientWidth - 32, 400);
    canvas.height = 200;
  }
  
  const ctx = canvas.getContext('2d');
  const total = values.reduce((a,b)=>a+b,0) || 1;
  let angle = -Math.PI/2;
  const centerX = canvas.width/2, centerY = canvas.height/2, r = Math.min(centerX,centerY)-10;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  values.forEach((v,i)=>{
    const slice = (v/total)*Math.PI*2;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX,centerY,r,angle,angle+slice);
    ctx.closePath();
    ctx.fillStyle = colors[i%colors.length];
    ctx.fill();
    angle += slice;
  });
  // legend
  const legendX = 10, legendY = 10;
  const fontSize = isMobile ? 10 : 12;
  ctx.font = `${fontSize}px system-ui`;
  labels.forEach((lb,i)=>{
    ctx.fillStyle = colors[i%colors.length];
    ctx.fillRect(legendX, legendY + i*18, 12, 12);
    ctx.fillStyle = '#e5e7eb';
    const pct = total? Math.round(values[i]/total*100):0;
    ctx.fillText(lb+' ('+pct+'%)', legendX+18, legendY + 10 + i*18);
  });
}

function drawBar(canvas, labels, values){
  // Make canvas responsive
  const parent = canvas.parentElement;
  const isMobile = window.innerWidth <= 768;
  if(isMobile){
    canvas.width = Math.min(parent.clientWidth - 32, 500);
    canvas.height = 220;
  }
  
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  const max = Math.max(10, ...values) * 1.2;
  const pad = isMobile ? 25 : 30;
  const chartW = w - pad*2, chartH = h - pad*2;
  const barW = chartW / values.length * 0.6;
  ctx.strokeStyle = '#334155'; ctx.lineWidth = 1;
  
  // axes
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, pad+chartH); ctx.lineTo(pad+chartW, pad+chartH); ctx.stroke();
  
  // Store bar positions for hover detection
  if(!canvas.barData) canvas.barData = [];
  canvas.barData = [];
  
  // bars
  values.forEach((v,i)=>{
    const x = pad + (i+0.2) * (chartW/values.length);
    const y = pad + chartH - (v/max)*chartH;
    const hbar = (v/max)*chartH;
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(x, y, barW, hbar);
    
    // Store bar position for hover
    canvas.barData.push({
      x: x,
      y: y,
      width: barW,
      height: hbar,
      value: v,
      label: labels[i]
    });
  });
  
  // labels
  const fontSize = isMobile ? 10 : 12;
  ctx.fillStyle = '#9ca3af'; ctx.font=`${fontSize}px system-ui`; ctx.textAlign='center';
  labels.forEach((lb,i)=>{
    const x = pad + (i+0.2) * (chartW/values.length) + barW/2;
    ctx.fillText(lb, x, pad+chartH+14);
  });
  
  // Add hover/touch listener if not already added
  if(!canvas.hasHoverListener){
    canvas.hasHoverListener = true;
    
    // Create tooltip element
    let tooltip = document.getElementById('chart-tooltip');
    if(!tooltip){
      tooltip = document.createElement('div');
      tooltip.id = 'chart-tooltip';
      tooltip.style.position = 'fixed';
      tooltip.style.display = 'none';
      tooltip.style.background = '#1f2937';
      tooltip.style.color = '#e5e7eb';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '8px';
      tooltip.style.fontSize = '13px';
      tooltip.style.fontWeight = '600';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.zIndex = '1000';
      tooltip.style.border = '1px solid #374151';
      tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.5)';
      document.body.appendChild(tooltip);
    }
    
    // Handle both mouse and touch events
    const showTooltip = (clientX, clientY)=>{
      const rect = canvas.getBoundingClientRect();
      const mouseX = clientX - rect.left;
      const mouseY = clientY - rect.top;
      
      let found = false;
      canvas.barData.forEach(bar=>{
        if(mouseX >= bar.x && mouseX <= bar.x + bar.width && 
           mouseY >= bar.y && mouseY <= bar.y + bar.height){
          found = true;
          tooltip.style.display = 'block';
          tooltip.style.left = (clientX + 15) + 'px';
          tooltip.style.top = (clientY - 30) + 'px';
          tooltip.innerHTML = `<div>${bar.label}</div><div style="color:#60a5fa;font-size:15px;margin-top:2px">${bar.value.toFixed(2)} ฿</div>`;
        }
      });
      
      if(!found){
        tooltip.style.display = 'none';
      }
    };
    
    const hideTooltip = ()=>{
      tooltip.style.display = 'none';
    };
    
    // Mouse events
    canvas.addEventListener('mousemove', (e)=>{
      showTooltip(e.clientX, e.clientY);
    });
    
    canvas.addEventListener('mouseleave', hideTooltip);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', (e)=>{
      e.preventDefault();
      const touch = e.touches[0];
      showTooltip(touch.clientX, touch.clientY);
    });
    
    canvas.addEventListener('touchmove', (e)=>{
      e.preventDefault();
      const touch = e.touches[0];
      showTooltip(touch.clientX, touch.clientY);
    });
    
    canvas.addEventListener('touchend', (e)=>{
      e.preventDefault();
      setTimeout(hideTooltip, 1500); // Keep tooltip for 1.5s on touch
    });
  }
}
