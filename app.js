document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'codevault-ftc-java-v1';
  const grid = document.querySelector('#codeGrid');
  const emptyState = document.querySelector('#emptyState');
  const dialog = document.querySelector('#codeDialog');
  const viewDialog = document.querySelector('#viewDialog');
  const form = document.querySelector('#codeForm');
  const codeContent = document.querySelector('#codeContent');
  const fileInput = document.querySelector('#fileInput');
  const lineNumbers = document.querySelector('#editorLineNumbers');
  
  let codes = loadCodes();
  let selectedCodeId = null;

  function loadCodes() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      let codesList = Array.isArray(stored) ? stored.filter(item => item && typeof item.code === 'string') : [];
      
      // Pre-load default starter snippets so they are visible to everyone by default
      if (codesList.length === 0) {
        codesList = [
          {
            id: 'default-1',
            title: 'BaseMecanumTeleopCode',
            category: 'OPMODE',
            tags: ['ftc', 'teleop', 'drive'],
            code: `package org.firstinspires.ftc.teamcode;\n\nimport com.qualcomm.robotcore.eventloop.opmode.LinearOpMode;\nimport com.qualcomm.robotcore.hardware.DcMotor;\n\n@TeleOp(name="Base Mecanum Teleop")\npublic class BaseMecanumTeleopCode extends LinearOpMode {\n    @Override\n    public void runOpMode() {\n        waitForStart();\n        // Add drive logic here\n    }\n}`,
            createdAt: Date.now() - 10000
          },
          {
            id: 'default-2',
            title: 'JavaCodeTemplate',
            category: 'OPMODE',
            tags: ['template', 'java'],
            code: `// 1. PACKAGE DECLARATION (Optional)\npackage com.myname.project;\n\n// 2. IMPORTS\nimport com.qualcomm.robotcore.hardware.HardwareMap;\n\n/**\n * Template for FTC OpModes\n */`,
            createdAt: Date.now() - 5000
          }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(codesList));
      }
      
      return codesList;
    } catch { return []; }
  }

  function saveCodes() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(codes)); return true; }
    catch { showToast('Could not save: browser storage may be full.'); return false; }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&', '<': '<', '>': '>', '"': '"', "'": "'" })[char]);
  }

  function javaLike(source) {
    return /\b(class|interface|enum|record|package|import|public|private|protected|static|void|extends|implements|@Override|@TeleOp|@Autonomous|LinearOpMode|OpMode|DcMotor|Servo|HardwareMap|Telemetry|Runnable|System\.out)\b/.test(source);
  }

  function render() {
    const query = document.querySelector('#searchInput').value.trim().toLowerCase();
    const sort = document.querySelector('#sortSelect').value;
    let visible = codes.filter(item => `${item.title} ${item.category} ${(item.tags || []).join(' ')} ${item.code}`.toLowerCase().includes(query));
    
    if (sort === 'newest') visible.sort((a, b) => b.createdAt - a.createdAt);
    if (sort === 'oldest') visible.sort((a, b) => a.createdAt - b.createdAt);
    if (sort === 'az') visible.sort((a, b) => a.title.localeCompare(b.title));
    
    document.querySelector('#codeCount').textContent = codes.length;
    document.querySelector('#resultCount').textContent = `(${visible.length})`;
    grid.replaceChildren();
    
    visible.forEach(item => {
      const card = document.createElement('article');
      card.className = 'code-card';
      const preview = item.code.split('\n').slice(0, 7).join('\n');
      card.innerHTML = `
        <div class="card-top">
          <span class="category-pill">${escapeHTML(item.category || 'Java')}</span>
          <button class="more-button" aria-label="Open ${escapeHTML(item.title)}">•••</button>
        </div>
        <button class="card-title">${escapeHTML(item.title)}</button>
        <div class="card-preview">
          <div class="mini-lines">${preview.split('\n').map((_, i) => `<span>${i + 1}</span>`).join('')}</div>
          <pre><code class="language-java">${escapeHTML(preview)}</code></pre>
        </div>
        <div class="card-footer">
          <div class="tag-list">${(item.tags || []).slice(0, 3).map(tag => `<span>#${escapeHTML(tag)}</span>`).join('')}</div>
          <span class="file-label">JAVA <b>·</b> ${item.code.split('\n').length} LINES</span>
        </div>`;
      card.querySelector('.card-title').addEventListener('click', () => openCode(item.id));
      card.querySelector('.more-button').addEventListener('click', () => openCode(item.id));
      grid.append(card);
    });
    
    if (window.hljs) grid.querySelectorAll('code.language-java').forEach(el => hljs.highlightElement(el));
    emptyState.classList.toggle('visible', visible.length === 0);
    grid.classList.toggle('hidden', visible.length === 0);
    
    if (codes.length === 0 && !query) {
      emptyState.querySelector('h3').textContent = 'Your code vault is ready.';
    } else if (visible.length === 0) {
      emptyState.querySelector('h3').textContent = 'No code found.';
    }
  }

  function updateEditorLines() {
    const count = codeContent.value.split('\n').length;
    lineNumbers.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
    document.querySelector('#lineCount').textContent = `${count} ${count === 1 ? 'line' : 'lines'}`;
    lineNumbers.scrollTop = codeContent.scrollTop;
  }

  function openEditor() {
    form.reset(); 
    document.querySelector('#formError').textContent = '';
    codeContent.value = ''; 
    updateEditorLines(); 
    dialog.showModal(); 
    document.querySelector('#codeTitle').focus();
  }

  function showToast(message) {
    const toast = document.querySelector('#toast'); 
    toast.textContent = message; 
    toast.classList.add('show');
    window.clearTimeout(showToast.timeout); 
    showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function openCode(id) {
    const item = codes.find(code => code.id === id); 
    if (!item) return;
    selectedCodeId = id;
    document.querySelector('#viewTitle').textContent = item.title;
    document.querySelector('#viewCategory').textContent = `${item.category || 'JAVA'} SOURCE`;
    
    const tags = document.querySelector('#viewTags'); 
    tags.replaceChildren();
    (item.tags || []).forEach(tag => { 
      const pill = document.createElement('span'); 
      pill.textContent = `#${tag}`; 
      tags.append(pill); 
    });
    
    const viewCode = document.querySelector('#viewCode');
    viewCode.innerHTML = `<div class="view-line-numbers">${item.code.split('\n').map((_, i) => `<span>${i + 1}</span>`).join('')}</div><pre><code class="language-java">${escapeHTML(item.code)}</code></pre>`;
    if (window.hljs) hljs.highlightElement(viewCode.querySelector('code'));
    
    document.querySelector('#viewDate').textContent = `SAVED ${new Date(item.createdAt).toLocaleDateString()}`;
    viewDialog.showModal();
  }

  function importFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.java')) { 
      showToast('Please choose a .java source file.'); 
      fileInput.value = ''; 
      return; 
    }
    if (file.size > 500000) { 
      showToast('That file is over 500 KB.'); 
      fileInput.value = ''; 
      return; 
    }
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || '');
      if (!javaLike(source)) { 
        showToast('This file does not look like Java source code.'); 
        return; 
      }
      codeContent.value = source; 
      updateEditorLines();
      document.querySelector('#codeTitle').value = file.name.replace(/\.java$/i, '');
      if (!dialog.open) dialog.showModal();
      document.querySelector('#codeTitle').focus();
    };
    reader.onerror = () => showToast('Could not read that file.');
    reader.readAsText(file); 
    fileInput.value = '';
  }

  // --- Event Listeners ---
  document.querySelector('#newCodeButton').addEventListener('click', openEditor);
  document.querySelector('#emptyAddButton').addEventListener('click', openEditor);
  document.querySelector('#allCodesNav').addEventListener('click', () => { 
    document.querySelector('#searchInput').value = ''; 
    render(); 
  });

  function chooseFile() { fileInput.click(); }
  document.querySelector('#uploadNav').addEventListener('click', chooseFile);
  document.querySelector('#dialogImportButton').addEventListener('click', chooseFile);
  fileInput.addEventListener('change', event => importFile(event.target.files[0]));

  document.querySelector('#searchInput').addEventListener('input', render);
  document.querySelector('#sortSelect').addEventListener('change', render);
  
  // Close dialog buttons
  document.querySelector('#cancelButton').addEventListener('click', () => dialog.close());
  dialog.querySelector('.close-button').addEventListener('click', () => dialog.close());

  codeContent.addEventListener('input', updateEditorLines);
  codeContent.addEventListener('scroll', () => { lineNumbers.scrollTop = codeContent.scrollTop; });
  codeContent.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      event.preventDefault(); 
      const start = codeContent.selectionStart; 
      const end = codeContent.selectionEnd;
      codeContent.setRangeText('    ', start, end, 'end'); 
      updateEditorLines();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const title = document.querySelector('#codeTitle').value.trim();
    const source = codeContent.value.trim();
    const error = document.querySelector('#formError');
    
    if (!title) { error.textContent = 'Give this code a name first.'; return; }
    if (!javaLike(source)) { error.textContent = 'Please enter valid Java source code.'; return; }
    
    const tags = document.querySelector('#codeTags').value.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(Boolean).slice(0, 8);
    codes.push({ 
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), 
      title, 
      category: document.querySelector('#codeCategory').value, 
      tags, 
      code: source, 
      createdAt: Date.now() 
    });
    
    if (saveCodes()) { 
      dialog.close(); 
      render(); 
      showToast('Java code saved to this browser.'); 
    }
  });

  document.querySelector('#viewClose').addEventListener('click', () => viewDialog.close());
  
  document.querySelector('#copyButton').addEventListener('click', async () => {
    const item = codes.find(code => code.id === selectedCodeId); 
    if (!item) return;
    try { 
      await navigator.clipboard.writeText(item.code); 
      showToast('Java code copied.'); 
    } catch { 
      showToast('Clipboard access is unavailable.'); 
    }
  });

  document.querySelector('#deleteButton').addEventListener('click', () => {
    if (!selectedCodeId || !window.confirm('Delete this code from your browser vault?')) return;
    codes = codes.filter(item => item.id !== selectedCodeId); 
    saveCodes(); 
    viewDialog.close(); 
    render(); 
    showToast('Code removed from vault.');
  });

  document.querySelector('#exportButton').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ format: 'codevault-ftc-java-v1', codes }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a'); 
    link.href = URL.createObjectURL(blob); 
    link.download = 'codevault-java-backup.json'; 
    link.click(); 
    URL.revokeObjectURL(link.href); 
    showToast('Vault backup downloaded.');
  });

  render();
});
