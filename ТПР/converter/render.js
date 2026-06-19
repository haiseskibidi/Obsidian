// Handwriting Generator Canvas Core Engine

// Loader for background image
function loadBackgroundImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = (window.backgroundData && window.backgroundData[src]) || `backgrounds/${src}`;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load background: ${src}`));
  });
}

// Core Render Text Pipeline
async function generateNotebook(onlyFirstPage = false) {
  const textInput = document.getElementById('text-input');
  const fontSelect = document.getElementById('font-select');
  const fontSizeInput = document.getElementById('font-size');
  const lineHeightInput = document.getElementById('line-height');
  const marginTopInput = document.getElementById('margin-top');
  const marginLeftInput = document.getElementById('margin-left');
  const paperSelect = document.getElementById('paper-select');
  const jitterIncline = document.getElementById('jitter-incline');
  const jitterSize = document.getElementById('jitter-size');
  const jitterMargin = document.getElementById('jitter-margin');
  const pagesGallery = document.getElementById('pages-gallery');

  const rawText = textInput.value;
  if (!rawText.trim()) {
    pagesGallery.innerHTML = `
      <div class="empty-state">
        <p>Введите текст слева для генерации конспекта.</p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  const loader = document.getElementById('render-loader');

  if (loader && !onlyFirstPage) {
    loader.style.display = 'flex';
    // Yield execution to the browser thread to paint the loader
    await new Promise(resolve => setTimeout(resolve, 30));
  }

  try {
    // 1. Load Background Image
    const selectedBg = paperSelect.value;
    const bgImage = await loadBackgroundImage(selectedBg);

    // Read UI values
    const fontSize = parseInt(fontSizeInput.value);
    const lineHeight = parseInt(lineHeightInput.value);
    const marginTop = parseInt(marginTopInput.value);
    const marginLeft = parseInt(marginLeftInput.value);
    const fontDiversity = parseFloat(document.getElementById('font-diversity').value);
    
    // Custom font fallback or mapped local font family name
    const fontKey = fontSelect.value;
    const fontName = fontKey === 'custom' ? window.customFontFamily : (window.fontMap[fontKey] || 'Lorenco');

    const handwritingFonts = [
      'Lorenco', 'Abram', 'Bad Script', 'Benvolio', 'Eskal',
      'Gregory', 'Lazy Crazy', 'Merkucio', 'Pag', 'Paris',
      'Rozovii', 'Salavat', 'Shlapak', 'Stefano', 'Tibalt'
    ];

    let canvas = null;
    let ctx = null;
    let currentX = marginLeft;
    let currentY = marginTop + fontSize;
    const paddingRight = parseInt(document.getElementById('margin-right').value);
    const paddingBottom = parseInt(document.getElementById('margin-bottom').value);
    const contentWidth = parseInt(document.getElementById('content-width').value);

    // Split text into paragraphs (retaining newlines)
    const paragraphs = rawText.split('\n');

    // Helper: Create a new page
    function addNewPage() {
      if (onlyFirstPage && fragment.children.length >= 1) {
        throw new Error('OnlyFirstPageLimit');
      }

      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'page-wrapper';
      
      canvas = document.createElement('canvas');
      canvas.width = bgImage.width; // Render at native 1x resolution for authentic scanned document appearance
      canvas.height = bgImage.height;
      canvas.className = 'handwritten-page';
      canvas.style.setProperty('--page-width', bgImage.width + 'px');
      
      ctx = canvas.getContext('2d');
      
      // Draw the loaded background template scaled to context bounds
      ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
      
      // Set styles
      ctx.fillStyle = window.activeColor || '#4260bb';
      ctx.textBaseline = 'alphabetic';
      ctx.filter = 'blur(0.2px) contrast(1.05)'; // Simulates natural ink bleeding at 1x resolution
      ctx.globalAlpha = 0.94; // Allows paper grain and lines to subtly show through the ink

      pageWrapper.appendChild(canvas);
      fragment.appendChild(pageWrapper);

      // Reset coordinates for new page
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
      if (jitterMargin.checked) {
        currentX = marginLeft + (Math.random() * 15 - 5);
      } else {
        currentX = marginLeft;
      }

      words.forEach((word, wIdx) => {
        // Measure word width with current font size
        ctx.font = `${fontSize}px "${fontName}"`;
        const wordWidth = ctx.measureText(word + ' ').width;

        // Wrap lines if we exceed the right margin or max content width
        const rightBoundary = Math.min(bgImage.width - paddingRight, marginLeft + contentWidth);
        if (currentX + wordWidth > rightBoundary) {
          currentY += lineHeight;
          
          // Apply slight margin jitter for wrapped lines
          if (jitterMargin.checked) {
            currentX = marginLeft + (Math.random() * 10 - 3);
          } else {
            currentX = marginLeft;
          }

          // Add a new page if we exceed bottom margin
          if (currentY > bgImage.height - paddingBottom) {
            addNewPage();
          }
        }

        // Draw the word character-by-character to apply letter jitters
        const characters = word.split('');
        characters.forEach(char => {
          ctx.save();

          // 1. Incline (angle) Jitter
          let angle = 0;
          if (jitterIncline.checked) {
            angle = (Math.random() < 0.5 ? -1 : 1) * Math.random() * 0.12; // tilt up to ~7 degrees
          }

          // 2. Size Jitter
          let charSize = fontSize;
          if (jitterSize.checked) {
            charSize = fontSize + (Math.random() * 7 - 2); // size variation from -2px to +5px
          }

          // 3. Letter Diversity (mix different handwriting styles)
          let charFont = fontName;
          if (fontDiversity > 0 && Math.random() < fontDiversity) {
            charFont = handwritingFonts[Math.floor(Math.random() * handwritingFonts.length)];
          }
          
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

    pagesGallery.innerHTML = '';
    pagesGallery.appendChild(fragment);
    if (loader) loader.style.display = 'none';
  } catch (err) {
    if (loader) loader.style.display = 'none';
    if (err.message === 'OnlyFirstPageLimit') {
      pagesGallery.innerHTML = '';
      pagesGallery.appendChild(fragment);
    } else {
      console.error(err);
      alert('Ошибка при генерации конспекта. Проверьте файлы фонов.');
    }
  }
}

window.generateNotebook = generateNotebook;
