document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const textInput = document.getElementById('text-input');
  const charTotal = document.getElementById('char-total');
  const fontSelect = document.getElementById('font-select');
  const fontUpload = document.getElementById('font-upload');
  const fontStatus = document.getElementById('font-status');
  
  const fontSizeInput = document.getElementById('font-size');
  const fontSizeVal = document.getElementById('font-size-val');
  const lineHeightInput = document.getElementById('line-height');
  const lineHeightVal = document.getElementById('line-height-val');
  const marginTopInput = document.getElementById('margin-top');
  const marginTopVal = document.getElementById('margin-top-val');
  const marginLeftInput = document.getElementById('margin-left');
  const marginLeftVal = document.getElementById('margin-left-val');
  
  const colorSwatches = document.querySelectorAll('.color-swatch:not(.custom-color)');
  const customColorSwatch = document.querySelector('.color-swatch.custom-color');
  const inkColorPicker = document.getElementById('ink-color-picker');
  
  const paperSelect = document.getElementById('paper-select');
  const jitterIncline = document.getElementById('jitter-incline');
  const jitterSize = document.getElementById('jitter-size');
  const jitterMargin = document.getElementById('jitter-margin');
  
  const convertBtn = document.getElementById('convert-btn');
  const downloadJpgBtn = document.getElementById('download-jpg-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const pagesGallery = document.getElementById('pages-gallery');
  const printContainer = document.getElementById('print-container');

  // Config State
  let activeColor = '#1c3b88';
  let customFontFamily = null;
  const pageW = 800; // Fixed page width (standard A4 aspect ratio helper)
  const pageH = 1050; // Fixed page height

  // Default text relating to user's current project (ТПР)
  textInput.value = `Теория принятия решений (ТПР) — это научная дисциплина, изучающая закономерности выбора людьми путей решения разного рода задач.

1. Метод анализа иерархий (МАИ), созданный Томасом Саати, позволяет решать многокритериальные задачи путем декомпозиции проблемы на более простые составляющие и сравнения их приоритетов.
2. Нечеткая логика (Fuzzy Logic), предложенная Лотфи Заде, оперирует понятиями степени истинности вместо строгой двоичной логики (да/нет). Это позволяет моделировать человеческие рассуждения.

Данный конспект сгенерирован автоматически в реальном времени!`;
  updateCharCount();

  // Event Listeners for UI Value Labels
  textInput.addEventListener('input', updateCharCount);
  
  fontSizeInput.addEventListener('input', (e) => {
    fontSizeVal.textContent = `${e.target.value}px`;
  });
  lineHeightInput.addEventListener('input', (e) => {
    lineHeightVal.textContent = `${e.target.value}px`;
  });
  marginTopInput.addEventListener('input', (e) => {
    marginTopVal.textContent = `${e.target.value}px`;
  });
  marginLeftInput.addEventListener('input', (e) => {
    marginLeftVal.textContent = `${e.target.value}px`;
  });

  // Font upload handler
  fontSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      fontUpload.click();
    } else {
      fontStatus.textContent = '';
    }
  });

  fontUpload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    fontStatus.className = 'status-msg';
    fontStatus.textContent = 'Загрузка шрифта...';

    try {
      const fontName = 'custom-user-font';
      const arrayBuffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, arrayBuffer);
      
      await fontFace.load();
      document.fonts.add(fontFace);
      
      customFontFamily = fontName;
      fontStatus.className = 'status-msg success';
      fontStatus.textContent = `Шрифт успешно загружен: ${file.name}`;
      
      // Update custom option label and select it
      const customOpt = fontSelect.querySelector('option[value="custom"]');
      customOpt.textContent = `Свой шрифт: ${file.name.substring(0, 15)}...`;
      fontSelect.value = 'custom';
    } catch (err) {
      console.error(err);
      fontStatus.className = 'status-msg error';
      fontStatus.textContent = 'Ошибка загрузки шрифта. Попробуйте TTF/OTF.';
      fontSelect.value = 'Caveat';
    }
  });

  // Ink Color Selection
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      customColorSwatch.classList.remove('active');
      swatch.classList.add('active');
      activeColor = swatch.getAttribute('data-color');
    });
  });

  inkColorPicker.addEventListener('input', (e) => {
    colorSwatches.forEach(s => s.classList.remove('active'));
    customColorSwatch.classList.add('active');
    activeColor = e.target.value;
  });

  // Trigger Conversion
  convertBtn.addEventListener('click', generateNotebook);

  // Download JPG Action
  downloadJpgBtn.addEventListener('click', () => {
    const canvases = pagesGallery.querySelectorAll('canvas');
    if (canvases.length === 0) return;

    canvases.forEach((canvas, idx) => {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `notebook_page_${idx + 1}.jpeg`;
      link.click();
    });
  });

  // Export PDF Action via window.print()
  downloadPdfBtn.addEventListener('click', () => {
    const canvases = pagesGallery.querySelectorAll('canvas');
    if (canvases.length === 0) return;

    printContainer.innerHTML = '';
    
    // Convert canvases to images and append to hidden print element
    canvases.forEach(canvas => {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/jpeg', 0.95);
      img.className = 'print-page-img';
      printContainer.appendChild(img);
    });

    window.print();
  });

  // Helper: Update char count
  function updateCharCount() {
    charTotal.textContent = textInput.value.length;
  }

  // Draw Paper Background Pattern Programmatically (prevents CORS and loads instantly)
  function createPaperPattern(type, width, height) {
    const paperCanvas = document.createElement('canvas');
    paperCanvas.width = width;
    paperCanvas.height = height;
    const pCtx = paperCanvas.getContext('2d');

    // Fill Page Color (soft off-white/ivory)
    pCtx.fillStyle = '#fbfaf5';
    pCtx.fillRect(0, 0, width, height);

    if (type === 'grid') {
      const gridSize = 24;
      pCtx.lineWidth = 0.5;
      pCtx.strokeStyle = 'rgba(28, 90, 168, 0.12)'; // Light blue cells

      // Draw Grid
      for (let x = 0; x < width; x += gridSize) {
        pCtx.beginPath();
        pCtx.moveTo(x, 0);
        pCtx.lineTo(x, height);
        pCtx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        pCtx.beginPath();
        pCtx.moveTo(0, y);
        pCtx.lineTo(width, y);
        pCtx.stroke();
      }

      // Draw Left Margin line (red)
      pCtx.lineWidth = 1.0;
      pCtx.strokeStyle = 'rgba(217, 85, 85, 0.5)';
      pCtx.beginPath();
      pCtx.moveTo(70, 0);
      pCtx.lineTo(70, height);
      pCtx.stroke();
    } 
    else if (type === 'lines') {
      const lineSpacing = 26;
      pCtx.lineWidth = 0.5;
      pCtx.strokeStyle = 'rgba(28, 90, 168, 0.15)'; // Light blue lines

      // Draw horizontal lines
      for (let y = 60; y < height; y += lineSpacing) {
        pCtx.beginPath();
        pCtx.moveTo(0, y);
        pCtx.lineTo(width, y);
        pCtx.stroke();
      }

      // Draw Left Margin line (red)
      pCtx.lineWidth = 1.0;
      pCtx.strokeStyle = 'rgba(217, 85, 85, 0.5)';
      pCtx.beginPath();
      pCtx.moveTo(70, 0);
      pCtx.lineTo(70, height);
      pCtx.stroke();
    }

    return paperCanvas;
  }

  // Core Render Text Pipeline
  function generateNotebook() {
    const rawText = textInput.value;
    if (!rawText.trim()) {
      alert('Введите текст для генерации!');
      return;
    }

    pagesGallery.innerHTML = ''; // Clear preview area

    // Read UI values
    const fontSize = parseInt(fontSizeInput.value);
    const lineHeight = parseInt(lineHeightInput.value);
    const marginTop = parseInt(marginTopInput.value);
    const marginLeft = parseInt(marginLeftInput.value);
    const paperType = paperSelect.value;
    const fontName = fontSelect.value === 'custom' ? customFontFamily : fontSelect.value;

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
      canvas.width = pageW;
      canvas.height = pageH;
      canvas.className = 'handwritten-page';
      
      ctx = canvas.getContext('2d');
      
      // Draw background pattern
      const paperPattern = createPaperPattern(paperType, pageW, pageH);
      ctx.drawImage(paperPattern, 0, 0);
      
      // Set styles
      ctx.fillStyle = activeColor;
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
        if (currentY > pageH - paddingBottom) {
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

        // Wrap lines if we exceed the right margin
        if (currentX + wordWidth > pageW - paddingRight) {
          currentY += lineHeight;
          
          // Apply slight margin jitter for wrapped lines
          if (jitterMargin.checked) {
            currentX = marginLeft + (Math.random() * 6 - 3);
          } else {
            currentX = marginLeft;
          }

          // Add a new page if we exceed bottom margin
          if (currentY > pageH - paddingBottom) {
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
      if (currentY > pageH - paddingBottom) {
        addNewPage();
      }
    });
  }

  // Pre-generate the default content on load
  // We wrap in a short timeout to make sure Google WebFonts are fully loaded and active
  setTimeout(() => {
    generateNotebook();
  }, 800);
});
