(function ($) {
  'use strict';

  /*--------------- sticky menu-------------*/

  var stickyMenu = function () {
    var header = $('header.servicepage');

    if(!header.length){
      return;
    }
    var movableHeight = header.outerHeight();

    var check = $(window).scrollTop() > movableHeight;
    if(header.hasClass('is_stuck') && check){
      return;
    }
    else if (check) {
      header.parent().css('padding-top', movableHeight).end().addClass('is_stuck');
      header.trigger('header.stick');
    } else if (!check) {
      header.removeClass('is_stuck').parent().css('padding-top', '');
      header.trigger('header.unstick');
    }
  };

  $(window).on('scroll', stickyMenu);


  /*--------------- Side menu height to scroll-------------*/
  function navHeight () {
    var sH = $(".nav-menu h6").outerHeight() + $(".nav-menu p").outerHeight();
    $("ul#header_menu").height($(".nav-menu").height() - sH - 100);
  }
  if ($(".nav-menu").length) {
    $(window).on('load resize', navHeight);
  }

  $('#pager-ai img').click(function () {
    var c = $(this).attr("full");
    $(".product-image").html('<img src="' + c + '" />');
    $(".product-image").fadeIn(5000);
  });

  function addcss(css) {
    var head = document.getElementsByTagName('head')[0];
    var s = document.createElement('style');
    s.setAttribute('type', 'text/css');
    s.setAttribute('id', 'hideLastSection');
    if (s.styleSheet) { // IE
      s.styleSheet.cssText = css;
    } else { // the world
      s.appendChild(document.createTextNode(css));
    }
    head.appendChild(s);
  }

  function hideLastSection() {
    var l = jQuery('section.fp-table').length;
    var id  = jQuery('section.fp-table:nth-of-type(' + l + ')').data('anchor');
    var css = '@media screen and (min-width: 992px){ .fp-viewing-' + id + ' .footer-fig.arw{ display: none; } .fp-viewing-' + id + ' .content-footer{visibility: visible}}';
    addcss(css);
  }
  var logoClass = {
    current: '',
    last: ''
  };
  var toggleLogo = function (anchorLink, index) {
    var el = $('.fp-table:nth-child(' + index + ')');
    var light = el.hasClass('light_logo_section');
    var dark = el.hasClass('dark_logo_section');
    logoClass.current = (light) ? 'light' : 'dark';
    if(logoClass.current === logoClass.last) {
      return;
    }

    $('.logo-container .ilogo:not(.no-change-logo)').fadeOut();
    if ($(window).width() > 992) {
      if (light) {
        logoClass.current = 'light';
        $('.logo-container .ilogo.light-logo').fadeIn();
        $('.header').removeClass('light-header').addClass('dark-header');
      } else if (dark) {
        $('.logo-container .ilogo.dark-logo').fadeIn();
        $('.header').removeClass('dark-header').addClass('light-header');
      }
    }

    logoClass.last = logoClass.current;
  };


  var wWidth = $(window).width();

  /* ------------------ blog page ------------------*/
  function blogdetails() {
    var blogHeight = $('.blog-figc').outerHeight();
    $('.blog-containers').css('height', blogHeight);
    var blogHeights = $('.blgpg .blog-figc').outerHeight();
    $('.blgpg .blog-containers').css('height', blogHeights);
  }
  if ($('.page-template-page-home').length && !$('body.blog').length) {
    blogdetails();
  }

  /*----------------- NAV BUTTON -----------------*/

  function closeMenu() {
    wWidth = $(window).width();
    if (wWidth >= 768) {
      $('.nav-menu').removeClass('nav-menu-open');
    } else {
      $('.nav-menu').css('right', '-110%');
    }
    $('.nav .submenu').removeClass('.addSubMenu');
    $('body').css('overflow', 'visible');
  }

  $('.button-nav').on('click', function (e) {
    wWidth = $(window).width();
    if (wWidth >= 768) {
      $('.nav-menu').addClass('nav-menu-open');
    } else {
      $('.nav-menu').css('right', '0%');
    }
    if ($('.page-template-page-home').length && !$('body.blog').length) {
      $.fn.fullpage.setMouseWheelScrolling(false);
    }
    $('body').css('overflow-y', 'hidden');
  });

  // Navigation close on body click
  if ($('.page-template-page-home').length && !$('body.blog').length) {
    $('body .homep').on('click', function () {
      if($('.nav-menu').hasClass('nav-menu-open')){
        closeMenu();
        $.fn.fullpage.setMouseWheelScrolling(true);
      }
    });
  }

  //Blog Height

  $('.blgpg .item').each(function () {
    var _self = $(this),
      a = _self.children('.blog-figc').hasClass('.blog-full'),
      b = _self.has('.blog-fig');
      
      if(a || (b.length === 0)){
        _self.css('height', 'auto');
      }

  });

  // Submenu
  $('.menu-item a').on('click', function (evt) {
    var h = $(this).attr('href');
    if (h === '#') {
      evt.stopPropagation();
      $(this).siblings('.toggleSubmenu').toggleClass('thisSubmenuOpen').siblings('.sub-menu').toggleClass('addsub-menu');
    }
  });

  $('.toggleSubmenu').on('click', function (evt) {
    evt.stopPropagation();
    $(this).toggleClass('thisSubmenuOpen').siblings('.sub-menu').toggleClass('addsub-menu');
  });

  $('.header').on('click', '.nav-menu.nav-menu-open', function () {
    event.preventDefault();
    event.stopPropagation();
  });

  $('.close-btn, .navbar-wrapper li').on('click', function () {
    closeMenu();
    if ($('.page-template-page-home').length && !$('body.blog').length) {
      $.fn.fullpage.setMouseWheelScrolling(true);
    }
  });

  /*-------------- Inner page menu responsve---------------*/

  function mobileclosemenu() {
    $('.nav-menu').removeClass('open-mobile-menu');
    $('.overlay').removeClass('overlay-open');

    $('body').css('overflow', 'visible');
    $('.wrapper-body, .nav-menu').css('max-height', 'auto');
    $('.wrapper-body').css('overflow', 'visible');
  }

  $('.navbar-header').on('click', function () {
    var wh = $(window).height();
    $('.wrapper-body, .nav-menu').css('max-height', wh);
    $('.wrapper-body').css('overflow', 'hidden');
    $('.nav-menu').addClass('open-mobile-menu');
    $('.overlay').addClass('overlay-open');
    $('body').css('overflow', 'hidden');
  });
  $('.close-menu, .servicepage .nav li').on('click', function () {
    mobileclosemenu();
    if($(this).hasClass('.homep')){
      $.fn.fullpage.setMouseWheelScrolling(true);
    }
  });

  /*---------------- full page scroll -----------------*/
  if ($('.page-template-page-home').length && !$('body.blog').length) {

    $('#home-menu').fullpage({
      responsiveWidth: 1200,
      recordHistory: true,
      menu: '#menu',
      touchstart: false,
      fitToSection: true,
      scrollbar: true,
      resize: true,
      offset: 500,
      easing: 'easeInOutCubic',
      css3: true,
      fixedElements: '.header, .footer',
      normalScrollElements: '#work-menu, #team-menu, #blog-menu, #service-menu',
      normalScrollElementTouchThreshold: 0,
      touchSensitivity: 100,
      afterRender: hideLastSection,
      afterLoad: toggleLogo
    });

    /*---------------------- scrolldown ------------- */
    $('#go').on('click', function () {
      $.fn.fullpage.moveSectionDown();
    });

    $('.work-fig .grid').isotope({
      // options...
      itemSelector: '.grid-item',
      masonry: {
        columnWidth: 0,
        gutter: 15
      }
    });
  }

  $('#workimg').addClass('scaleImg');

  /*--------------- Cart Compare - stick to top-------------*/
  var compare = $('.compare-basket');
  var header = $('header.servicepage');
  if(compare.length && header.length){
    $(window).on('DOMContentLoaded', function () {
      var offset = 0;
      header.on('header.stick', function () {
        var newOffset = $('header.servicepage').outerHeight();
        if(offset !== newOffset){
          offset = newOffset;
          compare.trigger('sticky_kit:detach');
          compare.stick_in_parent({
            offset_top: offset
          });
        }
      })
    });
  }
  else if (compare.length) {
    compare.stick_in_parent();
  }


  /*--------------- Cart filter - stick to bottom-------------*/
  /* Special Mention: http://stackoverflow.com/questions/123999/how-to-tell-if-a-dom-element-is-visible-in-the-current-viewport/7557433#7557433 */
  function isElementInViewport (el) {
    if (typeof jQuery === "function" && el instanceof jQuery) {
      el = el[0];
    }

    var rect = el.getBoundingClientRect();
    return (
      rect.top <= 0 &&
      rect.left >= 0 &&
      rect.bottom >= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
    );
  }
  function onVisibilityChange(el, callback) {
    var old_visible;
    return function () {
      var visible = isElementInViewport(el);
      if (visible != old_visible) {
        old_visible = visible;
        if (typeof callback == 'function') {
          callback(visible);
        }
      }
    }
  }

  var stickEl = {
    container: $('.grid'),
    element: $('.cartBarAffix'),
    class: 'stick-to-bottom'
  };

  if(stickEl.container.length && stickEl.element.length){
    var stickToBottom = onVisibilityChange(stickEl.container, function(visible) {
      if(visible){
        stickEl.element.addClass(stickEl.class);
      }else{
        if(stickEl.element.hasClass(stickEl.class)){
          stickEl.element.removeClass(stickEl.class);
        }
      }
    });
    $(window).on('DOMContentLoaded load resize scroll', stickToBottom);
  }

  if($('.bxslider').length){
    $('.bxslider').bxSlider({
      minSlides: 1,
      maxSlides: 1,
      slideWidth: 848,
      slideMargin: 0,
      pager: false
    });
  }

  if($('.project-slider').length){
    $('.project-slider').bxSlider({
      slideWidth: 380,
      minSlides: 1,
      slideMargin: 0,
      pager: false
    });
  }

  if($('.p_wrap').length){
    $('.p_wrap').bxSlider({
      pagerCustom: '#pager-ai'
    });
  }

  if($('#pager-ai').length){
    $('#pager-ai').bxSlider({
      minSlides: 3,
      maxSlides: 4,
      slideWidth: 170,
      slideMargin: 10,
      pager: false
    });
  }

  if($(window).width() > 480 && $('.bxslider-blog').length){
    $('.bxslider-blog').bxSlider({
      pager: false,
      adaptiveHeight: true
    });
  }

})(jQuery);

/* --------- product page --------*/

;
(function (window) {

  var support = {
      animations: Modernizr.cssanimations
    },
    animEndEventNames = {
      'WebkitAnimation': 'webkitAnimationEnd',
      'OAnimation': 'oAnimationEnd',
      'msAnimation': 'MSAnimationEnd',
      'animation': 'animationend'
    },
    animEndEventName = animEndEventNames[Modernizr.prefixed('animation')],
    onEndAnimation = function (el, callback) {
      var onEndCallbackFn = function (ev) {
        if (support.animations) {
          if (ev.target !== this) {
            return;
          }
          this.removeEventListener(animEndEventName, onEndCallbackFn);
        }
        if (callback && typeof callback === 'function') {
          callback.call();
        }
      };
      if (support.animations) {
        el.addEventListener(animEndEventName, onEndCallbackFn);
      } else {
        onEndCallbackFn();
      }
    };

  // from http://www.sberry.me/articles/javascript-event-throttling-debouncing
  function throttle(fn, delay) {
    var allowSample = true;

    return function (e) {
      if (allowSample) {
        allowSample = false;
        setTimeout(function () {
          allowSample = true;
        }, delay);
        fn(e);
      }
    };
  }

  // sliders - flickity
  var sliders = [].slice.call(document.querySelectorAll('.slider')),
    // grid element
    grid = document.querySelector('.grid'),
    // isotope instance
    iso,
    // filter ctrls
    filterCtrls = [].slice.call(document.querySelectorAll('.filter > button')),
    // cart
    cart = document.querySelector('.cart');

  cartItems = (cart) ? cart.querySelector('.cart__count') : null;

  function init() {
    // preload images
    imagesLoaded(grid, function () {
      initIsotope();
      initEvents();
      initChange();
      window.addEventListener('resize', throttle(function () {
        iso.layout();
      }, 50));

      // add to cart
      [].slice.call(grid.querySelectorAll('.grid__item')).forEach(function (item) {
        item.querySelector('.action--buy').addEventListener('click', addToCartAnimate);
      });
      classie.remove(grid, 'grid--loading');
    });
  }

  function initIsotope() {
    iso = new Isotope(grid, {
      isResizeBound: false,
      itemSelector: '.grid__item',
      percentPosition: true,
      masonry: {
        // use outer width of grid-sizer for columnWidth
        columnWidth: '.grid__sizer'
      },
      transitionDuration: '0.6s'
    });
  }

  function initEvents() {
    filterCtrls.forEach(function (filterCtrl) {
      filterCtrl.addEventListener('click', function (e) {
        e.preventDefault();
        classie.remove(filterCtrl.parentNode.querySelector('.filter__item--selected'), 'filter__item--selected');
        classie.add(filterCtrl, 'filter__item--selected');
        iso.arrange({
          filter: filterCtrl.getAttribute('data-filter')
        });
        iso.layout();

        var scroll = jQuery('.opnsans').offset().top;
        jQuery('body').animate({scrollTop: scroll}, '500');
      });
    });
  }



  /*------ on change------*/
  function initChange() {
    jQuery('.shop_page_filter').on('change', function (e) {
      e.preventDefault();
      iso.arrange({
        filter: jQuery('.shop_page_filter').val()
      });
      iso.layout();
    });
  }

  function addToCartAnimate() {
    classie.add(cart, 'cart--animate');
    onEndAnimation(cartItems, function () {
      classie.remove(cart, 'cart--animate');
    });
  }

  if (jQuery('.grid').length) {
    init();
  }

})(window);




/**
 * ideas-main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
(function () {

  var viewEl = document.querySelector('.view'),
    gridEl = (viewEl) ? viewEl.querySelector('.grid') : null,
    items = (gridEl) ? [].slice.call(gridEl.querySelectorAll('.product')) : null,
    basket;

  // the compare basket
  function CompareBasket() {
    this.el = document.querySelector('.compare-basket');
    this.compareCtrl = this.el.querySelector('.action--compare');
    this.compareWrapper = document.querySelector('.compare');
    this.closeCompareCtrl = this.compareWrapper.querySelector('.action--close');

    this.itemsAllowed = 3;
    this.totalItems = 0;
    this.items = [];

    // compares items in the compare basket: opens the compare products wrapper
    this.compareCtrl.addEventListener('click', this._compareItems.bind(this));
    // close the compare products wrapper
    var self = this;
    this.closeCompareCtrl.addEventListener('click', function () {
      // toggle compare basket
      classie.add(self.el, 'compare-basket--active');
      // animate..
      classie.remove(viewEl, 'view--compare');
    });
  }

  CompareBasket.prototype.add = function (item) {
    // check limit
    if (this.isFull()) {
      return false;
    }

    classie.add(item, 'product--selected');

    // create item preview element
    var preview = this._createItemPreview(item);
    // prepend it to the basket
    this.el.insertBefore(preview, this.el.childNodes[0]);
    // insert item
    this.items.push(preview);

    this.totalItems++;
    if (this.isFull()) {
      classie.add(this.el, 'compare-basket--full');
    }

    classie.add(this.el, 'compare-basket--active');
  };

  CompareBasket.prototype._createItemPreview = function (item) {
    var self = this;

    var preview = document.createElement('div');
    preview.className = 'product-icon';
    preview.setAttribute('data-idx', items.indexOf(item));

    var removeCtrl = document.createElement('button');
    removeCtrl.className = 'action action--remove';
    removeCtrl.innerHTML = '<i class="fa fa-remove"></i><span class="action__text action__text--invisible">Remove product</span>';
    removeCtrl.addEventListener('click', function () {
      self.remove(item);
    });

    var productImageEl = item.querySelector('img.product__image').cloneNode(true);
    preview.appendChild(productImageEl);
    preview.appendChild(removeCtrl);

    var productInfo = item.querySelector('.product__info').innerHTML;
    preview.setAttribute('data-info', productInfo);

    return preview;
  };

  CompareBasket.prototype.remove = function (item) {
    classie.remove(this.el, 'compare-basket--full');
    classie.remove(item, 'product--selected');
    var preview = this.el.querySelector('[data-idx = "' + items.indexOf(item) + '"]');
    this.el.removeChild(preview);
    this.totalItems--;

    var indexRemove = this.items.indexOf(preview);
    this.items.splice(indexRemove, 1);

    if (this.totalItems === 0) {
      classie.remove(this.el, 'compare-basket--active');
    }

    // checkbox
    var checkbox = item.querySelector('.action--compare-add > input[type = "checkbox"]');
    if (checkbox.checked) {
      checkbox.checked = false;
    }
  };

  CompareBasket.prototype._compareItems = function () {
    var self = this;

    // remove all previous items inside the compareWrapper element
    [].slice.call(this.compareWrapper.querySelectorAll('div.compare__item')).forEach(function (item) {
      self.compareWrapper.removeChild(item);
    });

    for (var i = 0; i < this.totalItems; ++i) {
      var compareItemWrapper = document.createElement('div');
      compareItemWrapper.className = 'compare__item';

      var compareItemEffectEl = document.createElement('div');
      compareItemEffectEl.className = 'compare__effect';

      compareItemEffectEl.innerHTML = this.items[i].getAttribute('data-info');
      // console.log(compareItemEffectEl);

      compareItemWrapper.appendChild(compareItemEffectEl);

      this.compareWrapper.insertBefore(compareItemWrapper, this.compareWrapper.childNodes[0]);
    }

    setTimeout(function () {
      // toggle compare basket
      classie.remove(self.el, 'compare-basket--active');
      // animate..
      classie.add(viewEl, 'view--compare');
    }, 25);
  };

  CompareBasket.prototype.isFull = function () {
    return this.totalItems === this.itemsAllowed;
  };

  function init() {
    // initialize an empty basket
    basket = new CompareBasket();
    initEvents();
  }

  function initEvents() {
    items.forEach(function (item) {
      var checkbox = item.querySelector('.action--compare-add > input[type = "checkbox"]');
      checkbox.checked = false;

      // ctrl to add to the "compare basket"
      checkbox.addEventListener('click', function (ev) {
        if (ev.target.checked) {
          if (basket.isFull()) {
            ev.preventDefault();
            return false;
          }
          basket.add(item);
        } else {
          basket.remove(item);
        }
      });
    });
  }
  if (viewEl) {
    init();
  }
})();
