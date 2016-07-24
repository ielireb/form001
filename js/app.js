"use strict";

$(function() {

    var main = {
        names: {},
        captionFocus: false,
        init: function() {
            $('.disContentWrapper').addClass('is-textSelected');
            $('.disContentWrapper p').attr('contenteditable', true);
            main.insertRow();
            var s = $('.is-selected');
            s.focus();
            main.showPlusBtn(s, 'text');
        },
        resetSelect: function(s) {
            s.removeClass('is-selected');
            var p = s.parents('.disContentWrapper');
            p.removeClass('is-textSelected is-mediaSelected');
        },
        select: function(s, type) {
            var p = s.parents('.disContentWrapper');
            p.children().removeClass('is-selected');
            s.addClass('is-selected');

            p.removeClass('is-textSelected is-mediaSelected');
            p.addClass('is-'+type+'Selected');
        },
        isEmpty: function(str) {
            return (!str || 0 === str.length);
        },
        showPlusBtn: function(s, type) {
            var p = s.parents('.disContentWrapper');
            var inlineMenuW = $('.disInlineMenuWrapper');
            var c = "";
            inlineMenuW.attr('style', 'top:'+s.offset().top+'px;left:'+(s.offset().left-40)+'px;');

            switch(type) {
                case 'text':
                    c = s.html();

                    if (main.isEmpty(c)) {
                        inlineMenuW.show();
                    } else {
                        inlineMenuW.hide();
                        main.resetInlineMenu();
                    }
                    break;
                case 'media':
                    inlineMenuW.hide();
                    main.resetInlineMenu();
                    break;          
            }
        },
        toggleInlineMenu: function(b) {
            var im = $('.disInlineMenu');
            var s = $('.is-selected');
            var ph = '';

            if (b.hasClass('fa-plus')) {
                b.removeClass('fa-plus');
                b.addClass('fa-close');
                im.show();
                main.changePlaceholder(s, '');
            } else {
                b.removeClass('fa-close');
                b.addClass('fa-plus');
                im.hide();
                ph = (main.checkIfFirstElement(s)) ? 'Tell your story...' : '';
                main.changePlaceholder(s, ph);
            }
        },
        resetInlineMenu: function() {
            var b = $('.disPlusBtn');
            var im = $('.disInlineMenu');

            b.removeClass('fa-close');
            b.addClass('fa-plus');
            im.hide();
        },
        checkIfFirstElement: function(s) {
        	return s.is(':first-child');
        },
        insertRow: function() {
            var s = $('.is-selected');
            var n = main.generateUniqueName();
            main.names[n] = {type: 'text', content: ''};
            var ph = '';

            if (main.isEmpty(s)) {
                $('.disContentWrapper').append('<p class="dis--p is-selected" placeholder="'+ph+'" name="'+n+'"></p>');
            } else {
                s.removeClass('is-selected');
                s.after('<p class="dis--p is-selected" placeholder="'+ph+'" name="'+n+'"></p>');
            }
            s = $('.is-selected');
			ph = (main.checkIfFirstElement(s)) ? 'Tell your story...' : '';
            s.attr('placeholder', ph);
            s.attr('contenteditable', true);
            $('.is-selected').focus();
        },
        sortRows: function() {
            var names = Object.keys(main.names);
            var strNames = "[name='" + names.join("'], [name='") + "']";
            var ret = {};

            $(strNames).each(function(i) {
            	var n = $(this).attr('name');
            	ret[n] = main.names[n];
            });

            return ret;
        },
        deleteRow: function() {
            var s = $('.is-selected');
            var c = "";
            var p_s = null;

            if (s.hasClass('dis--p')) {
                c = s.html();

                if (main.isEmpty(c)) {
                    if (main.checkIfFirstElement(s)) {
                        main.removeRowAndName(s);
                        main.insertRow();
                    } else {
                        p_s = s.prev();

                        if (p_s.hasClass('dis--image') || p_s.hasClass('dis--video') || p_s.hasClass('dis--embed') || p_s.hasClass('dis--hr')) {
                            main.removeRowAndName(p_s);
                            s.focus();
                        } else {
                            main.removeRowAndName(s);
                            p_s.focus();
                            main.placeCaretAtEnd(p_s[0]);                        
                        }
                    }
                    return false;
                }
            } else {
                main.removeRowAndName(s);
                main.insertRow();
            }
        },
        deleteSelectedRow: function() {
            var s = $('.is-selected');
            if (s.hasClass('dis--image') || s.hasClass('dis--video') || s.hasClass('dis--embed')) {
                main.removeRowAndName(s);
                if (main.checkIfFirstElement(s)) {
                    main.insertRow();
                }
            }
            return true;
        },
        removeRowAndName: function(s) {
            var n = s.attr('name');
            delete main.names[n];
	 		s.prev('.clearfix').remove();
            s.remove();
        },
        removePlaceholder: function(s) {
            if (!s.text().replace(" ", "").length) {
                s.empty();
            }
        },
        changePlaceholder: function(s, placeholderTxt) {
            s.attr('placeholder', placeholderTxt);
        },
        placeCaretAtEnd: function(el) {
            el.focus();
            if (typeof window.getSelection != "undefined"
                    && typeof document.createRange != "undefined") {
                var range = document.createRange();
                range.selectNodeContents(el);
                range.collapse(false);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            } else if (typeof document.body.createTextRange != "undefined") {
                var textRange = document.body.createTextRange();
                textRange.moveToElementText(el);
                textRange.collapse(false);
                textRange.select();
            }
        },
        checkContent: function() {
            var s = $('.is-selected');
            var c = s.html();
            var n = '';

            function getParm(c, base) {
                var re = new RegExp("(\\?|&)" + base + "\\=([^&]*)(&|$)");
                var matches = c.match(re);
                if (matches) {
                    return(matches[2]);
                } else {
                    return("");
                }
            }

            var retVal = {};
            var matches;
            var proc = 0;

            var videoUrl = '';

            if (c.match('http(s)?://(www.)?youtube|youtu\.be')) {
              if (c.match('embed')) { retVal.id = c.split(/embed\//)[1].split('"')[0]; }
                else { retVal.id = c.split(/v\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]; }
                retVal.provider = "youtube";
                videoUrl = 'https://www.youtube.com/embed/' + retVal.id + '?rel=0';
                proc = 1;
            } else if (matches = c.match(/vimeo.com\/(\d+)/)) {
                retVal.provider = "vimeo";
                retVal.id = matches[1];
                videoUrl = 'http://player.vimeo.com/video/' + retVal.id;
                proc = 1;
            } else if (matches = c.match(/twitter.com\/(\w+)/)) {
                retVal.provider = "twitter";
                retVal.id = matches[1];
                proc = 2;
            }

            if (proc == 1) {
                s = $('.is-selected');
                n = s.attr('name');
                main.names[n] = {
                    type: 'video',
                    provider: retVal.provider,
                    url: videoUrl,
                    alignment: 'in-center',
                    caption: ''
                };

                s.replaceWith('<figure tabindex="0" class="dis--video is-selected" name="'+n+'"></figure>');
                s = $('.is-selected');
                s.append('<div class="iframeContainer"><iframe width="700" height="394" src="'+videoUrl+'" frameborder="0"></iframe></div><figcaption class="imageCaption" contenteditable="true" placeholder="Type caption for embed (optional)"></figcaption>');
            } else if (proc == 2) {
                s = $('.is-selected');
                n = s.attr('name');
                main.names[n] = {
                    type: 'embed',
                    provider: retVal.provider,
                    twitter_account: retVal.id
                };

                $.ajax({
                    url : 'user_show.php?sn='+retVal.id,
                    dataType : 'json',
                    success : function(r) {
		                s.replaceWith('<figure tabindex="0" class="dis--embed is-first-selected" name="'+n+'"></figure>');
		                s = $('.is-first-selected');
		                s.append('<div class="embedContainer">'+
							'	<a href="https://twitter.com/'+r.name+'" class="twitterDetail" title="https://twitter.com/'+r.name+'">'+
							'		<strong class="">'+r.name+' (@'+r.screen_name+') | Twitter</strong><br/>'+
							'		<em class="">The latest Tweets from '+r.name+' (@'+r.screen_name+'). '+r.description+'</em>twitter.com'+
							'	<a href="https://twitter.com/'+r.name+'" class="imageTwitterBanner" title="https://twitter.com/'+r.name+'" style="background-image: url('+r.profile_banner_url+');"></a>'+
							'</div>');
						s.removeClass('is-first-selected');
						s = $('.is-selected');
						s.focus();
                    },
                    error : function(jqXHR, status, e) {
                    },
                });
            }
        },
        toggleMTMenu: function(s, a) {
            var mtm = $('.disInlineMediaTransformMenu');
            main.repositionMTMenu(s, mtm);
            var s = null;

            if (a == 'show') {
                mtm.show();
                s = $('.is-selected');                
            } else {
                mtm.hide();
            }
        },
        repositionMTMenu: function(s, mtm) {
            var l = ((s.outerWidth()-mtm.outerWidth()) / 2)+s.offset().left
            mtm.attr('style', 'top:'+(s.offset().top+20)+'px;left:'+l+'px;');
        },
        resetMTButton: function() {
            $('[data-action="media-transform"]').removeClass('is-active');
        },
        setMTButton: function(v) {
            $('[data-action="media-transform"][data-action-value="'+v+'"]').addClass('is-active');
        },
        resetMediaTransform: function() {
            var s = $('.is-selected');
			s.prev('.clearfix').remove();
            s.removeClass('dis--layoutOutsetLeft dis--layoutOutsetCenter dis--layoutFillWidth');
            s.find('iframe').attr('width', 525);
        },
        setMediaTransform: function(s, b) {
            var v = b.data('action-value');
            s.data('layout-value', v);
			var p = s.parents('.disContentWrapper');

            main.setNameAttr(s, {alignment: v});

            switch (v) {
                case 'out-left':
                	s.before('<div class="clearfix"></div>');
                    s.addClass('dis--layoutOutsetLeft');
                    s.find('iframe').attr('width', 525);
                    s.find('iframe').attr('height', 295);
                    break;
                case 'in-center':
                    s.find('iframe').attr('width', 700);
                    s.find('iframe').attr('height', 394);
                    break;
                case 'out-center':
                    s.addClass('dis--layoutOutsetCenter');
                    s.find('iframe').attr('width', 1015);
                    s.find('iframe').attr('height', 571);
                    break;
                case 'fillwidth':
                    s.addClass('dis--layoutFillWidth');
                    s.find('iframe').attr('width', 1280);
                    s.find('iframe').attr('height', 720);
                    p.attr('style', 'width: 100% !important;');
                    break;
            }
        },
        generateUniqueName: function() {
            var n = '';
            var names = Object.keys(main.names);
            do {
                n = ('0000' + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
            } while ($.inArray(n, names) == 0);
            return n;
        },
        setNameAttr: function(s, attr) {
            var n = s.attr('name');
            for (var key in attr) {
                main.names[n][key] = attr[key];
            }
        },
        showInlineHighlightMenu: function(s) {
            $('.disInlineHighlightMenu').show();
        },
        attachWysiwyg: function(s) {
            s.wysiwyg({
                classes: 'some-more-classes',
                position: 'selection',
                buttons: {
                    bold: {
                        title: 'Bold',
                        image: '\uf032',
                        hotkey: 'b'
                    },
                    italic: {
                        title: 'Italic',
                        image: '\uf033',
                        hotkey: 'i'
                    },
                    insertlink: {
                        title: 'Insert link',
                        image: '\uf08e'
                    },
                    h1: {
                        title: 'H1',
                        image: '\uf031',
                        click: function(b) {
                            if (s[0].firstChild.localName == 'h1') {
                                s.html(s[0].firstChild.innerHTML);
                            } else {
                                s.wysiwyg('format','h1');
                            }
                        },
                    },
                    h2: {
                        title: 'H2',
                        image: '\uf031',
                        click: function(b) {
                            if (s[0].firstChild.localName == 'h2') {
                                s.html(s[0].firstChild.innerHTML);
                            } else {
                                s.wysiwyg('format','h2');
                            }
                        },
                    },
                    blockquote: {
                        title: 'Blockquote',
                        image: '\uf031',
                        click: function(b) {
                            if (s[0].firstChild.localName == 'blockquote') {
                                s.html(s[0].firstChild.innerHTML);
                            } else {
                                s.wysiwyg('format','blockquote');
                            }
                        },
                    },
                    removeformat: {
                        title: 'Remove format',
                        image: '\uf12d'
                    }
                },
                submit: {
                    title: 'Submit',
                    image: '\uf00c'
                },
                placeholderUrl: 'Paste or type a link',
            });
        }
    };

    $(document).keydown(function(e) {
        switch(e.keyCode) {
            case 13: 
                return e.which != 13;
                break;
            case 8:
                if (!main.captionFocus) {
                    return main.deleteRow();
                }
                break;
            case 46:
                return main.deleteSelectedRow();
                break;
        }
    });

    $('body')
        .on('focus click', '.disContentWrapper p', function(e) {
            var s = $(this);
            main.resetSelect(s);
            main.toggleMTMenu(s, 'hide');
            main.resetMTButton();

            main.select(s, 'text');
            main.showPlusBtn(s, 'text');

            main.attachWysiwyg(s);
        })
        .on('cut paste copy keyup', '.disContentWrapper p.is-selected', function(e) {
            var s = $(this);
            var c = "";

            switch(e.keyCode) {
                case 13: 
                    main.checkContent();
                    main.insertRow();
                    return e.which != 13;
                    break;
                default:
                    c = s.html();
                    main.setNameAttr(s, {content: c});
            }

            main.showPlusBtn(s, 'text');
        })
        .on('focusout', '.disContentWrapper p.is-selected', function(e) {
            var s = $(this);
            main.removePlaceholder(s);
        })
        .on('click', '.disContentWrapper>figure', function(e) {
            var s = $(this);
            main.select(s, 'media');
            main.showPlusBtn(s, 'media');

            if (!s.hasClass('dis--embed')) {
	            main.toggleMTMenu(s, 'show');

	            var v = s.data('action-value');
	            if (v == undefined) {
	                v = 'in-center';
	            }
	            main.resetMTButton();
	            main.setMTButton(v);
	        }
        })
        .on('click', '[data-action="media-transform"]', function(e) {
            e.preventDefault();
            var b = $(this);
            var s = $('.is-selected');
            var v = b.data('action-value');
            var mtm = $('.disInlineMediaTransformMenu');

            main.select(s, 'media');
            main.resetMediaTransform();
            main.setMediaTransform(s, b);
            main.resetMTButton();

            if (v == undefined) {
                v = 'in-center';
            }
            main.setMTButton(v);
            main.repositionMTMenu(s, mtm);
        })
        .on('keyup', '.disContentWrapper>figure', function(e) {
            switch(e.keyCode) {
                case 13: 
                    main.insertRow();
                    return e.which != 13;
                    break;
            }
        })
        .on('click', '.disPlusBtn', function(e) {
            var b = $(this);
            main.toggleInlineMenu(b);
        })
        .on('click', '.disImageBtn', function(e) {
            $('.disContentWrapper').append('<input type="file" name="test" class="dis--imagefile" style="display: none;" />');
            $('.dis--imagefile[type="file"]').trigger('click');
        })
        .on('click', '.disVideoBtn', function(e) {
            var b = $('.disPlusBtn');
            main.toggleInlineMenu(b);

            var s = $('.is-selected');
            main.changePlaceholder(s, 'Paste a YouTube, Vine, Vimeo, or other video link, and press Enter');
            s.focus();
        })
        .on('click', '.disEmbedBtn', function(e) {
            var b = $('.disPlusBtn');
            main.toggleInlineMenu(b);

            var s = $('.is-selected');
            main.changePlaceholder(s, 'Paste a link to embed content from another site (e.g. Twitter) and press Enter');
            s.focus();
        })
        .on('click', '.disHrBtn', function(e) {
            var s = $('.is-selected');
            var n = s.attr('name');
            main.names[n] = {type: 'hr'};
            s.replaceWith('<hr class="section-divider is-selected dis--hr" name="'+n+'"></h2>');
            main.resetInlineMenu();
            main.insertRow();
        })
        .on('focus', '.disContentWrapper .imageCaption', function(e) {
            main.captionFocus = true;
        })
        .on('focusout', '.disContentWrapper .imageCaption', function(e) {
            var s = $(this);
            main.removePlaceholder(s);
            main.captionFocus = false;
        })
        .on('cut paste copy keyup', '.disContentWrapper .imageCaption', function(e) {
            var s = $('.is-selected');
            var v = $(this)[0].innerText;
            $(this).html(v);
            main.setNameAttr(s, {caption: v});
        })
        .on('change', '.dis--imagefile[type="file"]', function(e) {
            var s = $('.is-selected');
            var src = $(this).addImage(this, s);
            main.showPlusBtn(s, 'media');
        })
        .on('click', '.disSubmitBtn', function(e) {
			var names = main.sortRows();

			var v = JSON.stringify(names); 

	        var form = document.createElement("form");
	        form._submit_function_ = form.submit;
	        form.setAttribute('method', 'POST');
	        form.setAttribute('action', 'process.php');

	        var input = document.createElement('input');
	        input.type = 'hidden';
	        input.name = 'data';
	        input.value = v;
	        form.appendChild(input);

	        form.submit();
			document.body.removeChild(form);
        })
        ;

    main.init();

    $.fn.extend({
        addImage: function (input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                var file_id = input.getAttribute('id');
                reader.onload = function (e) { 
                    var image = new Image();
                    image.src = e.target.result;

                    image.onload = function () {
                        var src = this.src;

                        var s = $('.is-selected');
                        var n = s.attr('name');
                        main.names[n] = {
                            type: 'image',
                            src: src,
                            width: this.width,
                            height: this.height,
                            alignment: 'in-center',
                            caption: ''
                        };

                        s.replaceWith('<figure tabindex="0" class="dis--image is-selected" name="'+n+'"></figure>');
                        s = $('.is-selected');
                        s.append('<div><img src="'+src+'" /></div><figcaption class="imageCaption" contenteditable="true" placeholder="Type caption for image (optional)"></figcaption>');
                        $('.dis--imagefile[type="file"]').remove();
                        main.insertRow();
                    }
                }
                reader.readAsDataURL(input.files[0]);
            }
        }
    });

});