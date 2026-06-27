// ===== DATA =====
const DATA_VERSION = 1;

// GitHub config (must be declared early, before any sync functions reference it)
const GITHUB_CONFIG = {
  owner: 'KuroNya39',
  repo: 'kuro-no-nekohouse',
  dataFile: 'data.json',
  guestbookFile: 'guestbook.json',
  branch: 'main'
};

function safeJSONParse(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    console.warn('Failed to parse localStorage item:', key, e);
    return defaultValue;
  }
}

function safeJSONStringify(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('Failed to save to localStorage:', key, e);
    announceToScreenReader('保存失败，可能是存储空间不足');
    return false;
  }
}

let categories = safeJSONParse('categories', [
  {
    id: 'miku', name: '初音未来', desc: 'VOCALOID 相关创作',
    image: 'miku.jpg',
    novels: [
      { id: 'miku-1', title: '星之声', author: '星夜', date: '2026-06-10', wordCount: 2800, tags: ['甜文', '短篇'], content: `这是初音未来分类下的示例小说内容。\n\n在这个示例中，你可以看到小说的排版效果。正文使用首字下沉的设计，段落之间有舒适的间距。\n\n当你提供真实的小说内容后，只需替换这里的文本即可。每一段会自动首行缩进，营造传统书籍的阅读体验。` },
      { id: 'miku-2', title: '虚拟歌姬的梦境', author: '月见', date: '2026-06-08', wordCount: 1500, tags: ['幻想', '中篇'], content: `这是另一篇示例小说。\n\n你可以为每个分类添加任意数量的小说。每篇小说都有独立的阅读页面，支持上一篇/下一篇导航。` }
    ]
  },
  {
    id: 'izuleo', name: '狮心', desc: '濑名泉 × 月永雷欧',
    image: 'izumileo.jpg',
    novels: [
      { id: 'leo-1', title: '骑士与王子', author: '蔷薇', date: '2026-06-05', wordCount: 3200, tags: ['甜文', '长篇'], content: `这是狮心分类下的示例小说。\n\n濑名泉与月永雷欧的故事将在这里展开。你可以将真实的小说内容替换这段占位文本。` }
    ]
  },
  {
    id: 'reiritsu', name: '零凛', desc: '朔间零 × 朔间凛月',
    image: 'reiritsu.jpg',
    novels: [
      { id: 'rei-1', title: '月夜下的兄弟', author: '黑羽', date: '2026-06-01', wordCount: 4100, tags: ['虐文', '中篇'], content: `这是零凛分类下的示例小说。\n\n朔间兄弟的故事在这里等待被阅读。提供你的小说文本后，这里将展示真实的内容。` }
    ]
  }
]);

let timelineData = safeJSONParse('timelineData', [
  { date: '2026-06-10', title: '网站上线', desc: '黒の猫窝正式对外开放，收录第一批小说。' },
  { date: '2026-06-08', title: '新增初音未来分类', desc: '收录了两篇 VOCALOID 相关创作。' },
  { date: '2026-06-05', title: '新增狮心分类', desc: '开始收录濑名泉×月永雷欧相关作品。' },
  { date: '2026-06-01', title: '建站构想', desc: '决定建立一个个人同人小说收藏站。' }
]);

let linksData = safeJSONParse('linksData', [
  { icon: '<span aria-hidden="true">LOF</span>', title: 'LOFTER', desc: '我的 LOFTER 主页', url: '#' },
  { icon: '<span aria-hidden="true">AO3</span>', title: 'AO3', desc: 'Archive of Our Own', url: 'https://archiveofourown.org/' },
  { icon: '<span aria-hidden="true">晋</span>', title: '晋江', desc: '晋江文学城', url: 'https://www.jjwxc.net/' },
  { icon: '<span aria-hidden="true">Wiki</span>', title: 'Vocaloid Wiki', desc: 'Vocaloid 中文维基', url: 'https://w.atwiki.jp/vocaloid/' }
]);

// ===== STATE =====
let currentCategory = null;
let currentNovelIndex = 0;
let currentSort = 'default';
let sortAscending = false; // 默认降序（最新的在前）
let currentAuthorFilter = null;
let isAdmin = false;
let navHistory = []; // Navigation history stack

// ===== ARIA Live Announcements =====
function announceToScreenReader(message) {
  const liveRegion = document.getElementById('ariaLive');
  if (liveRegion) {
    liveRegion.textContent = message;
    setTimeout(() => { liveRegion.textContent = ''; }, 1000);
  }
}

function showToast(message, type) {
  type = type || 'success';
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'toast-notification toast-' + type;
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 24px;z-index:99999;font-size:0.85rem;font-family:var(--font-serif);border-radius:0px;animation:staggerFadeIn 0.3s ease both;pointer-events:none;';
  if (type === 'success') {
    toast.style.cssText += 'background:var(--accent-primary);color:white;border:1px solid var(--accent-primary);';
  } else if (type === 'error') {
    toast.style.cssText += 'background:var(--accent-rose);color:white;border:1px solid var(--accent-rose);';
  } else {
    toast.style.cssText += 'background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-light);';
  }
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
  initTheme();
  initColorScheme();
  initScrollProgress();
  initSearch();
  initSort();
  initAdmin();
  initBackToTop();

  // Try to load latest data from GitHub first
  const loaded = await loadFromGitHub();
  if (loaded) {
    githubSyncStatus = 'synced';
  }

  // Data migration: rename old IDs
  categories.forEach(c => { if (c.id === 'leoizumi') c.id = 'izuleo'; });

  renderHomePage();
  renderGuestbookIntro();
  renderStats();
  renderCategories();
  renderTimeline();
  renderLinks();
  renderAboutPage();
  initNav();
  initReaderSettings();
  initReaderAutoHide();
  initHashRouter();
  initTypewriterEffect();
  initSwipeNavigation();
  updateSyncUI();
  hideLoading();
  } catch(err) {
    console.error('[Init] Error during initialization:', err);
    hideLoading();
  }
});
function hideLoading() {
  document.getElementById('loadingOverlay').classList.add('hidden');
}

function saveAllData() {
  safeJSONStringify('categories', categories);
  safeJSONStringify('aboutData', aboutData);
  safeJSONStringify('siteConfig', siteConfig);
  safeJSONStringify('timelineData', timelineData);
  safeJSONStringify('linksData', linksData);
  debouncedSyncToGitHub();
}

function saveData() { saveAllData(); }

// ===== GITHUB DATA SYNC =====
let githubSyncTimer = null;
function debouncedSyncToGitHub() {
  if (githubSyncTimer) clearTimeout(githubSyncTimer);
  githubSyncTimer = setTimeout(() => {
    syncToGitHub();
  }, 2000);
}

// Token is stored in localStorage (set once by admin, never in source code)
function getGitHubToken() {
  return localStorage.getItem('github_token') || '';
}
function setGitHubToken(token) {
  localStorage.setItem('github_token', token);
}

function saveGitHubToken() {
  const token = document.getElementById('githubTokenInput').value.trim();
  if (!token) { alert('请输入令牌'); return; }
  setGitHubToken(token);
  updateSyncUI();
  announceToScreenReader('令牌已保存');
  alert('令牌已保存！现在可以同步数据了。');
}

function initTokenInput() {
  const token = getGitHubToken();
  if (token) {
    document.getElementById('githubTokenInput').value = token;
  }
}

let githubSyncStatus = 'idle'; // idle | syncing | synced | error
let githubSha = null; // SHA of the current data.json on GitHub (for updates)

function buildSiteData() {
  // Exclude colorScheme from siteConfig as it's a user preference, not site data
  const { colorScheme, ...siteConfigWithoutColorScheme } = siteConfig;
  return {
    _version: 2,
    _updatedAt: new Date().toISOString(),
    categories: categories,
    aboutData: aboutData,
    siteConfig: siteConfigWithoutColorScheme,
    timelineData: timelineData,
    linksData: linksData
  };
}

function loadSiteData(data) {
  if (!data || !data.categories) return false;
  
  // GitHub is the single source of truth - always use remote data
  // (every save uploads the complete dataset, so remote is always the latest full snapshot)
  categories = data.categories;
  safeJSONStringify('categories', categories);
  
  if (data.siteConfig) {
    siteConfig = data.siteConfig;
    safeJSONStringify('siteConfig', siteConfig);
  }
  
  if (data.aboutData) {
    aboutData = data.aboutData;
    safeJSONStringify('aboutData', aboutData);
  }
  
  if (data.timelineData) { timelineData = data.timelineData; safeJSONStringify('timelineData', timelineData); }
  if (data.linksData) { linksData = data.linksData; safeJSONStringify('linksData', linksData); }
  
  return true;
}

async function syncToGitHub() {
  const token = getGitHubToken();
  if (!token) {
    console.log('[Sync] No GitHub token, skipping sync.');
    githubSyncStatus = 'error';
    updateSyncUI();
    return;
  }
  if (githubSyncStatus === 'syncing') return;
  githubSyncStatus = 'syncing';
  updateSyncUI();

  const content = JSON.stringify(buildSiteData(), null, 2);
  const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;

  try {
    // First, try to get the current file SHA (needed for update)
    if (!githubSha) {
      try {
        const res = await fetch(url, {
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (res.ok) {
          const file = await res.json();
          githubSha = file.sha;
        }
      } catch (e) { /* file doesn't exist yet, that's fine */ }
    }

    // Create or update the file
    const body = {
      message: 'Update site data - ' + new Date().toLocaleString('zh-CN'),
      content: btoa(unescape(encodeURIComponent(content))),
      branch: GITHUB_CONFIG.branch
    };
    if (githubSha) body.sha = githubSha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const result = await res.json();
      githubSha = result.content.sha;
      githubSyncStatus = 'synced';
      console.log('[Sync] Data synced to GitHub successfully.');
    } else {
      const err = await res.json();
      console.error('[Sync] GitHub sync error:', err);
      // If SHA mismatch (409), refresh SHA and retry once
      if (res.status === 409 || (err.message && err.message.includes('SHA'))) {
        console.log('[Sync] SHA mismatch, refreshing and retrying...');
        githubSha = null;
        const retryUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;
        const shaRes = await fetch(retryUrl, {
          headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
        });
        if (shaRes.ok) {
          const shaFile = await shaRes.json();
          githubSha = shaFile.sha;
          // Retry the PUT with correct SHA
          body.sha = githubSha;
          const retryRes = await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' },
            body: JSON.stringify(body)
          });
          if (retryRes.ok) {
            const retryResult = await retryRes.json();
            githubSha = retryResult.content.sha;
            githubSyncStatus = 'synced';
            console.log('[Sync] Retry succeeded.');
          } else {
            const retryErr = await retryRes.json();
            console.error('[Sync] Retry also failed:', retryErr);
            githubSyncStatus = 'error';
          }
        } else {
          githubSyncStatus = 'error';
        }
      } else {
        githubSyncStatus = 'error';
        if (err.message) console.error('[Sync] Error message:', err.message);
      }
    }
  } catch (e) {
    console.error('[Sync] GitHub sync failed:', e);
    githubSyncStatus = 'error';
  }
  updateSyncUI();
}

async function loadFromGitHub() {
  // Use raw.githubusercontent.com for reading — no API rate limit, no token needed
  const rawUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.dataFile}?t=${Date.now()}`;
  try {
    console.log('[Sync] Fetching latest data from GitHub (raw)...');
    const res = await fetch(rawUrl, { cache: 'no-cache' });
    if (!res.ok) {
      if (res.status === 404) {
        console.log('[Sync] No remote data file found, using local data.');
      } else {
        console.error('[Sync] Fetch failed with status', res.status);
      }
      return false;
    }
    const text = await res.text();
    const data = JSON.parse(text);
    console.log('[Sync] Successfully loaded data from GitHub, updated at:', data._updatedAt);
    // Also fetch SHA via API (with token if available) for later writes
    fetchGitHubSha();
    return loadSiteData(data);
  } catch (e) {
    console.error('[Sync] Failed to load from GitHub:', e);
    // Fallback: try to use localStorage data
    try {
      const localCategories = localStorage.getItem('categories');
      if (localCategories) {
        console.log('[Sync] GitHub fetch failed, using localStorage data as fallback.');
        return loadSiteData({
          categories: JSON.parse(localCategories),
          siteConfig: JSON.parse(localStorage.getItem('siteConfig') || 'null'),
          aboutData: JSON.parse(localStorage.getItem('aboutData') || 'null'),
          timelineData: JSON.parse(localStorage.getItem('timelineData') || 'null'),
          linksData: JSON.parse(localStorage.getItem('linksData') || 'null')
        });
      }
    } catch (fallbackErr) {
      console.error('[Sync] Fallback to localStorage also failed:', fallbackErr);
    }
    return false;
  }
}

// Fetch file SHA for write operations (only needed when saving)
async function fetchGitHubSha() {
  const token = getGitHubToken();
  if (!token) return;
  try {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.dataFile}`;
    const res = await fetch(url, { headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' } });
    if (res.ok) {
      const file = await res.json();
      githubSha = file.sha;
    }
  } catch (e) { /* silent */ }
}

function updateSyncUI() {
  const el = document.getElementById('githubSyncStatus');
  if (!el) return;
  const statusMap = {
    idle: { text: '未同步', icon: '○' },
    syncing: { text: '同步中...', icon: '◎' },
    synced: { text: '已同步', icon: '●' },
    error: { text: '同步失败', icon: '✕' }
  };
  const s = statusMap[githubSyncStatus] || statusMap.idle;
  el.textContent = s.icon + ' ' + s.text;
  el.style.color = githubSyncStatus === 'synced' ? 'var(--accent-primary)' :
                    githubSyncStatus === 'error' ? 'var(--accent-rose)' :
                    githubSyncStatus === 'syncing' ? 'var(--text-muted)' : 'var(--text-muted)';
}

// ===== DATA IMPORT / EXPORT =====
function exportData() {
  const data = {
    _version: 2,
    _exportedAt: new Date().toISOString(),
    categories: categories,
    aboutData: aboutData,
    siteConfig: siteConfig,
    timelineData: timelineData,
    linksData: linksData,
    theme: localStorage.getItem('theme') || ''
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site-data-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  announceToScreenReader('数据已导出');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.categories || !Array.isArray(data.categories)) {
        alert('文件格式不正确，缺少 categories 数据');
        return;
      }
      if (!confirm('导入将覆盖当前所有数据（小说、关于页等），确定继续吗？')) return;
      categories = data.categories;
      if (data.aboutData) { aboutData = data.aboutData; safeJSONStringify('aboutData', aboutData); }
      if (data.siteConfig) { siteConfig = data.siteConfig; safeJSONStringify('siteConfig', siteConfig); }
      if (data.timelineData) { timelineData = data.timelineData; safeJSONStringify('timelineData', timelineData); }
      if (data.linksData) { linksData = data.linksData; safeJSONStringify('linksData', linksData); }
      if (data.theme) { localStorage.setItem('theme', data.theme); }
      saveData();
      // Re-render everything
      renderStats();
      renderCategories();
      renderAboutPage();
      renderAdminEditNovelList();
      renderTimeline();
      renderLinks();
      // Re-apply theme
      if (data.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀';
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').textContent = '☾';
      }
      announceToScreenReader('数据导入成功');
      alert('数据导入成功！');
    } catch (err) {
      alert('导入失败：文件解析错误\n' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ===== THEME =====
function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeToggle').textContent = '☀';
  }
  document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      document.getElementById('themeToggle').textContent = '☾';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      document.getElementById('themeToggle').textContent = '☀';
    }
    updateBackgroundPattern();
    updateGiscusTheme();
  });

  // Real-time system theme listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀';
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeToggle').textContent = '☾';
      }
      updateBackgroundPattern();
      updateGiscusTheme();
    }
  });
}

// ===== COLOR SCHEME =====
function setColorScheme(scheme) {
  document.documentElement.setAttribute('data-color-scheme', scheme);
  localStorage.setItem('colorScheme', scheme);
  // Update active option and current dot
  document.querySelectorAll('.scheme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scheme === scheme);
  });
  // Update the current dot background
  const activeOption = document.querySelector('.scheme-option.active');
  const currentDot = document.getElementById('schemeCurrentDot');
  if (activeOption && currentDot) {
    const dot = activeOption.querySelector('.scheme-dot');
    if (dot) currentDot.style.background = dot.style.background;
  }
  // Close the dropdown menu
  const menu = document.getElementById('colorSchemeMenu');
  if (menu) menu.classList.remove('active');
  // Brief flash transition for background pattern
  document.body.style.opacity = '0.98';
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);
  // Update background pattern color
  updateBackgroundPattern();
  updateGiscusTheme();
}

function initColorScheme() {
  const saved = localStorage.getItem('colorScheme');
  const scheme = saved || 'miku';
  document.documentElement.setAttribute('data-color-scheme', scheme);
  document.querySelectorAll('.scheme-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.scheme === scheme);
  });
  // Update the current dot background
  const activeOption = document.querySelector('.scheme-option.active');
  const currentDot = document.getElementById('schemeCurrentDot');
  if (activeOption && currentDot) {
    const dot = activeOption.querySelector('.scheme-dot');
    if (dot) currentDot.style.background = dot.style.background;
  }
}

// Color scheme dropdown toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('colorSchemeToggle');
  const menu = document.getElementById('colorSchemeMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!document.getElementById('colorSchemeDropdown').contains(e.target)) {
        menu.classList.remove('active');
      }
    });
  }
});

function updateBackgroundPattern() {
  // Background pattern now uses CSS variables, no JS update needed
}

// ===== TYPEWRITER EFFECT =====
function initTypewriterEffect() {
  const title = document.getElementById('siteTitleEl');
  if (!title) return;
  const text = title.textContent;
  title.textContent = '';
  title.style.overflow = 'hidden';
  title.style.whiteSpace = 'nowrap';
  title.style.borderRight = '2px solid var(--accent-primary)';
  title.style.animation = 'blink-caret 0.75s step-end infinite';

  let i = 0;
  function type() {
    if (i < text.length) {
      title.textContent += text.charAt(i);
      i++;
      setTimeout(type, 150);
    } else {
      title.style.borderRight = 'none';
      title.style.animation = 'none';
      title.style.whiteSpace = 'normal';
    }
  }
  setTimeout(type, 800);
}

// ===== SCROLL PROGRESS =====
function initScrollProgress() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        document.getElementById('scrollProgress').style.width = (scrollTop / docHeight * 100) + '%';
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  const mql = window.matchMedia('(max-width: 600px)');
  let ticking = false;

  function handleScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        if (window.scrollY > 400) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  function update() {
    if (mql.matches) {
      window.removeEventListener('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll);
    }
  }

  mql.addEventListener('change', update);
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== SEARCH =====
function initSearch() {
  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  let timeout;

  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const query = input.value.trim().toLowerCase();
      if (!query) { results.classList.remove('active'); return; }

      let matches = [];
      categories.forEach(cat => {
        cat.novels.forEach(novel => {
          if (novel.title.toLowerCase().includes(query) || novel.author.toLowerCase().includes(query) || novel.content.toLowerCase().includes(query)) {
            matches.push({ ...novel, categoryName: cat.name, categoryId: cat.id });
          }
        });
      });

      results.classList.add('active');
      if (matches.length === 0) {
        results.innerHTML = `<div class="search-empty">没有找到匹配的内容</div>`;
      } else {
        const frag = document.createDocumentFragment();
        matches.forEach(m => {
          const div = document.createElement('div');
          div.className = 'search-result-item';
          div.setAttribute('role', 'button');
          div.setAttribute('tabindex', '0');
          div.onclick = () => goToNovel(m.categoryId, m.id);
          div.onkeydown = (e) => { if (e.key === 'Enter') goToNovel(m.categoryId, m.id); };
          const h4 = document.createElement('h4');
          h4.innerHTML = highlightText(m.title, query);
          const p = document.createElement('p');
          p.textContent = `作者：${m.author} · 分类：${m.categoryName} · ${m.wordCount}字`;
          div.appendChild(h4);
          div.appendChild(p);
          frag.appendChild(div);
        });
        results.innerHTML = '';
        results.appendChild(frag);
      }
    }, 500);
  });

  input.addEventListener('blur', () => setTimeout(() => results.classList.remove('active'), 200));
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function highlightText(text, query) {
  const idx = text.toLowerCase().indexOf(query);
  if (idx === -1) return escapeHTML(text);
  const before = escapeHTML(text.slice(0, idx));
  const match = escapeHTML(text.slice(idx, idx + query.length));
  const after = escapeHTML(text.slice(idx + query.length));
  return before + '<span class="highlight">' + match + '</span>' + after;
}

function goToNovel(catId, novelId) {
  document.getElementById('searchResults').classList.remove('active');
  document.getElementById('searchInput').value = '';
  const cat = categories.find(c => c.id === catId);
  if (!cat) { showToast('分类不存在'); return; }
  currentCategory = cat;
  const novelIndex = currentCategory.novels.findIndex(n => n.id === novelId);
  showNovel(novelIndex);
}

// ===== SORT =====
function initSort() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'sortOrderBtn') {
        sortAscending = !sortAscending;
        btn.textContent = sortAscending ? '↑ 升序' : '↓ 降序';
        if (currentCategory) renderNovelList();
        return;
      }
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      if (currentCategory) renderNovelList();
    });
  });
}

// ===== ADMIN - New Drawer Style =====
function initAdmin() {
  initTokenInput();
  document.getElementById('adminToggle').addEventListener('click', () => {
    if (isAdmin) {
      openAdmin();
    } else {
      document.getElementById('loginModal').classList.add('active');
      setTimeout(() => document.getElementById('adminPassword').focus(), 100);
    }
  });

  document.getElementById('loginModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('loginModal')) {
      document.getElementById('loginModal').classList.remove('active');
    }
  });

  document.getElementById('adminPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  // Focus trap for login modal
  document.getElementById('loginModal').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.getElementById('loginModal').classList.remove('active');
    }
  });
}

// Simple SHA-256 hash function
async function sha256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // SHA-256 hash

async function doLogin() {
  const pw = document.getElementById('adminPassword').value;
  const hash = await sha256(pw);
  if (hash === ADMIN_PASSWORD_HASH) {
    isAdmin = true;
    document.getElementById('adminToggle').classList.add('active');
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('adminPassword').value = '';
    openAdmin();
    announceToScreenReader('登录成功，管理面板已打开');
  } else {
    alert('密码错误');
    document.getElementById('adminPassword').value = '';
  }
}

function openAdmin() {
  document.getElementById('adminOverlay').classList.add('active');
  document.getElementById('adminDrawer').classList.add('active');
  renderAdminEditNovelList();
  // Focus first focusable element
  setTimeout(() => {
    const firstFocusable = document.querySelector('#adminDrawer button, #adminDrawer input, #adminDrawer select, #adminDrawer textarea');
    if (firstFocusable) firstFocusable.focus();
  }, 100);
}

function closeAdmin() {
  document.getElementById('adminOverlay').classList.remove('active');
  document.getElementById('adminDrawer').classList.remove('active');
  // Return focus to admin toggle
  document.getElementById('adminToggle').focus();
}

function updateWordCount() {
  // 从所有章节文本框中收集内容并计算总字数
  const container = document.getElementById('addChapterList');
  if (!container) return;
  const textareas = container.querySelectorAll('.chapter-item textarea');
  let totalContent = '';
  textareas.forEach(ta => { totalContent += ta.value; });
  const count = totalContent.replace(/\s/g, '').length;
  document.getElementById('adminWords').value = count;
  document.getElementById('wordCountHint').textContent = '已自动计算：' + count + ' 字';
}

// ===== 章节管理辅助函数 =====

// 添加小说表单中添加章节字段
function addChapterField(mode) {
  const listId = mode === 'add' ? 'addChapterList' : null;
  const container = document.getElementById(listId);
  if (!container) return;
  const count = container.querySelectorAll('.chapter-item').length;
  const div = document.createElement('div');
  div.className = 'chapter-item';
  div.innerHTML = `
    <div class="chapter-item-header">
      <span>章节 ${count + 1}</span>
      <button class="chapter-del-btn" onclick="removeChapterField(this, '${mode}')" ${count < 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>删除</button>
    </div>
    <input type="text" placeholder="章节标题，如：第一章 开端" oninput="updateWordCount()">
    <textarea placeholder="在这里粘贴章节正文内容..." oninput="updateWordCount()"></textarea>
  `;
  container.appendChild(div);
  updateWordCount();
}

// 添加小说表单中删除章节字段
function removeChapterField(btn, mode) {
  const container = btn.closest('#addChapterList') || btn.closest('.chapter-manager').querySelector('.chapter-item')?.parentElement;
  const manager = btn.closest('.chapter-manager');
  const items = manager.querySelectorAll('.chapter-item');
  if (items.length <= 1) return; // 至少保留一个章节
  btn.closest('.chapter-item').remove();
  // 重新编号
  manager.querySelectorAll('.chapter-item').forEach((item, i) => {
    item.querySelector('.chapter-item-header span').textContent = '章节 ' + (i + 1);
  });
  updateWordCount();
}

// 编辑小说表单中添加章节
function addEditChapter(novelId) {
  const container = document.getElementById('editChapterList-' + novelId);
  if (!container) return;
  const count = container.querySelectorAll('.chapter-item').length;
  const div = document.createElement('div');
  div.className = 'chapter-item';
  div.innerHTML = `
    <div class="chapter-item-header">
      <span>章节 ${count + 1}</span>
      <button class="chapter-del-btn" onclick="removeEditChapter(this, '${novelId}')">删除</button>
    </div>
    <input type="text" class="edit-chapter-title" value="" placeholder="章节标题">
    <textarea class="edit-chapter-content" placeholder="章节内容..."></textarea>
  `;
  container.appendChild(div);
}

// 编辑小说表单中删除章节
function removeEditChapter(btn, novelId) {
  const container = document.getElementById('editChapterList-' + novelId);
  const items = container.querySelectorAll('.chapter-item');
  if (items.length <= 1) return; // 至少保留一个章节
  btn.closest('.chapter-item').remove();
  // 重新编号
  container.querySelectorAll('.chapter-item').forEach((item, i) => {
    item.querySelector('.chapter-item-header span').textContent = '章节 ' + (i + 1);
  });
  // 如果只剩一个，禁用删除按钮
  if (container.querySelectorAll('.chapter-item').length <= 1) {
    const delBtn = container.querySelector('.chapter-del-btn');
    if (delBtn) { delBtn.disabled = true; delBtn.style.opacity = '0.3'; delBtn.style.cursor = 'not-allowed'; }
  }
}

function addNovel() {
  const title = document.getElementById('adminTitle').value.trim();
  const author = document.getElementById('adminAuthor').value.trim();
  const catId = document.getElementById('adminCategory').value;
  const tags = document.getElementById('adminTags').value.split(',').map(t => t.trim()).filter(t => t);
  const preface = document.getElementById('adminPreface').value.trim();

  // 从章节表单收集数据
  const chapterItems = document.querySelectorAll('#addChapterList .chapter-item');
  const chapters = [];
  let allContent = '';
  chapterItems.forEach(item => {
    const chTitle = item.querySelector('input[type="text"]').value.trim() || '未命名章节';
    const chContent = item.querySelector('textarea').value;
    chapters.push({ title: chTitle, content: chContent });
    allContent += chContent;
  });

  if (!title || !author || chapters.length === 0 || !chapters.some(c => c.content)) { alert('请填写完整信息，至少一个章节需要有内容'); return; }

  const words = allContent.replace(/\s/g, '').length;

  const cat = categories.find(c => c.id === catId);
  const newNovel = {
    id: catId + '-' + Date.now(),
    title, author, date: new Date().toISOString().slice(0, 10),
    wordCount: words, tags, chapters, preface,
    content: allContent // 向后兼容：保留 content 字段
  };
  cat.novels.push(newNovel);
  saveData();
  clearAdminForm();
  renderAdminEditNovelList();
  renderStats();
  renderCategories();
  announceToScreenReader('小说添加成功');
  showToast('小说添加成功');
}

function deleteNovel(catId, novelId) {
  if (!confirm('确定删除这篇小说吗？')) return;
  const cat = categories.find(c => c.id === catId);
  cat.novels = cat.novels.filter(n => n.id !== novelId);
  saveData();
  renderAdminEditNovelList();
  renderStats();
  renderCategories();
  announceToScreenReader('小说已删除');
  showToast('小说已删除');
}

function clearAdminForm() {
  document.getElementById('adminTitle').value = '';
  document.getElementById('adminAuthor').value = '';
  document.getElementById('adminTags').value = '';
  document.getElementById('adminPreface').value = '';
  document.getElementById('adminWords').value = '';
  document.getElementById('wordCountHint').textContent = '已自动计算：0 字';
  // 重置章节列表为单个空章节
  const chapterList = document.getElementById('addChapterList');
  chapterList.innerHTML = '';
  addChapterField('add');
}

function renderHomePage() {
  // Site title
  const titleEl = document.getElementById('siteTitleEl');
  if (titleEl) titleEl.innerHTML = '✦' + escapeHTML(siteConfig.siteName) + '✦';
  const subtitleEl = document.getElementById('siteSubtitleEl');
  if (subtitleEl) subtitleEl.textContent = siteConfig.siteSubtitle;
  // Hero
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) heroTitle.textContent = siteConfig.heroTitle;
  const heroDesc = document.getElementById('heroDesc');
  if (heroDesc) heroDesc.textContent = siteConfig.heroDesc;
  const heroTags = document.getElementById('heroTags');
  if (heroTags) {
    heroTags.innerHTML = (siteConfig.heroTags || []).map(t => '<span class="hero-tag">' + escapeHTML(t) + '</span>').join('');
  }
  // Footer
  const footerEl = document.getElementById('footerText');
  if (footerEl) footerEl.textContent = siteConfig.footerText;
  // Page title
  document.title = siteConfig.siteName + ' - ' + siteConfig.siteSubtitle;
}

function renderGuestbookIntro() {
  const introEl = document.getElementById('guestbookIntroText');
  if (introEl) introEl.textContent = siteConfig.guestbookIntro || '';
}

// ===== GUESTBOOK (Giscus) =====
function loadGiscus() {
  const wrapper = document.getElementById('giscusWrapper');
  if (!wrapper || wrapper.children.length > 0) return;
  
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark_dimmed' : 'light';
  
  const widget = document.createElement('giscus-widget');
  widget.setAttribute('repo', 'KuroNya39/kuro-no-nekohouse');
  widget.setAttribute('repo-id', 'R_kgDOS6pURQ');
  widget.setAttribute('category', 'Announcements');
  widget.setAttribute('category-id', 'DIC_kwDOS6pURc4C_Jv5');
  widget.setAttribute('mapping', 'pathname');
  widget.setAttribute('strict', '0');
  widget.setAttribute('reactions-enabled', '1');
  widget.setAttribute('emit-metadata', '1');
  widget.setAttribute('input-position', 'bottom');
  widget.setAttribute('theme', theme);
  widget.setAttribute('lang', 'zh-CN');
  wrapper.appendChild(widget);
  
  const script = document.createElement('script');
  script.src = 'https://giscus.app/client.js';
  script.async = true;
  wrapper.appendChild(script);
}

function updateGiscusTheme() {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark_dimmed' : 'light';
  const widget = document.querySelector('giscus-widget');
  if (widget) {
    widget.setAttribute('theme', theme);
  }
  // 兼容旧版本 iframe
  const iframe = document.querySelector('iframe.giscus-frame');
  if (iframe) {
    iframe.contentWindow.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
  }
}

// 监听 Giscus 消息，更新留言板登录状态
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://giscus.app') return;
  if (!(typeof event.data === 'object' && event.data.giscus)) return;
  const giscusData = event.data.giscus;
  if ('discussion' in giscusData && giscusData.viewer) {
    updateGuestbookLoginStatus(giscusData.viewer);
  }
});

function updateGuestbookLoginStatus(viewer) {
  const statusEl = document.getElementById('guestbookLoginStatus');
  if (!statusEl) return;
  if (viewer && viewer.login) {
    statusEl.textContent = '当前已登录：' + viewer.login;
    statusEl.style.display = 'block';
  } else {
    statusEl.style.display = 'none';
  }
}

// ===== STATS =====
function renderStats() {
  const totalNovels = categories.reduce((s, c) => s + c.novels.length, 0);
  const totalWords = categories.reduce((s, c) => s + c.novels.reduce((ss, n) => ss + n.wordCount, 0), 0);
  const authors = new Set();
  categories.forEach(c => c.novels.forEach(n => authors.add(n.author)));

  const statsContainer = document.getElementById('statsRow');
  statsContainer.innerHTML = '';
  [
    { n: categories.length, l: '分类' },
    { n: totalNovels, l: '文章' },
    { n: authors.size, l: '作者' },
    { n: totalWords > 0 ? totalWords : 0, l: '总字数', format: true }
  ].forEach((s, i) => {
    const div = document.createElement('div');
    div.className = 'stat-item';
    const numSpan = document.createElement('div');
    numSpan.className = 'stat-number';
    numSpan.dataset.target = s.n;
    numSpan.dataset.format = s.format ? '1' : '0';
    numSpan.textContent = '0';
    const labelDiv = document.createElement('div');
    labelDiv.className = 'stat-label';
    labelDiv.textContent = s.l;
    div.appendChild(numSpan);
    div.appendChild(labelDiv);
    statsContainer.appendChild(div);
  });
  // Stat items entrance animation
  document.querySelectorAll('.stat-item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
      // Count-up animation
      const numEl = item.querySelector('.stat-number');
      if (numEl) animateCountUp(numEl);
    }, 100 + i * 80);
  });
}

function animateCountUp(el) {
  const target = parseInt(el.dataset.target) || 0;
  const shouldFormat = el.dataset.format === '1';
  if (target === 0) { el.textContent = shouldFormat ? '-' : '0'; return; }
  const duration = 1200;
  const startTime = performance.now();
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);
    el.textContent = shouldFormat ? current.toLocaleString() : current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';
  categories.forEach((cat, i) => {
    const div = document.createElement('div');
    div.className = 'category-card card-shine';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `${cat.name}分类，${cat.novels.length}篇文章`);
    div.onclick = () => showCategory(cat.id);
    div.onkeydown = (e) => { if (e.key === 'Enter') showCategory(cat.id); };
    const img = document.createElement('img');
    img.src = cat.image;
    img.alt = cat.name + '分类封面';
    img.className = 'category-image';
    img.onerror = function() {
      this.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.cssText = 'width:100%;aspect-ratio:16/9;background:linear-gradient(135deg,var(--accent-primary-light),var(--accent-primary));display:flex;align-items:center;justify-content:center;font-size:2rem;color:white;opacity:0.6;';
      fallback.textContent = '✦';
      this.parentNode.insertBefore(fallback, this.nextSibling);
    };
    const body = document.createElement('div');
    body.className = 'category-body';
    body.innerHTML = `
      <div class="category-name">${escapeHTML(cat.name)}</div>
      <div class="category-desc">${escapeHTML(cat.desc)}</div>
      <div class="category-footer">
        <span class="category-count">${cat.novels.length} 篇文章</span>
        <span class="category-arrow">→</span>
      </div>
    `;
    div.appendChild(img);
    div.appendChild(body);
    grid.appendChild(div);
  });
  // Card entrance animation
  document.querySelectorAll('.category-card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 + i * 80);
  });
  // Mouse tilt effect for category cards (desktop only)
  if (!window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -3;
      const rotateY = (x - centerX) / centerX * 3;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
  }
}

// ===== NAVIGATION =====
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      showPage(btn.dataset.page);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

const PAGE_TITLES = {
  home: '首页',
  category: '分类',
  reader: '阅读中',
  timeline: '时间轴',
  guestbook: '留言板',
  links: '友情链接',
  about: '关于'
};

// Scroll reveal observer
const scrollRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

function observeScrollReveal() {
  document.querySelectorAll('.scroll-reveal').forEach(el => scrollRevealObserver.observe(el));
}

function showPage(name, pushState) {
  if (pushState === undefined) pushState = true;
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const targetPage = document.getElementById('page-' + name);
  if (targetPage) targetPage.classList.add('active');
  document.getElementById('searchResults').classList.remove('active');
  document.getElementById('searchInput').value = '';
  // Use instant scroll when called from popstate (pushState=false), smooth otherwise
  window.scrollTo({ top: 0, behavior: pushState ? 'smooth' : 'auto' });

  // Load Giscus when guestbook page is shown
  if (name === 'guestbook') {
    loadGiscus();
  }

  // Update page title
  document.title = (PAGE_TITLES[name] || '首页') + ' - ' + (siteConfig.siteName || '黒の猫窝');

  // Focus management
  if (targetPage) {
    targetPage.setAttribute('tabindex', '-1');
    targetPage.focus({ preventScroll: true });
  }

  // Update URL hash
  if (pushState) {
    if (name !== 'home') {
      window.history.pushState({ page: name }, '', '#/' + name);
    } else {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    }
  }

  // Scroll reveal
  observeScrollReveal();
}

// ===== HASH ROUTER =====
function initHashRouter() {
  // Disable browser automatic scroll restoration on popstate
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page === 'category' && e.state.catId) {
      showCategory(e.state.catId, false);
    } else if (e.state && e.state.page === 'reader' && e.state.catId !== undefined) {
      const cat = categories.find(c => c.id === e.state.catId);
      if (cat) {
        currentCategory = cat;
        showNovel(e.state.novelIdx, e.state.chapterIdx, false);
      }
    } else if (e.state && e.state.page) {
      showPage(e.state.page, false);
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === e.state.page);
      });
    } else {
      showPage('home', false);
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === 'home');
      });
    }
    // Force scroll to top on popstate to prevent browser scroll restoration
    window.scrollTo(0, 0);
  });

  // Handle initial hash
  const hash = window.location.hash;
  if (hash && hash.startsWith('#/')) {
    const parts = hash.slice(2).split('/');
    const page = parts[0];
    if (parts[0] === 'category' && parts[1]) {
      showCategory(parts[1], false);
    } else if (parts[0] === 'reader' && parts[1] && parts[2] !== undefined) {
      const cat = categories.find(c => c.id === parts[1]);
      if (cat) {
        currentCategory = cat;
        showNovel(parseInt(parts[2]), parseInt(parts[3]) || 0, false);
      }
    } else if (PAGE_TITLES[page]) {
      showPage(page, false);
      document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === page);
      });
    }
  }

  // Add an extra history entry so back-button stays on site
  window.history.pushState({ page: 'home' }, '', window.location.pathname + window.location.hash);
}

// ===== CATEGORY PAGE =====
function showCategory(catId, shouldPushState) {
  if (shouldPushState === undefined) shouldPushState = true;
  currentCategory = categories.find(c => c.id === catId);
  if (!currentCategory) return;
  currentAuthorFilter = null;

  document.getElementById('categoryTitle').textContent = currentCategory.name;
  document.getElementById('categoryDesc').textContent = currentCategory.desc;

  // Category hero image removed per user request

  const authors = [...new Set(currentCategory.novels.map(n => n.author))];
  const filterContainer = document.getElementById('authorFilter');
  filterContainer.innerHTML = '';
  const label = document.createElement('span');
  label.className = 'sort-label';
  label.textContent = '作者：';
  filterContainer.appendChild(label);

  const allChip = document.createElement('span');
  allChip.className = 'author-chip active';
  allChip.textContent = '全部';
  allChip.onclick = () => filterByAuthor(null);
  filterContainer.appendChild(allChip);

  authors.forEach(a => {
    const chip = document.createElement('span');
    chip.className = 'author-chip';
    chip.textContent = a;
    chip.onclick = () => filterByAuthor(a);
    filterContainer.appendChild(chip);
  });

  const sidebar = document.getElementById('categorySidebar');
  sidebar.innerHTML = '';

  const authorWidget = document.createElement('div');
  authorWidget.className = 'sidebar-widget';
  authorWidget.innerHTML = '<h4>作者列表</h4>';
  const authorList = document.createElement('ul');
  authors.forEach(a => {
    const li = document.createElement('li');
    li.textContent = a;
    const count = document.createElement('span');
    count.className = 'widget-count';
    count.textContent = currentCategory.novels.filter(n => n.author === a).length;
    li.appendChild(count);
    li.onclick = () => filterByAuthor(a);
    authorList.appendChild(li);
  });
  authorWidget.appendChild(authorList);
  sidebar.appendChild(authorWidget);

  renderNovelList();
  showPage('category', false);
  if (shouldPushState) {
    window.history.pushState({ page: 'category', catId: catId }, '', '#/category/' + catId);
  }
  document.title = currentCategory.name + ' - ' + siteConfig.siteName;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
}

function filterByAuthor(author) {
  currentAuthorFilter = author;
  document.querySelectorAll('.author-chip').forEach(chip => {
    chip.classList.toggle('active', (author === null && chip.textContent === '全部') || chip.textContent === author);
  });
  renderNovelList();
}

function filterByTag(tag) {
  // Simple tag filter implementation
  const novels = currentCategory.novels.filter(n => n.tags.includes(tag));
  renderFilteredNovelList(novels);
}

function renderFilteredNovelList(novels) {
  const list = document.getElementById('novelList');
  list.innerHTML = '';
  if (novels.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">暂无符合条件的小说</div>';
    return;
  }
  novels.forEach((novel, i) => {
    const div = document.createElement('div');
    div.className = 'novel-item';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.onclick = () => showNovel(currentCategory.novels.findIndex(n => n.id === novel.id));
    div.onkeydown = (e) => { if (e.key === 'Enter') showNovel(currentCategory.novels.findIndex(n => n.id === novel.id)); };

    // Calculate reading time
    const readTime = Math.max(1, Math.round(novel.wordCount / 300));

    div.innerHTML = `
      <div class="novel-number">${String(i + 1).padStart(2, '0')}</div>
      <div class="novel-info">
        <div class="novel-title">${escapeHTML(novel.title)}</div>
        <div class="novel-author">作者：${escapeHTML(novel.author)}</div>
        <div class="novel-meta">
          <span>${novel.date}</span>
          <span>${novel.wordCount} 字</span>
          <span>约 ${readTime} 分钟</span>
          <span>${Math.max(1, (novel.chapters || []).length)} 章</span>
        </div>
        <div class="novel-tags">${novel.tags.map(t => `<span class="novel-tag">${escapeHTML(t)}</span>`).join('')}</div>
      </div>
      <div class="novel-arrow">→</div>
    `;
    list.appendChild(div);
  });
  // Novel list entrance animation
  document.querySelectorAll('.novel-item').forEach((item, i) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-10px)';
    setTimeout(() => {
      item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      item.style.opacity = '1';
      item.style.transform = 'translateX(0)';
    }, 50 + i * 60);
  });
}

function renderNovelList() {
  let novels = [...currentCategory.novels];
  if (currentAuthorFilter) novels = novels.filter(n => n.author === currentAuthorFilter);
  if (currentSort === 'date') novels.sort((a, b) => sortAscending ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));
  if (currentSort === 'words') novels.sort((a, b) => sortAscending ? a.wordCount - b.wordCount : b.wordCount - a.wordCount);
  renderFilteredNovelList(novels);
}

// ===== READER =====
let currentChapterIndex = 0; // 当前章节索引
let scrollBehavior = 'keep'; // 'keep' 保持滚动位置，'topOfContent' 滚动到阅读内容顶部

function showNovel(index, chapterIdx, shouldPushState) {
  if (!currentCategory || index < 0 || index >= currentCategory.novels.length) return;
  if (shouldPushState === undefined) shouldPushState = true;

  // 保存当前滚动位置，用于切换章节后恢复
  const savedScrollY = window.scrollY;
  // 判断是否为章节切换（当前已在阅读器页且是同一小说）
  const readerPageActive = document.getElementById('page-reader')?.classList.contains('active');
  const isChapterSwitch = readerPageActive && index === currentNovelIndex && typeof chapterIdx === 'number';
  // 保存当前 scrollBehavior，然后重置
  const currentScrollBehavior = scrollBehavior;
  scrollBehavior = 'keep';

  currentNovelIndex = index;
  const novel = currentCategory.novels[index];

  // Page turn transition
  const readerContent = document.getElementById('readerContent');
  if (readerContent) {
    readerContent.classList.add('turning');
    setTimeout(() => readerContent.classList.remove('turning'), 300);
  }

  document.getElementById('readerCategory').textContent = currentCategory.name;
  document.getElementById('readerCategory').onclick = () => showCategory(currentCategory.id);
  document.getElementById('readerTitle').textContent = novel.title;

  // Calculate reading time
  const readTime = Math.max(1, Math.round(novel.wordCount / 300));
  document.getElementById('readerMeta').textContent = `${novel.date} · ${novel.wordCount} 字 · 约 ${readTime} 分钟 · ${Math.max(1, (novel.chapters || []).length)} 章 · ${novel.tags.join(' / ')}`;
  document.getElementById('readerAuthor').textContent = `作者：${novel.author}`;

  // 处理章节：向后兼容没有 chapters 字段的旧数据
  let chapters = [];
  if (novel.chapters && novel.chapters.length > 0) {
    chapters = novel.chapters;
  } else {
    chapters = [{ title: '全文', content: novel.content || '' }];
  }

  // 确定当前章节索引
  if (typeof chapterIdx === 'number' && chapterIdx >= 0 && chapterIdx < chapters.length) {
    currentChapterIndex = chapterIdx;
  } else {
    currentChapterIndex = 0;
  }

  const currentChapter = chapters[currentChapterIndex];

  // 渲染章节导航（仅多章节时显示）
  const contentDiv = document.getElementById('readerContent');
  const chapterSelectRow = document.getElementById('chapterSelectRow');
  const chapterSelect = document.getElementById('chapterSelect');
  if (chapters.length > 1) {
    chapterSelectRow.style.display = 'flex';
    chapterSelect.innerHTML = '';
    chapters.forEach((ch, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = ch.title;
      if (i === currentChapterIndex) opt.selected = true;
      chapterSelect.appendChild(opt);
    });
  } else {
    chapterSelectRow.style.display = 'none';
  }

  // 渲染当前章节内容
  contentDiv.innerHTML = '';

  // 前言（仅在第一章/全文时显示，放在章节标题上面）
  if (novel.preface && currentChapterIndex === 0) {
    const prefaceBlock = document.createElement('div');
    prefaceBlock.className = 'reader-preface-block';
    prefaceBlock.textContent = novel.preface;
    contentDiv.appendChild(prefaceBlock);
  }

  // 多章节时显示章节标题
  if (chapters.length > 1) {
    const chapterTitle = document.createElement('div');
    chapterTitle.className = 'reader-chapter-title';
    chapterTitle.textContent = currentChapter.title;
    contentDiv.appendChild(chapterTitle);
  }

  const paragraphs = currentChapter.content.split('\n');
  paragraphs.forEach(p => {
    const trimmed = p.trim();
    // 处理对齐标记
    const centerMatch = trimmed.match(/^<<<(.+?)>>>$/);
    const rightMatch = trimmed.match(/^\[\[(.+?)\]\]$/);
    if (centerMatch) {
      const para = document.createElement('p');
      para.style.textAlign = 'center';
      para.textContent = centerMatch[1];
      contentDiv.appendChild(para);
    } else if (rightMatch) {
      const para = document.createElement('p');
      para.style.textAlign = 'right';
      para.textContent = rightMatch[1];
      contentDiv.appendChild(para);
    } else if (trimmed) {
      const para = document.createElement('p');
      para.textContent = trimmed;
      contentDiv.appendChild(para);
    } else {
      // 空行保留为空段落，用 <br> 确保有可见间距
      const para = document.createElement('p');
      para.innerHTML = '<br>';
      contentDiv.appendChild(para);
    }
  });

  // Re-apply reader settings persistence
  const savedFontSize = localStorage.getItem('readerFontSize');
  const savedLineHeight = localStorage.getItem('readerLineHeight');
  if (savedFontSize) contentDiv.style.setProperty('--reader-font-size', savedFontSize + 'px');
  if (savedLineHeight) contentDiv.style.setProperty('--reader-line-height', savedLineHeight);
  const savedFont = localStorage.getItem('readerFont');
  if (savedFont) contentDiv.style.fontFamily = savedFont;

  const prevBtn = document.getElementById('prevNovel');
  const nextBtn = document.getElementById('nextNovel');
  if (chapters.length > 1) {
    prevBtn.style.visibility = currentChapterIndex > 0 ? 'visible' : 'hidden';
    nextBtn.style.visibility = currentChapterIndex < chapters.length - 1 ? 'visible' : 'hidden';
    prevBtn.onclick = () => { if (currentChapterIndex > 0) { scrollBehavior = 'topOfContent'; showNovel(currentNovelIndex, currentChapterIndex - 1); } };
    nextBtn.onclick = () => { if (currentChapterIndex < chapters.length - 1) { scrollBehavior = 'topOfContent'; showNovel(currentNovelIndex, currentChapterIndex + 1); } };
    prevBtn.textContent = '\u2190 \u4e0a\u4e00\u7ae0';
    nextBtn.textContent = '\u4e0b\u4e00\u7ae0 \u2192';
  } else {
    // 单章节小说：切换不同小说
    prevBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    nextBtn.style.visibility = index < currentCategory.novels.length - 1 ? 'visible' : 'hidden';
    prevBtn.onclick = () => { if (index > 0) { scrollBehavior = 'topOfContent'; showNovel(index - 1); } };
    nextBtn.onclick = () => { if (index < currentCategory.novels.length - 1) { scrollBehavior = 'topOfContent'; showNovel(index + 1); } };
    prevBtn.textContent = '\u2190 \u4e0a\u4e00\u7bc7';
    nextBtn.textContent = '\u4e0b\u4e00\u7bc7 \u2192';
  }

  // Show/hide edit button based on admin status
  const readerEditBtn = document.getElementById('readerEditBtn');
  if (readerEditBtn) readerEditBtn.style.display = isAdmin ? '' : 'none';
  // Hide edit panel when switching chapters
  const readerEditPanel = document.getElementById('readerEditPanel');
  if (readerEditPanel) readerEditPanel.style.display = 'none';

  showPage('reader', false);
  // 根据滚动行为标志决定滚动位置
  setTimeout(() => {
    if (currentScrollBehavior === 'topOfContent') {
      const readerEl = document.getElementById('readerContent');
      if (readerEl) window.scrollTo(0, readerEl.offsetTop);
    } else if (isChapterSwitch) {
      window.scrollTo(0, savedScrollY);
    }
  }, 0);
  if (shouldPushState) {
    window.history.pushState({ page: 'reader', catId: currentCategory.id, novelIdx: index, chapterIdx: chapterIdx || 0 }, '', '#/reader/' + currentCategory.id + '/' + index + '/' + (chapterIdx || 0));
  }
  // Set title AFTER showPage to avoid being overwritten
  document.title = novel.title + ' - ' + siteConfig.siteName;
}

function toggleReaderEdit() {
  const panel = document.getElementById('readerEditPanel');
  if (!panel) return;
  if (panel.style.display === 'none' || !panel.style.display) {
    const novel = currentCategory.novels[currentNovelIndex];
    let chapters = [];
    if (novel.chapters && novel.chapters.length > 0) {
      chapters = novel.chapters;
    } else {
      chapters = [{ title: '全文', content: novel.content || '' }];
    }
    const chapter = chapters[currentChapterIndex];
    document.getElementById('readerEditTitle').value = chapter.title;
    document.getElementById('readerEditContent').value = chapter.content;
    panel.style.display = 'block';
    const preview = document.getElementById('readerEditPreview');
    if (preview) preview.style.display = 'none';
  } else {
    panel.style.display = 'none';
  }
}

function saveReaderEdit() {
  const novel = currentCategory.novels[currentNovelIndex];
  let chapters = [];
  if (novel.chapters && novel.chapters.length > 0) {
    chapters = novel.chapters;
  } else {
    chapters = [{ title: '全文', content: novel.content || '' }];
    novel.chapters = chapters;
  }
  const newTitle = document.getElementById('readerEditTitle').value.trim();
  const newContent = document.getElementById('readerEditContent').value;
  chapters[currentChapterIndex].title = newTitle || chapters[currentChapterIndex].title;
  chapters[currentChapterIndex].content = newContent;
  saveData();
  showToast('排版已保存');
  showNovel(currentNovelIndex, currentChapterIndex, false);
  document.getElementById('readerEditPanel').style.display = 'none';
}

function previewMarkdown() {
  let content = document.getElementById('readerEditContent').value;
  content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  content = content.replace(/\*(.+?)\*/g, '<em>$1</em>');
  content = content.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border-light);margin:16px 0;">');
  // 处理对齐标记
  content = content.replace(/<<<(.+?)>>>/g, '<p style="text-align:center;margin:8px 0;">$1</p>');
  content = content.replace(/\[\[(.+?)\]\]/g, '<p style="text-align:right;margin:8px 0;">$1</p>');
  const preview = document.getElementById('readerEditPreview');
  if (preview) {
    preview.style.display = 'block';
    preview.innerHTML = content.split('\n').map(line => line ? `<p style="margin:8px 0;">${line}</p>` : '<p style="margin:8px 0;">&nbsp;</p>').join('');
  }
}

function insertEditAlign(direction) {
  const textarea = document.getElementById('readerEditContent');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const text = selected || '居中文字';
  let wrapped = '';
  let prefix = '', suffix = '';
  if (direction === 'center') { prefix = '<<<'; suffix = '>>>'; }
  else if (direction === 'right') { prefix = '[[['; suffix = ']]]'; }
  else return; // 左对齐不需要标记
  
  wrapped = prefix + text + suffix;
  textarea.value = textarea.value.substring(0, start) + wrapped + textarea.value.substring(end);
  
  // 恢复光标到选中的文本位置
  textarea.focus();
  const cursorPos = start + prefix.length;
  textarea.setSelectionRange(cursorPos, cursorPos + text.length);
}

function backToCategory() {
  if (currentCategory) {
    // Use history.back() to go to category page (popstate will handle it)
    // If there's no history entry, navigate directly
    if (window.history.state && window.history.state.page === 'reader') {
      window.history.back();
    } else {
      showCategory(currentCategory.id, false);
    }
  } else {
    showPage('home', false);
  }
}

// ===== COPY SHARE LINK =====
function copyShareLink() {
  const novel = currentCategory.novels[currentNovelIndex];
  const url = window.location.origin + window.location.pathname + '#/reader/' + currentCategory.id + '/' + currentNovelIndex + '/' + currentChapterIndex;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('shareBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '已复制';
    btn.classList.add('copied');
    announceToScreenReader('链接已复制到剪贴板');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('copied');
    }, 2000);
  }).catch(() => {
    announceToScreenReader('复制失败，请手动复制');
  });
}

// ===== READER SETTINGS =====
function initReaderSettings() {
  const fontSlider = document.getElementById('fontSizeSlider');
  const lineSlider = document.getElementById('lineHeightSlider');

  fontSlider.addEventListener('input', () => {
    const size = fontSlider.value;
    document.getElementById('fontSizeValue').textContent = size + 'px';
    document.getElementById('readerContent').style.setProperty('--reader-font-size', size + 'px');
    localStorage.setItem('readerFontSize', size);
  });

  lineSlider.addEventListener('input', () => {
    const height = lineSlider.value;
    document.getElementById('lineHeightValue').textContent = height;
    document.getElementById('readerContent').style.setProperty('--reader-line-height', height);
    localStorage.setItem('readerLineHeight', height);
  });

  if (localStorage.getItem('readerFontSize')) {
    fontSlider.value = localStorage.getItem('readerFontSize');
    document.getElementById('readerContent').style.setProperty('--reader-font-size', localStorage.getItem('readerFontSize') + 'px');
    document.getElementById('fontSizeValue').textContent = localStorage.getItem('readerFontSize') + 'px';
  }
  if (localStorage.getItem('readerLineHeight')) {
    lineSlider.value = localStorage.getItem('readerLineHeight');
    document.getElementById('readerContent').style.setProperty('--reader-line-height', localStorage.getItem('readerLineHeight'));
    document.getElementById('lineHeightValue').textContent = localStorage.getItem('readerLineHeight');
  }
}

function toggleSettings() {
  const panel = document.getElementById('settingsPanel');
  const toggle = document.getElementById('settingsToggle');
  panel.classList.toggle('active');
  toggle.style.transform = panel.classList.contains('active') ? 'rotate(180deg)' : '';
}

function setReaderStyle(style) {
  const presets = { default: { font: 16, line: 1.9 }, compact: { font: 14, line: 1.6 }, relaxed: { font: 18, line: 2.2 } };
  const p = presets[style];
  document.getElementById('fontSizeSlider').value = p.font;
  document.getElementById('lineHeightSlider').value = p.line;
  document.getElementById('fontSizeValue').textContent = p.font + 'px';
  document.getElementById('lineHeightValue').textContent = p.line;
  document.getElementById('readerContent').style.setProperty('--reader-font-size', p.font + 'px');
  document.getElementById('readerContent').style.setProperty('--reader-line-height', p.line);
  localStorage.setItem('readerFontSize', p.font);
  localStorage.setItem('readerLineHeight', p.line);
}

function setReaderFont(font) {
  const readerContent = document.getElementById('readerContent');
  if (readerContent) {
    readerContent.style.fontFamily = font;
  }
  localStorage.setItem('readerFont', font);
}

// ===== AUTO-HIDE ON SCROLL (MOBILE ONLY) =====
function initReaderAutoHide() {
  // Only apply on mobile (screen width <= 768px)
  const mql = window.matchMedia('(max-width: 600px)');
  if (!mql.matches) return;

  const toolbar = document.querySelector('.top-toolbar');
  const navBar = document.querySelector('.nav-bar');
  const backToTop = document.getElementById('backToTop');
  if (!toolbar && !navBar) return;
  let lastScrollY = 0;
  let ticking = false;
  let isHidden = false;

  function onScroll() {
    const currentY = window.scrollY;
    const diff = currentY - lastScrollY;

    if (Math.abs(diff) > 10) {
      if (diff > 0 && currentY > 80 && !isHidden) {
        // Scrolling down - hide
        if (toolbar) toolbar.style.transform = 'translateY(-60px)';
        if (navBar) { navBar.style.transform = 'translateY(100%)'; navBar.style.pointerEvents = 'none'; }
        if (backToTop) backToTop.classList.remove('visible');
        isHidden = true;
      } else if (diff < 0 && isHidden) {
        // Scrolling up - show
        if (toolbar) toolbar.style.transform = 'translateY(0)';
        if (navBar) { navBar.style.transform = 'translateY(0)'; navBar.style.pointerEvents = 'auto'; }
        if (backToTop && currentY > 400) backToTop.classList.add('visible');
        isHidden = false;
      }
    }
    lastScrollY = currentY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

// ===== TIMELINE =====
function renderTimeline() {
  const list = document.getElementById('timelineList');
  list.innerHTML = '';
  timelineData.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.style.animation = `staggerFadeIn 0.5s ease ${i * 0.1}s both`;
    div.innerHTML = `
      <div class="timeline-date">${item.date}</div>
      <div class="timeline-title">${escapeHTML(item.title)}</div>
      <div class="timeline-desc">${escapeHTML(item.desc)}</div>
    `;
    list.appendChild(div);
  });
}

// ===== LINKS =====
function renderLinks() {
  const grid = document.getElementById('linksGrid');
  grid.innerHTML = '';
  linksData.forEach((item, i) => {
    const a = document.createElement('a');
    a.href = item.url;
    a.className = 'link-card card-shine';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.animation = `staggerFadeIn 0.5s ease ${i * 0.1}s both`;
    a.innerHTML = `
      <div class="link-icon" aria-hidden="true">${item.icon}</div>
      <h4>${escapeHTML(item.title)}</h4>
      <p>${escapeHTML(item.desc)}</p>
    `;
    grid.appendChild(a);
  });
}

// ===== ABOUT DATA =====
const defaultAboutData = {
  circleName: '黒 / 黑喵子',
  bio: '@kuro_nekoko · 同人小说收藏',
  vocaloid: [
    { label: '声库', value: 'miku > > > 音街ウナ > Rana' },
    { label: 'P主', value: 'Mitchie M / Giga' },
    { label: '画师', value: 'ixima' }
  ],
  vocaloidTags: ['vocaloid调声', 'bilibili：黑喵子_'],
  ensemble: [
    { label: '主推', value: 'leo > > > 凛月 > 零=泉' },
    { label: '好感', value: 'mika/夏目/晃牙/彩/宙' },
    { label: 'CP', value: '狮心/零凛' },
    { label: '其他', value: '雷leo司/泉真 · 其他杂食' }
  ],
  nitro: [
    { label: '主推', value: 'Slow Damage · towa单推' },
    { label: '进度', value: '系列作补完中' }
  ],
  other: '电子琴 / MMD / 手帐 / 爵士乐 / 普罗米亚 / 创作BL / 樱新 / 梅露可物语 / 男子高校生 / はじめての / 玉桂狗 / 文具 / 少女歌剧',
  links: {
    qq: '#', bili: '#', github: '#', weibo: '#', xiaohongshu: '#', x: '#'
  }
};

let aboutData = safeJSONParse('aboutData', JSON.parse(JSON.stringify(defaultAboutData)));

const defaultSiteConfig = {
  siteName: '黒の猫窝',
  siteSubtitle: '同人小说收藏站',
  heroTitle: '欢迎来到黒の猫窝',
  heroDesc: '这里是我收藏的同人小说集，主要收录 VOCALOID、偶像梦幻祭等作品的优秀创作。每一篇都是精心挑选，希望能给你带来美好的阅读体验。',
  heroTags: ['VOCALOID', '偶像梦幻祭', 'ES', '同人小说', '狮心', '零凛'],
  footerText: '黒の猫窝 · 收藏每一个故事',
  guestbookIntro: '欢迎留下你的想法和建议！评论通过 GitHub Discussions 存储，所有人都能看到。',
  guestbookHint: '首次留言需要登录 GitHub 账号授权。',
  colorScheme: 'miku',
};

let siteConfig = safeJSONParse('siteConfig', JSON.parse(JSON.stringify(defaultSiteConfig)));

function renderAboutPage() {
  const d = aboutData;
  const socialItems = [
    { icon: '<img src="https://www.bilibili.com/favicon.ico" width="16" height="16" style="vertical-align:middle;" onerror="this.style.display=\'none\'">', name: '哔哩哔哩', url: d.links.bili && d.links.bili.match(/^(https?:\/\/|mailto:)/) ? d.links.bili : '#' },
    { icon: '<img src="https://github.com/favicon.ico" width="16" height="16" style="vertical-align:middle;" onerror="this.style.display=\'none\'">', name: 'GitHub', url: d.links.github && d.links.github.match(/^(https?:\/\/|mailto:)/) ? d.links.github : '#' },
    { icon: '<img src="https://qzone.qq.com/favicon.ico" width="16" height="16" style="vertical-align:middle;" onerror="this.style.display=\'none\'">', name: 'QQ空间', url: d.links.qq && d.links.qq.match(/^(https?:\/\/|mailto:)/) ? d.links.qq : '#' },
    { icon: '<img src="https://weibo.com/favicon.ico" width="16" height="16" style="vertical-align:middle;" onerror="this.style.display=\'none\'">', name: '微博', url: d.links.weibo && d.links.weibo.match(/^(https?:\/\/|mailto:)/) ? d.links.weibo : '#' },
    { icon: '<img src="https://www.xiaohongshu.com/favicon.ico" width="16" height="16" style="vertical-align:middle;" onerror="this.style.display=\'none\'">', name: '小红书', url: d.links.xiaohongshu && d.links.xiaohongshu.match(/^(https?:\/\/|mailto:)/) ? d.links.xiaohongshu : '#' },
    { icon: '<img src="https://abs.twimg.com/favicons/twitter.3.ico" width="16" height="16" style="vertical-align:middle;" onerror="this.style.display=\'none\'">', name: 'X', url: d.links.x && d.links.x.match(/^(https?:\/\/|mailto:)/) ? d.links.x : '#' }
  ];

  function renderInterestRows(items) {
    if (!items || !items.length) return '';
    return items.map(item => {
      if (item.label && item.label !== '标签') {
        return `<div><span class="label">${escapeHTML(item.label)}</span><span class="value">${escapeHTML(item.value)}</span></div>`;
      }
      return `<div><span class="value">${escapeHTML(item.value)}</span></div>`;
    }).join('');
  }

  const profile = document.getElementById('aboutProfile');
  profile.innerHTML = '';

  const headerCard = document.createElement('div');
    headerCard.className = 'about-header-card';
    headerCard.innerHTML = `
    <img class="about-avatar" src="avatar.png" alt="头像">
    <h2>${escapeHTML(d.circleName)}</h2>
    <p class="about-handle">${escapeHTML(d.bio)}</p>
    <div class="social-links">
      ${socialItems.map(s => `<a href="${escapeHTML(s.url)}" class="social-link" target="_blank" rel="noopener noreferrer"><span class="social-icon" aria-hidden="true">${s.icon}</span> ${escapeHTML(s.name)}</a>`).join('')}
    </div>
  `;
  profile.appendChild(headerCard);

  const sections = [
    { title: 'VOCALOID', items: d.vocaloid },
    { title: '偶像梦幻祭', items: d.ensemble },
    { title: 'NITRO+CHiRAL', items: d.nitro },
    { title: '其他', items: [{ value: d.other }] }
  ];

  sections.forEach(section => {
    const sec = document.createElement('div');
    sec.className = 'interest-section';
    const card = document.createElement('div');
    card.className = 'interest-card';
    card.innerHTML = `
      <h3>${escapeHTML(section.title)}</h3>
      <div class="interest-content">${renderInterestRows(section.items)}</div>
    `;
    sec.appendChild(card);
    profile.appendChild(sec);
  });
}

// ===== ADMIN TABS - Fixed: pass this instead of using implicit event =====
function switchAdminTab(btn, tabName) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const tabMap = {
    'site': ['adminTabSite', () => loadSiteConfigForm()],
    'categories': ['adminTabCategories', () => renderAdminCategoryList()],
    'add': ['adminTabAdd', () => { updateCategorySelect(); if (!document.getElementById('addChapterList').children.length) addChapterField('add'); }],
    'edit': ['adminTabEdit', () => renderAdminEditNovelList()],
    'about': ['adminTabAbout', () => loadAboutForm()],
    'timeline': ['adminTabTimeline', () => renderAdminTimelineList()],
    'links': ['adminTabLinks', () => renderAdminLinksList()]
  };
  if (tabMap[tabName]) {
    document.getElementById(tabMap[tabName][0]).classList.add('active');
    tabMap[tabName][1]();
  }
}

// ===== ADMIN EDIT NOVEL =====
function renderAdminEditNovelList() {
  const list = document.getElementById('adminEditNovelList');
  // 保存搜索框当前值和光标位置
  const oldSearchEl = document.getElementById('adminNovelSearch');
  const oldSearch = oldSearchEl ? oldSearchEl.value : '';
  const oldCursorPos = oldSearchEl ? oldSearchEl.selectionStart : 0;

  list.innerHTML = '';

  // 添加搜索框
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.id = 'adminNovelSearch';
  searchInput.placeholder = '搜索小说标题或作者...';
  searchInput.style.cssText = 'width:100%;padding:8px 12px;border:1px solid var(--border-light);background:var(--bg-primary);color:var(--text-primary);font-family:var(--font-serif);font-size:0.85rem;margin-bottom:12px;border-radius:var(--radius-sm);';
  searchInput.value = oldSearch;
  searchInput.setAttribute('oninput', 'filterAdminNovels()');
  list.appendChild(searchInput);

  let hasResults = false;
  categories.forEach(cat => {
    cat.novels.forEach(novel => {
      hasResults = true;
      const chapterCount = novel.chapters ? novel.chapters.length : 1;
      const chapterText = chapterCount > 1 ? chapterCount + ' 章' : '全文';
      const div = document.createElement('div');
      div.className = 'admin-novel-item';
      div.dataset.title = novel.title;
      div.dataset.author = novel.author;
      div.id = 'edit-' + novel.id;
      div.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border-light);';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><strong>${escapeHTML(novel.title)}</strong> <span style="color:var(--text-muted);font-size:0.8rem;">${escapeHTML(novel.author)} · ${escapeHTML(cat.name)} · ${chapterText}</span></div>
          <div style="display:flex;gap:6px;">
            <button class="admin-small-btn" onclick="startEditNovel('${cat.id}','${novel.id}')">编辑</button>
            <button class="admin-small-btn cancel" onclick="deleteNovel('${cat.id}','${novel.id}')">删除</button>
          </div>
        </div>
      `;
      list.appendChild(div);
    });
  });
  if (!hasResults) {
    const noResult = document.createElement('p');
    noResult.style.cssText = 'color:var(--text-muted);font-size:0.85rem;';
    noResult.textContent = '暂无小说';
    list.appendChild(noResult);
  }

  // 渲染完成后应用搜索过滤
  filterAdminNovels();

  // 恢复搜索框焦点和光标位置
  const newSearchEl = document.getElementById('adminNovelSearch');
  if (newSearchEl && oldSearch) {
    newSearchEl.focus();
    newSearchEl.setSelectionRange(oldCursorPos, oldCursorPos);
  }
}

function filterAdminNovels() {
  const query = (document.getElementById('adminNovelSearch') || {}).value || '';
  const items = document.querySelectorAll('.admin-novel-item');
  let hasVisible = false;
  items.forEach(item => {
    const title = (item.dataset.title || '').toLowerCase();
    const author = (item.dataset.author || '').toLowerCase();
    const q = query.toLowerCase();
    const visible = !q || title.includes(q) || author.includes(q);
    item.style.display = visible ? '' : 'none';
    if (visible) hasVisible = true;
  });
  // 处理"暂无结果"提示
  const list = document.getElementById('adminEditNovelList');
  const noResultEl = list.querySelector('p:last-child');
  if (noResultEl && !noResultEl.classList.contains('admin-novel-item')) {
    noResultEl.style.display = (items.length > 0 && !hasVisible && query) ? '' : 'none';
    if (query && !hasVisible) noResultEl.textContent = '没有匹配的小说';
    else if (!query && items.length === 0) noResultEl.textContent = '暂无小说';
    else noResultEl.style.display = 'none';
  }
}

function startEditNovel(catId, novelId) {
  const cat = categories.find(c => c.id === catId);
  const novel = cat.novels.find(n => n.id === novelId);
  const el = document.getElementById('edit-' + novelId);

  // 处理章节：向后兼容
  let chapters = [];
  if (novel.chapters && novel.chapters.length > 0) {
    chapters = novel.chapters;
  } else {
    chapters = [{ title: '全文', content: novel.content || '' }];
  }

  // 构建章节编辑区域 HTML
  let chaptersHTML = '';
  chapters.forEach((ch, i) => {
    chaptersHTML += `
      <div class="chapter-item" data-chapter-idx="${i}">
        <div class="chapter-item-header">
          <span>章节 ${i + 1}</span>
          <button class="chapter-del-btn" onclick="removeEditChapter(this, '${novelId}')" ${chapters.length <= 1 ? 'disabled style="opacity:0.3;cursor:not-allowed;"' : ''}>删除</button>
        </div>
        <input type="text" class="edit-chapter-title" value="${escapeHTML(ch.title)}" placeholder="章节标题">
        <textarea class="edit-chapter-content" placeholder="章节内容...">${escapeHTML(ch.content)}</textarea>
      </div>
    `;
  });

  el.innerHTML = `
    <div class="admin-edit-row"><label style="font-size:0.75rem;color:var(--text-muted);width:60px;">标题</label><input type="text" id="editTitle-${novelId}" value="${escapeHTML(novel.title)}"></div>
    <div style="margin-top:8px;margin-bottom:12px;">
      <label style="font-size:0.8rem;color:var(--text-muted);">分类</label>
      <select id="editCategory-${novel.id}" style="width:100%;padding:6px 8px;border:1px solid var(--border-light);background:var(--bg-primary);color:var(--text-primary);font-family:var(--font-serif);font-size:0.85rem;">
        ${categories.map(c => `<option value="${c.id}" ${c.id === cat.id ? 'selected' : ''}>${escapeHTML(c.name)}</option>`).join('')}
      </select>
    </div>
    <div class="admin-edit-row"><label style="font-size:0.75rem;color:var(--text-muted);width:60px;">作者</label><input type="text" id="editAuthor-${novelId}" value="${escapeHTML(novel.author)}"></div>
    <div class="admin-edit-row"><label style="font-size:0.75rem;color:var(--text-muted);width:60px;">标签</label><input type="text" id="editTags-${novelId}" value="${escapeHTML(novel.tags.join(', '))}"></div>
    <div style="margin-bottom:16px;">
      <label style="font-size:0.85rem;color:var(--text-muted);display:block;margin-bottom:4px;">前言/备注</label>
      <textarea id="editNovelPreface" class="admin-textarea" placeholder="输入前言或备注（可选，会在正文前显示）" rows="3">${escapeHTML(novel.preface || '')}</textarea>
    </div>
    <div style="margin-top:8px;">
      <div class="chapter-manager-title">
        <span style="font-size:0.8rem;color:var(--text-muted);">章节管理</span>
        <button class="chapter-add-btn" style="width:auto;" onclick="addEditChapter('${novelId}')">+ 添加章节</button>
      </div>
      <div id="editChapterList-${novelId}">
        ${chaptersHTML}
      </div>
      <button class="chapter-add-btn" style="width:auto;margin-top:8px;" onclick="addEditChapter('${novelId}')">+ 添加章节</button>
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="admin-small-btn" onclick="saveEditNovel('${catId}','${novelId}')">保存</button>
      <button class="admin-small-btn cancel" onclick="renderAdminEditNovelList()">取消</button>
    </div>
  `;
}

function saveEditNovel(catId, novelId) {
  const cat = categories.find(c => c.id === catId);
  const novel = cat.novels.find(n => n.id === novelId);
  novel.title = document.getElementById('editTitle-' + novelId).value.trim();
  novel.author = document.getElementById('editAuthor-' + novelId).value.trim();
  novel.tags = document.getElementById('editTags-' + novelId).value.split(',').map(t => t.trim()).filter(t => t);
  novel.preface = document.getElementById('editNovelPreface').value.trim();

  // 从章节编辑表单收集数据
  const chapterContainer = document.getElementById('editChapterList-' + novelId);
  const chapterItems = chapterContainer.querySelectorAll('.chapter-item');
  const chapters = [];
  let allContent = '';
  chapterItems.forEach(item => {
    const chTitle = item.querySelector('.edit-chapter-title').value.trim() || '未命名章节';
    const chContent = item.querySelector('.edit-chapter-content').value;
    chapters.push({ title: chTitle, content: chContent });
    allContent += chContent;
  });
  novel.chapters = chapters;
  novel.wordCount = allContent.replace(/\s/g, '').length;
  // 向后兼容：同时保留 content 字段（合并所有章节内容）
  novel.content = allContent;

  // Handle category change
  const newCatId = document.getElementById('editCategory-' + novelId).value;
  if (newCatId !== catId) {
    const newCat = categories.find(c => c.id === newCatId);
    if (newCat) {
      cat.novels = cat.novels.filter(n => n.id !== novelId);
      newCat.novels.push(novel);
    }
  }
  saveData();
  renderAdminEditNovelList();
  renderStats();
  renderCategories();
  announceToScreenReader('小说保存成功');
  showToast('小说保存成功');
}

// ===== ADMIN EDIT ABOUT =====
function renderInterestTags(section, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  (aboutData[section] || []).forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'admin-about-section';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '6px';
    div.innerHTML = `
      <input type="text" data-section="${section}" data-field="label" data-index="${i}" value="${(item.label && item.label !== '标签') ? item.label : ''}" placeholder="标签名" style="width:80px;flex-shrink:0;">
      <input type="text" data-section="${section}" data-field="value" data-index="${i}" value="${item.value || ''}" placeholder="内容" style="flex:1;">
      <button class="admin-btn" style="padding:4px 8px;font-size:0.75rem;flex-shrink:0;" onclick="removeInterestTag('${section}',${i})">×</button>
    `;
    container.appendChild(div);
  });
}

function addInterestTag(section) {
  if (!aboutData[section]) aboutData[section] = [];
  aboutData[section].push({ label: '', value: '' });
  const containerMap = { vocaloid: 'adminVocaloidTags', ensemble: 'adminEnsembleTags', nitro: 'adminNitroTags' };
  renderInterestTags(section, containerMap[section]);
}

function removeInterestTag(section, index) {
  aboutData[section].splice(index, 1);
  const containerMap = { vocaloid: 'adminVocaloidTags', ensemble: 'adminEnsembleTags', nitro: 'adminNitroTags' };
  renderInterestTags(section, containerMap[section]);
}

function loadAboutForm() {
  document.getElementById('aboutCircleName').value = aboutData.circleName;
  document.getElementById('aboutBio').value = aboutData.bio;
  // Render dynamic interest tags
  renderInterestTags('vocaloid', 'adminVocaloidTags');
  renderInterestTags('ensemble', 'adminEnsembleTags');
  renderInterestTags('nitro', 'adminNitroTags');
  document.getElementById('aboutOther').value = aboutData.other;
  document.getElementById('aboutLinkQQ').value = aboutData.links.qq;
  document.getElementById('aboutLinkBili').value = aboutData.links.bili;
  document.getElementById('aboutLinkGithub').value = aboutData.links.github;
  document.getElementById('aboutLinkWeibo').value = aboutData.links.weibo;
  document.getElementById('aboutLinkXiaohongshu').value = aboutData.links.xiaohongshu;
  document.getElementById('aboutLinkX').value = aboutData.links.x;
}

function saveAboutData() {
  aboutData.circleName = document.getElementById('aboutCircleName').value.trim() || defaultAboutData.circleName;
  aboutData.bio = document.getElementById('aboutBio').value.trim() || defaultAboutData.bio;
  // Collect dynamic interest tags from DOM
  function collectTags(section) {
    const containerMap = { vocaloid: 'adminVocaloidTags', ensemble: 'adminEnsembleTags', nitro: 'adminNitroTags' };
    const container = document.getElementById(containerMap[section]);
    if (!container) return [];
    const tags = [];
    container.querySelectorAll('.admin-about-section').forEach(row => {
      const labelInput = row.querySelector('input[data-field="label"]');
      const valueInput = row.querySelector('input[data-field="value"]');
      if (labelInput && valueInput) {
        const label = labelInput.value.trim();
        const value = valueInput.value.trim();
        if (value) tags.push({ label: (label && label !== '标签') ? label : '', value });
      }
    });
    return tags;
  }
  aboutData.vocaloid = collectTags('vocaloid');
  aboutData.ensemble = collectTags('ensemble');
  aboutData.nitro = collectTags('nitro');
  aboutData.other = document.getElementById('aboutOther').value.trim();
  aboutData.links = {
    qq: document.getElementById('aboutLinkQQ').value.trim() || '#',
    bili: document.getElementById('aboutLinkBili').value.trim() || '#',
    github: document.getElementById('aboutLinkGithub').value.trim() || '#',
    weibo: document.getElementById('aboutLinkWeibo').value.trim() || '#',
    xiaohongshu: document.getElementById('aboutLinkXiaohongshu').value.trim() || '#',
    x: document.getElementById('aboutLinkX').value.trim() || '#'
  };
  aboutData._lastSync = new Date().toISOString();
  safeJSONStringify('aboutData', aboutData);
  saveData();
  renderAboutPage();
  announceToScreenReader('关于页已保存');
  showToast('关于页已保存');
}

// ===== ADMIN: Site Config =====
function loadSiteConfigForm() {
  document.getElementById('cfgSiteName').value = siteConfig.siteName || '';
  document.getElementById('cfgSiteSubtitle').value = siteConfig.siteSubtitle || '';
  document.getElementById('cfgHeroTitle').value = siteConfig.heroTitle || '';
  document.getElementById('cfgHeroDesc').value = siteConfig.heroDesc || '';
  document.getElementById('cfgHeroTags').value = (siteConfig.heroTags || []).join(',');
  document.getElementById('cfgFooterText').value = siteConfig.footerText || '';
  document.getElementById('cfgGbIntro').value = siteConfig.guestbookIntro || '';
  document.getElementById('cfgGbHint').value = siteConfig.guestbookHint || '';
}

function saveSiteConfig() {
  siteConfig.siteName = document.getElementById('cfgSiteName').value.trim() || defaultSiteConfig.siteName;
  siteConfig.siteSubtitle = document.getElementById('cfgSiteSubtitle').value.trim() || defaultSiteConfig.siteSubtitle;
  siteConfig.heroTitle = document.getElementById('cfgHeroTitle').value.trim() || defaultSiteConfig.heroTitle;
  siteConfig.heroDesc = document.getElementById('cfgHeroDesc').value.trim() || defaultSiteConfig.heroDesc;
  siteConfig.heroTags = document.getElementById('cfgHeroTags').value.split(',').map(t => t.trim()).filter(t => t);
  siteConfig.footerText = document.getElementById('cfgFooterText').value.trim() || defaultSiteConfig.footerText;
  siteConfig.guestbookIntro = document.getElementById('cfgGbIntro').value.trim() || defaultSiteConfig.guestbookIntro;
  siteConfig.guestbookHint = document.getElementById('cfgGbHint').value.trim() || defaultSiteConfig.guestbookHint;
  siteConfig._lastSync = new Date().toISOString();
  safeJSONStringify('siteConfig', siteConfig);
  saveData();
  renderHomePage();
  renderGuestbookIntro();
  showToast('站点设置已保存');
}

// ===== ADMIN: Category Management =====
function renderAdminCategoryList() {
  const list = document.getElementById('adminCategoryList');
  list.innerHTML = '';
  categories.forEach((cat, i) => {
    const div = document.createElement('div');
    div.className = 'admin-category-item';
    div.draggable = true;
    div.dataset.index = i;
    div.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border-light);cursor:grab;display:flex;justify-content:space-between;align-items:center;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:var(--text-muted);font-size:0.8rem;cursor:grab;" title="拖拽排序">⠿</span>
        <div>
          <strong>${escapeHTML(cat.name)}</strong>
          <span style="color:var(--text-muted);font-size:0.8rem;"> (${cat.id}) · ${escapeHTML(cat.desc)} · ${cat.novels.length}篇</span>
        </div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="admin-small-btn" onclick="editCategory('${cat.id}')">编辑</button>
        <button class="admin-small-btn cancel" onclick="deleteCategory('${cat.id}')">删除</button>
      </div>
    `;
    div.addEventListener('dragstart', handleCatDragStart);
    div.addEventListener('dragover', handleCatDragOver);
    div.addEventListener('drop', handleCatDrop);
    div.addEventListener('dragend', handleCatDragEnd);
    list.appendChild(div);
  });
  if (!categories.length) list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">暂无分类</p>';
}

let dragCatIdx = null;
function handleCatDragStart(e) {
  dragCatIdx = parseInt(this.dataset.index);
  this.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}
function handleCatDragOver(e) {
  e.preventDefault();
  const targetIdx = parseInt(this.dataset.index);
  if (dragCatIdx === null || dragCatIdx === targetIdx) return;
  
  // 实时交换数据
  const item = categories.splice(dragCatIdx, 1)[0];
  categories.splice(targetIdx, 0, item);
  dragCatIdx = targetIdx;
  
  // 重新渲染列表（实时更新位置）
  renderAdminCategoryList();
  saveData();
  renderCategories();
}
function handleCatDrop(e) {
  e.preventDefault();
  dragCatIdx = null;
  document.querySelectorAll('.admin-category-item').forEach(el => {
    el.style.opacity = '';
    el.style.borderTop = '';
  });
}
function handleCatDragEnd(e) {
  this.style.opacity = '1';
  dragCatIdx = null;
  document.querySelectorAll('.admin-category-item').forEach(el => {
    el.style.opacity = '';
    el.style.borderTop = '';
  });
}

function addCategory() {
  const id = document.getElementById('newCatId').value.trim().replace(/\s+/g, '-').toLowerCase();
  const name = document.getElementById('newCatName').value.trim();
  const desc = document.getElementById('newCatDesc').value.trim();
  const catImage = (document.getElementById('newCatImage') || {}).value || '';
  if (!id || !name) { showToast('请填写分类 ID 和名称', 'error'); return; }
  if (categories.find(c => c.id === id)) { showToast('分类 ID 已存在', 'error'); return; }
  categories.push({ id, name, desc, image: catImage || id + '.jpg', novels: [] });
  saveData();
  renderAdminCategoryList();
  renderStats();
  renderCategories();
  updateCategorySelect();
  showToast('分类已添加');
  document.getElementById('newCatId').value = '';
  document.getElementById('newCatName').value = '';
  document.getElementById('newCatDesc').value = '';
  const newCatImageEl = document.getElementById('newCatImage');
  if (newCatImageEl) newCatImageEl.value = '';
}

function editCategory(catId) {
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;
  const list = document.getElementById('adminCategoryList');
  const index = categories.indexOf(cat);
  const div = list.children[index];
  if (!div) return;
  div.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--bg-secondary);border-radius:var(--radius-sm);">
      <input type="text" id="editCat-id" value="${escapeHTML(cat.id)}" disabled placeholder="分类ID（不可修改）" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-muted);font-family:var(--font-serif);opacity:0.6;">
      <input type="text" id="editCat-name" value="${escapeHTML(cat.name)}" placeholder="分类名称" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <input type="text" id="editCat-desc" value="${escapeHTML(cat.desc)}" placeholder="分类描述" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <div style="display:flex;gap:6px;">
        <button class="admin-small-btn" onclick="saveCategoryEdit('${cat.id}')">保存</button>
        <button class="admin-small-btn cancel" onclick="renderAdminCategoryList()">取消</button>
      </div>
    </div>`;
}
function saveCategoryEdit(catId) {
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;
  cat.name = document.getElementById('editCat-name').value.trim() || cat.name;
  cat.desc = document.getElementById('editCat-desc').value.trim() || cat.desc;
  saveData();
  renderAdminCategoryList();
  renderHomePage();
  renderStats();
  renderCategories();
  updateCategorySelect();
  showToast('分类已更新');
}

function deleteCategory(catId) {
  const cat = categories.find(c => c.id === catId);
  if (!cat) return;
  if (cat.novels.length > 0 && !confirm(`分类"${cat.name}"下有 ${cat.novels.length} 篇文章，删除后文章也会丢失，确定吗？`)) return;
  categories = categories.filter(c => c.id !== catId);
  saveData();
  renderAdminCategoryList();
  renderStats();
  renderCategories();
  updateCategorySelect();
  showToast('分类已删除');
}

function updateCategorySelect() {
  const sel = document.getElementById('adminCategory');
  sel.innerHTML = '';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    sel.appendChild(opt);
  });
}

// ===== ADMIN: Timeline =====
function renderAdminTimelineList() {
  const list = document.getElementById('adminTimelineList');
  list.innerHTML = '';
  timelineData.forEach((item, i) => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border-light);';
    div.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong>${escapeHTML(item.title)}</strong>
          <span style="color:var(--text-muted);font-size:0.8rem;"> ${item.date} - ${escapeHTML(item.desc)}</span>
        </div>
        <div style="display:flex;gap:6px;">
          <button class="admin-small-btn" onclick="editTimelineEvent(${i})">编辑</button>
          <button class="admin-small-btn cancel" onclick="deleteTimelineEvent(${i})">删除</button>
        </div>
      </div>
    `;
    list.appendChild(div);
  });
  if (!timelineData.length) list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">暂无事件</p>';
}

function addTimelineEvent() {
  const date = document.getElementById('newTlDate').value;
  const title = document.getElementById('newTlTitle').value.trim();
  const desc = document.getElementById('newTlDesc').value.trim();
  if (!date || !title) { showToast('请填写日期和标题', 'error'); return; }
  timelineData.unshift({ date, title, desc });
  saveData();
  renderAdminTimelineList();
  renderTimeline();
  showToast('事件已添加');
  document.getElementById('newTlDate').value = '';
  document.getElementById('newTlTitle').value = '';
  document.getElementById('newTlDesc').value = '';
}

function editTimelineEvent(index) {
  const item = timelineData[index];
  if (!item) return;
  const list = document.getElementById('adminTimelineList');
  const div = list.children[index];
  if (!div) return;
  div.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--bg-secondary);border-radius:var(--radius-sm);">
      <input type="text" id="editTL-title" value="${escapeHTML(item.title)}" placeholder="事件标题" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <input type="text" id="editTL-date" value="${escapeHTML(item.date)}" placeholder="日期" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <textarea id="editTL-desc" placeholder="描述" rows="2" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);resize:vertical;">${escapeHTML(item.desc)}</textarea>
      <div style="display:flex;gap:6px;">
        <button class="admin-small-btn" onclick="saveTimelineEdit(${index})">保存</button>
        <button class="admin-small-btn cancel" onclick="renderAdminTimelineList()">取消</button>
      </div>
    </div>`;
}
function saveTimelineEdit(index) {
  const item = timelineData[index];
  if (!item) return;
  item.title = document.getElementById('editTL-title').value.trim() || item.title;
  item.date = document.getElementById('editTL-date').value.trim() || item.date;
  item.desc = document.getElementById('editTL-desc').value.trim() || item.desc;
  saveData();
  renderAdminTimelineList();
  renderTimeline();
  showToast('事件已更新');
}

function deleteTimelineEvent(index) {
  timelineData.splice(index, 1);
  saveData();
  renderAdminTimelineList();
  renderTimeline();
  showToast('事件已删除');
}

// ===== ADMIN: Links =====
function renderAdminLinksList() {
  const list = document.getElementById('adminLinksList');
  list.innerHTML = '';
  linksData.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'admin-link-item';
    div.draggable = true;
    div.dataset.index = i;
    div.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border-light);cursor:grab;display:flex;justify-content:space-between;align-items:center;';
    div.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:var(--text-muted);font-size:0.8rem;cursor:grab;" title="拖拽排序">⠿</span>
        <div>
          <strong>${escapeHTML(item.title)}</strong>
          <span style="color:var(--text-muted);font-size:0.8rem;"> ${escapeHTML(item.desc)}</span>
        </div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="admin-small-btn" onclick="editLink(${i})">编辑</button>
        <button class="admin-small-btn cancel" onclick="deleteLink(${i})">删除</button>
      </div>
    `;
    div.addEventListener('dragstart', handleLinkDragStart);
    div.addEventListener('dragover', handleLinkDragOver);
    div.addEventListener('drop', handleLinkDrop);
    div.addEventListener('dragend', handleLinkDragEnd);
    list.appendChild(div);
  });
  if (!linksData.length) list.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">暂无友链</p>';
}

let dragLinkIdx = null;
function handleLinkDragStart(e) {
  dragLinkIdx = parseInt(this.dataset.index);
  this.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
}
function handleLinkDragOver(e) {
  e.preventDefault();
  const targetIdx = parseInt(this.dataset.index);
  if (dragLinkIdx === null || dragLinkIdx === targetIdx) return;
  
  // 实时交换数据
  const item = linksData.splice(dragLinkIdx, 1)[0];
  linksData.splice(targetIdx, 0, item);
  dragLinkIdx = targetIdx;
  
  // 重新渲染列表（实时更新位置）
  renderAdminLinksList();
  saveData();
  renderLinks();
}
function handleLinkDrop(e) {
  e.preventDefault();
  dragLinkIdx = null;
  document.querySelectorAll('.admin-link-item').forEach(el => {
    el.style.opacity = '';
    el.style.borderTop = '';
  });
}
function handleLinkDragEnd(e) {
  this.style.opacity = '1';
  dragLinkIdx = null;
  document.querySelectorAll('.admin-link-item').forEach(el => {
    el.style.opacity = '';
    el.style.borderTop = '';
  });
}

function addLink() {
  const title = document.getElementById('newLinkTitle').value.trim();
  const icon = document.getElementById('newLinkIcon').value.trim();
  const desc = document.getElementById('newLinkDesc').value.trim();
  const url = document.getElementById('newLinkUrl').value.trim();
  if (!title || !url) { showToast('请填写名称和链接', 'error'); return; }
  linksData.push({ icon: '<span aria-hidden="true">' + escapeHTML(icon) + '</span>', title, desc, url });
  saveData();
  renderAdminLinksList();
  renderLinks();
  showToast('友链已添加');
  document.getElementById('newLinkTitle').value = '';
  document.getElementById('newLinkIcon').value = '';
  document.getElementById('newLinkDesc').value = '';
  document.getElementById('newLinkUrl').value = '';
}

function editLink(index) {
  const item = linksData[index];
  if (!item) return;
  const list = document.getElementById('adminLinksList');
  const div = list.children[index];
  if (!div) return;
  div.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;padding:8px;background:var(--bg-secondary);border-radius:var(--radius-sm);">
      <input type="text" id="editLK-title" value="${escapeHTML(item.title)}" placeholder="友链名称" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <input type="text" id="editLK-url" value="${escapeHTML(item.url)}" placeholder="链接地址" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <input type="text" id="editLK-desc" value="${escapeHTML(item.desc)}" placeholder="描述" style="padding:6px 10px;border:1px solid var(--border-light);background:var(--bg-card);color:var(--text-primary);font-family:var(--font-serif);">
      <div style="display:flex;gap:6px;">
        <button class="admin-small-btn" onclick="saveLinkEdit(${index})">保存</button>
        <button class="admin-small-btn cancel" onclick="renderAdminLinksList()">取消</button>
      </div>
    </div>`;
}
function saveLinkEdit(index) {
  const item = linksData[index];
  if (!item) return;
  item.title = document.getElementById('editLK-title').value.trim() || item.title;
  item.url = document.getElementById('editLK-url').value.trim() || item.url;
  item.desc = document.getElementById('editLK-desc').value.trim() || item.desc;
  saveData();
  renderAdminLinksList();
  renderLinks();
  showToast('友链已更新');
}

function deleteLink(index) {
  linksData.splice(index, 1);
  saveData();
  renderAdminLinksList();
  renderLinks();
  showToast('友链已删除');
}


// ===== ERROR BOUNDARY =====
window.onerror = function(msg, url, line, col, error) {
  console.error('Global error:', msg, 'at', url, line, col, error);
  announceToScreenReader('页面出现错误，请刷新重试');
  return false;
};

window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  announceToScreenReader('操作失败，请重试');
};

// ===== SWIPE NAVIGATION for mobile =====
function initSwipeNavigation() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let isScrolling = false;
  const minSwipeDistance = 80;
  const maxVerticalDistance = 75;
  const maxSwipeTime = 350;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    touchStartTime = Date.now();
    isScrolling = false;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const currentY = e.changedTouches[0].clientY;
    const verticalMove = Math.abs(currentY - touchStartY);
    if (verticalMove > 10) {
      isScrolling = true;
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const horizontalDistance = touchEndX - touchStartX;
    const verticalDistance = Math.abs(touchEndY - touchStartY);
    const swipeTime = Date.now() - touchStartTime;

    // Must be a right-swipe (from left to right) to go back
    if (horizontalDistance < minSwipeDistance) return;
    if (horizontalDistance < 0) return; // left swipe, ignore
    if (isScrolling) return;
    if (verticalDistance > maxVerticalDistance) return;
    if (swipeTime > maxSwipeTime) return;

    const currentPage = document.querySelector('.page.active');
    if (!currentPage) return;
    const pageId = currentPage.id;

    if (pageId === 'page-reader') {
      e.preventDefault();
      backToCategory();
    } else if (pageId === 'page-category') {
      e.preventDefault();
      if (window.history.state && (window.history.state.page === 'category')) {
        window.history.back();
      } else {
        showPage('home', false);
        document.querySelectorAll('.nav-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.page === 'home');
        });
      }
    }
  }, { passive: false });
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  // ESC to close modals
  if (e.key === 'Escape') {
    const loginModal = document.getElementById('loginModal');
    const adminDrawer = document.getElementById('adminDrawer');
    if (loginModal.classList.contains('active')) {
      loginModal.classList.remove('active');
    } else if (adminDrawer.classList.contains('active')) {
      closeAdmin();
    }
  }
});
