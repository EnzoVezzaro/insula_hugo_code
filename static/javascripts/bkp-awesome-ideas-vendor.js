/*!
 * fullPage 2.7.9
 * https://github.com/alvarotrigo/fullPage.js
 * @license MIT licensed
 *
 * Copyright (C) 2015 alvarotrigo.com - A project by Alvaro Trigo
 */
(function(global, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function($) {
          return factory($, global, global.document, global.Math);
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'), global, global.document, global.Math);
    } else {
        factory(jQuery, global, global.document, global.Math);
    }
})(typeof window !== 'undefined' ? window : this, function($, window, document, Math, undefined) {
    'use strict';

    // keeping central set of classnames and selectors
    var WRAPPER =               'fullpage-wrapper';
    var WRAPPER_SEL =           '.' + WRAPPER;

    // slimscroll
    var SCROLLABLE =            'fp-scrollable';
    var SCROLLABLE_SEL =        '.' + SCROLLABLE;
    var SLIMSCROLL_BAR_SEL =    '.slimScrollBar';
    var SLIMSCROLL_RAIL_SEL =   '.slimScrollRail';

    // util
    var RESPONSIVE =            'fp-responsive';
    var NO_TRANSITION =         'fp-notransition';
    var DESTROYED =             'fp-destroyed';
    var ENABLED =               'fp-enabled';
    var VIEWING_PREFIX =        'fp-viewing';
    var ACTIVE =                'active';
    var ACTIVE_SEL =            '.' + ACTIVE;
    var COMPLETELY =            'fp-completely';
    var COMPLETELY_SEL =        '.' + COMPLETELY;

    // section
    var SECTION_DEFAULT_SEL =   '.section';
    var SECTION =               'fp-section';
    var SECTION_SEL =           '.' + SECTION;
    var SECTION_ACTIVE_SEL =    SECTION_SEL + ACTIVE_SEL;
    var SECTION_FIRST_SEL =     SECTION_SEL + ':first';
    var SECTION_LAST_SEL =      SECTION_SEL + ':last';
    var TABLE_CELL =            'fp-tableCell';
    var TABLE_CELL_SEL =        '.' + TABLE_CELL;
    var AUTO_HEIGHT =           'fp-auto-height';
    var AUTO_HEIGHT_SEL =       '.fp-auto-height';
    var NORMAL_SCROLL =         'fp-normal-scroll';
    var NORMAL_SCROLL_SEL =     '.fp-normal-scroll';

    // section nav
    var SECTION_NAV =           'fp-nav';
    var SECTION_NAV_SEL =       '#' + SECTION_NAV;
    var SECTION_NAV_TOOLTIP =   'fp-tooltip';
    var SECTION_NAV_TOOLTIP_SEL='.'+SECTION_NAV_TOOLTIP;
    var SHOW_ACTIVE_TOOLTIP =   'fp-show-active';

    // slide
    var SLIDE_DEFAULT_SEL =     '.slide';
    var SLIDE =                 'fp-slide';
    var SLIDE_SEL =             '.' + SLIDE;
    var SLIDE_ACTIVE_SEL =      SLIDE_SEL + ACTIVE_SEL;
    var SLIDES_WRAPPER =        'fp-slides';
    var SLIDES_WRAPPER_SEL =    '.' + SLIDES_WRAPPER;
    var SLIDES_CONTAINER =      'fp-slidesContainer';
    var SLIDES_CONTAINER_SEL =  '.' + SLIDES_CONTAINER;
    var TABLE =                 'fp-table';

    // slide nav
    var SLIDES_NAV =            'fp-slidesNav';
    var SLIDES_NAV_SEL =        '.' + SLIDES_NAV;
    var SLIDES_NAV_LINK_SEL =   SLIDES_NAV_SEL + ' a';
    var SLIDES_ARROW =          'fp-controlArrow';
    var SLIDES_ARROW_SEL =      '.' + SLIDES_ARROW;
    var SLIDES_PREV =           'fp-prev';
    var SLIDES_PREV_SEL =       '.' + SLIDES_PREV;
    var SLIDES_ARROW_PREV =     SLIDES_ARROW + ' ' + SLIDES_PREV;
    var SLIDES_ARROW_PREV_SEL = SLIDES_ARROW_SEL + SLIDES_PREV_SEL;
    var SLIDES_NEXT =           'fp-next';
    var SLIDES_NEXT_SEL =       '.' + SLIDES_NEXT;
    var SLIDES_ARROW_NEXT =     SLIDES_ARROW + ' ' + SLIDES_NEXT;
    var SLIDES_ARROW_NEXT_SEL = SLIDES_ARROW_SEL + SLIDES_NEXT_SEL;

    var $window = $(window);
    var $document = $(document);

    var defaultScrollHandler;

    $.fn.fullpage = function(options) {
        //only once my friend!
        if($('html').hasClass(ENABLED)){ displayWarnings(); return };

        // common jQuery objects
        var $htmlBody = $('html, body');
        var $body = $('body');

        var FP = $.fn.fullpage;
        // Create some defaults, extending them with any options that were provided
        options = $.extend({
            //navigation
            menu: false,
            anchors:[],
            lockAnchors: false,
            navigation: false,
            navigationPosition: 'right',
            navigationTooltips: [],
            showActiveTooltip: false,
            slidesNavigation: false,
            slidesNavPosition: 'bottom',
            scrollBar: false,
            hybrid: false,

            //scrolling
            css3: true,
            scrollingSpeed: 700,
            autoScrolling: true,
            fitToSection: true,
            fitToSectionDelay: 1000,
            easing: 'easeInOutCubic',
            easingcss3: 'ease',
            loopBottom: false,
            loopTop: false,
            loopHorizontal: true,
            continuousVertical: false,
            normalScrollElements: null,
            scrollOverflow: false,
            scrollOverflowHandler: defaultScrollHandler,
            touchSensitivity: 5,
            normalScrollElementTouchThreshold: 5,

            //Accessibility
            keyboardScrolling: true,
            animateAnchor: true,
            recordHistory: true,

            //design
            controlArrows: true,
            controlArrowColor: '#fff',
            verticalCentered: true,
            resize: false,
            sectionsColor : [],
            paddingTop: 0,
            paddingBottom: 0,
            fixedElements: null,
            responsive: 0, //backwards compabitility with responsiveWiddth
            responsiveWidth: 0,
            responsiveHeight: 0,

            //Custom selectors
            sectionSelector: SECTION_DEFAULT_SEL,
            slideSelector: SLIDE_DEFAULT_SEL,


            //events
            afterLoad: null,
            onLeave: null,
            afterRender: null,
            afterResize: null,
            afterReBuild: null,
            afterSlideLoad: null,
            onSlideLeave: null
        }, options);

        displayWarnings();

        //easeInOutCubic animation included in the plugin
        $.extend($.easing,{ easeInOutCubic: function (x, t, b, c, d) {if ((t/=d/2) < 1) return c/2*t*t*t + b;return c/2*((t-=2)*t*t + 2) + b;}});

        /**
        * Sets the autoScroll option.
        * It changes the scroll bar visibility and the history of the site as a result.
        */
        FP.setAutoScrolling = function(value, type){
            setVariableState('autoScrolling', value, type);

            var element = $(SECTION_ACTIVE_SEL);

            if(options.autoScrolling && !options.scrollBar){
                $htmlBody.css({
                    'overflow' : 'hidden',
                    'height' : '100%'
                });

                FP.setRecordHistory(originals.recordHistory, 'internal');

                //for IE touch devices
                container.css({
                    '-ms-touch-action': 'none',
                    'touch-action': 'none'
                });

                if(element.length){
                    //moving the container up
                    silentScroll(element.position().top);
                }

            }else{
                $htmlBody.css({
                    'overflow' : 'visible',
                    'height' : 'initial'
                });

                FP.setRecordHistory(false, 'internal');

                //for IE touch devices
                container.css({
                    '-ms-touch-action': '',
                    'touch-action': ''
                });

                silentScroll(0);

                //scrolling the page to the section with no animation
                if (element.length) {
                    $htmlBody.scrollTop(element.position().top);
                }
            }
        };

        /**
        * Defines wheter to record the history for each hash change in the URL.
        */
        FP.setRecordHistory = function(value, type){
            setVariableState('recordHistory', value, type);
        };

        /**
        * Defines the scrolling speed
        */
        FP.setScrollingSpeed = function(value, type){
            setVariableState('scrollingSpeed', value, type);
        };

        /**
        * Sets fitToSection
        */
        FP.setFitToSection = function(value, type){
            setVariableState('fitToSection', value, type);
        };

        /**
        * Sets lockAnchors
        */
        FP.setLockAnchors = function(value){
            options.lockAnchors = value;
        };

        /**
        * Adds or remove the possiblity of scrolling through sections by using the mouse wheel or the trackpad.
        */
        FP.setMouseWheelScrolling = function (value){
            if(value){
                addMouseWheelHandler();
                addMiddleWheelHandler();
            }else{
                removeMouseWheelHandler();
                removeMiddleWheelHandler();
            }
        };

        /**
        * Adds or remove the possiblity of scrolling through sections by using the mouse wheel/trackpad or touch gestures.
        * Optionally a second parameter can be used to specify the direction for which the action will be applied.
        *
        * @param directions string containing the direction or directions separated by comma.
        */
        FP.setAllowScrolling = function (value, directions){
            if(typeof directions !== 'undefined'){
                directions = directions.replace(/ /g,'').split(',');

                $.each(directions, function (index, direction){
                    setIsScrollAllowed(value, direction, 'm');
                });
            }
            else if(value){
                FP.setMouseWheelScrolling(true);
                addTouchHandler();
            }else{
                FP.setMouseWheelScrolling(false);
                removeTouchHandler();
            }
        };

        /**
        * Adds or remove the possiblity of scrolling through sections by using the keyboard arrow keys
        */
        FP.setKeyboardScrolling = function (value, directions){
            if(typeof directions !== 'undefined'){
                directions = directions.replace(/ /g,'').split(',');

                $.each(directions, function (index, direction){
                    setIsScrollAllowed(value, direction, 'k');
                });
            }else{
                options.keyboardScrolling = value;
            }
        };

        /**
        * Moves the page up one section.
        */
        FP.moveSectionUp = function(){
            var prev = $(SECTION_ACTIVE_SEL).prev(SECTION_SEL);

            //looping to the bottom if there's no more sections above
            if (!prev.length && (options.loopTop || options.continuousVertical)) {
                prev = $(SECTION_SEL).last();
            }

            if (prev.length) {
                scrollPage(prev, null, true);
            }
        };

        /**
        * Moves the page down one section.
        */
        FP.moveSectionDown = function (){
            var next = $(SECTION_ACTIVE_SEL).next(SECTION_SEL);

            //looping to the top if there's no more sections below
            if(!next.length &&
                (options.loopBottom || options.continuousVertical)){
                next = $(SECTION_SEL).first();
            }

            if(next.length){
                scrollPage(next, null, false);
            }
        };

        /**
        * Moves the page to the given section and slide with no animation.
        * Anchors or index positions can be used as params.
        */
        FP.silentMoveTo = function(sectionAnchor, slideAnchor){
            FP.setScrollingSpeed (0, 'internal');
            FP.moveTo(sectionAnchor, slideAnchor)
            FP.setScrollingSpeed (originals.scrollingSpeed, 'internal');
        };

        /**
        * Moves the page to the given section and slide.
        * Anchors or index positions can be used as params.
        */
        FP.moveTo = function (sectionAnchor, slideAnchor){
            var destiny = getSectionByAnchor(sectionAnchor);

            if (typeof slideAnchor !== 'undefined'){
                scrollPageAndSlide(sectionAnchor, slideAnchor);
            }else if(destiny.length > 0){
                scrollPage(destiny);
            }
        };

        /**
        * Slides right the slider of the active section.
        * Optional `section` param.
        */
        FP.moveSlideRight = function(section){
            moveSlide('next', section);
        };

        /**
        * Slides left the slider of the active section.
        * Optional `section` param.
        */
        FP.moveSlideLeft = function(section){
            moveSlide('prev', section);
        };

        /**
         * When resizing is finished, we adjust the slides sizes and positions
         */
        FP.reBuild = function(resizing){
            if(container.hasClass(DESTROYED)){ return; }  //nothing to do if the plugin was destroyed

            isResizing = true;

            var windowsWidth = $window.outerWidth();
            windowsHeight = $window.height();  //updating global var

            //text resizing
            if (options.resize) {
                resizeMe(windowsHeight, windowsWidth);
            }

            $(SECTION_SEL).each(function(){
                var slidesWrap = $(this).find(SLIDES_WRAPPER_SEL);
                var slides = $(this).find(SLIDE_SEL);

                //adjusting the height of the table-cell for IE and Firefox
                if(options.verticalCentered){
                    $(this).find(TABLE_CELL_SEL).css('height', getTableHeight($(this)) + 'px');
                }

                $(this).css('height', windowsHeight + 'px');

                //resizing the scrolling divs
                if(options.scrollOverflow){
                    if(slides.length){
                        slides.each(function(){
                            createSlimScrolling($(this));
                        });
                    }else{
                        createSlimScrolling($(this));
                    }
                }

                //adjusting the position fo the FULL WIDTH slides...
                if (slides.length > 1) {
                    landscapeScroll(slidesWrap, slidesWrap.find(SLIDE_ACTIVE_SEL));
                }
            });

            var activeSection = $(SECTION_ACTIVE_SEL);
            var sectionIndex = activeSection.index(SECTION_SEL);

            //isn't it the first section?
            if(sectionIndex){
                //adjusting the position for the current section
                FP.silentMoveTo(sectionIndex + 1);
            }

            isResizing = false;
            $.isFunction( options.afterResize ) && resizing && options.afterResize.call(container);
            $.isFunction( options.afterReBuild ) && !resizing && options.afterReBuild.call(container);
        };

        /**
        * Turns fullPage.js to normal scrolling mode when the viewport `width` or `height`
        * are smaller than the set limit values.
        */
        FP.setResponsive = function (active){
            var isResponsive = $body.hasClass(RESPONSIVE);

            if(active){
                if(!isResponsive){
                    FP.setAutoScrolling(false, 'internal');
                    FP.setFitToSection(false, 'internal');
                    $(SECTION_NAV_SEL).hide();
                    $body.addClass(RESPONSIVE);
                }
            }
            else if(isResponsive){
                FP.setAutoScrolling(originals.autoScrolling, 'internal');
                FP.setFitToSection(originals.autoScrolling, 'internal');
                $(SECTION_NAV_SEL).show();
                $body.removeClass(RESPONSIVE);
            }
        }

        //flag to avoid very fast sliding for landscape sliders
        var slideMoving = false;

        var isTouchDevice = navigator.userAgent.match(/(iPhone|iPod|iPad|Android|playbook|silk|BlackBerry|BB10|Windows Phone|Tizen|Bada|webOS|IEMobile|Opera Mini)/);
        var isTouch = (('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0) || (navigator.maxTouchPoints));
        var container = $(this);
        var windowsHeight = $window.height();
        var isResizing = false;
        var isWindowFocused = true;
        var lastScrolledDestiny;
        var lastScrolledSlide;
        var canScroll = true;
        var scrollings = [];
        var nav;
        var controlPressed;
        var isScrollAllowed = {};
        isScrollAllowed.m = {  'up':true, 'down':true, 'left':true, 'right':true };
        isScrollAllowed.k = $.extend(true,{}, isScrollAllowed.m);
        var originals = $.extend(true, {}, options); //deep copy

        //timeouts
        var resizeId;
        var afterSectionLoadsId;
        var afterSlideLoadsId;
        var scrollId;
        var scrollId2;
        var keydownId;

        if($(this).length){
            init();
            bindEvents();
        }

        function init(){
            //if css3 is not supported, it will use jQuery animations
            if(options.css3){
                options.css3 = support3d();
            }

            options.scrollBar = options.scrollBar || options.hybrid;


            setOptionsFromDOM();

            prepareDom();
            FP.setAllowScrolling(true);

            FP.setAutoScrolling(options.autoScrolling, 'internal');

            //the starting point is a slide?
            var activeSlide = $(SECTION_ACTIVE_SEL).find(SLIDE_ACTIVE_SEL);

            //the active section isn't the first one? Is not the first slide of the first section? Then we load that section/slide by default.
            if( activeSlide.length &&  ($(SECTION_ACTIVE_SEL).index(SECTION_SEL) !== 0 || ($(SECTION_ACTIVE_SEL).index(SECTION_SEL) === 0 && activeSlide.index() !== 0))){
                silentLandscapeScroll(activeSlide);
            }

            responsive();

            //setting the class for the body element
            setBodyClass();

            $window.on('load', function() {
                scrollToAnchor();
            });
        }

        function bindEvents(){
            $window
                //when scrolling...
                .on('scroll', scrollHandler)

                //detecting any change on the URL to scroll to the given anchor link
                //(a way to detect back history button as we play with the hashes on the URL)
                .on('hashchange', hashChangeHandler)

                //when opening a new tab (ctrl + t), `control` won't be pressed when comming back.
                .blur(blurHandler)

                //when resizing the site, we adjust the heights of the sections, slimScroll...
                .resize(resizeHandler);

            $document
                //Sliding with arrow keys, both, vertical and horizontal
                .keydown(keydownHandler)

                //to prevent scrolling while zooming
                .keyup(keyUpHandler)

                //Scrolls to the section when clicking the navigation bullet
                .on('click touchstart', SECTION_NAV_SEL + ' a', sectionBulletHandler)

                //Scrolls the slider to the given slide destination for the given section
                .on('click touchstart', SLIDES_NAV_LINK_SEL, slideBulletHandler)

                .on('click', SECTION_NAV_TOOLTIP_SEL, tooltipTextHandler);

            //Scrolling horizontally when clicking on the slider controls.
            $(SECTION_SEL).on('click touchstart', SLIDES_ARROW_SEL, slideArrowHandler);

            /**
            * Applying normalScroll elements.
            * Ignoring the scrolls over the specified selectors.
            */
            if(options.normalScrollElements){
                $document.on('mouseenter', options.normalScrollElements, function () {
                    FP.setMouseWheelScrolling(false);
                });

                $document.on('mouseleave', options.normalScrollElements, function(){
                    FP.setMouseWheelScrolling(true);
                });
            }
        }

        /**
        * Setting options from DOM elements if they are not provided.
        */
        function setOptionsFromDOM(){
            //no anchors option? Checking for them in the DOM attributes
            if(!options.anchors.length){
                options.anchors = $(options.sectionSelector + '[data-anchor]').map(function(){
                    return $(this).data('anchor').toString();
                }).get();
            }

            //no tooltipos option? Checking for them in the DOM attributes
            if(!options.navigationTooltips.length){
                options.navigationTooltips = $(options.sectionSelector + '[data-tooltip]').map(function(){
                    return $(this).data('tooltip').toString();
                }).get();
            }
        }

        /**
        * Works over the DOM structure to set it up for the current fullpage optionss.
        */
        function prepareDom(){
            container.css({
                'height': '100%',
                'position': 'relative'
            });

            //adding a class to recognize the container internally in the code
            container.addClass(WRAPPER);
            $('html').addClass(ENABLED);

            //due to https://github.com/alvarotrigo/fullPage.js/issues/1502
            windowsHeight = $window.height();

            container.removeClass(DESTROYED); //in case it was destroyed before initilizing it again

            addInternalSelectors();

             //styling the sections / slides / menu
            $(SECTION_SEL).each(function(index){
                var section = $(this);
                var slides = section.find(SLIDE_SEL);
                var numSlides = slides.length;

                styleSection(section, index);
                styleMenu(section, index);

                // if there's any slide
                if (numSlides > 0) {
                    styleSlides(section, slides, numSlides);
                }else{
                    if(options.verticalCentered){
                        addTableClass(section);
                    }
                }
            });

            //fixed elements need to be moved out of the plugin container due to problems with CSS3.
            if(options.fixedElements && options.css3){
                $(options.fixedElements).appendTo($body);
            }

            //vertical centered of the navigation + active bullet
            if(options.navigation){
                addVerticalNavigation();
            }

            if(options.scrollOverflow){
                if(document.readyState === 'complete'){
                    createSlimScrollingHandler();
                }
                //after DOM and images are loaded
                $window.on('load', createSlimScrollingHandler);
            }else{
                afterRenderActions();
            }
        }

        /**
        * Styles the horizontal slides for a section.
        */
        function styleSlides(section, slides, numSlides){
            var sliderWidth = numSlides * 100;
            var slideWidth = 100 / numSlides;

            slides.wrapAll('<div class="' + SLIDES_CONTAINER + '" />');
            slides.parent().wrap('<div class="' + SLIDES_WRAPPER + '" />');

            section.find(SLIDES_CONTAINER_SEL).css('width', sliderWidth + '%');

            if(numSlides > 1){
                if(options.controlArrows){
                    createSlideArrows(section);
                }

                if(options.slidesNavigation){
                    addSlidesNavigation(section, numSlides);
                }
            }

            slides.each(function(index) {
                $(this).css('width', slideWidth + '%');

                if(options.verticalCentered){
                    addTableClass($(this));
                }
            });

            var startingSlide = section.find(SLIDE_ACTIVE_SEL);

            //if the slide won't be an starting point, the default will be the first one
            //the active section isn't the first one? Is not the first slide of the first section? Then we load that section/slide by default.
            if( startingSlide.length &&  ($(SECTION_ACTIVE_SEL).index(SECTION_SEL) !== 0 || ($(SECTION_ACTIVE_SEL).index(SECTION_SEL) === 0 && startingSlide.index() !== 0))){
                silentLandscapeScroll(startingSlide);
            }else{
                slides.eq(0).addClass(ACTIVE);
            }
        }

        /**
        * Styling vertical sections
        */
        function styleSection(section, index){
            //if no active section is defined, the 1st one will be the default one
            if(!index && $(SECTION_ACTIVE_SEL).length === 0) {
                section.addClass(ACTIVE);
            }

            section.css('height', windowsHeight + 'px');

            if(options.paddingTop){
                section.css('padding-top', options.paddingTop);
            }

            if(options.paddingBottom){
                section.css('padding-bottom', options.paddingBottom);
            }

            if (typeof options.sectionsColor[index] !==  'undefined') {
                section.css('background-color', options.sectionsColor[index]);
            }

            if (typeof options.anchors[index] !== 'undefined') {
                section.attr('data-anchor', options.anchors[index]);
            }
        }

        /**
        * Sets the data-anchor attributes to the menu elements and activates the current one.
        */
        function styleMenu(section, index){
            if (typeof options.anchors[index] !== 'undefined') {
                //activating the menu / nav element on load
                if(section.hasClass(ACTIVE)){
                    activateMenuAndNav(options.anchors[index], index);
                }
            }

            //moving the menu outside the main container if it is inside (avoid problems with fixed positions when using CSS3 tranforms)
            if(options.menu && options.css3 && $(options.menu).closest(WRAPPER_SEL).length){
                $(options.menu).appendTo($body);
            }
        }

        /**
        * Adds internal classes to be able to provide customizable selectors
        * keeping the link with the style sheet.
        */
        function addInternalSelectors(){
            //adding internal class names to void problem with common ones
            $(options.sectionSelector).each(function(){
                $(this).addClass(SECTION);
            });
            $(options.slideSelector).each(function(){
                $(this).addClass(SLIDE);
            });
        }

        /**
        * Creates the control arrows for the given section
        */
        function createSlideArrows(section){
            section.find(SLIDES_WRAPPER_SEL).after('<div class="' + SLIDES_ARROW_PREV + '"></div><div class="' + SLIDES_ARROW_NEXT + '"></div>');

            if(options.controlArrowColor!='#fff'){
                section.find(SLIDES_ARROW_NEXT_SEL).css('border-color', 'transparent transparent transparent '+options.controlArrowColor);
                section.find(SLIDES_ARROW_PREV_SEL).css('border-color', 'transparent '+ options.controlArrowColor + ' transparent transparent');
            }

            if(!options.loopHorizontal){
                section.find(SLIDES_ARROW_PREV_SEL).hide();
            }
        }

        /**
        * Creates a vertical navigation bar.
        */
        function addVerticalNavigation(){
            $body.append('<div id="' + SECTION_NAV + '"><ul></ul></div>');
            var nav = $(SECTION_NAV_SEL);

            nav.addClass(function() {
                return options.showActiveTooltip ? SHOW_ACTIVE_TOOLTIP + ' ' + options.navigationPosition : options.navigationPosition;
            });

            for (var i = 0; i < $(SECTION_SEL).length; i++) {
                var link = '';
                if (options.anchors.length) {
                    link = options.anchors[i];
                }

                var li = '<li><a href="#' + link + '"><span></span></a>';

                // Only add tooltip if needed (defined by user)
                var tooltip = options.navigationTooltips[i];

                if (typeof tooltip !== 'undefined' && tooltip !== '') {
                    li += '<div class="' + SECTION_NAV_TOOLTIP + ' ' + options.navigationPosition + '">' + tooltip + '</div>';
                }

                li += '</li>';

                nav.find('ul').append(li);
            }

            //centering it vertically
            $(SECTION_NAV_SEL).css('margin-top', '-' + ($(SECTION_NAV_SEL).height()/2) + 'px');

            //activating the current active section
            $(SECTION_NAV_SEL).find('li').eq($(SECTION_ACTIVE_SEL).index(SECTION_SEL)).find('a').addClass(ACTIVE);
        }

        /**
        * Creates the slim scroll scrollbar for the sections and slides inside them.
        */
        function createSlimScrollingHandler(){
            $(SECTION_SEL).each(function(){
                var slides = $(this).find(SLIDE_SEL);

                if(slides.length){
                    slides.each(function(){
                        createSlimScrolling($(this));
                    });
                }else{
                    createSlimScrolling($(this));
                }

            });
            afterRenderActions();
        }

        /**
        * Actions and callbacks to fire afterRender
        */
        function afterRenderActions(){
            var section = $(SECTION_ACTIVE_SEL);

            section.addClass(COMPLETELY);

            if(options.scrollOverflowHandler.afterRender){
                options.scrollOverflowHandler.afterRender(section);
            }
            lazyLoad(section);
            playMedia(section);

            $.isFunction( options.afterLoad ) && options.afterLoad.call(section, section.data('anchor'), (section.index(SECTION_SEL) + 1));
            $.isFunction( options.afterRender ) && options.afterRender.call(container);
        }


        var isScrolling = false;
        var lastScroll = 0;

        //when scrolling...
        function scrollHandler(){
            var currentSection;

            if(!options.autoScrolling || options.scrollBar){
                var currentScroll = $window.scrollTop();
                var scrollDirection = getScrollDirection(currentScroll);
                var visibleSectionIndex = 0;
                var screen_mid = currentScroll + ($window.height() / 2.0);

                //taking the section which is showing more content in the viewport
                var sections =  document.querySelectorAll(SECTION_SEL);
                for (var i = 0; i < sections.length; ++i) {
                    var section = sections[i];

                    // Pick the the last section which passes the middle line of the screen.
                    if (section.offsetTop <= screen_mid)
                    {
                        visibleSectionIndex = i;
                    }
                }

                if(isCompletelyInViewPort(scrollDirection)){
                    if(!$(SECTION_ACTIVE_SEL).hasClass(COMPLETELY)){
                        $(SECTION_ACTIVE_SEL).addClass(COMPLETELY).siblings().removeClass(COMPLETELY);
                    }
                }

                //geting the last one, the current one on the screen
                currentSection = $(sections).eq(visibleSectionIndex);

                //setting the visible section as active when manually scrolling
                //executing only once the first time we reach the section
                if(!currentSection.hasClass(ACTIVE)){
                    isScrolling = true;
                    var leavingSection = $(SECTION_ACTIVE_SEL);
                    var leavingSectionIndex = leavingSection.index(SECTION_SEL) + 1;
                    var yMovement = getYmovement(currentSection);
                    var anchorLink  = currentSection.data('anchor');
                    var sectionIndex = currentSection.index(SECTION_SEL) + 1;
                    var activeSlide = currentSection.find(SLIDE_ACTIVE_SEL);

                    if(activeSlide.length){
                        var slideAnchorLink = activeSlide.data('anchor');
                        var slideIndex = activeSlide.index();
                    }

                    if(canScroll){
                        currentSection.addClass(ACTIVE).siblings().removeClass(ACTIVE);

                        $.isFunction( options.onLeave ) && options.onLeave.call( leavingSection, leavingSectionIndex, sectionIndex, yMovement);

                        $.isFunction( options.afterLoad ) && options.afterLoad.call( currentSection, anchorLink, sectionIndex);
                        lazyLoad(currentSection);

                        activateMenuAndNav(anchorLink, sectionIndex - 1);

                        if(options.anchors.length){
                            //needed to enter in hashChange event when using the menu with anchor links
                            lastScrolledDestiny = anchorLink;

                            setState(slideIndex, slideAnchorLink, anchorLink, sectionIndex);
                        }
                    }

                    //small timeout in order to avoid entering in hashChange event when scrolling is not finished yet
                    clearTimeout(scrollId);
                    scrollId = setTimeout(function(){
                        isScrolling = false;
                    }, 100);
                }

                if(options.fitToSection){
                    //for the auto adjust of the viewport to fit a whole section
                    clearTimeout(scrollId2);

                    scrollId2 = setTimeout(function(){
                        //checking fitToSection again in case it was set to false before the timeout delay
                        if(canScroll && options.fitToSection){
                            //allows to scroll to an active section and
                            //if the section is already active, we prevent firing callbacks
                            if($(SECTION_ACTIVE_SEL).is(currentSection)){
                                isResizing = true;
                            }
                            scrollPage($(SECTION_ACTIVE_SEL));

                            isResizing = false;
                        }
                    }, options.fitToSectionDelay);
                }
            }
        }

        /**
        * Determines whether the active section has seen in its whole or not.
        */
        function isCompletelyInViewPort(movement){
            var top = $(SECTION_ACTIVE_SEL).position().top;
            var bottom = top + $window.height();

            if(movement == 'up'){
                return bottom >= ($window.scrollTop() + $window.height());
            }
            return top <= $window.scrollTop();
        }

        /**
        * Gets the directon of the the scrolling fired by the scroll event.
        */
        function getScrollDirection(currentScroll){
            var direction = currentScroll > lastScroll ? 'down' : 'up';

            lastScroll = currentScroll;

            return direction;
        }

        /**
        * Determines the way of scrolling up or down:
        * by 'automatically' scrolling a section or by using the default and normal scrolling.
        */
        function scrolling(type, scrollable){
            if (!isScrollAllowed.m[type]){
                return;
            }
            var check, scrollSection;

            if(type == 'down'){
                check = 'bottom';
                scrollSection = FP.moveSectionDown;
            }else{
                check = 'top';
                scrollSection = FP.moveSectionUp;
            }

            if(scrollable.length > 0 ){
                //is the scrollbar at the start/end of the scroll?
                if(options.scrollOverflowHandler.isScrolled(check, scrollable)){
                    scrollSection();
                }else{
                    return true;
                }
            }else{
                // moved up/down
                scrollSection();
            }
        }


        var touchStartY = 0;
        var touchStartX = 0;
        var touchEndY = 0;
        var touchEndX = 0;

        /* Detecting touch events

        * As we are changing the top property of the page on scrolling, we can not use the traditional way to detect it.
        * This way, the touchstart and the touch moves shows an small difference between them which is the
        * used one to determine the direction.
        */
        function touchMoveHandler(event){
            var e = event.originalEvent;

            // additional: if one of the normalScrollElements isn't within options.normalScrollElementTouchThreshold hops up the DOM chain
            if (!checkParentForNormalScrollElement(event.target) && isReallyTouch(e) ) {

                if(options.autoScrolling){
                    //preventing the easing on iOS devices
                    event.preventDefault();
                }

                var activeSection = $(SECTION_ACTIVE_SEL);
                var scrollable = options.scrollOverflowHandler.scrollable(activeSection);

                if (canScroll && !slideMoving) { //if theres any #
                    var touchEvents = getEventsPage(e);

                    touchEndY = touchEvents.y;
                    touchEndX = touchEvents.x;

                    //if movement in the X axys is greater than in the Y and the currect section has slides...
                    if (activeSection.find(SLIDES_WRAPPER_SEL).length && Math.abs(touchStartX - touchEndX) > (Math.abs(touchStartY - touchEndY))) {

                        //is the movement greater than the minimum resistance to scroll?
                        if (Math.abs(touchStartX - touchEndX) > ($window.outerWidth() / 100 * options.touchSensitivity)) {
                            if (touchStartX > touchEndX) {
                                if(isScrollAllowed.m.right){
                                    FP.moveSlideRight(); //next
                                }
                            } else {
                                if(isScrollAllowed.m.left){
                                    FP.moveSlideLeft(); //prev
                                }
                            }
                        }
                    }

                    //vertical scrolling (only when autoScrolling is enabled)
                    else if(options.autoScrolling){

                        //is the movement greater than the minimum resistance to scroll?
                        if (Math.abs(touchStartY - touchEndY) > ($window.height() / 100 * options.touchSensitivity)) {
                            if (touchStartY > touchEndY) {
                                scrolling('down', scrollable);
                            } else if (touchEndY > touchStartY) {
                                scrolling('up', scrollable);
                            }
                        }
                    }
                }
            }

        }

        /**
         * recursive function to loop up the parent nodes to check if one of them exists in options.normalScrollElements
         * Currently works well for iOS - Android might need some testing
         * @param  {Element} el  target element / jquery selector (in subsequent nodes)
         * @param  {int}     hop current hop compared to options.normalScrollElementTouchThreshold
         * @return {boolean} true if there is a match to options.normalScrollElements
         */
        function checkParentForNormalScrollElement (el, hop) {
            hop = hop || 0;
            var parent = $(el).parent();

            if (hop < options.normalScrollElementTouchThreshold &&
                parent.is(options.normalScrollElements) ) {
                return true;
            } else if (hop == options.normalScrollElementTouchThreshold) {
                return false;
            } else {
                return checkParentForNormalScrollElement(parent, ++hop);
            }
        }

        /**
        * As IE >= 10 fires both touch and mouse events when using a mouse in a touchscreen
        * this way we make sure that is really a touch event what IE is detecting.
        */
        function isReallyTouch(e){
            //if is not IE   ||  IE is detecting `touch` or `pen`
            return typeof e.pointerType === 'undefined' || e.pointerType != 'mouse';
        }

        /**
        * Handler for the touch start event.
        */
        function touchStartHandler(event){
            var e = event.originalEvent;

            //stopping the auto scroll to adjust to a section
            if(options.fitToSection){
                $htmlBody.stop();
            }

            if(isReallyTouch(e)){
                var touchEvents = getEventsPage(e);
                touchStartY = touchEvents.y;
                touchStartX = touchEvents.x;
            }
        }

        /**
        * Gets the average of the last `number` elements of the given array.
        */
        function getAverage(elements, number){
            var sum = 0;

            //taking `number` elements from the end to make the average, if there are not enought, 1
            var lastElements = elements.slice(Math.max(elements.length - number, 1));

            for(var i = 0; i < lastElements.length; i++){
                sum = sum + lastElements[i];
            }

            return Math.ceil(sum/number);
        }

        /**
         * Detecting mousewheel scrolling
         *
         * http://blogs.sitepointstatic.com/examples/tech/mouse-wheel/index.html
         * http://www.sitepoint.com/html5-javascript-mouse-wheel/
         */
        var prevTime = new Date().getTime();

        function MouseWheelHandler(e) {
            var curTime = new Date().getTime();
            var isNormalScroll = $(COMPLETELY_SEL).hasClass(NORMAL_SCROLL);

            //autoscrolling and not zooming?
            if(options.autoScrolling && !controlPressed && !isNormalScroll){
                // cross-browser wheel delta
                e = e || window.event;
                var value = e.wheelDelta || -e.deltaY || -e.detail;
                var delta = Math.max(-1, Math.min(1, value));

                var horizontalDetection = typeof e.wheelDeltaX !== 'undefined' || typeof e.deltaX !== 'undefined';
                var isScrollingVertically = (Math.abs(e.wheelDeltaX) < Math.abs(e.wheelDelta)) || (Math.abs(e.deltaX ) < Math.abs(e.deltaY) || !horizontalDetection);

                //Limiting the array to 150 (lets not waste memory!)
                if(scrollings.length > 149){
                    scrollings.shift();
                }

                //keeping record of the previous scrollings
                scrollings.push(Math.abs(value));

                //preventing to scroll the site on mouse wheel when scrollbar is present
                if(options.scrollBar){
                    e.preventDefault ? e.preventDefault() : e.returnValue = false;
                }

                var activeSection = $(SECTION_ACTIVE_SEL);
                var scrollable = options.scrollOverflowHandler.scrollable(activeSection);

                //time difference between the last scroll and the current one
                var timeDiff = curTime-prevTime;
                prevTime = curTime;

                //haven't they scrolled in a while?
                //(enough to be consider a different scrolling action to scroll another section)
                if(timeDiff > 200){
                    //emptying the array, we dont care about old scrollings for our averages
                    scrollings = [];
                }

                if(canScroll){
                    var averageEnd = getAverage(scrollings, 10);
                    var averageMiddle = getAverage(scrollings, 70);
                    var isAccelerating = averageEnd >= averageMiddle;

                    //to avoid double swipes...
                    if(isAccelerating && isScrollingVertically){
                        //scrolling down?
                        if (delta < 0) {
                            scrolling('down', scrollable);

                        //scrolling up?
                        }else {
                            scrolling('up', scrollable);
                        }
                    }
                }

                return false;
            }

            if(options.fitToSection){
                //stopping the auto scroll to adjust to a section
                $htmlBody.stop();
            }
        }

        /**
        * Slides a slider to the given direction.
        * Optional `section` param.
        */
        function moveSlide(direction, section){
            var activeSection = typeof section === 'undefined' ? $(SECTION_ACTIVE_SEL) : section;
            var slides = activeSection.find(SLIDES_WRAPPER_SEL);
            var numSlides = slides.find(SLIDE_SEL).length;

            // more than one slide needed and nothing should be sliding
            if (!slides.length || slideMoving || numSlides < 2) {
                return;
            }

            var currentSlide = slides.find(SLIDE_ACTIVE_SEL);
            var destiny = null;

            if(direction === 'prev'){
                destiny = currentSlide.prev(SLIDE_SEL);
            }else{
                destiny = currentSlide.next(SLIDE_SEL);
            }

            //isn't there a next slide in the secuence?
            if(!destiny.length){
                //respect loopHorizontal settin
                if (!options.loopHorizontal) return;

                if(direction === 'prev'){
                    destiny = currentSlide.siblings(':last');
                }else{
                    destiny = currentSlide.siblings(':first');
                }
            }

            slideMoving = true;

            landscapeScroll(slides, destiny);
        }

        /**
        * Maintains the active slides in the viewport
        * (Because he `scroll` animation might get lost with some actions, such as when using continuousVertical)
        */
        function keepSlidesPosition(){
            $(SLIDE_ACTIVE_SEL).each(function(){
                silentLandscapeScroll($(this), 'internal');
            });
        }

        var previousDestTop = 0;
        /**
        * Returns the destination Y position based on the scrolling direction and
        * the height of the section.
        */
        function getDestinationPosition(element){
            var elemPosition = element.position();

            //top of the desination will be at the top of the viewport
            var position = elemPosition.top;
            var isScrollingDown =  elemPosition.top > previousDestTop;
            var sectionBottom = position - windowsHeight + element.outerHeight();

            //is the destination element bigger than the viewport?
            if(element.outerHeight() > windowsHeight){
                //scrolling up?
                if(!isScrollingDown){
                    position = sectionBottom;
                }
            }

            //sections equal or smaller than the viewport height && scrolling down? ||  is resizing and its in the last section
            else if(isScrollingDown || (isResizing && element.is(':last-child')) ){
                //The bottom of the destination will be at the bottom of the viewport
                position = sectionBottom;
            }

            /*
            Keeping record of the last scrolled position to determine the scrolling direction.
            No conventional methods can be used as the scroll bar might not be present
            AND the section might not be active if it is auto-height and didnt reach the middle
            of the viewport.
            */
            previousDestTop = position;
            return position;
        }

        /**
        * Scrolls the site to the given element and scrolls to the slide if a callback is given.
        */
        function scrollPage(element, callback, isMovementUp){
            if(typeof element === 'undefined'){ return; } //there's no element to scroll, leaving the function

            var dtop = getDestinationPosition(element);

            //local variables
            var v = {
                element: element,
                callback: callback,
                isMovementUp: isMovementUp,
                dtop: dtop,
                yMovement: getYmovement(element),
                anchorLink: element.data('anchor'),
                sectionIndex: element.index(SECTION_SEL),
                activeSlide: element.find(SLIDE_ACTIVE_SEL),
                activeSection: $(SECTION_ACTIVE_SEL),
                leavingSection: $(SECTION_ACTIVE_SEL).index(SECTION_SEL) + 1,

                //caching the value of isResizing at the momment the function is called
                //because it will be checked later inside a setTimeout and the value might change
                localIsResizing: isResizing
            };

            //quiting when destination scroll is the same as the current one
            if((v.activeSection.is(element) && !isResizing) || (options.scrollBar && $window.scrollTop() === v.dtop && !element.hasClass(AUTO_HEIGHT) )){ return; }

            if(v.activeSlide.length){
                var slideAnchorLink = v.activeSlide.data('anchor');
                var slideIndex = v.activeSlide.index();
            }

            // If continuousVertical && we need to wrap around
            if (options.autoScrolling && options.continuousVertical && typeof (v.isMovementUp) !== "undefined" &&
                ((!v.isMovementUp && v.yMovement == 'up') || // Intending to scroll down but about to go up or
                (v.isMovementUp && v.yMovement == 'down'))) { // intending to scroll up but about to go down

                v = createInfiniteSections(v);
            }

            //callback (onLeave) if the site is not just resizing and readjusting the slides
            if($.isFunction(options.onLeave) && !v.localIsResizing){
                if(options.onLeave.call(v.activeSection, v.leavingSection, (v.sectionIndex + 1), v.yMovement) === false){
                    return;
                }
            }
            stopMedia(v.activeSection);

            element.addClass(ACTIVE).siblings().removeClass(ACTIVE);
            lazyLoad(element);

            //preventing from activating the MouseWheelHandler event
            //more than once if the page is scrolling
            canScroll = false;

            setState(slideIndex, slideAnchorLink, v.anchorLink, v.sectionIndex);

            performMovement(v);

            //flag to avoid callingn `scrollPage()` twice in case of using anchor links
            lastScrolledDestiny = v.anchorLink;

            //avoid firing it twice (as it does also on scroll)
            activateMenuAndNav(v.anchorLink, v.sectionIndex);
        }

        /**
        * Performs the movement (by CSS3 or by jQuery)
        */
        function performMovement(v){
            // using CSS3 translate functionality
            if (options.css3 && options.autoScrolling && !options.scrollBar) {
                var translate3d = 'translate3d(0px, -' + v.dtop + 'px, 0px)';
                transformContainer(translate3d, true);

                //even when the scrollingSpeed is 0 there's a little delay, which might cause the
                //scrollingSpeed to change in case of using silentMoveTo();
                if(options.scrollingSpeed){
                    afterSectionLoadsId = setTimeout(function () {
                        afterSectionLoads(v);
                    }, options.scrollingSpeed);
                }else{
                    afterSectionLoads(v);
                }
            }

            // using jQuery animate
            else{
                var scrollSettings = getScrollSettings(v);

                $(scrollSettings.element).animate(
                    scrollSettings.options,
                options.scrollingSpeed, options.easing).promise().done(function () { //only one single callback in case of animating  `html, body`
                    if(options.scrollBar){

                        /* Hack!
                        The timeout prevents setting the most dominant section in the viewport as "active" when the user
                        scrolled to a smaller section by using the mousewheel (auto scrolling) rather than draging the scroll bar.

                        When using scrollBar:true It seems like the scroll events still getting propagated even after the scrolling animation has finished.
                        */
                        setTimeout(function(){
                            afterSectionLoads(v);
                        },30);
                    }else{
                        afterSectionLoads(v);
                    }
                });
            }
        }

        /**
        * Gets the scrolling settings depending on the plugin autoScrolling option
        */
        function getScrollSettings(v){
            var scroll = {};

            if(options.autoScrolling && !options.scrollBar){
                scroll.options = { 'top': -v.dtop};
                scroll.element = WRAPPER_SEL;
            }else{
                scroll.options = { 'scrollTop': v.dtop};
                scroll.element = 'html, body';
            }

            return scroll;
        }

        /**
        * Adds sections before or after the current one to create the infinite effect.
        */
        function createInfiniteSections(v){
            // Scrolling down
            if (!v.isMovementUp) {
                // Move all previous sections to after the active section
                $(SECTION_ACTIVE_SEL).after(v.activeSection.prevAll(SECTION_SEL).get().reverse());
            }
            else { // Scrolling up
                // Move all next sections to before the active section
                $(SECTION_ACTIVE_SEL).before(v.activeSection.nextAll(SECTION_SEL));
            }

            // Maintain the displayed position (now that we changed the element order)
            silentScroll($(SECTION_ACTIVE_SEL).position().top);

            // Maintain the active slides visible in the viewport
            keepSlidesPosition();

            // save for later the elements that still need to be reordered
            v.wrapAroundElements = v.activeSection;

            // Recalculate animation variables
            v.dtop = v.element.position().top;
            v.yMovement = getYmovement(v.element);

            return v;
        }

        /**
        * Fix section order after continuousVertical changes have been animated
        */
        function continuousVerticalFixSectionOrder (v) {
            // If continuousVertical is in effect (and autoScrolling would also be in effect then),
            // finish moving the elements around so the direct navigation will function more simply
            if (!v.wrapAroundElements || !v.wrapAroundElements.length) {
                return;
            }

            if (v.isMovementUp) {
                $(SECTION_FIRST_SEL).before(v.wrapAroundElements);
            }
            else {
                $(SECTION_LAST_SEL).after(v.wrapAroundElements);
            }

            silentScroll($(SECTION_ACTIVE_SEL).position().top);

            // Maintain the active slides visible in the viewport
            keepSlidesPosition();
        }


        /**
        * Actions to do once the section is loaded.
        */
        function afterSectionLoads (v){
            continuousVerticalFixSectionOrder(v);

            v.element.find('.fp-scrollable').mouseover();

            //callback (afterLoad) if the site is not just resizing and readjusting the slides
            $.isFunction(options.afterLoad) && !v.localIsResizing && options.afterLoad.call(v.element, v.anchorLink, (v.sectionIndex + 1));

            playMedia(v.element);
            v.element.addClass(COMPLETELY).siblings().removeClass(COMPLETELY);

            canScroll = true;

            $.isFunction(v.callback) && v.callback.call(this);
        }

        /**
        * Lazy loads image, video and audio elements.
        */
        function lazyLoad(destiny){
            var destiny = getSlideOrSection(destiny);

            destiny.find('img[data-src], source[data-src], audio[data-src]').each(function(){
                $(this).attr('src', $(this).data('src'));
                $(this).removeAttr('data-src');

                if($(this).is('source')){
                    $(this).closest('video').get(0).load();
                }
            });
        }

        /**
        * Plays video and audio elements.
        */
        function playMedia(destiny){
            var destiny = getSlideOrSection(destiny);

            //playing HTML5 media elements
            destiny.find('video, audio').each(function(){
                var element = $(this).get(0);

                if( element.hasAttribute('autoplay') && typeof element.play === 'function' ) {
                    element.play();
                }
            });
        }

        /**
        * Stops video and audio elements.
        */
        function stopMedia(destiny){
            var destiny = getSlideOrSection(destiny);

            //stopping HTML5 media elements
            destiny.find('video, audio').each(function(){
                var element = $(this).get(0);

                if( !element.hasAttribute('data-ignore') && typeof element.pause === 'function' ) {
                    element.pause();
                }
            });
        }

        /**
        * Gets the active slide (or section) for the given section
        */
        function getSlideOrSection(destiny){
            var slide = destiny.find(SLIDE_ACTIVE_SEL);
            if( slide.length ) {
                destiny = $(slide);
            }

            return destiny;
        }

        /**
        * Scrolls to the anchor in the URL when loading the site
        */
        function scrollToAnchor(){
            //getting the anchor link in the URL and deleting the `#`
            var value =  window.location.hash.replace('#', '').split('/');
            var section = value[0];
            var slide = value[1];

            if(section){  //if theres any #
                if(options.animateAnchor){
                    scrollPageAndSlide(section, slide);
                }else{
                    FP.silentMoveTo(section, slide);
                }
            }
        }

        /**
        * Detecting any change on the URL to scroll to the given anchor link
        * (a way to detect back history button as we play with the hashes on the URL)
        */
        function hashChangeHandler(){
            if(!isScrolling && !options.lockAnchors){
                var value =  window.location.hash.replace('#', '').split('/');
                var section = value[0];
                var slide = value[1];

                    //when moving to a slide in the first section for the first time (first time to add an anchor to the URL)
                    var isFirstSlideMove =  (typeof lastScrolledDestiny === 'undefined');
                    var isFirstScrollMove = (typeof lastScrolledDestiny === 'undefined' && typeof slide === 'undefined' && !slideMoving);


                if(section.length){
                    /*in order to call scrollpage() only once for each destination at a time
                    It is called twice for each scroll otherwise, as in case of using anchorlinks `hashChange`
                    event is fired on every scroll too.*/
                    if ((section && section !== lastScrolledDestiny) && !isFirstSlideMove || isFirstScrollMove || (!slideMoving && lastScrolledSlide != slide ))  {
                        scrollPageAndSlide(section, slide);
                    }
                }
            }
        }

        //Sliding with arrow keys, both, vertical and horizontal
        function keydownHandler(e) {

            clearTimeout(keydownId);

            var activeElement = $(':focus');

            if(!activeElement.is('textarea') && !activeElement.is('input') && !activeElement.is('select') &&
                activeElement.attr('contentEditable') !== "true" && activeElement.attr('contentEditable') !== '' &&
                options.keyboardScrolling && options.autoScrolling){
                var keyCode = e.which;

                //preventing the scroll with arrow keys & spacebar & Page Up & Down keys
                var keyControls = [40, 38, 32, 33, 34];
                if($.inArray(keyCode, keyControls) > -1){
                    e.preventDefault();
                }

                controlPressed = e.ctrlKey;

                keydownId = setTimeout(function(){
                    onkeydown(e);
                },150);
            }
        }

        function tooltipTextHandler(){
            $(this).prev().trigger('click');
        }

        //to prevent scrolling while zooming
        function keyUpHandler(e){
            if(isWindowFocused){ //the keyup gets fired on new tab ctrl + t in Firefox
                controlPressed = e.ctrlKey;
            }
        }

        //binding the mousemove when the mouse's middle button is released
        function mouseDownHandler(e){
            //middle button
            if (e.which == 2){
                oldPageY = e.pageY;
                container.on('mousemove', mouseMoveHandler);
            }
        }

        //unbinding the mousemove when the mouse's middle button is released
        function mouseUpHandler(e){
            //middle button
            if (e.which == 2){
                container.off('mousemove');
            }
        }

        //Scrolling horizontally when clicking on the slider controls.
        function slideArrowHandler(){
            var section = $(this).closest(SECTION_SEL);

            if ($(this).hasClass(SLIDES_PREV)) {
                if(isScrollAllowed.m.left){
                    FP.moveSlideLeft(section);
                }
            } else {
                if(isScrollAllowed.m.right){
                    FP.moveSlideRight(section);
                }
            }
        }

        //when opening a new tab (ctrl + t), `control` won't be pressed when comming back.
        function blurHandler(){
            isWindowFocused = false;
            controlPressed = false;
        }

        //Scrolls to the section when clicking the navigation bullet
        function sectionBulletHandler(e){
            e.preventDefault();
            var index = $(this).parent().index();
            scrollPage($(SECTION_SEL).eq(index));
        }

        //Scrolls the slider to the given slide destination for the given section
        function slideBulletHandler(e){
            e.preventDefault();
            var slides = $(this).closest(SECTION_SEL).find(SLIDES_WRAPPER_SEL);
            var destiny = slides.find(SLIDE_SEL).eq($(this).closest('li').index());

            landscapeScroll(slides, destiny);
        }

        /**
        * Keydown event
        */
        function onkeydown(e){
            var shiftPressed = e.shiftKey;

            switch (e.which) {
                //up
                case 38:
                case 33:
                    if(isScrollAllowed.k.up){
                        FP.moveSectionUp();
                    }
                    break;

                //down
                case 32: //spacebar
                    if(shiftPressed && isScrollAllowed.k.up){
                        FP.moveSectionUp();
                        break;
                    }
                case 40:
                case 34:
                    if(isScrollAllowed.k.down){
                        FP.moveSectionDown();
                    }
                    break;

                //Home
                case 36:
                    if(isScrollAllowed.k.up){
                        FP.moveTo(1);
                    }
                    break;

                //End
                case 35:
                     if(isScrollAllowed.k.down){
                        FP.moveTo( $(SECTION_SEL).length );
                    }
                    break;

                //left
                case 37:
                    if(isScrollAllowed.k.left){
                        FP.moveSlideLeft();
                    }
                    break;

                //right
                case 39:
                    if(isScrollAllowed.k.right){
                        FP.moveSlideRight();
                    }
                    break;

                default:
                    return; // exit this handler for other keys
            }
        }

        /**
        * Detecting the direction of the mouse movement.
        * Used only for the middle button of the mouse.
        */
        var oldPageY = 0;
        function mouseMoveHandler(e){
            if(canScroll){
                // moving up
                if (e.pageY < oldPageY && isScrollAllowed.m.up){
                    FP.moveSectionUp();
                }

                // moving down
                else if(e.pageY > oldPageY && isScrollAllowed.m.down){
                    FP.moveSectionDown();
                }
            }
            oldPageY = e.pageY;
        }

        /**
        * Scrolls horizontal sliders.
        */
        function landscapeScroll(slides, destiny){
            var destinyPos = destiny.position();
            var slideIndex = destiny.index();
            var section = slides.closest(SECTION_SEL);
            var sectionIndex = section.index(SECTION_SEL);
            var anchorLink = section.data('anchor');
            var slidesNav = section.find(SLIDES_NAV_SEL);
            var slideAnchor = getAnchor(destiny);
            var prevSlide = section.find(SLIDE_ACTIVE_SEL);

            //caching the value of isResizing at the momment the function is called
            //because it will be checked later inside a setTimeout and the value might change
            var localIsResizing = isResizing;

            if(options.onSlideLeave){
                var prevSlideIndex = prevSlide.index();
                var xMovement = getXmovement(prevSlideIndex, slideIndex);

                //if the site is not just resizing and readjusting the slides
                if(!localIsResizing && xMovement!=='none'){
                    if($.isFunction( options.onSlideLeave )){
                        if(options.onSlideLeave.call( prevSlide, anchorLink, (sectionIndex + 1), prevSlideIndex, xMovement, slideIndex ) === false){
                            slideMoving = false;
                            return;
                        }
                    }
                }
            }
            stopMedia(prevSlide);

            destiny.addClass(ACTIVE).siblings().removeClass(ACTIVE);
            if(!localIsResizing){
                lazyLoad(destiny);
            }

            if(!options.loopHorizontal && options.controlArrows){
                //hidding it for the fist slide, showing for the rest
                section.find(SLIDES_ARROW_PREV_SEL).toggle(slideIndex!==0);

                //hidding it for the last slide, showing for the rest
                section.find(SLIDES_ARROW_NEXT_SEL).toggle(!destiny.is(':last-child'));
            }

            //only changing the URL if the slides are in the current section (not for resize re-adjusting)
            if(section.hasClass(ACTIVE)){
                setState(slideIndex, slideAnchor, anchorLink, sectionIndex);
            }

            var afterSlideLoads = function(){
                //if the site is not just resizing and readjusting the slides
                if(!localIsResizing){
                    $.isFunction( options.afterSlideLoad ) && options.afterSlideLoad.call( destiny, anchorLink, (sectionIndex + 1), slideAnchor, slideIndex);
                }
                playMedia(destiny);

                //letting them slide again
                slideMoving = false;
            };

            if(options.css3){
                var translate3d = 'translate3d(-' + Math.round(destinyPos.left) + 'px, 0px, 0px)';

                addAnimation(slides.find(SLIDES_CONTAINER_SEL), options.scrollingSpeed>0).css(getTransforms(translate3d));

                afterSlideLoadsId = setTimeout(function(){
                    afterSlideLoads();
                }, options.scrollingSpeed, options.easing);
            }else{
                slides.animate({
                    scrollLeft : Math.round(destinyPos.left)
                }, options.scrollingSpeed, options.easing, function() {

                    afterSlideLoads();
                });
            }

            slidesNav.find(ACTIVE_SEL).removeClass(ACTIVE);
            slidesNav.find('li').eq(slideIndex).find('a').addClass(ACTIVE);
        }

        var previousHeight = windowsHeight;

        //when resizing the site, we adjust the heights of the sections, slimScroll...
        function resizeHandler(){
            //checking if it needs to get responsive
            responsive();

            // rebuild immediately on touch devices
            if (isTouchDevice) {
                var activeElement = $(document.activeElement);

                //if the keyboard is NOT visible
                if (!activeElement.is('textarea') && !activeElement.is('input') && !activeElement.is('select')) {
                    var currentHeight = $window.height();

                    //making sure the change in the viewport size is enough to force a rebuild. (20 % of the window to avoid problems when hidding scroll bars)
                    if( Math.abs(currentHeight - previousHeight) > (20 * Math.max(previousHeight, currentHeight) / 100) ){
                        FP.reBuild(true);
                        previousHeight = currentHeight;
                    }
                }
            }else{
                //in order to call the functions only when the resize is finished
                //http://stackoverflow.com/questions/4298612/jquery-how-to-call-resize-event-only-once-its-finished-resizing
                clearTimeout(resizeId);

                resizeId = setTimeout(function(){
                    FP.reBuild(true);
                }, 350);
            }
        }

        /**
        * Checks if the site needs to get responsive and disables autoScrolling if so.
        * A class `fp-responsive` is added to the plugin's container in case the user wants to use it for his own responsive CSS.
        */
        function responsive(){
            var widthLimit = options.responsive || options.responsiveWidth; //backwards compatiblity
            var heightLimit = options.responsiveHeight;

            //only calculating what we need. Remember its called on the resize event.
            var isBreakingPointWidth = widthLimit && $window.outerWidth() < widthLimit;
            var isBreakingPointHeight = heightLimit && $window.height() < heightLimit;

            if(widthLimit && heightLimit){
                FP.setResponsive(isBreakingPointWidth || isBreakingPointHeight);
            }
            else if(widthLimit){
                FP.setResponsive(isBreakingPointWidth);
            }
            else if(heightLimit){
                FP.setResponsive(isBreakingPointHeight);
            }
        }

        /**
        * Adds transition animations for the given element
        */
        function addAnimation(element){
            var transition = 'all ' + options.scrollingSpeed + 'ms ' + options.easingcss3;

            element.removeClass(NO_TRANSITION);
            return element.css({
                '-webkit-transition': transition,
                'transition': transition
            });
        }

        /**
        * Remove transition animations for the given element
        */
        function removeAnimation(element){
            return element.addClass(NO_TRANSITION);
        }

        /**
         * Resizing of the font size depending on the window size as well as some of the images on the site.
         */
        function resizeMe(displayHeight, displayWidth) {
            //Standard dimensions, for which the body font size is correct
            var preferredHeight = 825;
            var preferredWidth = 900;

            if (displayHeight < preferredHeight || displayWidth < preferredWidth) {
                var heightPercentage = (displayHeight * 100) / preferredHeight;
                var widthPercentage = (displayWidth * 100) / preferredWidth;
                var percentage = Math.min(heightPercentage, widthPercentage);
                var newFontSize = percentage.toFixed(2);

                $body.css('font-size', newFontSize + '%');
            } else {
                $body.css('font-size', '100%');
            }
        }

        /**
         * Activating the website navigation dots according to the given slide name.
         */
        function activateNavDots(name, sectionIndex){
            if(options.navigation){
                $(SECTION_NAV_SEL).find(ACTIVE_SEL).removeClass(ACTIVE);
                if(name){
                    $(SECTION_NAV_SEL).find('a[href="#' + name + '"]').addClass(ACTIVE);
                }else{
                    $(SECTION_NAV_SEL).find('li').eq(sectionIndex).find('a').addClass(ACTIVE);
                }
            }
        }

        /**
         * Activating the website main menu elements according to the given slide name.
         */
        function activateMenuElement(name){
            if(options.menu){
                $(options.menu).find(ACTIVE_SEL).removeClass(ACTIVE);
                $(options.menu).find('[data-menuanchor="'+name+'"]').addClass(ACTIVE);
            }
        }

        /**
        * Sets to active the current menu and vertical nav items.
        */
        function activateMenuAndNav(anchor, index){
            activateMenuElement(anchor);
            activateNavDots(anchor, index);
        }

        /**
        * Retuns `up` or `down` depending on the scrolling movement to reach its destination
        * from the current section.
        */
        function getYmovement(destiny){
            var fromIndex = $(SECTION_ACTIVE_SEL).index(SECTION_SEL);
            var toIndex = destiny.index(SECTION_SEL);
            if( fromIndex == toIndex){
                return 'none';
            }
            if(fromIndex > toIndex){
                return 'up';
            }
            return 'down';
        }

        /**
        * Retuns `right` or `left` depending on the scrolling movement to reach its destination
        * from the current slide.
        */
        function getXmovement(fromIndex, toIndex){
            if( fromIndex == toIndex){
                return 'none';
            }
            if(fromIndex > toIndex){
                return 'left';
            }
            return 'right';
        }


        function createSlimScrolling(element){
            //needed to make `scrollHeight` work under Opera 12
            element.css('overflow', 'hidden');

            var scrollOverflowHandler = options.scrollOverflowHandler;
            var wrap = scrollOverflowHandler.wrapContent();
            //in case element is a slide
            var section = element.closest(SECTION_SEL);
            var scrollable = scrollOverflowHandler.scrollable(element);
            var contentHeight;

            //if there was scroll, the contentHeight will be the one in the scrollable section
            if(scrollable.length){
                contentHeight = scrollOverflowHandler.scrollHeight(element);
            }else{
                contentHeight = element.get(0).scrollHeight;
                if(options.verticalCentered){
                    contentHeight = element.find(TABLE_CELL_SEL).get(0).scrollHeight;
                }
            }

            var scrollHeight = windowsHeight - parseInt(section.css('padding-bottom')) - parseInt(section.css('padding-top'));

            //needs scroll?
            if ( contentHeight > scrollHeight) {
                //was there already an scroll ? Updating it
                if(scrollable.length){
                    scrollOverflowHandler.update(element, scrollHeight);
                }
                //creating the scrolling
                else{
                    if(options.verticalCentered){
                        element.find(TABLE_CELL_SEL).wrapInner(wrap);
                    }else{
                        element.wrapInner(wrap);
                    }
                    scrollOverflowHandler.create(element, scrollHeight);
                }
            }
            //removing the scrolling when it is not necessary anymore
            else{
                scrollOverflowHandler.remove(element);
            }

            //undo
            element.css('overflow', '');
        }

        function addTableClass(element){
            element.addClass(TABLE).wrapInner('<div class="' + TABLE_CELL + '" style="height:' + getTableHeight(element) + 'px;" />');
        }

        function getTableHeight(element){
            var sectionHeight = windowsHeight;

            if(options.paddingTop || options.paddingBottom){
                var section = element;
                if(!section.hasClass(SECTION)){
                    section = element.closest(SECTION_SEL);
                }

                var paddings = parseInt(section.css('padding-top')) + parseInt(section.css('padding-bottom'));
                sectionHeight = (windowsHeight - paddings);
            }

            return sectionHeight;
        }

        /**
        * Adds a css3 transform property to the container class with or without animation depending on the animated param.
        */
        function transformContainer(translate3d, animated){
            if(animated){
                addAnimation(container);
            }else{
                removeAnimation(container);
            }

            container.css(getTransforms(translate3d));

            //syncronously removing the class after the animation has been applied.
            setTimeout(function(){
                container.removeClass(NO_TRANSITION);
            },10);
        }

        /**
        * Gets a section by its anchor / index
        */
        function getSectionByAnchor(sectionAnchor){
            //section
            var section = container.find(SECTION_SEL + '[data-anchor="'+sectionAnchor+'"]');
            if(!section.length){
                section = $(SECTION_SEL).eq( (sectionAnchor -1) );
            }

            return section;
        }

        /**
        * Gets a slide inside a given section by its anchor / index
        */
        function getSlideByAnchor(slideAnchor, section){
            var slides = section.find(SLIDES_WRAPPER_SEL);
            var slide =  slides.find(SLIDE_SEL + '[data-anchor="'+slideAnchor+'"]');

            if(!slide.length){
                slide = slides.find(SLIDE_SEL).eq(slideAnchor);
            }

            return slide;
        }

        /**
        * Scrolls to the given section and slide anchors
        */
        function scrollPageAndSlide(destiny, slide){
            var section = getSectionByAnchor(destiny);

            //default slide
            if (typeof slide === 'undefined') {
                slide = 0;
            }

            //we need to scroll to the section and then to the slide
            if (destiny !== lastScrolledDestiny && !section.hasClass(ACTIVE)){
                scrollPage(section, function(){
                    scrollSlider(section, slide);
                });
            }
            //if we were already in the section
            else{
                scrollSlider(section, slide);
            }
        }

        /**
        * Scrolls the slider to the given slide destination for the given section
        */
        function scrollSlider(section, slideAnchor){
            if(typeof slideAnchor !== 'undefined'){
                var slides = section.find(SLIDES_WRAPPER_SEL);
                var destiny =  getSlideByAnchor(slideAnchor, section);

                if(destiny.length){
                    landscapeScroll(slides, destiny);
                }
            }
        }

        /**
        * Creates a landscape navigation bar with dots for horizontal sliders.
        */
        function addSlidesNavigation(section, numSlides){
            section.append('<div class="' + SLIDES_NAV + '"><ul></ul></div>');
            var nav = section.find(SLIDES_NAV_SEL);

            //top or bottom
            nav.addClass(options.slidesNavPosition);

            for(var i=0; i< numSlides; i++){
                nav.find('ul').append('<li><a href="#"><span></span></a></li>');
            }

            //centering it
            nav.css('margin-left', '-' + (nav.width()/2) + 'px');

            nav.find('li').first().find('a').addClass(ACTIVE);
        }


        /**
        * Sets the state of the website depending on the active section/slide.
        * It changes the URL hash when needed and updates the body class.
        */
        function setState(slideIndex, slideAnchor, anchorLink, sectionIndex){
            var sectionHash = '';

            if(options.anchors.length && !options.lockAnchors){

                //isn't it the first slide?
                if(slideIndex){
                    if(typeof anchorLink !== 'undefined'){
                        sectionHash = anchorLink;
                    }

                    //slide without anchor link? We take the index instead.
                    if(typeof slideAnchor === 'undefined'){
                        slideAnchor = slideIndex;
                    }

                    lastScrolledSlide = slideAnchor;
                    setUrlHash(sectionHash + '/' + slideAnchor);

                //first slide won't have slide anchor, just the section one
                }else if(typeof slideIndex !== 'undefined'){
                    lastScrolledSlide = slideAnchor;
                    setUrlHash(anchorLink);
                }

                //section without slides
                else{
                    setUrlHash(anchorLink);
                }
            }

            setBodyClass();
        }

        /**
        * Sets the URL hash.
        */
        function setUrlHash(url){
            if(options.recordHistory){
                location.hash = url;
            }else{
                //Mobile Chrome doesn't work the normal way, so... lets use HTML5 for phones :)
                if(isTouchDevice || isTouch){
                    window.history.replaceState(undefined, undefined, '#' + url);
                }else{
                    var baseUrl = window.location.href.split('#')[0];
                    window.location.replace( baseUrl + '#' + url );
                }
            }
        }

        /**
        * Gets the anchor for the given slide / section. Its index will be used if there's none.
        */
        function getAnchor(element){
            var anchor = element.data('anchor');
            var index = element.index();

            //Slide without anchor link? We take the index instead.
            if(typeof anchor === 'undefined'){
                anchor = index;
            }

            return anchor;
        }

        /**
        * Sets a class for the body of the page depending on the active section / slide
        */
        function setBodyClass(){
            var section = $(SECTION_ACTIVE_SEL);
            var slide = section.find(SLIDE_ACTIVE_SEL);

            var sectionAnchor = getAnchor(section);
            var slideAnchor = getAnchor(slide);

            var sectionIndex = section.index(SECTION_SEL);

            var text = String(sectionAnchor);

            if(slide.length){
                text = text + '-' + slideAnchor;
            }

            //changing slash for dash to make it a valid CSS style
            text = text.replace('/', '-').replace('#','');

            //removing previous anchor classes
            var classRe = new RegExp('\\b\\s?' + VIEWING_PREFIX + '-[^\\s]+\\b', "g");
            $body[0].className = $body[0].className.replace(classRe, '');

            //adding the current anchor
            $body.addClass(VIEWING_PREFIX + '-' + text);
        }

        /**
        * Checks for translate3d support
        * @return boolean
        * http://stackoverflow.com/questions/5661671/detecting-transform-translate3d-support
        */
        function support3d() {
            var el = document.createElement('p'),
                has3d,
                transforms = {
                    'webkitTransform':'-webkit-transform',
                    'OTransform':'-o-transform',
                    'msTransform':'-ms-transform',
                    'MozTransform':'-moz-transform',
                    'transform':'transform'
                };

            // Add it to the body to get the computed style.
            document.body.insertBefore(el, null);

            for (var t in transforms) {
                if (el.style[t] !== undefined) {
                    el.style[t] = 'translate3d(1px,1px,1px)';
                    has3d = window.getComputedStyle(el).getPropertyValue(transforms[t]);
                }
            }

            document.body.removeChild(el);

            return (has3d !== undefined && has3d.length > 0 && has3d !== 'none');
        }

        /**
        * Removes the auto scrolling action fired by the mouse wheel and trackpad.
        * After this function is called, the mousewheel and trackpad movements won't scroll through sections.
        */
        function removeMouseWheelHandler(){
            if (document.addEventListener) {
                document.removeEventListener('mousewheel', MouseWheelHandler, false); //IE9, Chrome, Safari, Oper
                document.removeEventListener('wheel', MouseWheelHandler, false); //Firefox
                document.removeEventListener('MozMousePixelScroll', MouseWheelHandler, false); //old Firefox
            } else {
                document.detachEvent('onmousewheel', MouseWheelHandler); //IE 6/7/8
            }
        }

        /**
        * Adds the auto scrolling action for the mouse wheel and trackpad.
        * After this function is called, the mousewheel and trackpad movements will scroll through sections
        * https://developer.mozilla.org/en-US/docs/Web/Events/wheel
        */
        function addMouseWheelHandler(){
            var prefix = '';
            var _addEventListener;

            if (window.addEventListener){
                _addEventListener = "addEventListener";
            }else{
                _addEventListener = "attachEvent";
                prefix = 'on';
            }

             // detect available wheel event
            var support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"
                      document.onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
                      'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox


            if(support == 'DOMMouseScroll'){
                document[ _addEventListener ](prefix + 'MozMousePixelScroll', MouseWheelHandler, false);
            }

            //handle MozMousePixelScroll in older Firefox
            else{
                document[ _addEventListener ](prefix + support, MouseWheelHandler, false);
            }
        }

        /**
        * Binding the mousemove when the mouse's middle button is pressed
        */
        function addMiddleWheelHandler(){
            container
                .on('mousedown', mouseDownHandler)
                .on('mouseup', mouseUpHandler);
        }

        /**
        * Unbinding the mousemove when the mouse's middle button is released
        */
        function removeMiddleWheelHandler(){
            container
                .off('mousedown', mouseDownHandler)
                .off('mouseup', mouseUpHandler);
        }

        /**
        * Adds the possibility to auto scroll through sections on touch devices.
        */
        function addTouchHandler(){
            if(isTouchDevice || isTouch){
                //Microsoft pointers
                var MSPointer = getMSPointer();

                $(WRAPPER_SEL).off('touchstart ' +  MSPointer.down).on('touchstart ' + MSPointer.down, touchStartHandler);
                $(WRAPPER_SEL).off('touchmove ' + MSPointer.move).on('touchmove ' + MSPointer.move, touchMoveHandler);
            }
        }

        /**
        * Removes the auto scrolling for touch devices.
        */
        function removeTouchHandler(){
            if(isTouchDevice || isTouch){
                //Microsoft pointers
                var MSPointer = getMSPointer();

                $(WRAPPER_SEL).off('touchstart ' + MSPointer.down);
                $(WRAPPER_SEL).off('touchmove ' + MSPointer.move);
            }
        }

        /*
        * Returns and object with Microsoft pointers (for IE<11 and for IE >= 11)
        * http://msdn.microsoft.com/en-us/library/ie/dn304886(v=vs.85).aspx
        */
        function getMSPointer(){
            var pointer;

            //IE >= 11 & rest of browsers
            if(window.PointerEvent){
                pointer = { down: 'pointerdown', move: 'pointermove'};
            }

            //IE < 11
            else{
                pointer = { down: 'MSPointerDown', move: 'MSPointerMove'};
            }

            return pointer;
        }

        /**
        * Gets the pageX and pageY properties depending on the browser.
        * https://github.com/alvarotrigo/fullPage.js/issues/194#issuecomment-34069854
        */
        function getEventsPage(e){
            var events = [];

            events.y = (typeof e.pageY !== 'undefined' && (e.pageY || e.pageX) ? e.pageY : e.touches[0].pageY);
            events.x = (typeof e.pageX !== 'undefined' && (e.pageY || e.pageX) ? e.pageX : e.touches[0].pageX);

            //in touch devices with scrollBar:true, e.pageY is detected, but we have to deal with touch events. #1008
            if(isTouch && isReallyTouch(e) && options.scrollBar){
                events.y = e.touches[0].pageY;
                events.x = e.touches[0].pageX;
            }

            return events;
        }

        /**
        * Slides silently (with no animation) the active slider to the given slide.
        */
        function silentLandscapeScroll(activeSlide, noCallbacks){
            FP.setScrollingSpeed (0, 'internal');

            if(typeof noCallbacks !== 'undefined'){
                //preventing firing callbacks afterSlideLoad etc.
                isResizing = true;
            }

            landscapeScroll(activeSlide.closest(SLIDES_WRAPPER_SEL), activeSlide);

            if(typeof noCallbacks !== 'undefined'){
                isResizing = false;
            }

            FP.setScrollingSpeed(originals.scrollingSpeed, 'internal');
        }

        /**
        * Scrolls silently (with no animation) the page to the given Y position.
        */
        function silentScroll(top){
            if(options.scrollBar){
                container.scrollTop(top);
            }
            else if (options.css3) {
                var translate3d = 'translate3d(0px, -' + top + 'px, 0px)';
                transformContainer(translate3d, false);
            }
            else {
                container.css('top', -top);
            }
        }

        /**
        * Returns the cross-browser transform string.
        */
        function getTransforms(translate3d){
            return {
                '-webkit-transform': translate3d,
                '-moz-transform': translate3d,
                '-ms-transform':translate3d,
                'transform': translate3d
            };
        }

        /**
        * Allowing or disallowing the mouse/swipe scroll in a given direction. (not for keyboard)
        * @type  m (mouse) or k (keyboard)
        */
        function setIsScrollAllowed(value, direction, type){
            switch (direction){
                case 'up': isScrollAllowed[type].up = value; break;
                case 'down': isScrollAllowed[type].down = value; break;
                case 'left': isScrollAllowed[type].left = value; break;
                case 'right': isScrollAllowed[type].right = value; break;
                case 'all':
                    if(type == 'm'){
                        FP.setAllowScrolling(value);
                    }else{
                        FP.setKeyboardScrolling(value);
                    }
            }
        }

        /*
        * Destroys fullpage.js plugin events and optinally its html markup and styles
        */
        FP.destroy = function(all){
            FP.setAutoScrolling(false, 'internal');
            FP.setAllowScrolling(false);
            FP.setKeyboardScrolling(false);
            container.addClass(DESTROYED);

            clearTimeout(afterSlideLoadsId);
            clearTimeout(afterSectionLoadsId);
            clearTimeout(resizeId);
            clearTimeout(scrollId);
            clearTimeout(scrollId2);

            $window
                .off('scroll', scrollHandler)
                .off('hashchange', hashChangeHandler)
                .off('resize', resizeHandler);

            $document
                .off('click', SECTION_NAV_SEL + ' a')
                .off('mouseenter', SECTION_NAV_SEL + ' li')
                .off('mouseleave', SECTION_NAV_SEL + ' li')
                .off('click', SLIDES_NAV_LINK_SEL)
                .off('mouseover', options.normalScrollElements)
                .off('mouseout', options.normalScrollElements);

            $(SECTION_SEL)
                .off('click', SLIDES_ARROW_SEL);

            clearTimeout(afterSlideLoadsId);
            clearTimeout(afterSectionLoadsId);

            //lets make a mess!
            if(all){
                destroyStructure();
            }
        };

        /*
        * Removes inline styles added by fullpage.js
        */
        function destroyStructure(){
            //reseting the `top` or `translate` properties to 0
            silentScroll(0);

            $(SECTION_NAV_SEL + ', ' + SLIDES_NAV_SEL +  ', ' + SLIDES_ARROW_SEL).remove();

            //removing inline styles
            $(SECTION_SEL).css( {
                'height': '',
                'background-color' : '',
                'padding': ''
            });

            $(SLIDE_SEL).css( {
                'width': ''
            });

            container.css({
                'height': '',
                'position': '',
                '-ms-touch-action': '',
                'touch-action': ''
            });

            $htmlBody.css({
                'overflow': '',
                'height': ''
            });

            // remove .fp-enabled class
            $('html').removeClass(ENABLED);

            // remove all of the .fp-viewing- classes
            $.each($body.get(0).className.split(/\s+/), function (index, className) {
                if (className.indexOf(VIEWING_PREFIX) === 0) {
                    $body.removeClass(className);
                }
            });

            //removing added classes
            $(SECTION_SEL + ', ' + SLIDE_SEL).each(function(){
                options.scrollOverflowHandler.remove($(this));
                $(this).removeClass(TABLE + ' ' + ACTIVE);
            });

            removeAnimation(container);

            //Unwrapping content
            container.find(TABLE_CELL_SEL + ', ' + SLIDES_CONTAINER_SEL + ', ' + SLIDES_WRAPPER_SEL).each(function(){
                //unwrap not being use in case there's no child element inside and its just text
                $(this).replaceWith(this.childNodes);
            });

            //scrolling the page to the top with no animation
            $htmlBody.scrollTop(0);

            //removing selectors
            var usedSelectors = [SECTION, SLIDE, SLIDES_CONTAINER];
            $.each(usedSelectors, function(index, value){
                $('.' + value).removeClass(value);
            });
        }

        /*
        * Sets the state for a variable with multiple states (original, and temporal)
        * Some variables such as `autoScrolling` or `recordHistory` might change automatically its state when using `responsive` or `autoScrolling:false`.
        * This function is used to keep track of both states, the original and the temporal one.
        * If type is not 'internal', then we assume the user is globally changing the variable.
        */
        function setVariableState(variable, value, type){
            options[variable] = value;
            if(type !== 'internal'){
                originals[variable] = value;
            }
        }

        /**
        * Displays warnings
        */
        function displayWarnings(){
            if($('html').hasClass(ENABLED)){
                showError('error', 'Fullpage.js can only be initialized once and you are doing it multiple times!');
                return;
            }

            // Disable mutually exclusive settings
            if (options.continuousVertical &&
                (options.loopTop || options.loopBottom)) {
                options.continuousVertical = false;
                showError('warn', 'Option `loopTop/loopBottom` is mutually exclusive with `continuousVertical`; `continuousVertical` disabled');
            }

            if(options.scrollBar && options.scrollOverflow){
                showError('warn', 'Option `scrollBar` is mutually exclusive with `scrollOverflow`. Sections with scrollOverflow might not work well in Firefox');
            }

            if(options.continuousVertical && options.scrollBar){
                options.continuousVertical = false;
                showError('warn', 'Option `scrollBar` is mutually exclusive with `continuousVertical`; `continuousVertical` disabled');
            }

            //anchors can not have the same value as any element ID or NAME
            $.each(options.anchors, function(index, name){

                //case insensitive selectors (http://stackoverflow.com/a/19465187/1081396)
                var nameAttr = $document.find('[name]').filter(function() {
                    return $(this).attr('name') && $(this).attr('name').toLowerCase() == name.toLowerCase();
                });

                var idAttr = $document.find('[id]').filter(function() {
                    return $(this).attr('id') && $(this).attr('id').toLowerCase() == name.toLowerCase();
                });

                if(idAttr.length || nameAttr.length ){
                    showError('error', 'data-anchor tags can not have the same value as any `id` element on the site (or `name` element for IE).');
                    idAttr.length && showError('error', '"' + name + '" is is being used by another element `id` property');
                    nameAttr.length && showError('error', '"' + name + '" is is being used by another element `name` property');
                }
            });
        }

        /**
        * Shows a message in the console of the given type.
        */
        function showError(type, text){
            console && console[type] && console[type]('fullPage: ' + text);
        }
    };

    /**
     * An object to handle overflow scrolling.
     * This uses jquery.slimScroll to accomplish overflow scrolling.
     * It is possible to pass in an alternate scrollOverflowHandler
     * to the fullpage.js option that implements the same functions
     * as this handler.
     *
     * @type {Object}
     */
    var slimScrollHandler = {
        /**
         * Optional function called after each render.
         *
         * Solves a bug with slimScroll vendor library #1037, #553
         *
         * @param  {object} section jQuery object containing rendered section
         */
        afterRender: function(section){
            var slides = section.find(SLIDES_WRAPPER);
            var scrollableWrap = section.find(SCROLLABLE_SEL);

            if(slides.length){
                scrollableWrap = slides.find(SLIDE_ACTIVE_SEL);
            }

            scrollableWrap.mouseover();
        },

        /**
         * Called when overflow scrolling is needed for a section.
         *
         * @param  {Object} element      jQuery object containing current section
         * @param  {Number} scrollHeight Current window height in pixels
         */
        create: function(element, scrollHeight){
            element.find(SCROLLABLE_SEL).slimScroll({
                allowPageScroll: true,
                height: scrollHeight + 'px',
                size: '10px',
                alwaysVisible: true
            });
        },

        /**
         * Return a boolean depending on whether the scrollable element is a
         * the end or at the start of the scrolling depending on the given type.
         *
         * @param  {String}  type       Either 'top' or 'bottom'
         * @param  {Object}  scrollable jQuery object for the scrollable element
         * @return {Boolean}
         */
        isScrolled: function(type, scrollable){
            if(type === 'top'){
                return !scrollable.scrollTop();
            }else if(type === 'bottom'){
                return scrollable.scrollTop() + 1 + scrollable.innerHeight() >= scrollable[0].scrollHeight;
            }
        },

        /**
         * Returns the scrollable element for the given section.
         * If there are landscape slides, will only return a scrollable element
         * if it is in the active slide.
         *
         * @param  {Object}  activeSection jQuery object containing current section
         * @return {Boolean}
         */
        scrollable: function(activeSection){
            // if there are landscape slides, we check if the scrolling bar is in the current one or not
            if(activeSection.find(SLIDES_WRAPPER_SEL).length){
                return activeSection.find(SLIDE_ACTIVE_SEL).find(SCROLLABLE_SEL);
            }
            return activeSection.find(SCROLLABLE_SEL);
        },

        /**
         * Returns the scroll height of the wrapped content.
         * If this is larger than the window height minus section padding,
         * overflow scrolling is needed.
         *
         * @param  {Object} element jQuery object containing current section
         * @return {Number}
         */
        scrollHeight: function(element){
            return element.find(SCROLLABLE_SEL).get(0).scrollHeight;
        },

        /**
         * Called when overflow scrolling is no longer needed for a section.
         *
         * @param  {Object} element      jQuery object containing current section
         */
        remove: function(element){
            element.find(SCROLLABLE_SEL).children().first().unwrap().unwrap();
            element.find(SLIMSCROLL_BAR_SEL).remove();
            element.find(SLIMSCROLL_RAIL_SEL).remove();
        },

        /**
         * Called when overflow scrolling has already been setup but the
         * window height has potentially changed.
         *
         * @param  {Object} element      jQuery object containing current section
         * @param  {Number} scrollHeight Current window height in pixels
         */
        update: function(element, scrollHeight){
            element.find(SCROLLABLE_SEL).css('height', scrollHeight + 'px').parent().css('height', scrollHeight + 'px');
        },

        /**
         * Called to get any additional elements needed to wrap the section
         * content in order to facilitate overflow scrolling.
         *
         * @return {String|Object} Can be a string containing HTML,
         *                         a DOM element, or jQuery object.
         */
        wrapContent: function(){
            return '<div class="' + SCROLLABLE + '"></div>';
        }
    };

    defaultScrollHandler = slimScrollHandler;

});
/*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 1.3.2 (modified for fullpage.js ) (v 1.1)
 *
 */
(function(f){jQuery.fn.extend({slimScroll:function(g){var a=f.extend({width:"auto",height:"250px",size:"7px",color:"#000",position:"right",distance:"1px",start:"top",opacity:.4,alwaysVisible:!1,disableFadeOut:!1,railVisible:!1,railColor:"#333",railOpacity:.2,railDraggable:!0,railClass:"slimScrollRail",barClass:"slimScrollBar",wrapperClass:"slimScrollDiv",allowPageScroll:!1,wheelStep:20,touchScrollStep:200,borderRadius:"7px",railBorderRadius:"7px"},g);this.each(function(){function m(d){if(u){d=d||
window.event;var c=0;d.wheelDelta&&(c=-d.wheelDelta/120);d.detail&&(c=d.detail/3);f(d.target||d.srcTarget||d.srcElement).closest("."+a.wrapperClass).is(b.parent())&&n(c,!0);d.preventDefault&&!k&&d.preventDefault();k||(d.returnValue=!1)}}function n(d,f,g){k=!1;var e=d,h=b.outerHeight()-c.outerHeight();f&&(e=parseInt(c.css("top"))+d*parseInt(a.wheelStep)/100*c.outerHeight(),e=Math.min(Math.max(e,0),h),e=0<d?Math.ceil(e):Math.floor(e),c.css({top:e+"px"}));l=parseInt(c.css("top"))/(b.outerHeight()-c.outerHeight());
e=l*(b[0].scrollHeight-b.outerHeight());g&&(e=d,d=e/b[0].scrollHeight*b.outerHeight(),d=Math.min(Math.max(d,0),h),c.css({top:d+"px"}));b.scrollTop(e);b.trigger("slimscrolling",~~e);w();q()}function D(){window.addEventListener?(this.addEventListener("DOMMouseScroll",m,!1),this.addEventListener("mousewheel",m,!1)):document.attachEvent("onmousewheel",m)}function E(){window.removeEventListener?(this.removeEventListener("DOMMouseScroll",m),this.removeEventListener("mousewheel",m)):document.detachEvent("onmousewheel",
m)}function x(){v=Math.max(b.outerHeight()/b[0].scrollHeight*b.outerHeight(),30);c.css({height:v+"px"});var a=v==b.outerHeight()?"none":"block";c.css({display:a})}function w(){x();clearTimeout(B);l==~~l?(k=a.allowPageScroll,C!=l&&b.trigger("slimscroll",0==~~l?"top":"bottom")):k=!1;C=l;v>=b.outerHeight()?k=!0:(c.stop(!0,!0).fadeIn("fast"),a.railVisible&&h.stop(!0,!0).fadeIn("fast"))}function q(){a.alwaysVisible||(B=setTimeout(function(){a.disableFadeOut&&u||y||z||(c.fadeOut("slow"),h.fadeOut("slow"))},
1E3))}var u,y,z,B,A,v,l,C,k=!1,b=f(this);if(b.parent().hasClass(a.wrapperClass)){var p=b.scrollTop(),c=b.parent().find("."+a.barClass),h=b.parent().find("."+a.railClass);x();if(f.isPlainObject(g)){if("height"in g&&"auto"==g.height){b.parent().css("height","auto");b.css("height","auto");var r=b.parent().parent().height();b.parent().css("height",r);b.css("height",r)}if("scrollTo"in g)p=parseInt(a.scrollTo);else if("scrollBy"in g)p+=parseInt(a.scrollBy);else if("destroy"in g){E();c.remove();h.remove();
b.unwrap();return}n(p,!1,!0)}}else{a.height="auto"==g.height?b.parent().height():g.height;p=f("<div></div>").addClass(a.wrapperClass).css({position:"relative",overflow:"hidden",width:a.width,height:a.height});b.css({overflow:"hidden",width:a.width,height:a.height});var h=f("<div></div>").addClass(a.railClass).css({width:a.size,height:"100%",position:"absolute",top:0,display:a.alwaysVisible&&a.railVisible?"block":"none","border-radius":a.railBorderRadius,background:a.railColor,opacity:a.railOpacity,
zIndex:90}),c=f("<div></div>").addClass(a.barClass).css({background:a.color,width:a.size,position:"absolute",top:0,opacity:a.opacity,display:a.alwaysVisible?"block":"none","border-radius":a.borderRadius,BorderRadius:a.borderRadius,MozBorderRadius:a.borderRadius,WebkitBorderRadius:a.borderRadius,zIndex:99}),r="right"==a.position?{right:a.distance}:{left:a.distance};h.css(r);c.css(r);b.wrap(p);b.parent().append(c);b.parent().append(h);a.railDraggable&&c.bind("mousedown",function(a){var b=f(document);
z=!0;t=parseFloat(c.css("top"));pageY=a.pageY;b.bind("mousemove.slimscroll",function(a){currTop=t+a.pageY-pageY;c.css("top",currTop);n(0,c.position().top,!1)});b.bind("mouseup.slimscroll",function(a){z=!1;q();b.unbind(".slimscroll")});return!1}).bind("selectstart.slimscroll",function(a){a.stopPropagation();a.preventDefault();return!1});h.hover(function(){w()},function(){q()});c.hover(function(){y=!0},function(){y=!1});b.hover(function(){u=!0;w();q()},function(){u=!1;q()});b.bind("touchstart",function(a,
b){a.originalEvent.touches.length&&(A=a.originalEvent.touches[0].pageY)});b.bind("touchmove",function(b){k||b.originalEvent.preventDefault();b.originalEvent.touches.length&&(n((A-b.originalEvent.touches[0].pageY)/a.touchScrollStep,!0),A=b.originalEvent.touches[0].pageY)});x();"bottom"===a.start?(c.css({top:b.outerHeight()-c.outerHeight()}),n(0,!0)):"top"!==a.start&&(n(f(a.start).position().top,null,!0),a.alwaysVisible||c.hide());D()}});return this}});jQuery.fn.extend({slimscroll:jQuery.fn.slimScroll})})(jQuery);
/*!
 * VERSION: 1.17.0
 * DATE: 2015-05-27
 * UPDATES AND DOCS AT: http://greensock.com
 *
 * Includes all of the following: TweenLite, TweenMax, TimelineLite, TimelineMax, EasePack, CSSPlugin, RoundPropsPlugin, BezierPlugin, AttrPlugin, DirectionalRotationPlugin
 *
 * @license Copyright (c) 2008-2015, GreenSock. All rights reserved.
 * This work is subject to the terms at http://greensock.com/standard-license or for
 * Club GreenSock members, the software agreement that was issued with your membership.
 *
 * @author: Jack Doyle, jack@greensock.com
 **/
var _gsScope = (typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window; //helps ensure compatibility with AMD/RequireJS and CommonJS/Node
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push( function() {

"use strict";

_gsScope._gsDefine("TweenMax", ["core.Animation","core.SimpleTimeline","TweenLite"], function(Animation, SimpleTimeline, TweenLite) {

var _slice = function(a) { //don't use [].slice because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
var b = [],
l = a.length,
i;
for (i = 0; i !== l; b.push(a[i++]));
return b;
},
TweenMax = function(target, duration, vars) {
TweenLite.call(this, target, duration, vars);
this._cycle = 0;
this._yoyo = (this.vars.yoyo === true);
this._repeat = this.vars.repeat || 0;
this._repeatDelay = this.vars.repeatDelay || 0;
this._dirty = true; //ensures that if there is any repeat, the totalDuration will get recalculated to accurately report it.
this.render = TweenMax.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)
},
_tinyNum = 0.0000000001,
TweenLiteInternals = TweenLite._internals,
_isSelector = TweenLiteInternals.isSelector,
_isArray = TweenLiteInternals.isArray,
p = TweenMax.prototype = TweenLite.to({}, 0.1, {}),
_blankArray = [];

TweenMax.version = "1.17.0";
p.constructor = TweenMax;
p.kill()._gc = false;
TweenMax.killTweensOf = TweenMax.killDelayedCallsTo = TweenLite.killTweensOf;
TweenMax.getTweensOf = TweenLite.getTweensOf;
TweenMax.lagSmoothing = TweenLite.lagSmoothing;
TweenMax.ticker = TweenLite.ticker;
TweenMax.render = TweenLite.render;

p.invalidate = function() {
this._yoyo = (this.vars.yoyo === true);
this._repeat = this.vars.repeat || 0;
this._repeatDelay = this.vars.repeatDelay || 0;
this._uncache(true);
return TweenLite.prototype.invalidate.call(this);
};

p.updateTo = function(vars, resetDuration) {
var curRatio = this.ratio,
immediate = this.vars.immediateRender || vars.immediateRender,
p;
if (resetDuration && this._startTime < this._timeline._time) {
this._startTime = this._timeline._time;
this._uncache(false);
if (this._gc) {
this._enabled(true, false);
} else {
this._timeline.insert(this, this._startTime - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
}
}
for (p in vars) {
this.vars[p] = vars[p];
}
if (this._initted || immediate) {
if (resetDuration) {
this._initted = false;
if (immediate) {
this.render(0, true, true);
}
} else {
if (this._gc) {
this._enabled(true, false);
}
if (this._notifyPluginsOfEnabled && this._firstPT) {
TweenLite._onPluginEvent("_onDisable", this); //in case a plugin like MotionBlur must perform some cleanup tasks
}
if (this._time / this._duration > 0.998) { //if the tween has finished (or come extremely close to finishing), we just need to rewind it to 0 and then render it again at the end which forces it to re-initialize (parsing the new vars). We allow tweens that are close to finishing (but haven't quite finished) to work this way too because otherwise, the values are so small when determining where to project the starting values that binary math issues creep in and can make the tween appear to render incorrectly when run backwards.
var prevTime = this._time;
this.render(0, true, false);
this._initted = false;
this.render(prevTime, true, false);
} else if (this._time > 0 || immediate) {
this._initted = false;
this._init();
var inv = 1 / (1 - curRatio),
pt = this._firstPT, endValue;
while (pt) {
endValue = pt.s + pt.c;
pt.c *= inv;
pt.s = endValue - pt.c;
pt = pt._next;
}
}
}
}
return this;
};

p.render = function(time, suppressEvents, force) {
if (!this._initted) if (this._duration === 0 && this.vars.repeat) { //zero duration tweens that render immediately have render() called from TweenLite's constructor, before TweenMax's constructor has finished setting _repeat, _repeatDelay, and _yoyo which are critical in determining totalDuration() so we need to call invalidate() which is a low-kb way to get those set properly.
this.invalidate();
}
var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
prevTime = this._time,
prevTotalTime = this._totalTime,
prevCycle = this._cycle,
duration = this._duration,
prevRawPrevTime = this._rawPrevTime,
isComplete, callback, pt, cycleDuration, r, type, pow, rawPrevTime;
if (time >= totalDur) {
this._totalTime = totalDur;
this._cycle = this._repeat;
if (this._yoyo && (this._cycle & 1) !== 0) {
this._time = 0;
this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
} else {
this._time = duration;
this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
}
if (!this._reversed) {
isComplete = true;
callback = "onComplete";
force = (force || this._timeline.autoRemoveChildren); //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
}
if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
if (this._startTime === this._timeline._duration) { //if a zero-duration tween is at the VERY end of a timeline and that timeline renders at its end, it will typically add a tiny bit of cushion to the render time to prevent rounding errors from getting in the way of tweens rendering their VERY end. If we then reverse() that timeline, the zero-duration tween will trigger its onReverseComplete even though technically the playhead didn't pass over it again. It's a very specific edge case we must accommodate.
time = 0;
}
if (time === 0 || prevRawPrevTime < 0 || prevRawPrevTime === _tinyNum) if (prevRawPrevTime !== time) {
force = true;
if (prevRawPrevTime > _tinyNum) {
callback = "onReverseComplete";
}
}
this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
}

} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
this._totalTime = this._time = this._cycle = 0;
this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
if (prevTotalTime !== 0 || (duration === 0 && prevRawPrevTime > 0)) {
callback = "onReverseComplete";
isComplete = this._reversed;
}
if (time < 0) {
this._active = false;
if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
if (prevRawPrevTime >= 0) {
force = true;
}
this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
}
}
if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
force = true;
}
} else {
this._totalTime = this._time = time;

if (this._repeat !== 0) {
cycleDuration = duration + this._repeatDelay;
this._cycle = (this._totalTime / cycleDuration) >> 0; //originally _totalTime % cycleDuration but floating point errors caused problems, so I normalized it. (4 % 0.8 should be 0 but Flash reports it as 0.79999999!)
if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration) {
this._cycle--; //otherwise when rendered exactly at the end time, it will act as though it is repeating (at the beginning)
}
this._time = this._totalTime - (this._cycle * cycleDuration);
if (this._yoyo) if ((this._cycle & 1) !== 0) {
this._time = duration - this._time;
}
if (this._time > duration) {
this._time = duration;
} else if (this._time < 0) {
this._time = 0;
}
}

if (this._easeType) {
r = this._time / duration;
type = this._easeType;
pow = this._easePower;
if (type === 1 || (type === 3 && r >= 0.5)) {
r = 1 - r;
}
if (type === 3) {
r *= 2;
}
if (pow === 1) {
r *= r;
} else if (pow === 2) {
r *= r * r;
} else if (pow === 3) {
r *= r * r * r;
} else if (pow === 4) {
r *= r * r * r * r;
}

if (type === 1) {
this.ratio = 1 - r;
} else if (type === 2) {
this.ratio = r;
} else if (this._time / duration < 0.5) {
this.ratio = r / 2;
} else {
this.ratio = 1 - (r / 2);
}

} else {
this.ratio = this._ease.getRatio(this._time / duration);
}

}

if (prevTime === this._time && !force && prevCycle === this._cycle) {
if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) { //so that onUpdate fires even during the repeatDelay - as long as the totalTime changed, we should trigger onUpdate.
this._callback("onUpdate");
}
return;
} else if (!this._initted) {
this._init();
if (!this._initted || this._gc) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly. Also, if all of the tweening properties have been overwritten (which would cause _gc to be true, as set in _init()), we shouldn't continue otherwise an onStart callback could be called for example.
return;
} else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) { //we stick it in the queue for rendering at the very end of the tick - this is a performance optimization because browsers invalidate styles and force a recalculation if you read, write, and then read style data (so it's better to read/read/read/write/write/write than read/write/read/write/read/write). The down side, of course, is that usually you WANT things to render immediately because you may have code running right after that which depends on the change. Like imagine running TweenLite.set(...) and then immediately after that, creating a nother tween that animates the same property to another value; the starting values of that 2nd tween wouldn't be accurate if lazy is true.
this._time = prevTime;
this._totalTime = prevTotalTime;
this._rawPrevTime = prevRawPrevTime;
this._cycle = prevCycle;
TweenLiteInternals.lazyTweens.push(this);
this._lazy = [time, suppressEvents];
return;
}
//_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
if (this._time && !isComplete) {
this.ratio = this._ease.getRatio(this._time / duration);
} else if (isComplete && this._ease._calcEnd) {
this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
}
}
if (this._lazy !== false) {
this._lazy = false;
}

if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
this._active = true; //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
}
if (prevTotalTime === 0) {
if (this._initted === 2 && time > 0) {
//this.invalidate();
this._init(); //will just apply overwriting since _initted of (2) means it was a from() tween that had immediateRender:true
}
if (this._startAt) {
if (time >= 0) {
this._startAt.render(time, suppressEvents, force);
} else if (!callback) {
callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
}
}
if (this.vars.onStart) if (this._totalTime !== 0 || duration === 0) if (!suppressEvents) {
this._callback("onStart");
}
}

pt = this._firstPT;
while (pt) {
if (pt.f) {
pt.t[pt.p](pt.c * this.ratio + pt.s);
} else {
pt.t[pt.p] = pt.c * this.ratio + pt.s;
}
pt = pt._next;
}

if (this._onUpdate) {
if (time < 0) if (this._startAt && this._startTime) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
}
if (!suppressEvents) if (this._totalTime !== prevTotalTime || isComplete) {
this._callback("onUpdate");
}
}
if (this._cycle !== prevCycle) if (!suppressEvents) if (!this._gc) if (this.vars.onRepeat) {
this._callback("onRepeat");
}
if (callback) if (!this._gc || force) { //check gc because there's a chance that kill() could be called in an onUpdate
if (time < 0 && this._startAt && !this._onUpdate && this._startTime) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
this._startAt.render(time, suppressEvents, force);
}
if (isComplete) {
if (this._timeline.autoRemoveChildren) {
this._enabled(false, false);
}
this._active = false;
}
if (!suppressEvents && this.vars[callback]) {
this._callback(callback);
}
if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) { //the onComplete or onReverseComplete could trigger movement of the playhead and for zero-duration tweens (which must discern direction) that land directly back on their start time, we don't want to fire again on the next render. Think of several addPause()'s in a timeline that forces the playhead to a certain spot, but what if it's already paused and another tween is tweening the "time" of the timeline? Each time it moves [forward] past that spot, it would move back, and since suppressEvents is true, it'd reset _rawPrevTime to _tinyNum so that when it begins again, the callback would fire (so ultimately it could bounce back and forth during that tween). Again, this is a very uncommon scenario, but possible nonetheless.
this._rawPrevTime = 0;
}
}
};

//---- STATIC FUNCTIONS -----------------------------------------------------------------------------------------------------------

TweenMax.to = function(target, duration, vars) {
return new TweenMax(target, duration, vars);
};

TweenMax.from = function(target, duration, vars) {
vars.runBackwards = true;
vars.immediateRender = (vars.immediateRender != false);
return new TweenMax(target, duration, vars);
};

TweenMax.fromTo = function(target, duration, fromVars, toVars) {
toVars.startAt = fromVars;
toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
return new TweenMax(target, duration, toVars);
};

TweenMax.staggerTo = TweenMax.allTo = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
stagger = stagger || 0;
var delay = vars.delay || 0,
a = [],
finalComplete = function() {
if (vars.onComplete) {
vars.onComplete.apply(vars.onCompleteScope || this, arguments);
}
onCompleteAll.apply(onCompleteAllScope || vars.callbackScope || this, onCompleteAllParams || _blankArray);
},
l, copy, i, p;
if (!_isArray(targets)) {
if (typeof(targets) === "string") {
targets = TweenLite.selector(targets) || targets;
}
if (_isSelector(targets)) {
targets = _slice(targets);
}
}
targets = targets || [];
if (stagger < 0) {
targets = _slice(targets);
targets.reverse();
stagger *= -1;
}
l = targets.length - 1;
for (i = 0; i <= l; i++) {
copy = {};
for (p in vars) {
copy[p] = vars[p];
}
copy.delay = delay;
if (i === l && onCompleteAll) {
copy.onComplete = finalComplete;
}
a[i] = new TweenMax(targets[i], duration, copy);
delay += stagger;
}
return a;
};

TweenMax.staggerFrom = TweenMax.allFrom = function(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
vars.runBackwards = true;
vars.immediateRender = (vars.immediateRender != false);
return TweenMax.staggerTo(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
};

TweenMax.staggerFromTo = TweenMax.allFromTo = function(targets, duration, fromVars, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
toVars.startAt = fromVars;
toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
return TweenMax.staggerTo(targets, duration, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
};

TweenMax.delayedCall = function(delay, callback, params, scope, useFrames) {
return new TweenMax(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, callbackScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, immediateRender:false, useFrames:useFrames, overwrite:0});
};

TweenMax.set = function(target, vars) {
return new TweenMax(target, 0, vars);
};

TweenMax.isTweening = function(target) {
return (TweenLite.getTweensOf(target, true).length > 0);
};

var _getChildrenOf = function(timeline, includeTimelines) {
var a = [],
cnt = 0,
tween = timeline._first;
while (tween) {
if (tween instanceof TweenLite) {
a[cnt++] = tween;
} else {
if (includeTimelines) {
a[cnt++] = tween;
}
a = a.concat(_getChildrenOf(tween, includeTimelines));
cnt = a.length;
}
tween = tween._next;
}
return a;
},
getAllTweens = TweenMax.getAllTweens = function(includeTimelines) {
return _getChildrenOf(Animation._rootTimeline, includeTimelines).concat( _getChildrenOf(Animation._rootFramesTimeline, includeTimelines) );
};

TweenMax.killAll = function(complete, tweens, delayedCalls, timelines) {
if (tweens == null) {
tweens = true;
}
if (delayedCalls == null) {
delayedCalls = true;
}
var a = getAllTweens((timelines != false)),
l = a.length,
allTrue = (tweens && delayedCalls && timelines),
isDC, tween, i;
for (i = 0; i < l; i++) {
tween = a[i];
if (allTrue || (tween instanceof SimpleTimeline) || ((isDC = (tween.target === tween.vars.onComplete)) && delayedCalls) || (tweens && !isDC)) {
if (complete) {
tween.totalTime(tween._reversed ? 0 : tween.totalDuration());
} else {
tween._enabled(false, false);
}
}
}
};

TweenMax.killChildTweensOf = function(parent, complete) {
if (parent == null) {
return;
}
var tl = TweenLiteInternals.tweenLookup,
a, curParent, p, i, l;
if (typeof(parent) === "string") {
parent = TweenLite.selector(parent) || parent;
}
if (_isSelector(parent)) {
parent = _slice(parent);
}
if (_isArray(parent)) {
i = parent.length;
while (--i > -1) {
TweenMax.killChildTweensOf(parent[i], complete);
}
return;
}
a = [];
for (p in tl) {
curParent = tl[p].target.parentNode;
while (curParent) {
if (curParent === parent) {
a = a.concat(tl[p].tweens);
}
curParent = curParent.parentNode;
}
}
l = a.length;
for (i = 0; i < l; i++) {
if (complete) {
a[i].totalTime(a[i].totalDuration());
}
a[i]._enabled(false, false);
}
};

var _changePause = function(pause, tweens, delayedCalls, timelines) {
tweens = (tweens !== false);
delayedCalls = (delayedCalls !== false);
timelines = (timelines !== false);
var a = getAllTweens(timelines),
allTrue = (tweens && delayedCalls && timelines),
i = a.length,
isDC, tween;
while (--i > -1) {
tween = a[i];
if (allTrue || (tween instanceof SimpleTimeline) || ((isDC = (tween.target === tween.vars.onComplete)) && delayedCalls) || (tweens && !isDC)) {
tween.paused(pause);
}
}
};

TweenMax.pauseAll = function(tweens, delayedCalls, timelines) {
_changePause(true, tweens, delayedCalls, timelines);
};

TweenMax.resumeAll = function(tweens, delayedCalls, timelines) {
_changePause(false, tweens, delayedCalls, timelines);
};

TweenMax.globalTimeScale = function(value) {
var tl = Animation._rootTimeline,
t = TweenLite.ticker.time;
if (!arguments.length) {
return tl._timeScale;
}
value = value || _tinyNum; //can't allow zero because it'll throw the math off
tl._startTime = t - ((t - tl._startTime) * tl._timeScale / value);
tl = Animation._rootFramesTimeline;
t = TweenLite.ticker.frame;
tl._startTime = t - ((t - tl._startTime) * tl._timeScale / value);
tl._timeScale = Animation._rootTimeline._timeScale = value;
return value;
};


//---- GETTERS / SETTERS ----------------------------------------------------------------------------------------------------------

p.progress = function(value) {
return (!arguments.length) ? this._time / this.duration() : this.totalTime( this.duration() * ((this._yoyo && (this._cycle & 1) !== 0) ? 1 - value : value) + (this._cycle * (this._duration + this._repeatDelay)), false);
};

p.totalProgress = function(value) {
return (!arguments.length) ? this._totalTime / this.totalDuration() : this.totalTime( this.totalDuration() * value, false);
};

p.time = function(value, suppressEvents) {
if (!arguments.length) {
return this._time;
}
if (this._dirty) {
this.totalDuration();
}
if (value > this._duration) {
value = this._duration;
}
if (this._yoyo && (this._cycle & 1) !== 0) {
value = (this._duration - value) + (this._cycle * (this._duration + this._repeatDelay));
} else if (this._repeat !== 0) {
value += this._cycle * (this._duration + this._repeatDelay);
}
return this.totalTime(value, suppressEvents);
};

p.duration = function(value) {
if (!arguments.length) {
return this._duration; //don't set _dirty = false because there could be repeats that haven't been factored into the _totalDuration yet. Otherwise, if you create a repeated TweenMax and then immediately check its duration(), it would cache the value and the totalDuration would not be correct, thus repeats wouldn't take effect.
}
return Animation.prototype.duration.call(this, value);
};

p.totalDuration = function(value) {
if (!arguments.length) {
if (this._dirty) {
//instead of Infinity, we use 999999999999 so that we can accommodate reverses
this._totalDuration = (this._repeat === -1) ? 999999999999 : this._duration * (this._repeat + 1) + (this._repeatDelay * this._repeat);
this._dirty = false;
}
return this._totalDuration;
}
return (this._repeat === -1) ? this : this.duration( (value - (this._repeat * this._repeatDelay)) / (this._repeat + 1) );
};

p.repeat = function(value) {
if (!arguments.length) {
return this._repeat;
}
this._repeat = value;
return this._uncache(true);
};

p.repeatDelay = function(value) {
if (!arguments.length) {
return this._repeatDelay;
}
this._repeatDelay = value;
return this._uncache(true);
};

p.yoyo = function(value) {
if (!arguments.length) {
return this._yoyo;
}
this._yoyo = value;
return this;
};


return TweenMax;

}, true);








/*
 * ----------------------------------------------------------------
 * TimelineLite
 * ----------------------------------------------------------------
 */
_gsScope._gsDefine("TimelineLite", ["core.Animation","core.SimpleTimeline","TweenLite"], function(Animation, SimpleTimeline, TweenLite) {

var TimelineLite = function(vars) {
SimpleTimeline.call(this, vars);
this._labels = {};
this.autoRemoveChildren = (this.vars.autoRemoveChildren === true);
this.smoothChildTiming = (this.vars.smoothChildTiming === true);
this._sortChildren = true;
this._onUpdate = this.vars.onUpdate;
var v = this.vars,
val, p;
for (p in v) {
val = v[p];
if (_isArray(val)) if (val.join("").indexOf("{self}") !== -1) {
v[p] = this._swapSelfInParams(val);
}
}
if (_isArray(v.tweens)) {
this.add(v.tweens, 0, v.align, v.stagger);
}
},
_tinyNum = 0.0000000001,
TweenLiteInternals = TweenLite._internals,
_internals = TimelineLite._internals = {},
_isSelector = TweenLiteInternals.isSelector,
_isArray = TweenLiteInternals.isArray,
_lazyTweens = TweenLiteInternals.lazyTweens,
_lazyRender = TweenLiteInternals.lazyRender,
_blankArray = [],
_globals = _gsScope._gsDefine.globals,
_copy = function(vars) {
var copy = {}, p;
for (p in vars) {
copy[p] = vars[p];
}
return copy;
},
_pauseCallback = _internals.pauseCallback = function(tween, callback, params, scope) {
var tl = tween._timeline,
time = tl._totalTime,
startTime = tween._startTime,
reversed = (tween._rawPrevTime < 0 || (tween._rawPrevTime === 0 && tl._reversed)),//don't use tween.ratio because if the playhead lands exactly on top of the addPause(), ratio will be 1 even if the master timeline was reversed (which is correct). The key here is to sense the direction of the playhead.
next = reversed ? 0 : _tinyNum,
prev = reversed ? _tinyNum : 0,
sibling;
if (callback || !this._forcingPlayhead) { //if the user calls a method that moves the playhead (like progress() or time()), it should honor that and skip any pauses (although if there's a callback positioned at that pause, it must jump there and make the call to ensure the time is EXACTLY what it is supposed to be, and then proceed to where the playhead is being forced). Otherwise, imagine placing a pause in the middle of a timeline and then doing timeline.progress(0.9) - it would get stuck where the pause is.
tl.pause(startTime);
//now find sibling tweens that are EXACTLY at the same spot on the timeline and adjust the _rawPrevTime so that they fire (or don't fire) correctly on the next render. This is primarily to accommodate zero-duration tweens/callbacks that are positioned right on top of a pause. For example, tl.to(...).call(...).addPause(...).call(...) - notice that there's a call() on each side of the pause, so when it's running forward it should call the first one and then pause, and then when resumed, call the other. Zero-duration tweens use _rawPrevTime to sense momentum figure out if events were suppressed when arriving directly on top of that time.
sibling = tween._prev;
while (sibling && sibling._startTime === startTime) {
sibling._rawPrevTime = prev;
sibling = sibling._prev;
}
sibling = tween._next;
while (sibling && sibling._startTime === startTime) {
sibling._rawPrevTime = next;
sibling = sibling._next;
}
if (callback) {
callback.apply(scope || tl.vars.callbackScope || tl, params || _blankArray);
}
if (this._forcingPlayhead || !tl._paused) { //the callback could have called resume().
tl.seek(time);
}
}
},
_slice = function(a) { //don't use [].slice because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
var b = [],
l = a.length,
i;
for (i = 0; i !== l; b.push(a[i++]));
return b;
},
p = TimelineLite.prototype = new SimpleTimeline();

TimelineLite.version = "1.17.0";
p.constructor = TimelineLite;
p.kill()._gc = p._forcingPlayhead = false;

/* might use later...
//translates a local time inside an animation to the corresponding time on the root/global timeline, factoring in all nesting and timeScales.
function localToGlobal(time, animation) {
while (animation) {
time = (time / animation._timeScale) + animation._startTime;
animation = animation.timeline;
}
return time;
}

//translates the supplied time on the root/global timeline into the corresponding local time inside a particular animation, factoring in all nesting and timeScales
function globalToLocal(time, animation) {
var scale = 1;
time -= localToGlobal(0, animation);
while (animation) {
scale *= animation._timeScale;
animation = animation.timeline;
}
return time * scale;
}
*/

p.to = function(target, duration, vars, position) {
var Engine = (vars.repeat && _globals.TweenMax) || TweenLite;
return duration ? this.add( new Engine(target, duration, vars), position) : this.set(target, vars, position);
};

p.from = function(target, duration, vars, position) {
return this.add( ((vars.repeat && _globals.TweenMax) || TweenLite).from(target, duration, vars), position);
};

p.fromTo = function(target, duration, fromVars, toVars, position) {
var Engine = (toVars.repeat && _globals.TweenMax) || TweenLite;
return duration ? this.add( Engine.fromTo(target, duration, fromVars, toVars), position) : this.set(target, toVars, position);
};

p.staggerTo = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
var tl = new TimelineLite({onComplete:onCompleteAll, onCompleteParams:onCompleteAllParams, callbackScope:onCompleteAllScope, smoothChildTiming:this.smoothChildTiming}),
i;
if (typeof(targets) === "string") {
targets = TweenLite.selector(targets) || targets;
}
targets = targets || [];
if (_isSelector(targets)) { //senses if the targets object is a selector. If it is, we should translate it into an array.
targets = _slice(targets);
}
stagger = stagger || 0;
if (stagger < 0) {
targets = _slice(targets);
targets.reverse();
stagger *= -1;
}
for (i = 0; i < targets.length; i++) {
if (vars.startAt) {
vars.startAt = _copy(vars.startAt);
}
tl.to(targets[i], duration, _copy(vars), i * stagger);
}
return this.add(tl, position);
};

p.staggerFrom = function(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
vars.immediateRender = (vars.immediateRender != false);
vars.runBackwards = true;
return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
};

p.staggerFromTo = function(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
toVars.startAt = fromVars;
toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope);
};

p.call = function(callback, params, scope, position) {
return this.add( TweenLite.delayedCall(0, callback, params, scope), position);
};

p.set = function(target, vars, position) {
position = this._parseTimeOrLabel(position, 0, true);
if (vars.immediateRender == null) {
vars.immediateRender = (position === this._time && !this._paused);
}
return this.add( new TweenLite(target, 0, vars), position);
};

TimelineLite.exportRoot = function(vars, ignoreDelayedCalls) {
vars = vars || {};
if (vars.smoothChildTiming == null) {
vars.smoothChildTiming = true;
}
var tl = new TimelineLite(vars),
root = tl._timeline,
tween, next;
if (ignoreDelayedCalls == null) {
ignoreDelayedCalls = true;
}
root._remove(tl, true);
tl._startTime = 0;
tl._rawPrevTime = tl._time = tl._totalTime = root._time;
tween = root._first;
while (tween) {
next = tween._next;
if (!ignoreDelayedCalls || !(tween instanceof TweenLite && tween.target === tween.vars.onComplete)) {
tl.add(tween, tween._startTime - tween._delay);
}
tween = next;
}
root.add(tl, 0);
return tl;
};

p.add = function(value, position, align, stagger) {
var curTime, l, i, child, tl, beforeRawTime;
if (typeof(position) !== "number") {
position = this._parseTimeOrLabel(position, 0, true, value);
}
if (!(value instanceof Animation)) {
if ((value instanceof Array) || (value && value.push && _isArray(value))) {
align = align || "normal";
stagger = stagger || 0;
curTime = position;
l = value.length;
for (i = 0; i < l; i++) {
if (_isArray(child = value[i])) {
child = new TimelineLite({tweens:child});
}
this.add(child, curTime);
if (typeof(child) !== "string" && typeof(child) !== "function") {
if (align === "sequence") {
curTime = child._startTime + (child.totalDuration() / child._timeScale);
} else if (align === "start") {
child._startTime -= child.delay();
}
}
curTime += stagger;
}
return this._uncache(true);
} else if (typeof(value) === "string") {
return this.addLabel(value, position);
} else if (typeof(value) === "function") {
value = TweenLite.delayedCall(0, value);
} else {
throw("Cannot add " + value + " into the timeline; it is not a tween, timeline, function, or string.");
}
}

SimpleTimeline.prototype.add.call(this, value, position);

//if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.
if (this._gc || this._time === this._duration) if (!this._paused) if (this._duration < this.duration()) {
//in case any of the ancestors had completed but should now be enabled...
tl = this;
beforeRawTime = (tl.rawTime() > value._startTime); //if the tween is placed on the timeline so that it starts BEFORE the current rawTime, we should align the playhead (move the timeline). This is because sometimes users will create a timeline, let it finish, and much later append a tween and expect it to run instead of jumping to its end state. While technically one could argue that it should jump to its end state, that's not what users intuitively expect.
while (tl._timeline) {
if (beforeRawTime && tl._timeline.smoothChildTiming) {
tl.totalTime(tl._totalTime, true); //moves the timeline (shifts its startTime) if necessary, and also enables it.
} else if (tl._gc) {
tl._enabled(true, false);
}
tl = tl._timeline;
}
}

return this;
};

p.remove = function(value) {
if (value instanceof Animation) {
return this._remove(value, false);
} else if (value instanceof Array || (value && value.push && _isArray(value))) {
var i = value.length;
while (--i > -1) {
this.remove(value[i]);
}
return this;
} else if (typeof(value) === "string") {
return this.removeLabel(value);
}
return this.kill(null, value);
};

p._remove = function(tween, skipDisable) {
SimpleTimeline.prototype._remove.call(this, tween, skipDisable);
var last = this._last;
if (!last) {
this._time = this._totalTime = this._duration = this._totalDuration = 0;
} else if (this._time > last._startTime + last._totalDuration / last._timeScale) {
this._time = this.duration();
this._totalTime = this._totalDuration;
}
return this;
};

p.append = function(value, offsetOrLabel) {
return this.add(value, this._parseTimeOrLabel(null, offsetOrLabel, true, value));
};

p.insert = p.insertMultiple = function(value, position, align, stagger) {
return this.add(value, position || 0, align, stagger);
};

p.appendMultiple = function(tweens, offsetOrLabel, align, stagger) {
return this.add(tweens, this._parseTimeOrLabel(null, offsetOrLabel, true, tweens), align, stagger);
};

p.addLabel = function(label, position) {
this._labels[label] = this._parseTimeOrLabel(position);
return this;
};

p.addPause = function(position, callback, params, scope) {
var t = TweenLite.delayedCall(0, _pauseCallback, ["{self}", callback, params, scope], this);
t.data = "isPause"; // we use this flag in TweenLite's render() method to identify it as a special case that shouldn't be triggered when the virtual playhead is LEAVING the exact position where the pause is, otherwise timeline.addPause(1).play(1) would end up paused on the very next tick.
return this.add(t, position);
};

p.removeLabel = function(label) {
delete this._labels[label];
return this;
};

p.getLabelTime = function(label) {
return (this._labels[label] != null) ? this._labels[label] : -1;
};

p._parseTimeOrLabel = function(timeOrLabel, offsetOrLabel, appendIfAbsent, ignore) {
var i;
//if we're about to add a tween/timeline (or an array of them) that's already a child of this timeline, we should remove it first so that it doesn't contaminate the duration().
if (ignore instanceof Animation && ignore.timeline === this) {
this.remove(ignore);
} else if (ignore && ((ignore instanceof Array) || (ignore.push && _isArray(ignore)))) {
i = ignore.length;
while (--i > -1) {
if (ignore[i] instanceof Animation && ignore[i].timeline === this) {
this.remove(ignore[i]);
}
}
}
if (typeof(offsetOrLabel) === "string") {
return this._parseTimeOrLabel(offsetOrLabel, (appendIfAbsent && typeof(timeOrLabel) === "number" && this._labels[offsetOrLabel] == null) ? timeOrLabel - this.duration() : 0, appendIfAbsent);
}
offsetOrLabel = offsetOrLabel || 0;
if (typeof(timeOrLabel) === "string" && (isNaN(timeOrLabel) || this._labels[timeOrLabel] != null)) { //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
i = timeOrLabel.indexOf("=");
if (i === -1) {
if (this._labels[timeOrLabel] == null) {
return appendIfAbsent ? (this._labels[timeOrLabel] = this.duration() + offsetOrLabel) : offsetOrLabel;
}
return this._labels[timeOrLabel] + offsetOrLabel;
}
offsetOrLabel = parseInt(timeOrLabel.charAt(i-1) + "1", 10) * Number(timeOrLabel.substr(i+1));
timeOrLabel = (i > 1) ? this._parseTimeOrLabel(timeOrLabel.substr(0, i-1), 0, appendIfAbsent) : this.duration();
} else if (timeOrLabel == null) {
timeOrLabel = this.duration();
}
return Number(timeOrLabel) + offsetOrLabel;
};

p.seek = function(position, suppressEvents) {
return this.totalTime((typeof(position) === "number") ? position : this._parseTimeOrLabel(position), (suppressEvents !== false));
};

p.stop = function() {
return this.paused(true);
};

p.gotoAndPlay = function(position, suppressEvents) {
return this.play(position, suppressEvents);
};

p.gotoAndStop = function(position, suppressEvents) {
return this.pause(position, suppressEvents);
};

p.render = function(time, suppressEvents, force) {
if (this._gc) {
this._enabled(true, false);
}
var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
prevTime = this._time,
prevStart = this._startTime,
prevTimeScale = this._timeScale,
prevPaused = this._paused,
tween, isComplete, next, callback, internalForce;
if (time >= totalDur) {
this._totalTime = this._time = totalDur;
if (!this._reversed) if (!this._hasPausedChild()) {
isComplete = true;
callback = "onComplete";
internalForce = !!this._timeline.autoRemoveChildren; //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
if (this._duration === 0) if (time === 0 || this._rawPrevTime < 0 || this._rawPrevTime === _tinyNum) if (this._rawPrevTime !== time && this._first) {
internalForce = true;
if (this._rawPrevTime > _tinyNum) {
callback = "onReverseComplete";
}
}
}
this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
time = totalDur + 0.0001; //to avoid occasional floating point rounding errors - sometimes child tweens/timelines were not being fully completed (their progress might be 0.999999999999998 instead of 1 because when _time - tween._startTime is performed, floating point errors would return a value that was SLIGHTLY off). Try (999999999999.7 - 999999999999) * 1 = 0.699951171875 instead of 0.7.

} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
this._totalTime = this._time = 0;
if (prevTime !== 0 || (this._duration === 0 && this._rawPrevTime !== _tinyNum && (this._rawPrevTime > 0 || (time < 0 && this._rawPrevTime >= 0)))) {
callback = "onReverseComplete";
isComplete = this._reversed;
}
if (time < 0) {
this._active = false;
if (this._timeline.autoRemoveChildren && this._reversed) { //ensures proper GC if a timeline is resumed after it's finished reversing.
internalForce = isComplete = true;
callback = "onReverseComplete";
} else if (this._rawPrevTime >= 0 && this._first) { //when going back beyond the start, force a render so that zero-duration tweens that sit at the very beginning render their start values properly. Otherwise, if the parent timeline's playhead lands exactly at this timeline's startTime, and then moves backwards, the zero-duration tweens at the beginning would still be at their end state.
internalForce = true;
}
this._rawPrevTime = time;
} else {
this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
if (time === 0 && isComplete) { //if there's a zero-duration tween at the very beginning of a timeline and the playhead lands EXACTLY at time 0, that tween will correctly render its end values, but we need to keep the timeline alive for one more render so that the beginning values render properly as the parent's playhead keeps moving beyond the begining. Imagine obj.x starts at 0 and then we do tl.set(obj, {x:100}).to(obj, 1, {x:200}) and then later we tl.reverse()...the goal is to have obj.x revert to 0. If the playhead happens to land on exactly 0, without this chunk of code, it'd complete the timeline and remove it from the rendering queue (not good).
tween = this._first;
while (tween && tween._startTime === 0) {
if (!tween._duration) {
isComplete = false;
}
tween = tween._next;
}
}
time = 0; //to avoid occasional floating point rounding errors (could cause problems especially with zero-duration tweens at the very beginning of the timeline)
if (!this._initted) {
internalForce = true;
}
}

} else {
this._totalTime = this._time = this._rawPrevTime = time;
}
if ((this._time === prevTime || !this._first) && !force && !internalForce) {
return;
} else if (!this._initted) {
this._initted = true;
}

if (!this._active) if (!this._paused && this._time !== prevTime && time > 0) {
this._active = true; //so that if the user renders the timeline (as opposed to the parent timeline rendering it), it is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the timeline already finished but the user manually re-renders it as halfway done, for example.
}

if (prevTime === 0) if (this.vars.onStart) if (this._time !== 0) if (!suppressEvents) {
this._callback("onStart");
}

if (this._time >= prevTime) {
tween = this._first;
while (tween) {
next = tween._next; //record it here because the value could change after rendering...
if (this._paused && !prevPaused) { //in case a tween pauses the timeline when rendering
break;
} else if (tween._active || (tween._startTime <= this._time && !tween._paused && !tween._gc)) {
if (!tween._reversed) {
tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
} else {
tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
}
}
tween = next;
}
} else {
tween = this._last;
while (tween) {
next = tween._prev; //record it here because the value could change after rendering...
if (this._paused && !prevPaused) { //in case a tween pauses the timeline when rendering
break;
} else if (tween._active || (tween._startTime <= prevTime && !tween._paused && !tween._gc)) {
if (!tween._reversed) {
tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
} else {
tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
}
}
tween = next;
}
}

if (this._onUpdate) if (!suppressEvents) {
if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.
_lazyRender();
}
this._callback("onUpdate");
}

if (callback) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) { //if one of the tweens that was rendered altered this timeline's startTime (like if an onComplete reversed the timeline), it probably isn't complete. If it is, don't worry, because whatever call altered the startTime would complete if it was necessary at the new time. The only exception is the timeScale property. Also check _gc because there's a chance that kill() could be called in an onUpdate
if (isComplete) {
if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onComplete on a timeline that reports/checks tweened values.
_lazyRender();
}
if (this._timeline.autoRemoveChildren) {
this._enabled(false, false);
}
this._active = false;
}
if (!suppressEvents && this.vars[callback]) {
this._callback(callback);
}
}
};

p._hasPausedChild = function() {
var tween = this._first;
while (tween) {
if (tween._paused || ((tween instanceof TimelineLite) && tween._hasPausedChild())) {
return true;
}
tween = tween._next;
}
return false;
};

p.getChildren = function(nested, tweens, timelines, ignoreBeforeTime) {
ignoreBeforeTime = ignoreBeforeTime || -9999999999;
var a = [],
tween = this._first,
cnt = 0;
while (tween) {
if (tween._startTime < ignoreBeforeTime) {
//do nothing
} else if (tween instanceof TweenLite) {
if (tweens !== false) {
a[cnt++] = tween;
}
} else {
if (timelines !== false) {
a[cnt++] = tween;
}
if (nested !== false) {
a = a.concat(tween.getChildren(true, tweens, timelines));
cnt = a.length;
}
}
tween = tween._next;
}
return a;
};

p.getTweensOf = function(target, nested) {
var disabled = this._gc,
a = [],
cnt = 0,
tweens, i;
if (disabled) {
this._enabled(true, true); //getTweensOf() filters out disabled tweens, and we have to mark them as _gc = true when the timeline completes in order to allow clean garbage collection, so temporarily re-enable the timeline here.
}
tweens = TweenLite.getTweensOf(target);
i = tweens.length;
while (--i > -1) {
if (tweens[i].timeline === this || (nested && this._contains(tweens[i]))) {
a[cnt++] = tweens[i];
}
}
if (disabled) {
this._enabled(false, true);
}
return a;
};

p.recent = function() {
return this._recent;
};

p._contains = function(tween) {
var tl = tween.timeline;
while (tl) {
if (tl === this) {
return true;
}
tl = tl.timeline;
}
return false;
};

p.shiftChildren = function(amount, adjustLabels, ignoreBeforeTime) {
ignoreBeforeTime = ignoreBeforeTime || 0;
var tween = this._first,
labels = this._labels,
p;
while (tween) {
if (tween._startTime >= ignoreBeforeTime) {
tween._startTime += amount;
}
tween = tween._next;
}
if (adjustLabels) {
for (p in labels) {
if (labels[p] >= ignoreBeforeTime) {
labels[p] += amount;
}
}
}
return this._uncache(true);
};

p._kill = function(vars, target) {
if (!vars && !target) {
return this._enabled(false, false);
}
var tweens = (!target) ? this.getChildren(true, true, false) : this.getTweensOf(target),
i = tweens.length,
changed = false;
while (--i > -1) {
if (tweens[i]._kill(vars, target)) {
changed = true;
}
}
return changed;
};

p.clear = function(labels) {
var tweens = this.getChildren(false, true, true),
i = tweens.length;
this._time = this._totalTime = 0;
while (--i > -1) {
tweens[i]._enabled(false, false);
}
if (labels !== false) {
this._labels = {};
}
return this._uncache(true);
};

p.invalidate = function() {
var tween = this._first;
while (tween) {
tween.invalidate();
tween = tween._next;
}
return Animation.prototype.invalidate.call(this);;
};

p._enabled = function(enabled, ignoreTimeline) {
if (enabled === this._gc) {
var tween = this._first;
while (tween) {
tween._enabled(enabled, true);
tween = tween._next;
}
}
return SimpleTimeline.prototype._enabled.call(this, enabled, ignoreTimeline);
};

p.totalTime = function(time, suppressEvents, uncapped) {
this._forcingPlayhead = true;
var val = Animation.prototype.totalTime.apply(this, arguments);
this._forcingPlayhead = false;
return val;
};

p.duration = function(value) {
if (!arguments.length) {
if (this._dirty) {
this.totalDuration(); //just triggers recalculation
}
return this._duration;
}
if (this.duration() !== 0 && value !== 0) {
this.timeScale(this._duration / value);
}
return this;
};

p.totalDuration = function(value) {
if (!arguments.length) {
if (this._dirty) {
var max = 0,
tween = this._last,
prevStart = 999999999999,
prev, end;
while (tween) {
prev = tween._prev; //record it here in case the tween changes position in the sequence...
if (tween._dirty) {
tween.totalDuration(); //could change the tween._startTime, so make sure the tween's cache is clean before analyzing it.
}
if (tween._startTime > prevStart && this._sortChildren && !tween._paused) { //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
this.add(tween, tween._startTime - tween._delay);
} else {
prevStart = tween._startTime;
}
if (tween._startTime < 0 && !tween._paused) { //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
max -= tween._startTime;
if (this._timeline.smoothChildTiming) {
this._startTime += tween._startTime / this._timeScale;
}
this.shiftChildren(-tween._startTime, false, -9999999999);
prevStart = 0;
}
end = tween._startTime + (tween._totalDuration / tween._timeScale);
if (end > max) {
max = end;
}
tween = prev;
}
this._duration = this._totalDuration = max;
this._dirty = false;
}
return this._totalDuration;
}
if (this.totalDuration() !== 0) if (value !== 0) {
this.timeScale(this._totalDuration / value);
}
return this;
};

p.paused = function(value) {
if (!value) { //if there's a pause directly at the spot from where we're unpausing, skip it.
var tween = this._first,
time = this._time;
while (tween) {
if (tween._startTime === time && tween.data === "isPause") {
tween._rawPrevTime = 0; //remember, _rawPrevTime is how zero-duration tweens/callbacks sense directionality and determine whether or not to fire. If _rawPrevTime is the same as _startTime on the next render, it won't fire.
}
tween = tween._next;
}
}
return Animation.prototype.paused.apply(this, arguments);
};

p.usesFrames = function() {
var tl = this._timeline;
while (tl._timeline) {
tl = tl._timeline;
}
return (tl === Animation._rootFramesTimeline);
};

p.rawTime = function() {
return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale;
};

return TimelineLite;

}, true);













/*
 * ----------------------------------------------------------------
 * TimelineMax
 * ----------------------------------------------------------------
 */
_gsScope._gsDefine("TimelineMax", ["TimelineLite","TweenLite","easing.Ease"], function(TimelineLite, TweenLite, Ease) {

var TimelineMax = function(vars) {
TimelineLite.call(this, vars);
this._repeat = this.vars.repeat || 0;
this._repeatDelay = this.vars.repeatDelay || 0;
this._cycle = 0;
this._yoyo = (this.vars.yoyo === true);
this._dirty = true;
},
_tinyNum = 0.0000000001,
TweenLiteInternals = TweenLite._internals,
_lazyTweens = TweenLiteInternals.lazyTweens,
_lazyRender = TweenLiteInternals.lazyRender,
_easeNone = new Ease(null, null, 1, 0),
p = TimelineMax.prototype = new TimelineLite();

p.constructor = TimelineMax;
p.kill()._gc = false;
TimelineMax.version = "1.17.0";

p.invalidate = function() {
this._yoyo = (this.vars.yoyo === true);
this._repeat = this.vars.repeat || 0;
this._repeatDelay = this.vars.repeatDelay || 0;
this._uncache(true);
return TimelineLite.prototype.invalidate.call(this);
};

p.addCallback = function(callback, position, params, scope) {
return this.add( TweenLite.delayedCall(0, callback, params, scope), position);
};

p.removeCallback = function(callback, position) {
if (callback) {
if (position == null) {
this._kill(null, callback);
} else {
var a = this.getTweensOf(callback, false),
i = a.length,
time = this._parseTimeOrLabel(position);
while (--i > -1) {
if (a[i]._startTime === time) {
a[i]._enabled(false, false);
}
}
}
}
return this;
};

p.removePause = function(position) {
return this.removeCallback(TimelineLite._internals.pauseCallback, position);
};

p.tweenTo = function(position, vars) {
vars = vars || {};
var copy = {ease:_easeNone, useFrames:this.usesFrames(), immediateRender:false},
duration, p, t;
for (p in vars) {
copy[p] = vars[p];
}
copy.time = this._parseTimeOrLabel(position);
duration = (Math.abs(Number(copy.time) - this._time) / this._timeScale) || 0.001;
t = new TweenLite(this, duration, copy);
copy.onStart = function() {
t.target.paused(true);
if (t.vars.time !== t.target.time() && duration === t.duration()) { //don't make the duration zero - if it's supposed to be zero, don't worry because it's already initting the tween and will complete immediately, effectively making the duration zero anyway. If we make duration zero, the tween won't run at all.
t.duration( Math.abs( t.vars.time - t.target.time()) / t.target._timeScale );
}
if (vars.onStart) { //in case the user had an onStart in the vars - we don't want to overwrite it.
t._callback("onStart");
}
};
return t;
};

p.tweenFromTo = function(fromPosition, toPosition, vars) {
vars = vars || {};
fromPosition = this._parseTimeOrLabel(fromPosition);
vars.startAt = {onComplete:this.seek, onCompleteParams:[fromPosition], callbackScope:this};
vars.immediateRender = (vars.immediateRender !== false);
var t = this.tweenTo(toPosition, vars);
return t.duration((Math.abs( t.vars.time - fromPosition) / this._timeScale) || 0.001);
};

p.render = function(time, suppressEvents, force) {
if (this._gc) {
this._enabled(true, false);
}
var totalDur = (!this._dirty) ? this._totalDuration : this.totalDuration(),
dur = this._duration,
prevTime = this._time,
prevTotalTime = this._totalTime,
prevStart = this._startTime,
prevTimeScale = this._timeScale,
prevRawPrevTime = this._rawPrevTime,
prevPaused = this._paused,
prevCycle = this._cycle,
tween, isComplete, next, callback, internalForce, cycleDuration;
if (time >= totalDur) {
if (!this._locked) {
this._totalTime = totalDur;
this._cycle = this._repeat;
}
if (!this._reversed) if (!this._hasPausedChild()) {
isComplete = true;
callback = "onComplete";
internalForce = !!this._timeline.autoRemoveChildren; //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
if (this._duration === 0) if (time === 0 || prevRawPrevTime < 0 || prevRawPrevTime === _tinyNum) if (prevRawPrevTime !== time && this._first) {
internalForce = true;
if (prevRawPrevTime > _tinyNum) {
callback = "onReverseComplete";
}
}
}
this._rawPrevTime = (this._duration || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
if (this._yoyo && (this._cycle & 1) !== 0) {
this._time = time = 0;
} else {
this._time = dur;
time = dur + 0.0001; //to avoid occasional floating point rounding errors - sometimes child tweens/timelines were not being fully completed (their progress might be 0.999999999999998 instead of 1 because when _time - tween._startTime is performed, floating point errors would return a value that was SLIGHTLY off). Try (999999999999.7 - 999999999999) * 1 = 0.699951171875 instead of 0.7. We cannot do less then 0.0001 because the same issue can occur when the duration is extremely large like 999999999999 in which case adding 0.00000001, for example, causes it to act like nothing was added.
}

} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
if (!this._locked) {
this._totalTime = this._cycle = 0;
}
this._time = 0;
if (prevTime !== 0 || (dur === 0 && prevRawPrevTime !== _tinyNum && (prevRawPrevTime > 0 || (time < 0 && prevRawPrevTime >= 0)) && !this._locked)) { //edge case for checking time < 0 && prevRawPrevTime >= 0: a zero-duration fromTo() tween inside a zero-duration timeline (yeah, very rare)
callback = "onReverseComplete";
isComplete = this._reversed;
}
if (time < 0) {
this._active = false;
if (this._timeline.autoRemoveChildren && this._reversed) {
internalForce = isComplete = true;
callback = "onReverseComplete";
} else if (prevRawPrevTime >= 0 && this._first) { //when going back beyond the start, force a render so that zero-duration tweens that sit at the very beginning render their start values properly. Otherwise, if the parent timeline's playhead lands exactly at this timeline's startTime, and then moves backwards, the zero-duration tweens at the beginning would still be at their end state.
internalForce = true;
}
this._rawPrevTime = time;
} else {
this._rawPrevTime = (dur || !suppressEvents || time || this._rawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline or tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
if (time === 0 && isComplete) { //if there's a zero-duration tween at the very beginning of a timeline and the playhead lands EXACTLY at time 0, that tween will correctly render its end values, but we need to keep the timeline alive for one more render so that the beginning values render properly as the parent's playhead keeps moving beyond the begining. Imagine obj.x starts at 0 and then we do tl.set(obj, {x:100}).to(obj, 1, {x:200}) and then later we tl.reverse()...the goal is to have obj.x revert to 0. If the playhead happens to land on exactly 0, without this chunk of code, it'd complete the timeline and remove it from the rendering queue (not good).
tween = this._first;
while (tween && tween._startTime === 0) {
if (!tween._duration) {
isComplete = false;
}
tween = tween._next;
}
}
time = 0; //to avoid occasional floating point rounding errors (could cause problems especially with zero-duration tweens at the very beginning of the timeline)
if (!this._initted) {
internalForce = true;
}
}

} else {
if (dur === 0 && prevRawPrevTime < 0) { //without this, zero-duration repeating timelines (like with a simple callback nested at the very beginning and a repeatDelay) wouldn't render the first time through.
internalForce = true;
}
this._time = this._rawPrevTime = time;
if (!this._locked) {
this._totalTime = time;
if (this._repeat !== 0) {
cycleDuration = dur + this._repeatDelay;
this._cycle = (this._totalTime / cycleDuration) >> 0; //originally _totalTime % cycleDuration but floating point errors caused problems, so I normalized it. (4 % 0.8 should be 0 but it gets reported as 0.79999999!)
if (this._cycle !== 0) if (this._cycle === this._totalTime / cycleDuration) {
this._cycle--; //otherwise when rendered exactly at the end time, it will act as though it is repeating (at the beginning)
}
this._time = this._totalTime - (this._cycle * cycleDuration);
if (this._yoyo) if ((this._cycle & 1) !== 0) {
this._time = dur - this._time;
}
if (this._time > dur) {
this._time = dur;
time = dur + 0.0001; //to avoid occasional floating point rounding error
} else if (this._time < 0) {
this._time = time = 0;
} else {
time = this._time;
}
}
}
}

if (this._cycle !== prevCycle) if (!this._locked) {
/*
make sure children at the end/beginning of the timeline are rendered properly. If, for example,
a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
would get transated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
ensure that zero-duration tweens at the very beginning or end of the TimelineMax work.
*/
var backwards = (this._yoyo && (prevCycle & 1) !== 0),
wrap = (backwards === (this._yoyo && (this._cycle & 1) !== 0)),
recTotalTime = this._totalTime,
recCycle = this._cycle,
recRawPrevTime = this._rawPrevTime,
recTime = this._time;

this._totalTime = prevCycle * dur;
if (this._cycle < prevCycle) {
backwards = !backwards;
} else {
this._totalTime += dur;
}
this._time = prevTime; //temporarily revert _time so that render() renders the children in the correct order. Without this, tweens won't rewind correctly. We could arhictect things in a "cleaner" way by splitting out the rendering queue into a separate method but for performance reasons, we kept it all inside this method.

this._rawPrevTime = (dur === 0) ? prevRawPrevTime - 0.0001 : prevRawPrevTime;
this._cycle = prevCycle;
this._locked = true; //prevents changes to totalTime and skips repeat/yoyo behavior when we recursively call render()
prevTime = (backwards) ? 0 : dur;
this.render(prevTime, suppressEvents, (dur === 0));
if (!suppressEvents) if (!this._gc) {
if (this.vars.onRepeat) {
this._callback("onRepeat");
}
}
if (wrap) {
prevTime = (backwards) ? dur + 0.0001 : -0.0001;
this.render(prevTime, true, false);
}
this._locked = false;
if (this._paused && !prevPaused) { //if the render() triggered callback that paused this timeline, we should abort (very rare, but possible)
return;
}
this._time = recTime;
this._totalTime = recTotalTime;
this._cycle = recCycle;
this._rawPrevTime = recRawPrevTime;
}

if ((this._time === prevTime || !this._first) && !force && !internalForce) {
if (prevTotalTime !== this._totalTime) if (this._onUpdate) if (!suppressEvents) { //so that onUpdate fires even during the repeatDelay - as long as the totalTime changed, we should trigger onUpdate.
this._callback("onUpdate");
}
return;
} else if (!this._initted) {
this._initted = true;
}

if (!this._active) if (!this._paused && this._totalTime !== prevTotalTime && time > 0) {
this._active = true; //so that if the user renders the timeline (as opposed to the parent timeline rendering it), it is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the timeline already finished but the user manually re-renders it as halfway done, for example.
}

if (prevTotalTime === 0) if (this.vars.onStart) if (this._totalTime !== 0) if (!suppressEvents) {
this._callback("onStart");
}

if (this._time >= prevTime) {
tween = this._first;
while (tween) {
next = tween._next; //record it here because the value could change after rendering...
if (this._paused && !prevPaused) { //in case a tween pauses the timeline when rendering
break;
} else if (tween._active || (tween._startTime <= this._time && !tween._paused && !tween._gc)) {
if (!tween._reversed) {
tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
} else {
tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
}

}
tween = next;
}
} else {
tween = this._last;
while (tween) {
next = tween._prev; //record it here because the value could change after rendering...
if (this._paused && !prevPaused) { //in case a tween pauses the timeline when rendering
break;
} else if (tween._active || (tween._startTime <= prevTime && !tween._paused && !tween._gc)) {
if (!tween._reversed) {
tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
} else {
tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
}
}
tween = next;
}
}

if (this._onUpdate) if (!suppressEvents) {
if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.
_lazyRender();
}
this._callback("onUpdate");
}
if (callback) if (!this._locked) if (!this._gc) if (prevStart === this._startTime || prevTimeScale !== this._timeScale) if (this._time === 0 || totalDur >= this.totalDuration()) { //if one of the tweens that was rendered altered this timeline's startTime (like if an onComplete reversed the timeline), it probably isn't complete. If it is, don't worry, because whatever call altered the startTime would complete if it was necessary at the new time. The only exception is the timeScale property. Also check _gc because there's a chance that kill() could be called in an onUpdate
if (isComplete) {
if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onComplete on a timeline that reports/checks tweened values.
_lazyRender();
}
if (this._timeline.autoRemoveChildren) {
this._enabled(false, false);
}
this._active = false;
}
if (!suppressEvents && this.vars[callback]) {
this._callback(callback);
}
}
};

p.getActive = function(nested, tweens, timelines) {
if (nested == null) {
nested = true;
}
if (tweens == null) {
tweens = true;
}
if (timelines == null) {
timelines = false;
}
var a = [],
all = this.getChildren(nested, tweens, timelines),
cnt = 0,
l = all.length,
i, tween;
for (i = 0; i < l; i++) {
tween = all[i];
if (tween.isActive()) {
a[cnt++] = tween;
}
}
return a;
};


p.getLabelAfter = function(time) {
if (!time) if (time !== 0) { //faster than isNan()
time = this._time;
}
var labels = this.getLabelsArray(),
l = labels.length,
i;
for (i = 0; i < l; i++) {
if (labels[i].time > time) {
return labels[i].name;
}
}
return null;
};

p.getLabelBefore = function(time) {
if (time == null) {
time = this._time;
}
var labels = this.getLabelsArray(),
i = labels.length;
while (--i > -1) {
if (labels[i].time < time) {
return labels[i].name;
}
}
return null;
};

p.getLabelsArray = function() {
var a = [],
cnt = 0,
p;
for (p in this._labels) {
a[cnt++] = {time:this._labels[p], name:p};
}
a.sort(function(a,b) {
return a.time - b.time;
});
return a;
};


//---- GETTERS / SETTERS -------------------------------------------------------------------------------------------------------

p.progress = function(value, suppressEvents) {
return (!arguments.length) ? this._time / this.duration() : this.totalTime( this.duration() * ((this._yoyo && (this._cycle & 1) !== 0) ? 1 - value : value) + (this._cycle * (this._duration + this._repeatDelay)), suppressEvents);
};

p.totalProgress = function(value, suppressEvents) {
return (!arguments.length) ? this._totalTime / this.totalDuration() : this.totalTime( this.totalDuration() * value, suppressEvents);
};

p.totalDuration = function(value) {
if (!arguments.length) {
if (this._dirty) {
TimelineLite.prototype.totalDuration.call(this); //just forces refresh
//Instead of Infinity, we use 999999999999 so that we can accommodate reverses.
this._totalDuration = (this._repeat === -1) ? 999999999999 : this._duration * (this._repeat + 1) + (this._repeatDelay * this._repeat);
}
return this._totalDuration;
}
return (this._repeat === -1) ? this : this.duration( (value - (this._repeat * this._repeatDelay)) / (this._repeat + 1) );
};

p.time = function(value, suppressEvents) {
if (!arguments.length) {
return this._time;
}
if (this._dirty) {
this.totalDuration();
}
if (value > this._duration) {
value = this._duration;
}
if (this._yoyo && (this._cycle & 1) !== 0) {
value = (this._duration - value) + (this._cycle * (this._duration + this._repeatDelay));
} else if (this._repeat !== 0) {
value += this._cycle * (this._duration + this._repeatDelay);
}
return this.totalTime(value, suppressEvents);
};

p.repeat = function(value) {
if (!arguments.length) {
return this._repeat;
}
this._repeat = value;
return this._uncache(true);
};

p.repeatDelay = function(value) {
if (!arguments.length) {
return this._repeatDelay;
}
this._repeatDelay = value;
return this._uncache(true);
};

p.yoyo = function(value) {
if (!arguments.length) {
return this._yoyo;
}
this._yoyo = value;
return this;
};

p.currentLabel = function(value) {
if (!arguments.length) {
return this.getLabelBefore(this._time + 0.00000001);
}
return this.seek(value, true);
};

return TimelineMax;

}, true);












/*
 * ----------------------------------------------------------------
 * BezierPlugin
 * ----------------------------------------------------------------
 */
(function() {

var _RAD2DEG = 180 / Math.PI,
_r1 = [],
_r2 = [],
_r3 = [],
_corProps = {},
_globals = _gsScope._gsDefine.globals,
Segment = function(a, b, c, d) {
this.a = a;
this.b = b;
this.c = c;
this.d = d;
this.da = d - a;
this.ca = c - a;
this.ba = b - a;
},
_correlate = ",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",
cubicToQuadratic = function(a, b, c, d) {
var q1 = {a:a},
q2 = {},
q3 = {},
q4 = {c:d},
mab = (a + b) / 2,
mbc = (b + c) / 2,
mcd = (c + d) / 2,
mabc = (mab + mbc) / 2,
mbcd = (mbc + mcd) / 2,
m8 = (mbcd - mabc) / 8;
q1.b = mab + (a - mab) / 4;
q2.b = mabc + m8;
q1.c = q2.a = (q1.b + q2.b) / 2;
q2.c = q3.a = (mabc + mbcd) / 2;
q3.b = mbcd - m8;
q4.b = mcd + (d - mcd) / 4;
q3.c = q4.a = (q3.b + q4.b) / 2;
return [q1, q2, q3, q4];
},
_calculateControlPoints = function(a, curviness, quad, basic, correlate) {
var l = a.length - 1,
ii = 0,
cp1 = a[0].a,
i, p1, p2, p3, seg, m1, m2, mm, cp2, qb, r1, r2, tl;
for (i = 0; i < l; i++) {
seg = a[ii];
p1 = seg.a;
p2 = seg.d;
p3 = a[ii+1].d;

if (correlate) {
r1 = _r1[i];
r2 = _r2[i];
tl = ((r2 + r1) * curviness * 0.25) / (basic ? 0.5 : _r3[i] || 0.5);
m1 = p2 - (p2 - p1) * (basic ? curviness * 0.5 : (r1 !== 0 ? tl / r1 : 0));
m2 = p2 + (p3 - p2) * (basic ? curviness * 0.5 : (r2 !== 0 ? tl / r2 : 0));
mm = p2 - (m1 + (((m2 - m1) * ((r1 * 3 / (r1 + r2)) + 0.5) / 4) || 0));
} else {
m1 = p2 - (p2 - p1) * curviness * 0.5;
m2 = p2 + (p3 - p2) * curviness * 0.5;
mm = p2 - (m1 + m2) / 2;
}
m1 += mm;
m2 += mm;

seg.c = cp2 = m1;
if (i !== 0) {
seg.b = cp1;
} else {
seg.b = cp1 = seg.a + (seg.c - seg.a) * 0.6; //instead of placing b on a exactly, we move it inline with c so that if the user specifies an ease like Back.easeIn or Elastic.easeIn which goes BEYOND the beginning, it will do so smoothly.
}

seg.da = p2 - p1;
seg.ca = cp2 - p1;
seg.ba = cp1 - p1;

if (quad) {
qb = cubicToQuadratic(p1, cp1, cp2, p2);
a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]);
ii += 4;
} else {
ii++;
}

cp1 = m2;
}
seg = a[ii];
seg.b = cp1;
seg.c = cp1 + (seg.d - cp1) * 0.4; //instead of placing c on d exactly, we move it inline with b so that if the user specifies an ease like Back.easeOut or Elastic.easeOut which goes BEYOND the end, it will do so smoothly.
seg.da = seg.d - seg.a;
seg.ca = seg.c - seg.a;
seg.ba = cp1 - seg.a;
if (quad) {
qb = cubicToQuadratic(seg.a, cp1, seg.c, seg.d);
a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]);
}
},
_parseAnchors = function(values, p, correlate, prepend) {
var a = [],
l, i, p1, p2, p3, tmp;
if (prepend) {
values = [prepend].concat(values);
i = values.length;
while (--i > -1) {
if (typeof( (tmp = values[i][p]) ) === "string") if (tmp.charAt(1) === "=") {
values[i][p] = prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)); //accommodate relative values. Do it inline instead of breaking it out into a function for speed reasons
}
}
}
l = values.length - 2;
if (l < 0) {
a[0] = new Segment(values[0][p], 0, 0, values[(l < -1) ? 0 : 1][p]);
return a;
}
for (i = 0; i < l; i++) {
p1 = values[i][p];
p2 = values[i+1][p];
a[i] = new Segment(p1, 0, 0, p2);
if (correlate) {
p3 = values[i+2][p];
_r1[i] = (_r1[i] || 0) + (p2 - p1) * (p2 - p1);
_r2[i] = (_r2[i] || 0) + (p3 - p2) * (p3 - p2);
}
}
a[i] = new Segment(values[i][p], 0, 0, values[i+1][p]);
return a;
},
bezierThrough = function(values, curviness, quadratic, basic, correlate, prepend) {
var obj = {},
props = [],
first = prepend || values[0],
i, p, a, j, r, l, seamless, last;
correlate = (typeof(correlate) === "string") ? ","+correlate+"," : _correlate;
if (curviness == null) {
curviness = 1;
}
for (p in values[0]) {
props.push(p);
}
//check to see if the last and first values are identical (well, within 0.05). If so, make seamless by appending the second element to the very end of the values array and the 2nd-to-last element to the very beginning (we'll remove those segments later)
if (values.length > 1) {
last = values[values.length - 1];
seamless = true;
i = props.length;
while (--i > -1) {
p = props[i];
if (Math.abs(first[p] - last[p]) > 0.05) { //build in a tolerance of +/-0.05 to accommodate rounding errors. For example, if you set an object's position to 4.945, Flash will make it 4.9
seamless = false;
break;
}
}
if (seamless) {
values = values.concat(); //duplicate the array to avoid contaminating the original which the user may be reusing for other tweens
if (prepend) {
values.unshift(prepend);
}
values.push(values[1]);
prepend = values[values.length - 3];
}
}
_r1.length = _r2.length = _r3.length = 0;
i = props.length;
while (--i > -1) {
p = props[i];
_corProps[p] = (correlate.indexOf(","+p+",") !== -1);
obj[p] = _parseAnchors(values, p, _corProps[p], prepend);
}
i = _r1.length;
while (--i > -1) {
_r1[i] = Math.sqrt(_r1[i]);
_r2[i] = Math.sqrt(_r2[i]);
}
if (!basic) {
i = props.length;
while (--i > -1) {
if (_corProps[p]) {
a = obj[props[i]];
l = a.length - 1;
for (j = 0; j < l; j++) {
r = a[j+1].da / _r2[j] + a[j].da / _r1[j];
_r3[j] = (_r3[j] || 0) + r * r;
}
}
}
i = _r3.length;
while (--i > -1) {
_r3[i] = Math.sqrt(_r3[i]);
}
}
i = props.length;
j = quadratic ? 4 : 1;
while (--i > -1) {
p = props[i];
a = obj[p];
_calculateControlPoints(a, curviness, quadratic, basic, _corProps[p]); //this method requires that _parseAnchors() and _setSegmentRatios() ran first so that _r1, _r2, and _r3 values are populated for all properties
if (seamless) {
a.splice(0, j);
a.splice(a.length - j, j);
}
}
return obj;
},
_parseBezierData = function(values, type, prepend) {
type = type || "soft";
var obj = {},
inc = (type === "cubic") ? 3 : 2,
soft = (type === "soft"),
props = [],
a, b, c, d, cur, i, j, l, p, cnt, tmp;
if (soft && prepend) {
values = [prepend].concat(values);
}
if (values == null || values.length < inc + 1) { throw "invalid Bezier data"; }
for (p in values[0]) {
props.push(p);
}
i = props.length;
while (--i > -1) {
p = props[i];
obj[p] = cur = [];
cnt = 0;
l = values.length;
for (j = 0; j < l; j++) {
a = (prepend == null) ? values[j][p] : (typeof( (tmp = values[j][p]) ) === "string" && tmp.charAt(1) === "=") ? prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)) : Number(tmp);
if (soft) if (j > 1) if (j < l - 1) {
cur[cnt++] = (a + cur[cnt-2]) / 2;
}
cur[cnt++] = a;
}
l = cnt - inc + 1;
cnt = 0;
for (j = 0; j < l; j += inc) {
a = cur[j];
b = cur[j+1];
c = cur[j+2];
d = (inc === 2) ? 0 : cur[j+3];
cur[cnt++] = tmp = (inc === 3) ? new Segment(a, b, c, d) : new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
}
cur.length = cnt;
}
return obj;
},
_addCubicLengths = function(a, steps, resolution) {
var inc = 1 / resolution,
j = a.length,
d, d1, s, da, ca, ba, p, i, inv, bez, index;
while (--j > -1) {
bez = a[j];
s = bez.a;
da = bez.d - s;
ca = bez.c - s;
ba = bez.b - s;
d = d1 = 0;
for (i = 1; i <= resolution; i++) {
p = inc * i;
inv = 1 - p;
d = d1 - (d1 = (p * p * da + 3 * inv * (p * ca + inv * ba)) * p);
index = j * resolution + i - 1;
steps[index] = (steps[index] || 0) + d * d;
}
}
},
_parseLengthData = function(obj, resolution) {
resolution = resolution >> 0 || 6;
var a = [],
lengths = [],
d = 0,
total = 0,
threshold = resolution - 1,
segments = [],
curLS = [], //current length segments array
p, i, l, index;
for (p in obj) {
_addCubicLengths(obj[p], a, resolution);
}
l = a.length;
for (i = 0; i < l; i++) {
d += Math.sqrt(a[i]);
index = i % resolution;
curLS[index] = d;
if (index === threshold) {
total += d;
index = (i / resolution) >> 0;
segments[index] = curLS;
lengths[index] = total;
d = 0;
curLS = [];
}
}
return {length:total, lengths:lengths, segments:segments};
},



BezierPlugin = _gsScope._gsDefine.plugin({
propName: "bezier",
priority: -1,
version: "1.3.4",
API: 2,
global:true,

//gets called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
init: function(target, vars, tween) {
this._target = target;
if (vars instanceof Array) {
vars = {values:vars};
}
this._func = {};
this._round = {};
this._props = [];
this._timeRes = (vars.timeResolution == null) ? 6 : parseInt(vars.timeResolution, 10);
var values = vars.values || [],
first = {},
second = values[0],
autoRotate = vars.autoRotate || tween.vars.orientToBezier,
p, isFunc, i, j, prepend;

this._autoRotate = autoRotate ? (autoRotate instanceof Array) ? autoRotate : [["x","y","rotation",((autoRotate === true) ? 0 : Number(autoRotate) || 0)]] : null;
for (p in second) {
this._props.push(p);
}

i = this._props.length;
while (--i > -1) {
p = this._props[i];

this._overwriteProps.push(p);
isFunc = this._func[p] = (typeof(target[p]) === "function");
first[p] = (!isFunc) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
if (!prepend) if (first[p] !== values[0][p]) {
prepend = first;
}
}
this._beziers = (vars.type !== "cubic" && vars.type !== "quadratic" && vars.type !== "soft") ? bezierThrough(values, isNaN(vars.curviness) ? 1 : vars.curviness, false, (vars.type === "thruBasic"), vars.correlate, prepend) : _parseBezierData(values, vars.type, first);
this._segCount = this._beziers[p].length;

if (this._timeRes) {
var ld = _parseLengthData(this._beziers, this._timeRes);
this._length = ld.length;
this._lengths = ld.lengths;
this._segments = ld.segments;
this._l1 = this._li = this._s1 = this._si = 0;
this._l2 = this._lengths[0];
this._curSeg = this._segments[0];
this._s2 = this._curSeg[0];
this._prec = 1 / this._curSeg.length;
}

if ((autoRotate = this._autoRotate)) {
this._initialRotations = [];
if (!(autoRotate[0] instanceof Array)) {
this._autoRotate = autoRotate = [autoRotate];
}
i = autoRotate.length;
while (--i > -1) {
for (j = 0; j < 3; j++) {
p = autoRotate[i][j];
this._func[p] = (typeof(target[p]) === "function") ? target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ] : false;
}
p = autoRotate[i][2];
this._initialRotations[i] = this._func[p] ? this._func[p].call(this._target) : this._target[p];
}
}
this._startRatio = tween.vars.runBackwards ? 1 : 0; //we determine the starting ratio when the tween inits which is always 0 unless the tween has runBackwards:true (indicating it's a from() tween) in which case it's 1.
return true;
},

//called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
set: function(v) {
var segments = this._segCount,
func = this._func,
target = this._target,
notStart = (v !== this._startRatio),
curIndex, inv, i, p, b, t, val, l, lengths, curSeg;
if (!this._timeRes) {
curIndex = (v < 0) ? 0 : (v >= 1) ? segments - 1 : (segments * v) >> 0;
t = (v - (curIndex * (1 / segments))) * segments;
} else {
lengths = this._lengths;
curSeg = this._curSeg;
v *= this._length;
i = this._li;
//find the appropriate segment (if the currently cached one isn't correct)
if (v > this._l2 && i < segments - 1) {
l = segments - 1;
while (i < l && (this._l2 = lengths[++i]) <= v) {}
this._l1 = lengths[i-1];
this._li = i;
this._curSeg = curSeg = this._segments[i];
this._s2 = curSeg[(this._s1 = this._si = 0)];
} else if (v < this._l1 && i > 0) {
while (i > 0 && (this._l1 = lengths[--i]) >= v) { }
if (i === 0 && v < this._l1) {
this._l1 = 0;
} else {
i++;
}
this._l2 = lengths[i];
this._li = i;
this._curSeg = curSeg = this._segments[i];
this._s1 = curSeg[(this._si = curSeg.length - 1) - 1] || 0;
this._s2 = curSeg[this._si];
}
curIndex = i;
//now find the appropriate sub-segment (we split it into the number of pieces that was defined by "precision" and measured each one)
v -= this._l1;
i = this._si;
if (v > this._s2 && i < curSeg.length - 1) {
l = curSeg.length - 1;
while (i < l && (this._s2 = curSeg[++i]) <= v) {}
this._s1 = curSeg[i-1];
this._si = i;
} else if (v < this._s1 && i > 0) {
while (i > 0 && (this._s1 = curSeg[--i]) >= v) {}
if (i === 0 && v < this._s1) {
this._s1 = 0;
} else {
i++;
}
this._s2 = curSeg[i];
this._si = i;
}
t = (i + (v - this._s1) / (this._s2 - this._s1)) * this._prec;
}
inv = 1 - t;

i = this._props.length;
while (--i > -1) {
p = this._props[i];
b = this._beziers[p][curIndex];
val = (t * t * b.da + 3 * inv * (t * b.ca + inv * b.ba)) * t + b.a;
if (this._round[p]) {
val = Math.round(val);
}
if (func[p]) {
target[p](val);
} else {
target[p] = val;
}
}

if (this._autoRotate) {
var ar = this._autoRotate,
b2, x1, y1, x2, y2, add, conv;
i = ar.length;
while (--i > -1) {
p = ar[i][2];
add = ar[i][3] || 0;
conv = (ar[i][4] === true) ? 1 : _RAD2DEG;
b = this._beziers[ar[i][0]];
b2 = this._beziers[ar[i][1]];

if (b && b2) { //in case one of the properties got overwritten.
b = b[curIndex];
b2 = b2[curIndex];

x1 = b.a + (b.b - b.a) * t;
x2 = b.b + (b.c - b.b) * t;
x1 += (x2 - x1) * t;
x2 += ((b.c + (b.d - b.c) * t) - x2) * t;

y1 = b2.a + (b2.b - b2.a) * t;
y2 = b2.b + (b2.c - b2.b) * t;
y1 += (y2 - y1) * t;
y2 += ((b2.c + (b2.d - b2.c) * t) - y2) * t;

val = notStart ? Math.atan2(y2 - y1, x2 - x1) * conv + add : this._initialRotations[i];

if (func[p]) {
target[p](val);
} else {
target[p] = val;
}
}
}
}
}
}),
p = BezierPlugin.prototype;


BezierPlugin.bezierThrough = bezierThrough;
BezierPlugin.cubicToQuadratic = cubicToQuadratic;
BezierPlugin._autoCSS = true; //indicates that this plugin can be inserted into the "css" object using the autoCSS feature of TweenLite
BezierPlugin.quadraticToCubic = function(a, b, c) {
return new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
};

BezierPlugin._cssRegister = function() {
var CSSPlugin = _globals.CSSPlugin;
if (!CSSPlugin) {
return;
}
var _internals = CSSPlugin._internals,
_parseToProxy = _internals._parseToProxy,
_setPluginRatio = _internals._setPluginRatio,
CSSPropTween = _internals.CSSPropTween;
_internals._registerComplexSpecialProp("bezier", {parser:function(t, e, prop, cssp, pt, plugin) {
if (e instanceof Array) {
e = {values:e};
}
plugin = new BezierPlugin();
var values = e.values,
l = values.length - 1,
pluginValues = [],
v = {},
i, p, data;
if (l < 0) {
return pt;
}
for (i = 0; i <= l; i++) {
data = _parseToProxy(t, values[i], cssp, pt, plugin, (l !== i));
pluginValues[i] = data.end;
}
for (p in e) {
v[p] = e[p]; //duplicate the vars object because we need to alter some things which would cause problems if the user plans to reuse the same vars object for another tween.
}
v.values = pluginValues;
pt = new CSSPropTween(t, "bezier", 0, 0, data.pt, 2);
pt.data = data;
pt.plugin = plugin;
pt.setRatio = _setPluginRatio;
if (v.autoRotate === 0) {
v.autoRotate = true;
}
if (v.autoRotate && !(v.autoRotate instanceof Array)) {
i = (v.autoRotate === true) ? 0 : Number(v.autoRotate);
v.autoRotate = (data.end.left != null) ? [["left","top","rotation",i,false]] : (data.end.x != null) ? [["x","y","rotation",i,false]] : false;
}
if (v.autoRotate) {
if (!cssp._transform) {
cssp._enableTransforms(false);
}
data.autoRotate = cssp._target._gsTransform;
}
plugin._onInitTween(data.proxy, v, cssp._tween);
return pt;
}});
};

p._roundProps = function(lookup, value) {
var op = this._overwriteProps,
i = op.length;
while (--i > -1) {
if (lookup[op[i]] || lookup.bezier || lookup.bezierThrough) {
this._round[op[i]] = value;
}
}
};

p._kill = function(lookup) {
var a = this._props,
p, i;
for (p in this._beziers) {
if (p in lookup) {
delete this._beziers[p];
delete this._func[p];
i = a.length;
while (--i > -1) {
if (a[i] === p) {
a.splice(i, 1);
}
}
}
}
return this._super._kill.call(this, lookup);
};

}());














/*
 * ----------------------------------------------------------------
 * CSSPlugin
 * ----------------------------------------------------------------
 */
_gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin","TweenLite"], function(TweenPlugin, TweenLite) {

/** @constructor **/
var CSSPlugin = function() {
TweenPlugin.call(this, "css");
this._overwriteProps.length = 0;
this.setRatio = CSSPlugin.prototype.setRatio; //speed optimization (avoid prototype lookup on this "hot" method)
},
_globals = _gsScope._gsDefine.globals,
_hasPriority, //turns true whenever a CSSPropTween instance is created that has a priority other than 0. This helps us discern whether or not we should spend the time organizing the linked list or not after a CSSPlugin's _onInitTween() method is called.
_suffixMap, //we set this in _onInitTween() each time as a way to have a persistent variable we can use in other methods like _parse() without having to pass it around as a parameter and we keep _parse() decoupled from a particular CSSPlugin instance
_cs, //computed style (we store this in a shared variable to conserve memory and make minification tighter
_overwriteProps, //alias to the currently instantiating CSSPlugin's _overwriteProps array. We use this closure in order to avoid having to pass a reference around from method to method and aid in minification.
_specialProps = {},
p = CSSPlugin.prototype = new TweenPlugin("css");

p.constructor = CSSPlugin;
CSSPlugin.version = "1.17.0";
CSSPlugin.API = 2;
CSSPlugin.defaultTransformPerspective = 0;
CSSPlugin.defaultSkewType = "compensated";
CSSPlugin.defaultSmoothOrigin = true;
p = "px"; //we'll reuse the "p" variable to keep file size down
CSSPlugin.suffixMap = {top:p, right:p, bottom:p, left:p, width:p, height:p, fontSize:p, padding:p, margin:p, perspective:p, lineHeight:""};


var _numExp = /(?:\d|\-\d|\.\d|\-\.\d)+/g,
_relNumExp = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
_valuesExp = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi, //finds all the values that begin with numbers or += or -= and then a number. Includes suffixes. We use this to split complex values apart like "1px 5px 20px rgb(255,102,51)"
_NaNExp = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g, //also allows scientific notation and doesn't kill the leading -/+ in -= and +=
_suffixExp = /(?:\d|\-|\+|=|#|\.)*/g,
_opacityExp = /opacity *= *([^)]*)/i,
_opacityValExp = /opacity:([^;]*)/i,
_alphaFilterExp = /alpha\(opacity *=.+?\)/i,
_rgbhslExp = /^(rgb|hsl)/,
_capsExp = /([A-Z])/g,
_camelExp = /-([a-z])/gi,
_urlExp = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi, //for pulling out urls from url(...) or url("...") strings (some browsers wrap urls in quotes, some don't when reporting things like backgroundImage)
_camelFunc = function(s, g) { return g.toUpperCase(); },
_horizExp = /(?:Left|Right|Width)/i,
_ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
_ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
_commasOutsideParenExp = /,(?=[^\)]*(?:\(|$))/gi, //finds any commas that are not within parenthesis
_DEG2RAD = Math.PI / 180,
_RAD2DEG = 180 / Math.PI,
_forcePT = {},
_doc = document,
_createElement = function(type) {
return _doc.createElementNS ? _doc.createElementNS("http://www.w3.org/1999/xhtml", type) : _doc.createElement(type);
},
_tempDiv = _createElement("div"),
_tempImg = _createElement("img"),
_internals = CSSPlugin._internals = {_specialProps:_specialProps}, //provides a hook to a few internal methods that we need to access from inside other plugins
_agent = navigator.userAgent,
_autoRound,
_reqSafariFix, //we won't apply the Safari transform fix until we actually come across a tween that affects a transform property (to maintain best performance).

_isSafari,
_isFirefox, //Firefox has a bug that causes 3D transformed elements to randomly disappear unless a repaint is forced after each update on each element.
_isSafariLT6, //Safari (and Android 4 which uses a flavor of Safari) has a bug that prevents changes to "top" and "left" properties from rendering properly if changed on the same frame as a transform UNLESS we set the element's WebkitBackfaceVisibility to hidden (weird, I know). Doing this for Android 3 and earlier seems to actually cause other problems, though (fun!)
_ieVers,
_supportsOpacity = (function() { //we set _isSafari, _ieVers, _isFirefox, and _supportsOpacity all in one function here to reduce file size slightly, especially in the minified version.
var i = _agent.indexOf("Android"),
a = _createElement("a");
_isSafari = (_agent.indexOf("Safari") !== -1 && _agent.indexOf("Chrome") === -1 && (i === -1 || Number(_agent.substr(i+8, 1)) > 3));
_isSafariLT6 = (_isSafari && (Number(_agent.substr(_agent.indexOf("Version/")+8, 1)) < 6));
_isFirefox = (_agent.indexOf("Firefox") !== -1);
if ((/MSIE ([0-9]{1,}[\.0-9]{0,})/).exec(_agent) || (/Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/).exec(_agent)) {
_ieVers = parseFloat( RegExp.$1 );
}
if (!a) {
return false;
}
a.style.cssText = "top:1px;opacity:.55;";
return /^0.55/.test(a.style.opacity);
}()),
_getIEOpacity = function(v) {
return (_opacityExp.test( ((typeof(v) === "string") ? v : (v.currentStyle ? v.currentStyle.filter : v.style.filter) || "") ) ? ( parseFloat( RegExp.$1 ) / 100 ) : 1);
},
_log = function(s) {//for logging messages, but in a way that won't throw errors in old versions of IE.
if (window.console) {
console.log(s);
}
},

_prefixCSS = "", //the non-camelCase vendor prefix like "-o-", "-moz-", "-ms-", or "-webkit-"
_prefix = "", //camelCase vendor prefix like "O", "ms", "Webkit", or "Moz".

// @private feed in a camelCase property name like "transform" and it will check to see if it is valid as-is or if it needs a vendor prefix. It returns the corrected camelCase property name (i.e. "WebkitTransform" or "MozTransform" or "transform" or null if no such property is found, like if the browser is IE8 or before, "transform" won't be found at all)
_checkPropPrefix = function(p, e) {
e = e || _tempDiv;
var s = e.style,
a, i;
if (s[p] !== undefined) {
return p;
}
p = p.charAt(0).toUpperCase() + p.substr(1);
a = ["O","Moz","ms","Ms","Webkit"];
i = 5;
while (--i > -1 && s[a[i]+p] === undefined) { }
if (i >= 0) {
_prefix = (i === 3) ? "ms" : a[i];
_prefixCSS = "-" + _prefix.toLowerCase() + "-";
return _prefix + p;
}
return null;
},

_getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function() {},

/**
 * @private Returns the css style for a particular property of an element. For example, to get whatever the current "left" css value for an element with an ID of "myElement", you could do:
 * var currentLeft = CSSPlugin.getStyle( document.getElementById("myElement"), "left");
 *
 * @param {!Object} t Target element whose style property you want to query
 * @param {!string} p Property name (like "left" or "top" or "marginTop", etc.)
 * @param {Object=} cs Computed style object. This just provides a way to speed processing if you're going to get several properties on the same element in quick succession - you can reuse the result of the getComputedStyle() call.
 * @param {boolean=} calc If true, the value will not be read directly from the element's "style" property (if it exists there), but instead the getComputedStyle() result will be used. This can be useful when you want to ensure that the browser itself is interpreting the value.
 * @param {string=} dflt Default value that should be returned in the place of null, "none", "auto" or "auto auto".
 * @return {?string} The current property value
 */
_getStyle = CSSPlugin.getStyle = function(t, p, cs, calc, dflt) {
var rv;
if (!_supportsOpacity) if (p === "opacity") { //several versions of IE don't use the standard "opacity" property - they use things like filter:alpha(opacity=50), so we parse that here.
return _getIEOpacity(t);
}
if (!calc && t.style[p]) {
rv = t.style[p];
} else if ((cs = cs || _getComputedStyle(t))) {
rv = cs[p] || cs.getPropertyValue(p) || cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase());
} else if (t.currentStyle) {
rv = t.currentStyle[p];
}
return (dflt != null && (!rv || rv === "none" || rv === "auto" || rv === "auto auto")) ? dflt : rv;
},

/**
 * @private Pass the target element, the property name, the numeric value, and the suffix (like "%", "em", "px", etc.) and it will spit back the equivalent pixel number.
 * @param {!Object} t Target element
 * @param {!string} p Property name (like "left", "top", "marginLeft", etc.)
 * @param {!number} v Value
 * @param {string=} sfx Suffix (like "px" or "%" or "em")
 * @param {boolean=} recurse If true, the call is a recursive one. In some browsers (like IE7/8), occasionally the value isn't accurately reported initially, but if we run the function again it will take effect.
 * @return {number} value in pixels
 */
_convertToPixels = _internals.convertToPixels = function(t, p, v, sfx, recurse) {
if (sfx === "px" || !sfx) { return v; }
if (sfx === "auto" || !v) { return 0; }
var horiz = _horizExp.test(p),
node = t,
style = _tempDiv.style,
neg = (v < 0),
pix, cache, time;
if (neg) {
v = -v;
}
if (sfx === "%" && p.indexOf("border") !== -1) {
pix = (v / 100) * (horiz ? t.clientWidth : t.clientHeight);
} else {
style.cssText = "border:0 solid red;position:" + _getStyle(t, "position") + ";line-height:0;";
if (sfx === "%" || !node.appendChild) {
node = t.parentNode || _doc.body;
cache = node._gsCache;
time = TweenLite.ticker.frame;
if (cache && horiz && cache.time === time) { //performance optimization: we record the width of elements along with the ticker frame so that we can quickly get it again on the same tick (seems relatively safe to assume it wouldn't change on the same tick)
return cache.width * v / 100;
}
style[(horiz ? "width" : "height")] = v + sfx;
} else {
style[(horiz ? "borderLeftWidth" : "borderTopWidth")] = v + sfx;
}
node.appendChild(_tempDiv);
pix = parseFloat(_tempDiv[(horiz ? "offsetWidth" : "offsetHeight")]);
node.removeChild(_tempDiv);
if (horiz && sfx === "%" && CSSPlugin.cacheWidths !== false) {
cache = node._gsCache = node._gsCache || {};
cache.time = time;
cache.width = pix / v * 100;
}
if (pix === 0 && !recurse) {
pix = _convertToPixels(t, p, v, sfx, true);
}
}
return neg ? -pix : pix;
},
_calculateOffset = _internals.calculateOffset = function(t, p, cs) { //for figuring out "top" or "left" in px when it's "auto". We need to factor in margin with the offsetLeft/offsetTop
if (_getStyle(t, "position", cs) !== "absolute") { return 0; }
var dim = ((p === "left") ? "Left" : "Top"),
v = _getStyle(t, "margin" + dim, cs);
return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), v.replace(_suffixExp, "")) || 0);
},

// @private returns at object containing ALL of the style properties in camelCase and their associated values.
_getAllStyles = function(t, cs) {
var s = {},
i, tr, p;
if ((cs = cs || _getComputedStyle(t, null))) {
if ((i = cs.length)) {
while (--i > -1) {
p = cs[i];
if (p.indexOf("-transform") === -1 || _transformPropCSS === p) { //Some webkit browsers duplicate transform values, one non-prefixed and one prefixed ("transform" and "WebkitTransform"), so we must weed out the extra one here.
s[p.replace(_camelExp, _camelFunc)] = cs.getPropertyValue(p);
}
}
} else { //some browsers behave differently - cs.length is always 0, so we must do a for...in loop.
for (i in cs) {
if (i.indexOf("Transform") === -1 || _transformProp === i) { //Some webkit browsers duplicate transform values, one non-prefixed and one prefixed ("transform" and "WebkitTransform"), so we must weed out the extra one here.
s[i] = cs[i];
}
}
}
} else if ((cs = t.currentStyle || t.style)) {
for (i in cs) {
if (typeof(i) === "string" && s[i] === undefined) {
s[i.replace(_camelExp, _camelFunc)] = cs[i];
}
}
}
if (!_supportsOpacity) {
s.opacity = _getIEOpacity(t);
}
tr = _getTransform(t, cs, false);
s.rotation = tr.rotation;
s.skewX = tr.skewX;
s.scaleX = tr.scaleX;
s.scaleY = tr.scaleY;
s.x = tr.x;
s.y = tr.y;
if (_supports3D) {
s.z = tr.z;
s.rotationX = tr.rotationX;
s.rotationY = tr.rotationY;
s.scaleZ = tr.scaleZ;
}
if (s.filters) {
delete s.filters;
}
return s;
},

// @private analyzes two style objects (as returned by _getAllStyles()) and only looks for differences between them that contain tweenable values (like a number or color). It returns an object with a "difs" property which refers to an object containing only those isolated properties and values for tweening, and a "firstMPT" property which refers to the first MiniPropTween instance in a linked list that recorded all the starting values of the different properties so that we can revert to them at the end or beginning of the tween - we don't want the cascading to get messed up. The forceLookup parameter is an optional generic object with properties that should be forced into the results - this is necessary for className tweens that are overwriting others because imagine a scenario where a rollover/rollout adds/removes a class and the user swipes the mouse over the target SUPER fast, thus nothing actually changed yet and the subsequent comparison of the properties would indicate they match (especially when px rounding is taken into consideration), thus no tweening is necessary even though it SHOULD tween and remove those properties after the tween (otherwise the inline styles will contaminate things). See the className SpecialProp code for details.
_cssDif = function(t, s1, s2, vars, forceLookup) {
var difs = {},
style = t.style,
val, p, mpt;
for (p in s2) {
if (p !== "cssText") if (p !== "length") if (isNaN(p)) if (s1[p] !== (val = s2[p]) || (forceLookup && forceLookup[p])) if (p.indexOf("Origin") === -1) if (typeof(val) === "number" || typeof(val) === "string") {
difs[p] = (val === "auto" && (p === "left" || p === "top")) ? _calculateOffset(t, p) : ((val === "" || val === "auto" || val === "none") && typeof(s1[p]) === "string" && s1[p].replace(_NaNExp, "") !== "") ? 0 : val; //if the ending value is defaulting ("" or "auto"), we check the starting value and if it can be parsed into a number (a string which could have a suffix too, like 700px), then we swap in 0 for "" or "auto" so that things actually tween.
if (style[p] !== undefined) { //for className tweens, we must remember which properties already existed inline - the ones that didn't should be removed when the tween isn't in progress because they were only introduced to facilitate the transition between classes.
mpt = new MiniPropTween(style, p, style[p], mpt);
}
}
}
if (vars) {
for (p in vars) { //copy properties (except className)
if (p !== "className") {
difs[p] = vars[p];
}
}
}
return {difs:difs, firstMPT:mpt};
},
_dimensions = {width:["Left","Right"], height:["Top","Bottom"]},
_margins = ["marginLeft","marginRight","marginTop","marginBottom"],

/**
 * @private Gets the width or height of an element
 * @param {!Object} t Target element
 * @param {!string} p Property name ("width" or "height")
 * @param {Object=} cs Computed style object (if one exists). Just a speed optimization.
 * @return {number} Dimension (in pixels)
 */
_getDimension = function(t, p, cs) {
var v = parseFloat((p === "width") ? t.offsetWidth : t.offsetHeight),
a = _dimensions[p],
i = a.length;
cs = cs || _getComputedStyle(t, null);
while (--i > -1) {
v -= parseFloat( _getStyle(t, "padding" + a[i], cs, true) ) || 0;
v -= parseFloat( _getStyle(t, "border" + a[i] + "Width", cs, true) ) || 0;
}
return v;
},

// @private Parses position-related complex strings like "top left" or "50px 10px" or "70% 20%", etc. which are used for things like transformOrigin or backgroundPosition. Optionally decorates a supplied object (recObj) with the following properties: "ox" (offsetX), "oy" (offsetY), "oxp" (if true, "ox" is a percentage not a pixel value), and "oxy" (if true, "oy" is a percentage not a pixel value)
_parsePosition = function(v, recObj) {
if (v == null || v === "" || v === "auto" || v === "auto auto") { //note: Firefox uses "auto auto" as default whereas Chrome uses "auto".
v = "0 0";
}
var a = v.split(" "),
x = (v.indexOf("left") !== -1) ? "0%" : (v.indexOf("right") !== -1) ? "100%" : a[0],
y = (v.indexOf("top") !== -1) ? "0%" : (v.indexOf("bottom") !== -1) ? "100%" : a[1];
if (y == null) {
y = (x === "center") ? "50%" : "0";
} else if (y === "center") {
y = "50%";
}
if (x === "center" || (isNaN(parseFloat(x)) && (x + "").indexOf("=") === -1)) { //remember, the user could flip-flop the values and say "bottom center" or "center bottom", etc. "center" is ambiguous because it could be used to describe horizontal or vertical, hence the isNaN(). If there's an "=" sign in the value, it's relative.
x = "50%";
}
v = x + " " + y + ((a.length > 2) ? " " + a[2] : "");
if (recObj) {
recObj.oxp = (x.indexOf("%") !== -1);
recObj.oyp = (y.indexOf("%") !== -1);
recObj.oxr = (x.charAt(1) === "=");
recObj.oyr = (y.charAt(1) === "=");
recObj.ox = parseFloat(x.replace(_NaNExp, ""));
recObj.oy = parseFloat(y.replace(_NaNExp, ""));
recObj.v = v;
}
return recObj || v;
},

/**
 * @private Takes an ending value (typically a string, but can be a number) and a starting value and returns the change between the two, looking for relative value indicators like += and -= and it also ignores suffixes (but make sure the ending value starts with a number or +=/-= and that the starting value is a NUMBER!)
 * @param {(number|string)} e End value which is typically a string, but could be a number
 * @param {(number|string)} b Beginning value which is typically a string but could be a number
 * @return {number} Amount of change between the beginning and ending values (relative values that have a "+=" or "-=" are recognized)
 */
_parseChange = function(e, b) {
return (typeof(e) === "string" && e.charAt(1) === "=") ? parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2)) : parseFloat(e) - parseFloat(b);
},

/**
 * @private Takes a value and a default number, checks if the value is relative, null, or numeric and spits back a normalized number accordingly. Primarily used in the _parseTransform() function.
 * @param {Object} v Value to be parsed
 * @param {!number} d Default value (which is also used for relative calculations if "+=" or "-=" is found in the first parameter)
 * @return {number} Parsed value
 */
_parseVal = function(v, d) {
return (v == null) ? d : (typeof(v) === "string" && v.charAt(1) === "=") ? parseInt(v.charAt(0) + "1", 10) * parseFloat(v.substr(2)) + d : parseFloat(v);
},

/**
 * @private Translates strings like "40deg" or "40" or 40rad" or "+=40deg" or "270_short" or "-90_cw" or "+=45_ccw" to a numeric radian angle. Of course a starting/default value must be fed in too so that relative values can be calculated properly.
 * @param {Object} v Value to be parsed
 * @param {!number} d Default value (which is also used for relative calculations if "+=" or "-=" is found in the first parameter)
 * @param {string=} p property name for directionalEnd (optional - only used when the parsed value is directional ("_short", "_cw", or "_ccw" suffix). We need a way to store the uncompensated value so that at the end of the tween, we set it to exactly what was requested with no directional compensation). Property name would be "rotation", "rotationX", or "rotationY"
 * @param {Object=} directionalEnd An object that will store the raw end values for directional angles ("_short", "_cw", or "_ccw" suffix). We need a way to store the uncompensated value so that at the end of the tween, we set it to exactly what was requested with no directional compensation.
 * @return {number} parsed angle in radians
 */
_parseAngle = function(v, d, p, directionalEnd) {
var min = 0.000001,
cap, split, dif, result, isRelative;
if (v == null) {
result = d;
} else if (typeof(v) === "number") {
result = v;
} else {
cap = 360;
split = v.split("_");
isRelative = (v.charAt(1) === "=");
dif = (isRelative ? parseInt(v.charAt(0) + "1", 10) * parseFloat(split[0].substr(2)) : parseFloat(split[0])) * ((v.indexOf("rad") === -1) ? 1 : _RAD2DEG) - (isRelative ? 0 : d);
if (split.length) {
if (directionalEnd) {
directionalEnd[p] = d + dif;
}
if (v.indexOf("short") !== -1) {
dif = dif % cap;
if (dif !== dif % (cap / 2)) {
dif = (dif < 0) ? dif + cap : dif - cap;
}
}
if (v.indexOf("_cw") !== -1 && dif < 0) {
dif = ((dif + cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
} else if (v.indexOf("ccw") !== -1 && dif > 0) {
dif = ((dif - cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
}
}
result = d + dif;
}
if (result < min && result > -min) {
result = 0;
}
return result;
},

_colorLookup = {aqua:[0,255,255],
lime:[0,255,0],
silver:[192,192,192],
black:[0,0,0],
maroon:[128,0,0],
teal:[0,128,128],
blue:[0,0,255],
navy:[0,0,128],
white:[255,255,255],
fuchsia:[255,0,255],
olive:[128,128,0],
yellow:[255,255,0],
orange:[255,165,0],
gray:[128,128,128],
purple:[128,0,128],
green:[0,128,0],
red:[255,0,0],
pink:[255,192,203],
cyan:[0,255,255],
transparent:[255,255,255,0]},

_hue = function(h, m1, m2) {
h = (h < 0) ? h + 1 : (h > 1) ? h - 1 : h;
return ((((h * 6 < 1) ? m1 + (m2 - m1) * h * 6 : (h < 0.5) ? m2 : (h * 3 < 2) ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * 255) + 0.5) | 0;
},

/**
 * @private Parses a color (like #9F0, #FF9900, or rgb(255,51,153)) into an array with 3 elements for red, green, and blue. Also handles rgba() values (splits into array of 4 elements of course)
 * @param {(string|number)} v The value the should be parsed which could be a string like #9F0 or rgb(255,102,51) or rgba(255,0,0,0.5) or it could be a number like 0xFF00CC or even a named color like red, blue, purple, etc.
 * @return {Array.<number>} An array containing red, green, and blue (and optionally alpha) in that order.
 */
_parseColor = CSSPlugin.parseColor = function(v) {
var c1, c2, c3, h, s, l;
if (!v || v === "") {
return _colorLookup.black;
}
if (typeof(v) === "number") {
return [v >> 16, (v >> 8) & 255, v & 255];
}
if (v.charAt(v.length - 1) === ",") { //sometimes a trailing commma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
v = v.substr(0, v.length - 1);
}
if (_colorLookup[v]) {
return _colorLookup[v];
}
if (v.charAt(0) === "#") {
if (v.length === 4) { //for shorthand like #9F0
c1 = v.charAt(1),
c2 = v.charAt(2),
c3 = v.charAt(3);
v = "#" + c1 + c1 + c2 + c2 + c3 + c3;
}
v = parseInt(v.substr(1), 16);
return [v >> 16, (v >> 8) & 255, v & 255];
}
if (v.substr(0, 3) === "hsl") {
v = v.match(_numExp);
h = (Number(v[0]) % 360) / 360;
s = Number(v[1]) / 100;
l = Number(v[2]) / 100;
c2 = (l <= 0.5) ? l * (s + 1) : l + s - l * s;
c1 = l * 2 - c2;
if (v.length > 3) {
v[3] = Number(v[3]);
}
v[0] = _hue(h + 1 / 3, c1, c2);
v[1] = _hue(h, c1, c2);
v[2] = _hue(h - 1 / 3, c1, c2);
return v;
}
v = v.match(_numExp) || _colorLookup.transparent;
v[0] = Number(v[0]);
v[1] = Number(v[1]);
v[2] = Number(v[2]);
if (v.length > 3) {
v[3] = Number(v[3]);
}
return v;
},
_colorExp = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b"; //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.

for (p in _colorLookup) {
_colorExp += "|" + p + "\\b";
}
_colorExp = new RegExp(_colorExp+")", "gi");

/**
 * @private Returns a formatter function that handles taking a string (or number in some cases) and returning a consistently formatted one in terms of delimiters, quantity of values, etc. For example, we may get boxShadow values defined as "0px red" or "0px 0px 10px rgb(255,0,0)" or "0px 0px 20px 20px #F00" and we need to ensure that what we get back is described with 4 numbers and a color. This allows us to feed it into the _parseComplex() method and split the values up appropriately. The neat thing about this _getFormatter() function is that the dflt defines a pattern as well as a default, so for example, _getFormatter("0px 0px 0px 0px #777", true) not only sets the default as 0px for all distances and #777 for the color, but also sets the pattern such that 4 numbers and a color will always get returned.
 * @param {!string} dflt The default value and pattern to follow. So "0px 0px 0px 0px #777" will ensure that 4 numbers and a color will always get returned.
 * @param {boolean=} clr If true, the values should be searched for color-related data. For example, boxShadow values typically contain a color whereas borderRadius don't.
 * @param {boolean=} collapsible If true, the value is a top/left/right/bottom style one that acts like margin or padding, where if only one value is received, it's used for all 4; if 2 are received, the first is duplicated for 3rd (bottom) and the 2nd is duplicated for the 4th spot (left), etc.
 * @return {Function} formatter function
 */
var _getFormatter = function(dflt, clr, collapsible, multi) {
if (dflt == null) {
return function(v) {return v;};
}
var dColor = clr ? (dflt.match(_colorExp) || [""])[0] : "",
dVals = dflt.split(dColor).join("").match(_valuesExp) || [],
pfx = dflt.substr(0, dflt.indexOf(dVals[0])),
sfx = (dflt.charAt(dflt.length - 1) === ")") ? ")" : "",
delim = (dflt.indexOf(" ") !== -1) ? " " : ",",
numVals = dVals.length,
dSfx = (numVals > 0) ? dVals[0].replace(_numExp, "") : "",
formatter;
if (!numVals) {
return function(v) {return v;};
}
if (clr) {
formatter = function(v) {
var color, vals, i, a;
if (typeof(v) === "number") {
v += dSfx;
} else if (multi && _commasOutsideParenExp.test(v)) {
a = v.replace(_commasOutsideParenExp, "|").split("|");
for (i = 0; i < a.length; i++) {
a[i] = formatter(a[i]);
}
return a.join(",");
}
color = (v.match(_colorExp) || [dColor])[0];
vals = v.split(color).join("").match(_valuesExp) || [];
i = vals.length;
if (numVals > i--) {
while (++i < numVals) {
vals[i] = collapsible ? vals[(((i - 1) / 2) | 0)] : dVals[i];
}
}
return pfx + vals.join(delim) + delim + color + sfx + (v.indexOf("inset") !== -1 ? " inset" : "");
};
return formatter;

}
formatter = function(v) {
var vals, a, i;
if (typeof(v) === "number") {
v += dSfx;
} else if (multi && _commasOutsideParenExp.test(v)) {
a = v.replace(_commasOutsideParenExp, "|").split("|");
for (i = 0; i < a.length; i++) {
a[i] = formatter(a[i]);
}
return a.join(",");
}
vals = v.match(_valuesExp) || [];
i = vals.length;
if (numVals > i--) {
while (++i < numVals) {
vals[i] = collapsible ? vals[(((i - 1) / 2) | 0)] : dVals[i];
}
}
return pfx + vals.join(delim) + sfx;
};
return formatter;
},

/**
 * @private returns a formatter function that's used for edge-related values like marginTop, marginLeft, paddingBottom, paddingRight, etc. Just pass a comma-delimited list of property names related to the edges.
 * @param {!string} props a comma-delimited list of property names in order from top to left, like "marginTop,marginRight,marginBottom,marginLeft"
 * @return {Function} a formatter function
 */
_getEdgeParser = function(props) {
props = props.split(",");
return function(t, e, p, cssp, pt, plugin, vars) {
var a = (e + "").split(" "),
i;
vars = {};
for (i = 0; i < 4; i++) {
vars[props[i]] = a[i] = a[i] || a[(((i - 1) / 2) >> 0)];
}
return cssp.parse(t, vars, pt, plugin);
};
},

// @private used when other plugins must tween values first, like BezierPlugin or ThrowPropsPlugin, etc. That plugin's setRatio() gets called first so that the values are updated, and then we loop through the MiniPropTweens which handle copying the values into their appropriate slots so that they can then be applied correctly in the main CSSPlugin setRatio() method. Remember, we typically create a proxy object that has a bunch of uniquely-named properties that we feed to the sub-plugin and it does its magic normally, and then we must interpret those values and apply them to the css because often numbers must get combined/concatenated, suffixes added, etc. to work with css, like boxShadow could have 4 values plus a color.
_setPluginRatio = _internals._setPluginRatio = function(v) {
this.plugin.setRatio(v);
var d = this.data,
proxy = d.proxy,
mpt = d.firstMPT,
min = 0.000001,
val, pt, i, str;
while (mpt) {
val = proxy[mpt.v];
if (mpt.r) {
val = Math.round(val);
} else if (val < min && val > -min) {
val = 0;
}
mpt.t[mpt.p] = val;
mpt = mpt._next;
}
if (d.autoRotate) {
d.autoRotate.rotation = proxy.rotation;
}
//at the end, we must set the CSSPropTween's "e" (end) value dynamically here because that's what is used in the final setRatio() method.
if (v === 1) {
mpt = d.firstMPT;
while (mpt) {
pt = mpt.t;
if (!pt.type) {
pt.e = pt.s + pt.xs0;
} else if (pt.type === 1) {
str = pt.xs0 + pt.s + pt.xs1;
for (i = 1; i < pt.l; i++) {
str += pt["xn"+i] + pt["xs"+(i+1)];
}
pt.e = str;
}
mpt = mpt._next;
}
}
},

/**
 * @private @constructor Used by a few SpecialProps to hold important values for proxies. For example, _parseToProxy() creates a MiniPropTween instance for each property that must get tweened on the proxy, and we record the original property name as well as the unique one we create for the proxy, plus whether or not the value needs to be rounded plus the original value.
 * @param {!Object} t target object whose property we're tweening (often a CSSPropTween)
 * @param {!string} p property name
 * @param {(number|string|object)} v value
 * @param {MiniPropTween=} next next MiniPropTween in the linked list
 * @param {boolean=} r if true, the tweened value should be rounded to the nearest integer
 */
MiniPropTween = function(t, p, v, next, r) {
this.t = t;
this.p = p;
this.v = v;
this.r = r;
if (next) {
next._prev = this;
this._next = next;
}
},

/**
 * @private Most other plugins (like BezierPlugin and ThrowPropsPlugin and others) can only tween numeric values, but CSSPlugin must accommodate special values that have a bunch of extra data (like a suffix or strings between numeric values, etc.). For example, boxShadow has values like "10px 10px 20px 30px rgb(255,0,0)" which would utterly confuse other plugins. This method allows us to split that data apart and grab only the numeric data and attach it to uniquely-named properties of a generic proxy object ({}) so that we can feed that to virtually any plugin to have the numbers tweened. However, we must also keep track of which properties from the proxy go with which CSSPropTween values and instances. So we create a linked list of MiniPropTweens. Each one records a target (the original CSSPropTween), property (like "s" or "xn1" or "xn2") that we're tweening and the unique property name that was used for the proxy (like "boxShadow_xn1" and "boxShadow_xn2") and whether or not they need to be rounded. That way, in the _setPluginRatio() method we can simply copy the values over from the proxy to the CSSPropTween instance(s). Then, when the main CSSPlugin setRatio() method runs and applies the CSSPropTween values accordingly, they're updated nicely. So the external plugin tweens the numbers, _setPluginRatio() copies them over, and setRatio() acts normally, applying css-specific values to the element.
 * This method returns an object that has the following properties:
 * - proxy: a generic object containing the starting values for all the properties that will be tweened by the external plugin. This is what we feed to the external _onInitTween() as the target
 * - end: a generic object containing the ending values for all the properties that will be tweened by the external plugin. This is what we feed to the external plugin's _onInitTween() as the destination values
 * - firstMPT: the first MiniPropTween in the linked list
 * - pt: the first CSSPropTween in the linked list that was created when parsing. If shallow is true, this linked list will NOT attach to the one passed into the _parseToProxy() as the "pt" (4th) parameter.
 * @param {!Object} t target object to be tweened
 * @param {!(Object|string)} vars the object containing the information about the tweening values (typically the end/destination values) that should be parsed
 * @param {!CSSPlugin} cssp The CSSPlugin instance
 * @param {CSSPropTween=} pt the next CSSPropTween in the linked list
 * @param {TweenPlugin=} plugin the external TweenPlugin instance that will be handling tweening the numeric values
 * @param {boolean=} shallow if true, the resulting linked list from the parse will NOT be attached to the CSSPropTween that was passed in as the "pt" (4th) parameter.
 * @return An object containing the following properties: proxy, end, firstMPT, and pt (see above for descriptions)
 */
_parseToProxy = _internals._parseToProxy = function(t, vars, cssp, pt, plugin, shallow) {
var bpt = pt,
start = {},
end = {},
transform = cssp._transform,
oldForce = _forcePT,
i, p, xp, mpt, firstPT;
cssp._transform = null;
_forcePT = vars;
pt = firstPT = cssp.parse(t, vars, pt, plugin);
_forcePT = oldForce;
//break off from the linked list so the new ones are isolated.
if (shallow) {
cssp._transform = transform;
if (bpt) {
bpt._prev = null;
if (bpt._prev) {
bpt._prev._next = null;
}
}
}
while (pt && pt !== bpt) {
if (pt.type <= 1) {
p = pt.p;
end[p] = pt.s + pt.c;
start[p] = pt.s;
if (!shallow) {
mpt = new MiniPropTween(pt, "s", p, mpt, pt.r);
pt.c = 0;
}
if (pt.type === 1) {
i = pt.l;
while (--i > 0) {
xp = "xn" + i;
p = pt.p + "_" + xp;
end[p] = pt.data[xp];
start[p] = pt[xp];
if (!shallow) {
mpt = new MiniPropTween(pt, xp, p, mpt, pt.rxp[xp]);
}
}
}
}
pt = pt._next;
}
return {proxy:start, end:end, firstMPT:mpt, pt:firstPT};
},



/**
 * @constructor Each property that is tweened has at least one CSSPropTween associated with it. These instances store important information like the target, property, starting value, amount of change, etc. They can also optionally have a number of "extra" strings and numeric values named xs1, xn1, xs2, xn2, xs3, xn3, etc. where "s" indicates string and "n" indicates number. These can be pieced together in a complex-value tween (type:1) that has alternating types of data like a string, number, string, number, etc. For example, boxShadow could be "5px 5px 8px rgb(102, 102, 51)". In that value, there are 6 numbers that may need to tween and then pieced back together into a string again with spaces, suffixes, etc. xs0 is special in that it stores the suffix for standard (type:0) tweens, -OR- the first string (prefix) in a complex-value (type:1) CSSPropTween -OR- it can be the non-tweening value in a type:-1 CSSPropTween. We do this to conserve memory.
 * CSSPropTweens have the following optional properties as well (not defined through the constructor):
 * - l: Length in terms of the number of extra properties that the CSSPropTween has (default: 0). For example, for a boxShadow we may need to tween 5 numbers in which case l would be 5; Keep in mind that the start/end values for the first number that's tweened are always stored in the s and c properties to conserve memory. All additional values thereafter are stored in xn1, xn2, etc.
 * - xfirst: The first instance of any sub-CSSPropTweens that are tweening properties of this instance. For example, we may split up a boxShadow tween so that there's a main CSSPropTween of type:1 that has various xs* and xn* values associated with the h-shadow, v-shadow, blur, color, etc. Then we spawn a CSSPropTween for each of those that has a higher priority and runs BEFORE the main CSSPropTween so that the values are all set by the time it needs to re-assemble them. The xfirst gives us an easy way to identify the first one in that chain which typically ends at the main one (because they're all prepende to the linked list)
 * - plugin: The TweenPlugin instance that will handle the tweening of any complex values. For example, sometimes we don't want to use normal subtweens (like xfirst refers to) to tween the values - we might want ThrowPropsPlugin or BezierPlugin some other plugin to do the actual tweening, so we create a plugin instance and store a reference here. We need this reference so that if we get a request to round values or disable a tween, we can pass along that request.
 * - data: Arbitrary data that needs to be stored with the CSSPropTween. Typically if we're going to have a plugin handle the tweening of a complex-value tween, we create a generic object that stores the END values that we're tweening to and the CSSPropTween's xs1, xs2, etc. have the starting values. We store that object as data. That way, we can simply pass that object to the plugin and use the CSSPropTween as the target.
 * - setRatio: Only used for type:2 tweens that require custom functionality. In this case, we call the CSSPropTween's setRatio() method and pass the ratio each time the tween updates. This isn't quite as efficient as doing things directly in the CSSPlugin's setRatio() method, but it's very convenient and flexible.
 * @param {!Object} t Target object whose property will be tweened. Often a DOM element, but not always. It could be anything.
 * @param {string} p Property to tween (name). For example, to tween element.width, p would be "width".
 * @param {number} s Starting numeric value
 * @param {number} c Change in numeric value over the course of the entire tween. For example, if element.width starts at 5 and should end at 100, c would be 95.
 * @param {CSSPropTween=} next The next CSSPropTween in the linked list. If one is defined, we will define its _prev as the new instance, and the new instance's _next will be pointed at it.
 * @param {number=} type The type of CSSPropTween where -1 = a non-tweening value, 0 = a standard simple tween, 1 = a complex value (like one that has multiple numbers in a comma- or space-delimited string like border:"1px solid red"), and 2 = one that uses a custom setRatio function that does all of the work of applying the values on each update.
 * @param {string=} n Name of the property that should be used for overwriting purposes which is typically the same as p but not always. For example, we may need to create a subtween for the 2nd part of a "clip:rect(...)" tween in which case "p" might be xs1 but "n" is still "clip"
 * @param {boolean=} r If true, the value(s) should be rounded
 * @param {number=} pr Priority in the linked list order. Higher priority CSSPropTweens will be updated before lower priority ones. The default priority is 0.
 * @param {string=} b Beginning value. We store this to ensure that it is EXACTLY what it was when the tween began without any risk of interpretation issues.
 * @param {string=} e Ending value. We store this to ensure that it is EXACTLY what the user defined at the end of the tween without any risk of interpretation issues.
 */
CSSPropTween = _internals.CSSPropTween = function(t, p, s, c, next, type, n, r, pr, b, e) {
this.t = t; //target
this.p = p; //property
this.s = s; //starting value
this.c = c; //change value
this.n = n || p; //name that this CSSPropTween should be associated to (usually the same as p, but not always - n is what overwriting looks at)
if (!(t instanceof CSSPropTween)) {
_overwriteProps.push(this.n);
}
this.r = r; //round (boolean)
this.type = type || 0; //0 = normal tween, -1 = non-tweening (in which case xs0 will be applied to the target's property, like tp.t[tp.p] = tp.xs0), 1 = complex-value SpecialProp, 2 = custom setRatio() that does all the work
if (pr) {
this.pr = pr;
_hasPriority = true;
}
this.b = (b === undefined) ? s : b;
this.e = (e === undefined) ? s + c : e;
if (next) {
this._next = next;
next._prev = this;
}
},

_addNonTweeningNumericPT = function(target, prop, start, end, next, overwriteProp) { //cleans up some code redundancies and helps minification. Just a fast way to add a NUMERIC non-tweening CSSPropTween
var pt = new CSSPropTween(target, prop, start, end - start, next, -1, overwriteProp);
pt.b = start;
pt.e = pt.xs0 = end;
return pt;
},

/**
 * Takes a target, the beginning value and ending value (as strings) and parses them into a CSSPropTween (possibly with child CSSPropTweens) that accommodates multiple numbers, colors, comma-delimited values, etc. For example:
 * sp.parseComplex(element, "boxShadow", "5px 10px 20px rgb(255,102,51)", "0px 0px 0px red", true, "0px 0px 0px rgb(0,0,0,0)", pt);
 * It will walk through the beginning and ending values (which should be in the same format with the same number and type of values) and figure out which parts are numbers, what strings separate the numeric/tweenable values, and then create the CSSPropTweens accordingly. If a plugin is defined, no child CSSPropTweens will be created. Instead, the ending values will be stored in the "data" property of the returned CSSPropTween like: {s:-5, xn1:-10, xn2:-20, xn3:255, xn4:0, xn5:0} so that it can be fed to any other plugin and it'll be plain numeric tweens but the recomposition of the complex value will be handled inside CSSPlugin's setRatio().
 * If a setRatio is defined, the type of the CSSPropTween will be set to 2 and recomposition of the values will be the responsibility of that method.
 *
 * @param {!Object} t Target whose property will be tweened
 * @param {!string} p Property that will be tweened (its name, like "left" or "backgroundColor" or "boxShadow")
 * @param {string} b Beginning value
 * @param {string} e Ending value
 * @param {boolean} clrs If true, the value could contain a color value like "rgb(255,0,0)" or "#F00" or "red". The default is false, so no colors will be recognized (a performance optimization)
 * @param {(string|number|Object)} dflt The default beginning value that should be used if no valid beginning value is defined or if the number of values inside the complex beginning and ending values don't match
 * @param {?CSSPropTween} pt CSSPropTween instance that is the current head of the linked list (we'll prepend to this).
 * @param {number=} pr Priority in the linked list order. Higher priority properties will be updated before lower priority ones. The default priority is 0.
 * @param {TweenPlugin=} plugin If a plugin should handle the tweening of extra properties, pass the plugin instance here. If one is defined, then NO subtweens will be created for any extra properties (the properties will be created - just not additional CSSPropTween instances to tween them) because the plugin is expected to do so. However, the end values WILL be populated in the "data" property, like {s:100, xn1:50, xn2:300}
 * @param {function(number)=} setRatio If values should be set in a custom function instead of being pieced together in a type:1 (complex-value) CSSPropTween, define that custom function here.
 * @return {CSSPropTween} The first CSSPropTween in the linked list which includes the new one(s) added by the parseComplex() call.
 */
_parseComplex = CSSPlugin.parseComplex = function(t, p, b, e, clrs, dflt, pt, pr, plugin, setRatio) {
//DEBUG: _log("parseComplex: "+p+", b: "+b+", e: "+e);
b = b || dflt || "";
pt = new CSSPropTween(t, p, 0, 0, pt, (setRatio ? 2 : 1), null, false, pr, b, e);
e += ""; //ensures it's a string
var ba = b.split(", ").join(",").split(" "), //beginning array
ea = e.split(", ").join(",").split(" "), //ending array
l = ba.length,
autoRound = (_autoRound !== false),
i, xi, ni, bv, ev, bnums, enums, bn, rgba, temp, cv, str;
if (e.indexOf(",") !== -1 || b.indexOf(",") !== -1) {
ba = ba.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
ea = ea.join(" ").replace(_commasOutsideParenExp, ", ").split(" ");
l = ba.length;
}
if (l !== ea.length) {
//DEBUG: _log("mismatched formatting detected on " + p + " (" + b + " vs " + e + ")");
ba = (dflt || "").split(" ");
l = ba.length;
}
pt.plugin = plugin;
pt.setRatio = setRatio;
for (i = 0; i < l; i++) {
bv = ba[i];
ev = ea[i];
bn = parseFloat(bv);
//if the value begins with a number (most common). It's fine if it has a suffix like px
if (bn || bn === 0) {
pt.appendXtra("", bn, _parseChange(ev, bn), ev.replace(_relNumExp, ""), (autoRound && ev.indexOf("px") !== -1), true);

//if the value is a color
} else if (clrs && (bv.charAt(0) === "#" || _colorLookup[bv] || _rgbhslExp.test(bv))) {
str = ev.charAt(ev.length - 1) === "," ? ")," : ")"; //if there's a comma at the end, retain it.
bv = _parseColor(bv);
ev = _parseColor(ev);
rgba = (bv.length + ev.length > 6);
if (rgba && !_supportsOpacity && ev[3] === 0) { //older versions of IE don't support rgba(), so if the destination alpha is 0, just use "transparent" for the end color
pt["xs" + pt.l] += pt.l ? " transparent" : "transparent";
pt.e = pt.e.split(ea[i]).join("transparent");
} else {
if (!_supportsOpacity) { //old versions of IE don't support rgba().
rgba = false;
}
pt.appendXtra((rgba ? "rgba(" : "rgb("), bv[0], ev[0] - bv[0], ",", true, true)
.appendXtra("", bv[1], ev[1] - bv[1], ",", true)
.appendXtra("", bv[2], ev[2] - bv[2], (rgba ? "," : str), true);
if (rgba) {
bv = (bv.length < 4) ? 1 : bv[3];
pt.appendXtra("", bv, ((ev.length < 4) ? 1 : ev[3]) - bv, str, false);
}
}

} else {
bnums = bv.match(_numExp); //gets each group of numbers in the beginning value string and drops them into an array

//if no number is found, treat it as a non-tweening value and just append the string to the current xs.
if (!bnums) {
pt["xs" + pt.l] += pt.l ? " " + bv : bv;

//loop through all the numbers that are found and construct the extra values on the pt.
} else {
enums = ev.match(_relNumExp); //get each group of numbers in the end value string and drop them into an array. We allow relative values too, like +=50 or -=.5
if (!enums || enums.length !== bnums.length) {
//DEBUG: _log("mismatched formatting detected on " + p + " (" + b + " vs " + e + ")");
return pt;
}
ni = 0;
for (xi = 0; xi < bnums.length; xi++) {
cv = bnums[xi];
temp = bv.indexOf(cv, ni);
pt.appendXtra(bv.substr(ni, temp - ni), Number(cv), _parseChange(enums[xi], cv), "", (autoRound && bv.substr(temp + cv.length, 2) === "px"), (xi === 0));
ni = temp + cv.length;
}
pt["xs" + pt.l] += bv.substr(ni);
}
}
}
//if there are relative values ("+=" or "-=" prefix), we need to adjust the ending value to eliminate the prefixes and combine the values properly.
if (e.indexOf("=") !== -1) if (pt.data) {
str = pt.xs0 + pt.data.s;
for (i = 1; i < pt.l; i++) {
str += pt["xs" + i] + pt.data["xn" + i];
}
pt.e = str + pt["xs" + i];
}
if (!pt.l) {
pt.type = -1;
pt.xs0 = pt.e;
}
return pt.xfirst || pt;
},
i = 9;


p = CSSPropTween.prototype;
p.l = p.pr = 0; //length (number of extra properties like xn1, xn2, xn3, etc.
while (--i > 0) {
p["xn" + i] = 0;
p["xs" + i] = "";
}
p.xs0 = "";
p._next = p._prev = p.xfirst = p.data = p.plugin = p.setRatio = p.rxp = null;


/**
 * Appends and extra tweening value to a CSSPropTween and automatically manages any prefix and suffix strings. The first extra value is stored in the s and c of the main CSSPropTween instance, but thereafter any extras are stored in the xn1, xn2, xn3, etc. The prefixes and suffixes are stored in the xs0, xs1, xs2, etc. properties. For example, if I walk through a clip value like "rect(10px, 5px, 0px, 20px)", the values would be stored like this:
 * xs0:"rect(", s:10, xs1:"px, ", xn1:5, xs2:"px, ", xn2:0, xs3:"px, ", xn3:20, xn4:"px)"
 * And they'd all get joined together when the CSSPlugin renders (in the setRatio() method).
 * @param {string=} pfx Prefix (if any)
 * @param {!number} s Starting value
 * @param {!number} c Change in numeric value over the course of the entire tween. For example, if the start is 5 and the end is 100, the change would be 95.
 * @param {string=} sfx Suffix (if any)
 * @param {boolean=} r Round (if true).
 * @param {boolean=} pad If true, this extra value should be separated by the previous one by a space. If there is no previous extra and pad is true, it will automatically drop the space.
 * @return {CSSPropTween} returns itself so that multiple methods can be chained together.
 */
p.appendXtra = function(pfx, s, c, sfx, r, pad) {
var pt = this,
l = pt.l;
pt["xs" + l] += (pad && l) ? " " + pfx : pfx || "";
if (!c) if (l !== 0 && !pt.plugin) { //typically we'll combine non-changing values right into the xs to optimize performance, but we don't combine them when there's a plugin that will be tweening the values because it may depend on the values being split apart, like for a bezier, if a value doesn't change between the first and second iteration but then it does on the 3rd, we'll run into trouble because there's no xn slot for that value!
pt["xs" + l] += s + (sfx || "");
return pt;
}
pt.l++;
pt.type = pt.setRatio ? 2 : 1;
pt["xs" + pt.l] = sfx || "";
if (l > 0) {
pt.data["xn" + l] = s + c;
pt.rxp["xn" + l] = r; //round extra property (we need to tap into this in the _parseToProxy() method)
pt["xn" + l] = s;
if (!pt.plugin) {
pt.xfirst = new CSSPropTween(pt, "xn" + l, s, c, pt.xfirst || pt, 0, pt.n, r, pt.pr);
pt.xfirst.xs0 = 0; //just to ensure that the property stays numeric which helps modern browsers speed up processing. Remember, in the setRatio() method, we do pt.t[pt.p] = val + pt.xs0 so if pt.xs0 is "" (the default), it'll cast the end value as a string. When a property is a number sometimes and a string sometimes, it prevents the compiler from locking in the data type, slowing things down slightly.
}
return pt;
}
pt.data = {s:s + c};
pt.rxp = {};
pt.s = s;
pt.c = c;
pt.r = r;
return pt;
};

/**
 * @constructor A SpecialProp is basically a css property that needs to be treated in a non-standard way, like if it may contain a complex value like boxShadow:"5px 10px 15px rgb(255, 102, 51)" or if it is associated with another plugin like ThrowPropsPlugin or BezierPlugin. Every SpecialProp is associated with a particular property name like "boxShadow" or "throwProps" or "bezier" and it will intercept those values in the vars object that's passed to the CSSPlugin and handle them accordingly.
 * @param {!string} p Property name (like "boxShadow" or "throwProps")
 * @param {Object=} options An object containing any of the following configuration options:
 * - defaultValue: the default value
 * - parser: A function that should be called when the associated property name is found in the vars. This function should return a CSSPropTween instance and it should ensure that it is properly inserted into the linked list. It will receive 4 paramters: 1) The target, 2) The value defined in the vars, 3) The CSSPlugin instance (whose _firstPT should be used for the linked list), and 4) A computed style object if one was calculated (this is a speed optimization that allows retrieval of starting values quicker)
 * - formatter: a function that formats any value received for this special property (for example, boxShadow could take "5px 5px red" and format it to "5px 5px 0px 0px red" so that both the beginning and ending values have a common order and quantity of values.)
 * - prefix: if true, we'll determine whether or not this property requires a vendor prefix (like Webkit or Moz or ms or O)
 * - color: set this to true if the value for this SpecialProp may contain color-related values like rgb(), rgba(), etc.
 * - priority: priority in the linked list order. Higher priority SpecialProps will be updated before lower priority ones. The default priority is 0.
 * - multi: if true, the formatter should accommodate a comma-delimited list of values, like boxShadow could have multiple boxShadows listed out.
 * - collapsible: if true, the formatter should treat the value like it's a top/right/bottom/left value that could be collapsed, like "5px" would apply to all, "5px, 10px" would use 5px for top/bottom and 10px for right/left, etc.
 * - keyword: a special keyword that can [optionally] be found inside the value (like "inset" for boxShadow). This allows us to validate beginning/ending values to make sure they match (if the keyword is found in one, it'll be added to the other for consistency by default).
 */
var SpecialProp = function(p, options) {
options = options || {};
this.p = options.prefix ? _checkPropPrefix(p) || p : p;
_specialProps[p] = _specialProps[this.p] = this;
this.format = options.formatter || _getFormatter(options.defaultValue, options.color, options.collapsible, options.multi);
if (options.parser) {
this.parse = options.parser;
}
this.clrs = options.color;
this.multi = options.multi;
this.keyword = options.keyword;
this.dflt = options.defaultValue;
this.pr = options.priority || 0;
},

//shortcut for creating a new SpecialProp that can accept multiple properties as a comma-delimited list (helps minification). dflt can be an array for multiple values (we don't do a comma-delimited list because the default value may contain commas, like rect(0px,0px,0px,0px)). We attach this method to the SpecialProp class/object instead of using a private _createSpecialProp() method so that we can tap into it externally if necessary, like from another plugin.
_registerComplexSpecialProp = _internals._registerComplexSpecialProp = function(p, options, defaults) {
if (typeof(options) !== "object") {
options = {parser:defaults}; //to make backwards compatible with older versions of BezierPlugin and ThrowPropsPlugin
}
var a = p.split(","),
d = options.defaultValue,
i, temp;
defaults = defaults || [d];
for (i = 0; i < a.length; i++) {
options.prefix = (i === 0 && options.prefix);
options.defaultValue = defaults[i] || d;
temp = new SpecialProp(a[i], options);
}
},

//creates a placeholder special prop for a plugin so that the property gets caught the first time a tween of it is attempted, and at that time it makes the plugin register itself, thus taking over for all future tweens of that property. This allows us to not mandate that things load in a particular order and it also allows us to log() an error that informs the user when they attempt to tween an external plugin-related property without loading its .js file.
_registerPluginProp = function(p) {
if (!_specialProps[p]) {
var pluginName = p.charAt(0).toUpperCase() + p.substr(1) + "Plugin";
_registerComplexSpecialProp(p, {parser:function(t, e, p, cssp, pt, plugin, vars) {
var pluginClass = _globals.com.greensock.plugins[pluginName];
if (!pluginClass) {
_log("Error: " + pluginName + " js file not loaded.");
return pt;
}
pluginClass._cssRegister();
return _specialProps[p].parse(t, e, p, cssp, pt, plugin, vars);
}});
}
};


p = SpecialProp.prototype;

/**
 * Alias for _parseComplex() that automatically plugs in certain values for this SpecialProp, like its property name, whether or not colors should be sensed, the default value, and priority. It also looks for any keyword that the SpecialProp defines (like "inset" for boxShadow) and ensures that the beginning and ending values have the same number of values for SpecialProps where multi is true (like boxShadow and textShadow can have a comma-delimited list)
 * @param {!Object} t target element
 * @param {(string|number|object)} b beginning value
 * @param {(string|number|object)} e ending (destination) value
 * @param {CSSPropTween=} pt next CSSPropTween in the linked list
 * @param {TweenPlugin=} plugin If another plugin will be tweening the complex value, that TweenPlugin instance goes here.
 * @param {function=} setRatio If a custom setRatio() method should be used to handle this complex value, that goes here.
 * @return {CSSPropTween=} First CSSPropTween in the linked list
 */
p.parseComplex = function(t, b, e, pt, plugin, setRatio) {
var kwd = this.keyword,
i, ba, ea, l, bi, ei;
//if this SpecialProp's value can contain a comma-delimited list of values (like boxShadow or textShadow), we must parse them in a special way, and look for a keyword (like "inset" for boxShadow) and ensure that the beginning and ending BOTH have it if the end defines it as such. We also must ensure that there are an equal number of values specified (we can't tween 1 boxShadow to 3 for example)
if (this.multi) if (_commasOutsideParenExp.test(e) || _commasOutsideParenExp.test(b)) {
ba = b.replace(_commasOutsideParenExp, "|").split("|");
ea = e.replace(_commasOutsideParenExp, "|").split("|");
} else if (kwd) {
ba = [b];
ea = [e];
}
if (ea) {
l = (ea.length > ba.length) ? ea.length : ba.length;
for (i = 0; i < l; i++) {
b = ba[i] = ba[i] || this.dflt;
e = ea[i] = ea[i] || this.dflt;
if (kwd) {
bi = b.indexOf(kwd);
ei = e.indexOf(kwd);
if (bi !== ei) {
if (ei === -1) { //if the keyword isn't in the end value, remove it from the beginning one.
ba[i] = ba[i].split(kwd).join("");
} else if (bi === -1) { //if the keyword isn't in the beginning, add it.
ba[i] += " " + kwd;
}
}
}
}
b = ba.join(", ");
e = ea.join(", ");
}
return _parseComplex(t, this.p, b, e, this.clrs, this.dflt, pt, this.pr, plugin, setRatio);
};

/**
 * Accepts a target and end value and spits back a CSSPropTween that has been inserted into the CSSPlugin's linked list and conforms with all the conventions we use internally, like type:-1, 0, 1, or 2, setting up any extra property tweens, priority, etc. For example, if we have a boxShadow SpecialProp and call:
 * this._firstPT = sp.parse(element, "5px 10px 20px rgb(2550,102,51)", "boxShadow", this);
 * It should figure out the starting value of the element's boxShadow, compare it to the provided end value and create all the necessary CSSPropTweens of the appropriate types to tween the boxShadow. The CSSPropTween that gets spit back should already be inserted into the linked list (the 4th parameter is the current head, so prepend to that).
 * @param {!Object} t Target object whose property is being tweened
 * @param {Object} e End value as provided in the vars object (typically a string, but not always - like a throwProps would be an object).
 * @param {!string} p Property name
 * @param {!CSSPlugin} cssp The CSSPlugin instance that should be associated with this tween.
 * @param {?CSSPropTween} pt The CSSPropTween that is the current head of the linked list (we'll prepend to it)
 * @param {TweenPlugin=} plugin If a plugin will be used to tween the parsed value, this is the plugin instance.
 * @param {Object=} vars Original vars object that contains the data for parsing.
 * @return {CSSPropTween} The first CSSPropTween in the linked list which includes the new one(s) added by the parse() call.
 */
p.parse = function(t, e, p, cssp, pt, plugin, vars) {
return this.parseComplex(t.style, this.format(_getStyle(t, this.p, _cs, false, this.dflt)), this.format(e), pt, plugin);
};

/**
 * Registers a special property that should be intercepted from any "css" objects defined in tweens. This allows you to handle them however you want without CSSPlugin doing it for you. The 2nd parameter should be a function that accepts 3 parameters:
 * 1) Target object whose property should be tweened (typically a DOM element)
 * 2) The end/destination value (could be a string, number, object, or whatever you want)
 * 3) The tween instance (you probably don't need to worry about this, but it can be useful for looking up information like the duration)
 *
 * Then, your function should return a function which will be called each time the tween gets rendered, passing a numeric "ratio" parameter to your function that indicates the change factor (usually between 0 and 1). For example:
 *
 * CSSPlugin.registerSpecialProp("myCustomProp", function(target, value, tween) {
 * var start = target.style.width;
 * return function(ratio) {
 * target.style.width = (start + value * ratio) + "px";
 * console.log("set width to " + target.style.width);
 * }
 * }, 0);
 *
 * Then, when I do this tween, it will trigger my special property:
 *
 * TweenLite.to(element, 1, {css:{myCustomProp:100}});
 *
 * In the example, of course, we're just changing the width, but you can do anything you want.
 *
 * @param {!string} name Property name (or comma-delimited list of property names) that should be intercepted and handled by your function. For example, if I define "myCustomProp", then it would handle that portion of the following tween: TweenLite.to(element, 1, {css:{myCustomProp:100}})
 * @param {!function(Object, Object, Object, string):function(number)} onInitTween The function that will be called when a tween of this special property is performed. The function will receive 4 parameters: 1) Target object that should be tweened, 2) Value that was passed to the tween, 3) The tween instance itself (rarely used), and 4) The property name that's being tweened. Your function should return a function that should be called on every update of the tween. That function will receive a single parameter that is a "change factor" value (typically between 0 and 1) indicating the amount of change as a ratio. You can use this to determine how to set the values appropriately in your function.
 * @param {number=} priority Priority that helps the engine determine the order in which to set the properties (default: 0). Higher priority properties will be updated before lower priority ones.
 */
CSSPlugin.registerSpecialProp = function(name, onInitTween, priority) {
_registerComplexSpecialProp(name, {parser:function(t, e, p, cssp, pt, plugin, vars) {
var rv = new CSSPropTween(t, p, 0, 0, pt, 2, p, false, priority);
rv.plugin = plugin;
rv.setRatio = onInitTween(t, e, cssp._tween, p);
return rv;
}, priority:priority});
};






//transform-related methods and properties
CSSPlugin.useSVGTransformAttr = _isSafari || _isFirefox; //Safari and Firefox both have some rendering bugs when applying CSS transforms to SVG elements, so default to using the "transform" attribute instead (users can override this).
var _transformProps = ("scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent").split(","),
_transformProp = _checkPropPrefix("transform"), //the Javascript (camelCase) transform property, like msTransform, WebkitTransform, MozTransform, or OTransform.
_transformPropCSS = _prefixCSS + "transform",
_transformOriginProp = _checkPropPrefix("transformOrigin"),
_supports3D = (_checkPropPrefix("perspective") !== null),
Transform = _internals.Transform = function() {
this.perspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0;
this.force3D = (CSSPlugin.defaultForce3D === false || !_supports3D) ? false : CSSPlugin.defaultForce3D || "auto";
},
_SVGElement = window.SVGElement,
_useSVGTransformAttr,
//Some browsers (like Firefox and IE) don't honor transform-origin properly in SVG elements, so we need to manually adjust the matrix accordingly. We feature detect here rather than always doing the conversion for certain browsers because they may fix the problem at some point in the future.

_createSVG = function(type, container, attributes) {
var element = _doc.createElementNS("http://www.w3.org/2000/svg", type),
reg = /([a-z])([A-Z])/g,
p;
for (p in attributes) {
element.setAttributeNS(null, p.replace(reg, "$1-$2").toLowerCase(), attributes[p]);
}
container.appendChild(element);
return element;
},
_docElement = _doc.documentElement,
_forceSVGTransformAttr = (function() {
//IE and Android stock don't support CSS transforms on SVG elements, so we must write them to the "transform" attribute. We populate this variable in the _parseTransform() method, and only if/when we come across an SVG element
var force = _ieVers || (/Android/i.test(_agent) && !window.chrome),
svg, rect, width;
if (_doc.createElementNS && !force) { //IE8 and earlier doesn't support SVG anyway
svg = _createSVG("svg", _docElement);
rect = _createSVG("rect", svg, {width:100, height:50, x:100});
width = rect.getBoundingClientRect().width;
rect.style[_transformOriginProp] = "50% 50%";
rect.style[_transformProp] = "scaleX(0.5)";
force = (width === rect.getBoundingClientRect().width && !(_isFirefox && _supports3D)); //note: Firefox fails the test even though it does support CSS transforms in 3D. Since we can't push 3D stuff into the transform attribute, we force Firefox to pass the test here (as long as it does truly support 3D).
_docElement.removeChild(svg);
}
return force;
})(),
_parseSVGOrigin = function(e, local, decoratee, absolute, smoothOrigin) {
var tm = e._gsTransform,
m = _getMatrix(e, true),
v, x, y, xOrigin, yOrigin, a, b, c, d, tx, ty, determinant, xOriginOld, yOriginOld;
if (tm) {
xOriginOld = tm.xOrigin; //record the original values before we alter them.
yOriginOld = tm.yOrigin;
}
if (!absolute || (v = absolute.split(" ")).length < 2) {
b = e.getBBox();
local = _parsePosition(local).split(" ");
v = [(local[0].indexOf("%") !== -1 ? parseFloat(local[0]) / 100 * b.width : parseFloat(local[0])) + b.x,
 (local[1].indexOf("%") !== -1 ? parseFloat(local[1]) / 100 * b.height : parseFloat(local[1])) + b.y];
}
decoratee.xOrigin = xOrigin = parseFloat(v[0]);
decoratee.yOrigin = yOrigin = parseFloat(v[1]);
if (absolute && m !== _identity2DMatrix) { //if svgOrigin is being set, we must invert the matrix and determine where the absolute point is, factoring in the current transforms. Otherwise, the svgOrigin would be based on the element's non-transformed position on the canvas.
a = m[0];
b = m[1];
c = m[2];
d = m[3];
tx = m[4];
ty = m[5];
determinant = (a * d - b * c);
x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + ((c * ty - d * tx) / determinant);
y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - ((a * ty - b * tx) / determinant);
xOrigin = decoratee.xOrigin = v[0] = x;
yOrigin = decoratee.yOrigin = v[1] = y;
}
if (tm) { //avoid jump when transformOrigin is changed - adjust the x/y values accordingly
if (smoothOrigin || (smoothOrigin !== false && CSSPlugin.defaultSmoothOrigin !== false)) {
x = xOrigin - xOriginOld;
y = yOrigin - yOriginOld;
//originally, we simply adjusted the x and y values, but that would cause problems if, for example, you created a rotational tween part-way through an x/y tween. Managing the offset in a separate variable gives us ultimate flexibility.
//tm.x -= x - (x * m[0] + y * m[2]);
//tm.y -= y - (x * m[1] + y * m[3]);
tm.xOffset += (x * m[0] + y * m[2]) - x;
tm.yOffset += (x * m[1] + y * m[3]) - y;
} else {
tm.xOffset = tm.yOffset = 0;
}
}
e.setAttribute("data-svg-origin", v.join(" "));
},
_isSVG = function(e) {
return !!(_SVGElement && typeof(e.getBBox) === "function" && e.getCTM && (!e.parentNode || (e.parentNode.getBBox && e.parentNode.getCTM)));
},
_identity2DMatrix = [1,0,0,1,0,0],
_getMatrix = function(e, force2D) {
var tm = e._gsTransform || new Transform(),
rnd = 100000,
isDefault, s, m, n, dec;
if (_transformProp) {
s = _getStyle(e, _transformPropCSS, null, true);
} else if (e.currentStyle) {
//for older versions of IE, we need to interpret the filter portion that is in the format: progid:DXImageTransform.Microsoft.Matrix(M11=6.123233995736766e-17, M12=-1, M21=1, M22=6.123233995736766e-17, sizingMethod='auto expand') Notice that we need to swap b and c compared to a normal matrix.
s = e.currentStyle.filter.match(_ieGetMatrixExp);
s = (s && s.length === 4) ? [s[0].substr(4), Number(s[2].substr(4)), Number(s[1].substr(4)), s[3].substr(4), (tm.x || 0), (tm.y || 0)].join(",") : "";
}
isDefault = (!s || s === "none" || s === "matrix(1, 0, 0, 1, 0, 0)");
if (tm.svg || (e.getBBox && _isSVG(e))) {
if (isDefault && (e.style[_transformProp] + "").indexOf("matrix") !== -1) { //some browsers (like Chrome 40) don't correctly report transforms that are applied inline on an SVG element (they don't get included in the computed style), so we double-check here and accept matrix values
s = e.style[_transformProp];
isDefault = 0;
}
m = e.getAttribute("transform");
if (isDefault && m) {
if (m.indexOf("matrix") !== -1) { //just in case there's a "transform" value specified as an attribute instead of CSS style. Accept either a matrix() or simple translate() value though.
s = m;
isDefault = 0;
} else if (m.indexOf("translate") !== -1) {
s = "matrix(1,0,0,1," + m.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",") + ")";
isDefault = 0;
}
}
}
if (isDefault) {
return _identity2DMatrix;
}
//split the matrix values out into an array (m for matrix)
m = (s || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [];
i = m.length;
while (--i > -1) {
n = Number(m[i]);
m[i] = (dec = n - (n |= 0)) ? ((dec * rnd + (dec < 0 ? -0.5 : 0.5)) | 0) / rnd + n : n; //convert strings to Numbers and round to 5 decimal places to avoid issues with tiny numbers. Roughly 20x faster than Number.toFixed(). We also must make sure to round before dividing so that values like 0.9999999999 become 1 to avoid glitches in browser rendering and interpretation of flipped/rotated 3D matrices. And don't just multiply the number by rnd, floor it, and then divide by rnd because the bitwise operations max out at a 32-bit signed integer, thus it could get clipped at a relatively low value (like 22,000.00000 for example).
}
return (force2D && m.length > 6) ? [m[0], m[1], m[4], m[5], m[12], m[13]] : m;
},

/**
 * Parses the transform values for an element, returning an object with x, y, z, scaleX, scaleY, scaleZ, rotation, rotationX, rotationY, skewX, and skewY properties. Note: by default (for performance reasons), all skewing is combined into skewX and rotation but skewY still has a place in the transform object so that we can record how much of the skew is attributed to skewX vs skewY. Remember, a skewY of 10 looks the same as a rotation of 10 and skewX of -10.
 * @param {!Object} t target element
 * @param {Object=} cs computed style object (optional)
 * @param {boolean=} rec if true, the transform values will be recorded to the target element's _gsTransform object, like target._gsTransform = {x:0, y:0, z:0, scaleX:1...}
 * @param {boolean=} parse if true, we'll ignore any _gsTransform values that already exist on the element, and force a reparsing of the css (calculated style)
 * @return {object} object containing all of the transform properties/values like {x:0, y:0, z:0, scaleX:1...}
 */
_getTransform = _internals.getTransform = function(t, cs, rec, parse) {
if (t._gsTransform && rec && !parse) {
return t._gsTransform; //if the element already has a _gsTransform, use that. Note: some browsers don't accurately return the calculated style for the transform (particularly for SVG), so it's almost always safest to just use the values we've already applied rather than re-parsing things.
}
var tm = rec ? t._gsTransform || new Transform() : new Transform(),
invX = (tm.scaleX < 0), //in order to interpret things properly, we need to know if the user applied a negative scaleX previously so that we can adjust the rotation and skewX accordingly. Otherwise, if we always interpret a flipped matrix as affecting scaleY and the user only wants to tween the scaleX on multiple sequential tweens, it would keep the negative scaleY without that being the user's intent.
min = 0.00002,
rnd = 100000,
zOrigin = _supports3D ? parseFloat(_getStyle(t, _transformOriginProp, cs, false, "0 0 0").split(" ")[2]) || tm.zOrigin || 0 : 0,
defaultTransformPerspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0,
m, i, scaleX, scaleY, rotation, skewX;

tm.svg = !!(t.getBBox && _isSVG(t));
if (tm.svg) {
_parseSVGOrigin(t, _getStyle(t, _transformOriginProp, _cs, false, "50% 50%") + "", tm, t.getAttribute("data-svg-origin"));
_useSVGTransformAttr = CSSPlugin.useSVGTransformAttr || _forceSVGTransformAttr;
}
m = _getMatrix(t);
if (m !== _identity2DMatrix) {

if (m.length === 16) {
//we'll only look at these position-related 6 variables first because if x/y/z all match, it's relatively safe to assume we don't need to re-parse everything which risks losing important rotational information (like rotationX:180 plus rotationY:180 would look the same as rotation:180 - there's no way to know for sure which direction was taken based solely on the matrix3d() values)
var a11 = m[0], a21 = m[1], a31 = m[2], a41 = m[3],
a12 = m[4], a22 = m[5], a32 = m[6], a42 = m[7],
a13 = m[8], a23 = m[9], a33 = m[10],
a14 = m[12], a24 = m[13], a34 = m[14],
a43 = m[11],
angle = Math.atan2(a32, a33),
t1, t2, t3, t4, cos, sin;

//we manually compensate for non-zero z component of transformOrigin to work around bugs in Safari
if (tm.zOrigin) {
a34 = -tm.zOrigin;
a14 = a13*a34-m[12];
a24 = a23*a34-m[13];
a34 = a33*a34+tm.zOrigin-m[14];
}
tm.rotationX = angle * _RAD2DEG;
//rotationX
if (angle) {
cos = Math.cos(-angle);
sin = Math.sin(-angle);
t1 = a12*cos+a13*sin;
t2 = a22*cos+a23*sin;
t3 = a32*cos+a33*sin;
a13 = a12*-sin+a13*cos;
a23 = a22*-sin+a23*cos;
a33 = a32*-sin+a33*cos;
a43 = a42*-sin+a43*cos;
a12 = t1;
a22 = t2;
a32 = t3;
}
//rotationY
angle = Math.atan2(a13, a33);
tm.rotationY = angle * _RAD2DEG;
if (angle) {
cos = Math.cos(-angle);
sin = Math.sin(-angle);
t1 = a11*cos-a13*sin;
t2 = a21*cos-a23*sin;
t3 = a31*cos-a33*sin;
a23 = a21*sin+a23*cos;
a33 = a31*sin+a33*cos;
a43 = a41*sin+a43*cos;
a11 = t1;
a21 = t2;
a31 = t3;
}
//rotationZ
angle = Math.atan2(a21, a11);
tm.rotation = angle * _RAD2DEG;
if (angle) {
cos = Math.cos(-angle);
sin = Math.sin(-angle);
a11 = a11*cos+a12*sin;
t2 = a21*cos+a22*sin;
a22 = a21*-sin+a22*cos;
a32 = a31*-sin+a32*cos;
a21 = t2;
}

if (tm.rotationX && Math.abs(tm.rotationX) + Math.abs(tm.rotation) > 359.9) { //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
tm.rotationX = tm.rotation = 0;
tm.rotationY += 180;
}

tm.scaleX = ((Math.sqrt(a11 * a11 + a21 * a21) * rnd + 0.5) | 0) / rnd;
tm.scaleY = ((Math.sqrt(a22 * a22 + a23 * a23) * rnd + 0.5) | 0) / rnd;
tm.scaleZ = ((Math.sqrt(a32 * a32 + a33 * a33) * rnd + 0.5) | 0) / rnd;
tm.skewX = 0;
tm.perspective = a43 ? 1 / ((a43 < 0) ? -a43 : a43) : 0;
tm.x = a14;
tm.y = a24;
tm.z = a34;
if (tm.svg) {
tm.x -= tm.xOrigin - (tm.xOrigin * a11 - tm.yOrigin * a12);
tm.y -= tm.yOrigin - (tm.yOrigin * a21 - tm.xOrigin * a22);
}

} else if ((!_supports3D || parse || !m.length || tm.x !== m[4] || tm.y !== m[5] || (!tm.rotationX && !tm.rotationY)) && !(tm.x !== undefined && _getStyle(t, "display", cs) === "none")) { //sometimes a 6-element matrix is returned even when we performed 3D transforms, like if rotationX and rotationY are 180. In cases like this, we still need to honor the 3D transforms. If we just rely on the 2D info, it could affect how the data is interpreted, like scaleY might get set to -1 or rotation could get offset by 180 degrees. For example, do a TweenLite.to(element, 1, {css:{rotationX:180, rotationY:180}}) and then later, TweenLite.to(element, 1, {css:{rotationX:0}}) and without this conditional logic in place, it'd jump to a state of being unrotated when the 2nd tween starts. Then again, we need to honor the fact that the user COULD alter the transforms outside of CSSPlugin, like by manually applying new css, so we try to sense that by looking at x and y because if those changed, we know the changes were made outside CSSPlugin and we force a reinterpretation of the matrix values. Also, in Webkit browsers, if the element's "display" is "none", its calculated style value will always return empty, so if we've already recorded the values in the _gsTransform object, we'll just rely on those.
var k = (m.length >= 6),
a = k ? m[0] : 1,
b = m[1] || 0,
c = m[2] || 0,
d = k ? m[3] : 1;
tm.x = m[4] || 0;
tm.y = m[5] || 0;
scaleX = Math.sqrt(a * a + b * b);
scaleY = Math.sqrt(d * d + c * c);
rotation = (a || b) ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).
skewX = (c || d) ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0;
if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
if (invX) {
scaleX *= -1;
skewX += (rotation <= 0) ? 180 : -180;
rotation += (rotation <= 0) ? 180 : -180;
} else {
scaleY *= -1;
skewX += (skewX <= 0) ? 180 : -180;
}
}
tm.scaleX = scaleX;
tm.scaleY = scaleY;
tm.rotation = rotation;
tm.skewX = skewX;
if (_supports3D) {
tm.rotationX = tm.rotationY = tm.z = 0;
tm.perspective = defaultTransformPerspective;
tm.scaleZ = 1;
}
if (tm.svg) {
tm.x -= tm.xOrigin - (tm.xOrigin * a + tm.yOrigin * c);
tm.y -= tm.yOrigin - (tm.xOrigin * b + tm.yOrigin * d);
}
}
tm.zOrigin = zOrigin;
//some browsers have a hard time with very small values like 2.4492935982947064e-16 (notice the "e-" towards the end) and would render the object slightly off. So we round to 0 in these cases. The conditional logic here is faster than calling Math.abs(). Also, browsers tend to render a SLIGHTLY rotated object in a fuzzy way, so we need to snap to exactly 0 when appropriate.
for (i in tm) {
if (tm[i] < min) if (tm[i] > -min) {
tm[i] = 0;
}
}
}
//DEBUG: _log("parsed rotation of " + t.getAttribute("id")+": "+(tm.rotationX)+", "+(tm.rotationY)+", "+(tm.rotation)+", scale: "+tm.scaleX+", "+tm.scaleY+", "+tm.scaleZ+", position: "+tm.x+", "+tm.y+", "+tm.z+", perspective: "+tm.perspective+ ", origin: "+ tm.xOrigin+ ","+ tm.yOrigin);
if (rec) {
t._gsTransform = tm; //record to the object's _gsTransform which we use so that tweens can control individual properties independently (we need all the properties to accurately recompose the matrix in the setRatio() method)
if (tm.svg) { //if we're supposed to apply transforms to the SVG element's "transform" attribute, make sure there aren't any CSS transforms applied or they'll override the attribute ones. Also clear the transform attribute if we're using CSS, just to be clean.
if (_useSVGTransformAttr && t.style[_transformProp]) {
TweenLite.delayedCall(0.001, function(){ //if we apply this right away (before anything has rendered), we risk there being no transforms for a brief moment and it also interferes with adjusting the transformOrigin in a tween with immediateRender:true (it'd try reading the matrix and it wouldn't have the appropriate data in place because we just removed it).
_removeProp(t.style, _transformProp);
});
} else if (!_useSVGTransformAttr && t.getAttribute("transform")) {
TweenLite.delayedCall(0.001, function(){
t.removeAttribute("transform");
});
}
}
}
return tm;
},

//for setting 2D transforms in IE6, IE7, and IE8 (must use a "filter" to emulate the behavior of modern day browser transforms)
_setIETransformRatio = function(v) {
var t = this.data, //refers to the element's _gsTransform object
ang = -t.rotation * _DEG2RAD,
skew = ang + t.skewX * _DEG2RAD,
rnd = 100000,
a = ((Math.cos(ang) * t.scaleX * rnd) | 0) / rnd,
b = ((Math.sin(ang) * t.scaleX * rnd) | 0) / rnd,
c = ((Math.sin(skew) * -t.scaleY * rnd) | 0) / rnd,
d = ((Math.cos(skew) * t.scaleY * rnd) | 0) / rnd,
style = this.t.style,
cs = this.t.currentStyle,
filters, val;
if (!cs) {
return;
}
val = b; //just for swapping the variables an inverting them (reused "val" to avoid creating another variable in memory). IE's filter matrix uses a non-standard matrix configuration (angle goes the opposite way, and b and c are reversed and inverted)
b = -c;
c = -val;
filters = cs.filter;
style.filter = ""; //remove filters so that we can accurately measure offsetWidth/offsetHeight
var w = this.t.offsetWidth,
h = this.t.offsetHeight,
clip = (cs.position !== "absolute"),
m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d,
ox = t.x + (w * t.xPercent / 100),
oy = t.y + (h * t.yPercent / 100),
dx, dy;

//if transformOrigin is being used, adjust the offset x and y
if (t.ox != null) {
dx = ((t.oxp) ? w * t.ox * 0.01 : t.ox) - w / 2;
dy = ((t.oyp) ? h * t.oy * 0.01 : t.oy) - h / 2;
ox += dx - (dx * a + dy * b);
oy += dy - (dx * c + dy * d);
}

if (!clip) {
m += ", sizingMethod='auto expand')";
} else {
dx = (w / 2);
dy = (h / 2);
//translate to ensure that transformations occur around the correct origin (default is center).
m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")";
}
if (filters.indexOf("DXImageTransform.Microsoft.Matrix(") !== -1) {
style.filter = filters.replace(_ieSetMatrixExp, m);
} else {
style.filter = m + " " + filters; //we must always put the transform/matrix FIRST (before alpha(opacity=xx)) to avoid an IE bug that slices part of the object when rotation is applied with alpha.
}

//at the end or beginning of the tween, if the matrix is normal (1, 0, 0, 1) and opacity is 100 (or doesn't exist), remove the filter to improve browser performance.
if (v === 0 || v === 1) if (a === 1) if (b === 0) if (c === 0) if (d === 1) if (!clip || m.indexOf("Dx=0, Dy=0") !== -1) if (!_opacityExp.test(filters) || parseFloat(RegExp.$1) === 100) if (filters.indexOf("gradient(" && filters.indexOf("Alpha")) === -1) {
style.removeAttribute("filter");
}

//we must set the margins AFTER applying the filter in order to avoid some bugs in IE8 that could (in rare scenarios) cause them to be ignored intermittently (vibration).
if (!clip) {
var mult = (_ieVers < 8) ? 1 : -1, //in Internet Explorer 7 and before, the box model is broken, causing the browser to treat the width/height of the actual rotated filtered image as the width/height of the box itself, but Microsoft corrected that in IE8. We must use a negative offset in IE8 on the right/bottom
marg, prop, dif;
dx = t.ieOffsetX || 0;
dy = t.ieOffsetY || 0;
t.ieOffsetX = Math.round((w - ((a < 0 ? -a : a) * w + (b < 0 ? -b : b) * h)) / 2 + ox);
t.ieOffsetY = Math.round((h - ((d < 0 ? -d : d) * h + (c < 0 ? -c : c) * w)) / 2 + oy);
for (i = 0; i < 4; i++) {
prop = _margins[i];
marg = cs[prop];
//we need to get the current margin in case it is being tweened separately (we want to respect that tween's changes)
val = (marg.indexOf("px") !== -1) ? parseFloat(marg) : _convertToPixels(this.t, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0;
if (val !== t[prop]) {
dif = (i < 2) ? -t.ieOffsetX : -t.ieOffsetY; //if another tween is controlling a margin, we cannot only apply the difference in the ieOffsets, so we essentially zero-out the dx and dy here in that case. We record the margin(s) later so that we can keep comparing them, making this code very flexible.
} else {
dif = (i < 2) ? dx - t.ieOffsetX : dy - t.ieOffsetY;
}
style[prop] = (t[prop] = Math.round( val - dif * ((i === 0 || i === 2) ? 1 : mult) )) + "px";
}
}
},

/* translates a super small decimal to a string WITHOUT scientific notation
_safeDecimal = function(n) {
var s = (n < 0 ? -n : n) + "",
a = s.split("e-");
return (n < 0 ? "-0." : "0.") + new Array(parseInt(a[1], 10) || 0).join("0") + a[0].split(".").join("");
},
*/

_setTransformRatio = _internals.set3DTransformRatio = _internals.setTransformRatio = function(v) {
var t = this.data, //refers to the element's _gsTransform object
style = this.t.style,
angle = t.rotation,
rotationX = t.rotationX,
rotationY = t.rotationY,
sx = t.scaleX,
sy = t.scaleY,
sz = t.scaleZ,
x = t.x,
y = t.y,
z = t.z,
isSVG = t.svg,
perspective = t.perspective,
force3D = t.force3D,
a11, a12, a13, a21, a22, a23, a31, a32, a33, a41, a42, a43,
zOrigin, min, cos, sin, t1, t2, transform, comma, zero, skew, rnd;
//check to see if we should render as 2D (and SVGs must use 2D when _useSVGTransformAttr is true)
if (((((v === 1 || v === 0) && force3D === "auto" && (this.tween._totalTime === this.tween._totalDuration || !this.tween._totalTime)) || !force3D) && !z && !perspective && !rotationY && !rotationX) || (_useSVGTransformAttr && isSVG) || !_supports3D) { //on the final render (which could be 0 for a from tween), if there are no 3D aspects, render in 2D to free up memory and improve performance especially on mobile devices. Check the tween's totalTime/totalDuration too in order to make sure it doesn't happen between repeats if it's a repeating tween.

//2D
if (angle || t.skewX || isSVG) {
angle *= _DEG2RAD;
skew = t.skewX * _DEG2RAD;
rnd = 100000;
a11 = Math.cos(angle) * sx;
a21 = Math.sin(angle) * sx;
a12 = Math.sin(angle - skew) * -sy;
a22 = Math.cos(angle - skew) * sy;
if (skew && t.skewType === "simple") { //by default, we compensate skewing on the other axis to make it look more natural, but you can set the skewType to "simple" to use the uncompensated skewing that CSS does
t1 = Math.tan(skew);
t1 = Math.sqrt(1 + t1 * t1);
a12 *= t1;
a22 *= t1;
if (t.skewY) {
a11 *= t1;
a21 *= t1;
}
}
if (isSVG) {
x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset;
y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset;
if (_useSVGTransformAttr && (t.xPercent || t.yPercent)) { //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the matrix to simulate it.
min = this.t.getBBox();
x += t.xPercent * 0.01 * min.width;
y += t.yPercent * 0.01 * min.height;
}
min = 0.000001;
if (x < min) if (x > -min) {
x = 0;
}
if (y < min) if (y > -min) {
y = 0;
}
}
transform = (((a11 * rnd) | 0) / rnd) + "," + (((a21 * rnd) | 0) / rnd) + "," + (((a12 * rnd) | 0) / rnd) + "," + (((a22 * rnd) | 0) / rnd) + "," + x + "," + y + ")";
if (isSVG && _useSVGTransformAttr) {
this.t.setAttribute("transform", "matrix(" + transform);
} else {
//some browsers have a hard time with very small values like 2.4492935982947064e-16 (notice the "e-" towards the end) and would render the object slightly off. So we round to 5 decimal places.
style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + transform;
}
} else {
style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + sx + ",0,0," + sy + "," + x + "," + y + ")";
}
return;

}
if (_isFirefox) { //Firefox has a bug (at least in v25) that causes it to render the transparent part of 32-bit PNG images as black when displayed inside an iframe and the 3D scale is very small and doesn't change sufficiently enough between renders (like if you use a Power4.easeInOut to scale from 0 to 1 where the beginning values only change a tiny amount to begin the tween before accelerating). In this case, we force the scale to be 0.00002 instead which is visually the same but works around the Firefox issue.
min = 0.0001;
if (sx < min && sx > -min) {
sx = sz = 0.00002;
}
if (sy < min && sy > -min) {
sy = sz = 0.00002;
}
if (perspective && !t.z && !t.rotationX && !t.rotationY) { //Firefox has a bug that causes elements to have an odd super-thin, broken/dotted black border on elements that have a perspective set but aren't utilizing 3D space (no rotationX, rotationY, or z).
perspective = 0;
}
}
if (angle || t.skewX) {
angle *= _DEG2RAD;
cos = a11 = Math.cos(angle);
sin = a21 = Math.sin(angle);
if (t.skewX) {
angle -= t.skewX * _DEG2RAD;
cos = Math.cos(angle);
sin = Math.sin(angle);
if (t.skewType === "simple") { //by default, we compensate skewing on the other axis to make it look more natural, but you can set the skewType to "simple" to use the uncompensated skewing that CSS does
t1 = Math.tan(t.skewX * _DEG2RAD);
t1 = Math.sqrt(1 + t1 * t1);
cos *= t1;
sin *= t1;
if (t.skewY) {
a11 *= t1;
a21 *= t1;
}
}
}
a12 = -sin;
a22 = cos;

} else if (!rotationY && !rotationX && sz === 1 && !perspective && !isSVG) { //if we're only translating and/or 2D scaling, this is faster...
style[_transformProp] = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) translate3d(" : "translate3d(") + x + "px," + y + "px," + z +"px)" + ((sx !== 1 || sy !== 1) ? " scale(" + sx + "," + sy + ")" : "");
return;
} else {
a11 = a22 = 1;
a12 = a21 = 0;
}
// KEY INDEX AFFECTS
// a11 0 rotation, rotationY, scaleX
// a21 1 rotation, rotationY, scaleX
// a31 2 rotationY, scaleX
// a41 3 rotationY, scaleX
// a12 4 rotation, skewX, rotationX, scaleY
// a22 5 rotation, skewX, rotationX, scaleY
// a32 6 rotationX, scaleY
// a42 7 rotationX, scaleY
// a13 8 rotationY, rotationX, scaleZ
// a23 9 rotationY, rotationX, scaleZ
// a33 10 rotationY, rotationX, scaleZ
// a43 11 rotationY, rotationX, perspective, scaleZ
// a14 12 x, zOrigin, svgOrigin
// a24 13 y, zOrigin, svgOrigin
// a34 14 z, zOrigin
// a44 15
// rotation: Math.atan2(a21, a11)
// rotationY: Math.atan2(a13, a33) (or Math.atan2(a13, a11))
// rotationX: Math.atan2(a32, a33)
a33 = 1;
a13 = a23 = a31 = a32 = a41 = a42 = 0;
a43 = (perspective) ? -1 / perspective : 0;
zOrigin = t.zOrigin;
min = 0.000001; //threshold below which browsers use scientific notation which won't work.
comma = ",";
zero = "0";
angle = rotationY * _DEG2RAD;
if (angle) {
cos = Math.cos(angle);
sin = Math.sin(angle);
a31 = -sin;
a41 = a43*-sin;
a13 = a11*sin;
a23 = a21*sin;
a33 = cos;
a43 *= cos;
a11 *= cos;
a21 *= cos;
}
angle = rotationX * _DEG2RAD;
if (angle) {
cos = Math.cos(angle);
sin = Math.sin(angle);
t1 = a12*cos+a13*sin;
t2 = a22*cos+a23*sin;
a32 = a33*sin;
a42 = a43*sin;
a13 = a12*-sin+a13*cos;
a23 = a22*-sin+a23*cos;
a33 = a33*cos;
a43 = a43*cos;
a12 = t1;
a22 = t2;
}
if (sz !== 1) {
a13*=sz;
a23*=sz;
a33*=sz;
a43*=sz;
}
if (sy !== 1) {
a12*=sy;
a22*=sy;
a32*=sy;
a42*=sy;
}
if (sx !== 1) {
a11*=sx;
a21*=sx;
a31*=sx;
a41*=sx;
}

if (zOrigin || isSVG) {
if (zOrigin) {
x += a13*-zOrigin;
y += a23*-zOrigin;
z += a33*-zOrigin+zOrigin;
}
if (isSVG) { //due to bugs in some browsers, we need to manage the transform-origin of SVG manually
x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset;
y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset;
}
if (x < min && x > -min) {
x = zero;
}
if (y < min && y > -min) {
y = zero;
}
if (z < min && z > -min) {
z = 0; //don't use string because we calculate perspective later and need the number.
}
}

//optimized way of concatenating all the values into a string. If we do it all in one shot, it's slower because of the way browsers have to create temp strings and the way it affects memory. If we do it piece-by-piece with +=, it's a bit slower too. We found that doing it in these sized chunks works best overall:
transform = ((t.xPercent || t.yPercent) ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix3d(" : "matrix3d(");
transform += ((a11 < min && a11 > -min) ? zero : a11) + comma + ((a21 < min && a21 > -min) ? zero : a21) + comma + ((a31 < min && a31 > -min) ? zero : a31);
transform += comma + ((a41 < min && a41 > -min) ? zero : a41) + comma + ((a12 < min && a12 > -min) ? zero : a12) + comma + ((a22 < min && a22 > -min) ? zero : a22);
if (rotationX || rotationY) { //performance optimization (often there's no rotationX or rotationY, so we can skip these calculations)
transform += comma + ((a32 < min && a32 > -min) ? zero : a32) + comma + ((a42 < min && a42 > -min) ? zero : a42) + comma + ((a13 < min && a13 > -min) ? zero : a13);
transform += comma + ((a23 < min && a23 > -min) ? zero : a23) + comma + ((a33 < min && a33 > -min) ? zero : a33) + comma + ((a43 < min && a43 > -min) ? zero : a43) + comma;
} else {
transform += ",0,0,0,0,1,0,";
}
transform += x + comma + y + comma + z + comma + (perspective ? (1 + (-z / perspective)) : 1) + ")";

style[_transformProp] = transform;
};

p = Transform.prototype;
p.x = p.y = p.z = p.skewX = p.skewY = p.rotation = p.rotationX = p.rotationY = p.zOrigin = p.xPercent = p.yPercent = p.xOffset = p.yOffset = 0;
p.scaleX = p.scaleY = p.scaleZ = 1;

_registerComplexSpecialProp("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {parser:function(t, e, p, cssp, pt, plugin, vars) {
if (cssp._lastParsedTransform === vars) { return pt; } //only need to parse the transform once, and only if the browser supports it.
cssp._lastParsedTransform = vars;
var originalGSTransform = t._gsTransform,
m1 = cssp._transform = _getTransform(t, _cs, true, vars.parseTransform),
style = t.style,
min = 0.000001,
i = _transformProps.length,
v = vars,
endRotations = {},
transformOriginString = "transformOrigin",
m2, skewY, copy, orig, has3D, hasChange, dr, x, y;
if (typeof(v.transform) === "string" && _transformProp) { //for values like transform:"rotate(60deg) scale(0.5, 0.8)"
copy = _tempDiv.style; //don't use the original target because it might be SVG in which case some browsers don't report computed style correctly.
copy[_transformProp] = v.transform;
copy.display = "block"; //if display is "none", the browser often refuses to report the transform properties correctly.
copy.position = "absolute";
_doc.body.appendChild(_tempDiv);
m2 = _getTransform(_tempDiv, null, false);
_doc.body.removeChild(_tempDiv);
if (v.xPercent != null) {
m2.xPercent = _parseVal(v.xPercent, m1.xPercent);
}
if (v.yPercent != null) {
m2.yPercent = _parseVal(v.yPercent, m1.yPercent);
}
} else if (typeof(v) === "object") { //for values like scaleX, scaleY, rotation, x, y, skewX, and skewY or transform:{...} (object)
m2 = {scaleX:_parseVal((v.scaleX != null) ? v.scaleX : v.scale, m1.scaleX),
scaleY:_parseVal((v.scaleY != null) ? v.scaleY : v.scale, m1.scaleY),
scaleZ:_parseVal(v.scaleZ, m1.scaleZ),
x:_parseVal(v.x, m1.x),
y:_parseVal(v.y, m1.y),
z:_parseVal(v.z, m1.z),
xPercent:_parseVal(v.xPercent, m1.xPercent),
yPercent:_parseVal(v.yPercent, m1.yPercent),
perspective:_parseVal(v.transformPerspective, m1.perspective)};
dr = v.directionalRotation;
if (dr != null) {
if (typeof(dr) === "object") {
for (copy in dr) {
v[copy] = dr[copy];
}
} else {
v.rotation = dr;
}
}
if (typeof(v.x) === "string" && v.x.indexOf("%") !== -1) {
m2.x = 0;
m2.xPercent = _parseVal(v.x, m1.xPercent);
}
if (typeof(v.y) === "string" && v.y.indexOf("%") !== -1) {
m2.y = 0;
m2.yPercent = _parseVal(v.y, m1.yPercent);
}

m2.rotation = _parseAngle(("rotation" in v) ? v.rotation : ("shortRotation" in v) ? v.shortRotation + "_short" : ("rotationZ" in v) ? v.rotationZ : m1.rotation, m1.rotation, "rotation", endRotations);
if (_supports3D) {
m2.rotationX = _parseAngle(("rotationX" in v) ? v.rotationX : ("shortRotationX" in v) ? v.shortRotationX + "_short" : m1.rotationX || 0, m1.rotationX, "rotationX", endRotations);
m2.rotationY = _parseAngle(("rotationY" in v) ? v.rotationY : ("shortRotationY" in v) ? v.shortRotationY + "_short" : m1.rotationY || 0, m1.rotationY, "rotationY", endRotations);
}
m2.skewX = (v.skewX == null) ? m1.skewX : _parseAngle(v.skewX, m1.skewX);

//note: for performance reasons, we combine all skewing into the skewX and rotation values, ignoring skewY but we must still record it so that we can discern how much of the overall skew is attributed to skewX vs. skewY. Otherwise, if the skewY would always act relative (tween skewY to 10deg, for example, multiple times and if we always combine things into skewX, we can't remember that skewY was 10 from last time). Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of -10 degrees.
m2.skewY = (v.skewY == null) ? m1.skewY : _parseAngle(v.skewY, m1.skewY);
if ((skewY = m2.skewY - m1.skewY)) {
m2.skewX += skewY;
m2.rotation += skewY;
}
}
if (_supports3D && v.force3D != null) {
m1.force3D = v.force3D;
hasChange = true;
}

m1.skewType = v.skewType || m1.skewType || CSSPlugin.defaultSkewType;

has3D = (m1.force3D || m1.z || m1.rotationX || m1.rotationY || m2.z || m2.rotationX || m2.rotationY || m2.perspective);
if (!has3D && v.scale != null) {
m2.scaleZ = 1; //no need to tween scaleZ.
}

while (--i > -1) {
p = _transformProps[i];
orig = m2[p] - m1[p];
if (orig > min || orig < -min || v[p] != null || _forcePT[p] != null) {
hasChange = true;
pt = new CSSPropTween(m1, p, m1[p], orig, pt);
if (p in endRotations) {
pt.e = endRotations[p]; //directional rotations typically have compensated values during the tween, but we need to make sure they end at exactly what the user requested
}
pt.xs0 = 0; //ensures the value stays numeric in setRatio()
pt.plugin = plugin;
cssp._overwriteProps.push(pt.n);
}
}

orig = v.transformOrigin;
if (m1.svg && (orig || v.svgOrigin)) {
x = m1.xOffset; //when we change the origin, in order to prevent things from jumping we adjust the x/y so we must record those here so that we can create PropTweens for them and flip them at the same time as the origin
y = m1.yOffset;
_parseSVGOrigin(t, _parsePosition(orig), m2, v.svgOrigin, v.smoothOrigin);
pt = _addNonTweeningNumericPT(m1, "xOrigin", (originalGSTransform ? m1 : m2).xOrigin, m2.xOrigin, pt, transformOriginString); //note: if there wasn't a transformOrigin defined yet, just start with the destination one; it's wasteful otherwise, and it causes problems with fromTo() tweens. For example, TweenLite.to("#wheel", 3, {rotation:180, transformOrigin:"50% 50%", delay:1}); TweenLite.fromTo("#wheel", 3, {scale:0.5, transformOrigin:"50% 50%"}, {scale:1, delay:2}); would cause a jump when the from values revert at the beginning of the 2nd tween.
pt = _addNonTweeningNumericPT(m1, "yOrigin", (originalGSTransform ? m1 : m2).yOrigin, m2.yOrigin, pt, transformOriginString);
if (x !== m1.xOffset || y !== m1.yOffset) {
pt = _addNonTweeningNumericPT(m1, "xOffset", (originalGSTransform ? x : m1.xOffset), m1.xOffset, pt, transformOriginString);
pt = _addNonTweeningNumericPT(m1, "yOffset", (originalGSTransform ? y : m1.yOffset), m1.yOffset, pt, transformOriginString);
}
orig = _useSVGTransformAttr ? null : "0px 0px"; //certain browsers (like firefox) completely botch transform-origin, so we must remove it to prevent it from contaminating transforms. We manage it ourselves with xOrigin and yOrigin
}
if (orig || (_supports3D && has3D && m1.zOrigin)) { //if anything 3D is happening and there's a transformOrigin with a z component that's non-zero, we must ensure that the transformOrigin's z-component is set to 0 so that we can manually do those calculations to get around Safari bugs. Even if the user didn't specifically define a "transformOrigin" in this particular tween (maybe they did it via css directly).
if (_transformProp) {
hasChange = true;
p = _transformOriginProp;
orig = (orig || _getStyle(t, p, _cs, false, "50% 50%")) + ""; //cast as string to avoid errors
pt = new CSSPropTween(style, p, 0, 0, pt, -1, transformOriginString);
pt.b = style[p];
pt.plugin = plugin;
if (_supports3D) {
copy = m1.zOrigin;
orig = orig.split(" ");
m1.zOrigin = ((orig.length > 2 && !(copy !== 0 && orig[2] === "0px")) ? parseFloat(orig[2]) : copy) || 0; //Safari doesn't handle the z part of transformOrigin correctly, so we'll manually handle it in the _set3DTransformRatio() method.
pt.xs0 = pt.e = orig[0] + " " + (orig[1] || "50%") + " 0px"; //we must define a z value of 0px specifically otherwise iOS 5 Safari will stick with the old one (if one was defined)!
pt = new CSSPropTween(m1, "zOrigin", 0, 0, pt, -1, pt.n); //we must create a CSSPropTween for the _gsTransform.zOrigin so that it gets reset properly at the beginning if the tween runs backward (as opposed to just setting m1.zOrigin here)
pt.b = copy;
pt.xs0 = pt.e = m1.zOrigin;
} else {
pt.xs0 = pt.e = orig;
}

//for older versions of IE (6-8), we need to manually calculate things inside the setRatio() function. We record origin x and y (ox and oy) and whether or not the values are percentages (oxp and oyp).
} else {
_parsePosition(orig + "", m1);
}
}
if (hasChange) {
cssp._transformType = (!(m1.svg && _useSVGTransformAttr) && (has3D || this._transformType === 3)) ? 3 : 2; //quicker than calling cssp._enableTransforms();
}
return pt;
}, prefix:true});

_registerComplexSpecialProp("boxShadow", {defaultValue:"0px 0px 0px 0px #999", prefix:true, color:true, multi:true, keyword:"inset"});

_registerComplexSpecialProp("borderRadius", {defaultValue:"0px", parser:function(t, e, p, cssp, pt, plugin) {
e = this.format(e);
var props = ["borderTopLeftRadius","borderTopRightRadius","borderBottomRightRadius","borderBottomLeftRadius"],
style = t.style,
ea1, i, es2, bs2, bs, es, bn, en, w, h, esfx, bsfx, rel, hn, vn, em;
w = parseFloat(t.offsetWidth);
h = parseFloat(t.offsetHeight);
ea1 = e.split(" ");
for (i = 0; i < props.length; i++) { //if we're dealing with percentages, we must convert things separately for the horizontal and vertical axis!
if (this.p.indexOf("border")) { //older browsers used a prefix
props[i] = _checkPropPrefix(props[i]);
}
bs = bs2 = _getStyle(t, props[i], _cs, false, "0px");
if (bs.indexOf(" ") !== -1) {
bs2 = bs.split(" ");
bs = bs2[0];
bs2 = bs2[1];
}
es = es2 = ea1[i];
bn = parseFloat(bs);
bsfx = bs.substr((bn + "").length);
rel = (es.charAt(1) === "=");
if (rel) {
en = parseInt(es.charAt(0)+"1", 10);
es = es.substr(2);
en *= parseFloat(es);
esfx = es.substr((en + "").length - (en < 0 ? 1 : 0)) || "";
} else {
en = parseFloat(es);
esfx = es.substr((en + "").length);
}
if (esfx === "") {
esfx = _suffixMap[p] || bsfx;
}
if (esfx !== bsfx) {
hn = _convertToPixels(t, "borderLeft", bn, bsfx); //horizontal number (we use a bogus "borderLeft" property just because the _convertToPixels() method searches for the keywords "Left", "Right", "Top", and "Bottom" to determine of it's a horizontal or vertical property, and we need "border" in the name so that it knows it should measure relative to the element itself, not its parent.
vn = _convertToPixels(t, "borderTop", bn, bsfx); //vertical number
if (esfx === "%") {
bs = (hn / w * 100) + "%";
bs2 = (vn / h * 100) + "%";
} else if (esfx === "em") {
em = _convertToPixels(t, "borderLeft", 1, "em");
bs = (hn / em) + "em";
bs2 = (vn / em) + "em";
} else {
bs = hn + "px";
bs2 = vn + "px";
}
if (rel) {
es = (parseFloat(bs) + en) + esfx;
es2 = (parseFloat(bs2) + en) + esfx;
}
}
pt = _parseComplex(style, props[i], bs + " " + bs2, es + " " + es2, false, "0px", pt);
}
return pt;
}, prefix:true, formatter:_getFormatter("0px 0px 0px 0px", false, true)});
_registerComplexSpecialProp("backgroundPosition", {defaultValue:"0 0", parser:function(t, e, p, cssp, pt, plugin) {
var bp = "background-position",
cs = (_cs || _getComputedStyle(t, null)),
bs = this.format( ((cs) ? _ieVers ? cs.getPropertyValue(bp + "-x") + " " + cs.getPropertyValue(bp + "-y") : cs.getPropertyValue(bp) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"), //Internet Explorer doesn't report background-position correctly - we must query background-position-x and background-position-y and combine them (even in IE10). Before IE9, we must do the same with the currentStyle object and use camelCase
es = this.format(e),
ba, ea, i, pct, overlap, src;
if ((bs.indexOf("%") !== -1) !== (es.indexOf("%") !== -1)) {
src = _getStyle(t, "backgroundImage").replace(_urlExp, "");
if (src && src !== "none") {
ba = bs.split(" ");
ea = es.split(" ");
_tempImg.setAttribute("src", src); //set the temp IMG's src to the background-image so that we can measure its width/height
i = 2;
while (--i > -1) {
bs = ba[i];
pct = (bs.indexOf("%") !== -1);
if (pct !== (ea[i].indexOf("%") !== -1)) {
overlap = (i === 0) ? t.offsetWidth - _tempImg.width : t.offsetHeight - _tempImg.height;
ba[i] = pct ? (parseFloat(bs) / 100 * overlap) + "px" : (parseFloat(bs) / overlap * 100) + "%";
}
}
bs = ba.join(" ");
}
}
return this.parseComplex(t.style, bs, es, pt, plugin);
}, formatter:_parsePosition});
_registerComplexSpecialProp("backgroundSize", {defaultValue:"0 0", formatter:_parsePosition});
_registerComplexSpecialProp("perspective", {defaultValue:"0px", prefix:true});
_registerComplexSpecialProp("perspectiveOrigin", {defaultValue:"50% 50%", prefix:true});
_registerComplexSpecialProp("transformStyle", {prefix:true});
_registerComplexSpecialProp("backfaceVisibility", {prefix:true});
_registerComplexSpecialProp("userSelect", {prefix:true});
_registerComplexSpecialProp("margin", {parser:_getEdgeParser("marginTop,marginRight,marginBottom,marginLeft")});
_registerComplexSpecialProp("padding", {parser:_getEdgeParser("paddingTop,paddingRight,paddingBottom,paddingLeft")});
_registerComplexSpecialProp("clip", {defaultValue:"rect(0px,0px,0px,0px)", parser:function(t, e, p, cssp, pt, plugin){
var b, cs, delim;
if (_ieVers < 9) { //IE8 and earlier don't report a "clip" value in the currentStyle - instead, the values are split apart into clipTop, clipRight, clipBottom, and clipLeft. Also, in IE7 and earlier, the values inside rect() are space-delimited, not comma-delimited.
cs = t.currentStyle;
delim = _ieVers < 8 ? " " : ",";
b = "rect(" + cs.clipTop + delim + cs.clipRight + delim + cs.clipBottom + delim + cs.clipLeft + ")";
e = this.format(e).split(",").join(delim);
} else {
b = this.format(_getStyle(t, this.p, _cs, false, this.dflt));
e = this.format(e);
}
return this.parseComplex(t.style, b, e, pt, plugin);
}});
_registerComplexSpecialProp("textShadow", {defaultValue:"0px 0px 0px #999", color:true, multi:true});
_registerComplexSpecialProp("autoRound,strictUnits", {parser:function(t, e, p, cssp, pt) {return pt;}}); //just so that we can ignore these properties (not tween them)
_registerComplexSpecialProp("border", {defaultValue:"0px solid #000", parser:function(t, e, p, cssp, pt, plugin) {
return this.parseComplex(t.style, this.format(_getStyle(t, "borderTopWidth", _cs, false, "0px") + " " + _getStyle(t, "borderTopStyle", _cs, false, "solid") + " " + _getStyle(t, "borderTopColor", _cs, false, "#000")), this.format(e), pt, plugin);
}, color:true, formatter:function(v) {
var a = v.split(" ");
return a[0] + " " + (a[1] || "solid") + " " + (v.match(_colorExp) || ["#000"])[0];
}});
_registerComplexSpecialProp("borderWidth", {parser:_getEdgeParser("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")}); //Firefox doesn't pick up on borderWidth set in style sheets (only inline).
_registerComplexSpecialProp("float,cssFloat,styleFloat", {parser:function(t, e, p, cssp, pt, plugin) {
var s = t.style,
prop = ("cssFloat" in s) ? "cssFloat" : "styleFloat";
return new CSSPropTween(s, prop, 0, 0, pt, -1, p, false, 0, s[prop], e);
}});

//opacity-related
var _setIEOpacityRatio = function(v) {
var t = this.t, //refers to the element's style property
filters = t.filter || _getStyle(this.data, "filter") || "",
val = (this.s + this.c * v) | 0,
skip;
if (val === 100) { //for older versions of IE that need to use a filter to apply opacity, we should remove the filter if opacity hits 1 in order to improve performance, but make sure there isn't a transform (matrix) or gradient in the filters.
if (filters.indexOf("atrix(") === -1 && filters.indexOf("radient(") === -1 && filters.indexOf("oader(") === -1) {
t.removeAttribute("filter");
skip = (!_getStyle(this.data, "filter")); //if a class is applied that has an alpha filter, it will take effect (we don't want that), so re-apply our alpha filter in that case. We must first remove it and then check.
} else {
t.filter = filters.replace(_alphaFilterExp, "");
skip = true;
}
}
if (!skip) {
if (this.xn1) {
t.filter = filters = filters || ("alpha(opacity=" + val + ")"); //works around bug in IE7/8 that prevents changes to "visibility" from being applied properly if the filter is changed to a different alpha on the same frame.
}
if (filters.indexOf("pacity") === -1) { //only used if browser doesn't support the standard opacity style property (IE 7 and 8). We omit the "O" to avoid case-sensitivity issues
if (val !== 0 || !this.xn1) { //bugs in IE7/8 won't render the filter properly if opacity is ADDED on the same frame/render as "visibility" changes (this.xn1 is 1 if this tween is an "autoAlpha" tween)
t.filter = filters + " alpha(opacity=" + val + ")"; //we round the value because otherwise, bugs in IE7/8 can prevent "visibility" changes from being applied properly.
}
} else {
t.filter = filters.replace(_opacityExp, "opacity=" + val);
}
}
};
_registerComplexSpecialProp("opacity,alpha,autoAlpha", {defaultValue:"1", parser:function(t, e, p, cssp, pt, plugin) {
var b = parseFloat(_getStyle(t, "opacity", _cs, false, "1")),
style = t.style,
isAutoAlpha = (p === "autoAlpha");
if (typeof(e) === "string" && e.charAt(1) === "=") {
e = ((e.charAt(0) === "-") ? -1 : 1) * parseFloat(e.substr(2)) + b;
}
if (isAutoAlpha && b === 1 && _getStyle(t, "visibility", _cs) === "hidden" && e !== 0) { //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
b = 0;
}
if (_supportsOpacity) {
pt = new CSSPropTween(style, "opacity", b, e - b, pt);
} else {
pt = new CSSPropTween(style, "opacity", b * 100, (e - b) * 100, pt);
pt.xn1 = isAutoAlpha ? 1 : 0; //we need to record whether or not this is an autoAlpha so that in the setRatio(), we know to duplicate the setting of the alpha in order to work around a bug in IE7 and IE8 that prevents changes to "visibility" from taking effect if the filter is changed to a different alpha(opacity) at the same time. Setting it to the SAME value first, then the new value works around the IE7/8 bug.
style.zoom = 1; //helps correct an IE issue.
pt.type = 2;
pt.b = "alpha(opacity=" + pt.s + ")";
pt.e = "alpha(opacity=" + (pt.s + pt.c) + ")";
pt.data = t;
pt.plugin = plugin;
pt.setRatio = _setIEOpacityRatio;
}
if (isAutoAlpha) { //we have to create the "visibility" PropTween after the opacity one in the linked list so that they run in the order that works properly in IE8 and earlier
pt = new CSSPropTween(style, "visibility", 0, 0, pt, -1, null, false, 0, ((b !== 0) ? "inherit" : "hidden"), ((e === 0) ? "hidden" : "inherit"));
pt.xs0 = "inherit";
cssp._overwriteProps.push(pt.n);
cssp._overwriteProps.push(p);
}
return pt;
}});


var _removeProp = function(s, p) {
if (p) {
if (s.removeProperty) {
if (p.substr(0,2) === "ms" || p.substr(0,6) === "webkit") { //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
p = "-" + p;
}
s.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
} else { //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
s.removeAttribute(p);
}
}
},
_setClassNameRatio = function(v) {
this.t._gsClassPT = this;
if (v === 1 || v === 0) {
this.t.setAttribute("class", (v === 0) ? this.b : this.e);
var mpt = this.data, //first MiniPropTween
s = this.t.style;
while (mpt) {
if (!mpt.v) {
_removeProp(s, mpt.p);
} else {
s[mpt.p] = mpt.v;
}
mpt = mpt._next;
}
if (v === 1 && this.t._gsClassPT === this) {
this.t._gsClassPT = null;
}
} else if (this.t.getAttribute("class") !== this.e) {
this.t.setAttribute("class", this.e);
}
};
_registerComplexSpecialProp("className", {parser:function(t, e, p, cssp, pt, plugin, vars) {
var b = t.getAttribute("class") || "", //don't use t.className because it doesn't work consistently on SVG elements; getAttribute("class") and setAttribute("class", value") is more reliable.
cssText = t.style.cssText,
difData, bs, cnpt, cnptLookup, mpt;
pt = cssp._classNamePT = new CSSPropTween(t, p, 0, 0, pt, 2);
pt.setRatio = _setClassNameRatio;
pt.pr = -11;
_hasPriority = true;
pt.b = b;
bs = _getAllStyles(t, _cs);
//if there's a className tween already operating on the target, force it to its end so that the necessary inline styles are removed and the class name is applied before we determine the end state (we don't want inline styles interfering that were there just for class-specific values)
cnpt = t._gsClassPT;
if (cnpt) {
cnptLookup = {};
mpt = cnpt.data; //first MiniPropTween which stores the inline styles - we need to force these so that the inline styles don't contaminate things. Otherwise, there's a small chance that a tween could start and the inline values match the destination values and they never get cleaned.
while (mpt) {
cnptLookup[mpt.p] = 1;
mpt = mpt._next;
}
cnpt.setRatio(1);
}
t._gsClassPT = pt;
pt.e = (e.charAt(1) !== "=") ? e : b.replace(new RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + ((e.charAt(0) === "+") ? " " + e.substr(2) : "");
t.setAttribute("class", pt.e);
difData = _cssDif(t, bs, _getAllStyles(t), vars, cnptLookup);
t.setAttribute("class", b);
pt.data = difData.firstMPT;
t.style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
pt = pt.xfirst = cssp.parse(t, difData.difs, pt, plugin); //we record the CSSPropTween as the xfirst so that we can handle overwriting propertly (if "className" gets overwritten, we must kill all the properties associated with the className part of the tween, so we can loop through from xfirst to the pt itself)
return pt;
}});


var _setClearPropsRatio = function(v) {
if (v === 1 || v === 0) if (this.data._totalTime === this.data._totalDuration && this.data.data !== "isFromStart") { //this.data refers to the tween. Only clear at the END of the tween (remember, from() tweens make the ratio go from 1 to 0, so we can't just check that and if the tween is the zero-duration one that's created internally to render the starting values in a from() tween, ignore that because otherwise, for example, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in).
var s = this.t.style,
transformParse = _specialProps.transform.parse,
a, p, i, clearTransform, transform;
if (this.e === "all") {
s.cssText = "";
clearTransform = true;
} else {
a = this.e.split(" ").join("").split(",");
i = a.length;
while (--i > -1) {
p = a[i];
if (_specialProps[p]) {
if (_specialProps[p].parse === transformParse) {
clearTransform = true;
} else {
p = (p === "transformOrigin") ? _transformOriginProp : _specialProps[p].p; //ensures that special properties use the proper browser-specific property name, like "scaleX" might be "-webkit-transform" or "boxShadow" might be "-moz-box-shadow"
}
}
_removeProp(s, p);
}
}
if (clearTransform) {
_removeProp(s, _transformProp);
transform = this.t._gsTransform;
if (transform) {
if (transform.svg) {
this.t.removeAttribute("data-svg-origin");
}
delete this.t._gsTransform;
}
}

}
};
_registerComplexSpecialProp("clearProps", {parser:function(t, e, p, cssp, pt) {
pt = new CSSPropTween(t, p, 0, 0, pt, 2);
pt.setRatio = _setClearPropsRatio;
pt.e = e;
pt.pr = -10;
pt.data = cssp._tween;
_hasPriority = true;
return pt;
}});

p = "bezier,throwProps,physicsProps,physics2D".split(",");
i = p.length;
while (i--) {
_registerPluginProp(p[i]);
}








p = CSSPlugin.prototype;
p._firstPT = p._lastParsedTransform = p._transform = null;

//gets called when the tween renders for the first time. This kicks everything off, recording start/end values, etc.
p._onInitTween = function(target, vars, tween) {
if (!target.nodeType) { //css is only for dom elements
return false;
}
this._target = target;
this._tween = tween;
this._vars = vars;
_autoRound = vars.autoRound;
_hasPriority = false;
_suffixMap = vars.suffixMap || CSSPlugin.suffixMap;
_cs = _getComputedStyle(target, "");
_overwriteProps = this._overwriteProps;
var style = target.style,
v, pt, pt2, first, last, next, zIndex, tpt, threeD;
if (_reqSafariFix) if (style.zIndex === "") {
v = _getStyle(target, "zIndex", _cs);
if (v === "auto" || v === "") {
//corrects a bug in [non-Android] Safari that prevents it from repainting elements in their new positions if they don't have a zIndex set. We also can't just apply this inside _parseTransform() because anything that's moved in any way (like using "left" or "top" instead of transforms like "x" and "y") can be affected, so it is best to ensure that anything that's tweening has a z-index. Setting "WebkitPerspective" to a non-zero value worked too except that on iOS Safari things would flicker randomly. Plus zIndex is less memory-intensive.
this._addLazySet(style, "zIndex", 0);
}
}

if (typeof(vars) === "string") {
first = style.cssText;
v = _getAllStyles(target, _cs);
style.cssText = first + ";" + vars;
v = _cssDif(target, v, _getAllStyles(target)).difs;
if (!_supportsOpacity && _opacityValExp.test(vars)) {
v.opacity = parseFloat( RegExp.$1 );
}
vars = v;
style.cssText = first;
}

if (vars.className) { //className tweens will combine any differences they find in the css with the vars that are passed in, so {className:"myClass", scale:0.5, left:20} would work.
this._firstPT = pt = _specialProps.className.parse(target, vars.className, "className", this, null, null, vars);
} else {
this._firstPT = pt = this.parse(target, vars, null);
}

if (this._transformType) {
threeD = (this._transformType === 3);
if (!_transformProp) {
style.zoom = 1; //helps correct an IE issue.
} else if (_isSafari) {
_reqSafariFix = true;
//if zIndex isn't set, iOS Safari doesn't repaint things correctly sometimes (seemingly at random).
if (style.zIndex === "") {
zIndex = _getStyle(target, "zIndex", _cs);
if (zIndex === "auto" || zIndex === "") {
this._addLazySet(style, "zIndex", 0);
}
}
//Setting WebkitBackfaceVisibility corrects 3 bugs:
// 1) [non-Android] Safari skips rendering changes to "top" and "left" that are made on the same frame/render as a transform update.
// 2) iOS Safari sometimes neglects to repaint elements in their new positions. Setting "WebkitPerspective" to a non-zero value worked too except that on iOS Safari things would flicker randomly.
// 3) Safari sometimes displayed odd artifacts when tweening the transform (or WebkitTransform) property, like ghosts of the edges of the element remained. Definitely a browser bug.
//Note: we allow the user to override the auto-setting by defining WebkitBackfaceVisibility in the vars of the tween.
if (_isSafariLT6) {
this._addLazySet(style, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (threeD ? "visible" : "hidden"));
}
}
pt2 = pt;
while (pt2 && pt2._next) {
pt2 = pt2._next;
}
tpt = new CSSPropTween(target, "transform", 0, 0, null, 2);
this._linkCSSP(tpt, null, pt2);
tpt.setRatio = _transformProp ? _setTransformRatio : _setIETransformRatio;
tpt.data = this._transform || _getTransform(target, _cs, true);
tpt.tween = tween;
tpt.pr = -1; //ensures that the transforms get applied after the components are updated.
_overwriteProps.pop(); //we don't want to force the overwrite of all "transform" tweens of the target - we only care about individual transform properties like scaleX, rotation, etc. The CSSPropTween constructor automatically adds the property to _overwriteProps which is why we need to pop() here.
}

if (_hasPriority) {
//reorders the linked list in order of pr (priority)
while (pt) {
next = pt._next;
pt2 = first;
while (pt2 && pt2.pr > pt.pr) {
pt2 = pt2._next;
}
if ((pt._prev = pt2 ? pt2._prev : last)) {
pt._prev._next = pt;
} else {
first = pt;
}
if ((pt._next = pt2)) {
pt2._prev = pt;
} else {
last = pt;
}
pt = next;
}
this._firstPT = first;
}
return true;
};


p.parse = function(target, vars, pt, plugin) {
var style = target.style,
p, sp, bn, en, bs, es, bsfx, esfx, isStr, rel;
for (p in vars) {
es = vars[p]; //ending value string
sp = _specialProps[p]; //SpecialProp lookup.
if (sp) {
pt = sp.parse(target, es, p, this, pt, plugin, vars);

} else {
bs = _getStyle(target, p, _cs) + "";
isStr = (typeof(es) === "string");
if (p === "color" || p === "fill" || p === "stroke" || p.indexOf("Color") !== -1 || (isStr && _rgbhslExp.test(es))) { //Opera uses background: to define color sometimes in addition to backgroundColor:
if (!isStr) {
es = _parseColor(es);
es = ((es.length > 3) ? "rgba(" : "rgb(") + es.join(",") + ")";
}
pt = _parseComplex(style, p, bs, es, true, "transparent", pt, 0, plugin);

} else if (isStr && (es.indexOf(" ") !== -1 || es.indexOf(",") !== -1)) {
pt = _parseComplex(style, p, bs, es, true, null, pt, 0, plugin);

} else {
bn = parseFloat(bs);
bsfx = (bn || bn === 0) ? bs.substr((bn + "").length) : ""; //remember, bs could be non-numeric like "normal" for fontWeight, so we should default to a blank suffix in that case.

if (bs === "" || bs === "auto") {
if (p === "width" || p === "height") {
bn = _getDimension(target, p, _cs);
bsfx = "px";
} else if (p === "left" || p === "top") {
bn = _calculateOffset(target, p, _cs);
bsfx = "px";
} else {
bn = (p !== "opacity") ? 0 : 1;
bsfx = "";
}
}

rel = (isStr && es.charAt(1) === "=");
if (rel) {
en = parseInt(es.charAt(0) + "1", 10);
es = es.substr(2);
en *= parseFloat(es);
esfx = es.replace(_suffixExp, "");
} else {
en = parseFloat(es);
esfx = isStr ? es.replace(_suffixExp, "") : "";
}

if (esfx === "") {
esfx = (p in _suffixMap) ? _suffixMap[p] : bsfx; //populate the end suffix, prioritizing the map, then if none is found, use the beginning suffix.
}

es = (en || en === 0) ? (rel ? en + bn : en) + esfx : vars[p]; //ensures that any += or -= prefixes are taken care of. Record the end value before normalizing the suffix because we always want to end the tween on exactly what they intended even if it doesn't match the beginning value's suffix.

//if the beginning/ending suffixes don't match, normalize them...
if (bsfx !== esfx) if (esfx !== "") if (en || en === 0) if (bn) { //note: if the beginning value (bn) is 0, we don't need to convert units!
bn = _convertToPixels(target, p, bn, bsfx);
if (esfx === "%") {
bn /= _convertToPixels(target, p, 100, "%") / 100;
if (vars.strictUnits !== true) { //some browsers report only "px" values instead of allowing "%" with getComputedStyle(), so we assume that if we're tweening to a %, we should start there too unless strictUnits:true is defined. This approach is particularly useful for responsive designs that use from() tweens.
bs = bn + "%";
}

} else if (esfx === "em") {
bn /= _convertToPixels(target, p, 1, "em");

//otherwise convert to pixels.
} else if (esfx !== "px") {
en = _convertToPixels(target, p, en, esfx);
esfx = "px"; //we don't use bsfx after this, so we don't need to set it to px too.
}
if (rel) if (en || en === 0) {
es = (en + bn) + esfx; //the changes we made affect relative calculations, so adjust the end value here.
}
}

if (rel) {
en += bn;
}

if ((bn || bn === 0) && (en || en === 0)) { //faster than isNaN(). Also, previously we required en !== bn but that doesn't really gain much performance and it prevents _parseToProxy() from working properly if beginning and ending values match but need to get tweened by an external plugin anyway. For example, a bezier tween where the target starts at left:0 and has these points: [{left:50},{left:0}] wouldn't work properly because when parsing the last point, it'd match the first (current) one and a non-tweening CSSPropTween would be recorded when we actually need a normal tween (type:0) so that things get updated during the tween properly.
pt = new CSSPropTween(style, p, bn, en - bn, pt, 0, p, (_autoRound !== false && (esfx === "px" || p === "zIndex")), 0, bs, es);
pt.xs0 = esfx;
//DEBUG: _log("tween "+p+" from "+pt.b+" ("+bn+esfx+") to "+pt.e+" with suffix: "+pt.xs0);
} else if (style[p] === undefined || !es && (es + "" === "NaN" || es == null)) {
_log("invalid " + p + " tween value: " + vars[p]);
} else {
pt = new CSSPropTween(style, p, en || bn || 0, 0, pt, -1, p, false, 0, bs, es);
pt.xs0 = (es === "none" && (p === "display" || p.indexOf("Style") !== -1)) ? bs : es; //intermediate value should typically be set immediately (end value) except for "display" or things like borderTopStyle, borderBottomStyle, etc. which should use the beginning value during the tween.
//DEBUG: _log("non-tweening value "+p+": "+pt.xs0);
}
}
}
if (plugin) if (pt && !pt.plugin) {
pt.plugin = plugin;
}
}
return pt;
};


//gets called every time the tween updates, passing the new ratio (typically a value between 0 and 1, but not always (for example, if an Elastic.easeOut is used, the value can jump above 1 mid-tween). It will always start and 0 and end at 1.
p.setRatio = function(v) {
var pt = this._firstPT,
min = 0.000001,
val, str, i;
//at the end of the tween, we set the values to exactly what we received in order to make sure non-tweening values (like "position" or "float" or whatever) are set and so that if the beginning/ending suffixes (units) didn't match and we normalized to px, the value that the user passed in is used here. We check to see if the tween is at its beginning in case it's a from() tween in which case the ratio will actually go from 1 to 0 over the course of the tween (backwards).
if (v === 1 && (this._tween._time === this._tween._duration || this._tween._time === 0)) {
while (pt) {
if (pt.type !== 2) {
if (pt.r && pt.type !== -1) {
val = Math.round(pt.s + pt.c);
if (!pt.type) {
pt.t[pt.p] = val + pt.xs0;
} else if (pt.type === 1) { //complex value (one that typically has multiple numbers inside a string, like "rect(5px,10px,20px,25px)"
i = pt.l;
str = pt.xs0 + val + pt.xs1;
for (i = 1; i < pt.l; i++) {
str += pt["xn"+i] + pt["xs"+(i+1)];
}
pt.t[pt.p] = str;
}
} else {
pt.t[pt.p] = pt.e;
}
} else {
pt.setRatio(v);
}
pt = pt._next;
}

} else if (v || !(this._tween._time === this._tween._duration || this._tween._time === 0) || this._tween._rawPrevTime === -0.000001) {
while (pt) {
val = pt.c * v + pt.s;
if (pt.r) {
val = Math.round(val);
} else if (val < min) if (val > -min) {
val = 0;
}
if (!pt.type) {
pt.t[pt.p] = val + pt.xs0;
} else if (pt.type === 1) { //complex value (one that typically has multiple numbers inside a string, like "rect(5px,10px,20px,25px)"
i = pt.l;
if (i === 2) {
pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2;
} else if (i === 3) {
pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3;
} else if (i === 4) {
pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4;
} else if (i === 5) {
pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4 + pt.xn4 + pt.xs5;
} else {
str = pt.xs0 + val + pt.xs1;
for (i = 1; i < pt.l; i++) {
str += pt["xn"+i] + pt["xs"+(i+1)];
}
pt.t[pt.p] = str;
}

} else if (pt.type === -1) { //non-tweening value
pt.t[pt.p] = pt.xs0;

} else if (pt.setRatio) { //custom setRatio() for things like SpecialProps, external plugins, etc.
pt.setRatio(v);
}
pt = pt._next;
}

//if the tween is reversed all the way back to the beginning, we need to restore the original values which may have different units (like % instead of px or em or whatever).
} else {
while (pt) {
if (pt.type !== 2) {
pt.t[pt.p] = pt.b;
} else {
pt.setRatio(v);
}
pt = pt._next;
}
}
};

/**
 * @private
 * Forces rendering of the target's transforms (rotation, scale, etc.) whenever the CSSPlugin's setRatio() is called.
 * Basically, this tells the CSSPlugin to create a CSSPropTween (type 2) after instantiation that runs last in the linked
 * list and calls the appropriate (3D or 2D) rendering function. We separate this into its own method so that we can call
 * it from other plugins like BezierPlugin if, for example, it needs to apply an autoRotation and this CSSPlugin
 * doesn't have any transform-related properties of its own. You can call this method as many times as you
 * want and it won't create duplicate CSSPropTweens.
 *
 * @param {boolean} threeD if true, it should apply 3D tweens (otherwise, just 2D ones are fine and typically faster)
 */
p._enableTransforms = function(threeD) {
this._transform = this._transform || _getTransform(this._target, _cs, true); //ensures that the element has a _gsTransform property with the appropriate values.
this._transformType = (!(this._transform.svg && _useSVGTransformAttr) && (threeD || this._transformType === 3)) ? 3 : 2;
};

var lazySet = function(v) {
this.t[this.p] = this.e;
this.data._linkCSSP(this, this._next, null, true); //we purposefully keep this._next even though it'd make sense to null it, but this is a performance optimization, as this happens during the while (pt) {} loop in setRatio() at the bottom of which it sets pt = pt._next, so if we null it, the linked list will be broken in that loop.
};
/** @private Gives us a way to set a value on the first render (and only the first render). **/
p._addLazySet = function(t, p, v) {
var pt = this._firstPT = new CSSPropTween(t, p, 0, 0, this._firstPT, 2);
pt.e = v;
pt.setRatio = lazySet;
pt.data = this;
};

/** @private **/
p._linkCSSP = function(pt, next, prev, remove) {
if (pt) {
if (next) {
next._prev = pt;
}
if (pt._next) {
pt._next._prev = pt._prev;
}
if (pt._prev) {
pt._prev._next = pt._next;
} else if (this._firstPT === pt) {
this._firstPT = pt._next;
remove = true; //just to prevent resetting this._firstPT 5 lines down in case pt._next is null. (optimized for speed)
}
if (prev) {
prev._next = pt;
} else if (!remove && this._firstPT === null) {
this._firstPT = pt;
}
pt._next = next;
pt._prev = prev;
}
return pt;
};

//we need to make sure that if alpha or autoAlpha is killed, opacity is too. And autoAlpha affects the "visibility" property.
p._kill = function(lookup) {
var copy = lookup,
pt, p, xfirst;
if (lookup.autoAlpha || lookup.alpha) {
copy = {};
for (p in lookup) { //copy the lookup so that we're not changing the original which may be passed elsewhere.
copy[p] = lookup[p];
}
copy.opacity = 1;
if (copy.autoAlpha) {
copy.visibility = 1;
}
}
if (lookup.className && (pt = this._classNamePT)) { //for className tweens, we need to kill any associated CSSPropTweens too; a linked list starts at the className's "xfirst".
xfirst = pt.xfirst;
if (xfirst && xfirst._prev) {
this._linkCSSP(xfirst._prev, pt._next, xfirst._prev._prev); //break off the prev
} else if (xfirst === this._firstPT) {
this._firstPT = pt._next;
}
if (pt._next) {
this._linkCSSP(pt._next, pt._next._next, xfirst._prev);
}
this._classNamePT = null;
}
return TweenPlugin.prototype._kill.call(this, copy);
};



//used by cascadeTo() for gathering all the style properties of each child element into an array for comparison.
var _getChildStyles = function(e, props, targets) {
var children, i, child, type;
if (e.slice) {
i = e.length;
while (--i > -1) {
_getChildStyles(e[i], props, targets);
}
return;
}
children = e.childNodes;
i = children.length;
while (--i > -1) {
child = children[i];
type = child.type;
if (child.style) {
props.push(_getAllStyles(child));
if (targets) {
targets.push(child);
}
}
if ((type === 1 || type === 9 || type === 11) && child.childNodes.length) {
_getChildStyles(child, props, targets);
}
}
};

/**
 * Typically only useful for className tweens that may affect child elements, this method creates a TweenLite
 * and then compares the style properties of all the target's child elements at the tween's start and end, and
 * if any are different, it also creates tweens for those and returns an array containing ALL of the resulting
 * tweens (so that you can easily add() them to a TimelineLite, for example). The reason this functionality is
 * wrapped into a separate static method of CSSPlugin instead of being integrated into all regular className tweens
 * is because it creates entirely new tweens that may have completely different targets than the original tween,
 * so if they were all lumped into the original tween instance, it would be inconsistent with the rest of the API
 * and it would create other problems. For example:
 * - If I create a tween of elementA, that tween instance may suddenly change its target to include 50 other elements (unintuitive if I specifically defined the target I wanted)
 * - We can't just create new independent tweens because otherwise, what happens if the original/parent tween is reversed or pause or dropped into a TimelineLite for tight control? You'd expect that tween's behavior to affect all the others.
 * - Analyzing every style property of every child before and after the tween is an expensive operation when there are many children, so this behavior shouldn't be imposed on all className tweens by default, especially since it's probably rare that this extra functionality is needed.
 *
 * @param {Object} target object to be tweened
 * @param {number} Duration in seconds (or frames for frames-based tweens)
 * @param {Object} Object containing the end values, like {className:"newClass", ease:Linear.easeNone}
 * @return {Array} An array of TweenLite instances
 */
CSSPlugin.cascadeTo = function(target, duration, vars) {
var tween = TweenLite.to(target, duration, vars),
results = [tween],
b = [],
e = [],
targets = [],
_reservedProps = TweenLite._internals.reservedProps,
i, difs, p, from;
target = tween._targets || tween.target;
_getChildStyles(target, b, targets);
tween.render(duration, true, true);
_getChildStyles(target, e);
tween.render(0, true, true);
tween._enabled(true);
i = targets.length;
while (--i > -1) {
difs = _cssDif(targets[i], b[i], e[i]);
if (difs.firstMPT) {
difs = difs.difs;
for (p in vars) {
if (_reservedProps[p]) {
difs[p] = vars[p];
}
}
from = {};
for (p in difs) {
from[p] = b[i][p];
}
results.push(TweenLite.fromTo(targets[i], duration, from, difs));
}
}
return results;
};

TweenPlugin.activate([CSSPlugin]);
return CSSPlugin;

}, true);











/*
 * ----------------------------------------------------------------
 * RoundPropsPlugin
 * ----------------------------------------------------------------
 */
(function() {

var RoundPropsPlugin = _gsScope._gsDefine.plugin({
propName: "roundProps",
priority: -1,
API: 2,

//called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
init: function(target, value, tween) {
this._tween = tween;
return true;
}

}),
p = RoundPropsPlugin.prototype;

p._onInitAllProps = function() {
var tween = this._tween,
rp = (tween.vars.roundProps instanceof Array) ? tween.vars.roundProps : tween.vars.roundProps.split(","),
i = rp.length,
lookup = {},
rpt = tween._propLookup.roundProps,
prop, pt, next;
while (--i > -1) {
lookup[rp[i]] = 1;
}
i = rp.length;
while (--i > -1) {
prop = rp[i];
pt = tween._firstPT;
while (pt) {
next = pt._next; //record here, because it may get removed
if (pt.pg) {
pt.t._roundProps(lookup, true);
} else if (pt.n === prop) {
this._add(pt.t, prop, pt.s, pt.c);
//remove from linked list
if (next) {
next._prev = pt._prev;
}
if (pt._prev) {
pt._prev._next = next;
} else if (tween._firstPT === pt) {
tween._firstPT = next;
}
pt._next = pt._prev = null;
tween._propLookup[prop] = rpt;
}
pt = next;
}
}
return false;
};

p._add = function(target, p, s, c) {
this._addTween(target, p, s, s + c, p, true);
this._overwriteProps.push(p);
};

}());










/*
 * ----------------------------------------------------------------
 * AttrPlugin
 * ----------------------------------------------------------------
 */

(function() {
var _numExp = /(?:\d|\-|\+|=|#|\.)*/g,
_suffixExp = /[A-Za-z%]/g;

_gsScope._gsDefine.plugin({
propName: "attr",
API: 2,
version: "0.4.0",

//called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
init: function(target, value, tween) {
var p, start, end, suffix, i;
if (typeof(target.setAttribute) !== "function") {
return false;
}
this._target = target;
this._proxy = {};
this._start = {}; // we record start and end values exactly as they are in case they're strings (not numbers) - we need to be able to revert to them cleanly.
this._end = {};
this._suffix = {};
for (p in value) {
this._start[p] = this._proxy[p] = start = target.getAttribute(p) + "";
this._end[p] = end = value[p] + "";
this._suffix[p] = suffix = _suffixExp.test(end) ? end.replace(_numExp, "") : _suffixExp.test(start) ? start.replace(_numExp, "") : "";
if (suffix) {
i = end.indexOf(suffix);
if (i !== -1) {
end = end.substr(0, i);
}
}
if(!this._addTween(this._proxy, p, parseFloat(start), end, p)) {
this._suffix[p] = ""; //not a valid tween - perhaps something like an <img src=""> attribute.
}
if (end.charAt(1) === "=") {
this._end[p] = (this._firstPT.s + this._firstPT.c) + suffix;
}
this._overwriteProps.push(p);
}
return true;
},

//called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
set: function(ratio) {
this._super.setRatio.call(this, ratio);
var props = this._overwriteProps,
i = props.length,
lookup = (ratio === 1) ? this._end : ratio ? this._proxy : this._start,
useSuffix = (lookup === this._proxy),
p;
while (--i > -1) {
p = props[i];
this._target.setAttribute(p, lookup[p] + (useSuffix ? this._suffix[p] : ""));
}
}

});
}());










/*
 * ----------------------------------------------------------------
 * DirectionalRotationPlugin
 * ----------------------------------------------------------------
 */
_gsScope._gsDefine.plugin({
propName: "directionalRotation",
version: "0.2.1",
API: 2,

//called when the tween renders for the first time. This is where initial values should be recorded and any setup routines should run.
init: function(target, value, tween) {
if (typeof(value) !== "object") {
value = {rotation:value};
}
this.finals = {};
var cap = (value.useRadians === true) ? Math.PI * 2 : 360,
min = 0.000001,
p, v, start, end, dif, split;
for (p in value) {
if (p !== "useRadians") {
split = (value[p] + "").split("_");
v = split[0];
start = parseFloat( (typeof(target[p]) !== "function") ? target[p] : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]() );
end = this.finals[p] = (typeof(v) === "string" && v.charAt(1) === "=") ? start + parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : Number(v) || 0;
dif = end - start;
if (split.length) {
v = split.join("_");
if (v.indexOf("short") !== -1) {
dif = dif % cap;
if (dif !== dif % (cap / 2)) {
dif = (dif < 0) ? dif + cap : dif - cap;
}
}
if (v.indexOf("_cw") !== -1 && dif < 0) {
dif = ((dif + cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
} else if (v.indexOf("ccw") !== -1 && dif > 0) {
dif = ((dif - cap * 9999999999) % cap) - ((dif / cap) | 0) * cap;
}
}
if (dif > min || dif < -min) {
this._addTween(target, p, start, start + dif, p);
this._overwriteProps.push(p);
}
}
}
return true;
},

//called each time the values should be updated, and the ratio gets passed as the only parameter (typically it's a value between 0 and 1, but it can exceed those when using an ease like Elastic.easeOut or Back.easeOut, etc.)
set: function(ratio) {
var pt;
if (ratio !== 1) {
this._super.setRatio.call(this, ratio);
} else {
pt = this._firstPT;
while (pt) {
if (pt.f) {
pt.t[pt.p](this.finals[pt.p]);
} else {
pt.t[pt.p] = this.finals[pt.p];
}
pt = pt._next;
}
}
}

})._autoCSS = true;











/*
 * ----------------------------------------------------------------
 * EasePack
 * ----------------------------------------------------------------
 */
_gsScope._gsDefine("easing.Back", ["easing.Ease"], function(Ease) {

var w = (_gsScope.GreenSockGlobals || _gsScope),
gs = w.com.greensock,
_2PI = Math.PI * 2,
_HALF_PI = Math.PI / 2,
_class = gs._class,
_create = function(n, f) {
var C = _class("easing." + n, function(){}, true),
p = C.prototype = new Ease();
p.constructor = C;
p.getRatio = f;
return C;
},
_easeReg = Ease.register || function(){}, //put an empty function in place just as a safety measure in case someone loads an OLD version of TweenLite.js where Ease.register doesn't exist.
_wrap = function(name, EaseOut, EaseIn, EaseInOut, aliases) {
var C = _class("easing."+name, {
easeOut:new EaseOut(),
easeIn:new EaseIn(),
easeInOut:new EaseInOut()
}, true);
_easeReg(C, name);
return C;
},
EasePoint = function(time, value, next) {
this.t = time;
this.v = value;
if (next) {
this.next = next;
next.prev = this;
this.c = next.v - value;
this.gap = next.t - time;
}
},

//Back
_createBack = function(n, f) {
var C = _class("easing." + n, function(overshoot) {
this._p1 = (overshoot || overshoot === 0) ? overshoot : 1.70158;
this._p2 = this._p1 * 1.525;
}, true),
p = C.prototype = new Ease();
p.constructor = C;
p.getRatio = f;
p.config = function(overshoot) {
return new C(overshoot);
};
return C;
},

Back = _wrap("Back",
_createBack("BackOut", function(p) {
return ((p = p - 1) * p * ((this._p1 + 1) * p + this._p1) + 1);
}),
_createBack("BackIn", function(p) {
return p * p * ((this._p1 + 1) * p - this._p1);
}),
_createBack("BackInOut", function(p) {
return ((p *= 2) < 1) ? 0.5 * p * p * ((this._p2 + 1) * p - this._p2) : 0.5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2);
})
),


//SlowMo
SlowMo = _class("easing.SlowMo", function(linearRatio, power, yoyoMode) {
power = (power || power === 0) ? power : 0.7;
if (linearRatio == null) {
linearRatio = 0.7;
} else if (linearRatio > 1) {
linearRatio = 1;
}
this._p = (linearRatio !== 1) ? power : 0;
this._p1 = (1 - linearRatio) / 2;
this._p2 = linearRatio;
this._p3 = this._p1 + this._p2;
this._calcEnd = (yoyoMode === true);
}, true),
p = SlowMo.prototype = new Ease(),
SteppedEase, RoughEase, _createElastic;

p.constructor = SlowMo;
p.getRatio = function(p) {
var r = p + (0.5 - p) * this._p;
if (p < this._p1) {
return this._calcEnd ? 1 - ((p = 1 - (p / this._p1)) * p) : r - ((p = 1 - (p / this._p1)) * p * p * p * r);
} else if (p > this._p3) {
return this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + ((p - r) * (p = (p - this._p3) / this._p1) * p * p * p);
}
return this._calcEnd ? 1 : r;
};
SlowMo.ease = new SlowMo(0.7, 0.7);

p.config = SlowMo.config = function(linearRatio, power, yoyoMode) {
return new SlowMo(linearRatio, power, yoyoMode);
};


//SteppedEase
SteppedEase = _class("easing.SteppedEase", function(steps) {
steps = steps || 1;
this._p1 = 1 / steps;
this._p2 = steps + 1;
}, true);
p = SteppedEase.prototype = new Ease();
p.constructor = SteppedEase;
p.getRatio = function(p) {
if (p < 0) {
p = 0;
} else if (p >= 1) {
p = 0.999999999;
}
return ((this._p2 * p) >> 0) * this._p1;
};
p.config = SteppedEase.config = function(steps) {
return new SteppedEase(steps);
};


//RoughEase
RoughEase = _class("easing.RoughEase", function(vars) {
vars = vars || {};
var taper = vars.taper || "none",
a = [],
cnt = 0,
points = (vars.points || 20) | 0,
i = points,
randomize = (vars.randomize !== false),
clamp = (vars.clamp === true),
template = (vars.template instanceof Ease) ? vars.template : null,
strength = (typeof(vars.strength) === "number") ? vars.strength * 0.4 : 0.4,
x, y, bump, invX, obj, pnt;
while (--i > -1) {
x = randomize ? Math.random() : (1 / points) * i;
y = template ? template.getRatio(x) : x;
if (taper === "none") {
bump = strength;
} else if (taper === "out") {
invX = 1 - x;
bump = invX * invX * strength;
} else if (taper === "in") {
bump = x * x * strength;
} else if (x < 0.5) { //"both" (start)
invX = x * 2;
bump = invX * invX * 0.5 * strength;
} else {//"both" (end)
invX = (1 - x) * 2;
bump = invX * invX * 0.5 * strength;
}
if (randomize) {
y += (Math.random() * bump) - (bump * 0.5);
} else if (i % 2) {
y += bump * 0.5;
} else {
y -= bump * 0.5;
}
if (clamp) {
if (y > 1) {
y = 1;
} else if (y < 0) {
y = 0;
}
}
a[cnt++] = {x:x, y:y};
}
a.sort(function(a, b) {
return a.x - b.x;
});

pnt = new EasePoint(1, 1, null);
i = points;
while (--i > -1) {
obj = a[i];
pnt = new EasePoint(obj.x, obj.y, pnt);
}

this._prev = new EasePoint(0, 0, (pnt.t !== 0) ? pnt : pnt.next);
}, true);
p = RoughEase.prototype = new Ease();
p.constructor = RoughEase;
p.getRatio = function(p) {
var pnt = this._prev;
if (p > pnt.t) {
while (pnt.next && p >= pnt.t) {
pnt = pnt.next;
}
pnt = pnt.prev;
} else {
while (pnt.prev && p <= pnt.t) {
pnt = pnt.prev;
}
}
this._prev = pnt;
return (pnt.v + ((p - pnt.t) / pnt.gap) * pnt.c);
};
p.config = function(vars) {
return new RoughEase(vars);
};
RoughEase.ease = new RoughEase();


//Bounce
_wrap("Bounce",
_create("BounceOut", function(p) {
if (p < 1 / 2.75) {
return 7.5625 * p * p;
} else if (p < 2 / 2.75) {
return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
} else if (p < 2.5 / 2.75) {
return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
}
return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
}),
_create("BounceIn", function(p) {
if ((p = 1 - p) < 1 / 2.75) {
return 1 - (7.5625 * p * p);
} else if (p < 2 / 2.75) {
return 1 - (7.5625 * (p -= 1.5 / 2.75) * p + 0.75);
} else if (p < 2.5 / 2.75) {
return 1 - (7.5625 * (p -= 2.25 / 2.75) * p + 0.9375);
}
return 1 - (7.5625 * (p -= 2.625 / 2.75) * p + 0.984375);
}),
_create("BounceInOut", function(p) {
var invert = (p < 0.5);
if (invert) {
p = 1 - (p * 2);
} else {
p = (p * 2) - 1;
}
if (p < 1 / 2.75) {
p = 7.5625 * p * p;
} else if (p < 2 / 2.75) {
p = 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
} else if (p < 2.5 / 2.75) {
p = 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
} else {
p = 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
}
return invert ? (1 - p) * 0.5 : p * 0.5 + 0.5;
})
);


//CIRC
_wrap("Circ",
_create("CircOut", function(p) {
return Math.sqrt(1 - (p = p - 1) * p);
}),
_create("CircIn", function(p) {
return -(Math.sqrt(1 - (p * p)) - 1);
}),
_create("CircInOut", function(p) {
return ((p*=2) < 1) ? -0.5 * (Math.sqrt(1 - p * p) - 1) : 0.5 * (Math.sqrt(1 - (p -= 2) * p) + 1);
})
);


//Elastic
_createElastic = function(n, f, def) {
var C = _class("easing." + n, function(amplitude, period) {
this._p1 = (amplitude >= 1) ? amplitude : 1; //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
this._p2 = (period || def) / (amplitude < 1 ? amplitude : 1);
this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0);
this._p2 = _2PI / this._p2; //precalculate to optimize
}, true),
p = C.prototype = new Ease();
p.constructor = C;
p.getRatio = f;
p.config = function(amplitude, period) {
return new C(amplitude, period);
};
return C;
};
_wrap("Elastic",
_createElastic("ElasticOut", function(p) {
return this._p1 * Math.pow(2, -10 * p) * Math.sin( (p - this._p3) * this._p2 ) + 1;
}, 0.3),
_createElastic("ElasticIn", function(p) {
return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * this._p2 ));
}, 0.3),
_createElastic("ElasticInOut", function(p) {
return ((p *= 2) < 1) ? -0.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin( (p - this._p3) * this._p2)) : this._p1 * Math.pow(2, -10 *(p -= 1)) * Math.sin( (p - this._p3) * this._p2 ) * 0.5 + 1;
}, 0.45)
);


//Expo
_wrap("Expo",
_create("ExpoOut", function(p) {
return 1 - Math.pow(2, -10 * p);
}),
_create("ExpoIn", function(p) {
return Math.pow(2, 10 * (p - 1)) - 0.001;
}),
_create("ExpoInOut", function(p) {
return ((p *= 2) < 1) ? 0.5 * Math.pow(2, 10 * (p - 1)) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
})
);


//Sine
_wrap("Sine",
_create("SineOut", function(p) {
return Math.sin(p * _HALF_PI);
}),
_create("SineIn", function(p) {
return -Math.cos(p * _HALF_PI) + 1;
}),
_create("SineInOut", function(p) {
return -0.5 * (Math.cos(Math.PI * p) - 1);
})
);

_class("easing.EaseLookup", {
find:function(s) {
return Ease.map[s];
}
}, true);

//register the non-standard eases
_easeReg(w.SlowMo, "SlowMo", "ease,");
_easeReg(RoughEase, "RoughEase", "ease,");
_easeReg(SteppedEase, "SteppedEase", "ease,");

return Back;

}, true);


});

if (_gsScope._gsDefine) { _gsScope._gsQueue.pop()(); } //necessary in case TweenLite was already loaded separately.











/*
 * ----------------------------------------------------------------
 * Base classes like TweenLite, SimpleTimeline, Ease, Ticker, etc.
 * ----------------------------------------------------------------
 */
(function(window, moduleName) {

"use strict";
var _globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
if (_globals.TweenLite) {
return; //in case the core set of classes is already loaded, don't instantiate twice.
}
var _namespace = function(ns) {
var a = ns.split("."),
p = _globals, i;
for (i = 0; i < a.length; i++) {
p[a[i]] = p = p[a[i]] || {};
}
return p;
},
gs = _namespace("com.greensock"),
_tinyNum = 0.0000000001,
_slice = function(a) { //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
var b = [],
l = a.length,
i;
for (i = 0; i !== l; b.push(a[i++]));
return b;
},
_emptyFunc = function() {},
_isArray = (function() { //works around issues in iframe environments where the Array global isn't shared, thus if the object originates in a different window/iframe, "(obj instanceof Array)" will evaluate false. We added some speed optimizations to avoid Object.prototype.toString.call() unless it's absolutely necessary because it's VERY slow (like 20x slower)
var toString = Object.prototype.toString,
array = toString.call([]);
return function(obj) {
return obj != null && (obj instanceof Array || (typeof(obj) === "object" && !!obj.push && toString.call(obj) === array));
};
}()),
a, i, p, _ticker, _tickerActive,
_defLookup = {},

/**
 * @constructor
 * Defines a GreenSock class, optionally with an array of dependencies that must be instantiated first and passed into the definition.
 * This allows users to load GreenSock JS files in any order even if they have interdependencies (like CSSPlugin extends TweenPlugin which is
 * inside TweenLite.js, but if CSSPlugin is loaded first, it should wait to run its code until TweenLite.js loads and instantiates TweenPlugin
 * and then pass TweenPlugin to CSSPlugin's definition). This is all done automatically and internally.
 *
 * Every definition will be added to a "com.greensock" global object (typically window, but if a window.GreenSockGlobals object is found,
 * it will go there as of v1.7). For example, TweenLite will be found at window.com.greensock.TweenLite and since it's a global class that should be available anywhere,
 * it is ALSO referenced at window.TweenLite. However some classes aren't considered global, like the base com.greensock.core.Animation class, so
 * those will only be at the package like window.com.greensock.core.Animation. Again, if you define a GreenSockGlobals object on the window, everything
 * gets tucked neatly inside there instead of on the window directly. This allows you to do advanced things like load multiple versions of GreenSock
 * files and put them into distinct objects (imagine a banner ad uses a newer version but the main site uses an older one). In that case, you could
 * sandbox the banner one like:
 *
 * <script>
 * var gs = window.GreenSockGlobals = {}; //the newer version we're about to load could now be referenced in a "gs" object, like gs.TweenLite.to(...). Use whatever alias you want as long as it's unique, "gs" or "banner" or whatever.
 * </script>
 * <script src="js/greensock/v1.7/TweenMax.js"></script>
 * <script>
 * window.GreenSockGlobals = window._gsQueue = window._gsDefine = null; //reset it back to null (along with the special _gsQueue variable) so that the next load of TweenMax affects the window and we can reference things directly like TweenLite.to(...)
 * </script>
 * <script src="js/greensock/v1.6/TweenMax.js"></script>
 * <script>
 * gs.TweenLite.to(...); //would use v1.7
 * TweenLite.to(...); //would use v1.6
 * </script>
 *
 * @param {!string} ns The namespace of the class definition, leaving off "com.greensock." as that's assumed. For example, "TweenLite" or "plugins.CSSPlugin" or "easing.Back".
 * @param {!Array.<string>} dependencies An array of dependencies (described as their namespaces minus "com.greensock." prefix). For example ["TweenLite","plugins.TweenPlugin","core.Animation"]
 * @param {!function():Object} func The function that should be called and passed the resolved dependencies which will return the actual class for this definition.
 * @param {boolean=} global If true, the class will be added to the global scope (typically window unless you define a window.GreenSockGlobals object)
 */
Definition = function(ns, dependencies, func, global) {
this.sc = (_defLookup[ns]) ? _defLookup[ns].sc : []; //subclasses
_defLookup[ns] = this;
this.gsClass = null;
this.func = func;
var _classes = [];
this.check = function(init) {
var i = dependencies.length,
missing = i,
cur, a, n, cl;
while (--i > -1) {
if ((cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass) {
_classes[i] = cur.gsClass;
missing--;
} else if (init) {
cur.sc.push(this);
}
}
if (missing === 0 && func) {
a = ("com.greensock." + ns).split(".");
n = a.pop();
cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes);

//exports to multiple environments
if (global) {
_globals[n] = cl; //provides a way to avoid global namespace pollution. By default, the main classes like TweenLite, Power1, Strong, etc. are added to window unless a GreenSockGlobals is defined. So if you want to have things added to a custom object instead, just do something like window.GreenSockGlobals = {} before loading any GreenSock files. You can even set up an alias like window.GreenSockGlobals = windows.gs = {} so that you can access everything like gs.TweenLite. Also remember that ALL classes are added to the window.com.greensock object (in their respective packages, like com.greensock.easing.Power1, com.greensock.TweenLite, etc.)
if (typeof(define) === "function" && define.amd){ //AMD
define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").pop(), [], function() { return cl; });
} else if (ns === moduleName && typeof(module) !== "undefined" && module.exports){ //node
module.exports = cl;
}
}
for (i = 0; i < this.sc.length; i++) {
this.sc[i].check();
}
}
};
this.check(true);
},

//used to create Definition instances (which basically registers a class that has dependencies).
_gsDefine = window._gsDefine = function(ns, dependencies, func, global) {
return new Definition(ns, dependencies, func, global);
},

//a quick way to create a class that doesn't have any dependencies. Returns the class, but first registers it in the GreenSock namespace so that other classes can grab it (other classes might be dependent on the class).
_class = gs._class = function(ns, func, global) {
func = func || function() {};
_gsDefine(ns, [], function(){ return func; }, global);
return func;
};

_gsDefine.globals = _globals;



/*
 * ----------------------------------------------------------------
 * Ease
 * ----------------------------------------------------------------
 */
var _baseParams = [0, 0, 1, 1],
_blankArray = [],
Ease = _class("easing.Ease", function(func, extraParams, type, power) {
this._func = func;
this._type = type || 0;
this._power = power || 0;
this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams;
}, true),
_easeMap = Ease.map = {},
_easeReg = Ease.register = function(ease, names, types, create) {
var na = names.split(","),
i = na.length,
ta = (types || "easeIn,easeOut,easeInOut").split(","),
e, name, j, type;
while (--i > -1) {
name = na[i];
e = create ? _class("easing."+name, null, true) : gs.easing[name] || {};
j = ta.length;
while (--j > -1) {
type = ta[j];
_easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease();
}
}
};

p = Ease.prototype;
p._calcEnd = false;
p.getRatio = function(p) {
if (this._func) {
this._params[0] = p;
return this._func.apply(null, this._params);
}
var t = this._type,
pw = this._power,
r = (t === 1) ? 1 - p : (t === 2) ? p : (p < 0.5) ? p * 2 : (1 - p) * 2;
if (pw === 1) {
r *= r;
} else if (pw === 2) {
r *= r * r;
} else if (pw === 3) {
r *= r * r * r;
} else if (pw === 4) {
r *= r * r * r * r;
}
return (t === 1) ? 1 - r : (t === 2) ? r : (p < 0.5) ? r / 2 : 1 - (r / 2);
};

//create all the standard eases like Linear, Quad, Cubic, Quart, Quint, Strong, Power0, Power1, Power2, Power3, and Power4 (each with easeIn, easeOut, and easeInOut)
a = ["Linear","Quad","Cubic","Quart","Quint,Strong"];
i = a.length;
while (--i > -1) {
p = a[i]+",Power"+i;
_easeReg(new Ease(null,null,1,i), p, "easeOut", true);
_easeReg(new Ease(null,null,2,i), p, "easeIn" + ((i === 0) ? ",easeNone" : ""));
_easeReg(new Ease(null,null,3,i), p, "easeInOut");
}
_easeMap.linear = gs.easing.Linear.easeIn;
_easeMap.swing = gs.easing.Quad.easeInOut; //for jQuery folks


/*
 * ----------------------------------------------------------------
 * EventDispatcher
 * ----------------------------------------------------------------
 */
var EventDispatcher = _class("events.EventDispatcher", function(target) {
this._listeners = {};
this._eventTarget = target || this;
});
p = EventDispatcher.prototype;

p.addEventListener = function(type, callback, scope, useParam, priority) {
priority = priority || 0;
var list = this._listeners[type],
index = 0,
listener, i;
if (list == null) {
this._listeners[type] = list = [];
}
i = list.length;
while (--i > -1) {
listener = list[i];
if (listener.c === callback && listener.s === scope) {
list.splice(i, 1);
} else if (index === 0 && listener.pr < priority) {
index = i + 1;
}
}
list.splice(index, 0, {c:callback, s:scope, up:useParam, pr:priority});
if (this === _ticker && !_tickerActive) {
_ticker.wake();
}
};

p.removeEventListener = function(type, callback) {
var list = this._listeners[type], i;
if (list) {
i = list.length;
while (--i > -1) {
if (list[i].c === callback) {
list.splice(i, 1);
return;
}
}
}
};

p.dispatchEvent = function(type) {
var list = this._listeners[type],
i, t, listener;
if (list) {
i = list.length;
t = this._eventTarget;
while (--i > -1) {
listener = list[i];
if (listener) {
if (listener.up) {
listener.c.call(listener.s || t, {type:type, target:t});
} else {
listener.c.call(listener.s || t);
}
}
}
}
};


/*
 * ----------------------------------------------------------------
 * Ticker
 * ----------------------------------------------------------------
 */
 var _reqAnimFrame = window.requestAnimationFrame,
_cancelAnimFrame = window.cancelAnimationFrame,
_getTime = Date.now || function() {return new Date().getTime();},
_lastUpdate = _getTime();

//now try to determine the requestAnimationFrame and cancelAnimationFrame functions and if none are found, we'll use a setTimeout()/clearTimeout() polyfill.
a = ["ms","moz","webkit","o"];
i = a.length;
while (--i > -1 && !_reqAnimFrame) {
_reqAnimFrame = window[a[i] + "RequestAnimationFrame"];
_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
}

_class("Ticker", function(fps, useRAF) {
var _self = this,
_startTime = _getTime(),
_useRAF = (useRAF !== false && _reqAnimFrame),
_lagThreshold = 500,
_adjustedLag = 33,
_tickWord = "tick", //helps reduce gc burden
_fps, _req, _id, _gap, _nextTime,
_tick = function(manual) {
var elapsed = _getTime() - _lastUpdate,
overlap, dispatch;
if (elapsed > _lagThreshold) {
_startTime += elapsed - _adjustedLag;
}
_lastUpdate += elapsed;
_self.time = (_lastUpdate - _startTime) / 1000;
overlap = _self.time - _nextTime;
if (!_fps || overlap > 0 || manual === true) {
_self.frame++;
_nextTime += overlap + (overlap >= _gap ? 0.004 : _gap - overlap);
dispatch = true;
}
if (manual !== true) { //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.
_id = _req(_tick);
}
if (dispatch) {
_self.dispatchEvent(_tickWord);
}
};

EventDispatcher.call(_self);
_self.time = _self.frame = 0;
_self.tick = function() {
_tick(true);
};

_self.lagSmoothing = function(threshold, adjustedLag) {
_lagThreshold = threshold || (1 / _tinyNum); //zero should be interpreted as basically unlimited
_adjustedLag = Math.min(adjustedLag, _lagThreshold, 0);
};

_self.sleep = function() {
if (_id == null) {
return;
}
if (!_useRAF || !_cancelAnimFrame) {
clearTimeout(_id);
} else {
_cancelAnimFrame(_id);
}
_req = _emptyFunc;
_id = null;
if (_self === _ticker) {
_tickerActive = false;
}
};

_self.wake = function() {
if (_id !== null) {
_self.sleep();
} else if (_self.frame > 10) { //don't trigger lagSmoothing if we're just waking up, and make sure that at least 10 frames have elapsed because of the iOS bug that we work around below with the 1.5-second setTimout().
_lastUpdate = _getTime() - _lagThreshold + 5;
}
_req = (_fps === 0) ? _emptyFunc : (!_useRAF || !_reqAnimFrame) ? function(f) { return setTimeout(f, ((_nextTime - _self.time) * 1000 + 1) | 0); } : _reqAnimFrame;
if (_self === _ticker) {
_tickerActive = true;
}
_tick(2);
};

_self.fps = function(value) {
if (!arguments.length) {
return _fps;
}
_fps = value;
_gap = 1 / (_fps || 60);
_nextTime = this.time + _gap;
_self.wake();
};

_self.useRAF = function(value) {
if (!arguments.length) {
return _useRAF;
}
_self.sleep();
_useRAF = value;
_self.fps(_fps);
};
_self.fps(fps);

//a bug in iOS 6 Safari occasionally prevents the requestAnimationFrame from working initially, so we use a 1.5-second timeout that automatically falls back to setTimeout() if it senses this condition.
setTimeout(function() {
if (_useRAF && _self.frame < 5) {
_self.useRAF(false);
}
}, 1500);
});

p = gs.Ticker.prototype = new gs.events.EventDispatcher();
p.constructor = gs.Ticker;


/*
 * ----------------------------------------------------------------
 * Animation
 * ----------------------------------------------------------------
 */
var Animation = _class("core.Animation", function(duration, vars) {
this.vars = vars = vars || {};
this._duration = this._totalDuration = duration || 0;
this._delay = Number(vars.delay) || 0;
this._timeScale = 1;
this._active = (vars.immediateRender === true);
this.data = vars.data;
this._reversed = (vars.reversed === true);

if (!_rootTimeline) {
return;
}
if (!_tickerActive) { //some browsers (like iOS 6 Safari) shut down JavaScript execution when the tab is disabled and they [occasionally] neglect to start up requestAnimationFrame again when returning - this code ensures that the engine starts up again properly.
_ticker.wake();
}

var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
tl.add(this, tl._time);

if (this.vars.paused) {
this.paused(true);
}
});

_ticker = Animation.ticker = new gs.Ticker();
p = Animation.prototype;
p._dirty = p._gc = p._initted = p._paused = false;
p._totalTime = p._time = 0;
p._rawPrevTime = -1;
p._next = p._last = p._onUpdate = p._timeline = p.timeline = null;
p._paused = false;


//some browsers (like iOS) occasionally drop the requestAnimationFrame event when the user switches to a different tab and then comes back again, so we use a 2-second setTimeout() to sense if/when that condition occurs and then wake() the ticker.
var _checkTimeout = function() {
if (_tickerActive && _getTime() - _lastUpdate > 2000) {
_ticker.wake();
}
setTimeout(_checkTimeout, 2000);
};
_checkTimeout();


p.play = function(from, suppressEvents) {
if (from != null) {
this.seek(from, suppressEvents);
}
return this.reversed(false).paused(false);
};

p.pause = function(atTime, suppressEvents) {
if (atTime != null) {
this.seek(atTime, suppressEvents);
}
return this.paused(true);
};

p.resume = function(from, suppressEvents) {
if (from != null) {
this.seek(from, suppressEvents);
}
return this.paused(false);
};

p.seek = function(time, suppressEvents) {
return this.totalTime(Number(time), suppressEvents !== false);
};

p.restart = function(includeDelay, suppressEvents) {
return this.reversed(false).paused(false).totalTime(includeDelay ? -this._delay : 0, (suppressEvents !== false), true);
};

p.reverse = function(from, suppressEvents) {
if (from != null) {
this.seek((from || this.totalDuration()), suppressEvents);
}
return this.reversed(true).paused(false);
};

p.render = function(time, suppressEvents, force) {
//stub - we override this method in subclasses.
};

p.invalidate = function() {
this._time = this._totalTime = 0;
this._initted = this._gc = false;
this._rawPrevTime = -1;
if (this._gc || !this.timeline) {
this._enabled(true);
}
return this;
};

p.isActive = function() {
var tl = this._timeline, //the 2 root timelines won't have a _timeline; they're always active.
startTime = this._startTime,
rawTime;
return (!tl || (!this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale));
};

p._enabled = function (enabled, ignoreTimeline) {
if (!_tickerActive) {
_ticker.wake();
}
this._gc = !enabled;
this._active = this.isActive();
if (ignoreTimeline !== true) {
if (enabled && !this.timeline) {
this._timeline.add(this, this._startTime - this._delay);
} else if (!enabled && this.timeline) {
this._timeline._remove(this, true);
}
}
return false;
};


p._kill = function(vars, target) {
return this._enabled(false, false);
};

p.kill = function(vars, target) {
this._kill(vars, target);
return this;
};

p._uncache = function(includeSelf) {
var tween = includeSelf ? this : this.timeline;
while (tween) {
tween._dirty = true;
tween = tween.timeline;
}
return this;
};

p._swapSelfInParams = function(params) {
var i = params.length,
copy = params.concat();
while (--i > -1) {
if (params[i] === "{self}") {
copy[i] = this;
}
}
return copy;
};

p._callback = function(type) {
var v = this.vars;
v[type].apply(v[type + "Scope"] || v.callbackScope || this, v[type + "Params"] || _blankArray);
};

//----Animation getters/setters --------------------------------------------------------

p.eventCallback = function(type, callback, params, scope) {
if ((type || "").substr(0,2) === "on") {
var v = this.vars;
if (arguments.length === 1) {
return v[type];
}
if (callback == null) {
delete v[type];
} else {
v[type] = callback;
v[type + "Params"] = (_isArray(params) && params.join("").indexOf("{self}") !== -1) ? this._swapSelfInParams(params) : params;
v[type + "Scope"] = scope;
}
if (type === "onUpdate") {
this._onUpdate = callback;
}
}
return this;
};

p.delay = function(value) {
if (!arguments.length) {
return this._delay;
}
if (this._timeline.smoothChildTiming) {
this.startTime( this._startTime + value - this._delay );
}
this._delay = value;
return this;
};

p.duration = function(value) {
if (!arguments.length) {
this._dirty = false;
return this._duration;
}
this._duration = this._totalDuration = value;
this._uncache(true); //true in case it's a TweenMax or TimelineMax that has a repeat - we'll need to refresh the totalDuration.
if (this._timeline.smoothChildTiming) if (this._time > 0) if (this._time < this._duration) if (value !== 0) {
this.totalTime(this._totalTime * (value / this._duration), true);
}
return this;
};

p.totalDuration = function(value) {
this._dirty = false;
return (!arguments.length) ? this._totalDuration : this.duration(value);
};

p.time = function(value, suppressEvents) {
if (!arguments.length) {
return this._time;
}
if (this._dirty) {
this.totalDuration();
}
return this.totalTime((value > this._duration) ? this._duration : value, suppressEvents);
};

p.totalTime = function(time, suppressEvents, uncapped) {
if (!_tickerActive) {
_ticker.wake();
}
if (!arguments.length) {
return this._totalTime;
}
if (this._timeline) {
if (time < 0 && !uncapped) {
time += this.totalDuration();
}
if (this._timeline.smoothChildTiming) {
if (this._dirty) {
this.totalDuration();
}
var totalDuration = this._totalDuration,
tl = this._timeline;
if (time > totalDuration && !uncapped) {
time = totalDuration;
}
this._startTime = (this._paused ? this._pauseTime : tl._time) - ((!this._reversed ? time : totalDuration - time) / this._timeScale);
if (!tl._dirty) { //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
this._uncache(false);
}
//in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The startTime of that child would get pushed out, but one of the ancestors may have completed.
if (tl._timeline) {
while (tl._timeline) {
if (tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale) {
tl.totalTime(tl._totalTime, true);
}
tl = tl._timeline;
}
}
}
if (this._gc) {
this._enabled(true, false);
}
if (this._totalTime !== time || this._duration === 0) {
this.render(time, suppressEvents, false);
if (_lazyTweens.length) { //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
_lazyRender();
}
}
}
return this;
};

p.progress = p.totalProgress = function(value, suppressEvents) {
return (!arguments.length) ? this._time / this.duration() : this.totalTime(this.duration() * value, suppressEvents);
};

p.startTime = function(value) {
if (!arguments.length) {
return this._startTime;
}
if (value !== this._startTime) {
this._startTime = value;
if (this.timeline) if (this.timeline._sortChildren) {
this.timeline.add(this, value - this._delay); //ensures that any necessary re-sequencing of Animations in the timeline occurs to make sure the rendering order is correct.
}
}
return this;
};

p.endTime = function(includeRepeats) {
return this._startTime + ((includeRepeats != false) ? this.totalDuration() : this.duration()) / this._timeScale;
};

p.timeScale = function(value) {
if (!arguments.length) {
return this._timeScale;
}
value = value || _tinyNum; //can't allow zero because it'll throw the math off
if (this._timeline && this._timeline.smoothChildTiming) {
var pauseTime = this._pauseTime,
t = (pauseTime || pauseTime === 0) ? pauseTime : this._timeline.totalTime();
this._startTime = t - ((t - this._startTime) * this._timeScale / value);
}
this._timeScale = value;
return this._uncache(false);
};

p.reversed = function(value) {
if (!arguments.length) {
return this._reversed;
}
if (value != this._reversed) {
this._reversed = value;
this.totalTime(((this._timeline && !this._timeline.smoothChildTiming) ? this.totalDuration() - this._totalTime : this._totalTime), true);
}
return this;
};

p.paused = function(value) {
if (!arguments.length) {
return this._paused;
}
var tl = this._timeline,
raw, elapsed;
if (value != this._paused) if (tl) {
if (!_tickerActive && !value) {
_ticker.wake();
}
raw = tl.rawTime();
elapsed = raw - this._pauseTime;
if (!value && tl.smoothChildTiming) {
this._startTime += elapsed;
this._uncache(false);
}
this._pauseTime = value ? raw : null;
this._paused = value;
this._active = this.isActive();
if (!value && elapsed !== 0 && this._initted && this.duration()) {
this.render((tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale), true, true); //in case the target's properties changed via some other tween or manual update by the user, we should force a render.
}
}
if (this._gc && !value) {
this._enabled(true, false);
}
return this;
};


/*
 * ----------------------------------------------------------------
 * SimpleTimeline
 * ----------------------------------------------------------------
 */
var SimpleTimeline = _class("core.SimpleTimeline", function(vars) {
Animation.call(this, 0, vars);
this.autoRemoveChildren = this.smoothChildTiming = true;
});

p = SimpleTimeline.prototype = new Animation();
p.constructor = SimpleTimeline;
p.kill()._gc = false;
p._first = p._last = p._recent = null;
p._sortChildren = false;

p.add = p.insert = function(child, position, align, stagger) {
var prevTween, st;
child._startTime = Number(position || 0) + child._delay;
if (child._paused) if (this !== child._timeline) { //we only adjust the _pauseTime if it wasn't in this timeline already. Remember, sometimes a tween will be inserted again into the same timeline when its startTime is changed so that the tweens in the TimelineLite/Max are re-ordered properly in the linked list (so everything renders in the proper order).
child._pauseTime = child._startTime + ((this.rawTime() - child._startTime) / child._timeScale);
}
if (child.timeline) {
child.timeline._remove(child, true); //removes from existing timeline so that it can be properly added to this one.
}
child.timeline = child._timeline = this;
if (child._gc) {
child._enabled(true, true);
}
prevTween = this._last;
if (this._sortChildren) {
st = child._startTime;
while (prevTween && prevTween._startTime > st) {
prevTween = prevTween._prev;
}
}
if (prevTween) {
child._next = prevTween._next;
prevTween._next = child;
} else {
child._next = this._first;
this._first = child;
}
if (child._next) {
child._next._prev = child;
} else {
this._last = child;
}
child._prev = prevTween;
this._recent = child;
if (this._timeline) {
this._uncache(true);
}
return this;
};

p._remove = function(tween, skipDisable) {
if (tween.timeline === this) {
if (!skipDisable) {
tween._enabled(false, true);
}

if (tween._prev) {
tween._prev._next = tween._next;
} else if (this._first === tween) {
this._first = tween._next;
}
if (tween._next) {
tween._next._prev = tween._prev;
} else if (this._last === tween) {
this._last = tween._prev;
}
tween._next = tween._prev = tween.timeline = null;
if (tween === this._recent) {
this._recent = this._last;
}

if (this._timeline) {
this._uncache(true);
}
}
return this;
};

p.render = function(time, suppressEvents, force) {
var tween = this._first,
next;
this._totalTime = this._time = this._rawPrevTime = time;
while (tween) {
next = tween._next; //record it here because the value could change after rendering...
if (tween._active || (time >= tween._startTime && !tween._paused)) {
if (!tween._reversed) {
tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force);
} else {
tween.render(((!tween._dirty) ? tween._totalDuration : tween.totalDuration()) - ((time - tween._startTime) * tween._timeScale), suppressEvents, force);
}
}
tween = next;
}
};

p.rawTime = function() {
if (!_tickerActive) {
_ticker.wake();
}
return this._totalTime;
};

/*
 * ----------------------------------------------------------------
 * TweenLite
 * ----------------------------------------------------------------
 */
var TweenLite = _class("TweenLite", function(target, duration, vars) {
Animation.call(this, duration, vars);
this.render = TweenLite.prototype.render; //speed optimization (avoid prototype lookup on this "hot" method)

if (target == null) {
throw "Cannot tween a null target.";
}

this.target = target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;

var isSelector = (target.jquery || (target.length && target !== window && target[0] && (target[0] === window || (target[0].nodeType && target[0].style && !target.nodeType)))),
overwrite = this.vars.overwrite,
i, targ, targets;

this._overwrite = overwrite = (overwrite == null) ? _overwriteLookup[TweenLite.defaultOverwrite] : (typeof(overwrite) === "number") ? overwrite >> 0 : _overwriteLookup[overwrite];

if ((isSelector || target instanceof Array || (target.push && _isArray(target))) && typeof(target[0]) !== "number") {
this._targets = targets = _slice(target); //don't use Array.prototype.slice.call(target, 0) because that doesn't work in IE8 with a NodeList that's returned by querySelectorAll()
this._propLookup = [];
this._siblings = [];
for (i = 0; i < targets.length; i++) {
targ = targets[i];
if (!targ) {
targets.splice(i--, 1);
continue;
} else if (typeof(targ) === "string") {
targ = targets[i--] = TweenLite.selector(targ); //in case it's an array of strings
if (typeof(targ) === "string") {
targets.splice(i+1, 1); //to avoid an endless loop (can't imagine why the selector would return a string, but just in case)
}
continue;
} else if (targ.length && targ !== window && targ[0] && (targ[0] === window || (targ[0].nodeType && targ[0].style && !targ.nodeType))) { //in case the user is passing in an array of selector objects (like jQuery objects), we need to check one more level and pull things out if necessary. Also note that <select> elements pass all the criteria regarding length and the first child having style, so we must also check to ensure the target isn't an HTML node itself.
targets.splice(i--, 1);
this._targets = targets = targets.concat(_slice(targ));
continue;
}
this._siblings[i] = _register(targ, this, false);
if (overwrite === 1) if (this._siblings[i].length > 1) {
_applyOverwrite(targ, this, null, 1, this._siblings[i]);
}
}

} else {
this._propLookup = {};
this._siblings = _register(target, this, false);
if (overwrite === 1) if (this._siblings.length > 1) {
_applyOverwrite(target, this, null, 1, this._siblings);
}
}
if (this.vars.immediateRender || (duration === 0 && this._delay === 0 && this.vars.immediateRender !== false)) {
this._time = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)
this.render(-this._delay);
}
}, true),
_isSelector = function(v) {
return (v && v.length && v !== window && v[0] && (v[0] === window || (v[0].nodeType && v[0].style && !v.nodeType))); //we cannot check "nodeType" if the target is window from within an iframe, otherwise it will trigger a security error in some browsers like Firefox.
},
_autoCSS = function(vars, target) {
var css = {},
p;
for (p in vars) {
if (!_reservedProps[p] && (!(p in target) || p === "transform" || p === "x" || p === "y" || p === "width" || p === "height" || p === "className" || p === "border") && (!_plugins[p] || (_plugins[p] && _plugins[p]._autoCSS))) { //note: <img> elements contain read-only "x" and "y" properties. We should also prioritize editing css width/height rather than the element's properties.
css[p] = vars[p];
delete vars[p];
}
}
vars.css = css;
};

p = TweenLite.prototype = new Animation();
p.constructor = TweenLite;
p.kill()._gc = false;

//----TweenLite defaults, overwrite management, and root updates ----------------------------------------------------

p.ratio = 0;
p._firstPT = p._targets = p._overwrittenProps = p._startAt = null;
p._notifyPluginsOfEnabled = p._lazy = false;

TweenLite.version = "1.17.0";
TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1);
TweenLite.defaultOverwrite = "auto";
TweenLite.ticker = _ticker;
TweenLite.autoSleep = 120;
TweenLite.lagSmoothing = function(threshold, adjustedLag) {
_ticker.lagSmoothing(threshold, adjustedLag);
};

TweenLite.selector = window.$ || window.jQuery || function(e) {
var selector = window.$ || window.jQuery;
if (selector) {
TweenLite.selector = selector;
return selector(e);
}
return (typeof(document) === "undefined") ? e : (document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById((e.charAt(0) === "#") ? e.substr(1) : e));
};

var _lazyTweens = [],
_lazyLookup = {},
_internals = TweenLite._internals = {isArray:_isArray, isSelector:_isSelector, lazyTweens:_lazyTweens}, //gives us a way to expose certain private values to other GreenSock classes without contaminating tha main TweenLite object.
_plugins = TweenLite._plugins = {},
_tweenLookup = _internals.tweenLookup = {},
_tweenLookupNum = 0,
_reservedProps = _internals.reservedProps = {ease:1, delay:1, overwrite:1, onComplete:1, onCompleteParams:1, onCompleteScope:1, useFrames:1, runBackwards:1, startAt:1, onUpdate:1, onUpdateParams:1, onUpdateScope:1, onStart:1, onStartParams:1, onStartScope:1, onReverseComplete:1, onReverseCompleteParams:1, onReverseCompleteScope:1, onRepeat:1, onRepeatParams:1, onRepeatScope:1, easeParams:1, yoyo:1, immediateRender:1, repeat:1, repeatDelay:1, data:1, paused:1, reversed:1, autoCSS:1, lazy:1, onOverwrite:1, callbackScope:1},
_overwriteLookup = {none:0, all:1, auto:2, concurrent:3, allOnStart:4, preexisting:5, "true":1, "false":0},
_rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline(),
_rootTimeline = Animation._rootTimeline = new SimpleTimeline(),
_nextGCFrame = 30,
_lazyRender = _internals.lazyRender = function() {
var i = _lazyTweens.length,
tween;
_lazyLookup = {};
while (--i > -1) {
tween = _lazyTweens[i];
if (tween && tween._lazy !== false) {
tween.render(tween._lazy[0], tween._lazy[1], true);
tween._lazy = false;
}
}
_lazyTweens.length = 0;
};

_rootTimeline._startTime = _ticker.time;
_rootFramesTimeline._startTime = _ticker.frame;
_rootTimeline._active = _rootFramesTimeline._active = true;
setTimeout(_lazyRender, 1); //on some mobile devices, there isn't a "tick" before code runs which means any lazy renders wouldn't run before the next official "tick".

Animation._updateRoot = TweenLite.render = function() {
var i, a, p;
if (_lazyTweens.length) { //if code is run outside of the requestAnimationFrame loop, there may be tweens queued AFTER the engine refreshed, so we need to ensure any pending renders occur before we refresh again.
_lazyRender();
}
_rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, false, false);
_rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, false, false);
if (_lazyTweens.length) {
_lazyRender();
}
if (_ticker.frame >= _nextGCFrame) { //dump garbage every 120 frames or whatever the user sets TweenLite.autoSleep to
_nextGCFrame = _ticker.frame + (parseInt(TweenLite.autoSleep, 10) || 120);
for (p in _tweenLookup) {
a = _tweenLookup[p].tweens;
i = a.length;
while (--i > -1) {
if (a[i]._gc) {
a.splice(i, 1);
}
}
if (a.length === 0) {
delete _tweenLookup[p];
}
}
//if there are no more tweens in the root timelines, or if they're all paused, make the _timer sleep to reduce load on the CPU slightly
p = _rootTimeline._first;
if (!p || p._paused) if (TweenLite.autoSleep && !_rootFramesTimeline._first && _ticker._listeners.tick.length === 1) {
while (p && p._paused) {
p = p._next;
}
if (!p) {
_ticker.sleep();
}
}
}
};

_ticker.addEventListener("tick", Animation._updateRoot);

var _register = function(target, tween, scrub) {
var id = target._gsTweenID, a, i;
if (!_tweenLookup[id || (target._gsTweenID = id = "t" + (_tweenLookupNum++))]) {
_tweenLookup[id] = {target:target, tweens:[]};
}
if (tween) {
a = _tweenLookup[id].tweens;
a[(i = a.length)] = tween;
if (scrub) {
while (--i > -1) {
if (a[i] === tween) {
a.splice(i, 1);
}
}
}
}
return _tweenLookup[id].tweens;
},

_onOverwrite = function(overwrittenTween, overwritingTween, target, killedProps) {
var func = overwrittenTween.vars.onOverwrite, r1, r2;
if (func) {
r1 = func(overwrittenTween, overwritingTween, target, killedProps);
}
func = TweenLite.onOverwrite;
if (func) {
r2 = func(overwrittenTween, overwritingTween, target, killedProps);
}
return (r1 !== false && r2 !== false);
},
_applyOverwrite = function(target, tween, props, mode, siblings) {
var i, changed, curTween, l;
if (mode === 1 || mode >= 4) {
l = siblings.length;
for (i = 0; i < l; i++) {
if ((curTween = siblings[i]) !== tween) {
if (!curTween._gc) {
if (curTween._kill(null, target, tween)) {
changed = true;
}
}
} else if (mode === 5) {
break;
}
}
return changed;
}
//NOTE: Add 0.0000000001 to overcome floating point errors that can cause the startTime to be VERY slightly off (when a tween's time() is set for example)
var startTime = tween._startTime + _tinyNum,
overlaps = [],
oCount = 0,
zeroDur = (tween._duration === 0),
globalStart;
i = siblings.length;
while (--i > -1) {
if ((curTween = siblings[i]) === tween || curTween._gc || curTween._paused) {
//ignore
} else if (curTween._timeline !== tween._timeline) {
globalStart = globalStart || _checkOverlap(tween, 0, zeroDur);
if (_checkOverlap(curTween, globalStart, zeroDur) === 0) {
overlaps[oCount++] = curTween;
}
} else if (curTween._startTime <= startTime) if (curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime) if (!((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 0.0000000002)) {
overlaps[oCount++] = curTween;
}
}

i = oCount;
while (--i > -1) {
curTween = overlaps[i];
if (mode === 2) if (curTween._kill(props, target, tween)) {
changed = true;
}
if (mode !== 2 || (!curTween._firstPT && curTween._initted)) {
if (mode !== 2 && !_onOverwrite(curTween, tween)) {
continue;
}
if (curTween._enabled(false, false)) { //if all property tweens have been overwritten, kill the tween.
changed = true;
}
}
}
return changed;
},

_checkOverlap = function(tween, reference, zeroDur) {
var tl = tween._timeline,
ts = tl._timeScale,
t = tween._startTime;
while (tl._timeline) {
t += tl._startTime;
ts *= tl._timeScale;
if (tl._paused) {
return -100;
}
tl = tl._timeline;
}
t /= ts;
return (t > reference) ? t - reference : ((zeroDur && t === reference) || (!tween._initted && t - reference < 2 * _tinyNum)) ? _tinyNum : ((t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum) ? 0 : t - reference - _tinyNum;
};


//---- TweenLite instance methods -----------------------------------------------------------------------------

p._init = function() {
var v = this.vars,
op = this._overwrittenProps,
dur = this._duration,
immediate = !!v.immediateRender,
ease = v.ease,
i, initPlugins, pt, p, startVars;
if (v.startAt) {
if (this._startAt) {
this._startAt.render(-1, true); //if we've run a startAt previously (when the tween instantiated), we should revert it so that the values re-instantiate correctly particularly for relative tweens. Without this, a TweenLite.fromTo(obj, 1, {x:"+=100"}, {x:"-=100"}), for example, would actually jump to +=200 because the startAt would run twice, doubling the relative change.
this._startAt.kill();
}
startVars = {};
for (p in v.startAt) { //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, 1, from, to).fromTo(e, 1, to, from);
startVars[p] = v.startAt[p];
}
startVars.overwrite = false;
startVars.immediateRender = true;
startVars.lazy = (immediate && v.lazy !== false);
startVars.startAt = startVars.delay = null; //no nesting of startAt objects allowed (otherwise it could cause an infinite loop).
this._startAt = TweenLite.to(this.target, 0, startVars);
if (immediate) {
if (this._time > 0) {
this._startAt = null; //tweens that render immediately (like most from() and fromTo() tweens) shouldn't revert when their parent timeline's playhead goes backward past the startTime because the initial render could have happened anytime and it shouldn't be directly correlated to this tween's startTime. Imagine setting up a complex animation where the beginning states of various objects are rendered immediately but the tween doesn't happen for quite some time - if we revert to the starting values as soon as the playhead goes backward past the tween's startTime, it will throw things off visually. Reversion should only happen in TimelineLite/Max instances where immediateRender was false (which is the default in the convenience methods like from()).
} else if (dur !== 0) {
return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a TimelineLite or TimelineMax, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
}
}
} else if (v.runBackwards && dur !== 0) {
//from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
if (this._startAt) {
this._startAt.render(-1, true);
this._startAt.kill();
this._startAt = null;
} else {
if (this._time !== 0) { //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0
immediate = false;
}
pt = {};
for (p in v) { //copy props into a new object and skip any reserved props, otherwise onComplete or onUpdate or onStart could fire. We should, however, permit autoCSS to go through.
if (!_reservedProps[p] || p === "autoCSS") {
pt[p] = v[p];
}
}
pt.overwrite = 0;
pt.data = "isFromStart"; //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
pt.lazy = (immediate && v.lazy !== false);
pt.immediateRender = immediate; //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
this._startAt = TweenLite.to(this.target, 0, pt);
if (!immediate) {
this._startAt._init(); //ensures that the initial values are recorded
this._startAt._enabled(false); //no need to have the tween render on the next cycle. Disable it because we'll always manually control the renders of the _startAt tween.
if (this.vars.immediateRender) {
this._startAt = null;
}
} else if (this._time === 0) {
return;
}
}
}
this._ease = ease = (!ease) ? TweenLite.defaultEase : (ease instanceof Ease) ? ease : (typeof(ease) === "function") ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase;
if (v.easeParams instanceof Array && ease.config) {
this._ease = ease.config.apply(ease, v.easeParams);
}
this._easeType = this._ease._type;
this._easePower = this._ease._power;
this._firstPT = null;

if (this._targets) {
i = this._targets.length;
while (--i > -1) {
if ( this._initProps( this._targets[i], (this._propLookup[i] = {}), this._siblings[i], (op ? op[i] : null)) ) {
initPlugins = true;
}
}
} else {
initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
}

if (initPlugins) {
TweenLite._onPluginEvent("_onInitAllProps", this); //reorders the array in order of priority. Uses a static TweenPlugin method in order to minimize file size in TweenLite
}
if (op) if (!this._firstPT) if (typeof(this.target) !== "function") { //if all tweening properties have been overwritten, kill the tween. If the target is a function, it's probably a delayedCall so let it live.
this._enabled(false, false);
}
if (v.runBackwards) {
pt = this._firstPT;
while (pt) {
pt.s += pt.c;
pt.c = -pt.c;
pt = pt._next;
}
}
this._onUpdate = v.onUpdate;
this._initted = true;
};

p._initProps = function(target, propLookup, siblings, overwrittenProps) {
var p, i, initPlugins, plugin, pt, v;
if (target == null) {
return false;
}

if (_lazyLookup[target._gsTweenID]) {
_lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)
}

if (!this.vars.css) if (target.style) if (target !== window && target.nodeType) if (_plugins.css) if (this.vars.autoCSS !== false) { //it's so common to use TweenLite/Max to animate the css of DOM elements, we assume that if the target is a DOM element, that's what is intended (a convenience so that users don't have to wrap things in css:{}, although we still recommend it for a slight performance boost and better specificity). Note: we cannot check "nodeType" on the window inside an iframe.
_autoCSS(this.vars, target);
}
for (p in this.vars) {
v = this.vars[p];
if (_reservedProps[p]) {
if (v) if ((v instanceof Array) || (v.push && _isArray(v))) if (v.join("").indexOf("{self}") !== -1) {
this.vars[p] = v = this._swapSelfInParams(v, this);
}

} else if (_plugins[p] && (plugin = new _plugins[p]())._onInitTween(target, this.vars[p], this)) {

//t - target [object]
//p - property [string]
//s - start[number]
//c - change[number]
//f - isFunction[boolean]
//n - name[string]
//pg - isPlugin [boolean]
//pr - priority[number]
this._firstPT = pt = {_next:this._firstPT, t:plugin, p:"setRatio", s:0, c:1, f:true, n:p, pg:true, pr:plugin._priority};
i = plugin._overwriteProps.length;
while (--i > -1) {
propLookup[plugin._overwriteProps[i]] = this._firstPT;
}
if (plugin._priority || plugin._onInitAllProps) {
initPlugins = true;
}
if (plugin._onDisable || plugin._onEnable) {
this._notifyPluginsOfEnabled = true;
}

} else {
this._firstPT = propLookup[p] = pt = {_next:this._firstPT, t:target, p:p, f:(typeof(target[p]) === "function"), n:p, pg:false, pr:0};
pt.s = (!pt.f) ? parseFloat(target[p]) : target[ ((p.indexOf("set") || typeof(target["get" + p.substr(3)]) !== "function") ? p : "get" + p.substr(3)) ]();
pt.c = (typeof(v) === "string" && v.charAt(1) === "=") ? parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : (Number(v) - pt.s) || 0;
}
if (pt) if (pt._next) {
pt._next._prev = pt;
}
}

if (overwrittenProps) if (this._kill(overwrittenProps, target)) { //another tween may have tried to overwrite properties of this tween before init() was called (like if two tweens start at the same time, the one created second will run first)
return this._initProps(target, propLookup, siblings, overwrittenProps);
}
if (this._overwrite > 1) if (this._firstPT) if (siblings.length > 1) if (_applyOverwrite(target, this, propLookup, this._overwrite, siblings)) {
this._kill(propLookup, target);
return this._initProps(target, propLookup, siblings, overwrittenProps);
}
if (this._firstPT) if ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration)) { //zero duration tweens don't lazy render by default; everything else does.
_lazyLookup[target._gsTweenID] = true;
}
return initPlugins;
};

p.render = function(time, suppressEvents, force) {
var prevTime = this._time,
duration = this._duration,
prevRawPrevTime = this._rawPrevTime,
isComplete, callback, pt, rawPrevTime;
if (time >= duration) {
this._totalTime = this._time = duration;
this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1;
if (!this._reversed ) {
isComplete = true;
callback = "onComplete";
force = (force || this._timeline.autoRemoveChildren); //otherwise, if the animation is unpaused/activated after it's already finished, it doesn't get removed from the parent timeline.
}
if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
if (this._startTime === this._timeline._duration) { //if a zero-duration tween is at the VERY end of a timeline and that timeline renders at its end, it will typically add a tiny bit of cushion to the render time to prevent rounding errors from getting in the way of tweens rendering their VERY end. If we then reverse() that timeline, the zero-duration tween will trigger its onReverseComplete even though technically the playhead didn't pass over it again. It's a very specific edge case we must accommodate.
time = 0;
}
if (time === 0 || prevRawPrevTime < 0 || (prevRawPrevTime === _tinyNum && this.data !== "isPause")) if (prevRawPrevTime !== time) { //note: when this.data is "isPause", it's a callback added by addPause() on a timeline that we should not be triggered when LEAVING its exact start time. In other words, tl.addPause(1).play(1) shouldn't pause.
force = true;
if (prevRawPrevTime > _tinyNum) {
callback = "onReverseComplete";
}
}
this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
}

} else if (time < 0.0000001) { //to work around occasional floating point math artifacts, round super small values to 0.
this._totalTime = this._time = 0;
this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0;
if (prevTime !== 0 || (duration === 0 && prevRawPrevTime > 0)) {
callback = "onReverseComplete";
isComplete = this._reversed;
}
if (time < 0) {
this._active = false;
if (duration === 0) if (this._initted || !this.vars.lazy || force) { //zero-duration tweens are tricky because we must discern the momentum/direction of time in order to determine whether the starting values should be rendered or the ending values. If the "playhead" of its timeline goes past the zero-duration tween in the forward direction or lands directly on it, the end values should be rendered, but if the timeline's "playhead" moves past it in the backward direction (from a postitive time to a negative time), the starting values must be rendered.
if (prevRawPrevTime >= 0 && !(prevRawPrevTime === _tinyNum && this.data === "isPause")) {
force = true;
}
this._rawPrevTime = rawPrevTime = (!suppressEvents || time || prevRawPrevTime === time) ? time : _tinyNum; //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect. We set the _rawPrevTime to be a precise tiny number to indicate this scenario rather than using another property/variable which would increase memory usage. This technique is less readable, but more efficient.
}
}
if (!this._initted) { //if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
force = true;
}
} else {
this._totalTime = this._time = time;

if (this._easeType) {
var r = time / duration, type = this._easeType, pow = this._easePower;
if (type === 1 || (type === 3 && r >= 0.5)) {
r = 1 - r;
}
if (type === 3) {
r *= 2;
}
if (pow === 1) {
r *= r;
} else if (pow === 2) {
r *= r * r;
} else if (pow === 3) {
r *= r * r * r;
} else if (pow === 4) {
r *= r * r * r * r;
}

if (type === 1) {
this.ratio = 1 - r;
} else if (type === 2) {
this.ratio = r;
} else if (time / duration < 0.5) {
this.ratio = r / 2;
} else {
this.ratio = 1 - (r / 2);
}

} else {
this.ratio = this._ease.getRatio(time / duration);
}
}

if (this._time === prevTime && !force) {
return;
} else if (!this._initted) {
this._init();
if (!this._initted || this._gc) { //immediateRender tweens typically won't initialize until the playhead advances (_time is greater than 0) in order to ensure that overwriting occurs properly. Also, if all of the tweening properties have been overwritten (which would cause _gc to be true, as set in _init()), we shouldn't continue otherwise an onStart callback could be called for example.
return;
} else if (!force && this._firstPT && ((this.vars.lazy !== false && this._duration) || (this.vars.lazy && !this._duration))) {
this._time = this._totalTime = prevTime;
this._rawPrevTime = prevRawPrevTime;
_lazyTweens.push(this);
this._lazy = [time, suppressEvents];
return;
}
//_ease is initially set to defaultEase, so now that init() has run, _ease is set properly and we need to recalculate the ratio. Overall this is faster than using conditional logic earlier in the method to avoid having to set ratio twice because we only init() once but renderTime() gets called VERY frequently.
if (this._time && !isComplete) {
this.ratio = this._ease.getRatio(this._time / duration);
} else if (isComplete && this._ease._calcEnd) {
this.ratio = this._ease.getRatio((this._time === 0) ? 0 : 1);
}
}
if (this._lazy !== false) { //in case a lazy render is pending, we should flush it because the new render is occurring now (imagine a lazy tween instantiating and then immediately the user calls tween.seek(tween.duration()), skipping to the end - the end render would be forced, and then if we didn't flush the lazy render, it'd fire AFTER the seek(), rendering it at the wrong time.
this._lazy = false;
}
if (!this._active) if (!this._paused && this._time !== prevTime && time >= 0) {
this._active = true; //so that if the user renders a tween (as opposed to the timeline rendering it), the timeline is forced to re-render and align it with the proper time/frame on the next rendering cycle. Maybe the tween already finished but the user manually re-renders it as halfway done.
}
if (prevTime === 0) {
if (this._startAt) {
if (time >= 0) {
this._startAt.render(time, suppressEvents, force);
} else if (!callback) {
callback = "_dummyGS"; //if no callback is defined, use a dummy value just so that the condition at the end evaluates as true because _startAt should render AFTER the normal render loop when the time is negative. We could handle this in a more intuitive way, of course, but the render loop is the MOST important thing to optimize, so this technique allows us to avoid adding extra conditional logic in a high-frequency area.
}
}
if (this.vars.onStart) if (this._time !== 0 || duration === 0) if (!suppressEvents) {
this._callback("onStart");
}
}
pt = this._firstPT;
while (pt) {
if (pt.f) {
pt.t[pt.p](pt.c * this.ratio + pt.s);
} else {
pt.t[pt.p] = pt.c * this.ratio + pt.s;
}
pt = pt._next;
}

if (this._onUpdate) {
if (time < 0) if (this._startAt && time !== -0.0001) { //if the tween is positioned at the VERY beginning (_startTime 0) of its parent timeline, it's illegal for the playhead to go back further, so we should not render the recorded startAt values.
this._startAt.render(time, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.
}
if (!suppressEvents) if (this._time !== prevTime || isComplete) {
this._callback("onUpdate");
}
}
if (callback) if (!this._gc || force) { //check _gc because there's a chance that kill() could be called in an onUpdate
if (time < 0 && this._startAt && !this._onUpdate && time !== -0.0001) { //-0.0001 is a special value that we use when looping back to the beginning of a repeated TimelineMax, in which case we shouldn't render the _startAt values.
this._startAt.render(time, suppressEvents, force);
}
if (isComplete) {
if (this._timeline.autoRemoveChildren) {
this._enabled(false, false);
}
this._active = false;
}
if (!suppressEvents && this.vars[callback]) {
this._callback(callback);
}
if (duration === 0 && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum) { //the onComplete or onReverseComplete could trigger movement of the playhead and for zero-duration tweens (which must discern direction) that land directly back on their start time, we don't want to fire again on the next render. Think of several addPause()'s in a timeline that forces the playhead to a certain spot, but what if it's already paused and another tween is tweening the "time" of the timeline? Each time it moves [forward] past that spot, it would move back, and since suppressEvents is true, it'd reset _rawPrevTime to _tinyNum so that when it begins again, the callback would fire (so ultimately it could bounce back and forth during that tween). Again, this is a very uncommon scenario, but possible nonetheless.
this._rawPrevTime = 0;
}
}
};

p._kill = function(vars, target, overwritingTween) {
if (vars === "all") {
vars = null;
}
if (vars == null) if (target == null || target === this.target) {
this._lazy = false;
return this._enabled(false, false);
}
target = (typeof(target) !== "string") ? (target || this._targets || this.target) : TweenLite.selector(target) || target;
var simultaneousOverwrite = (overwritingTween && this._time && overwritingTween._startTime === this._startTime && this._timeline === overwritingTween._timeline),
i, overwrittenProps, p, pt, propLookup, changed, killProps, record, killed;
if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
i = target.length;
while (--i > -1) {
if (this._kill(vars, target[i], overwritingTween)) {
changed = true;
}
}
} else {
if (this._targets) {
i = this._targets.length;
while (--i > -1) {
if (target === this._targets[i]) {
propLookup = this._propLookup[i] || {};
this._overwrittenProps = this._overwrittenProps || [];
overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
break;
}
}
} else if (target !== this.target) {
return false;
} else {
propLookup = this._propLookup;
overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all";
}

if (propLookup) {
killProps = vars || propLookup;
record = (vars !== overwrittenProps && overwrittenProps !== "all" && vars !== propLookup && (typeof(vars) !== "object" || !vars._tempKill)); //_tempKill is a super-secret way to delete a particular tweening property but NOT have it remembered as an official overwritten property (like in BezierPlugin)
if (overwritingTween && (TweenLite.onOverwrite || this.vars.onOverwrite)) {
for (p in killProps) {
if (propLookup[p]) {
if (!killed) {
killed = [];
}
killed.push(p);
}
}
if ((killed || !vars) && !_onOverwrite(this, overwritingTween, target, killed)) { //if the onOverwrite returned false, that means the user wants to override the overwriting (cancel it).
return false;
}
}

for (p in killProps) {
if ((pt = propLookup[p])) {
if (simultaneousOverwrite) { //if another tween overwrites this one and they both start at exactly the same time, yet this tween has already rendered once (for example, at 0.001) because it's first in the queue, we should revert the values to where they were at 0 so that the starting values aren't contaminated on the overwriting tween.
if (pt.f) {
pt.t[pt.p](pt.s);
} else {
pt.t[pt.p] = pt.s;
}
changed = true;
}
if (pt.pg && pt.t._kill(killProps)) {
changed = true; //some plugins need to be notified so they can perform cleanup tasks first
}
if (!pt.pg || pt.t._overwriteProps.length === 0) {
if (pt._prev) {
pt._prev._next = pt._next;
} else if (pt === this._firstPT) {
this._firstPT = pt._next;
}
if (pt._next) {
pt._next._prev = pt._prev;
}
pt._next = pt._prev = null;
}
delete propLookup[p];
}
if (record) {
overwrittenProps[p] = 1;
}
}
if (!this._firstPT && this._initted) { //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.
this._enabled(false, false);
}
}
}
return changed;
};

p.invalidate = function() {
if (this._notifyPluginsOfEnabled) {
TweenLite._onPluginEvent("_onDisable", this);
}
this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null;
this._notifyPluginsOfEnabled = this._active = this._lazy = false;
this._propLookup = (this._targets) ? {} : [];
Animation.prototype.invalidate.call(this);
if (this.vars.immediateRender) {
this._time = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)
this.render(-this._delay);
}
return this;
};

p._enabled = function(enabled, ignoreTimeline) {
if (!_tickerActive) {
_ticker.wake();
}
if (enabled && this._gc) {
var targets = this._targets,
i;
if (targets) {
i = targets.length;
while (--i > -1) {
this._siblings[i] = _register(targets[i], this, true);
}
} else {
this._siblings = _register(this.target, this, true);
}
}
Animation.prototype._enabled.call(this, enabled, ignoreTimeline);
if (this._notifyPluginsOfEnabled) if (this._firstPT) {
return TweenLite._onPluginEvent((enabled ? "_onEnable" : "_onDisable"), this);
}
return false;
};


//----TweenLite static methods -----------------------------------------------------

TweenLite.to = function(target, duration, vars) {
return new TweenLite(target, duration, vars);
};

TweenLite.from = function(target, duration, vars) {
vars.runBackwards = true;
vars.immediateRender = (vars.immediateRender != false);
return new TweenLite(target, duration, vars);
};

TweenLite.fromTo = function(target, duration, fromVars, toVars) {
toVars.startAt = fromVars;
toVars.immediateRender = (toVars.immediateRender != false && fromVars.immediateRender != false);
return new TweenLite(target, duration, toVars);
};

TweenLite.delayedCall = function(delay, callback, params, scope, useFrames) {
return new TweenLite(callback, 0, {delay:delay, onComplete:callback, onCompleteParams:params, callbackScope:scope, onReverseComplete:callback, onReverseCompleteParams:params, immediateRender:false, lazy:false, useFrames:useFrames, overwrite:0});
};

TweenLite.set = function(target, vars) {
return new TweenLite(target, 0, vars);
};

TweenLite.getTweensOf = function(target, onlyActive) {
if (target == null) { return []; }
target = (typeof(target) !== "string") ? target : TweenLite.selector(target) || target;
var i, a, j, t;
if ((_isArray(target) || _isSelector(target)) && typeof(target[0]) !== "number") {
i = target.length;
a = [];
while (--i > -1) {
a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
}
i = a.length;
//now get rid of any duplicates (tweens of arrays of objects could cause duplicates)
while (--i > -1) {
t = a[i];
j = i;
while (--j > -1) {
if (t === a[j]) {
a.splice(i, 1);
}
}
}
} else {
a = _register(target).concat();
i = a.length;
while (--i > -1) {
if (a[i]._gc || (onlyActive && !a[i].isActive())) {
a.splice(i, 1);
}
}
}
return a;
};

TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function(target, onlyActive, vars) {
if (typeof(onlyActive) === "object") {
vars = onlyActive; //for backwards compatibility (before "onlyActive" parameter was inserted)
onlyActive = false;
}
var a = TweenLite.getTweensOf(target, onlyActive),
i = a.length;
while (--i > -1) {
a[i]._kill(vars, target);
}
};



/*
 * ----------------------------------------------------------------
 * TweenPlugin (could easily be split out as a separate file/class, but included for ease of use (so that people don't need to include another script call before loading plugins which is easy to forget)
 * ----------------------------------------------------------------
 */
var TweenPlugin = _class("plugins.TweenPlugin", function(props, priority) {
this._overwriteProps = (props || "").split(",");
this._propName = this._overwriteProps[0];
this._priority = priority || 0;
this._super = TweenPlugin.prototype;
}, true);

p = TweenPlugin.prototype;
TweenPlugin.version = "1.10.1";
TweenPlugin.API = 2;
p._firstPT = null;

p._addTween = function(target, prop, start, end, overwriteProp, round) {
var c, pt;
if (end != null && (c = (typeof(end) === "number" || end.charAt(1) !== "=") ? Number(end) - Number(start) : parseInt(end.charAt(0) + "1", 10) * Number(end.substr(2)))) {
this._firstPT = pt = {_next:this._firstPT, t:target, p:prop, s:start, c:c, f:(typeof(target[prop]) === "function"), n:overwriteProp || prop, r:round};
if (pt._next) {
pt._next._prev = pt;
}
return pt;
}
};

p.setRatio = function(v) {
var pt = this._firstPT,
min = 0.000001,
val;
while (pt) {
val = pt.c * v + pt.s;
if (pt.r) {
val = Math.round(val);
} else if (val < min) if (val > -min) { //prevents issues with converting very small numbers to strings in the browser
val = 0;
}
if (pt.f) {
pt.t[pt.p](val);
} else {
pt.t[pt.p] = val;
}
pt = pt._next;
}
};

p._kill = function(lookup) {
var a = this._overwriteProps,
pt = this._firstPT,
i;
if (lookup[this._propName] != null) {
this._overwriteProps = [];
} else {
i = a.length;
while (--i > -1) {
if (lookup[a[i]] != null) {
a.splice(i, 1);
}
}
}
while (pt) {
if (lookup[pt.n] != null) {
if (pt._next) {
pt._next._prev = pt._prev;
}
if (pt._prev) {
pt._prev._next = pt._next;
pt._prev = null;
} else if (this._firstPT === pt) {
this._firstPT = pt._next;
}
}
pt = pt._next;
}
return false;
};

p._roundProps = function(lookup, value) {
var pt = this._firstPT;
while (pt) {
if (lookup[this._propName] || (pt.n != null && lookup[ pt.n.split(this._propName + "_").join("") ])) { //some properties that are very plugin-specific add a prefix named after the _propName plus an underscore, so we need to ignore that extra stuff here.
pt.r = value;
}
pt = pt._next;
}
};

TweenLite._onPluginEvent = function(type, tween) {
var pt = tween._firstPT,
changed, pt2, first, last, next;
if (type === "_onInitAllProps") {
//sorts the PropTween linked list in order of priority because some plugins need to render earlier/later than others, like MotionBlurPlugin applies its effects after all x/y/alpha tweens have rendered on each frame.
while (pt) {
next = pt._next;
pt2 = first;
while (pt2 && pt2.pr > pt.pr) {
pt2 = pt2._next;
}
if ((pt._prev = pt2 ? pt2._prev : last)) {
pt._prev._next = pt;
} else {
first = pt;
}
if ((pt._next = pt2)) {
pt2._prev = pt;
} else {
last = pt;
}
pt = next;
}
pt = tween._firstPT = first;
}
while (pt) {
if (pt.pg) if (typeof(pt.t[type]) === "function") if (pt.t[type]()) {
changed = true;
}
pt = pt._next;
}
return changed;
};

TweenPlugin.activate = function(plugins) {
var i = plugins.length;
while (--i > -1) {
if (plugins[i].API === TweenPlugin.API) {
_plugins[(new plugins[i]())._propName] = plugins[i];
}
}
return true;
};

//provides a more concise way to define plugins that have no dependencies besides TweenPlugin and TweenLite, wrapping common boilerplate stuff into one function (added in 1.9.0). You don't NEED to use this to define a plugin - the old way still works and can be useful in certain (rare) situations.
_gsDefine.plugin = function(config) {
if (!config || !config.propName || !config.init || !config.API) { throw "illegal plugin definition."; }
var propName = config.propName,
priority = config.priority || 0,
overwriteProps = config.overwriteProps,
map = {init:"_onInitTween", set:"setRatio", kill:"_kill", round:"_roundProps", initAll:"_onInitAllProps"},
Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin",
function() {
TweenPlugin.call(this, propName, priority);
this._overwriteProps = overwriteProps || [];
}, (config.global === true)),
p = Plugin.prototype = new TweenPlugin(propName),
prop;
p.constructor = Plugin;
Plugin.API = config.API;
for (prop in map) {
if (typeof(config[prop]) === "function") {
p[map[prop]] = config[prop];
}
}
Plugin.version = config.version;
TweenPlugin.activate([Plugin]);
return Plugin;
};


//now run through all the dependencies discovered and if any are missing, log that to the console as a warning. This is why it's best to have TweenLite load last - it can check all the dependencies for you.
a = window._gsQueue;
if (a) {
for (i = 0; i < a.length; i++) {
a[i]();
}
for (p in _defLookup) {
if (!_defLookup[p].func) {
window.console.log("GSAP encountered missing dependency: com.greensock." + p);
}
}
}

_tickerActive = false; //ensures that the first official animation forces a ticker.tick() to update the time when it is instantiated

})((typeof(module) !== "undefined" && module.exports && typeof(global) !== "undefined") ? global : this || window, "TweenMax");
/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function(){function e(){}function t(e,t){for(var n=e.length;n--;)if(e[n].listener===t)return n;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var i=e.prototype,r=this,o=r.EventEmitter;i.getListeners=function(e){var t,n,i=this._getEvents();if("object"==typeof e){t={};for(n in i)i.hasOwnProperty(n)&&e.test(n)&&(t[n]=i[n])}else t=i[e]||(i[e]=[]);return t},i.flattenListeners=function(e){var t,n=[];for(t=0;e.length>t;t+=1)n.push(e[t].listener);return n},i.getListenersAsObject=function(e){var t,n=this.getListeners(e);return n instanceof Array&&(t={},t[e]=n),t||n},i.addListener=function(e,n){var i,r=this.getListenersAsObject(e),o="object"==typeof n;for(i in r)r.hasOwnProperty(i)&&-1===t(r[i],n)&&r[i].push(o?n:{listener:n,once:!1});return this},i.on=n("addListener"),i.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},i.once=n("addOnceListener"),i.defineEvent=function(e){return this.getListeners(e),this},i.defineEvents=function(e){for(var t=0;e.length>t;t+=1)this.defineEvent(e[t]);return this},i.removeListener=function(e,n){var i,r,o=this.getListenersAsObject(e);for(r in o)o.hasOwnProperty(r)&&(i=t(o[r],n),-1!==i&&o[r].splice(i,1));return this},i.off=n("removeListener"),i.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},i.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},i.manipulateListeners=function(e,t,n){var i,r,o=e?this.removeListener:this.addListener,s=e?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(i=n.length;i--;)o.call(this,t,n[i]);else for(i in t)t.hasOwnProperty(i)&&(r=t[i])&&("function"==typeof r?o.call(this,i,r):s.call(this,i,r));return this},i.removeEvent=function(e){var t,n=typeof e,i=this._getEvents();if("string"===n)delete i[e];else if("object"===n)for(t in i)i.hasOwnProperty(t)&&e.test(t)&&delete i[t];else delete this._events;return this},i.removeAllListeners=n("removeEvent"),i.emitEvent=function(e,t){var n,i,r,o,s=this.getListenersAsObject(e);for(r in s)if(s.hasOwnProperty(r))for(i=s[r].length;i--;)n=s[r][i],n.once===!0&&this.removeListener(e,n.listener),o=n.listener.apply(this,t||[]),o===this._getOnceReturnValue()&&this.removeListener(e,n.listener);return this},i.trigger=n("emitEvent"),i.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},i.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},i._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},i._getEvents=function(){return this._events||(this._events={})},e.noConflict=function(){return r.EventEmitter=o,e},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return e}):"object"==typeof module&&module.exports?module.exports=e:this.EventEmitter=e}).call(this),function(e){function t(t){var n=e.event;return n.target=n.target||n.srcElement||t,n}var n=document.documentElement,i=function(){};n.addEventListener?i=function(e,t,n){e.addEventListener(t,n,!1)}:n.attachEvent&&(i=function(e,n,i){e[n+i]=i.handleEvent?function(){var n=t(e);i.handleEvent.call(i,n)}:function(){var n=t(e);i.call(e,n)},e.attachEvent("on"+n,e[n+i])});var r=function(){};n.removeEventListener?r=function(e,t,n){e.removeEventListener(t,n,!1)}:n.detachEvent&&(r=function(e,t,n){e.detachEvent("on"+t,e[t+n]);try{delete e[t+n]}catch(i){e[t+n]=void 0}});var o={bind:i,unbind:r};"function"==typeof define&&define.amd?define("eventie/eventie",o):e.eventie=o}(this),function(e,t){"function"==typeof define&&define.amd?define(["eventEmitter/EventEmitter","eventie/eventie"],function(n,i){return t(e,n,i)}):"object"==typeof exports?module.exports=t(e,require("wolfy87-eventemitter"),require("eventie")):e.imagesLoaded=t(e,e.EventEmitter,e.eventie)}(window,function(e,t,n){function i(e,t){for(var n in t)e[n]=t[n];return e}function r(e){return"[object Array]"===d.call(e)}function o(e){var t=[];if(r(e))t=e;else if("number"==typeof e.length)for(var n=0,i=e.length;i>n;n++)t.push(e[n]);else t.push(e);return t}function s(e,t,n){if(!(this instanceof s))return new s(e,t);"string"==typeof e&&(e=document.querySelectorAll(e)),this.elements=o(e),this.options=i({},this.options),"function"==typeof t?n=t:i(this.options,t),n&&this.on("always",n),this.getImages(),a&&(this.jqDeferred=new a.Deferred);var r=this;setTimeout(function(){r.check()})}function f(e){this.img=e}function c(e){this.src=e,v[e]=this}var a=e.jQuery,u=e.console,h=u!==void 0,d=Object.prototype.toString;s.prototype=new t,s.prototype.options={},s.prototype.getImages=function(){this.images=[];for(var e=0,t=this.elements.length;t>e;e++){var n=this.elements[e];"IMG"===n.nodeName&&this.addImage(n);var i=n.nodeType;if(i&&(1===i||9===i||11===i))for(var r=n.querySelectorAll("img"),o=0,s=r.length;s>o;o++){var f=r[o];this.addImage(f)}}},s.prototype.addImage=function(e){var t=new f(e);this.images.push(t)},s.prototype.check=function(){function e(e,r){return t.options.debug&&h&&u.log("confirm",e,r),t.progress(e),n++,n===i&&t.complete(),!0}var t=this,n=0,i=this.images.length;if(this.hasAnyBroken=!1,!i)return this.complete(),void 0;for(var r=0;i>r;r++){var o=this.images[r];o.on("confirm",e),o.check()}},s.prototype.progress=function(e){this.hasAnyBroken=this.hasAnyBroken||!e.isLoaded;var t=this;setTimeout(function(){t.emit("progress",t,e),t.jqDeferred&&t.jqDeferred.notify&&t.jqDeferred.notify(t,e)})},s.prototype.complete=function(){var e=this.hasAnyBroken?"fail":"done";this.isComplete=!0;var t=this;setTimeout(function(){if(t.emit(e,t),t.emit("always",t),t.jqDeferred){var n=t.hasAnyBroken?"reject":"resolve";t.jqDeferred[n](t)}})},a&&(a.fn.imagesLoaded=function(e,t){var n=new s(this,e,t);return n.jqDeferred.promise(a(this))}),f.prototype=new t,f.prototype.check=function(){var e=v[this.img.src]||new c(this.img.src);if(e.isConfirmed)return this.confirm(e.isLoaded,"cached was confirmed"),void 0;if(this.img.complete&&void 0!==this.img.naturalWidth)return this.confirm(0!==this.img.naturalWidth,"naturalWidth"),void 0;var t=this;e.on("confirm",function(e,n){return t.confirm(e.isLoaded,n),!0}),e.check()},f.prototype.confirm=function(e,t){this.isLoaded=e,this.emit("confirm",this,t)};var v={};return c.prototype=new t,c.prototype.check=function(){if(!this.isChecked){var e=new Image;n.bind(e,"load",this),n.bind(e,"error",this),e.src=this.src,this.isChecked=!0}},c.prototype.handleEvent=function(e){var t="on"+e.type;this[t]&&this[t](e)},c.prototype.onload=function(e){this.confirm(!0,"onload"),this.unbindProxyEvents(e)},c.prototype.onerror=function(e){this.confirm(!1,"onerror"),this.unbindProxyEvents(e)},c.prototype.confirm=function(e,t){this.isConfirmed=!0,this.isLoaded=e,this.emit("confirm",this,t)},c.prototype.unbindProxyEvents=function(e){n.unbind(e.target,"load",this),n.unbind(e.target,"error",this)},s});
/*!
 * Isotope PACKAGED v2.2.2
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2015 Metafizzy
 */

!function(a){function b(){}function c(a){function c(b){b.prototype.option||(b.prototype.option=function(b){a.isPlainObject(b)&&(this.options=a.extend(!0,this.options,b))})}function e(b,c){a.fn[b]=function(e){if("string"==typeof e){for(var g=d.call(arguments,1),h=0,i=this.length;i>h;h++){var j=this[h],k=a.data(j,b);if(k)if(a.isFunction(k[e])&&"_"!==e.charAt(0)){var l=k[e].apply(k,g);if(void 0!==l)return l}else f("no such method '"+e+"' for "+b+" instance");else f("cannot call methods on "+b+" prior to initialization; attempted to call '"+e+"'")}return this}return this.each(function(){var d=a.data(this,b);d?(d.option(e),d._init()):(d=new c(this,e),a.data(this,b,d))})}}if(a){var f="undefined"==typeof console?b:function(a){console.error(a)};return a.bridget=function(a,b){c(b),e(a,b)},a.bridget}}var d=Array.prototype.slice;"function"==typeof define&&define.amd?define("jquery-bridget/jquery.bridget",["jquery"],c):c("object"==typeof exports?require("jquery"):a.jQuery)}(window),function(a){function b(b){var c=a.event;return c.target=c.target||c.srcElement||b,c}var c=document.documentElement,d=function(){};c.addEventListener?d=function(a,b,c){a.addEventListener(b,c,!1)}:c.attachEvent&&(d=function(a,c,d){a[c+d]=d.handleEvent?function(){var c=b(a);d.handleEvent.call(d,c)}:function(){var c=b(a);d.call(a,c)},a.attachEvent("on"+c,a[c+d])});var e=function(){};c.removeEventListener?e=function(a,b,c){a.removeEventListener(b,c,!1)}:c.detachEvent&&(e=function(a,b,c){a.detachEvent("on"+b,a[b+c]);try{delete a[b+c]}catch(d){a[b+c]=void 0}});var f={bind:d,unbind:e};"function"==typeof define&&define.amd?define("eventie/eventie",f):"object"==typeof exports?module.exports=f:a.eventie=f}(window),function(){"use strict";function a(){}function b(a,b){for(var c=a.length;c--;)if(a[c].listener===b)return c;return-1}function c(a){return function(){return this[a].apply(this,arguments)}}var d=a.prototype,e=this,f=e.EventEmitter;d.getListeners=function(a){var b,c,d=this._getEvents();if(a instanceof RegExp){b={};for(c in d)d.hasOwnProperty(c)&&a.test(c)&&(b[c]=d[c])}else b=d[a]||(d[a]=[]);return b},d.flattenListeners=function(a){var b,c=[];for(b=0;b<a.length;b+=1)c.push(a[b].listener);return c},d.getListenersAsObject=function(a){var b,c=this.getListeners(a);return c instanceof Array&&(b={},b[a]=c),b||c},d.addListener=function(a,c){var d,e=this.getListenersAsObject(a),f="object"==typeof c;for(d in e)e.hasOwnProperty(d)&&-1===b(e[d],c)&&e[d].push(f?c:{listener:c,once:!1});return this},d.on=c("addListener"),d.addOnceListener=function(a,b){return this.addListener(a,{listener:b,once:!0})},d.once=c("addOnceListener"),d.defineEvent=function(a){return this.getListeners(a),this},d.defineEvents=function(a){for(var b=0;b<a.length;b+=1)this.defineEvent(a[b]);return this},d.removeListener=function(a,c){var d,e,f=this.getListenersAsObject(a);for(e in f)f.hasOwnProperty(e)&&(d=b(f[e],c),-1!==d&&f[e].splice(d,1));return this},d.off=c("removeListener"),d.addListeners=function(a,b){return this.manipulateListeners(!1,a,b)},d.removeListeners=function(a,b){return this.manipulateListeners(!0,a,b)},d.manipulateListeners=function(a,b,c){var d,e,f=a?this.removeListener:this.addListener,g=a?this.removeListeners:this.addListeners;if("object"!=typeof b||b instanceof RegExp)for(d=c.length;d--;)f.call(this,b,c[d]);else for(d in b)b.hasOwnProperty(d)&&(e=b[d])&&("function"==typeof e?f.call(this,d,e):g.call(this,d,e));return this},d.removeEvent=function(a){var b,c=typeof a,d=this._getEvents();if("string"===c)delete d[a];else if(a instanceof RegExp)for(b in d)d.hasOwnProperty(b)&&a.test(b)&&delete d[b];else delete this._events;return this},d.removeAllListeners=c("removeEvent"),d.emitEvent=function(a,b){var c,d,e,f,g=this.getListenersAsObject(a);for(e in g)if(g.hasOwnProperty(e))for(d=g[e].length;d--;)c=g[e][d],c.once===!0&&this.removeListener(a,c.listener),f=c.listener.apply(this,b||[]),f===this._getOnceReturnValue()&&this.removeListener(a,c.listener);return this},d.trigger=c("emitEvent"),d.emit=function(a){var b=Array.prototype.slice.call(arguments,1);return this.emitEvent(a,b)},d.setOnceReturnValue=function(a){return this._onceReturnValue=a,this},d._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},d._getEvents=function(){return this._events||(this._events={})},a.noConflict=function(){return e.EventEmitter=f,a},"function"==typeof define&&define.amd?define("eventEmitter/EventEmitter",[],function(){return a}):"object"==typeof module&&module.exports?module.exports=a:e.EventEmitter=a}.call(this),function(a){function b(a){if(a){if("string"==typeof d[a])return a;a=a.charAt(0).toUpperCase()+a.slice(1);for(var b,e=0,f=c.length;f>e;e++)if(b=c[e]+a,"string"==typeof d[b])return b}}var c="Webkit Moz ms Ms O".split(" "),d=document.documentElement.style;"function"==typeof define&&define.amd?define("get-style-property/get-style-property",[],function(){return b}):"object"==typeof exports?module.exports=b:a.getStyleProperty=b}(window),function(a,b){function c(a){var b=parseFloat(a),c=-1===a.indexOf("%")&&!isNaN(b);return c&&b}function d(){}function e(){for(var a={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},b=0,c=h.length;c>b;b++){var d=h[b];a[d]=0}return a}function f(b){function d(){if(!m){m=!0;var d=a.getComputedStyle;if(j=function(){var a=d?function(a){return d(a,null)}:function(a){return a.currentStyle};return function(b){var c=a(b);return c||g("Style returned "+c+". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"),c}}(),k=b("boxSizing")){var e=document.createElement("div");e.style.width="200px",e.style.padding="1px 2px 3px 4px",e.style.borderStyle="solid",e.style.borderWidth="1px 2px 3px 4px",e.style[k]="border-box";var f=document.body||document.documentElement;f.appendChild(e);var h=j(e);l=200===c(h.width),f.removeChild(e)}}}function f(a){if(d(),"string"==typeof a&&(a=document.querySelector(a)),a&&"object"==typeof a&&a.nodeType){var b=j(a);if("none"===b.display)return e();var f={};f.width=a.offsetWidth,f.height=a.offsetHeight;for(var g=f.isBorderBox=!(!k||!b[k]||"border-box"!==b[k]),m=0,n=h.length;n>m;m++){var o=h[m],p=b[o];p=i(a,p);var q=parseFloat(p);f[o]=isNaN(q)?0:q}var r=f.paddingLeft+f.paddingRight,s=f.paddingTop+f.paddingBottom,t=f.marginLeft+f.marginRight,u=f.marginTop+f.marginBottom,v=f.borderLeftWidth+f.borderRightWidth,w=f.borderTopWidth+f.borderBottomWidth,x=g&&l,y=c(b.width);y!==!1&&(f.width=y+(x?0:r+v));var z=c(b.height);return z!==!1&&(f.height=z+(x?0:s+w)),f.innerWidth=f.width-(r+v),f.innerHeight=f.height-(s+w),f.outerWidth=f.width+t,f.outerHeight=f.height+u,f}}function i(b,c){if(a.getComputedStyle||-1===c.indexOf("%"))return c;var d=b.style,e=d.left,f=b.runtimeStyle,g=f&&f.left;return g&&(f.left=b.currentStyle.left),d.left=c,c=d.pixelLeft,d.left=e,g&&(f.left=g),c}var j,k,l,m=!1;return f}var g="undefined"==typeof console?d:function(a){console.error(a)},h=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"];"function"==typeof define&&define.amd?define("get-size/get-size",["get-style-property/get-style-property"],f):"object"==typeof exports?module.exports=f(require("desandro-get-style-property")):a.getSize=f(a.getStyleProperty)}(window),function(a){function b(a){"function"==typeof a&&(b.isReady?a():g.push(a))}function c(a){var c="readystatechange"===a.type&&"complete"!==f.readyState;b.isReady||c||d()}function d(){b.isReady=!0;for(var a=0,c=g.length;c>a;a++){var d=g[a];d()}}function e(e){return"complete"===f.readyState?d():(e.bind(f,"DOMContentLoaded",c),e.bind(f,"readystatechange",c),e.bind(a,"load",c)),b}var f=a.document,g=[];b.isReady=!1,"function"==typeof define&&define.amd?define("doc-ready/doc-ready",["eventie/eventie"],e):"object"==typeof exports?module.exports=e(require("eventie")):a.docReady=e(a.eventie)}(window),function(a){"use strict";function b(a,b){return a[g](b)}function c(a){if(!a.parentNode){var b=document.createDocumentFragment();b.appendChild(a)}}function d(a,b){c(a);for(var d=a.parentNode.querySelectorAll(b),e=0,f=d.length;f>e;e++)if(d[e]===a)return!0;return!1}function e(a,d){return c(a),b(a,d)}var f,g=function(){if(a.matches)return"matches";if(a.matchesSelector)return"matchesSelector";for(var b=["webkit","moz","ms","o"],c=0,d=b.length;d>c;c++){var e=b[c],f=e+"MatchesSelector";if(a[f])return f}}();if(g){var h=document.createElement("div"),i=b(h,"div");f=i?b:e}else f=d;"function"==typeof define&&define.amd?define("matches-selector/matches-selector",[],function(){return f}):"object"==typeof exports?module.exports=f:window.matchesSelector=f}(Element.prototype),function(a,b){"use strict";"function"==typeof define&&define.amd?define("fizzy-ui-utils/utils",["doc-ready/doc-ready","matches-selector/matches-selector"],function(c,d){return b(a,c,d)}):"object"==typeof exports?module.exports=b(a,require("doc-ready"),require("desandro-matches-selector")):a.fizzyUIUtils=b(a,a.docReady,a.matchesSelector)}(window,function(a,b,c){var d={};d.extend=function(a,b){for(var c in b)a[c]=b[c];return a},d.modulo=function(a,b){return(a%b+b)%b};var e=Object.prototype.toString;d.isArray=function(a){return"[object Array]"==e.call(a)},d.makeArray=function(a){var b=[];if(d.isArray(a))b=a;else if(a&&"number"==typeof a.length)for(var c=0,e=a.length;e>c;c++)b.push(a[c]);else b.push(a);return b},d.indexOf=Array.prototype.indexOf?function(a,b){return a.indexOf(b)}:function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},d.removeFrom=function(a,b){var c=d.indexOf(a,b);-1!=c&&a.splice(c,1)},d.isElement="function"==typeof HTMLElement||"object"==typeof HTMLElement?function(a){return a instanceof HTMLElement}:function(a){return a&&"object"==typeof a&&1==a.nodeType&&"string"==typeof a.nodeName},d.setText=function(){function a(a,c){b=b||(void 0!==document.documentElement.textContent?"textContent":"innerText"),a[b]=c}var b;return a}(),d.getParent=function(a,b){for(;a!=document.body;)if(a=a.parentNode,c(a,b))return a},d.getQueryElement=function(a){return"string"==typeof a?document.querySelector(a):a},d.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},d.filterFindElements=function(a,b){a=d.makeArray(a);for(var e=[],f=0,g=a.length;g>f;f++){var h=a[f];if(d.isElement(h))if(b){c(h,b)&&e.push(h);for(var i=h.querySelectorAll(b),j=0,k=i.length;k>j;j++)e.push(i[j])}else e.push(h)}return e},d.debounceMethod=function(a,b,c){var d=a.prototype[b],e=b+"Timeout";a.prototype[b]=function(){var a=this[e];a&&clearTimeout(a);var b=arguments,f=this;this[e]=setTimeout(function(){d.apply(f,b),delete f[e]},c||100)}},d.toDashed=function(a){return a.replace(/(.)([A-Z])/g,function(a,b,c){return b+"-"+c}).toLowerCase()};var f=a.console;return d.htmlInit=function(c,e){b(function(){for(var b=d.toDashed(e),g=document.querySelectorAll(".js-"+b),h="data-"+b+"-options",i=0,j=g.length;j>i;i++){var k,l=g[i],m=l.getAttribute(h);try{k=m&&JSON.parse(m)}catch(n){f&&f.error("Error parsing "+h+" on "+l.nodeName.toLowerCase()+(l.id?"#"+l.id:"")+": "+n);continue}var o=new c(l,k),p=a.jQuery;p&&p.data(l,e,o)}})},d}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("outlayer/item",["eventEmitter/EventEmitter","get-size/get-size","get-style-property/get-style-property","fizzy-ui-utils/utils"],function(c,d,e,f){return b(a,c,d,e,f)}):"object"==typeof exports?module.exports=b(a,require("wolfy87-eventemitter"),require("get-size"),require("desandro-get-style-property"),require("fizzy-ui-utils")):(a.Outlayer={},a.Outlayer.Item=b(a,a.EventEmitter,a.getSize,a.getStyleProperty,a.fizzyUIUtils))}(window,function(a,b,c,d,e){"use strict";function f(a){for(var b in a)return!1;return b=null,!0}function g(a,b){a&&(this.element=a,this.layout=b,this.position={x:0,y:0},this._create())}function h(a){return a.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()})}var i=a.getComputedStyle,j=i?function(a){return i(a,null)}:function(a){return a.currentStyle},k=d("transition"),l=d("transform"),m=k&&l,n=!!d("perspective"),o={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"otransitionend",transition:"transitionend"}[k],p=["transform","transition","transitionDuration","transitionProperty"],q=function(){for(var a={},b=0,c=p.length;c>b;b++){var e=p[b],f=d(e);f&&f!==e&&(a[e]=f)}return a}();e.extend(g.prototype,b.prototype),g.prototype._create=function(){this._transn={ingProperties:{},clean:{},onEnd:{}},this.css({position:"absolute"})},g.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},g.prototype.getSize=function(){this.size=c(this.element)},g.prototype.css=function(a){var b=this.element.style;for(var c in a){var d=q[c]||c;b[d]=a[c]}},g.prototype.getPosition=function(){var a=j(this.element),b=this.layout.options,c=b.isOriginLeft,d=b.isOriginTop,e=a[c?"left":"right"],f=a[d?"top":"bottom"],g=this.layout.size,h=-1!=e.indexOf("%")?parseFloat(e)/100*g.width:parseInt(e,10),i=-1!=f.indexOf("%")?parseFloat(f)/100*g.height:parseInt(f,10);h=isNaN(h)?0:h,i=isNaN(i)?0:i,h-=c?g.paddingLeft:g.paddingRight,i-=d?g.paddingTop:g.paddingBottom,this.position.x=h,this.position.y=i},g.prototype.layoutPosition=function(){var a=this.layout.size,b=this.layout.options,c={},d=b.isOriginLeft?"paddingLeft":"paddingRight",e=b.isOriginLeft?"left":"right",f=b.isOriginLeft?"right":"left",g=this.position.x+a[d];c[e]=this.getXValue(g),c[f]="";var h=b.isOriginTop?"paddingTop":"paddingBottom",i=b.isOriginTop?"top":"bottom",j=b.isOriginTop?"bottom":"top",k=this.position.y+a[h];c[i]=this.getYValue(k),c[j]="",this.css(c),this.emitEvent("layout",[this])},g.prototype.getXValue=function(a){var b=this.layout.options;return b.percentPosition&&!b.isHorizontal?a/this.layout.size.width*100+"%":a+"px"},g.prototype.getYValue=function(a){var b=this.layout.options;return b.percentPosition&&b.isHorizontal?a/this.layout.size.height*100+"%":a+"px"},g.prototype._transitionTo=function(a,b){this.getPosition();var c=this.position.x,d=this.position.y,e=parseInt(a,10),f=parseInt(b,10),g=e===this.position.x&&f===this.position.y;if(this.setPosition(a,b),g&&!this.isTransitioning)return void this.layoutPosition();var h=a-c,i=b-d,j={};j.transform=this.getTranslate(h,i),this.transition({to:j,onTransitionEnd:{transform:this.layoutPosition},isCleaning:!0})},g.prototype.getTranslate=function(a,b){var c=this.layout.options;return a=c.isOriginLeft?a:-a,b=c.isOriginTop?b:-b,n?"translate3d("+a+"px, "+b+"px, 0)":"translate("+a+"px, "+b+"px)"},g.prototype.goTo=function(a,b){this.setPosition(a,b),this.layoutPosition()},g.prototype.moveTo=m?g.prototype._transitionTo:g.prototype.goTo,g.prototype.setPosition=function(a,b){this.position.x=parseInt(a,10),this.position.y=parseInt(b,10)},g.prototype._nonTransition=function(a){this.css(a.to),a.isCleaning&&this._removeStyles(a.to);for(var b in a.onTransitionEnd)a.onTransitionEnd[b].call(this)},g.prototype._transition=function(a){if(!parseFloat(this.layout.options.transitionDuration))return void this._nonTransition(a);var b=this._transn;for(var c in a.onTransitionEnd)b.onEnd[c]=a.onTransitionEnd[c];for(c in a.to)b.ingProperties[c]=!0,a.isCleaning&&(b.clean[c]=!0);if(a.from){this.css(a.from);var d=this.element.offsetHeight;d=null}this.enableTransition(a.to),this.css(a.to),this.isTransitioning=!0};var r="opacity,"+h(q.transform||"transform");g.prototype.enableTransition=function(){this.isTransitioning||(this.css({transitionProperty:r,transitionDuration:this.layout.options.transitionDuration}),this.element.addEventListener(o,this,!1))},g.prototype.transition=g.prototype[k?"_transition":"_nonTransition"],g.prototype.onwebkitTransitionEnd=function(a){this.ontransitionend(a)},g.prototype.onotransitionend=function(a){this.ontransitionend(a)};var s={"-webkit-transform":"transform","-moz-transform":"transform","-o-transform":"transform"};g.prototype.ontransitionend=function(a){if(a.target===this.element){var b=this._transn,c=s[a.propertyName]||a.propertyName;if(delete b.ingProperties[c],f(b.ingProperties)&&this.disableTransition(),c in b.clean&&(this.element.style[a.propertyName]="",delete b.clean[c]),c in b.onEnd){var d=b.onEnd[c];d.call(this),delete b.onEnd[c]}this.emitEvent("transitionEnd",[this])}},g.prototype.disableTransition=function(){this.removeTransitionStyles(),this.element.removeEventListener(o,this,!1),this.isTransitioning=!1},g.prototype._removeStyles=function(a){var b={};for(var c in a)b[c]="";this.css(b)};var t={transitionProperty:"",transitionDuration:""};return g.prototype.removeTransitionStyles=function(){this.css(t)},g.prototype.removeElem=function(){this.element.parentNode.removeChild(this.element),this.css({display:""}),this.emitEvent("remove",[this])},g.prototype.remove=function(){if(!k||!parseFloat(this.layout.options.transitionDuration))return void this.removeElem();var a=this;this.once("transitionEnd",function(){a.removeElem()}),this.hide()},g.prototype.reveal=function(){delete this.isHidden,this.css({display:""});var a=this.layout.options,b={},c=this.getHideRevealTransitionEndProperty("visibleStyle");b[c]=this.onRevealTransitionEnd,this.transition({from:a.hiddenStyle,to:a.visibleStyle,isCleaning:!0,onTransitionEnd:b})},g.prototype.onRevealTransitionEnd=function(){this.isHidden||this.emitEvent("reveal")},g.prototype.getHideRevealTransitionEndProperty=function(a){var b=this.layout.options[a];if(b.opacity)return"opacity";for(var c in b)return c},g.prototype.hide=function(){this.isHidden=!0,this.css({display:""});var a=this.layout.options,b={},c=this.getHideRevealTransitionEndProperty("hiddenStyle");b[c]=this.onHideTransitionEnd,this.transition({from:a.visibleStyle,to:a.hiddenStyle,isCleaning:!0,onTransitionEnd:b})},g.prototype.onHideTransitionEnd=function(){this.isHidden&&(this.css({display:"none"}),this.emitEvent("hide"))},g.prototype.destroy=function(){this.css({position:"",left:"",right:"",top:"",bottom:"",transition:"",transform:""})},g}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("outlayer/outlayer",["eventie/eventie","eventEmitter/EventEmitter","get-size/get-size","fizzy-ui-utils/utils","./item"],function(c,d,e,f,g){return b(a,c,d,e,f,g)}):"object"==typeof exports?module.exports=b(a,require("eventie"),require("wolfy87-eventemitter"),require("get-size"),require("fizzy-ui-utils"),require("./item")):a.Outlayer=b(a,a.eventie,a.EventEmitter,a.getSize,a.fizzyUIUtils,a.Outlayer.Item)}(window,function(a,b,c,d,e,f){"use strict";function g(a,b){var c=e.getQueryElement(a);if(!c)return void(h&&h.error("Bad element for "+this.constructor.namespace+": "+(c||a)));this.element=c,i&&(this.$element=i(this.element)),this.options=e.extend({},this.constructor.defaults),this.option(b);var d=++k;this.element.outlayerGUID=d,l[d]=this,this._create(),this.options.isInitLayout&&this.layout()}var h=a.console,i=a.jQuery,j=function(){},k=0,l={};return g.namespace="outlayer",g.Item=f,g.defaults={containerStyle:{position:"relative"},isInitLayout:!0,isOriginLeft:!0,isOriginTop:!0,isResizeBound:!0,isResizingContainer:!0,transitionDuration:"0.4s",hiddenStyle:{opacity:0,transform:"scale(0.001)"},visibleStyle:{opacity:1,transform:"scale(1)"}},e.extend(g.prototype,c.prototype),g.prototype.option=function(a){e.extend(this.options,a)},g.prototype._create=function(){this.reloadItems(),this.stamps=[],this.stamp(this.options.stamp),e.extend(this.element.style,this.options.containerStyle),this.options.isResizeBound&&this.bindResize()},g.prototype.reloadItems=function(){this.items=this._itemize(this.element.children)},g.prototype._itemize=function(a){for(var b=this._filterFindItemElements(a),c=this.constructor.Item,d=[],e=0,f=b.length;f>e;e++){var g=b[e],h=new c(g,this);d.push(h)}return d},g.prototype._filterFindItemElements=function(a){return e.filterFindElements(a,this.options.itemSelector)},g.prototype.getItemElements=function(){for(var a=[],b=0,c=this.items.length;c>b;b++)a.push(this.items[b].element);return a},g.prototype.layout=function(){this._resetLayout(),this._manageStamps();var a=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;this.layoutItems(this.items,a),this._isLayoutInited=!0},g.prototype._init=g.prototype.layout,g.prototype._resetLayout=function(){this.getSize()},g.prototype.getSize=function(){this.size=d(this.element)},g.prototype._getMeasurement=function(a,b){var c,f=this.options[a];f?("string"==typeof f?c=this.element.querySelector(f):e.isElement(f)&&(c=f),this[a]=c?d(c)[b]:f):this[a]=0},g.prototype.layoutItems=function(a,b){a=this._getItemsForLayout(a),this._layoutItems(a,b),this._postLayout()},g.prototype._getItemsForLayout=function(a){for(var b=[],c=0,d=a.length;d>c;c++){var e=a[c];e.isIgnored||b.push(e)}return b},g.prototype._layoutItems=function(a,b){if(this._emitCompleteOnItems("layout",a),a&&a.length){for(var c=[],d=0,e=a.length;e>d;d++){var f=a[d],g=this._getItemLayoutPosition(f);g.item=f,g.isInstant=b||f.isLayoutInstant,c.push(g)}this._processLayoutQueue(c)}},g.prototype._getItemLayoutPosition=function(){return{x:0,y:0}},g.prototype._processLayoutQueue=function(a){for(var b=0,c=a.length;c>b;b++){var d=a[b];this._positionItem(d.item,d.x,d.y,d.isInstant)}},g.prototype._positionItem=function(a,b,c,d){d?a.goTo(b,c):a.moveTo(b,c)},g.prototype._postLayout=function(){this.resizeContainer()},g.prototype.resizeContainer=function(){if(this.options.isResizingContainer){var a=this._getContainerSize();a&&(this._setContainerMeasure(a.width,!0),this._setContainerMeasure(a.height,!1))}},g.prototype._getContainerSize=j,g.prototype._setContainerMeasure=function(a,b){if(void 0!==a){var c=this.size;c.isBorderBox&&(a+=b?c.paddingLeft+c.paddingRight+c.borderLeftWidth+c.borderRightWidth:c.paddingBottom+c.paddingTop+c.borderTopWidth+c.borderBottomWidth),a=Math.max(a,0),this.element.style[b?"width":"height"]=a+"px"}},g.prototype._emitCompleteOnItems=function(a,b){function c(){e.dispatchEvent(a+"Complete",null,[b])}function d(){g++,g===f&&c()}var e=this,f=b.length;if(!b||!f)return void c();for(var g=0,h=0,i=b.length;i>h;h++){var j=b[h];j.once(a,d)}},g.prototype.dispatchEvent=function(a,b,c){var d=b?[b].concat(c):c;if(this.emitEvent(a,d),i)if(this.$element=this.$element||i(this.element),b){var e=i.Event(b);e.type=a,this.$element.trigger(e,c)}else this.$element.trigger(a,c)},g.prototype.ignore=function(a){var b=this.getItem(a);b&&(b.isIgnored=!0)},g.prototype.unignore=function(a){var b=this.getItem(a);b&&delete b.isIgnored},g.prototype.stamp=function(a){if(a=this._find(a)){this.stamps=this.stamps.concat(a);for(var b=0,c=a.length;c>b;b++){var d=a[b];this.ignore(d)}}},g.prototype.unstamp=function(a){if(a=this._find(a))for(var b=0,c=a.length;c>b;b++){var d=a[b];e.removeFrom(this.stamps,d),this.unignore(d)}},g.prototype._find=function(a){return a?("string"==typeof a&&(a=this.element.querySelectorAll(a)),a=e.makeArray(a)):void 0},g.prototype._manageStamps=function(){if(this.stamps&&this.stamps.length){this._getBoundingRect();for(var a=0,b=this.stamps.length;b>a;a++){var c=this.stamps[a];this._manageStamp(c)}}},g.prototype._getBoundingRect=function(){var a=this.element.getBoundingClientRect(),b=this.size;this._boundingRect={left:a.left+b.paddingLeft+b.borderLeftWidth,top:a.top+b.paddingTop+b.borderTopWidth,right:a.right-(b.paddingRight+b.borderRightWidth),bottom:a.bottom-(b.paddingBottom+b.borderBottomWidth)}},g.prototype._manageStamp=j,g.prototype._getElementOffset=function(a){var b=a.getBoundingClientRect(),c=this._boundingRect,e=d(a),f={left:b.left-c.left-e.marginLeft,top:b.top-c.top-e.marginTop,right:c.right-b.right-e.marginRight,bottom:c.bottom-b.bottom-e.marginBottom};return f},g.prototype.handleEvent=function(a){var b="on"+a.type;this[b]&&this[b](a)},g.prototype.bindResize=function(){this.isResizeBound||(b.bind(a,"resize",this),this.isResizeBound=!0)},g.prototype.unbindResize=function(){this.isResizeBound&&b.unbind(a,"resize",this),this.isResizeBound=!1},g.prototype.onresize=function(){function a(){b.resize(),delete b.resizeTimeout}this.resizeTimeout&&clearTimeout(this.resizeTimeout);var b=this;this.resizeTimeout=setTimeout(a,100)},g.prototype.resize=function(){this.isResizeBound&&this.needsResizeLayout()&&this.layout()},g.prototype.needsResizeLayout=function(){var a=d(this.element),b=this.size&&a;return b&&a.innerWidth!==this.size.innerWidth},g.prototype.addItems=function(a){var b=this._itemize(a);return b.length&&(this.items=this.items.concat(b)),b},g.prototype.appended=function(a){var b=this.addItems(a);b.length&&(this.layoutItems(b,!0),this.reveal(b))},g.prototype.prepended=function(a){var b=this._itemize(a);if(b.length){var c=this.items.slice(0);this.items=b.concat(c),this._resetLayout(),this._manageStamps(),this.layoutItems(b,!0),this.reveal(b),this.layoutItems(c)}},g.prototype.reveal=function(a){this._emitCompleteOnItems("reveal",a);for(var b=a&&a.length,c=0;b&&b>c;c++){var d=a[c];d.reveal()}},g.prototype.hide=function(a){this._emitCompleteOnItems("hide",a);for(var b=a&&a.length,c=0;b&&b>c;c++){var d=a[c];d.hide()}},g.prototype.revealItemElements=function(a){var b=this.getItems(a);this.reveal(b)},g.prototype.hideItemElements=function(a){var b=this.getItems(a);this.hide(b)},g.prototype.getItem=function(a){for(var b=0,c=this.items.length;c>b;b++){var d=this.items[b];if(d.element===a)return d}},g.prototype.getItems=function(a){a=e.makeArray(a);for(var b=[],c=0,d=a.length;d>c;c++){var f=a[c],g=this.getItem(f);g&&b.push(g)}return b},g.prototype.remove=function(a){var b=this.getItems(a);if(this._emitCompleteOnItems("remove",b),b&&b.length)for(var c=0,d=b.length;d>c;c++){var f=b[c];f.remove(),e.removeFrom(this.items,f)}},g.prototype.destroy=function(){var a=this.element.style;a.height="",a.position="",a.width="";for(var b=0,c=this.items.length;c>b;b++){var d=this.items[b];d.destroy()}this.unbindResize();var e=this.element.outlayerGUID;delete l[e],delete this.element.outlayerGUID,i&&i.removeData(this.element,this.constructor.namespace)},g.data=function(a){a=e.getQueryElement(a);var b=a&&a.outlayerGUID;return b&&l[b]},g.create=function(a,b){function c(){g.apply(this,arguments)}return Object.create?c.prototype=Object.create(g.prototype):e.extend(c.prototype,g.prototype),c.prototype.constructor=c,c.defaults=e.extend({},g.defaults),e.extend(c.defaults,b),c.prototype.settings={},c.namespace=a,c.data=g.data,c.Item=function(){f.apply(this,arguments)},c.Item.prototype=new f,e.htmlInit(c,a),i&&i.bridget&&i.bridget(a,c),c},g.Item=f,g}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/item",["outlayer/outlayer"],b):"object"==typeof exports?module.exports=b(require("outlayer")):(a.Isotope=a.Isotope||{},a.Isotope.Item=b(a.Outlayer))}(window,function(a){"use strict";function b(){a.Item.apply(this,arguments)}b.prototype=new a.Item,b.prototype._create=function(){this.id=this.layout.itemGUID++,a.Item.prototype._create.call(this),this.sortData={}},b.prototype.updateSortData=function(){if(!this.isIgnored){this.sortData.id=this.id,this.sortData["original-order"]=this.id,this.sortData.random=Math.random();var a=this.layout.options.getSortData,b=this.layout._sorters;for(var c in a){var d=b[c];this.sortData[c]=d(this.element,this)}}};var c=b.prototype.destroy;return b.prototype.destroy=function(){c.apply(this,arguments),this.css({display:""})},b}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-mode",["get-size/get-size","outlayer/outlayer"],b):"object"==typeof exports?module.exports=b(require("get-size"),require("outlayer")):(a.Isotope=a.Isotope||{},a.Isotope.LayoutMode=b(a.getSize,a.Outlayer))}(window,function(a,b){"use strict";function c(a){this.isotope=a,a&&(this.options=a.options[this.namespace],this.element=a.element,this.items=a.filteredItems,this.size=a.size)}return function(){function a(a){return function(){return b.prototype[a].apply(this.isotope,arguments)}}for(var d=["_resetLayout","_getItemLayoutPosition","_manageStamp","_getContainerSize","_getElementOffset","needsResizeLayout"],e=0,f=d.length;f>e;e++){var g=d[e];c.prototype[g]=a(g)}}(),c.prototype.needsVerticalResizeLayout=function(){var b=a(this.isotope.element),c=this.isotope.size&&b;return c&&b.innerHeight!=this.isotope.size.innerHeight},c.prototype._getMeasurement=function(){this.isotope._getMeasurement.apply(this,arguments)},c.prototype.getColumnWidth=function(){this.getSegmentSize("column","Width")},c.prototype.getRowHeight=function(){this.getSegmentSize("row","Height")},c.prototype.getSegmentSize=function(a,b){var c=a+b,d="outer"+b;if(this._getMeasurement(c,d),!this[c]){var e=this.getFirstItemSize();this[c]=e&&e[d]||this.isotope.size["inner"+b]}},c.prototype.getFirstItemSize=function(){var b=this.isotope.filteredItems[0];return b&&b.element&&a(b.element)},c.prototype.layout=function(){this.isotope.layout.apply(this.isotope,arguments)},c.prototype.getSize=function(){this.isotope.getSize(),this.size=this.isotope.size},c.modes={},c.create=function(a,b){function d(){c.apply(this,arguments)}return d.prototype=new c,b&&(d.options=b),d.prototype.namespace=a,c.modes[a]=d,d},c}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("masonry/masonry",["outlayer/outlayer","get-size/get-size","fizzy-ui-utils/utils"],b):"object"==typeof exports?module.exports=b(require("outlayer"),require("get-size"),require("fizzy-ui-utils")):a.Masonry=b(a.Outlayer,a.getSize,a.fizzyUIUtils)}(window,function(a,b,c){var d=a.create("masonry");return d.prototype._resetLayout=function(){this.getSize(),this._getMeasurement("columnWidth","outerWidth"),this._getMeasurement("gutter","outerWidth"),this.measureColumns();var a=this.cols;for(this.colYs=[];a--;)this.colYs.push(0);this.maxY=0},d.prototype.measureColumns=function(){if(this.getContainerWidth(),!this.columnWidth){var a=this.items[0],c=a&&a.element;this.columnWidth=c&&b(c).outerWidth||this.containerWidth}var d=this.columnWidth+=this.gutter,e=this.containerWidth+this.gutter,f=e/d,g=d-e%d,h=g&&1>g?"round":"floor";f=Math[h](f),this.cols=Math.max(f,1)},d.prototype.getContainerWidth=function(){var a=this.options.isFitWidth?this.element.parentNode:this.element,c=b(a);this.containerWidth=c&&c.innerWidth},d.prototype._getItemLayoutPosition=function(a){a.getSize();var b=a.size.outerWidth%this.columnWidth,d=b&&1>b?"round":"ceil",e=Math[d](a.size.outerWidth/this.columnWidth);e=Math.min(e,this.cols);for(var f=this._getColGroup(e),g=Math.min.apply(Math,f),h=c.indexOf(f,g),i={x:this.columnWidth*h,y:g},j=g+a.size.outerHeight,k=this.cols+1-f.length,l=0;k>l;l++)this.colYs[h+l]=j;return i},d.prototype._getColGroup=function(a){if(2>a)return this.colYs;for(var b=[],c=this.cols+1-a,d=0;c>d;d++){var e=this.colYs.slice(d,d+a);b[d]=Math.max.apply(Math,e)}return b},d.prototype._manageStamp=function(a){var c=b(a),d=this._getElementOffset(a),e=this.options.isOriginLeft?d.left:d.right,f=e+c.outerWidth,g=Math.floor(e/this.columnWidth);g=Math.max(0,g);var h=Math.floor(f/this.columnWidth);h-=f%this.columnWidth?0:1,h=Math.min(this.cols-1,h);for(var i=(this.options.isOriginTop?d.top:d.bottom)+c.outerHeight,j=g;h>=j;j++)this.colYs[j]=Math.max(i,this.colYs[j])},d.prototype._getContainerSize=function(){this.maxY=Math.max.apply(Math,this.colYs);var a={height:this.maxY};return this.options.isFitWidth&&(a.width=this._getContainerFitWidth()),a},d.prototype._getContainerFitWidth=function(){for(var a=0,b=this.cols;--b&&0===this.colYs[b];)a++;return(this.cols-a)*this.columnWidth-this.gutter},d.prototype.needsResizeLayout=function(){var a=this.containerWidth;return this.getContainerWidth(),a!==this.containerWidth},d}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-modes/masonry",["../layout-mode","masonry/masonry"],b):"object"==typeof exports?module.exports=b(require("../layout-mode"),require("masonry-layout")):b(a.Isotope.LayoutMode,a.Masonry)}(window,function(a,b){"use strict";function c(a,b){for(var c in b)a[c]=b[c];return a}var d=a.create("masonry"),e=d.prototype._getElementOffset,f=d.prototype.layout,g=d.prototype._getMeasurement;
c(d.prototype,b.prototype),d.prototype._getElementOffset=e,d.prototype.layout=f,d.prototype._getMeasurement=g;var h=d.prototype.measureColumns;d.prototype.measureColumns=function(){this.items=this.isotope.filteredItems,h.call(this)};var i=d.prototype._manageStamp;return d.prototype._manageStamp=function(){this.options.isOriginLeft=this.isotope.options.isOriginLeft,this.options.isOriginTop=this.isotope.options.isOriginTop,i.apply(this,arguments)},d}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-modes/fit-rows",["../layout-mode"],b):"object"==typeof exports?module.exports=b(require("../layout-mode")):b(a.Isotope.LayoutMode)}(window,function(a){"use strict";var b=a.create("fitRows");return b.prototype._resetLayout=function(){this.x=0,this.y=0,this.maxY=0,this._getMeasurement("gutter","outerWidth")},b.prototype._getItemLayoutPosition=function(a){a.getSize();var b=a.size.outerWidth+this.gutter,c=this.isotope.size.innerWidth+this.gutter;0!==this.x&&b+this.x>c&&(this.x=0,this.y=this.maxY);var d={x:this.x,y:this.y};return this.maxY=Math.max(this.maxY,this.y+a.size.outerHeight),this.x+=b,d},b.prototype._getContainerSize=function(){return{height:this.maxY}},b}),function(a,b){"use strict";"function"==typeof define&&define.amd?define("isotope/js/layout-modes/vertical",["../layout-mode"],b):"object"==typeof exports?module.exports=b(require("../layout-mode")):b(a.Isotope.LayoutMode)}(window,function(a){"use strict";var b=a.create("vertical",{horizontalAlignment:0});return b.prototype._resetLayout=function(){this.y=0},b.prototype._getItemLayoutPosition=function(a){a.getSize();var b=(this.isotope.size.innerWidth-a.size.outerWidth)*this.options.horizontalAlignment,c=this.y;return this.y+=a.size.outerHeight,{x:b,y:c}},b.prototype._getContainerSize=function(){return{height:this.y}},b}),function(a,b){"use strict";"function"==typeof define&&define.amd?define(["outlayer/outlayer","get-size/get-size","matches-selector/matches-selector","fizzy-ui-utils/utils","isotope/js/item","isotope/js/layout-mode","isotope/js/layout-modes/masonry","isotope/js/layout-modes/fit-rows","isotope/js/layout-modes/vertical"],function(c,d,e,f,g,h){return b(a,c,d,e,f,g,h)}):"object"==typeof exports?module.exports=b(a,require("outlayer"),require("get-size"),require("desandro-matches-selector"),require("fizzy-ui-utils"),require("./item"),require("./layout-mode"),require("./layout-modes/masonry"),require("./layout-modes/fit-rows"),require("./layout-modes/vertical")):a.Isotope=b(a,a.Outlayer,a.getSize,a.matchesSelector,a.fizzyUIUtils,a.Isotope.Item,a.Isotope.LayoutMode)}(window,function(a,b,c,d,e,f,g){function h(a,b){return function(c,d){for(var e=0,f=a.length;f>e;e++){var g=a[e],h=c.sortData[g],i=d.sortData[g];if(h>i||i>h){var j=void 0!==b[g]?b[g]:b,k=j?1:-1;return(h>i?1:-1)*k}}return 0}}var i=a.jQuery,j=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^\s+|\s+$/g,"")},k=document.documentElement,l=k.textContent?function(a){return a.textContent}:function(a){return a.innerText},m=b.create("isotope",{layoutMode:"masonry",isJQueryFiltering:!0,sortAscending:!0});m.Item=f,m.LayoutMode=g,m.prototype._create=function(){this.itemGUID=0,this._sorters={},this._getSorters(),b.prototype._create.call(this),this.modes={},this.filteredItems=this.items,this.sortHistory=["original-order"];for(var a in g.modes)this._initLayoutMode(a)},m.prototype.reloadItems=function(){this.itemGUID=0,b.prototype.reloadItems.call(this)},m.prototype._itemize=function(){for(var a=b.prototype._itemize.apply(this,arguments),c=0,d=a.length;d>c;c++){var e=a[c];e.id=this.itemGUID++}return this._updateItemsSortData(a),a},m.prototype._initLayoutMode=function(a){var b=g.modes[a],c=this.options[a]||{};this.options[a]=b.options?e.extend(b.options,c):c,this.modes[a]=new b(this)},m.prototype.layout=function(){return!this._isLayoutInited&&this.options.isInitLayout?void this.arrange():void this._layout()},m.prototype._layout=function(){var a=this._getIsInstant();this._resetLayout(),this._manageStamps(),this.layoutItems(this.filteredItems,a),this._isLayoutInited=!0},m.prototype.arrange=function(a){function b(){d.reveal(c.needReveal),d.hide(c.needHide)}this.option(a),this._getIsInstant();var c=this._filter(this.items);this.filteredItems=c.matches;var d=this;this._bindArrangeComplete(),this._isInstant?this._noTransition(b):b(),this._sort(),this._layout()},m.prototype._init=m.prototype.arrange,m.prototype._getIsInstant=function(){var a=void 0!==this.options.isLayoutInstant?this.options.isLayoutInstant:!this._isLayoutInited;return this._isInstant=a,a},m.prototype._bindArrangeComplete=function(){function a(){b&&c&&d&&e.dispatchEvent("arrangeComplete",null,[e.filteredItems])}var b,c,d,e=this;this.once("layoutComplete",function(){b=!0,a()}),this.once("hideComplete",function(){c=!0,a()}),this.once("revealComplete",function(){d=!0,a()})},m.prototype._filter=function(a){var b=this.options.filter;b=b||"*";for(var c=[],d=[],e=[],f=this._getFilterTest(b),g=0,h=a.length;h>g;g++){var i=a[g];if(!i.isIgnored){var j=f(i);j&&c.push(i),j&&i.isHidden?d.push(i):j||i.isHidden||e.push(i)}}return{matches:c,needReveal:d,needHide:e}},m.prototype._getFilterTest=function(a){return i&&this.options.isJQueryFiltering?function(b){return i(b.element).is(a)}:"function"==typeof a?function(b){return a(b.element)}:function(b){return d(b.element,a)}},m.prototype.updateSortData=function(a){var b;a?(a=e.makeArray(a),b=this.getItems(a)):b=this.items,this._getSorters(),this._updateItemsSortData(b)},m.prototype._getSorters=function(){var a=this.options.getSortData;for(var b in a){var c=a[b];this._sorters[b]=n(c)}},m.prototype._updateItemsSortData=function(a){for(var b=a&&a.length,c=0;b&&b>c;c++){var d=a[c];d.updateSortData()}};var n=function(){function a(a){if("string"!=typeof a)return a;var c=j(a).split(" "),d=c[0],e=d.match(/^\[(.+)\]$/),f=e&&e[1],g=b(f,d),h=m.sortDataParsers[c[1]];return a=h?function(a){return a&&h(g(a))}:function(a){return a&&g(a)}}function b(a,b){var c;return c=a?function(b){return b.getAttribute(a)}:function(a){var c=a.querySelector(b);return c&&l(c)}}return a}();m.sortDataParsers={parseInt:function(a){return parseInt(a,10)},parseFloat:function(a){return parseFloat(a)}},m.prototype._sort=function(){var a=this.options.sortBy;if(a){var b=[].concat.apply(a,this.sortHistory),c=h(b,this.options.sortAscending);this.filteredItems.sort(c),a!=this.sortHistory[0]&&this.sortHistory.unshift(a)}},m.prototype._mode=function(){var a=this.options.layoutMode,b=this.modes[a];if(!b)throw new Error("No layout mode: "+a);return b.options=this.options[a],b},m.prototype._resetLayout=function(){b.prototype._resetLayout.call(this),this._mode()._resetLayout()},m.prototype._getItemLayoutPosition=function(a){return this._mode()._getItemLayoutPosition(a)},m.prototype._manageStamp=function(a){this._mode()._manageStamp(a)},m.prototype._getContainerSize=function(){return this._mode()._getContainerSize()},m.prototype.needsResizeLayout=function(){return this._mode().needsResizeLayout()},m.prototype.appended=function(a){var b=this.addItems(a);if(b.length){var c=this._filterRevealAdded(b);this.filteredItems=this.filteredItems.concat(c)}},m.prototype.prepended=function(a){var b=this._itemize(a);if(b.length){this._resetLayout(),this._manageStamps();var c=this._filterRevealAdded(b);this.layoutItems(this.filteredItems),this.filteredItems=c.concat(this.filteredItems),this.items=b.concat(this.items)}},m.prototype._filterRevealAdded=function(a){var b=this._filter(a);return this.hide(b.needHide),this.reveal(b.matches),this.layoutItems(b.matches,!0),b.matches},m.prototype.insert=function(a){var b=this.addItems(a);if(b.length){var c,d,e=b.length;for(c=0;e>c;c++)d=b[c],this.element.appendChild(d.element);var f=this._filter(b).matches;for(c=0;e>c;c++)b[c].isLayoutInstant=!0;for(this.arrange(),c=0;e>c;c++)delete b[c].isLayoutInstant;this.reveal(f)}};var o=m.prototype.remove;return m.prototype.remove=function(a){a=e.makeArray(a);var b=this.getItems(a);o.call(this,a);var c=b&&b.length;if(c)for(var d=0;c>d;d++){var f=b[d];e.removeFrom(this.filteredItems,f)}},m.prototype.shuffle=function(){for(var a=0,b=this.items.length;b>a;a++){var c=this.items[a];c.sortData.random=Math.random()}this.options.sortBy="random",this._sort(),this._layout()},m.prototype._noTransition=function(a){var b=this.options.transitionDuration;this.options.transitionDuration=0;var c=a.call(this);return this.options.transitionDuration=b,c},m.prototype.getFilteredItemElements=function(){for(var a=[],b=0,c=this.filteredItems.length;c>b;b++)a.push(this.filteredItems[b].element);return a},m});
/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright Ã‚Â© 2001 Robert Penner
 * All rights reserved.
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright Ã‚Â© 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 * COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 * GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
*/
jQuery.easing.jswing=jQuery.easing.swing;jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(e,f,a,h,g){return jQuery.easing[jQuery.easing.def](e,f,a,h,g)},easeInQuad:function(e,f,a,h,g){return h*(f/=g)*f+a},easeOutQuad:function(e,f,a,h,g){return -h*(f/=g)*(f-2)+a},easeInOutQuad:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f+a}return -h/2*((--f)*(f-2)-1)+a},easeInCubic:function(e,f,a,h,g){return h*(f/=g)*f*f+a},easeOutCubic:function(e,f,a,h,g){return h*((f=f/g-1)*f*f+1)+a},easeInOutCubic:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f+a}return h/2*((f-=2)*f*f+2)+a},easeInQuart:function(e,f,a,h,g){return h*(f/=g)*f*f*f+a},easeOutQuart:function(e,f,a,h,g){return -h*((f=f/g-1)*f*f*f-1)+a},easeInOutQuart:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f+a}return -h/2*((f-=2)*f*f*f-2)+a},easeInQuint:function(e,f,a,h,g){return h*(f/=g)*f*f*f*f+a},easeOutQuint:function(e,f,a,h,g){return h*((f=f/g-1)*f*f*f*f+1)+a},easeInOutQuint:function(e,f,a,h,g){if((f/=g/2)<1){return h/2*f*f*f*f*f+a}return h/2*((f-=2)*f*f*f*f+2)+a},easeInSine:function(e,f,a,h,g){return -h*Math.cos(f/g*(Math.PI/2))+h+a},easeOutSine:function(e,f,a,h,g){return h*Math.sin(f/g*(Math.PI/2))+a},easeInOutSine:function(e,f,a,h,g){return -h/2*(Math.cos(Math.PI*f/g)-1)+a},easeInExpo:function(e,f,a,h,g){return(f==0)?a:h*Math.pow(2,10*(f/g-1))+a},easeOutExpo:function(e,f,a,h,g){return(f==g)?a+h:h*(-Math.pow(2,-10*f/g)+1)+a},easeInOutExpo:function(e,f,a,h,g){if(f==0){return a}if(f==g){return a+h}if((f/=g/2)<1){return h/2*Math.pow(2,10*(f-1))+a}return h/2*(-Math.pow(2,-10*--f)+2)+a},easeInCirc:function(e,f,a,h,g){return -h*(Math.sqrt(1-(f/=g)*f)-1)+a},easeOutCirc:function(e,f,a,h,g){return h*Math.sqrt(1-(f=f/g-1)*f)+a},easeInOutCirc:function(e,f,a,h,g){if((f/=g/2)<1){return -h/2*(Math.sqrt(1-f*f)-1)+a}return h/2*(Math.sqrt(1-(f-=2)*f)+1)+a},easeInElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return -(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e},easeOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k)==1){return e+l}if(!j){j=k*0.3}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}return g*Math.pow(2,-10*h)*Math.sin((h*k-i)*(2*Math.PI)/j)+l+e},easeInOutElastic:function(f,h,e,l,k){var i=1.70158;var j=0;var g=l;if(h==0){return e}if((h/=k/2)==2){return e+l}if(!j){j=k*(0.3*1.5)}if(g<Math.abs(l)){g=l;var i=j/4}else{var i=j/(2*Math.PI)*Math.asin(l/g)}if(h<1){return -0.5*(g*Math.pow(2,10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j))+e}return g*Math.pow(2,-10*(h-=1))*Math.sin((h*k-i)*(2*Math.PI)/j)*0.5+l+e},easeInBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*(f/=h)*f*((g+1)*f-g)+a},easeOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}return i*((f=f/h-1)*f*((g+1)*f+g)+1)+a},easeInOutBack:function(e,f,a,i,h,g){if(g==undefined){g=1.70158}if((f/=h/2)<1){return i/2*(f*f*(((g*=(1.525))+1)*f-g))+a}return i/2*((f-=2)*f*(((g*=(1.525))+1)*f+g)+2)+a},easeInBounce:function(e,f,a,h,g){return h-jQuery.easing.easeOutBounce(e,g-f,0,h,g)+a},easeOutBounce:function(e,f,a,h,g){if((f/=g)<(1/2.75)){return h*(7.5625*f*f)+a}else{if(f<(2/2.75)){return h*(7.5625*(f-=(1.5/2.75))*f+0.75)+a}else{if(f<(2.5/2.75)){return h*(7.5625*(f-=(2.25/2.75))*f+0.9375)+a}else{return h*(7.5625*(f-=(2.625/2.75))*f+0.984375)+a}}}},easeInOutBounce:function(e,f,a,h,g){if(f<g/2){return jQuery.easing.easeInBounce(e,f*2,0,h,g)*0.5+a}return jQuery.easing.easeOutBounce(e,f*2-g,0,h,g)*0.5+h*0.5+a}});

/*!
Waypoints - 3.1.1
Copyright © 2011-2015 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blog/master/licenses.txt
*/
!function(){"use strict";function t(o){if(!o)throw new Error("No options passed to Waypoint constructor");if(!o.element)throw new Error("No element option passed to Waypoint constructor");if(!o.handler)throw new Error("No handler option passed to Waypoint constructor");this.key="waypoint-"+e,this.options=t.Adapter.extend({},t.defaults,o),this.element=this.options.element,this.adapter=new t.Adapter(this.element),this.callback=o.handler,this.axis=this.options.horizontal?"horizontal":"vertical",this.enabled=this.options.enabled,this.triggerPoint=null,this.group=t.Group.findOrCreate({name:this.options.group,axis:this.axis}),this.context=t.Context.findOrCreateByElement(this.options.context),t.offsetAliases[this.options.offset]&&(this.options.offset=t.offsetAliases[this.options.offset]),this.group.add(this),this.context.add(this),i[this.key]=this,e+=1}var e=0,i={};t.prototype.queueTrigger=function(t){this.group.queueTrigger(this,t)},t.prototype.trigger=function(t){this.enabled&&this.callback&&this.callback.apply(this,t)},t.prototype.destroy=function(){this.context.remove(this),this.group.remove(this),delete i[this.key]},t.prototype.disable=function(){return this.enabled=!1,this},t.prototype.enable=function(){return this.context.refresh(),this.enabled=!0,this},t.prototype.next=function(){return this.group.next(this)},t.prototype.previous=function(){return this.group.previous(this)},t.invokeAll=function(t){var e=[];for(var o in i)e.push(i[o]);for(var n=0,r=e.length;r>n;n++)e[n][t]()},t.destroyAll=function(){t.invokeAll("destroy")},t.disableAll=function(){t.invokeAll("disable")},t.enableAll=function(){t.invokeAll("enable")},t.refreshAll=function(){t.Context.refreshAll()},t.viewportHeight=function(){return window.innerHeight||document.documentElement.clientHeight},t.viewportWidth=function(){return document.documentElement.clientWidth},t.adapters=[],t.defaults={context:window,continuous:!0,enabled:!0,group:"default",horizontal:!1,offset:0},t.offsetAliases={"bottom-in-view":function(){return this.context.innerHeight()-this.adapter.outerHeight()},"right-in-view":function(){return this.context.innerWidth()-this.adapter.outerWidth()}},window.Waypoint=t}(),function(){"use strict";function t(t){window.setTimeout(t,1e3/60)}function e(t){this.element=t,this.Adapter=n.Adapter,this.adapter=new this.Adapter(t),this.key="waypoint-context-"+i,this.didScroll=!1,this.didResize=!1,this.oldScroll={x:this.adapter.scrollLeft(),y:this.adapter.scrollTop()},this.waypoints={vertical:{},horizontal:{}},t.waypointContextKey=this.key,o[t.waypointContextKey]=this,i+=1,this.createThrottledScrollHandler(),this.createThrottledResizeHandler()}var i=0,o={},n=window.Waypoint,r=window.onload;e.prototype.add=function(t){var e=t.options.horizontal?"horizontal":"vertical";this.waypoints[e][t.key]=t,this.refresh()},e.prototype.checkEmpty=function(){var t=this.Adapter.isEmptyObject(this.waypoints.horizontal),e=this.Adapter.isEmptyObject(this.waypoints.vertical);t&&e&&(this.adapter.off(".waypoints"),delete o[this.key])},e.prototype.createThrottledResizeHandler=function(){function t(){e.handleResize(),e.didResize=!1}var e=this;this.adapter.on("resize.waypoints",function(){e.didResize||(e.didResize=!0,n.requestAnimationFrame(t))})},e.prototype.createThrottledScrollHandler=function(){function t(){e.handleScroll(),e.didScroll=!1}var e=this;this.adapter.on("scroll.waypoints",function(){(!e.didScroll||n.isTouch)&&(e.didScroll=!0,n.requestAnimationFrame(t))})},e.prototype.handleResize=function(){n.Context.refreshAll()},e.prototype.handleScroll=function(){var t={},e={horizontal:{newScroll:this.adapter.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.adapter.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};for(var i in e){var o=e[i],n=o.newScroll>o.oldScroll,r=n?o.forward:o.backward;for(var s in this.waypoints[i]){var a=this.waypoints[i][s],l=o.oldScroll<a.triggerPoint,h=o.newScroll>=a.triggerPoint,p=l&&h,u=!l&&!h;(p||u)&&(a.queueTrigger(r),t[a.group.id]=a.group)}}for(var c in t)t[c].flushTriggers();this.oldScroll={x:e.horizontal.newScroll,y:e.vertical.newScroll}},e.prototype.innerHeight=function(){return this.element==this.element.window?n.viewportHeight():this.adapter.innerHeight()},e.prototype.remove=function(t){delete this.waypoints[t.axis][t.key],this.checkEmpty()},e.prototype.innerWidth=function(){return this.element==this.element.window?n.viewportWidth():this.adapter.innerWidth()},e.prototype.destroy=function(){var t=[];for(var e in this.waypoints)for(var i in this.waypoints[e])t.push(this.waypoints[e][i]);for(var o=0,n=t.length;n>o;o++)t[o].destroy()},e.prototype.refresh=function(){var t,e=this.element==this.element.window,i=this.adapter.offset(),o={};this.handleScroll(),t={horizontal:{contextOffset:e?0:i.left,contextScroll:e?0:this.oldScroll.x,contextDimension:this.innerWidth(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:e?0:i.top,contextScroll:e?0:this.oldScroll.y,contextDimension:this.innerHeight(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};for(var n in t){var r=t[n];for(var s in this.waypoints[n]){var a,l,h,p,u,c=this.waypoints[n][s],d=c.options.offset,f=c.triggerPoint,w=0,y=null==f;c.element!==c.element.window&&(w=c.adapter.offset()[r.offsetProp]),"function"==typeof d?d=d.apply(c):"string"==typeof d&&(d=parseFloat(d),c.options.offset.indexOf("%")>-1&&(d=Math.ceil(r.contextDimension*d/100))),a=r.contextScroll-r.contextOffset,c.triggerPoint=w+a-d,l=f<r.oldScroll,h=c.triggerPoint>=r.oldScroll,p=l&&h,u=!l&&!h,!y&&p?(c.queueTrigger(r.backward),o[c.group.id]=c.group):!y&&u?(c.queueTrigger(r.forward),o[c.group.id]=c.group):y&&r.oldScroll>=c.triggerPoint&&(c.queueTrigger(r.forward),o[c.group.id]=c.group)}}for(var g in o)o[g].flushTriggers();return this},e.findOrCreateByElement=function(t){return e.findByElement(t)||new e(t)},e.refreshAll=function(){for(var t in o)o[t].refresh()},e.findByElement=function(t){return o[t.waypointContextKey]},window.onload=function(){r&&r(),e.refreshAll()},n.requestAnimationFrame=function(e){var i=window.requestAnimationFrame||window.mozRequestAnimationFrame||window.webkitRequestAnimationFrame||t;i.call(window,e)},n.Context=e}(),function(){"use strict";function t(t,e){return t.triggerPoint-e.triggerPoint}function e(t,e){return e.triggerPoint-t.triggerPoint}function i(t){this.name=t.name,this.axis=t.axis,this.id=this.name+"-"+this.axis,this.waypoints=[],this.clearTriggerQueues(),o[this.axis][this.name]=this}var o={vertical:{},horizontal:{}},n=window.Waypoint;i.prototype.add=function(t){this.waypoints.push(t)},i.prototype.clearTriggerQueues=function(){this.triggerQueues={up:[],down:[],left:[],right:[]}},i.prototype.flushTriggers=function(){for(var i in this.triggerQueues){var o=this.triggerQueues[i],n="up"===i||"left"===i;o.sort(n?e:t);for(var r=0,s=o.length;s>r;r+=1){var a=o[r];(a.options.continuous||r===o.length-1)&&a.trigger([i])}}this.clearTriggerQueues()},i.prototype.next=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints),o=i===this.waypoints.length-1;return o?null:this.waypoints[i+1]},i.prototype.previous=function(e){this.waypoints.sort(t);var i=n.Adapter.inArray(e,this.waypoints);return i?this.waypoints[i-1]:null},i.prototype.queueTrigger=function(t,e){this.triggerQueues[e].push(t)},i.prototype.remove=function(t){var e=n.Adapter.inArray(t,this.waypoints);e>-1&&this.waypoints.splice(e,1)},i.prototype.first=function(){return this.waypoints[0]},i.prototype.last=function(){return this.waypoints[this.waypoints.length-1]},i.findOrCreate=function(t){return o[t.axis][t.name]||new i(t)},n.Group=i}(),function(){"use strict";function t(t){this.$element=e(t)}var e=window.jQuery,i=window.Waypoint;e.each(["innerHeight","innerWidth","off","offset","on","outerHeight","outerWidth","scrollLeft","scrollTop"],function(e,i){t.prototype[i]=function(){var t=Array.prototype.slice.call(arguments);return this.$element[i].apply(this.$element,t)}}),e.each(["extend","inArray","isEmptyObject"],function(i,o){t[o]=e[o]}),i.adapters.push({name:"jquery",Adapter:t}),i.Adapter=t}(),function(){"use strict";function t(t){return function(){var i=[],o=arguments[0];return t.isFunction(arguments[0])&&(o=t.extend({},arguments[1]),o.handler=arguments[0]),this.each(function(){var n=t.extend({},o,{element:this});"string"==typeof n.context&&(n.context=t(this).closest(n.context)[0]),i.push(new e(n))}),i}}var e=window.Waypoint;window.jQuery&&(window.jQuery.fn.waypoint=t(window.jQuery)),window.Zepto&&(window.Zepto.fn.waypoint=t(window.Zepto))}();
/*!
 * classie v1.0.1
 * class helper functions
 * from bonzo https://github.com/ded/bonzo
 * MIT license
 *
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true, unused: true */
/*global define: false, module: false */
!function(s){"use strict";function e(s){return new RegExp("(^|\\s+)"+s+"(\\s+|$)")}function n(s,e){var n=t(s,e)?c:a;n(s,e)}var t,a,c;"classList"in document.documentElement?(t=function(s,e){return s.classList.contains(e)},a=function(s,e){s.classList.add(e)},c=function(s,e){s.classList.remove(e)}):(t=function(s,n){return e(n).test(s.className)},a=function(s,e){t(s,e)||(s.className=s.className+" "+e)},c=function(s,n){s.className=s.className.replace(e(n)," ")});var o={hasClass:t,addClass:a,removeClass:c,toggleClass:n,has:t,add:a,remove:c,toggle:n};"function"==typeof define&&define.amd?define(o):"object"==typeof exports?module.exports=o:s.classie=o}(window);

