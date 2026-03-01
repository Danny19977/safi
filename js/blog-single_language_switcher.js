let blogSingleCurrentLanguage = 'en';

function switchBlogSingleLanguage(lang) {
	blogSingleCurrentLanguage = lang;

	if (!blogSingleTranslations || !blogSingleTranslations[lang]) {
		return;
	}

	document.querySelectorAll('[data-translate]').forEach(function (element) {
		const key = element.getAttribute('data-translate');
		if (blogSingleTranslations[lang] && blogSingleTranslations[lang][key]) {
			const translatedValue = blogSingleTranslations[lang][key].replace('{year}', new Date().getFullYear());
			if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
				element.placeholder = translatedValue;
			} else {
				element.innerHTML = translatedValue;
			}
		}
	});

	localStorage.setItem('preferred-language', lang);
}

function initializeBlogSingleLanguage() {
	const savedLanguage = localStorage.getItem('preferred-language') || 'en';
	switchBlogSingleLanguage(savedLanguage);
}

document.addEventListener('DOMContentLoaded', function () {
	initializeBlogSingleLanguage();

	document.querySelectorAll('#langDropdown + .dropdown-menu .dropdown-item').forEach(function (item) {
		item.addEventListener('click', function (event) {
			event.preventDefault();
			const lang = this.getAttribute('data-lang');
			if (lang) {
				switchBlogSingleLanguage(lang);
			}
		});
	});
});
