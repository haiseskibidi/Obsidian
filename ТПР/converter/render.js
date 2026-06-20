// Handwriting Generator Canvas Core Engine

const loadBackgroundImage = src => new Promise((res, rej) => {
  const img = new Image();
  img.src = (window.backgroundData && window.backgroundData[src]) || `backgrounds/${src}`;
  img.onload = () => res(img);
  img.onerror = () => rej(new Error(`Failed to load background: ${src}`));
});

function finalizePageEffects(ctx, canvas, photoLighting, photoCurves) {
  if (photoCurves && photoCurves.checked) {
    ctx.save();
    const count = 1 + Math.floor(Math.random() * 2), used = [];
    for (let i = 0; i < count; i++) {
      let x1, attempts = 0;
      do { x1 = canvas.width * (0.2 + Math.random() * 0.6); attempts++; }
      while (used.some(p => Math.abs(p - x1) < 220) && attempts < 10);
      used.push(x1);
      const x2 = x1 + (Math.random() * 100 - 50), cp1 = (Math.random() * 2 - 1) * 60, cp2 = (Math.random() * 2 - 1) * 60, blurVal = 80 + Math.random() * 40;
      for (let j = 0; j < 2; j++) {
        ctx.save();
        ctx.globalCompositeOperation = j === 0 ? 'multiply' : 'screen';
        ctx.strokeStyle = j === 0 ? 'rgba(15,25,45,0.015)' : 'rgba(255,255,255,0.015)';
        ctx.lineWidth = 8;
        ctx.shadowColor = j === 0 ? 'rgba(15,25,45,0.16)' : 'rgba(255,255,255,0.14)';
        ctx.shadowBlur = blurVal;
        ctx.shadowOffsetX = j === 0 ? 5 : -5;
        ctx.beginPath(); ctx.moveTo(x1, -50);
        ctx.bezierCurveTo(x1 + cp1, canvas.height * 0.33, x2 + cp2, canvas.height * 0.66, x2, canvas.height + 50);
        ctx.stroke(); ctx.restore();
      }
    }
    ctx.restore();
  }

  if (photoLighting && photoLighting.checked) {
    ctx.save();
    const lg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    lg.addColorStop(0, 'rgba(255, 220, 140, 0.14)');
    lg.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    lg.addColorStop(1, 'rgba(8, 16, 32, 0.22)');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const vg = ctx.createRadialGradient(canvas.width/2, canvas.height/2, canvas.width/2.5, canvas.width/2, canvas.height/2, canvas.height*0.95);
    vg.addColorStop(0, 'rgba(0, 0, 0, 0)'); vg.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gc = document.createElement('canvas'); gc.width = gc.height = 100;
    const gd = gc.getContext('2d').createImageData(100, 100);
    for (let i = 0; i < gd.data.length; i += 4) gd.data[i] = gd.data[i+1] = gd.data[i+2] = Math.random() * 255, gd.data[i+3] = 12;
    gc.getContext('2d').putImageData(gd, 0, 0);
    ctx.fillStyle = ctx.createPattern(gc, 'repeat');
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

// Core Render Text Pipeline
async function generateNotebook(onlyFirstPage = false) {
  const $ = id => document.getElementById(id);
  const rawText = $('text-input').value;
  const pagesGallery = $('pages-gallery');
  if (!rawText.trim()) { pagesGallery.innerHTML = `<div class="empty-state"><p>Введите текст слева для генерации конспекта.</p></div>`; return; }

  const fragment = document.createDocumentFragment(), loader = $('render-loader');
  let canvas = null, ctx = null;
  const photoLighting = $('photo-lighting'), photoGhosting = $('photo-ghosting'), photoCurves = $('photo-curves');

  if (loader && !onlyFirstPage) {
    loader.style.display = 'flex';
    await new Promise(r => setTimeout(r, 30));
  }

  try {
    const bgImage = await loadBackgroundImage($('paper-select').value);

    const fontSize = parseInt($('font-size').value), lineHeight = parseInt($('line-height').value);
    const marginTop = parseInt($('margin-top').value), marginLeft = parseInt($('margin-left').value), marginLeftEven = parseInt($('margin-left-even').value);
    const fontDiversity = parseFloat($('font-diversity').value);
    const jitterIncline = $('jitter-incline'), jitterSize = $('jitter-size'), jitterMargin = $('jitter-margin'), jitterBaseline = $('jitter-baseline');

    const fontKey = $('font-select').value;
    const fontName = fontKey === 'custom' ? window.customFontFamily : (window.fontMap[fontKey] || 'Lorenco');

    const handwritingFonts = ['Lorenco', 'Abram', 'Bad Script', 'Benvolio', 'Eskal', 'Gregory', 'Lazy Crazy', 'Merkucio', 'Pag', 'Paris', 'Rozovii', 'Salavat', 'Shlapak', 'Stefano', 'Tibalt'];

    let currentMargin = marginLeft;
    let currentX = currentMargin;
    let currentY = marginTop + fontSize;
    const paddingBottom = parseInt(document.getElementById('margin-bottom').value);
    const contentWidth = parseInt(document.getElementById('content-width').value);

    // Split text into paragraphs (retaining newlines)
    const paragraphs = rawText.split('\n');

    // Helper: Create a new page
    let pageCount = 0;
    function addNewPage() {
      if (onlyFirstPage && fragment.children.length >= 1) throw new Error('OnlyFirstPageLimit');
      if (canvas && ctx) finalizePageEffects(ctx, canvas, photoLighting, photoCurves);

      const pageWrapper = document.createElement('div'); pageWrapper.className = 'page-wrapper';
      canvas = document.createElement('canvas'); canvas.width = bgImage.width; canvas.height = bgImage.height;
      canvas.className = 'handwritten-page'; canvas.style.setProperty('--page-width', canvas.width + 'px');
      ctx = canvas.getContext('2d');
      
      // чётные страницы (левые) — зеркалим фон, как в настоящей тетради
      const isLeftPage = pageCount % 2 === 1;
      currentMargin = isLeftPage ? marginLeftEven : marginLeft;
      if (isLeftPage) {
        ctx.save(); ctx.translate(bgImage.width, 0); ctx.scale(-1, 1);
        ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height); ctx.restore();
      } else {
        ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
      }
      pageCount++;
      if ((photoLighting && photoLighting.checked) || (photoCurves && photoCurves.checked)) {
        ctx.fillStyle = (photoLighting && photoLighting.checked) ? 'rgba(10, 15, 30, 0.05)' : 'rgba(10, 15, 30, 0.025)';
        ctx.fillRect(0, 0, bgImage.width, bgImage.height);
      }
      
      if (photoGhosting && photoGhosting.checked && paragraphs.length > 0) {
        ctx.save(); ctx.fillStyle = '#50608c'; ctx.globalAlpha = 0.095; ctx.filter = 'blur(3.5px)';
        ctx.translate(bgImage.width, 0); ctx.scale(-1, 1); ctx.font = `${fontSize * 0.95}px "${fontName}"`;
        
        let ghostY = marginTop + fontSize * 1.5;
        paragraphs.slice(0, 10).forEach(para => {
          if (para.trim()) {
            ctx.fillText(para.split('').reverse().join(''), 150, ghostY); ghostY += lineHeight * 1.15;
          }
        });
        ctx.restore();
      }
      
      ctx.fillStyle = window.activeColor || '#4260bb'; ctx.textBaseline = 'alphabetic';
      ctx.filter = 'blur(0.2px) contrast(1.05)'; ctx.globalAlpha = 0.94;
      pageWrapper.appendChild(canvas); fragment.appendChild(pageWrapper);
      currentX = currentMargin; currentY = marginTop + fontSize;
    }
    addNewPage();
    paragraphs.forEach((paragraph, pIdx) => {
      if (paragraph.trim() === '') {
        currentY += lineHeight; if (currentY > bgImage.height - paddingBottom) addNewPage();
        return;
      }

      // Split paragraph into words
      const words = paragraph.split(' ');
      
      // Apply slight margin jitter for the beginning of paragraph
      currentX = currentMargin + (jitterMargin.checked ? Math.random() * 15 - 5 : 0);
      // базовая линия: 3 гармоники + линейный дрифт + прыжок между словами
      let wP1 = Math.random()*6.28, wP2 = Math.random()*6.28, wP3 = Math.random()*6.28;
      let wA1 = 1+Math.random()*1.5, wA2 = 0.5+Math.random(), wA3 = 0.3+Math.random()*0.5;
      let wF1 = 0.004+Math.random()*0.004, wF2 = 0.01+Math.random()*0.01, wF3 = 0.025+Math.random()*0.015;
      let lineDrift = (Math.random()-0.5)*0.008, wordJump = 0;
      words.forEach((word, wIdx) => {
        // Measure word width with current font size
        ctx.font = `${fontSize}px "${fontName}"`;
        const wordWidth = ctx.measureText(word + ' ').width;

        // Wrap lines if we exceed the max content width limit
        const rightBoundary = currentMargin + contentWidth;
        if (currentX + wordWidth > rightBoundary) {
          currentY += lineHeight;
          // Apply slight margin jitter for wrapped lines
          currentX = currentMargin + (jitterMargin.checked ? Math.random() * 10 - 3 : 0);
          wP1 = Math.random()*6.28; wP2 = Math.random()*6.28; wP3 = Math.random()*6.28;
          wA1 = 1+Math.random()*1.5; wA2 = 0.5+Math.random(); wA3 = 0.3+Math.random()*0.5;
          wF1 = 0.004+Math.random()*0.004; wF2 = 0.01+Math.random()*0.01; wF3 = 0.025+Math.random()*0.015;
          lineDrift = (Math.random()-0.5)*0.008; wordJump = 0;

          if (currentY > bgImage.height - paddingBottom) addNewPage();
        }

        // Draw the word character-by-character to apply letter jitters
        const characters = word.split('');
        characters.forEach(char => {
          ctx.save();

          const angle = jitterIncline.checked ? (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.12 : 0;
          const charSize = jitterSize.checked ? fontSize + (Math.random() * 7 - 2) : fontSize;
          const charFont = (fontDiversity > 0 && Math.random() < fontDiversity) ? handwritingFonts[Math.floor(Math.random() * handwritingFonts.length)] : fontName;
          
          ctx.font = `${charSize}px "${charFont}"`;
          const charWidth = ctx.measureText(char).width;

          // Apply translations for rotation around the character baseline
          const bx = currentX - currentMargin;
          const baselineShift = (jitterBaseline && jitterBaseline.checked)
            ? Math.sin(bx*wF1+wP1)*wA1 + Math.sin(bx*wF2+wP2)*wA2 + Math.sin(bx*wF3+wP3)*wA3 + bx*lineDrift + wordJump
            : 0;
          ctx.translate(currentX, currentY + baselineShift);
          ctx.rotate(angle);
          
          // Draw character
          ctx.fillText(char, 0, 0);
          ctx.restore();
          currentX += charWidth;
        });

        // add space between words
        ctx.font = `${fontSize}px "${fontName}"`;
        currentX += ctx.measureText(' ').width;
        if (jitterBaseline && jitterBaseline.checked) wordJump += (Math.random()-0.5) * 1.8;
      });
      currentY += lineHeight;
      if (currentY > bgImage.height - paddingBottom) addNewPage();
    });

    if (canvas && ctx) finalizePageEffects(ctx, canvas, photoLighting, photoCurves);
    pagesGallery.innerHTML = '';
    pagesGallery.appendChild(fragment);
    if (loader) loader.style.display = 'none';
  } catch (err) {
    if (loader) loader.style.display = 'none';
    if (err.message === 'OnlyFirstPageLimit') {
      if (canvas && ctx) finalizePageEffects(ctx, canvas, photoLighting, photoCurves);
      pagesGallery.innerHTML = '';
      pagesGallery.appendChild(fragment);
    } else { console.error(err); alert('Ошибка при генерации конспекта. Проверьте файлы фонов.'); }
  }
}

window.generateNotebook = generateNotebook;
