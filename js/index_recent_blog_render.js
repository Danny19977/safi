(function () {
  let allRecentPosts = [];

  function getApiUrl(endpoint) {
    if (window.location.protocol === 'file:') {
      return 'http://localhost/Cafe%20SAFI/php/' + endpoint;
    }
    return 'php/' + endpoint;
  }

  function fetchJson(url, options) {
    return fetch(url, options)
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.json();
      });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    if (!value) {
      return 'Unknown date';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  function getCurrentLanguage() {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    if (window.translations && window.translations[savedLanguage]) {
      return savedLanguage;
    }
    return 'en';
  }

  function t(key, fallback) {
    const lang = getCurrentLanguage();
    const dictionary = window.translations && window.translations[lang];
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    return fallback;
  }

  function formatPageLabel(currentPage, totalPages) {
    const template = t('pagination_page_of', 'Page {current} of {total}');
    return template
      .replace('{current}', String(currentPage))
      .replace('{total}', String(totalPages));
  }

  function isVideoPath(path) {
    return /\.(mp4|webm|ogg)$/i.test(String(path || ''));
  }

  function renderRecentPosts(posts) {
    const container = document.getElementById('recentBlogContainer');
    if (!container) {
      return;
    }

    container.style.opacity = '1';
    container.style.visibility = 'visible';
    container.style.display = 'flex';

    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <p class="mb-0" style="color:#c49b63;">No published posts yet.</p>
        </div>
      `;
      renderPagination(0);
      return;
    }

    const totalPages = 1;
    const recentPosts = posts;

    container.innerHTML = recentPosts.map(function (post) {
      const images = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
      const coverImage = images.length > 0 ? images[0] : post.image_url;
      const mediaPath = coverImage ? escapeHtml(coverImage) : 'images/image_1.jpg';
      const title = escapeHtml(post.title || 'Untitled Post');
      const excerpt = escapeHtml(post.excerpt || '');
      const dateLabel = escapeHtml(formatDate(post.published_at));
      const detailUrl = 'blog-single.html?ref=' + encodeURIComponent(post.ref || '');
      const mediaHtml = isVideoPath(mediaPath)
        ? '<video class="blog-cover-video" controls><source src="' + mediaPath + '"></video>'
        : '<img src="' + mediaPath + '" alt="' + title + '" class="blog-cover-image">';

      return `
        <div class="col-md-4 d-flex">
          <div class="blog-entry align-self-stretch">
            <a href="${detailUrl}" class="block-20 blog-cover-link">
              ${mediaHtml}
            </a>
            <div class="text py-4 d-block">
              <div class="meta">
                <div><a href="${detailUrl}" style="color:#c49b63;">${dateLabel}</a></div>
              </div>
              <h3 class="heading mt-2"><a href="${detailUrl}" style="color:#c49b63;">${title}</a></h3>
              <p style="color:#c49b63;">${excerpt}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('recentBlogPagination');
    if (!paginationContainer) {
      return;
    }

    if (totalPages <= 0) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <div class="blog-pagination-controls">
        <span class="blog-pagination-label">${escapeHtml(formatPageLabel(1, 1))}</span>
      </div>
    `;
  }

  function loadRecentPosts() {
    const apiUrl = getApiUrl('get_blog_posts.php');

    fetchJson(apiUrl)
      .then(function (data) {
        if (!data || !data.success) {
          allRecentPosts = [];
          renderRecentPosts([]);
          return;
        }

        allRecentPosts = Array.isArray(data.posts) ? data.posts : [];
        renderRecentPosts(allRecentPosts);
      })
      .catch(function () {
        const container = document.getElementById('recentBlogContainer');
        const paginationContainer = document.getElementById('recentBlogPagination');
        if (!container) {
          return;
        }

        container.innerHTML = `
          <div class="col-12 text-center">
            <p class="mb-0" style="color:#c49b63;">Could not load recent posts right now.</p>
          </div>
        `;

        if (paginationContainer) {
          paginationContainer.innerHTML = '';
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadRecentPosts);
  } else {
    loadRecentPosts();
  }

  window.addEventListener('load', loadRecentPosts);
  setInterval(loadRecentPosts, 60000);
})();
