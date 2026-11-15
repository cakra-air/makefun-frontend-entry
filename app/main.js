import { getBounties, getBounty } from './api.js';
import { board, bounty } from './views.js';
import { esc } from './format.js';

const app = document.getElementById('app');
let boardData;
let boardState = { query: '', category: 'all', sort: 'newest' };
let renderToken = 0;

const loading = () => `<div class="loading-state"><span class="loader"></span><p>Finding the good stuff…</p></div>`;
const errorPage = (message) => `<div class="error-state"><span class="empty-icon">✳</span><h2>We hit a little snag</h2><p>${esc(message)}</p><button class="retry-button" data-retry>Try again</button></div>`;

function filteredItems() {
  let items = (boardData?.items || []).filter((b) => new Date(b.deadline).getTime() > Date.now());
  const query = boardState.query.trim().toLowerCase();
  if (query) items = items.filter((b) => [b.title, b.summary, b.description, b.category, ...(b.skills || [])].join(' ').toLowerCase().includes(query));
  if (boardState.category !== 'all') items = items.filter((b) => b.category === boardState.category);
  if (boardState.sort === 'prize') items.sort((a, b) => Number(b.potUsd ?? b.rewardAmount ?? 0) - Number(a.potUsd ?? a.rewardAmount ?? 0));
  else if (boardState.sort === 'deadline') items.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  else if (boardState.sort === 'entries') items.sort((a, b) => Number(b.submissionCount || 0) - Number(a.submissionCount || 0));
  else items.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  return items;
}

function paintBoard() {
  app.innerHTML = board(boardData, { ...boardState, items: filteredItems() });
  document.title = 'Open bounties | make.fun';
  wireBoard();
}

function wireBoard() {
  const search = document.getElementById('bounty-search');
  search?.addEventListener('input', () => {
    const start = search.selectionStart;
    boardState.query = search.value;
    paintBoard();
    const next = document.getElementById('bounty-search');
    next.focus(); next.setSelectionRange(start, start);
  });
  document.getElementById('category-filter')?.addEventListener('change', (event) => { boardState.category = event.target.value; paintBoard(); });
  document.getElementById('sort-filter')?.addEventListener('change', (event) => { boardState.sort = event.target.value; paintBoard(); });
  document.querySelector('[data-reset]')?.addEventListener('click', () => { boardState = { query: '', category: 'all', sort: 'newest' }; paintBoard(); });
}

async function render() {
  const token = ++renderToken;
  window.__shotReady = false;
  const match = location.hash.match(/^#\/bounty\/([^/]+)/);
  if (match) {
    app.innerHTML = loading();
    try {
      const item = await getBounty(decodeURIComponent(match[1]));
      if (token !== renderToken) return;
      document.title = `${item.title} | make.fun`;
      app.innerHTML = bounty(item);
    } catch (error) {
      if (token !== renderToken) return;
      app.innerHTML = errorPage(error.message || 'We couldn’t load this bounty. Check your connection and try again.');
      document.querySelector('[data-retry]')?.addEventListener('click', render);
    }
  } else {
    app.innerHTML = loading();
    try {
      boardData = await getBounties();
      if (token !== renderToken) return;
      paintBoard();
    } catch (error) {
      if (token !== renderToken) return;
      document.title = 'Open bounties | make.fun';
      app.innerHTML = errorPage(error.message || 'We couldn’t load the bounty board. Check your connection and try again.');
      document.querySelector('[data-retry]')?.addEventListener('click', render);
    }
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

document.getElementById('brand-home')?.addEventListener('click', () => { boardState = { query: '', category: 'all', sort: 'newest' }; });
window.addEventListener('hashchange', render);
render();
