// ── READING CONTROLS ─────────────────────────────────────────────────────────
    const themeSwitch = document.getElementById('theme-switch');

    themeSwitch.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const darkModeOn = document.body.classList.contains('dark-mode');
      themeSwitch.classList.toggle('active', darkModeOn);
      themeSwitch.setAttribute('aria-pressed', String(darkModeOn));
      updateAttentionTokenColors();
      if (selectedToken) drawAttention(selectedToken);
      renderToyAttention();
      renderProbBars(Number(temperatureSlider.value));
    });

    // ── TERM TOOLTIPS ────────────────────────────────────────────────────────────
    const tooltip = document.getElementById('tooltip');
    document.querySelectorAll('.term').forEach(term => {
      term.addEventListener('mouseenter', () => {
        tooltip.textContent = term.dataset.tip;
        tooltip.style.display = 'block';
      });
      term.addEventListener('mousemove', e => {
        tooltip.style.left = Math.min(e.clientX + 14, window.innerWidth - 280) + 'px';
        tooltip.style.top = (e.clientY + 14) + 'px';
      });
      term.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    });

    // ── TOP SCROLL PROGRESS ───────────────────────────────────────────────────────
    const pTop = document.getElementById('progress-top');

    window.addEventListener('scroll', () => {
      const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      pTop.style.width = pct + '%';
    });

    // ── ACTIVE HEADER NAV ────────────────────────────────────────────────────────
    const navLinks = Array.from(document.querySelectorAll('.site-nav-link'));
    const navSections = navLinks
      .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
      .filter(item => item.section);

    function updateActiveNav() {
      const threshold = 140;
      let active = navSections[0];
      navSections.forEach(item => {
        if (item.section.getBoundingClientRect().top <= threshold) active = item;
      });
      navLinks.forEach(link => link.classList.toggle('active', link === active.link));
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('load', updateActiveNav);
    updateActiveNav();

    // ── FADE IN ON SCROLL ─────────────────────────────────────────────────────────
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // ── EMBEDDING TABLE ───────────────────────────────────────────────────────────
    const TOKENS = ['The', 'animal', 'didn\'t', 'cross', 'the', 'street', 'because', 'it', 'was', 'too', 'tired'];
    const ENC_COLORS = ['#2563eb', '#059669', '#db2777', '#d97706', '#7c3aed', '#0891b2', '#be123c', '#4f46e5', '#16a34a', '#ca8a04', '#9333ea'];
    const DARK_COLORS = ['#8ab4ff', '#6ee7b7', '#f9a8d4', '#fbbf24', '#c4b5fd', '#67e8f9', '#fda4af', '#a5b4fc', '#86efac', '#fde68a', '#d8b4fe'];

    function isDarkMode() {
      return document.body.classList.contains('dark-mode');
    }

    function vizColors() {
      return isDarkMode() ? DARK_COLORS : ENC_COLORS;
    }

    function themeText(strong = false) {
      return isDarkMode() ? (strong ? '#f5f3ff' : '#a7adba') : (strong ? '#1a1a2e' : '#6b7280');
    }
    const tbody = document.getElementById('embed-tbody');

    TOKENS.slice(0, 7).forEach((tok, i) => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'default';
      const vals = Array.from({ length: 8 }, () => ((Math.random() - 0.5) * 2).toFixed(3));
      vals[7] = '…';
      tr.innerHTML = `<td class="token-cell" style="color:${ENC_COLORS[i]}">${tok}</td>` +
        vals.map(v => {
          const a = Math.min(Math.abs(parseFloat(v) || 0), 1);
          const bg = parseFloat(v) > 0 ? `rgba(37,99,235,${0.08 + a * 0.28})` : `rgba(219,39,119,${0.08 + a * 0.24})`;
          const col = a > 0.45 ? '#1a1a2e' : '#6b7280';
          return `<td style="background:${bg};color:${col}">${v}</td>`;
        }).join('');
      tbody.appendChild(tr);
    });

    // ── ATTENTION VISUALIZATION ───────────────────────────────────────────────────
    const ATTN_TOKENS = ['The', 'animal', 'didn\'t', 'cross', 'the', 'street', 'because', 'it', 'was', 'tired'];
    const ATTN_WEIGHTS = {
      'The': [0.55, 0.10, 0.05, 0.05, 0.08, 0.05, 0.04, 0.03, 0.03, 0.02],
      'animal': [0.08, 0.50, 0.07, 0.07, 0.06, 0.06, 0.05, 0.05, 0.03, 0.03],
      'didn\'t': [0.05, 0.08, 0.48, 0.12, 0.06, 0.06, 0.05, 0.05, 0.03, 0.02],
      'cross': [0.04, 0.06, 0.10, 0.46, 0.07, 0.08, 0.07, 0.06, 0.04, 0.02],
      'the': [0.06, 0.05, 0.05, 0.08, 0.44, 0.14, 0.06, 0.05, 0.04, 0.03],
      'street': [0.03, 0.05, 0.05, 0.09, 0.12, 0.42, 0.08, 0.05, 0.07, 0.04],
      'because': [0.03, 0.08, 0.06, 0.05, 0.04, 0.06, 0.46, 0.10, 0.07, 0.05],
      'it': [0.02, 0.38, 0.05, 0.05, 0.04, 0.08, 0.12, 0.14, 0.08, 0.04],
      'was': [0.03, 0.12, 0.05, 0.04, 0.04, 0.06, 0.10, 0.14, 0.32, 0.10],
      'tired': [0.02, 0.10, 0.04, 0.03, 0.03, 0.05, 0.08, 0.16, 0.18, 0.31],
    };

    const tokContainer = document.getElementById('attn-tokens');
    const canvas = document.getElementById('attn-canvas');
    const ctx = canvas.getContext('2d');
    let selectedToken = null;

    ATTN_TOKENS.forEach((tok, i) => {
      const span = document.createElement('span');
      span.className = 'attn-token';
      span.textContent = tok;
      span.style.background = ENC_COLORS[i] + '18';
      span.style.color = ENC_COLORS[i];
      span.dataset.idx = i;
      span.dataset.tok = tok;
      span.onclick = () => {
        document.querySelectorAll('.attn-token').forEach(s => s.classList.remove('selected'));
        span.classList.add('selected');
        selectedToken = tok;
        drawAttention(tok);
        document.getElementById('attn-instruction').textContent = `"${tok}" attends to these words (darker = stronger attention)`;
      };
      tokContainer.appendChild(span);
    });

    function updateAttentionTokenColors() {
      document.querySelectorAll('.attn-token').forEach((span, i) => {
        const colors = vizColors();
        span.style.background = colors[i] + (isDarkMode() ? '26' : '18');
        span.style.color = colors[i];
      });
    }

    updateAttentionTokenColors();

    function drawAttention(tok) {
      const weights = ATTN_WEIGHTS[tok];
      const colors = vizColors();
      const w = canvas.offsetWidth;
      const h = 160;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, w, h);

      const n = ATTN_TOKENS.length;
      const spacing = w / (n + 1);

      // draw connection lines first
      const srcIdx = ATTN_TOKENS.indexOf(tok);
      const srcX = spacing * (srcIdx + 1);

      weights.forEach((wt, j) => {
        if (wt < 0.04) return;
        const tgtX = spacing * (j + 1);
        ctx.beginPath();
        ctx.moveTo(srcX, 28);
        ctx.bezierCurveTo(srcX, 80, tgtX, 80, tgtX, 132);
        ctx.strokeStyle = isDarkMode() ? `rgba(138,180,255,${0.18 + wt * 1.15})` : `rgba(37,99,235,${0.16 + wt * 1.15})`;
        ctx.lineWidth = wt * 9 + 0.8;
        ctx.stroke();
      });

      // draw token labels
      ATTN_TOKENS.forEach((t, i) => {
        const x = spacing * (i + 1);
        const wt = weights[i];

        // top
        ctx.beginPath();
        ctx.arc(x, 26, 10 + wt * 8, 0, Math.PI * 2);
        ctx.fillStyle = colors[i] + (i === srcIdx ? 'ee' : '55');
        ctx.fill();
        ctx.fillStyle = themeText(true);
        ctx.font = `${wt > 0.1 ? 'bold' : 'normal'} 11px var(--sans)`;
        ctx.textAlign = 'center';
        ctx.fillText(t, x, 60);

        // bottom
        ctx.beginPath();
        ctx.arc(x, 134, 10 + wt * 8, 0, Math.PI * 2);
        ctx.fillStyle = colors[i] + (wt > 0.15 ? 'ee' : '55');
        ctx.fill();
        ctx.font = `${wt > 0.1 ? 'bold' : 'normal'} 11px var(--sans)`;
        ctx.fillStyle = wt > 0.1 ? themeText(true) : themeText(false);
        ctx.fillText(`${(wt * 100).toFixed(0)}%`, x, 158);
      });
    }

    // ── TOY ATTENTION MATRIX ─────────────────────────────────────────────────────
    const toySentence = document.getElementById('toy-sentence');
    const toyAttnBtn = document.getElementById('toy-attn-btn');
    const toyAttnMatrix = document.getElementById('toy-attn-matrix');

    function renderToyAttention() {
      const words = toySentence.value.trim().split(/\s+/).filter(Boolean).slice(0, 8);
      if (!words.length) return;
      toyAttnMatrix.innerHTML = '';
      toyAttnMatrix.style.gridTemplateColumns = `repeat(${words.length + 1}, minmax(42px, 1fr))`;

      toyAttnMatrix.appendChild(matrixCell('', true));
      words.forEach(w => toyAttnMatrix.appendChild(matrixCell(w.slice(0, 6), true)));

      words.forEach((rowWord, i) => {
        toyAttnMatrix.appendChild(matrixCell(rowWord.slice(0, 6), true));
        const raw = words.map((colWord, j) => {
          const distanceBoost = 1 / (Math.abs(i - j) + 1);
          const sameWordBoost = rowWord.toLowerCase() === colWord.toLowerCase() ? 0.8 : 0;
          return distanceBoost + sameWordBoost + 0.05;
        });
        const sum = raw.reduce((a, b) => a + b, 0);
        raw.forEach(score => {
          const weight = score / sum;
          const cell = matrixCell(Math.round(weight * 100) + '%', false);
          cell.style.background = isDarkMode()
            ? `rgba(122,167,255,${0.14 + weight * 1.15})`
            : `rgba(37,99,235,${0.08 + weight * 1.25})`;
          cell.style.color = weight > 0.22 ? themeText(true) : themeText(false);
          toyAttnMatrix.appendChild(cell);
        });
      });
    }

    function matrixCell(text, isLabel) {
      const cell = document.createElement('div');
      cell.className = 'mini-cell' + (isLabel ? ' label' : '');
      cell.textContent = text;
      return cell;
    }

    toyAttnBtn.addEventListener('click', renderToyAttention);
    toySentence.addEventListener('keydown', e => {
      if (e.key === 'Enter') renderToyAttention();
    });
    renderToyAttention();

    // ── MULTI-HEAD ────────────────────────────────────────────────────────────────
    const HEAD_ROLES = [
      { num: 'H1', role: 'syntactic', desc: 'Tracks syntactic dependencies — subject-verb, noun-adjective agreement. Notices "animal" is the subject of "cross".' },
      { num: 'H2', role: 'coreference', desc: 'Resolves pronouns. This head is why "it" strongly attends to "animal" rather than "street".' },
      { num: 'H3', role: 'semantic', desc: 'Groups semantically related words — synonyms, antonyms, and words that co-occur in similar contexts.' },
      { num: 'H4', role: 'positional', desc: 'Tracks relative positions — attends to nearby tokens. Useful for local phrase structure.' },
      { num: 'H5', role: 'entity', desc: 'Focuses on named entities and noun phrases — groups "the animal" as a unit.' },
      { num: 'H6', role: 'causal', desc: 'Tracks cause-effect relationships — "because" connecting the two clauses.' },
      { num: 'H7', role: 'subject', desc: 'Subject tracking — keeps track of what the sentence is "about" throughout the sequence.' },
      { num: 'H8', role: 'long-range', desc: 'Long-range dependencies — connects distant related tokens across the full sequence.' },
    ];

    const headsGrid = document.getElementById('heads-grid');
    const headDesc = document.getElementById('head-desc');

    HEAD_ROLES.forEach((h, i) => {
      const card = document.createElement('div');
      card.className = 'head-card';
      card.innerHTML = `<div class="head-num">${h.num}</div><div class="head-role">${h.role}</div>`;
      card.onclick = () => {
        document.querySelectorAll('.head-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        headDesc.innerHTML = `<strong style="color:var(--enc)">${h.num} — ${h.role}:</strong> ${h.desc}`;
      };
      headsGrid.appendChild(card);
    });

    // ── CAUSAL MASK ───────────────────────────────────────────────────────────────
    const maskEl = document.getElementById('causal-mask');
    const MASK_N = 5;
    const MASK_TOKS = ['t₀', 't₁', 't₂', 't₃', 't₄'];
    for (let i = 0; i < MASK_N; i++) {
      for (let j = 0; j < MASK_N; j++) {
        const cell = document.createElement('div');
        cell.className = 'mask-cell ' + (j <= i ? 'allow' : 'block');
        cell.textContent = j <= i ? '✓' : '−∞';
        cell.title = j <= i ? `t${i} can attend to t${j}` : `t${i} cannot see t${j} (future)`;
        maskEl.appendChild(cell);
      }
    }

    // ── PROBABILITY BARS ──────────────────────────────────────────────────────────
    const PROBS = [
      { word: 'street', p: 0.04, color: '#c2436a' },
      { word: 'because', p: 0.05, color: '#b45309' },
      { word: 'it', p: 0.07, color: '#7c3aed' },
      { word: 'because', p: 0.03, color: '#0891b2' },
      { word: 'didn\'t', p: 0.72, color: '#2d9e6b' },
      { word: '…', p: 0.09, color: '#d1d5db' },
    ];
    // best prob is actually for "didn't cross" → let's use cleaner
    const PROBS2 = [
      { word: 'cross', p: 0.72, color: '#059669', darkColor: '#6ee7b7' },
      { word: 'move', p: 0.08, color: '#2563eb', darkColor: '#8ab4ff' },
      { word: 'go', p: 0.06, color: '#7c3aed', darkColor: '#c4b5fd' },
      { word: 'jump', p: 0.05, color: '#d97706', darkColor: '#fbbf24' },
      { word: 'run', p: 0.04, color: '#db2777', darkColor: '#f9a8d4' },
      { word: '…', p: 0.05, color: '#9ca3af', darkColor: '#a7adba' },
    ];

    const probBars = document.getElementById('prob-bars');
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');

    function renderProbBars(temp = 1) {
      probBars.innerHTML = '';
      temperatureValue.textContent = Number(temp).toFixed(1);
      const adjusted = PROBS2.map(item => ({ ...item, score: Math.pow(item.p, 1 / temp) }));
      const total = adjusted.reduce((sum, item) => sum + item.score, 0);
      adjusted.forEach(({ word, score, color, darkColor }) => {
        const p = score / total;
        const barColor = isDarkMode() ? darkColor : color;
        const mutedColor = isDarkMode() ? '#a7adba' : '#6b7280';
        const col = document.createElement('div');
        col.className = 'prob-col';
        col.innerHTML = `
      <div class="prob-pct" style="color:${barColor};font-size:10px">${(p * 100).toFixed(0)}%</div>
      <div class="prob-bar" style="height:${Math.max(p * 90, 4)}px;background:${barColor};opacity:${p > 0.25 ? 1 : 0.7}"></div>
      <div class="prob-word" style="color:${p > 0.25 ? barColor : mutedColor}">${word}</div>
    `;
        probBars.appendChild(col);
      });
    }

    temperatureSlider.addEventListener('input', e => renderProbBars(Number(e.target.value)));
    renderProbBars(Number(temperatureSlider.value));

    // ── SUMMARY TABLE ──────────────────────────────────────────────────────────────
    const STEPS = [
      { step: '1', section: 'enc', name: 'Tokenization & embeddings', eq: 'E = EmbeddingMatrix[token_ids]', complexity: 'O(vocab × d)' },
      { step: '2', section: 'enc', name: 'Positional encoding', eq: 'PE(pos,2i) = sin(pos/10000^(2i/d))', complexity: 'O(n × d), no params' },
      { step: '3', section: 'enc', name: 'Generate Q, K, V', eq: 'Q=X·Wᵠ  K=X·Wᴷ  V=X·Wᵛ', complexity: 'O(n × d²)' },
      { step: '4', section: 'enc', name: 'Scaled dot-product attn', eq: 'softmax(QKᵀ/√d_k)·V', complexity: 'O(n² · d_k)' },
      { step: '5', section: 'enc', name: 'Multi-head attention', eq: 'Concat(head₁…headₕ)·Wᴼ', complexity: 'O(n²·d_model)' },
      { step: '6', section: 'enc', name: 'FFN + residuals + LayerNorm', eq: 'LayerNorm(x + max(0,xW₁+b₁)W₂+b₂)', complexity: 'O(n · d²)' },
      { step: '7a', section: 'dec', name: 'Masked self-attention', eq: 'softmax((QKᵀ+M)/√d_k)·V', complexity: 'O(n²·d), causal' },
      { step: '7b', section: 'dec', name: 'Cross-attention', eq: 'Attn(Q_dec, K_enc, V_enc)', complexity: 'O(n_src·n_tgt·d)' },
      { step: '8', section: 'out', name: 'Output probabilities', eq: 'softmax(hidden·Wᵒᵘᵗ)', complexity: 'O(d × vocab)' },
    ];

    const SECTION_COLORS = { enc: '#3b6fd4', dec: '#c2436a', out: '#2d9e6b' };
    const SECTION_BG = { enc: '#eef3fd', dec: '#fceef3', out: '#edf9f3' };
    const summaryTbody = document.getElementById('summary-tbody');
    STEPS.forEach(s => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid #f0ede8';
      tr.innerHTML = `
    <td style="padding:10px 12px">
      <span style="color:${SECTION_COLORS[s.section]};font-family:var(--mono);font-size:12px;font-weight:700;">${s.step}</span>
    </td>
    <td style="padding:10px 12px;font-weight:600;color:#1a1a2e">${s.name}</td>
    <td style="padding:10px 12px;font-family:var(--mono);font-size:12px;color:${SECTION_COLORS[s.section]}">${s.eq}</td>
    <td style="padding:10px 12px;font-family:var(--mono);font-size:12px;color:var(--muted)">${s.complexity}</td>
  `;
      summaryTbody.appendChild(tr);
    });

    // ── RESIZE CANVAS ON LOAD ──────────────────────────────────────────────────────
    window.addEventListener('load', () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = 160 * window.devicePixelRatio;
      }
    });

    // ── BACK TO TOP BUTTON ────────────────────────────────────────────────────────
    const backToTopBtn = document.getElementById('back-to-top');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('show');
      } else {
        backToTopBtn.classList.remove('show');
      }
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
