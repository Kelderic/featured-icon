(function(window) {

	FeaturedIconManager = (function( params ) {

		// STORE ORIGINAL BUTTON VALUES

		var l10nOriginal = {};

		/***************************************/
		/************* INITIALIZE **************/
		/***************************************/

		var Class = function( params ) {

			// STORE this AS self, SO THAT IT IS ACCESSIBLE IN SUB-FUNCTIONS AND TIMEOUTS.

			var self = this;

			// SETUP VARIABLES FROM USER-DEFINED PARAMETERS

			self.frame = null;
			self.el = {
				buttonSelect: document.querySelector('#fiazm_select'),
				buttonRemove: document.querySelector('#fiazm_remove'),
				modal: null,
				HTMLPreview: document.querySelector('#fiazm-post-icon'),
				permMetadata: document.querySelector('#_fiazm_perm_metadata'),
				permNoncedata: document.querySelector('#_fiazm_perm_noncedata'),
				tempNoncedata: document.querySelector('#_fiazm_temp_noncedata'),
				controlsWhenHasIcon: document.querySelectorAll('.fiazm-controls-has-icon'),
				controlsWhenNoIcon: document.querySelectorAll('.fiazm-controls-no-icon')
			};

			// STORE ORIGINAL BUTTON VALUES

			l10nOriginal = {
				insertIntoPost: wp.media.view.l10n.insertIntoPost
			};

			// IF EITHER BUTTON DOESN'T EXIST, EXIT GRACEFULLY

			if ( ( self.el.buttonSelect == null ) || ( self.el.buttonRemove == null ) ) {
				return false;
			}

			// STORE THE POST ID FOR LATER

			self.postID = self.el.permMetadata.dataset.post_id;

			// CREATE THE MEDIA FRAME

			self.frame = wp.media.frames.fiazm_frame = wp.media({
				state: 'featured-icon',
				frame: 'post',
				library: {
					type: 'image'
				}
			});

			// SPECIFY THE CUSTOM VIEW. THIS IN THEORY WOULD HAPPEN BEFORE
			// THE CREATING OF THE FRAME, BUT IT DOESN'T.

			self.frame.states.add([
				new wp.media.controller.Library({
					id:         'featured-icon',
					title:      'Select Image to Use as Icon',
					priority:   20,
					toolbar:    'main-insert',
					filterable: false,
					date:       false,
					searchable: false,
					library:    wp.media.query( self.frame.options.library ),
					multiple:   false,
					editable:   false,
					displaySettings: false,
					displayUserSettings: false
				}),
			]);

			// STORE A REFERENCE TO THE WRAPPING HTML ELEMENT

			self.el.modal = self.frame.el;

			// SPECIFY ACTION FOR THE 'ready' ACTION

			self.frame.on('ready', function() {

				self.el.modal.classList.add('fiazm-media-frame');

				if ( fiazmInfoFromPHP.showDetailSidebar !== '1' && fiazmInfoFromPHP.showDetailSidebar !== true ) {
					self.el.modal.classList.add('no-details-sidebar');
				}

			});

			// SPECIFY ACTION FOR THE 'open' ACTION

			self.frame.on('open', function() {

				if ( self.el.permMetadata.value != '' ) {

					attachment = wp.media.attachment(self.el.permMetadata.value);

					attachment.fetch();

					if ( attachment ) {

						self.frame.state().get('selection').add( attachment );

					}

				}

			});

			// SPECIFY ACTION FOR THE 'close' ACTION

			self.frame.on('close', function() {

				// RESET THE MAIN BUTTON TEXT

				wp.media.view.l10n.insertIntoPost = l10nOriginal.insertIntoPost;

			});

			// SPECIFY ACTION FOR THE 'update' ACTION. THIS HAPPENS WHEN
			// AN IMAGE IS SELECTED

			self.frame.on('insert', function() {

				var selectedImage = self.frame.state().get('selection').single();

				if ( selectedImage ) {

					update_metabox({
						HTMLPreview: '<a id="set-post-icon" href=""><img id="' + selectedImage.attributes.id + '" src="' + selectedImage.attributes.url + '"></a>',
						permMetadata: selectedImage.attributes.id
					}, self.el);

					update_temp_metadata( self.el, self.postID );

				}

			});

			// ADD EVENT LISTENER TO TRIGGER MEDIA MODEL WHEN USER CLICKS THE SELECT BUTTON

			self.el.buttonSelect.addEventListener('click', function(event){

				// CUSTOMIZE THE MAIN BUTTON TEXT

				wp.media.view.l10n.createNewGallery = 'Arrange Images';
				wp.media.view.l10n.updateGallery = 'Set Featured Gallery';
				wp.media.view.l10n.insertGallery = 'Set Featured Gallery';

				// OPEN THE MODAL

				self.frame.open();

			});

			self.el.buttonRemove.addEventListener('click', function(event){

				update_metabox({
					HTMLPreview: '',
					permMetadata: ''
				}, self.el);

				update_temp_metadata( self.el, self.postID );

			});

			self.el.HTMLPreview.addEventListener('click', function(event){

				event.preventDefault();

				// CUSTOMIZE THE MAIN BUTTON TEXT

				wp.media.view.l10n.insertIntoPost = 'Select Icon';

				// OPEN THE MODAL

				self.frame.open();

			});

		}

		function update_metabox( args, els ) {

			var HTMLPreview = null, permMetadata = null;

			if ( 'HTMLPreview' in args ) {
				HTMLPreview = args.HTMLPreview;
				els.HTMLPreview.innerHTML = args.HTMLPreview;
			}

			if ( 'permMetadata' in args ) {
				permMetadata = args.permMetadata;
				els.permMetadata.value = args.permMetadata;
			}

			var hasIconStyle = '', noIconStyle = '';

			if ( ( args.HTMLPreview === '' ) || ( args.permMetadata === '' ) ) {
				hasIconStyle = 'none';
			} else {
				noIconStyle = 'none';
			}

			els.controlsWhenNoIcon.forEach(function(el){
				el.style.display = noIconStyle;
			});

			els.controlsWhenHasIcon.forEach(function(el){
				el.style.display = hasIconStyle;
			});

		}

		function update_temp_metadata( els, postID ) {

			setTimeout(function(){

				ajax({
					method: 'post',
					queryURL: fiazmInfoFromPHP.wpAdminAjaxURL,
					data: {
						action: 'fiazm_save_temp_metadata', 
						fiazm_post_id: postID, 
						_fiazm_temp_noncedata: els.tempNoncedata.value,
						_fiazm_temp_metadata: els.permMetadata.value
					},
					success: function(serverResponse){
						serverResponse = JSON.parse(serverResponse);
						if ( ! serverResponse.success ) {
							console.log(serverResponse.response);
							alert('There was an issue with updating the live preview. Make sure that you click Save to ensure your changes aren\'t lost.');
						}
					},
					error: function(data) {
						alert('There was an issue with updating the live preview. Make sure that you click Save to ensure your changes aren\'t lost.');
					}
				});

			}, 0 );

		}

		function ajax( params ) {

			var method = 'method' in params ? params['method'] : 'get';
			var queryURL = 'queryURL' in params ? params['queryURL'] : '';
			var data = 'data' in params ? params['data'] : '';
			var datastring = '';
			var successCallback = 'success' in params ? params['success'] : function(params){console.log('Successfully completed AJAX request.')};
			var errorCallback = 'error' in params ? params['error'] : function(params){console.log('Error during AJAX request.');};
			var ajaxRequest = new XMLHttpRequest();

			switch ( typeof data ) {
				case 'string':
					datastring = data;
					break;
				case 'object':
					for ( key in data ) {
						datastring += key + '=' + data[key] + '&';
					}
					datastring = datastring.slice(0, -1);
					break;
			}

			ajaxRequest.onreadystatechange = function () {
				if ( ajaxRequest.readyState === 4 ) {
					if ( ajaxRequest.status === 200 ) {
						successCallback(ajaxRequest.responseText, ajaxRequest.status);
					} else {
						errorCallback(ajaxRequest.responseText, ajaxRequest.status);
					}
				}
			};

			if ( method.toLowerCase() == 'post' ) {

				ajaxRequest.open(method, queryURL, true);

				ajaxRequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

				ajaxRequest.send( datastring );

			} else {

				ajaxRequest.open(method, queryURL + ( datastring == '' ? '' : '?' + datastring ), true);

				ajaxRequest.send( null );

			}

		}

		return Class;

	}());

	document.addEventListener("DOMContentLoaded", function(event) {

		// INITIALIZE MANAGER WHEN DOM IS FULLY LOADED, AND ADD IT
		// TO WINDOW FOR DEBUGGING

		window.featuredIconManager = new FeaturedIconManager();

	});

}(window));