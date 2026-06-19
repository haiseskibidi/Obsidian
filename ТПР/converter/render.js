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
async function generateNotebook() {
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

  try {
    // 1. Load Background Image
    const selectedBg = paperSelect.value;
    const bgImage = await loadBackgroundImage(selectedBg);

    pagesGallery.innerHTML = ''; // Clear preview area

    // Read UI values
    const fontSize = parseInt(fontSizeInput.value);
    const lineHeight = parseInt(lineHeightInput.value);
    const marginTop = parseInt(marginTopInput.value);
    const marginLeft = parseInt(marginLeftInput.value);
    
    // Custom font fallback or mapped local font family name
    const fontKey = fontSelect.value;
    const fontName = fontKey === 'custom' ? window.customFontFamily : (window.fontMap[fontKey] || 'Lorenco');

    let canvas = null;
    let ctx = null;
    let currentX = marginLeft;
    let currentY = marginTop + fontSize;
    const paddingRight = 45;
    const paddingBottom = 60;

    // Split text into paragraphs (retaining newlines)
    const paragraphs = rawText.split('\n');

    // Helper: Create a new page
    function addNewPage() {
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'page-wrapper';
      
      canvas = document.createElement('canvas');
      canvas.width = bgImage.width;
      canvas.height = bgImage.height;
      canvas.className = 'handwritten-page';
      
      ctx = canvas.getContext('2d');
      
      // Draw the loaded high-res background template
      ctx.drawImage(bgImage, 0, 0);
      
      // Set styles
      ctx.fillStyle = window.activeColor || '#1c3b88';
      ctx.textBaseline = 'alphabetic';

      pageWrapper.appendChild(canvas);
      pagesGallery.appendChild(pageWrapper);

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
        currentX = marginLeft + (Math.random() * 8 - 4);
      } else {
        currentX = marginLeft;
      }

      words.forEach((word, wIdx) => {
        // Measure word width with current font size
        ctx.font = `${fontSize}px "${fontName}"`;
        const wordWidth = ctx.measureText(word + ' ').width;

        // Wrap lines if we exceed the right margin of the sheet
        if (currentX + wordWidth > bgImage.width - paddingRight) {
          currentY += lineHeight;
          
          // Apply slight margin jitter for wrapped lines
          if (jitterMargin.checked) {
            currentX = marginLeft + (Math.random() * 6 - 3);
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
            // Slight tilt (-1.8 to +1.8 degrees)
            angle = (Math.random() - 0.5) * 0.05;
          }

          // 2. Size Jitter
          let charSize = fontSize;
          if (jitterSize.checked) {
            // Variations in size of +/- 1.5 pixels
            charSize = fontSize + (Math.random() * 3 - 1.5);
          }
          
          ctx.font = `${charSize}px "${fontName}"`;
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
  } catch (err) {
    console.error(err);
    alert('Ошибка при генерации конспекта. Проверьте файлы фонов.');
  }
}

window.generateNotebook = generateNotebook;
