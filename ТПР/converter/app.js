// Global state variables accessible by render.js
window.activeColor = '#1c3b88';
window.customFontFamily = null;
window.fontMap = {
  'lorenco': 'Lorenco',
  'abram': 'Abram',
  'bad-script': 'Bad Script',
  'benvolio': 'Benvolio',
  'eskal': 'Eskal',
  'gregory': 'Gregory',
  'lazy-crazy': 'Lazy Crazy',
  'merkucio': 'Merkucio',
  'pag': 'Pag',
  'paris': 'Paris',
  'rozovii': 'Rozovii',
  'salavat': 'Salavat',
  'shlapak': 'Shlapak',
  'stefano': 'Stefano',
  'tibalt': 'Tibalt'
};

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
  const fontDiversityInput = document.getElementById('font-diversity');
  const fontDiversityVal = document.getElementById('font-diversity-val');
  
  const colorSwatches = document.querySelectorAll('.color-swatch:not(.custom-color)');
  const customColorSwatch = document.querySelector('.color-swatch.custom-color');
  const inkColorPicker = document.getElementById('ink-color-picker');
  
  const downloadJpgBtn = document.getElementById('download-jpg-btn');
  const downloadPdfBtn = document.getElementById('download-pdf-btn');
  const pagesGallery = document.getElementById('pages-gallery');
  const printContainer = document.getElementById('print-container');
  const updateTextBtn = document.getElementById('update-text-btn');
  
  // Settings elements for real-time update
  const paperSelect = document.getElementById('paper-select');
  const jitterIncline = document.getElementById('jitter-incline');
  const jitterSize = document.getElementById('jitter-size');
  const jitterMargin = document.getElementById('jitter-margin');

  // Debounced real-time render helper
  let renderTimeout;
  function triggerRender() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      if (typeof window.generateNotebook === 'function') {
        window.generateNotebook();
      }
    }, 150);
  }

  // Default text relating to user's current project (ТПР)
  textInput.value = `Теория принятия решений (ТПР) — это научная дисциплина, изучающая закономерности выбора людьми путей решения задач.

1. Метод анализа иерархий (МАИ), созданный Томасом Саати, позволяет решать многокритериальные задачи путем декомпозиции проблемы на более простые составляющие и сравнения их приоритетов.
2. Нечеткая логика (Fuzzy Logic), предложенная Лотфи Заде, оперирует понятиями степени истинности вместо строгой двоичной логики (да/нет). Это позволяет моделировать рассуждения.

Данный конспект сгенерирован автоматически в реальном времени!`;
  updateCharCount();

  // Event Listeners for UI Value Labels and Real-time Rendering
  textInput.addEventListener('input', updateCharCount);
  updateTextBtn.addEventListener('click', triggerRender);
  
  fontSizeInput.addEventListener('input', (e) => {
    fontSizeVal.textContent = `${e.target.value}px`;
    triggerRender();
  });
  lineHeightInput.addEventListener('input', (e) => {
    lineHeightVal.textContent = `${e.target.value}px`;
    triggerRender();
  });
  marginTopInput.addEventListener('input', (e) => {
    marginTopVal.textContent = `${e.target.value}px`;
    triggerRender();
  });
  marginLeftInput.addEventListener('input', (e) => {
    marginLeftVal.textContent = `${e.target.value}px`;
    triggerRender();
  });
  fontDiversityInput.addEventListener('input', (e) => {
    fontDiversityVal.textContent = `${Math.round(e.target.value * 100)}%`;
    triggerRender();
  });

  // Font upload and select handlers
  fontSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      fontUpload.click();
    } else {
      fontStatus.textContent = '';
      triggerRender();
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
      
      window.customFontFamily = fontName;
      fontStatus.className = 'status-msg success';
      fontStatus.textContent = `Шрифт успешно загружен: ${file.name}`;
      
      // Update custom option label and select it
      const customOpt = fontSelect.querySelector('option[value="custom"]');
      customOpt.textContent = `Свой шрифт: ${file.name.substring(0, 15)}...`;
      fontSelect.value = 'custom';
      triggerRender();
    } catch (err) {
      console.error(err);
      fontStatus.className = 'status-msg error';
      fontStatus.textContent = 'Ошибка загрузки шрифта. Попробуйте TTF/OTF.';
      fontSelect.value = 'lorenco';
      triggerRender();
    }
  });

  // Ink Color Selection
  colorSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      colorSwatches.forEach(s => s.classList.remove('active'));
      customColorSwatch.classList.remove('active');
      swatch.classList.add('active');
      window.activeColor = swatch.getAttribute('data-color');
      triggerRender();
    });
  });

  inkColorPicker.addEventListener('input', (e) => {
    colorSwatches.forEach(s => s.classList.remove('active'));
    customColorSwatch.classList.add('active');
    window.activeColor = e.target.value;
    triggerRender();
  });

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
    
    // Convert canvases to images and append to hidden print container
    canvases.forEach(canvas => {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/jpeg', 0.95);
      img.className = 'print-page-img';
      printContainer.appendChild(img);
    });

    window.print();
  });

  // Paper and Jitter listeners for real-time rendering
  paperSelect.addEventListener('change', triggerRender);
  jitterIncline.addEventListener('change', triggerRender);
  jitterSize.addEventListener('change', triggerRender);
  jitterMargin.addEventListener('change', triggerRender);

  // Helper: Update char count
  function updateCharCount() {
    charTotal.textContent = textInput.value.length;
  }

  // Pre-generate the default content on load once fonts are ready
  document.fonts.ready.then(() => {
    if (typeof window.generateNotebook === 'function') {
      window.generateNotebook();
    }
  });
});
