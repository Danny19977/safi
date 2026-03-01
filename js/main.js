try {
	if (typeof AOS !== 'undefined' && AOS && typeof AOS.init === 'function') {
		AOS.init({
			duration: 800,
			easing: 'slide'
		});
	}

	(function($) {

	"use strict";

	$(window).stellar({
    responsive: true,
    parallaxBackgrounds: true,
    parallaxElements: true,
    horizontalScrolling: false,
    hideDistantElements: false,
    scrollProperty: 'scroll',
    horizontalOffset: 0,
	  verticalOffset: 0
  });

  // Scrollax
  $.Scrollax();


	var fullHeight = function() {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function(){
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	// loader
	var loader = function() {
		setTimeout(function() { 
			if($('#ftco-loader').length > 0) {
				$('#ftco-loader').removeClass('show');
			}
		}, 1);
	};
	loader();

	// Scrollax
   $.Scrollax();

	var carousel = function() {
		$('.home-slider').owlCarousel({
	    loop:true,
	    autoplay: true,
	    margin:0,
	    animateOut: 'fadeOut',
	    animateIn: 'fadeIn',
	    nav:false,
	    autoplayHoverPause: false,
	    items: 1,
	    navText : ["<span class='ion-md-arrow-back'></span>","<span class='ion-chevron-right'></span>"],
	    responsive:{
	      0:{
	        items:1,
	        nav:false
	      },
	      600:{
	        items:1,
	        nav:false
	      },
	      1000:{
	        items:1,
	        nav:false
	      }
	    }
		});
		$('.carousel-work').owlCarousel({
			autoplay: true,
			center: true,
			loop: true,
			items:1,
			margin: 30,
			stagePadding:0,
			nav: true,
			navText: ['<span class="ion-ios-arrow-back">', '<span class="ion-ios-arrow-forward">'],
			responsive:{
				0:{
					items: 1,
					stagePadding: 0
				},
				600:{
					items: 2,
					stagePadding: 50
				},
				1000:{
					items: 3,
					stagePadding: 100
				}
			}
		});

	};
	carousel();

	$('nav .dropdown').hover(function(){
		var $this = $(this);
		// 	 timer;
		// clearTimeout(timer);
		$this.addClass('show');
		$this.find('> a').attr('aria-expanded', true);
		// $this.find('.dropdown-menu').addClass('animated-fast fadeInUp show');
		$this.find('.dropdown-menu').addClass('show');
	}, function(){
		var $this = $(this);
			// timer;
		// timer = setTimeout(function(){
			$this.removeClass('show');
			$this.find('> a').attr('aria-expanded', false);
			// $this.find('.dropdown-menu').removeClass('animated-fast fadeInUp show');
			$this.find('.dropdown-menu').removeClass('show');
		// }, 100);
	});


	$('#dropdown04').on('show.bs.dropdown', function () {
	  console.log('show');
	});

	// scroll
	var scrollWindow = function() {
		$(window).scroll(function(){
			var $w = $(this),
					st = $w.scrollTop(),
					navbar = $('.ftco_navbar'),
					sd = $('.js-scroll-wrap');

			if (st > 150) {
				if ( !navbar.hasClass('scrolled') ) {
					navbar.addClass('scrolled');	
				}
			} 
			if (st < 150) {
				if ( navbar.hasClass('scrolled') ) {
					navbar.removeClass('scrolled sleep');
				}
			} 
			if ( st > 350 ) {
				if ( !navbar.hasClass('awake') ) {
					navbar.addClass('awake');	
				}
				
				if(sd.length > 0) {
					sd.addClass('sleep');
				}
			}
			if ( st < 350 ) {
				if ( navbar.hasClass('awake') ) {
					navbar.removeClass('awake');
					navbar.addClass('sleep');
				}
				if(sd.length > 0) {
					sd.removeClass('sleep');
				}
			}
		});
	};
	scrollWindow();

	
	var counter = function() {
		
		$('#section-counter').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('ftco-animated') ) {

				var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',')
				$('.number').each(function(){
					var $this = $(this),
						num = $this.data('number');
						console.log(num);
					$this.animateNumber(
					  {
					    number: num,
					    numberStep: comma_separator_number_step
					  }, 7000
					);
				});
				
			}

		} , { offset: '95%' } );

	}
	counter();

	var contentWayPoint = function() {
		var i = 0;
		$('.ftco-animate').waypoint( function( direction ) {

			if( direction === 'down' && !$(this.element).hasClass('ftco-animated') ) {
				
				i++;

				$(this.element).addClass('item-animate');
				setTimeout(function(){

					$('body .ftco-animate.item-animate').each(function(k){
						var el = $(this);
						setTimeout( function () {
							var effect = el.data('animate-effect');
							if ( effect === 'fadeIn') {
								el.addClass('fadeIn ftco-animated');
							} else if ( effect === 'fadeInLeft') {
								el.addClass('fadeInLeft ftco-animated');
							} else if ( effect === 'fadeInRight') {
								el.addClass('fadeInRight ftco-animated');
							} else {
								el.addClass('fadeInUp ftco-animated');
							}
							el.removeClass('item-animate');
						},  k * 50, 'easeInOutExpo' );
					});
					
				}, 100);
				
			}

		} , { offset: '95%' } );
	};
	contentWayPoint();


	// navigation
	var OnePageNav = function() {
		$(".smoothscroll[href^='#'], #ftco-nav ul li a[href^='#']").on('click', function(e) {
		 	e.preventDefault();

		 	var hash = this.hash,
		 			navToggler = $('.navbar-toggler');
		 	$('html, body').animate({
		    scrollTop: $(hash).offset().top
		  }, 700, 'easeInOutExpo', function(){
		    window.location.hash = hash;
		  });


		  if ( navToggler.is(':visible') ) {
		  	navToggler.click();
		  }
		});
		$('body').on('activate.bs.scrollspy', function () {
		  console.log('nice');
		})
	};
	OnePageNav();


	// magnific popup
	$('.image-popup').magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    closeBtnInside: true,
    fixedContentPos: true,
    mainClass: 'mfp-no-margins mfp-with-zoom', // class to remove default margin from left and right side
     gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      verticalFit: true
    },
    zoom: {
      enabled: true,
      duration: 300 // don't foget to change the duration also in CSS
    }
  });

  $('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
    disableOn: 700,
    type: 'iframe',
    mainClass: 'mfp-fade',
    removalDelay: 160,
    preloader: false,

    fixedContentPos: false
  });


  $('.appointment_date').datepicker({
	  'format': 'm/d/yyyy',
	  'autoclose': true
	});

	$('.appointment_time').timepicker();




	})(jQuery);
} catch (mainScriptError) {
	console.error('[MainJS] Non-fatal error in UI initialization:', mainScriptError);
}

(function () {
	var footerText = {
		en: {
			no_recent_posts: 'No recent posts.'
		},
		fr: {
			no_recent_posts: 'Aucun article récent.'
		}
	};

	function getCurrentLanguage() {
		var savedLanguage = localStorage.getItem('preferred-language') || 'en';
		return footerText[savedLanguage] ? savedLanguage : 'en';
	}

	function t(key, fallback) {
		var lang = getCurrentLanguage();
		return (footerText[lang] && footerText[lang][key]) ? footerText[lang][key] : fallback;
	}

	function escapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function getApiUrl(endpoint) {
		if (window.location.protocol === 'file:') {
			return 'http://localhost/Cafe%20SAFI/php/' + endpoint;
		}
		return 'php/' + endpoint;
	}

	function formatDate(value) {
		if (!value) {
			return '';
		}

		var date = new Date(value);
		if (Number.isNaN(date.getTime())) {
			return String(value);
		}

		return date.toLocaleDateString();
	}

	function findFooterRecentBlogWidgets() {
		var widgets = Array.prototype.slice.call(document.querySelectorAll('footer .ftco-footer-widget'));
		var result = widgets.filter(function (widget) {
			var heading = widget.querySelector('.ftco-heading-2, h2, h3');
			if (!heading) {
				return false;
			}
			var key = heading.getAttribute('data-translate') || '';
			var text = (heading.textContent || '').toLowerCase();
			var isRecent = key === 'footer_recent_blog_title'
				|| key === 'footer_recent_blog'
				|| text.indexOf('recent blog') !== -1
				|| text.indexOf('blog récent') !== -1;
			return isRecent;
		});
		return result;
	}

	function renderFooterRecentPosts(posts) {
		var footerWidgets = findFooterRecentBlogWidgets();
		if (footerWidgets.length === 0) {
			return;
		}

		var displayPosts = Array.isArray(posts) ? posts.slice(0, 2) : [];

		footerWidgets.forEach(function (widget) {
			widget.querySelectorAll('.js-footer-recent-item, .js-footer-recent-empty').forEach(function (node) {
				node.remove();
			});

			widget.querySelectorAll('.block-21').forEach(function (node) {
				node.remove();
			});

			if (displayPosts.length === 0) {
				var emptyNode = document.createElement('p');
				emptyNode.className = 'mb-0 js-footer-recent-empty';
				emptyNode.textContent = t('no_recent_posts', 'No recent posts.');
				widget.appendChild(emptyNode);
				return;
			}

			displayPosts.forEach(function (post) {
				var image = (Array.isArray(post.images) && post.images.length > 0)
					? post.images[0]
					: (post.image_url || 'images/image_1.jpg');
				var title = escapeHtml(post.title || 'Untitled Post');
				var dateLabel = escapeHtml(formatDate(post.published_at));
				var link = 'blog-single.html?ref=' + encodeURIComponent(post.ref || '');

				widget.insertAdjacentHTML('beforeend', ''
					+ '<div class="block-21 mb-4 d-flex js-footer-recent-item">'
					+ '<a class="blog-img mr-4" href="' + link + '" style="background-image: url(' + escapeHtml(image) + ');"></a>'
					+ '<div class="text">'
					+ '<h3 class="heading"><a href="' + link + '">' + title + '</a></h3>'
					+ '<div class="meta"><div><a href="' + link + '"><span class="icon-calendar"></span> ' + dateLabel + '</a></div></div>'
					+ '</div>'
					+ '</div>');
			});
		});
	}

	function loadFooterRecentPosts() {
		var url = getApiUrl('get_blog_posts.php');
		fetch(url, { cache: 'no-store' })
			.then(function (response) {
				if (!response.ok) {
					throw new Error('HTTP ' + response.status);
				}
				return response.json();
			})
			.then(function (data) {
				if (!data || !data.success || !Array.isArray(data.posts)) {
					renderFooterRecentPosts([]);
					return;
				}

				renderFooterRecentPosts(data.posts);
			})
			.catch(function () {
				renderFooterRecentPosts([]);
			});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', loadFooterRecentPosts);
	} else {
		loadFooterRecentPosts();
	}
})();

