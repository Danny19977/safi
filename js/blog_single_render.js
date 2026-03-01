(function () {
  let blogPostList = [];
  const SIDEBAR_PAGE_SIZE = 3;
  let sidebarPage = 1;
  let sidebarSearchQuery = '';
  let sidebarCategoryId = '';
  let currentPostRef = '';

  const categoryMap = {
    1: 'Coffee',
    2: 'Recipes',
    3: 'News',
    4: 'Events'
  };

  function getApiUrl(endpointWithQuery) {
    if (window.location.protocol === 'file:') {
      return 'http://localhost/Cafe%20SAFI/php/' + endpointWithQuery;
    }
    return 'php/' + endpointWithQuery;
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
    if (window.blogSingleTranslations && window.blogSingleTranslations[savedLanguage]) {
      return savedLanguage;
    }
    return 'en';
  }

  function t(key, fallback) {
    const lang = getCurrentLanguage();
    const dictionary = window.blogSingleTranslations && window.blogSingleTranslations[lang];
    if (dictionary && dictionary[key]) {
      return dictionary[key];
    }
    return fallback;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function nl2br(value) {
    return escapeHtml(value).replace(/\n/g, '<br>');
  }

  function formatDate(value) {
    if (!value) {
      return t('unknown_date', 'Unknown date');
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString();
  }

  function normalizeText(value) {
    return String(value || '').toLowerCase();
  }

  function getCategoryLabel(categoryId) {
    return categoryMap[Number(categoryId)] || t('blog_general_category', 'General');
  }

  function formatPageLabel(current, total) {
    const template = t('pagination_page_of', 'Page {current} of {total}');
    return template
      .replace('{current}', String(current))
      .replace('{total}', String(total));
  }

  function renderNotFound(message) {
    const container = document.getElementById('blogSingleContent');
    if (!container) {
      return;
    }

    container.classList.remove('ftco-animate');
    container.style.opacity = '1';
    container.style.visibility = 'visible';

    container.innerHTML = `
      <h2 class="mb-3">${escapeHtml(t('post_not_available', 'Post Not Available'))}</h2>
      <p>${escapeHtml(message || t('requested_post_not_loaded', 'The requested blog post could not be loaded.'))}</p>
      <p><a href="blog.html" class="btn btn-primary">${escapeHtml(t('back_to_blog', 'Back to Blog'))}</a></p>
    `;
  }

  function renderPost(post) {
    const container = document.getElementById('blogSingleContent');
    const titleNode = document.getElementById('blogSinglePageTitle');
    const breadcrumbTitleNode = document.getElementById('blogSingleBreadcrumbTitle');

    if (!container) {
      return;
    }

    container.classList.remove('ftco-animate');
    container.style.opacity = '1';
    container.style.visibility = 'visible';

    const safeTitle = escapeHtml(post.title || t('untitled_post', 'Untitled Post'));
    const safeContent = nl2br(post.content || '');
    const safeDate = escapeHtml(formatDate(post.published_at));
    const imageList = Array.isArray(post.images) ? post.images.filter(Boolean).slice(0, 10) : [];
    if (imageList.length === 0 && post.image_url) {
      imageList.push(post.image_url);
    }

    const imageMarkup = imageList.map(function (imagePath) {
      const safeImagePath = escapeHtml(imagePath);
      return `<p><img src="${safeImagePath}" alt="${safeTitle}" class="img-fluid"></p>`;
    }).join('');

    if (titleNode) {
      titleNode.textContent = post.title || t('blog_single_page_title', 'Blog Details');
    }

    if (breadcrumbTitleNode) {
      breadcrumbTitleNode.textContent = post.title || t('breadcrumb_blog_single', 'Blog Single');
    }

    container.innerHTML = `
      <h2 class="mb-3">${safeTitle}</h2>
      <p class="text-muted"><span class="icon-calendar"></span> ${safeDate}</p>
      ${imageMarkup}
      <p>${safeContent}</p>
    `;

    renderPostPagination(post.ref || '');
  }

  function renderPostPagination(currentRef) {
    const container = document.getElementById('blogSingleContent');
    if (!container || !Array.isArray(blogPostList) || blogPostList.length === 0) {
      return;
    }

    const currentIndex = blogPostList.findIndex(function (item) {
      return (item.ref || '') === currentRef;
    });

    if (currentIndex === -1) {
      return;
    }

    const newerPost = currentIndex > 0 ? blogPostList[currentIndex - 1] : null;
    const olderPost = currentIndex < blogPostList.length - 1 ? blogPostList[currentIndex + 1] : null;
    const pageLabel = escapeHtml(formatPageLabel(currentIndex + 1, blogPostList.length));

    const newerLabel = escapeHtml(t('pagination_previous', 'Previous'));
    const olderLabel = escapeHtml(t('pagination_next', 'Next'));

    const newerLink = newerPost
      ? '<a class="btn btn-sm btn-outline-primary mr-2" href="blog-single.html?ref=' + encodeURIComponent(newerPost.ref || '') + '">' + newerLabel + '</a>'
      : '<button class="btn btn-sm btn-outline-primary mr-2" disabled>' + newerLabel + '</button>';

    const olderLink = olderPost
      ? '<a class="btn btn-sm btn-outline-primary" href="blog-single.html?ref=' + encodeURIComponent(olderPost.ref || '') + '">' + olderLabel + '</a>'
      : '<button class="btn btn-sm btn-outline-primary" disabled>' + olderLabel + '</button>';

    container.insertAdjacentHTML('beforeend', ''
      + '<div class="mt-4 blog-pagination-controls">'
      + newerLink
      + '<span class="blog-pagination-label">' + pageLabel + '</span>'
      + olderLink
      + '</div>');
  }

  function renderSidebarRecent(currentRef) {
    const container = document.getElementById('blogSingleRecentContainer');
    const paginationContainer = document.getElementById('blogSingleRecentPagination');
    if (!container || !paginationContainer) {
      return;
    }

    const recentPosts = blogPostList.filter(function (item) {
      return (item.ref || '') !== (currentRef || '');
    }).filter(function (item) {
      const categoryId = String(Number(item.category_id) || 0);
      const q = normalizeText(sidebarSearchQuery);
      const searchable = [
        normalizeText(item.title),
        normalizeText(item.excerpt),
        normalizeText(item.content),
        normalizeText(getCategoryLabel(item.category_id))
      ].join(' ');
      const matchesSearch = q === '' || searchable.indexOf(q) !== -1;
      const matchesCategory = sidebarCategoryId === '' || categoryId === sidebarCategoryId;
      return matchesSearch && matchesCategory;
    });

    if (recentPosts.length === 0) {
      container.innerHTML = '<p class="mb-0">' + escapeHtml(t('sidebar_no_additional_posts', 'No additional posts available.')) + '</p>';
      paginationContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(recentPosts.length / SIDEBAR_PAGE_SIZE));
    if (sidebarPage > totalPages) {
      sidebarPage = totalPages;
    }

    const startIndex = (sidebarPage - 1) * SIDEBAR_PAGE_SIZE;
    const pageItems = recentPosts.slice(startIndex, startIndex + SIDEBAR_PAGE_SIZE);

    container.innerHTML = pageItems.map(function (post) {
      const image = Array.isArray(post.images) && post.images.length > 0 ? post.images[0] : (post.image_url || 'images/image_1.jpg');
      const title = escapeHtml(post.title || t('untitled_post', 'Untitled Post'));
      const link = 'blog-single.html?ref=' + encodeURIComponent(post.ref || '');
      const categoryLabel = escapeHtml(getCategoryLabel(post.category_id));
      return '<div class="block-21 mb-3 d-flex">'
        + '<a class="blog-img mr-3" href="' + link + '" style="background-image:url(' + escapeHtml(image) + ');"></a>'
        + '<div class="text">'
        + '<h3 class="heading"><a href="' + link + '">' + title + '</a></h3>'
        + '<div class="meta"><div><a href="' + link + '">' + categoryLabel + '</a></div></div>'
        + '</div>'
        + '</div>';
    }).join('');

    const prevDisabled = sidebarPage <= 1 ? 'disabled' : '';
    const nextDisabled = sidebarPage >= totalPages ? 'disabled' : '';
    const prevLabel = escapeHtml(t('pagination_previous', 'Previous'));
    const nextLabel = escapeHtml(t('pagination_next', 'Next'));

    paginationContainer.innerHTML = ''
      + '<div class="blog-pagination-controls">'
      + '<button class="btn btn-sm btn-outline-primary mr-2" id="blogSingleRecentPrev" ' + prevDisabled + '>' + prevLabel + '</button>'
      + '<span class="blog-pagination-label">' + escapeHtml(formatPageLabel(sidebarPage, totalPages)) + '</span>'
      + '<button class="btn btn-sm btn-outline-primary ml-2" id="blogSingleRecentNext" ' + nextDisabled + '>' + nextLabel + '</button>'
      + '</div>';

    const prevButton = document.getElementById('blogSingleRecentPrev');
    const nextButton = document.getElementById('blogSingleRecentNext');

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        if (sidebarPage > 1) {
          sidebarPage -= 1;
          renderSidebarRecent(currentRef);
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        if (sidebarPage < totalPages) {
          sidebarPage += 1;
          renderSidebarRecent(currentRef);
        }
      });
    }
  }

  function renderSidebarCategories(currentRef) {
    const categoriesNode = document.getElementById('blogSingleCategories');
    if (!categoriesNode) {
      return;
    }

    const availablePosts = blogPostList.filter(function (item) {
      return (item.ref || '') !== (currentRef || '');
    });

    const counts = {};
    availablePosts.forEach(function (item) {
      const key = String(Number(item.category_id) || 0);
      counts[key] = (counts[key] || 0) + 1;
    });

    const keys = Object.keys(counts).sort(function (a, b) {
      return Number(a) - Number(b);
    });

    const allCount = availablePosts.length;
    let html = '<li><a href="#" data-category=""' + (sidebarCategoryId === '' ? ' class="active"' : '') + '>' + escapeHtml(t('sidebar_category_all', 'All')) + ' <span>(' + allCount + ')</span></a></li>';

    keys.forEach(function (key) {
      html += '<li><a href="#" data-category="' + key + '"' + (sidebarCategoryId === key ? ' class="active"' : '') + '>'
        + escapeHtml(getCategoryLabel(key)) + ' <span>(' + counts[key] + ')</span></a></li>';
    });

    categoriesNode.innerHTML = html;

    categoriesNode.querySelectorAll('a[data-category]').forEach(function (anchor) {
      anchor.addEventListener('click', function (event) {
        event.preventDefault();
        sidebarCategoryId = anchor.getAttribute('data-category') || '';
        sidebarPage = 1;
        renderSidebarCategories(currentPostRef);
        renderSidebarRecent(currentPostRef);
      });
    });
  }

  function bindSidebarSearch() {
    const searchNode = document.getElementById('blogSingleSearchInput');
    if (!searchNode) {
      return;
    }

    searchNode.addEventListener('input', function () {
      sidebarSearchQuery = searchNode.value || '';
      sidebarPage = 1;
      renderSidebarRecent(currentPostRef);
    });
  }

  function bindLanguageRefresh() {
    document.querySelectorAll('#langDropdown + .dropdown-menu .dropdown-item').forEach(function (item) {
      item.addEventListener('click', function () {
        setTimeout(function () {
          renderSidebarCategories(currentPostRef);
          renderSidebarRecent(currentPostRef);
        }, 0);
      });
    });
  }

  function loadSinglePost() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');

    const apiUrl = ref
      ? getApiUrl('get_blog_post.php?ref=' + encodeURIComponent(ref))
      : getApiUrl('get_blog_post.php');

    const listApiUrl = getApiUrl('get_blog_posts.php');

    Promise.all([
      fetchJson(apiUrl),
      fetchJson(listApiUrl).catch(function () {
        return { success: false, posts: [] };
      })
    ])
      .then(function (results) {
        const data = results[0];
        const listData = results[1];

        blogPostList = listData && listData.success && Array.isArray(listData.posts)
          ? listData.posts
          : [];

        if (!data || !data.success || !data.post) {
          renderNotFound(data && data.message ? data.message : t('post_not_found', 'Post not found.'));
          return;
        }

        currentPostRef = data.post.ref || '';
        sidebarPage = 1;
        sidebarSearchQuery = '';
        sidebarCategoryId = '';
        renderPost(data.post);
        renderSidebarCategories(currentPostRef);
        renderSidebarRecent(data.post.ref || '');
      })
      .catch(function () {
        renderNotFound(t('error_loading_post', 'An error occurred while loading this post.'));
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    bindSidebarSearch();
    bindLanguageRefresh();
    loadSinglePost();
  });
})();