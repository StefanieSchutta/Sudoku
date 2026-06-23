'use strict';

// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
const DIFF_CONFIG = {
  easy:   { label: 'Easy',   removes: 36, unique: false },
  medium: { label: 'Medium', removes: 46, unique: false },
  hard:   { label: 'Hard',   removes: 51, unique: true  },
  expert: { label: 'Expert', removes: 56, unique: true  },
};

const MAX_MISTAKES = 3;

// ─────────────────────────────────────────────────────────
// TIPS DATA
// ─────────────────────────────────────────────────────────
const TIPS = [
  {
    title: 'Scanning',
    level: 'Beginner',
    desc: `Begin every puzzle by scanning the whole grid. Look at rows, columns, and 3×3 boxes that already have many numbers filled in — the remaining cells have fewer options. When a number appears in two rows of a band, it must land in the third row, and only where the column allows it. A few passes of scanning can fill in a surprising number of cells right away.`,
  },
  {
    title: 'Naked Single',
    level: 'Beginner',
    desc: `The simplest technique: a cell where only one number is possible. Check every empty cell — if eight of the nine digits already appear in its row, column, or box, the missing one must go there. These are "forced" placements, no guessing needed. Enable pencil notes to track candidates and naked singles will jump out at you.`,
  },
  {
    title: 'Hidden Single',
    level: 'Beginner',
    desc: `Within a row, column, or 3×3 box, if a number can only fit in one cell, place it — even if that cell still has other candidates. The key question to ask is: "Where can this number go in this row / column / box?" If there's only one answer, fill it in. This is often easier to spot by scanning one number at a time across the grid.`,
  },
  {
    title: 'Naked Pair',
    level: 'Intermediate',
    desc: `When two cells in the same row, column, or box each contain exactly the same two candidates — and nothing else — those two numbers must go in those two cells (in some order). Neither number can appear anywhere else in that unit, so you can eliminate them as candidates from all other cells. Look for pairs where both cells have exactly two matching pencil marks.`,
  },
  {
    title: 'Hidden Pair',
    level: 'Intermediate',
    desc: `The mirror of a naked pair. When two numbers can only be placed in the same two cells within a row, column, or box, those cells must hold those numbers. You can then erase all other candidates from those two cells. Hidden pairs are trickier to see — scan each unit asking "does this number appear as a candidate in exactly two cells?"`,
  },
  {
    title: 'Pointing Pairs / Triples',
    level: 'Intermediate',
    desc: `When all candidates for a number within a 3×3 box fall in the same row or column, that number cannot appear in that row or column outside the box. It's "pointing" to the rest of the line. Eliminate the number from every other cell in that row or column. This is one of the most useful techniques for medium and hard puzzles.`,
  },
  {
    title: 'Box-Line Reduction',
    level: 'Intermediate',
    desc: `The reverse of pointing pairs: if all candidates for a number in a row or column fall within a single 3×3 box, that number cannot appear in any other cell of that box. Cross out the number from the rest of the box. Together, pointing pairs and box-line reduction form a powerful pair of techniques worth checking after every placement.`,
  },
  {
    title: 'Naked Triple',
    level: 'Advanced',
    desc: `Three cells in the same unit that together hold exactly three candidates (each cell may have two or three of those candidates) form a naked triple. Those three numbers must go in those three cells, so they can be eliminated from every other cell in the unit. Common patterns: {1,2}, {2,3}, {1,3} — or {1,2,3}, {1,2}, {2,3}.`,
  },
  {
    title: 'X-Wing',
    level: 'Advanced',
    desc: `If a number appears as a candidate in exactly two cells in each of two rows, and those cells line up in the same two columns, the number can be eliminated from all other cells in those two columns. Picture an "X" connecting the four cells. The logic: the number must go in one of two diagonal pairs, so the columns are "used up" for that number. Works identically with rows and columns swapped.`,
  },
  {
    title: 'Swordfish',
    level: 'Expert',
    desc: `An extension of X-Wing across three rows and three columns. If a number's candidates in three rows are all confined to the same three columns (each row having 2–3 of those columns), the number can be eliminated from those three columns in all other rows. Swordfish is rare but decisive in the hardest puzzles. Start by identifying numbers with very few candidates in the grid.`,
  },
];

// ─────────────────────────────────────────────────────────
// SUDOKU CORE — generator & solver
// ─────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cloneBoard(b) { return b.map(r => [...r]); }

function canPlace(b, r, c, n) {
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    if (b[r][i] === n || b[i][c] === n) return false;
  }
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      if (b[br + dr][bc + dc] === n) return false;
    }
  }
  return true;
}

function generateSolution() {
  const b = Array.from({length: 9}, () => Array(9).fill(0));

  function fill(pos) {
    if (pos === 81) return true;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    const nums = shuffle([1,2,3,4,5,6,7,8,9]);
    for (const n of nums) {
      if (canPlace(b, r, c, n)) {
        b[r][c] = n;
        if (fill(pos + 1)) return true;
        b[r][c] = 0;
      }
    }
    return false;
  }

  fill(0);
  return b;
}

function countSolutions(board, limit = 2) {
  const b = cloneBoard(board);
  let count = 0;

  function bt() {
    if (count >= limit) return;
    let r = -1, c = -1;
    outer: for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (b[i][j] === 0) { r = i; c = j; break outer; }
      }
    }
    if (r === -1) { count++; return; }
    for (let n = 1; n <= 9; n++) {
      if (count >= limit) return;
      if (canPlace(b, r, c, n)) {
        b[r][c] = n;
        bt();
        b[r][c] = 0;
      }
    }
  }

  bt();
  return count;
}

function makePuzzle(solution, difficulty) {
  const { removes, unique } = DIFF_CONFIG[difficulty];
  const puzzle = cloneBoard(solution);
  const positions = shuffle(Array.from({length: 81}, (_, i) => i));

  let removed = 0;
  for (const pos of positions) {
    if (removed >= removes) break;
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;

    if (unique && countSolutions(puzzle) !== 1) {
      puzzle[r][c] = backup;
    } else {
      removed++;
    }
  }

  return puzzle;
}

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
const state = {
  solution:      null,
  puzzle:        null,
  board:         null,
  given:         null,
  notes:         null,
  selected:      null,
  difficulty:    'easy',
  history:       [],
  mistakes:      0,
  noteMode:      false,
  timer:         0,
  timerInterval: null,
  started:       false,
  completed:     false,
};

// ─────────────────────────────────────────────────────────
// GAME CONTROL
// ─────────────────────────────────────────────────────────
function newGame(difficulty) {
  if (difficulty) state.difficulty = difficulty;

  stopTimer();

  const solution = generateSolution();
  const puzzle   = makePuzzle(solution, state.difficulty);

  state.solution  = solution;
  state.puzzle    = puzzle;
  state.board     = cloneBoard(puzzle);
  state.given     = puzzle.map(row => row.map(n => n !== 0));
  state.notes     = Array.from({length: 9}, () =>
                      Array.from({length: 9}, () => new Set()));
  state.selected  = null;
  state.history   = [];
  state.mistakes  = 0;
  state.noteMode  = false;
  state.timer     = 0;
  state.started   = false;
  state.completed = false;

  const notesBtn = document.getElementById('btn-notes');
  notesBtn.setAttribute('aria-pressed', 'false');
  notesBtn.classList.remove('is-active');

  hideModals();
  render();
  updateStats();
}

function pushHistory() {
  state.history.push({
    board:    cloneBoard(state.board),
    notes:    state.notes.map(row => row.map(s => new Set(s))),
    mistakes: state.mistakes,
  });
  if (state.history.length > 100) state.history.shift();
}

function undo() {
  if (!state.history.length) return;
  const prev      = state.history.pop();
  state.board     = prev.board;
  state.notes     = prev.notes;
  state.mistakes  = prev.mistakes;
  render();
  updateStats();
}

function inputNumber(num) {
  if (!state.selected || state.completed) return;
  const {r, c} = state.selected;
  if (state.given[r][c]) return;

  if (!state.started) { state.started = true; startTimer(); }

  if (state.noteMode) {
    if (state.board[r][c] !== 0) return;
    pushHistory();
    const notes = state.notes[r][c];
    if (notes.has(num)) notes.delete(num); else notes.add(num);
  } else {
    if (state.board[r][c] === num) {
      pushHistory();
      state.board[r][c] = 0;
    } else {
      pushHistory();
      state.board[r][c] = num;

      if (num !== state.solution[r][c]) {
        state.mistakes++;
        if (state.mistakes >= MAX_MISTAKES) {
          stopTimer();
          render(); updateStats();
          showGameOver();
          return;
        }
      } else {
        clearRelatedNotes(r, c, num);
      }

      if (isBoardComplete()) {
        stopTimer();
        state.completed = true;
        render();
        showWin();
        return;
      }
    }
  }

  render();
  updateStats();
}

function clearRelatedNotes(r, c, num) {
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    state.notes[r][i].delete(num);
    state.notes[i][c].delete(num);
  }
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      state.notes[br + dr][bc + dc].delete(num);
    }
  }
}

function erase() {
  if (!state.selected || state.completed) return;
  const {r, c} = state.selected;
  if (state.given[r][c]) return;
  pushHistory();
  state.board[r][c] = 0;
  state.notes[r][c].clear();
  render();
}

function hint() {
  if (state.completed) return;

  const candidates = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!state.given[r][c] && state.board[r][c] !== state.solution[r][c]) {
        candidates.push({r, c});
      }
    }
  }
  if (!candidates.length) return;

  if (!state.started) { state.started = true; startTimer(); }
  pushHistory();

  let target = null;
  if (state.selected) {
    const {r, c} = state.selected;
    if (!state.given[r][c] && state.board[r][c] !== state.solution[r][c]) target = {r, c};
  }
  if (!target) target = candidates[Math.floor(Math.random() * candidates.length)];

  const {r, c} = target;
  state.board[r][c] = state.solution[r][c];
  state.notes[r][c].clear();
  clearRelatedNotes(r, c, state.solution[r][c]);

  if (isBoardComplete()) {
    stopTimer();
    state.completed = true;
    render();
    showWin();
    return;
  }

  render();

  // Flash the revealed cell
  requestAnimationFrame(() => {
    const el = getCellEl(r, c);
    if (el) {
      el.classList.add('cell--hint-flash');
      setTimeout(() => el.classList.remove('cell--hint-flash'), 600);
    }
  });
}

function isBoardComplete() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (state.board[r][c] !== state.solution[r][c]) return false;
    }
  }
  return true;
}

// ─────────────────────────────────────────────────────────
// TIMER
// ─────────────────────────────────────────────────────────
function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timer++;
    document.getElementById('timer-display').textContent = formatTime(state.timer);
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
}

function formatTime(s) {
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
}

// ─────────────────────────────────────────────────────────
// RENDERING
// ─────────────────────────────────────────────────────────
function initBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('data-r', r);
      cell.setAttribute('data-c', c);
      cell.setAttribute('tabindex', '0');

      // Note grid (3×3 mini grid inside cell)
      const noteGrid = document.createElement('div');
      noteGrid.className = 'note-grid';
      for (let n = 1; n <= 9; n++) {
        const span = document.createElement('span');
        span.className = 'note-num';
        span.setAttribute('data-note', n);
        noteGrid.appendChild(span);
      }
      cell.appendChild(noteGrid);

      // Number display
      const numEl = document.createElement('span');
      numEl.className = 'cell-num';
      cell.appendChild(numEl);

      cell.addEventListener('click', () => { state.selected = {r, c}; render(); });
      cell.addEventListener('keydown', onCellKey);

      board.appendChild(cell);
    }
  }
}

function getCellEl(r, c) {
  return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function render() {
  if (!state.board) return;

  const {r: sr, c: sc} = state.selected || {r: -1, c: -1};
  const selectedVal = (sr >= 0 && sc >= 0) ? state.board[sr][sc] : 0;
  const selBoxR = sr >= 0 ? Math.floor(sr / 3) * 3 : -1;
  const selBoxC = sc >= 0 ? Math.floor(sc / 3) * 3 : -1;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = getCellEl(r, c);
      if (!cell) continue;

      const val     = state.board[r][c];
      const isGiven = state.given[r][c];
      const isError = !isGiven && val !== 0 && val !== state.solution[r][c];
      const isSel   = r === sr && c === sc;
      const isRelated = sr >= 0 && (
        r === sr || c === sc ||
        (Math.floor(r / 3) * 3 === selBoxR && Math.floor(c / 3) * 3 === selBoxC)
      );
      const isSameNum = selectedVal !== 0 && val === selectedVal && !isSel;

      // Update class list (preserves data-* attrs, only touches className)
      const classes = ['cell'];
      if (isGiven)   classes.push('cell--given');
      if (isSel)     classes.push('cell--selected');
      else if (isSameNum)  classes.push('cell--same-num');
      else if (isRelated)  classes.push('cell--related');
      if (isError)   classes.push('cell--error');
      if (state.completed) classes.push('cell--complete');
      cell.className = classes.join(' ');

      // Number
      const numEl   = cell.querySelector('.cell-num');
      const noteGrid = cell.querySelector('.note-grid');
      const notes   = state.notes[r][c];
      const hasNotes = val === 0 && notes.size > 0;

      numEl.textContent    = val !== 0 ? val : '';
      numEl.style.display  = hasNotes ? 'none' : '';
      noteGrid.style.display = hasNotes ? 'grid' : 'none';

      if (hasNotes) {
        noteGrid.querySelectorAll('.note-num').forEach(el => {
          const n = +el.getAttribute('data-note');
          el.textContent = notes.has(n) ? n : '';
        });
      }

      cell.setAttribute('aria-label',
        `Row ${r + 1}, column ${c + 1}: ${val || 'empty'}${isGiven ? ' (given)' : ''}`);
      cell.setAttribute('aria-selected', isSel);
    }
  }
}

function updateStats() {
  document.getElementById('mistakes-display').textContent = `${state.mistakes} / ${MAX_MISTAKES}`;
  document.getElementById('timer-display').textContent    = formatTime(state.timer);
}

// ─────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────
function showWin() {
  document.getElementById('win-diff').textContent     = DIFF_CONFIG[state.difficulty].label;
  document.getElementById('win-time').textContent     = formatTime(state.timer);
  document.getElementById('win-mistakes').textContent = state.mistakes;
  const overlay = document.getElementById('win-overlay');
  overlay.removeAttribute('hidden');
  overlay.querySelector('button').focus();
}

function showGameOver() {
  const overlay = document.getElementById('gameover-overlay');
  overlay.removeAttribute('hidden');
  overlay.querySelector('button').focus();
}

function hideModals() {
  document.getElementById('win-overlay').setAttribute('hidden', '');
  document.getElementById('gameover-overlay').setAttribute('hidden', '');
}

// ─────────────────────────────────────────────────────────
// TIPS
// ─────────────────────────────────────────────────────────
const LEVEL_CLASS = {
  'Beginner':     'level--beginner',
  'Intermediate': 'level--intermediate',
  'Advanced':     'level--advanced',
  'Expert':       'level--expert',
};

function initTips() {
  const list = document.getElementById('tips-list');

  TIPS.forEach((tip, i) => {
    const bodyId = `tip-body-${i}`;
    const item = document.createElement('div');
    item.className = 'tip-item';

    const btn = document.createElement('button');
    btn.className = 'tip-header';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', bodyId);
    btn.innerHTML =
      `<span class="tip-title">${tip.title}</span>` +
      `<span class="tip-level ${LEVEL_CLASS[tip.level] || ''}">${tip.level}</span>` +
      `<svg class="tip-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

    const body = document.createElement('div');
    body.className = 'tip-body';
    body.id = bodyId;
    body.setAttribute('hidden', '');
    body.innerHTML = `<p>${tip.desc}</p>`;

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      if (open) body.setAttribute('hidden', ''); else body.removeAttribute('hidden');
      item.classList.toggle('tip-item--open', !open);
    });

    item.append(btn, body);
    list.appendChild(item);
  });

  document.getElementById('tips-toggle').addEventListener('click', function () {
    const open = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', !open);
    const body = document.getElementById('tips-body');
    if (open) body.setAttribute('hidden', ''); else body.removeAttribute('hidden');
    this.classList.toggle('is-open', !open);
  });
}

// ─────────────────────────────────────────────────────────
// NUM PAD
// ─────────────────────────────────────────────────────────
function initNumpad() {
  const pad = document.getElementById('numpad');
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.className = 'num-btn';
    btn.textContent = n;
    btn.setAttribute('aria-label', `Place ${n}`);
    btn.addEventListener('click', () => inputNumber(n));
    pad.appendChild(btn);
  }
}

// ─────────────────────────────────────────────────────────
// KEYBOARD
// ─────────────────────────────────────────────────────────
function onKeyDown(e) {
  if (!state.board || e.ctrlKey || e.metaKey) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); }
    return;
  }

  const { key } = e;

  if (key >= '1' && key <= '9') { inputNumber(+key); return; }
  if (key === 'Backspace' || key === 'Delete' || key === '0') { erase(); return; }
  if (key === 'n' || key === 'N') { toggleNotes(); return; }
  if (key === 'h' || key === 'H') { hint(); return; }

  const DIRS = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
  if (DIRS[key]) {
    e.preventDefault();
    const [dr, dc] = DIRS[key];
    const {r = 0, c = 0} = state.selected || {};
    const nr = (r + dr + 9) % 9;
    const nc = (c + dc + 9) % 9;
    state.selected = {r: nr, c: nc};
    render();
    getCellEl(nr, nc)?.focus();
  }
}

function onCellKey(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const r = +e.currentTarget.getAttribute('data-r');
    const c = +e.currentTarget.getAttribute('data-c');
    state.selected = {r, c};
    render();
  }
}

function toggleNotes() {
  state.noteMode = !state.noteMode;
  const btn = document.getElementById('btn-notes');
  btn.setAttribute('aria-pressed', state.noteMode);
  btn.classList.toggle('is-active', state.noteMode);
}

// ─────────────────────────────────────────────────────────
// PWA — service worker registration
// ─────────────────────────────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () =>
      navigator.serviceWorker.register('sw.js').catch(() => {})
    );
  }
}

// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
function init() {
  initBoard();
  initNumpad();
  initTips();

  // Difficulty buttons
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      newGame(btn.getAttribute('data-diff'));
    });
  });

  // Control buttons
  document.getElementById('btn-undo').addEventListener('click', undo);
  document.getElementById('btn-erase').addEventListener('click', erase);
  document.getElementById('btn-notes').addEventListener('click', toggleNotes);
  document.getElementById('btn-hint').addEventListener('click', hint);
  document.getElementById('btn-new-game').addEventListener('click', () => newGame());
  document.getElementById('btn-play-again').addEventListener('click', () => newGame());
  document.getElementById('btn-retry').addEventListener('click', () => newGame());

  // Keyboard
  document.addEventListener('keydown', onKeyDown);

  // Close modals on overlay click
  ['win-overlay', 'gameover-overlay'].forEach(id => {
    document.getElementById(id).addEventListener('click', function (e) {
      if (e.target === this) hideModals();
    });
  });

  registerSW();

  // Support ?diff=easy|medium|hard|expert shortcut (manifest shortcuts)
  const urlDiff = new URLSearchParams(location.search).get('diff');
  const startDiff = DIFF_CONFIG[urlDiff] ? urlDiff : 'easy';
  if (startDiff !== 'easy') {
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-diff') === startDiff);
    });
  }
  newGame(startDiff);
}

document.addEventListener('DOMContentLoaded', init);
