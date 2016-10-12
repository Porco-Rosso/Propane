/*global $ */
/*global document */
/*global window */


$(document).ready(function ($) {

	var index = 0;
	

	/* ========================================================================
	 * To get your own token you need first create vk application at https://vk.com/editapp?act=create
	 * Then  get your APP_ID and CLIENT_SECRET at application settings
	 * Now open this url from your logined to vk browser, this will redirect to blank.html with your token:
	 * https://oauth.vk.com/authorize?client_id=APP_ID&client_secret=CLIENT_SECRET&scope=audio,offline&response_type=token
	 *======================================================================== */

//	====== List of access tokens =======
// 95effcf84390a18dc1ce1a039e3bc8e0cfd3b5f973f93f90cf8279d1b8085758fbe1ebe85fe2011e59d39   #1 

	//Config for vk audio.search api
	var vkConfig = {
		url: "https://api.vk.com/method/video.search",
		sort: 2,
//		hd:0,
//		adult:0,
		autoComplete: 0,
		accessToken: "95effcf84390a18dc1ce1a039e3bc8e0cfd3b5f973f93f90cf8279d1b8085758fbe1ebe85fe2011e59d39", // Video Token 
		count: 199
	};
	window.vkConfig = vkConfig;


	$('.search').on('click touchstart', function (event) {
		query = $('#query').val();
		if (query == ""){			
			return; // return if query empty
						};
		search(query, null, null);
	});


	//Append Error To List
	function prependError(error) {
		$('#result > .list-group').html("");
		$('#result > .list-group').prepend('<li class="list-group-item list-group-item-danger">' + error + '</li>');
		$('#loading').hide();
	}
		// To make function Global 
		window.prependError =  prependError;

	//Main function for search
	function search(_query, captcha_sid, captcha_key) {
		var data = {
			q: _query,
			sort: vkConfig.sort,
			auto_complete: vkConfig.autoComplete,
			access_token: vkConfig.accessToken,
			count: vkConfig.count
		};
		
		if (captcha_sid != null && captcha_key != null) {
			data.captcha_sid = captcha_sid;
			data.captcha_key = captcha_key;
		}
		$.ajax({
			url: vkConfig.url,
			data: data,
			type: "GET",
			dataType: "jsonp",
			beforeSend: function () {
				$('#loading').show();
			},
			// error handling
			error: function () {
				prependError('Internet error...');
			},
			success: function (msg) {
				if (msg.error) {
					if (msg.error.error_code == 5) {
						prependError("Access Token error, contact me");
					} else {
						prependError("Oops, something went wrong : " + msg.error.error_msg);
					}
					if (msg.error.error_code == 14) {
						showCaptcha(msg.error.captcha_sid, msg.error.captcha_img);
					}
					return;
				}

				if (msg.response == 0) {
					prependError('<i class="fa fa-exclamation-triangle"></i>' + " Sorry, our team of trained monkeys couldn't find anything for this search query.");
					return;
				}

				var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
					};
				
								function escapeHtml(string) {
						return String(string).replace(/[&<>"'\/]/g, function (s) {
								return entityMap[s];
						});
				}
				window.msg = msg;
				
				// build search result list  
				$('#result > .list-group').html("");
				for (var i = 1; i < msg.response.length; i++) {
					
					var title = escapeHtml(msg.response[i].title);
					var url =  msg.response[i].player;
					var duration = msg.response[i].duration.toTime();					

					var savebutton = '<span class="badge download hint--top hint--rounded nomobile" data-hint="Save as ..."><a class="glyphicon glyphicon-cloud-download" href="' + url + '" download="'+ title + '.mp3"></a></span>';
					var length = '<span class="badge hint--top hint--rounded nomobile" data-hint="Song length">' + duration + '</span>';
					
					var link = '<a class="song" data-title="'+ title +'" data-duration="' + duration + '" data-url="'+ url +'">'+ title +'</a>';
					
					$('#result > .list-group').append('<li class="list-group-item">'+link+savebutton+length+'</li>');
					
				}
				$('#loading').hide();

			}
		});
	}


	//Sec To Time
	Number.prototype.toTime = function () {
		var sec_num = parseInt(this, 10);
		var hours = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		var seconds = sec_num - (hours * 3600) - (minutes * 60);

		if (hours < 1) {
			hours = "";
		} else {
			hours = hours + ':';
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		var time = hours + minutes + ':' + seconds;
		return time;
	};

	// captcha script //
	function showCaptcha(captchaSid, captchaImage) {
		//Tracking captchas
		try {
			ga('send', 'event', 'captcha');
		} catch (e) {}
		$('#captchaModal').modal("show");
		$('#captchaImage').attr('src', captchaImage);
		//refresh captcha onclick
		$('#captchaImage').on('click', function (event) {
			$(this).attr('src', captchaImage);
		});

		//Searching with old query and captcha
		$('#captchaSend').on('click', function () {
			$('#captchaModal').modal("hide");
			search($('#query').val(), captchaSid, $('#captchaKey').val());
		});

		//trigger send click after pressing enter button
		$('#captchaKey').bind('keypress', function (event) {
			if (event.keyCode == 13) {
				$('#captchaSend').trigger('click');
			}
		});
	}

});




// end of on document script  


//help button + modal

$(document).on("click", '#info-button', function (e) {
	bootbox.dialog({

		message: 'Hi!',
		title: 'Just some tips...',
		buttons: {
			success: {
				label: "dismiss",
				className: "btn-success",
				callback: function () {
					console.log("Closed info-box");
				}
			}
		}
	});
});


//scroll back to top script

$(document).ready(function () {
	$(window).scroll(function () {
		var ScrollTop = parseInt($(window).scrollTop());
		//            console.log(ScrollTop);

		if (ScrollTop > 600) {
			$('span.logo-text').text('Scroll back to top ↑');
		} else {
			$('span.logo-text').text('Propane');
		}

	});
});