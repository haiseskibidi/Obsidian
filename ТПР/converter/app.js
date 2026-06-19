// Global state variables accessible by render.js
window.activeColor = '#1c3b88';
window.customFontFamily = null;
window.fontMap = { 'lorenco': 'Lorenco', 'abram': 'Abram', 'bad-script': 'Bad Script', 'benvolio': 'Benvolio', 'eskal': 'Eskal', 'gregory': 'Gregory', 'lazy-crazy': 'Lazy Crazy', 'merkucio': 'Merkucio', 'pag': 'Pag', 'paris': 'Paris', 'rozovii': 'Rozovii', 'salavat': 'Salavat', 'shlapak': 'Shlapak', 'stefano': 'Stefano', 'tibalt': 'Tibalt' };

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const textInput = document.getElementById('text-input'), charTotal = document.getElementById('char-total');
  const fontSelect = document.getElementById('font-select'), fontUpload = document.getElementById('font-upload'), fontStatus = document.getElementById('font-status');
  const fontSizeInput = document.getElementById('font-size'), fontSizeVal = document.getElementById('font-size-val');
  const lineHeightInput = document.getElementById('line-height'), lineHeightVal = document.getElementById('line-height-val');
  const marginTopInput = document.getElementById('margin-top'), marginTopVal = document.getElementById('margin-top-val');
  const marginLeftInput = document.getElementById('margin-left'), marginLeftVal = document.getElementById('margin-left-val');
  const fontDiversityInput = document.getElementById('font-diversity'), fontDiversityVal = document.getElementById('font-diversity-val');
  const colorSwatches = document.querySelectorAll('.color-swatch:not(.custom-color)'), customColorSwatch = document.querySelector('.color-swatch.custom-color'), inkColorPicker = document.getElementById('ink-color-picker');
  const downloadJpgBtn = document.getElementById('download-jpg-btn'), downloadPdfBtn = document.getElementById('download-pdf-btn'), pagesGallery = document.getElementById('pages-gallery'), printContainer = document.getElementById('print-container'), updateTextBtn = document.getElementById('update-text-btn');

  // Zoom Controls elements and state
  let currentScale = 0.65;
  const zoomOutBtn = document.getElementById('zoom-out-btn'), zoomInBtn = document.getElementById('zoom-in-btn'), zoomFitBtn = document.getElementById('zoom-fit-btn'), zoomLevel = document.getElementById('zoom-level');
  
  // Settings elements for real-time update
  const paperSelect = document.getElementById('paper-select');
  const jitterIncline = document.getElementById('jitter-incline');
  const jitterSize = document.getElementById('jitter-size');
  const jitterMargin = document.getElementById('jitter-margin');

  // Toggle Collapsible Cards
  const cardHeaders = document.querySelectorAll('.card-header');
  cardHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const card = header.closest('.panel-card');
      card.classList.toggle('collapsed');
    });
  });

  // Debounced real-time render helper
  let renderTimeout;
  function triggerRender(onlyFirstPage = false) {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
      if (typeof window.generateNotebook === 'function') {
        window.generateNotebook(onlyFirstPage);
      }
    }, onlyFirstPage ? 30 : 150);
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
  
  fontSizeInput.addEventListener('input', (e) => { fontSizeVal.textContent = `${e.target.value}px`; triggerRender(true); });
  fontSizeInput.addEventListener('change', () => triggerRender(false));

  lineHeightInput.addEventListener('input', (e) => { lineHeightVal.textContent = `${e.target.value}px`; triggerRender(true); });
  lineHeightInput.addEventListener('change', () => triggerRender(false));

  marginTopInput.addEventListener('input', (e) => { marginTopVal.textContent = `${e.target.value}px`; triggerRender(true); });
  marginTopInput.addEventListener('change', () => triggerRender(false));

  marginLeftInput.addEventListener('input', (e) => { marginLeftVal.textContent = `${e.target.value}px`; triggerRender(true); });
  marginLeftInput.addEventListener('change', () => triggerRender(false));

  fontDiversityInput.addEventListener('input', (e) => { fontDiversityVal.textContent = `${Math.round(e.target.value * 100)}%`; triggerRender(true); });
  fontDiversityInput.addEventListener('change', () => triggerRender(false));

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

  // Zoom Controls actions
  function updateZoom(newScale) {
    currentScale = Math.max(0.3, Math.min(1.5, newScale));
    zoomLevel.textContent = `${Math.round(currentScale * 100)}%`;
    pagesGallery.style.setProperty('--page-scale', currentScale);
  }

  zoomOutBtn.addEventListener('click', () => updateZoom(currentScale - 0.05));
  zoomInBtn.addEventListener('click', () => updateZoom(currentScale + 0.05));

  zoomFitBtn.addEventListener('click', () => {
    const wrapper = document.querySelector('.pages-gallery-wrapper');
    const canvas = pagesGallery.querySelector('canvas');
    if (wrapper) {
      const baseHeight = canvas ? (canvas.height / 2) : 928;
      const availableHeight = wrapper.clientHeight - 60; // 30px padding top + bottom
      const targetScale = Math.max(0.3, Math.min(1.5, availableHeight / baseHeight));
      updateZoom(targetScale);
    }
  });

  // Download JPG / ZIP Action
  downloadJpgBtn.addEventListener('click', async () => {
    const canvases = pagesGallery.querySelectorAll('canvas');
    if (canvases.length === 0) return;

    const originalText = downloadJpgBtn.textContent;
    downloadJpgBtn.textContent = 'Сжатие...';
    downloadJpgBtn.disabled = true;

    try {
      if (canvases.length === 1) {
        // Direct download for single page
        const dataUrl = canvases[0].toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'notebook_page_1.jpeg';
        link.click();
      } else {
        // Pack multiple pages into ZIP using JSZip
        const zip = new JSZip();
        
        for (let i = 0; i < canvases.length; i++) {
          const canvas = canvases[i];
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          const base64Data = dataUrl.split(',')[1];
          zip.file(`notebook_page_${i + 1}.jpeg`, base64Data, { base64: true });
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'notebook_pages.zip';
        link.click();
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при скачивании файлов.');
    } finally {
      downloadJpgBtn.textContent = originalText;
      downloadJpgBtn.disabled = false;
    }
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
