import { date, esc, money, timeLeft } from './format.js';

const icon = (name, size = 18) => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6"/>',
    spark: '<path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3ZM19 14l1.1 3L23 18l-2.9 1L19 22l-1-3-3-1 3-1 1-3Z"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>', trophy: '<path d="M8 21h8m-4-4v4M7 4h10v6a5 5 0 0 1-10 0V4ZM7 7H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
};

const pot = (b) => money(b.potUsd ?? b.rewardAmount ?? 0);
const active = (b) => new Date(b.deadline).getTime() > Date.now();
const deadlineLabel = (b) => active(b) ? timeLeft(b.deadline) : 'Closed';
const entryText = (b) => Number(b.submissionCount || 0).toLocaleString('en-US');
const bountyHref = (b) => `#/bounty/${encodeURIComponent(b.slug)}`;
const initials = (name) => String(name || 'make.fun').split(/[\s._-]+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
const markdown = (text) => esc(text || '').replace(/^### (.+)$/gm, '<h4>$1</h4>').replace(/^## (.+)$/gm, '<h3>$1</h3>').replace(/^# (.+)$/gm, '<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/^- (.+)$/gm, '<li>$1</li>').replace(/(?:<li>.*<\/li>\n?)+/g, (list) => `<ul>${list}</ul>`).replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');

function card(b, i) {
  const category = esc(b.category || 'Open call');
  const skills = (b.skills || []).slice(0, 3).map((s) => `<span class="skill-chip">${esc(s)}</span>`).join('');
  return `<a class="bounty-card" href="${bountyHref(b)}" style="--card-index:${i}">
    <div class="card-top"><span class="category-pill"><span class="category-dot"></span>${category}</span><span class="card-arrow">${icon('arrow', 17)}</span></div>
    <h3>${esc(b.title)}</h3><p class="card-summary">${esc(b.summary || (b.description || '').slice(0, 155))}</p>
    <div class="skill-list">${skills}</div>
    <div class="card-bottom"><div><span class="metric-label">Prize pool</span><strong class="prize-value">${pot(b)}</strong></div><div><span class="metric-label">Entries</span><strong>${entryText(b)}</strong></div><div class="deadline-metric"><span class="metric-label">Deadline</span><strong class="${active(b) ? 'deadline-active' : 'deadline-ended'}">${deadlineLabel(b)}</strong></div></div>
  </a>`;
}

export function board(data, options = {}) {
  const items = data.items || [];
  const live = items.filter(active);
  const categories = [...new Set(live.map((b) => b.category).filter(Boolean))].sort();
  const shown = options.items || live;
  const content = shown.length ? `<div class="bounty-grid">${shown.map(card).join('')}</div>` : `<div class="empty-state"><span class="empty-icon">${icon('search', 23)}</span><h3>No bounties found</h3><p>Try another search or choose a different category.</p><button class="text-button" data-reset>Clear filters</button></div>`;
  return `<section class="hero-section">
    <div class="hero-copy"><div class="eyebrow"><span class="live-pulse"></span> THE OPEN BOUNTY BOARD</div><h1>Good work<br>gets <span>rewarded.</span></h1><p class="hero-description">A home for ambitious ideas and the people who bring them to life. Find your next challenge.</p><a class="hero-link" href="https://make.fun" target="_blank" rel="noreferrer">Discover make.fun ${icon('arrow', 16)}</a></div>
    <div class="hero-art" aria-hidden="true"><div class="art-orbit orbit-one"></div><div class="art-orbit orbit-two"></div><div class="art-spark spark-a">✳</div><div class="art-spark spark-b">✳</div><div class="art-ticket"><span>MAKE SOMETHING</span><strong>FUN<span>✳</span></strong><i>IDEAS → IMPACT</i></div><div class="art-star">✳</div></div>
    <div class="hero-stats"><div class="stat"><span class="stat-icon">${icon('trophy', 19)}</span><div><strong>${live.length}</strong><span>live bounties</span></div></div><div class="stat-divider"></div><div class="stat"><span class="stat-icon stat-icon-peach">${icon('users', 19)}</span><div><strong>${live.reduce((sum, b) => sum + Number(b.submissionCount || 0), 0).toLocaleString('en-US')}</strong><span>entries so far</span></div></div><div class="stat-divider"></div><div class="stat"><span class="stat-icon stat-icon-yellow">${icon('spark', 19)}</span><div><strong>${money(live.reduce((sum, b) => sum + Number(b.potUsd ?? b.rewardAmount ?? 0), 0))}</strong><span>up for grabs</span></div></div></div>
  </section>
  <section class="board-section"><div class="section-heading"><div><div class="eyebrow section-eyebrow">PICK YOUR NEXT CHALLENGE</div><h2>Open bounties <span class="count-badge">${live.length}</span></h2></div><span class="updated-label"><span class="live-pulse"></span> Live from make.fun</span></div>
    <div class="toolbar"><label class="search-box">${icon('search', 18)}<input id="bounty-search" type="search" placeholder="Search bounties, skills..." value="${esc(options.query || '')}" autocomplete="off"></label><div class="filter-wrap"><label class="filter-label" for="category-filter">Category</label><select id="category-filter"><option value="all">All categories</option>${categories.map((c) => `<option value="${esc(c)}" ${options.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div><div class="filter-wrap sort-wrap"><label class="filter-label" for="sort-filter">Sort by</label><select id="sort-filter"><option value="newest" ${options.sort === 'newest' ? 'selected' : ''}>Newest</option><option value="prize" ${options.sort === 'prize' ? 'selected' : ''}>Prize: high to low</option><option value="deadline" ${options.sort === 'deadline' ? 'selected' : ''}>Deadline soon</option><option value="entries" ${options.sort === 'entries' ? 'selected' : ''}>Most entries</option></select></div></div>
    <div id="bounty-results">${content}</div><div class="board-footer"><span>Showing ${shown.length} of ${live.length} open bounties</span><span>Made for the makers <span class="footer-star">✳</span></span></div>
  </section><footer class="site-footer"><a class="brand" href="#/"><span class="brand-mark">m<span>✳</span></span><span>make.fun</span></a><span>Find your people. Make something matter.</span><a href="https://make.fun" target="_blank" rel="noreferrer">Visit make.fun ${icon('arrow', 14)}</a></footer>`;
}

export function bounty(b) {
  const sponsor = b.sponsor?.name || 'make.fun';
  const ext = b.url ? `https://make.fun${b.url}` : `https://make.fun/bounty/${encodeURIComponent(b.slug)}`;
  const skills = (b.skills || []).map((s) => `<span class="skill-chip">${esc(s)}</span>`).join('');
  return `<div class="detail-page"><a class="back-link" href="#/">${icon('arrow', 16)} All bounties</a>
    <div class="detail-layout"><article class="detail-main"><div class="detail-eyebrow"><span class="category-pill"><span class="category-dot"></span>${esc(b.category || 'Open call')}</span><span class="detail-live"><span class="live-pulse"></span>${active(b) ? 'Accepting entries' : 'Entries closed'}</span></div><h1>${esc(b.title)}</h1><p class="detail-summary">${esc(b.summary || '')}</p>
      <div class="detail-meta"><span class="sponsor-avatar">${esc(initials(sponsor))}</span><span>Hosted by <strong>${esc(sponsor)}</strong></span><span class="meta-divider"></span><span>Posted ${date(b.publishedAt || b.deadline).replace(/,? \d{1,2}:\d{2} [AP]M UTC$/, '')}</span></div>
      <div class="detail-divider"></div><div class="detail-content"><h2>About this bounty</h2><div class="description">${markdown(b.description || b.summary || 'Details will be announced soon.')}</div>${skills ? `<div class="detail-skills"><h3>Skills & topics</h3><div class="skill-list">${skills}</div></div>` : ''}</div>
      <a class="back-link bottom-back" href="#/">${icon('arrow', 16)} Back to all bounties</a></article>
      <aside class="detail-aside"><div class="reward-card"><div class="reward-kicker">${icon('spark', 16)} BOUNTY REWARD</div><div class="reward-amount">${pot(b)}</div><p class="reward-note">Total prize pool</p><div class="reward-divider"></div><div class="aside-row"><span>${icon('clock', 16)} Deadline</span><strong>${deadlineLabel(b)}</strong></div><div class="aside-subtext">${date(b.deadline)}</div><div class="aside-row aside-entries"><span>${icon('users', 16)} Entries</span><strong>${entryText(b)}</strong></div>${b.entryFeeUsd ? `<div class="aside-row"><span>Entry fee</span><strong>${money(b.entryFeeUsd)}</strong></div>` : ''}<a class="apply-button ${active(b) ? '' : 'is-closed'}" href="${ext}" target="_blank" rel="noreferrer">${active(b) ? 'View bounty & enter' : 'View on make.fun'} ${icon('arrow', 17)}</a><p class="external-note">You’ll continue to make.fun to submit your work.</p></div><div class="aside-prompt"><span class="prompt-icon">✳</span><div><strong>Make something matter.</strong><p>Great ideas deserve great makers.</p></div></div></aside></div>
    <footer class="site-footer detail-footer"><a class="brand" href="#/"><span class="brand-mark">m<span>✳</span></span><span>make.fun</span></a><span>Find your people. Make something matter.</span><a href="https://make.fun" target="_blank" rel="noreferrer">Visit make.fun ${icon('arrow', 14)}</a></footer></div>`;
}

export const iconForView = icon;
