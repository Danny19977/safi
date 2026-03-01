$(function () {
	var $modal = $('#testimonyVideoModal');
	var $previewVideos = $('.js-testimony-video');
	var player = document.getElementById('testimonyVideoPlayer');
	var source = document.getElementById('testimonyVideoSource');

	if (!$modal.length || !player || !source) {
		return;
	}

	function pauseOtherVideos(currentVideo) {
		$previewVideos.each(function () {
			if (this !== currentVideo) {
				this.pause();
			}
		});

		if (player !== currentVideo) {
			player.pause();
		}
	}

	$previewVideos.on('click', function () {
		var videoSrc = $(this).attr('data-video-src');
		pauseOtherVideos(this);
		source.src = videoSrc;
		player.load();
		$modal.modal('show');
	});

	$previewVideos.on('play', function () {
		pauseOtherVideos(this);
	});

	$(player).on('play', function () {
		pauseOtherVideos(player);
	});

	$modal.on('hidden.bs.modal', function () {
		player.pause();
		source.src = '';
		player.load();
	});
});
