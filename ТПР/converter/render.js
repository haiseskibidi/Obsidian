// Handwriting Generator Canvas Core Engine

const loadBackgroundImage = src => new Promise((res, rej) => {
  const img = new Image();
  img.src = (window.backgroundData && window.backgroundData[src]) || `backgrounds/${src}`;
  img.onload = () => res(img);
  img.onerror = () => rej(new Error(`Failed to load background: ${src}`));
});

const tableCache = {};
const loadTableImage = key => (!key || key === 'none' || !window.tableData[key]) ? Promise.resolve(null) : (tableCache[key] ? Promise.resolve(tableCache[key]) : new Promise(res => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = window.tableData[key];
  img.onload = () => res(tableCache[key] = img);
  img.onerror = () => res(null);
}));

function finalizePageEffects(pageCtx, pageCanvas, tableImage, photoShadow) {
  if (!tableImage) return;
  pageCtx.restore();
  if (photoShadow && photoShadow.checked) {
    const shadowGrad = pageCtx.createLinearGradient(0, 0, pageCanvas.width, pageCanvas.height);
    shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    pageCtx.fillStyle = shadowGrad;
    pageCtx.globalAlpha = 1.0;
    pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
  }
  const vignette = pageCtx.createRadialGradient(
    pageCanvas.width / 2, pageCanvas.height / 2, pageCanvas.width / 2.5,
    pageCanvas.width / 2, pageCanvas.height / 2, pageCanvas.height * 0.95
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.28)');
  pageCtx.fillStyle = vignette;
  pageCtx.globalAlpha = 1.0;
  pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
}

// Core Render Text Pipeline
async function generateNotebook(onlyFirstPage = false) {
  const $ = id => document.getElementById(id);
  const rawText = $('text-input').value;
  const pagesGallery = $('pages-gallery');
  if (!rawText.trim()) {
    pagesGallery.innerHTML = `<div class="empty-state"><p>Введите текст слева для генерации конспекта.</p></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();
  const loader = $('render-loader');

  if (loader && !onlyFirstPage) {
    loader.style.display = 'flex';
    await new Promise(r => setTimeout(r, 30));
  }

  try {
    const bgImage = await loadBackgroundImage($('paper-select').value);
    const tableSelect = $('table-select');
    const photoShadow = $('photo-shadow');
    const photoTilt = $('photo-tilt');
    const tableImage = await loadTableImage(tableSelect ? tableSelect.value : 'none');

    const fontSize = parseInt($('font-size').value);
    const lineHeight = parseInt($('line-height').value);
    const marginTop = parseInt($('margin-top').value);
    const marginLeft = parseInt($('margin-left').value);
    const fontDiversity = parseFloat($('font-diversity').value);
    const jitterIncline = $('jitter-incline');
    const jitterSize = $('jitter-size');
    const jitterMargin = $('jitter-margin');

    const fontKey = $('font-select').value;
    const fontName = fontKey === 'custom' ? window.customFontFamily : (window.fontMap[fontKey] || 'Lorenco');

    const handwritingFonts = ['Lorenco', 'Abram', 'Bad Script', 'Benvolio', 'Eskal', 'Gregory', 'Lazy Crazy', 'Merkucio', 'Pag', 'Paris', 'Rozovii', 'Salavat', 'Shlapak', 'Stefano', 'Tibalt'];

    let canvas = null;
    let ctx = null;
    let currentX = marginLeft;
    let currentY = marginTop + fontSize;
    const paddingBottom = parseInt(document.getElementById('margin-bottom').value);
    const contentWidth = parseInt(document.getElementById('content-width').value);

    // Split text into paragraphs (retaining newlines)
    const paragraphs = rawText.split('\n');

    // Helper: Create a new page
    function addNewPage() {
      if (onlyFirstPage && fragment.children.length >= 1) {
        throw new Error('OnlyFirstPageLimit');
      }

      if (canvas && ctx) {
        finalizePageEffects(ctx, canvas, tableImage, photoShadow);
      }

      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'page-wrapper';
      
      canvas = document.createElement('canvas');
      const marginOffset = tableImage ? 220 : 0;
      canvas.width = bgImage.width + marginOffset * 2;
      canvas.height = bgImage.height + marginOffset * 2;
      canvas.className = 'handwritten-page';
      canvas.style.setProperty('--page-width', canvas.width + 'px');
      
      ctx = canvas.getContext('2d');
      ctx.save();
      
      if (tableImage) {
        ctx.drawImage(tableImage, 0, 0, canvas.width, canvas.height);
        const deskGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        deskGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
        deskGrad.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
        ctx.fillStyle = deskGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const shiftX = (Math.random() * 2 - 1) * 35;
        const shiftY = (Math.random() * 2 - 1) * 35;
        ctx.translate(marginOffset + bgImage.width / 2 + shiftX, marginOffset + bgImage.height / 2 + shiftY);
        if (photoTilt && photoTilt.checked) {
          ctx.rotate((Math.random() * 2 - 1) * 0.022);
        }
        ctx.translate(-bgImage.width / 2, -bgImage.height / 2);
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 8;
      }
      
      ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
      if (tableImage) ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      
      ctx.fillStyle = window.activeColor || '#4260bb';
      ctx.textBaseline = 'alphabetic';
      ctx.filter = 'blur(0.2px) contrast(1.05)';
      ctx.globalAlpha = 0.94;

      pageWrapper.appendChild(canvas);
      fragment.appendChild(pageWrapper);

      currentX = marginLeft;
      currentY = marginTop + fontSize;
    }

    // Initialize first page
    addNewPage();

    paragraphs.forEach((paragraph, pIdx) => {
      // Handle empty lines (paragraph breaks)
      if (paragraph.trim() === '') {
        currentY += lineHeight;
        if (currentY > bgImage.height - paddingBottom) {
          addNewPage();
        }
        return;
      }

      // Split paragraph into words
      const words = paragraph.split(' ');
      
      // Apply slight margin jitter for the beginning of paragraph
      currentX = marginLeft + (jitterMargin.checked ? Math.random() * 15 - 5 : 0);

      words.forEach((word, wIdx) => {
        // Measure word width with current font size
        ctx.font = `${fontSize}px "${fontName}"`;
        const wordWidth = ctx.measureText(word + ' ').width;

        // Wrap lines if we exceed the max content width limit
        const rightBoundary = marginLeft + contentWidth;
        if (currentX + wordWidth > rightBoundary) {
          currentY += lineHeight;
          
          // Apply slight margin jitter for wrapped lines
          currentX = marginLeft + (jitterMargin.checked ? Math.random() * 10 - 3 : 0);

          // Add a new page if we exceed bottom margin
          if (currentY > bgImage.height - paddingBottom) {
            addNewPage();
          }
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
          ctx.translate(currentX, currentY);
          ctx.rotate(angle);
          
          // Draw character
          ctx.fillText(char, 0, 0);

          ctx.restore();
          
          // Advance cursor X
          currentX += charWidth;
        });

        // Add space between words
        ctx.font = `${fontSize}px "${fontName}"`;
        currentX += ctx.measureText(' ').width;
      });

      // Carriage return to next line at the end of paragraph
      currentY += lineHeight;
      if (currentY > bgImage.height - paddingBottom) {
        addNewPage();
      }
    });

    if (canvas && ctx) {
      finalizePageEffects(ctx, canvas, tableImage, photoShadow);
    }

    pagesGallery.innerHTML = '';
    pagesGallery.appendChild(fragment);
    if (loader) loader.style.display = 'none';
  } catch (err) {
    if (loader) loader.style.display = 'none';
    if (err.message === 'OnlyFirstPageLimit') {
      if (canvas && ctx) {
        finalizePageEffects(ctx, canvas, tableImage, photoShadow);
      }
      pagesGallery.innerHTML = '';
      pagesGallery.appendChild(fragment);
    } else {
      console.error(err);
      alert('Ошибка при генерации конспекта. Проверьте файлы фонов.');
    }
  }
}

window.generateNotebook = generateNotebook;
