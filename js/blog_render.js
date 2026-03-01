(function () {
  const PAGE_SIZE = 3;
  let allBlogPosts = [];
  let filteredBlogPosts = [];
  let currentPage = 1;
  let selectedCategoryId = '';
  let searchQuery = '';

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

  function getCurrentLanguage() {
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    if (window.blogTranslations && window.blogTranslations[savedLanguage]) {
      return savedLanguage;
    }
    return 'en';
  }

  function t(key, fallback) {
    const lang = getCurrentLanguage();
    const dictionary = window.blogTranslations && window.blogTranslations[lang];
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    return fallback;
  }

  const categoryMap = {
    1: 'Coffee',
    2: 'Recipes',
    3: 'News',
    4: 'Events'
  };

  function getCategoryLabel(categoryId) {
    return categoryMap[Number(categoryId)] || t('blog_general_category', 'General');
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
      return t('blog_unknown_date', 'Unknown date');
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  function formatPageLabel(currentPage, totalPages) {
    const template = t('pagination_page_of', 'Page {current} of {total}');
    return template
      .replace('{current}', String(currentPage))
      .replace('{total}', String(totalPages));
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase();
  }

  function renderCategoryOptions() {
    const selectNode = document.getElementById('blogCategorySelect');
    if (!selectNode) {
      return;
    }

    const counts = {};
    allBlogPosts.forEach(function (post) {
      const key = String(Number(post.category_id) || 0);
      counts[key] = (counts[key] || 0) + 1;
    });

    const keys = Object.keys(counts).sort(function (a, b) {
      return Number(a) - Number(b);
    });

    const options = ['<option value="">' + escapeHtml(t('blog_categories_placeholder', 'Categories')) + '</option>'];
    keys.forEach(function (key) {
      const label = escapeHtml(getCategoryLabel(key));
      options.push('<option value="' + key + '">' + label + ' (' + counts[key] + ')</option>');
    });

    selectNode.innerHTML = options.join('');
    selectNode.value = selectedCategoryId;
  }

  function applyFilters() {
    filteredBlogPosts = allBlogPosts.filter(function (post) {
      const postCategoryId = String(Number(post.category_id) || 0);
      const categoryLabel = normalizeText(getCategoryLabel(post.category_id));
      const matchCategory = selectedCategoryId === '' || postCategoryId === selectedCategoryId;
      const q = normalizeText(searchQuery);
      const searchable = [
        normalizeText(post.title),
        normalizeText(post.excerpt),
        normalizeText(post.content),
        categoryLabel
      ].join(' ');
      const matchSearch = q === '' || searchable.indexOf(q) !== -1;
      return matchCategory && matchSearch;
    });

    currentPage = 1;
    renderPosts(filteredBlogPosts);
  }

  function bindFilterEvents() {
    const searchNode = document.getElementById('blogSearchInput');
    const categoryNode = document.getElementById('blogCategorySelect');

    if (searchNode) {
      searchNode.addEventListener('input', function () {
        searchQuery = searchNode.value || '';
        applyFilters();
      });
    }

    if (categoryNode) {
      categoryNode.addEventListener('change', function () {
        selectedCategoryId = categoryNode.value || '';
        applyFilters();
      });
    }
  }

  function bindLanguageRefresh() {
    document.querySelectorAll('#langDropdown + .dropdown-menu .dropdown-item').forEach(function (item) {
      item.addEventListener('click', function () {
        setTimeout(function () {
          renderCategoryOptions();
        }, 0);
      });
    });
  }

  function renderPosts(posts) {
    const container = document.getElementById('blogPostsContainer');
    if (!container) {
      return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
      container.innerHTML = `
        <div class="col-12 text-center">
          <h2 class="mb-4" style="font-size: 2rem; color: #c49b63;">${escapeHtml(t('blog_no_posts_title', 'No Posts Yet'))}</h2>
          <p class="lead mb-0" style="color: #c49b63;">${escapeHtml(t('blog_no_posts_text', 'No published blog posts are available right now.'))}</p>
        </div>
      `;
      renderPagination(0);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pagePosts = posts.slice(startIndex, endIndex);

    container.innerHTML = pagePosts.map(function (post) {
      const imageList = Array.isArray(post.images) ? post.images.filter(Boolean) : [];
      const coverImage = imageList.length > 0 ? imageList[0] : post.image_url;
      const imagePath = coverImage ? escapeHtml(coverImage) : 'images/image_1.jpg';
      const title = escapeHtml(post.title || t('blog_untitled_post', 'Untitled Post'));
      const excerpt = escapeHtml(post.excerpt || '');
      const dateLabel = escapeHtml(formatDate(post.published_at));
      const categoryLabel = escapeHtml(getCategoryLabel(post.category_id));
      const detailUrl = 'blog-single.html?ref=' + encodeURIComponent(post.ref || '');

      return `
        <div class="col-md-4 d-flex">
          <div class="blog-entry align-self-stretch">
            <a href="${detailUrl}" class="block-20 blog-cover-link">
              <img src="${imagePath}" alt="${title}" class="blog-cover-image">
            </a>
            <div class="text py-4 d-block">
              <div class="meta">
                <div><a href="${detailUrl}" style="color:#c49b63;">${dateLabel}</a></div>
                <div><a href="${detailUrl}" style="color:#c49b63;">${categoryLabel}</a></div>
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
    const paginationContainer = document.getElementById('blogPostsPagination');
    if (!paginationContainer) {
      return;
    }

    if (totalPages <= 0) {
      paginationContainer.innerHTML = '';
      return;
    }

    const prevDisabled = currentPage <= 1 ? 'disabled' : '';
    const nextDisabled = currentPage >= totalPages ? 'disabled' : '';

    paginationContainer.innerHTML = `
      <div class="blog-pagination-controls">
        <button class="btn btn-sm btn-outline-primary mr-2" id="blogPostsPrevBtn" ${prevDisabled}>${escapeHtml(t('pagination_previous', 'Previous'))}</button>
        <span class="blog-pagination-label">${escapeHtml(formatPageLabel(currentPage, totalPages))}</span>
        <button class="btn btn-sm btn-outline-primary ml-2" id="blogPostsNextBtn" ${nextDisabled}>${escapeHtml(t('pagination_next', 'Next'))}</button>
      </div>
    `;

    const prevBtn = document.getElementById('blogPostsPrevBtn');
    const nextBtn = document.getElementById('blogPostsNextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (currentPage > 1) {
          currentPage -= 1;
          renderPosts(allBlogPosts);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        const maxPage = Math.max(1, Math.ceil(filteredBlogPosts.length / PAGE_SIZE));
        if (currentPage < maxPage) {
          currentPage += 1;
          renderPosts(filteredBlogPosts);
        }
      });
    }
  }

  function loadPosts() {
    const apiUrl = getApiUrl('get_blog_posts.php');

    fetchJson(apiUrl, { cache: 'no-store' })
      .then(function (data) {
        const posts = Array.isArray(data)
          ? data
          : (Array.isArray(data && data.posts) ? data.posts : []);

        if (!data || (data.success === false)) {
          allBlogPosts = [];
          currentPage = 1;
          renderPosts([]);
          return;
        }

        allBlogPosts = posts;
        renderCategoryOptions();
        applyFilters();
      })
      .catch(function () {
        const container = document.getElementById('blogPostsContainer');
        const paginationContainer = document.getElementById('blogPostsPagination');
        if (!container) {
          return;
        }

        container.innerHTML = `
          <div class="col-12 text-center">
            <p class="lead mb-0" style="color:#c49b63;">${escapeHtml(t('blog_load_error', 'Could not load blog posts right now.'))}</p>
          </div>
        `;

        if (paginationContainer) {
          paginationContainer.innerHTML = '';
        }
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindFilterEvents();
    bindLanguageRefresh();
    loadPosts();
    setInterval(loadPosts, 60000);
  });
})();