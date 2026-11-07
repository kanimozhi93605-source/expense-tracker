/* =========================================================
   SpendWise – Personal Expense Tracker
   Plain JavaScript, no frameworks. Data lives in LocalStorage.

   Sections
   1. Constants and icons
   2. State and storage
   3. Helper functions (money, dates, text)
   4. Calculations
   5. UI helpers (toast, confirm dialog, charts)
   6. Page renderers
   7. Add / edit form
   8. Events and start-up
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. CONSTANTS AND ICONS
     --------------------------------------------------------- */
  const STORAGE_KEY = 'spendwise.v1';
  const MAX_AMOUNT = 999999999.99;

  const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Travel', 'Education', 'Bills', 'Entertainment', 'Healthcare', 'Other'];
  const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other'];
  const ALL_CATEGORIES = ['Food', 'Shopping', 'Travel', 'Education', 'Bills', 'Entertainment', 'Healthcare', 'Salary', 'Freelance', 'Other'];
  const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Other'];

  // Colour + icon used for every category
  const CATEGORY_STYLE = {
    Food:          { color: '#f59e0b', icon: 'coffee' },
    Shopping:      { color: '#ec4899', icon: 'bag' },
    Travel:        { color: '#06b6d4', icon: 'pin' },
    Education:     { color: '#3b82f6', icon: 'book' },
    Bills:         { color: '#ef4444', icon: 'file' },
    Entertainment: { color: '#8b5cf6', icon: 'film' },
    Healthcare:    { color: '#14b8a6', icon: 'heart' },
    Salary:        { color: '#10b981', icon: 'briefcase' },
    Freelance:     { color: '#84cc16', icon: 'monitor' },
    Other:         { color: '#94a3b8', icon: 'more' }
  };

  const CURRENCIES = {
    INR: { locale: 'en-IN', label: '₹  Indian Rupee (INR)' },
    USD: { locale: 'en-US', label: '$  US Dollar (USD)' },
    EUR: { locale: 'en-IE', label: '€  Euro (EUR)' },
    GBP: { locale: 'en-GB', label: '£  British Pound (GBP)' },
    AUD: { locale: 'en-AU', label: 'A$  Australian Dollar (AUD)' },
    CAD: { locale: 'en-CA', label: 'C$  Canadian Dollar (CAD)' }
  };

  const PAGES = {
    dashboard: 'Dashboard',
    add: 'Add Transaction',
    history: 'Transaction History',
    budget: 'Budget',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };

  // Feather-style line icons (inner SVG markup only)
  const ICON_PATHS = {
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    'plus-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    'bar-chart': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    sliders: '<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>',
    menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
    'trending-up': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    'trending-down': '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
    coffee: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    film: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    more: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'
  };

  /* ---------------------------------------------------------
     2. STATE AND STORAGE
     --------------------------------------------------------- */
  let state = loadState();         // transactions, budget, settings
  let currentPage = 'dashboard';
  let reportPeriod = currentMonthKey();   // 'all' or 'YYYY-MM'
  let trendRange = 'weekly';       // 'weekly' or 'monthly'
  const charts = {};               // Chart.js instances, so we can destroy them before redrawing

  function defaultState() {
    return {
      transactions: [],
      budget: 0,
      settings: { currency: 'INR', theme: 'light' }
    };
  }

  // Read saved data. Anything invalid is dropped so bad data can never break the app.
  function loadState() {
    const fresh = defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fresh;
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return fresh;

      if (Array.isArray(data.transactions)) {
        fresh.transactions = data.transactions.map(cleanTransaction).filter(Boolean);
      }
      const budget = Number(data.budget);
      if (Number.isFinite(budget) && budget > 0 && budget <= MAX_AMOUNT) {
        fresh.budget = roundMoney(budget);
      }
      if (data.settings && typeof data.settings === 'object') {
        if (CURRENCIES[data.settings.currency]) fresh.settings.currency = data.settings.currency;
        if (data.settings.theme === 'dark') fresh.settings.theme = 'dark';
      }
    } catch (err) {
      console.warn('Saved data could not be read. Starting fresh.', err);
    }
    return fresh;
  }

  // Check one saved transaction. Returns a clean copy, or null if it is unusable.
  function cleanTransaction(t) {
    if (!t || typeof t !== 'object') return null;
    const amount = Number(t.amount);
    const title = typeof t.title === 'string' ? t.title.trim() : '';
    if (t.type !== 'income' && t.type !== 'expense') return null;
    if (!title || !Number.isFinite(amount) || amount <= 0 || amount > MAX_AMOUNT) return null;
    if (typeof t.date !== 'string' || !isValidDateStr(t.date)) return null;
    return {
      id: typeof t.id === 'string' && t.id ? t.id : generateId(),
      type: t.type,
      title: title.slice(0, 60),
      amount: roundMoney(amount),
      category: ALL_CATEGORIES.includes(t.category) ? t.category : 'Other',
      date: t.date,
      payment: PAYMENT_METHODS.includes(t.payment) ? t.payment : 'Other',
      description: typeof t.description === 'string' ? t.description.slice(0, 200) : '',
      createdAt: Number.isFinite(t.createdAt) ? t.createdAt : 0
    };
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (err) {
      showToast('Could not save your data. Browser storage may be full or blocked.', 'error');
      return false;
    }
  }

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function addTransaction(data) {
    const tx = Object.assign({ id: generateId(), createdAt: Date.now() }, data);
    state.transactions.push(tx);
    persist();
    return tx;
  }

  function updateTransaction(id, data) {
    const index = state.transactions.findIndex(function (t) { return t.id === id; });
    if (index === -1) return false;
    state.transactions[index] = Object.assign({}, state.transactions[index], data);
    persist();
    return true;
  }

  function deleteTransaction(id) {
    state.transactions = state.transactions.filter(function (t) { return t.id !== id; });
    persist();
  }

  /* ---------------------------------------------------------
     3. HELPER FUNCTIONS
     --------------------------------------------------------- */
  function $(id) { return document.getElementById(id); }

  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICON_PATHS[name] || '') + '</svg>';
  }

  function iconSpan(name) { return '<span class="icon">' + icon(name) + '</span>'; }

  // Fill every <span data-icon="..."> in the page with its SVG
  function hydrateIcons() {
    document.querySelectorAll('[data-icon]').forEach(function (el) {
      el.innerHTML = icon(el.getAttribute('data-icon'));
    });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function capitalize(text) { return text.charAt(0).toUpperCase() + text.slice(1); }

  /* ----- Money ----- */
  // Money is added up in whole cents so results are always exact (no 0.1 + 0.2 problems).
  function toCents(amount) { return Math.round(amount * 100); }
  function roundMoney(amount) { return Math.round(amount * 100) / 100; }

  const moneyFormatters = {};
  function formatMoney(value) {
    const code = state.settings.currency;
    if (!moneyFormatters[code]) {
      moneyFormatters[code] = new Intl.NumberFormat(CURRENCIES[code].locale, { style: 'currency', currency: code });
    }
    return moneyFormatters[code].format(value);
  }

  function formatCompact(value) {
    return new Intl.NumberFormat(CURRENCIES[state.settings.currency].locale, {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  }

  /* ----- Dates (always handled as local "YYYY-MM-DD" strings) ----- */
  function pad(n) { return String(n).padStart(2, '0'); }

  function dateToStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function todayStr() { return dateToStr(new Date()); }

  function parseDate(str) {
    const parts = str.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function isValidDateStr(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const d = parseDate(str);
    const year = d.getFullYear();
    return dateToStr(d) === str && year >= 2000 && year <= 2100;
  }

  function monthKey(dateStr) { return dateStr.slice(0, 7); }

  function currentMonthKey() { return monthKey(todayStr()); }

  function formatDate(dateStr) {
    return parseDate(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function monthLabel(key, short) {
    const parts = key.split('-').map(Number);
    const d = new Date(parts[0], parts[1] - 1, 1);
    return short
      ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // The last n month keys, oldest first, ending with the current month
  function lastMonthKeys(n) {
    const keys = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(d.getFullYear() + '-' + pad(d.getMonth() + 1));
    }
    return keys;
  }

  // Monday of the week that contains the given date
  function weekStart(d) {
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return start;
  }

  // The last n week-start dates (Mondays), oldest first
  function lastWeekStarts(n) {
    const thisWeek = weekStart(new Date());
    const list = [];
    for (let i = n - 1; i >= 0; i--) {
      list.push(new Date(thisWeek.getFullYear(), thisWeek.getMonth(), thisWeek.getDate() - 7 * i));
    }
    return list;
  }

  /* ---------------------------------------------------------
     4. CALCULATIONS
     --------------------------------------------------------- */
  function getTotals(list) {
    let incomeCents = 0;
    let expenseCents = 0;
    list.forEach(function (t) {
      if (t.type === 'income') incomeCents += toCents(t.amount);
      else expenseCents += toCents(t.amount);
    });
    return {
      income: incomeCents / 100,
      expense: expenseCents / 100,
      balance: (incomeCents - expenseCents) / 100
    };
  }

  // Add up expenses in cents, grouped by whatever keyFn returns (month, week, category…)
  function groupExpenses(list, keyFn) {
    const map = {};
    list.forEach(function (t) {
      if (t.type !== 'expense') return;
      const key = keyFn(t);
      map[key] = (map[key] || 0) + toCents(t.amount);
    });
    return map;
  }

  function getBudgetInfo() {
    const key = currentMonthKey();
    const spentCents = state.transactions.reduce(function (sum, t) {
      return t.type === 'expense' && monthKey(t.date) === key ? sum + toCents(t.amount) : sum;
    }, 0);
    const budgetCents = toCents(state.budget);
    const remainingCents = budgetCents - spentCents;
    const percent = budgetCents > 0 ? (spentCents / budgetCents) * 100 : 0;

    let status = 'none';                        // no budget set
    if (budgetCents > 0) {
      if (spentCents > budgetCents) status = 'over';
      else if (percent >= 80) status = 'near';
      else status = 'ok';
    }
    return {
      budget: budgetCents / 100,
      spent: spentCents / 100,
      remaining: remainingCents / 100,
      percent: percent,
      status: status
    };
  }

  function filterTransactions(list, f) {
    const query = f.search.trim().toLowerCase();
    return list.filter(function (t) {
      if (f.type !== 'all' && t.type !== f.type) return false;
      if (f.category !== 'all' && t.category !== f.category) return false;
      if (f.from && t.date < f.from) return false;
      if (f.to && t.date > f.to) return false;
      if (query) {
        const text = [t.title, t.category, t.description, t.payment, t.type, t.date, String(t.amount)].join(' ').toLowerCase();
        if (text.indexOf(query) === -1) return false;
      }
      return true;
    });
  }

  function sortTransactions(list, order) {
    const dir = order === 'oldest' ? 1 : -1;
    return list.slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -dir : dir;
      return dir * (a.createdAt - b.createdAt);
    });
  }

  function csvCell(value) {
    let text = String(value == null ? '' : value);
    // Stop spreadsheet apps from running text that starts like a formula
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function buildCsv(list) {
    const header = ['Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = sortTransactions(list, 'newest').map(function (t) {
      return [t.date, capitalize(t.type), t.title, t.category, t.amount.toFixed(2), t.payment, t.description];
    });
    const lines = [header].concat(rows).map(function (row) { return row.map(csvCell).join(','); });
    return '﻿' + lines.join('\r\n');   // BOM helps Excel read ₹ and other symbols correctly
  }

  /* ---------------------------------------------------------
     5. UI HELPERS
     --------------------------------------------------------- */
  /* ----- Toast messages ----- */
  function showToast(message, type) {
    const box = $('toastContainer');
    if (!box) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.textContent = message;
    box.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('hide');
      setTimeout(function () { toast.remove(); }, 320);
    }, 3200);
  }

  /* ----- Confirmation dialog ----- */
  let confirmCallback = null;
  let lastFocused = null;

  function openConfirm(options) {
    lastFocused = document.activeElement;
    $('modalTitle').textContent = options.title;
    $('modalMessage').textContent = options.message;
    $('modalConfirm').textContent = options.confirmText || 'Confirm';
    confirmCallback = options.onConfirm;
    $('confirmModal').hidden = false;
    $('modalCancel').focus();
  }

  function closeConfirm() {
    $('confirmModal').hidden = true;
    confirmCallback = null;
    if (lastFocused && document.body.contains(lastFocused)) lastFocused.focus();
  }

  /* ----- Sidebar (mobile drawer) ----- */
  function openSidebar() {
    $('sidebar').classList.add('open');
    $('overlay').classList.add('show');
    $('menuBtn').setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('overlay').classList.remove('show');
    $('menuBtn').setAttribute('aria-expanded', 'false');
  }

  /* ----- Theme ----- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    $('themeToggle').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon');
    $('themeToggle').setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    $('darkToggle').checked = theme === 'dark';
  }

  function setTheme(theme) {
    state.settings.theme = theme;
    persist();
    applyTheme(theme);
    renderPage(currentPage);       // charts need new colours
  }

  /* ----- Charts (Chart.js) ----- */
  function themeColors() {
    const css = getComputedStyle(document.documentElement);
    function get(name) { return css.getPropertyValue(name).trim(); }
    return {
      text: get('--text-muted'),
      grid: get('--border'),
      surface: get('--surface'),
      primary: get('--primary'),
      success: get('--success'),
      danger: get('--danger')
    };
  }

  // Draws a chart, or shows a friendly message instead when there is nothing to draw.
  function drawChart(canvasId, config, emptyMessage) {
    const canvas = $(canvasId);
    const message = canvas.parentElement.querySelector('.chart-msg');

    if (charts[canvasId]) {
      charts[canvasId].destroy();
      charts[canvasId] = null;
    }

    if (emptyMessage || typeof Chart === 'undefined') {
      canvas.hidden = true;
      message.textContent = emptyMessage || 'Charts could not load. Check your internet connection and refresh the page.';
      message.hidden = false;
      return;
    }

    canvas.hidden = false;
    message.hidden = true;
    Chart.defaults.color = themeColors().text;
    Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    charts[canvasId] = new Chart(canvas.getContext('2d'), config);
  }

  function barConfig(labels, values, tooltipTitles) {
    const c = themeColors();
    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Expenses', data: values, backgroundColor: c.primary, borderRadius: 6, maxBarThickness: 38 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: function (items) { return tooltipTitles[items[0].dataIndex]; },
              label: function (ctx) { return ' ' + formatMoney(ctx.parsed.y); }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: c.grid }, ticks: { callback: function (v) { return formatCompact(v); } } }
        }
      }
    };
  }

  function doughnutConfig(labels, values, colors, showLegend) {
    const c = themeColors();
    return {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{ data: values, backgroundColor: colors, borderColor: c.surface, borderWidth: 2 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '66%',
        plugins: {
          legend: { display: showLegend, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 14 } },
          tooltip: { callbacks: { label: function (ctx) { return ' ' + ctx.label + ': ' + formatMoney(ctx.parsed); } } }
        }
      }
    };
  }

  /* ----- Small HTML builders ----- */
  function categoryStyle(category) { return CATEGORY_STYLE[category] || CATEGORY_STYLE.Other; }

  function categoryBadge(category) {
    const s = categoryStyle(category);
    return '<span class="cat-badge" style="--c:' + s.color + '">' + iconSpan(s.icon) + '</span>';
  }

  function categoryPill(category) {
    return '<span class="pill" style="--c:' + categoryStyle(category).color + '">' + escapeHtml(category) + '</span>';
  }

  function signedMoney(t) { return (t.type === 'income' ? '+' : '-') + formatMoney(t.amount); }

  /* ---------------------------------------------------------
     6. PAGE RENDERERS
     --------------------------------------------------------- */
  function renderPage(name) {
    if (name === 'dashboard') renderDashboard();
    else if (name === 'add') renderAddPage();
    else if (name === 'history') renderHistory();
    else if (name === 'budget') renderBudget();
    else if (name === 'reports') renderReports();
    else if (name === 'settings') renderSettings();
  }

  /* ----- Dashboard ----- */
  function renderDashboard() {
    const totals = getTotals(state.transactions);
    $('statBalance').textContent = formatMoney(totals.balance);
    $('statBalance').style.color = totals.balance < 0 ? 'var(--danger)' : '';
    $('statIncome').textContent = formatMoney(totals.income);
    $('statExpense').textContent = formatMoney(totals.expense);

    renderBudgetAlert();
    renderRecent();

    // Monthly expense chart – last 6 months
    const keys = lastMonthKeys(6);
    const monthly = groupExpenses(state.transactions, function (t) { return monthKey(t.date); });
    const values = keys.map(function (k) { return (monthly[k] || 0) / 100; });
    const hasExpenses = values.some(function (v) { return v > 0; });
    drawChart(
      'monthlyExpenseChart',
      barConfig(keys.map(function (k) { return monthLabel(k, true); }), values, keys.map(function (k) { return monthLabel(k, false); })),
      hasExpenses ? null : 'No expenses in the last 6 months yet.'
    );

    // Income vs expense chart – all time
    const c = themeColors();
    const hasData = totals.income > 0 || totals.expense > 0;
    drawChart(
      'incomeExpenseChart',
      doughnutConfig(['Income', 'Expenses'], [totals.income, totals.expense], [c.success, c.danger], true),
      hasData ? null : 'Add some transactions to see this chart.'
    );
  }

  function renderBudgetAlert() {
    const info = getBudgetInfo();
    const box = $('budgetAlert');
    if (info.status === 'over') {
      box.className = 'alert alert-danger';
      box.innerHTML = iconSpan('alert') + '<span>Budget exceeded: you have spent ' + formatMoney(info.spent) +
        ' of your ' + formatMoney(info.budget) + ' monthly budget (' + formatMoney(-info.remaining) +
        ' over). <a class="link" href="#budget">View budget</a></span>';
      box.hidden = false;
    } else if (info.status === 'near') {
      box.className = 'alert alert-warning';
      box.innerHTML = iconSpan('alert') + '<span>You have used ' + Math.round(info.percent) +
        '% of your monthly budget. Only ' + formatMoney(info.remaining) + ' left. <a class="link" href="#budget">View budget</a></span>';
      box.hidden = false;
    } else {
      box.hidden = true;
      box.innerHTML = '';
    }
  }

  function renderRecent() {
    const recent = sortTransactions(state.transactions, 'newest').slice(0, 5);
    $('recentEmpty').hidden = recent.length > 0;
    $('recentList').hidden = recent.length === 0;
    $('recentList').innerHTML = recent.map(function (t) {
      return '<li class="recent-item">' +
        categoryBadge(t.category) +
        '<div class="recent-info"><strong>' + escapeHtml(t.title) + '</strong>' +
        '<small>' + escapeHtml(t.category) + ' · ' + formatDate(t.date) + '</small></div>' +
        '<span class="amount ' + t.type + '">' + signedMoney(t) + '</span>' +
        '</li>';
    }).join('');
  }

  /* ----- History ----- */
  function getFilters() {
    return {
      search: $('searchInput').value,
      type: $('filterType').value,
      category: $('filterCategory').value,
      from: $('filterFrom').value,
      to: $('filterTo').value,
      order: $('sortOrder').value
    };
  }

  function renderHistory() {
    const f = getFilters();
    const total = state.transactions.length;
    const list = sortTransactions(filterTransactions(state.transactions, f), f.order);

    $('resultCount').textContent = total === 0 ? '' : 'Showing ' + list.length + ' of ' + total + ' transaction' + (total === 1 ? '' : 's');
    $('historyTable').parentElement.hidden = list.length === 0;
    $('historyEmpty').hidden = list.length > 0;

    if (list.length === 0) {
      let text = 'No transactions match your filters.';
      if (total === 0) text = 'You have not added any transactions yet.';
      else if (f.from && f.to && f.from > f.to) text = 'The "From" date is after the "To" date.';
      $('historyEmptyText').textContent = text;
    }

    $('historyBody').innerHTML = list.map(function (t) {
      const title = escapeHtml(t.title);
      return '<tr>' +
        '<td data-label="Date">' + formatDate(t.date) + '</td>' +
        '<td class="title-cell" data-label="Title"><div class="tx-title">' + categoryBadge(t.category) +
          '<div><strong>' + title + '</strong>' + (t.description ? '<small>' + escapeHtml(t.description) + '</small>' : '') + '</div></div></td>' +
        '<td data-label="Category">' + categoryPill(t.category) + '</td>' +
        '<td data-label="Payment">' + escapeHtml(t.payment) + '</td>' +
        '<td class="num" data-label="Amount"><span class="amount ' + t.type + '">' + signedMoney(t) + '</span></td>' +
        '<td class="actions" data-label="Actions">' +
          '<button type="button" class="icon-btn sm" data-action="edit" data-id="' + escapeHtml(t.id) + '" aria-label="Edit ' + title + '" title="Edit">' + iconSpan('edit') + '</button>' +
          '<button type="button" class="icon-btn sm danger" data-action="delete" data-id="' + escapeHtml(t.id) + '" aria-label="Delete ' + title + '" title="Delete">' + iconSpan('trash') + '</button>' +
        '</td>' +
        '</tr>';
    }).join('');
  }

  function resetFilters() {
    $('searchInput').value = '';
    $('filterType').value = 'all';
    $('filterCategory').value = 'all';
    $('filterFrom').value = '';
    $('filterTo').value = '';
    $('sortOrder').value = 'newest';
    renderHistory();
  }

  /* ----- Budget ----- */
  function renderBudget() {
    const info = getBudgetInfo();
    $('budgetMonthLabel').textContent = monthLabel(currentMonthKey(), false);
    $('budgetTotal').textContent = info.budget > 0 ? formatMoney(info.budget) : 'Not set';
    $('budgetSpent').textContent = formatMoney(info.spent);

    const remaining = $('budgetRemaining');
    remaining.textContent = info.budget > 0 ? formatMoney(info.remaining) : '–';
    remaining.classList.toggle('negative', info.status === 'over');

    const bar = $('budgetBar');
    const width = info.budget > 0 ? Math.min(100, info.percent) : 0;
    bar.style.width = width + '%';
    bar.className = 'progress-bar' + (info.status === 'over' ? ' over' : info.status === 'near' ? ' near' : '');
    $('budgetProgress').setAttribute('aria-valuenow', String(Math.round(width)));
    $('budgetPercent').textContent = (info.budget > 0 ? Math.round(info.percent) : 0) + '%';

    const badge = $('budgetBadge');
    const labels = { none: 'No budget', ok: 'On track', near: 'Almost used', over: 'Over budget' };
    badge.textContent = labels[info.status];
    badge.className = 'badge ' + info.status;

    let note = 'Set a monthly budget to start tracking.';
    if (info.status === 'ok') note = formatMoney(info.remaining) + ' left to spend';
    if (info.status === 'near') note = 'Only ' + formatMoney(info.remaining) + ' left';
    if (info.status === 'over') note = formatMoney(-info.remaining) + ' over budget';
    $('budgetNote').textContent = note;

    const warning = $('budgetWarning');
    if (info.status === 'over') {
      warning.innerHTML = iconSpan('alert') + '<span>Warning: you have exceeded your monthly budget by ' + formatMoney(-info.remaining) + '.</span>';
      warning.hidden = false;
    } else {
      warning.hidden = true;
      warning.innerHTML = '';
    }

    const input = $('budgetInput');
    if (document.activeElement !== input) input.value = state.budget > 0 ? String(state.budget) : '';
  }

  /* ----- Reports ----- */
  function getReportTransactions() {
    if (reportPeriod === 'all') return state.transactions;
    return state.transactions.filter(function (t) { return monthKey(t.date) === reportPeriod; });
  }

  function renderPeriodOptions() {
    const keys = {};
    keys[currentMonthKey()] = true;
    state.transactions.forEach(function (t) { keys[monthKey(t.date)] = true; });
    const months = Object.keys(keys).sort().reverse();

    if (reportPeriod !== 'all' && months.indexOf(reportPeriod) === -1) reportPeriod = currentMonthKey();

    $('reportPeriod').innerHTML = '<option value="all">All time</option>' + months.map(function (k) {
      return '<option value="' + k + '">' + monthLabel(k, false) + '</option>';
    }).join('');
    $('reportPeriod').value = reportPeriod;
  }

  function renderReports() {
    renderPeriodOptions();

    // Summary cards for the chosen period
    const list = getReportTransactions();
    const totals = getTotals(list);
    $('repIncome').textContent = formatMoney(totals.income);
    $('repExpense').textContent = formatMoney(totals.expense);
    $('repNet').textContent = formatMoney(totals.balance);
    $('repNet').style.color = totals.balance < 0 ? 'var(--danger)' : '';

    renderCategoryBreakdown(list);
    renderTrend();
    renderMonthlySummary();
  }

  function renderCategoryBreakdown(list) {
    const map = groupExpenses(list, function (t) { return t.category; });
    const entries = Object.keys(map).map(function (name) { return { name: name, cents: map[name] }; })
      .sort(function (a, b) { return b.cents - a.cents; });
    const totalCents = entries.reduce(function (sum, e) { return sum + e.cents; }, 0);

    drawChart(
      'categoryChart',
      doughnutConfig(
        entries.map(function (e) { return e.name; }),
        entries.map(function (e) { return e.cents / 100; }),
        entries.map(function (e) { return categoryStyle(e.name).color; }),
        false
      ),
      entries.length ? null : 'No expenses in this period.'
    );

    $('categoryList').innerHTML = entries.map(function (e) {
      const pct = totalCents > 0 ? (e.cents / totalCents) * 100 : 0;
      return '<li><span class="dot" style="--c:' + categoryStyle(e.name).color + '"></span>' +
        '<span>' + escapeHtml(e.name) + '</span>' +
        '<span class="pct">' + pct.toFixed(1) + '%</span>' +
        '<span class="val">' + formatMoney(e.cents / 100) + '</span></li>';
    }).join('');
  }

  function renderTrend() {
    let labels, titles, keys, map, note;

    if (trendRange === 'weekly') {
      const starts = lastWeekStarts(8);
      keys = starts.map(dateToStr);
      labels = starts.map(function (d) { return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); });
      titles = labels.map(function (l) { return 'Week of ' + l; });
      map = groupExpenses(state.transactions, function (t) { return dateToStr(weekStart(parseDate(t.date))); });
      note = 'Last 8 weeks (Monday to Sunday). Each bar is labelled with the week’s starting date.';
    } else {
      keys = lastMonthKeys(12);
      labels = keys.map(function (k) { return monthLabel(k, true); });
      titles = keys.map(function (k) { return monthLabel(k, false); });
      map = groupExpenses(state.transactions, function (t) { return monthKey(t.date); });
      note = 'Last 12 months of expenses.';
    }

    const values = keys.map(function (k) { return (map[k] || 0) / 100; });
    const hasData = values.some(function (v) { return v > 0; });
    drawChart('trendChart', barConfig(labels, values, titles), hasData ? null : 'No expenses in this range yet.');
    $('trendNote').textContent = note;

    document.querySelectorAll('.seg-btn').forEach(function (btn) {
      const active = btn.getAttribute('data-range') === trendRange;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  function renderMonthlySummary() {
    const months = {};
    state.transactions.forEach(function (t) {
      const key = monthKey(t.date);
      if (!months[key]) months[key] = { income: 0, expense: 0 };
      months[key][t.type] += toCents(t.amount);
    });
    const keys = Object.keys(months).sort().reverse().slice(0, 12);

    $('summaryEmpty').hidden = keys.length > 0;
    $('summaryTable').parentElement.hidden = keys.length === 0;
    $('summaryBody').innerHTML = keys.map(function (k) {
      const net = (months[k].income - months[k].expense) / 100;
      return '<tr>' +
        '<td data-label="Month"><strong>' + monthLabel(k, false) + '</strong></td>' +
        '<td class="num" data-label="Income">' + formatMoney(months[k].income / 100) + '</td>' +
        '<td class="num" data-label="Expenses">' + formatMoney(months[k].expense / 100) + '</td>' +
        '<td class="num ' + (net < 0 ? 'net-negative' : 'net-positive') + '" data-label="Net">' + formatMoney(net) + '</td>' +
        '</tr>';
    }).join('');
  }

  function downloadCsv() {
    const list = getReportTransactions();
    if (list.length === 0) {
      showToast('There are no transactions to export for this period.', 'warning');
      return;
    }
    const blob = new Blob([buildCsv(list)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'spendwise-' + (reportPeriod === 'all' ? 'all-time' : reportPeriod) + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast('CSV report downloaded.');
  }

  /* ----- Settings ----- */
  function renderSettings() {
    $('currencySelect').value = state.settings.currency;
    $('darkToggle').checked = state.settings.theme === 'dark';
  }

  function clearAllData() {
    state.transactions = [];
    state.budget = 0;
    persist();
    reportPeriod = currentMonthKey();
    resetForm();
    resetFilters();
    showToast('All data has been cleared.');
    renderPage(currentPage);
  }

  /* ---------------------------------------------------------
     7. ADD / EDIT FORM
     --------------------------------------------------------- */
  const FORM_FIELDS = ['title', 'amount', 'category', 'date', 'payment'];

  function optionsHtml(items, placeholder) {
    return '<option value="">' + placeholder + '</option>' + items.map(function (item) {
      return '<option value="' + escapeHtml(item) + '">' + escapeHtml(item) + '</option>';
    }).join('');
  }

  function getSelectedType() {
    return document.querySelector('input[name="type"]:checked').value;
  }

  // Income and expense have different category lists
  function updateCategoryOptions(type, selected) {
    const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const select = $('category');
    const keep = selected !== undefined ? selected : select.value;
    select.innerHTML = optionsHtml(list, 'Select category');
    select.value = list.indexOf(keep) !== -1 ? keep : '';
  }

  function readForm() {
    const rawAmount = $('amount').value.trim();
    return {
      type: getSelectedType(),
      title: $('title').value.trim().replace(/\s+/g, ' '),
      amount: rawAmount === '' ? NaN : Number(rawAmount),
      category: $('category').value,
      date: $('date').value,
      payment: $('payment').value,
      description: $('description').value.trim()
    };
  }

  // Returns an object like { title: 'message', amount: 'message' }. Empty object = valid.
  function validateTransaction(v) {
    const errors = {};

    if (!v.title) errors.title = 'Please enter a title.';
    else if (v.title.length > 60) errors.title = 'Title must be 60 characters or fewer.';

    if (!Number.isFinite(v.amount)) errors.amount = 'Please enter a valid amount.';
    else if (v.amount <= 0) errors.amount = 'Amount must be greater than zero.';
    else if (v.amount > MAX_AMOUNT) errors.amount = 'That amount is too large.';
    else if (roundMoney(v.amount) <= 0) errors.amount = 'Amount must be at least 0.01.';

    const allowed = v.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (allowed.indexOf(v.category) === -1) errors.category = 'Please choose a category.';

    if (!isValidDateStr(v.date)) errors.date = 'Please pick a valid date.';

    if (PAYMENT_METHODS.indexOf(v.payment) === -1) errors.payment = 'Please choose a payment method.';

    return errors;
  }

  function showFormErrors(errors) {
    FORM_FIELDS.forEach(function (name) {
      $(name + 'Error').textContent = errors[name] || '';
      $(name).classList.toggle('invalid', Boolean(errors[name]));
    });
  }

  function clearFormErrors() { showFormErrors({}); }

  function isEditing() { return Boolean($('transactionForm').dataset.editId); }

  function resetForm(keepType) {
    const form = $('transactionForm');
    const type = keepType ? getSelectedType() : 'expense';
    form.reset();
    delete form.dataset.editId;
    document.querySelector('input[name="type"][value="' + type + '"]').checked = true;
    updateCategoryOptions(type, '');
    $('payment').value = '';
    $('date').value = todayStr();
    clearFormErrors();
    $('formTitle').textContent = 'New Transaction';
    $('saveBtn').textContent = 'Save Transaction';
    $('cancelBtn').textContent = 'Clear';
  }

  function renderAddPage() {
    if (!$('date').value) $('date').value = todayStr();
  }

  function startEdit(id) {
    const t = state.transactions.find(function (item) { return item.id === id; });
    if (!t) return;

    $('transactionForm').dataset.editId = id;
    document.querySelector('input[name="type"][value="' + t.type + '"]').checked = true;
    updateCategoryOptions(t.type, t.category);
    $('title').value = t.title;
    $('amount').value = String(t.amount);
    $('date').value = t.date;
    $('payment').value = t.payment;
    $('description').value = t.description;
    clearFormErrors();

    $('formTitle').textContent = 'Edit Transaction';
    $('saveBtn').textContent = 'Update Transaction';
    $('cancelBtn').textContent = 'Cancel Edit';

    if (location.hash !== '#add') location.hash = 'add';
    else showPage('add');
  }

  function handleSubmit(event) {
    event.preventDefault();
    const values = readForm();
    const errors = validateTransaction(values);
    showFormErrors(errors);

    const firstInvalid = FORM_FIELDS.find(function (name) { return errors[name]; });
    if (firstInvalid) {
      $(firstInvalid).focus();
      return;
    }

    const data = {
      type: values.type,
      title: values.title,
      amount: roundMoney(values.amount),
      category: values.category,
      date: values.date,
      payment: values.payment,
      description: values.description
    };

    if (isEditing()) {
      const saved = updateTransaction($('transactionForm').dataset.editId, data);
      showToast(saved ? 'Transaction updated.' : 'That transaction no longer exists.', saved ? 'success' : 'error');
      resetForm();
      location.hash = 'history';
      if (location.hash === '#history' && currentPage !== 'history') showPage('history');
      return;
    }

    addTransaction(data);
    showToast('Transaction added.');
    if (data.type === 'expense' && monthKey(data.date) === currentMonthKey() && getBudgetInfo().status === 'over') {
      showToast('Heads up: you have exceeded your monthly budget.', 'warning');
    }
    resetForm(true);
    $('title').focus();
  }

  function confirmDelete(id) {
    const t = state.transactions.find(function (item) { return item.id === id; });
    if (!t) return;
    openConfirm({
      title: 'Delete this transaction?',
      message: '“' + t.title + '” (' + formatMoney(t.amount) + ') will be removed permanently.',
      confirmText: 'Delete',
      onConfirm: function () {
        deleteTransaction(id);
        showToast('Transaction deleted.');
        renderPage(currentPage);
      }
    });
  }

  function handleBudgetSubmit(event) {
    event.preventDefault();
    const raw = $('budgetInput').value.trim();
    const value = raw === '' ? NaN : Number(raw);
    const error = $('budgetError');
    const input = $('budgetInput');

    let message = '';
    if (!Number.isFinite(value) || value < 0) message = 'Enter 0 or a positive amount.';
    else if (value > MAX_AMOUNT) message = 'That amount is too large.';

    error.textContent = message;
    input.classList.toggle('invalid', Boolean(message));
    if (message) { input.focus(); return; }

    state.budget = roundMoney(value);
    persist();
    showToast(state.budget > 0 ? 'Monthly budget saved.' : 'Monthly budget removed.');
    input.blur();
    renderBudget();
  }

  /* ---------------------------------------------------------
     8. NAVIGATION, EVENTS AND START-UP
     --------------------------------------------------------- */
  function showPage(name) {
    if (!PAGES[name]) name = 'dashboard';
    if (currentPage === 'add' && name !== 'add') resetForm();   // leaving the form cancels any edit
    currentPage = name;

    document.querySelectorAll('.page').forEach(function (section) {
      section.hidden = section.id !== 'page-' + name;
    });
    document.querySelectorAll('.nav-link').forEach(function (link) {
      const active = link.getAttribute('data-page') === name;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    $('pageTitle').textContent = PAGES[name];
    document.title = PAGES[name] + ' – SpendWise';
    closeSidebar();
    renderPage(name);
    window.scrollTo(0, 0);
  }

  function pageFromHash() { return location.hash.replace('#', '') || 'dashboard'; }

  // Fill the dropdowns that never change
  function setupControls() {
    $('payment').innerHTML = optionsHtml(PAYMENT_METHODS, 'Select method');
    $('filterCategory').innerHTML = '<option value="all">All categories</option>' + ALL_CATEGORIES.map(function (c) {
      return '<option value="' + c + '">' + c + '</option>';
    }).join('');
    $('currencySelect').innerHTML = Object.keys(CURRENCIES).map(function (code) {
      return '<option value="' + code + '">' + escapeHtml(CURRENCIES[code].label) + '</option>';
    }).join('');
  }

  function bindEvents() {
    // Navigation and layout
    window.addEventListener('hashchange', function () { showPage(pageFromHash()); });
    $('menuBtn').addEventListener('click', function () {
      if ($('sidebar').classList.contains('open')) closeSidebar(); else openSidebar();
    });
    $('overlay').addEventListener('click', closeSidebar);
    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeSidebar);
    });

    // Theme
    $('themeToggle').addEventListener('click', function () {
      setTheme(state.settings.theme === 'dark' ? 'light' : 'dark');
    });
    $('darkToggle').addEventListener('change', function (e) {
      setTheme(e.target.checked ? 'dark' : 'light');
    });

    // Add / edit form
    $('transactionForm').addEventListener('submit', handleSubmit);
    document.querySelectorAll('input[name="type"]').forEach(function (radio) {
      radio.addEventListener('change', function () { updateCategoryOptions(getSelectedType()); });
    });
    FORM_FIELDS.forEach(function (name) {
      const field = $(name);
      const clear = function () { field.classList.remove('invalid'); $(name + 'Error').textContent = ''; };
      field.addEventListener('input', clear);
      field.addEventListener('change', clear);
    });
    $('cancelBtn').addEventListener('click', function () {
      const wasEditing = isEditing();
      resetForm();
      if (wasEditing) location.hash = 'history';
    });

    // History
    ['searchInput', 'filterFrom', 'filterTo'].forEach(function (id) {
      $(id).addEventListener('input', renderHistory);
    });
    ['filterType', 'filterCategory', 'sortOrder'].forEach(function (id) {
      $(id).addEventListener('change', renderHistory);
    });
    $('resetFilters').addEventListener('click', resetFilters);
    $('historyBody').addEventListener('click', function (e) {
      const button = e.target.closest('[data-action]');
      if (!button) return;
      const id = button.getAttribute('data-id');
      if (button.getAttribute('data-action') === 'edit') startEdit(id);
      else confirmDelete(id);
    });

    // Budget
    $('budgetForm').addEventListener('submit', handleBudgetSubmit);
    $('budgetInput').addEventListener('input', function () {
      $('budgetInput').classList.remove('invalid');
      $('budgetError').textContent = '';
    });

    // Reports
    $('reportPeriod').addEventListener('change', function (e) {
      reportPeriod = e.target.value;
      renderReports();
    });
    $('downloadCsv').addEventListener('click', downloadCsv);
    document.querySelectorAll('.seg-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        trendRange = btn.getAttribute('data-range');
        renderTrend();
      });
    });

    // Settings
    $('currencySelect').addEventListener('change', function (e) {
      state.settings.currency = e.target.value;
      persist();
      showToast('Currency updated.');
      renderPage(currentPage);
    });
    $('clearDataBtn').addEventListener('click', function () {
      openConfirm({
        title: 'Clear all data?',
        message: 'Every transaction and your budget will be deleted permanently. This cannot be undone.',
        confirmText: 'Yes, clear everything',
        onConfirm: clearAllData
      });
    });

    // Confirmation dialog
    $('modalCancel').addEventListener('click', closeConfirm);
    $('modalConfirm').addEventListener('click', function () {
      const action = confirmCallback;
      closeConfirm();
      if (action) action();
    });
    $('confirmModal').addEventListener('click', function (e) {
      if (e.target === $('confirmModal')) closeConfirm();
    });

    // Keyboard: Escape closes dialogs / menu, Tab stays inside the dialog
    document.addEventListener('keydown', function (e) {
      const modalOpen = !$('confirmModal').hidden;
      if (e.key === 'Escape') {
        if (modalOpen) closeConfirm(); else closeSidebar();
        return;
      }
      if (e.key === 'Tab' && modalOpen) {
        const first = $('modalCancel');
        const last = $('modalConfirm');
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  function init() {
    hydrateIcons();
    setupControls();
    applyTheme(state.settings.theme);
    resetForm();
    bindEvents();
    showPage(pageFromHash());
  }

  init();
})();
