!function ($) {

    var defaults = {
        sectionContainerTag: "section",
        pageBar: true,
        animationTime: 1000,
        easing: "ease",
        updateUrl: true,
        beforeAnimate: null,
        afterAnimate: null,
        loop: true,
        direction: 'vertical'
    };

    // 触摸事件支持
    $.fn.swipeEvents = function () {
        return $(this).each(function () {
            var startX, startY, $this = $(this);

            $this.bind("touchstart", touchStart);

            function touchStart(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    startX = touches[0].pageX;
                    startY = touches[0].pageY;
                    $this.bind('touchmove', touchMove);
                }
            }

            function touchMove(event) {
                var touches = event.originalEvent.touches;
                if (touches && touches.length) {
                    var deltaX = startX - touches[0].pageX;
                    var deltaY = startY - touches[0].pageY;

                    if (deltaX >= 50) {
                        $this.trigger("swipeLeft");
                    }
                    if (deltaX <= -50) {
                        $this.trigger("swipeRight");
                    }
                    if (deltaY >= 50) {
                        $this.trigger("swipeUp");
                    }
                    if (deltaY <= 50) {
                        $this.trigger("swipeDown");
                    }
                    if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                        $this.unbind('touchmove', touchMove);
                    }
                }
            }
        });
    }

    $.fn.fullscreenscroll = function (options) {
        var _settings = $.extend({}, defaults, options);
        var _tag = _settings.sectionContainerTag;
        var _elem = $(this);
        var _sections = $(this).find(_tag);
        var _total = _sections.length;
        var _top = 0;
        var _left = 0;
        var _pageBarList = "";
        var _lastAnimationTime = 0;
        var _blockTime = 500;
        var _urlHashHeader = "#";
        var _wrapperClassName = "fullscreenscroll-wrapper";
        var _disabledClassName = "fullscreenscroll-disabled";
        var _pageBarClassName = "fullscreenscroll-pageBar";

        $.fn.transformPage = function (_settings, pos, index) {
            if (typeof _settings.beforeAnimate == 'function') _settings.beforeAnimate(index);

            if ($('html').hasClass('ie8')) {
                if (_settings.direction == 'horizontal') {
                    var left = (_elem.width() / 100) * pos;
                    $(this.animate({ left: left + 'px' }, _settings.animationTime));
                }
                else {
                    var top = (_elem.height() / 100) * pos;
                    $(this.animate({ top: top + 'px' }, _settings.animationTime));
                }
            }
            else {
                var transform = _settings.direction == 'horizontal' ? "translate3d(" + pos + "%, 0, 0)" : "translate3d(0, " + pos + "%, 0";
                var transition = "all " + _settings.animationTime + "ms " + _settings.easing;
                $(this).css({
                    "-webkit-transform": transform,
                    "-webkit-transition": transition,
                    "-moz-transform": transform,
                    "-moz-transition": transition,
                    "-ms-transform": transform,
                    "-ms-transition": transition,
                    "transform": transform,
                    "transition": transition
                });
            }
            $(this).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
                if (typeof _settings.afterAnimate == "function") _settings.afterAnimate(index);
            });
        }

        $.fn.moveNext = function () {
            var index = _elem.find(_tag + ".active").data('index');
            var current = _elem.find(_tag + "[data-index='" + index + "']");
            var next = _elem.find(_tag + "[data-index='" + (index + 1) + "']");

            var pos;
            if (next.length == 0) {
                if (_settings.loop) {
                    pos = 0;
                    next = _elem.find(_tag + "[data-index='1']");
                }
                else {
                    return;
                }
            }
            else {
                pos = index * -100;
            }
            
            // 处理事件
            if (typeof _settings.beforeAnimate == 'function') _settings.beforeAnimate(next.data('index'));

            current.removeClass('active');
            next.addClass('active');

            // 更新pageBar
            if (_settings.pageBar) {
                $("." + _pageBarClassName + " li a" + "[data-index='" + index + "']").removeClass("active");
                $("." + _pageBarClassName + " li a" + "[data-index='" + next.data('index') + "']").addClass("active");
            }

            $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
            $("body").addClass("viewing-page-" + next.data("index"));

            // 更新 浏览器history
            if (history.replaceState && _settings.updateUrl) {
                var href = window.location.href.substr(0, window.location.href.lastIndexOf("#")) + _urlHashHeader + next.data('index');
                history.pushState({}, document.title, href);
            }

            // 重绘页面
            _elem.transformPage(_settings, pos, next.data("index"));
        }

        $.fn.movePrev = function () {
            var index = _elem.find(_tag + '.active').data('index');
            var current = _elem.find(_tag + "[data-index='" + index + "']");
            var prev = _elem.find(_tag + "[data-index='" + (index - 1) + "']");
            var pos;

            // 如果编号 index - 1 的section不存在
            if (prev.length == 0) {
                if (_settings.loop) {
                    pos = (_total - 1) * -100;
                    // 将prev定位到最后一个section
                    prev = $(_tag + "[data-index='" + _total + "']");
                }
                else {
                    return;
                }
            }
            else {
                // 计算
                pos = (prev.data("index") - 1) * -100;
            }

            if (typeof _settings.beforeAnimate == 'function') _settings.beforeAnimate(prev.data("index"));

            current.removeClass("active");
            prev.addClass("active");
            if (_settings.pageBar) {
                $("." + _pageBarClassName + " li a" + "[data-index='" + index + "']").removeClass("active");
                $("." + _pageBarClassName + " li a" + "[data-index='" + prev.data('index') + "']").addClass("active");
            }

            $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, "");
            $("body").addClass("viewing-page-" + prev.data('index'));

            if (history.replaceState && _settings.updateUrl) {
                var href = window.location.href.substr(0, window.location.href.lastIndexOf("#")) + _urlHashHeader + prev.data('index');
                history.pushState({}, document.title, href);
            }

            _elem.transformPage(_settings, pos, prev.data('index'));
        }

        $.fn.moveTo = function (index) {
            var current = $(_tag + '.active');
            var next = $(_tag + "[data-index='" + index + "']");
            var pos;
            if (next.length > 0) {
                if (typeof _settings.beforeAnimate == 'function') _settings.beforeAnimate(next.data('index'));
                current.removeClass('active');
                next.addClass('active');

                if (_settings.pageBar) {
                    $("." + _pageBarClassName + " li a" + ".active").removeClass("active");
                    $("." + _pageBarClassName + " li a" + "[data-index='" + index + "']").addClass("active");
                }

                $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, '');
                $("body").addClass("viewing-page-" + next.data("index"));

                pos = (index - 1) * -100;

                if (history.replaceState && _settings.updateUrl) {
                    var href = window.location.href.substr(0, window.location.href.lastIndexOf("#")) + _urlHashHeader + index;
                    history.pushState({}, document.title, href);
                }
                _elem.transformPage(_settings, pos, index);
            }
        }

        function scroll(event, delta) {
            var timeNow = new Date().getTime();
            if (timeNow - _lastAnimationTime < _settings.animationTime + _blockTime) {
                event.preventDefault();
                return;
            }

            if (delta < 0) {
                _elem.moveNext();
            }
            else {
                _elem.movePrev();
            }

            _lastAnimationTime = timeNow;
        }

        // 浏览器不支持时候退化到滚动模式
        function responsive() {
            var flag = false;
            var type = typeof _settings.responsiveFallback;

            if (type == "number") {
                flag = $(window).width() < _settings.responsiveFallback;
            }

            if (type == "boolean") {
                flag = _settings.responsiveFallback;
            }

            if (type == "function") {
                var test = _settings.responsiveFallback();
                if (typeof test == "number") {
                    flag = $(window).width() < test;
                }
            }

            if (flag) {
                $("body").addClass(_disabledClassName);
                $(document).unbind('mousewheel DOMMouseScroll MozMousePixelScroll');
                _elem.swipeEvents().unbind("swipeDown swipeUp");
            }
            else {
                if ($("body").hasClass(_disabledClassName)) {
                    $("body").removeClass(_disabledClassName);
                    $("html,body").animate({ scrollTop: 0 }, "fast");
                }

                _elem.swipeEvents()
                    .bind("swipeDown", function (event) {
                        if ($("body").hasClass(_disabledClassName)) {
                            event.preventDefault();
                        }
                        _elem.movePrev();
                    }).bind("swipeUp", function (event) {
                        if ($("body").hasClass(_disabledClassName)) {
                            event.preventDefault();
                        }
                        _elem.moveNext();
                    });

                $(document).bind("mousewheel DOMMouseScroll MozMousePixelScroll", function (event) {
                    event.preventDefault();
                    var delta = event.originalEvent.wheelDelta || - event.originalEvent.detail;
                    scroll(event, delta);
                })
            }
        }
        
        //初始化
        _elem.addClass(_wrapperClassName).css("position", "relative");
        _sections.each(function (index) {
            $(this).css({
                position: 'absolute',
                top: _settings.direction == 'vertical' || _settings.direction != 'horizontal' ? _top + '%' : 0,
                left: _settings.direction == 'horizontal' ? _left + '%' : 0,
            })
                .addClass('section')
                .attr('data-index', index + 1)
                .data('index', index + 1);

            if (_settings.direction == 'horizontal')
                _left += 100;
            else
                _top += 100;

            if (_settings.pageBar) {
                _pageBarList += "<li><a data-index='" + (index + 1) + "'></a></li>";
            }
        });

        // 触摸滑动支持
        _elem.swipeEvents()
            .bind("swipeDown", function (event) {
                if (!$("body").hasClass(_disabledClassName)) {
                    event.preventDefault();
                    _elem.movePrev();
                }
            })
            .bind("swipeUp", function (event) {
                if (!$("body").hasClass(_disabledClassName)) {
                    event.preventDefault();
                    _elem.moveNext();
                }
            });

        // 生成pageBar
        if (_settings.pageBar) {
            if ($("ul." + _pageBarClassName).length == 0) {
                $("<ul class='" + _pageBarClassName + "'></ul>").prependTo("body");
            }
            var ul = $("body").find("." + _pageBarClassName);

            if (_settings.direction == 'horizontal') {
                var left = ul.width() / -2;
                ul.css({
                    "margin-right": left,
                    "bottom": "10px",
                    "right": "50%",
                });
            }
            else {
                var top = ul.height() / -2;
                ul.css({
                    "margin-top": top,
                    "bottom": "50%",
                    "right": "10px"
                });
            }
            
            // 生成按钮栏
            ul.html(_pageBarList);
            
            // fix 不同方向pageBar的排列方式
            var lis = ul.find("li");
            if (_settings.direction == 'horizontal') {
                lis.css("display", "inline-block");
            }
            else {
                lis.css("display", "block");
            }
            
            // 添加点击跳转事件
            $("ul." + _pageBarClassName + " li a").click(function () {
                var index = $(this).data("index");
                _elem.moveTo(index);
            });
        }
        
        // 收藏夹收藏hash值后，再次进入页面直接跳转
        if (window.location.hash && window.location.hash != _urlHashHeader + '1') {
            var tarIndex = window.location.hash.replace(_urlHashHeader, "");
            var index = parseInt(tarIndex);

            if (index <= _total && index > 0) {
                $(_tag + "[data-index='" + tarIndex + "']").addClass('active');
                $("body").addClass("viewing-page-" + tarIndex);
                if (_settings.pageBar) {
                    $("ul." + _pageBarClassName + " li a[data-index='" + tarIndex + "']").addClass("active");
                }

                var tarSection = $(_tag + "[data-index='" + tarIndex + "']");
                tarSection.addClass("active");
                
                // 更新pageBar
                if (_settings.pageBar) {
                    $("." + _pageBarClassName + " li a[data-index='" + tarIndex + "']").addClass("active");
                }
                
                // 更新body
                $("body")[0].className = $("body")[0].className.replace(/\bviewing-page-\d.*?\b/g, "");
                $("body").addClass("viewing-page-" + tarSection.data("index"));

                if (history.replaceState && _settings.updateURL) {
                    var href = window.location.href.substr(0, window.location.href.indexOf('#')) + _urlHashHeader + tarIndex;
                    history.pushState({}, document.title, href);
                }

                var pos = (index - 1) * -100;
                _elem.transformPage(_settings, pos, index);
            }
        }
        else {
            $(_tag + "[data-index='1']").addClass('active');
            $("body").addClass("viewing-page-1");
            if (_settings.pageBar) {
                $("ul." + _pageBarClassName + " li a[data-index='1']").addClass("active");
            }
        }
        
        // 绑定滚轮事件
        $(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function (event) {
            event.preventDefault();
            var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
            if (!$("body").hasClass(_disabledClassName)) {
                scroll(event, delta);
            }
        });

        if (!_settings.responsiveFallback) {
            $(window).resize(function () {
                responsive();
            })
            responsive();
        }

        return false;
    }
} (window.jQuery);

