'use strict';
(() => {
  const badges = [...document.querySelectorAll('[data-repo]')];
  const refreshInterval = 10 * 60 * 1000;
  let busy = false, lastAttempt = 0;
  function show(badge, value, stale = false) {
    badge.querySelector('.star-count').textContent = value.count.toLocaleString();
    badge.title = `${stale ? 'Last known' : 'GitHub'} stars · checked ${new Date(value.time).toLocaleString()}${stale ? ' · refresh unavailable' : ''}`;
    badge.setAttribute('aria-label', `${badge.dataset.repo}: ${value.count} GitHub stars`);
  }
  const read = key => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  async function refresh() {
    if (busy || document.hidden) return;
    busy = true; lastAttempt = Date.now();
    await Promise.allSettled(badges.map(async badge => {
      const key = `github-stars:${badge.dataset.repo}`;
      const cached = read(key);
      const fallback = cached && Number.isInteger(cached.count) ? cached : {
        count: Number(badge.querySelector('.star-count').textContent.replaceAll(',', '')),
        time: badge.dataset.checked
      };
      show(badge, fallback, true);
      const abort = new AbortController();
      const timeout = setTimeout(() => abort.abort(), 10000);
      try {
        const response = await fetch(`https://api.github.com/repos/${badge.dataset.repo}`, {
          cache: 'no-store', signal: abort.signal, headers: {Accept: 'application/vnd.github+json'}
        });
        if (!response.ok) throw new Error(`GitHub ${response.status}`);
        const data = await response.json();
        if (!Number.isInteger(data.stargazers_count)) throw new Error('Invalid count');
        const value = {count: data.stargazers_count, time: Date.now()};
        show(badge, value);
        try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
      } catch { show(badge, fallback, true); }
      finally { clearTimeout(timeout); }
    }));
    busy = false;
  }
  refresh();
  setInterval(refresh, refreshInterval);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastAttempt >= refreshInterval) refresh();
  });
})();
