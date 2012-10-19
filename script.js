(function($)
{
	/**
	 * Constructor for this plugin.
	 *
	 * This method creates a new function that overrides
	 * setDefaultValues in the wpLink object.
	 *
	 * The original setDefaultValues is however called in the
	 * new function.
	 *
	 * @param wpLink
	 */
	var autoLinkTitle = function(wpLink) {
		var self = this;

		originalSetDefaultValues = wpLink.setDefaultValues;
		wpLink.setDefaultValues = function () {
			originalSetDefaultValues();

			self.init($('#url-field'), $('#link-title-field'));
		};
	}
	
	/**
	 * Initialize class variables and triggers
	 * @param jQuery $url The URL input field
	 * @param jQuery $title The title input field
	 */
	autoLinkTitle.prototype.init = function($url, $title) {
		var self = this;

		self.$url       = $url;
		self.$title     = $title;
		self.currentUrl = $url.val();
		self.defaultTitlePlaceholder = self.$title.attr('placeholder');

		if (typeof self.defaultTitlePlaceholder == 'undefined') {
			self.defaultTitlePlaceholder = '';
		}

		$url.change(function(evt) {
			self.urlChange();
		});
	};
	
	/**
	 * The URL input's 'change' has been triggered,
	 * check whether we should download a title.
	 */
	autoLinkTitle.prototype.urlChange = function() {
		var self = this,
			newUrl = self.$url.val();

		// We don't want to ruin a title that's already been set
		if (self.$title.val().length > 0) {
			return;
		}

		// Simple regex to make sure we don't try to get titles from
		// urls like 'mailto:' or 'ftp://'.
		var urlPattern = new RegExp("^(http|https)://.+");

		if (self.currentUrl !== newUrl && urlPattern.test(newUrl)) {
			self.downloadTitle(newUrl);
		}

		self.currentUrl = $('#url-field').val();
	};
	
	/**
	 * Tries to download a title based on the given URL
	 * If a title is already set, this does nothing
	 *
	 * @param string url
	 */
	autoLinkTitle.prototype.downloadTitle = function(url) {
		var self = this,
			postData = {
				'action' : 'download_link_title',
				'nonce'  : null,
				'url'    : url
			};


		self.$title.attr('placeholder', 'Getting <title>...');

		$.post(ajaxurl, postData, function(data) {
			if ("success" == data.status) {
				// Success! Set the title.
				self.$title.val(data.title);

				self.$title.attr('placeholder', self.defaultTitlePlaceholder);
			} else {
				// Error handling
				switch (data.error) {
					case 'url-unavailable':
						self.setError('The URL given is invalid or unavailable');
						break;
					case 'no-title':
						self.setError('The <title> tag could not be found at the URL');
						break;
				}
			}
		});
	};
	
	/**
	 * Displays an error in the placeholder attribute of the title input field
	 * 
	 * The error is displayed for 4 seconds.
	 * 
	 * @param string message The error message to display
	 */
	autoLinkTitle.prototype.setError = function(message) {
		var self = this;

		self.$title.attr('placeholder', 'Sorry, I failed: ' + message);

		setTimeout(function() {
			self.$title.attr('placeholder', self.defaultTitlePlaceholder);
		}, 4000);
	}



	if (typeof wpLink == 'undefined')
	{
		return;
	}
	new autoLinkTitle(wpLink);
} )( jQuery );