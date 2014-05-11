// SmoothScroll v0.9.9
// Licensed under the terms of the MIT license.
// People involved
// - Balazs Galambosi: maintainer (CHANGELOG.txt)
// - Patrick Brunner (patrickb1991@gmail.com)
// - Michael Herf: ssc_pulse Algorithm
// Aprimorado por @luizgamabh

// Initialize

function ssc_init() {
    if (document.body) {
        var body = document.body,
            html = document.documentElement,
            windowHeight = window.innerHeight,
            scrollHeight = body.scrollHeight;
        if (ssc_root = document.compatMode.indexOf("CSS") >= 0 ? html : body, ssc_activeElement = body, ssc_initdone = !0, top != self) ssc_frame = true;
        else if (scrollHeight > windowHeight && (body.offsetHeight <= windowHeight || html.offsetHeight <= windowHeight) && ssc_root.offsetHeight <= windowHeight) {
            var r = document.createElement("div");
            r.style.clear = "both", body.appendChild(r)
        }
        /**
         * This fixes a bug where the areas left and right to
         * the content does not trigger the onmousewheel event
         * on some pages. e.g.: html, body { height: 100% }
         */
        ssc_fixedback || (body.style.backgroundAttachment = "scroll", html.style.backgroundAttachment = "scroll"), ssc_keyboardsupport && ssc_addEvent("keydown", ssc_keydown)
    }
}

// Scrolling

function ssc_scrollArray(elem, left, top, delay) {
    if (delay || (delay = 1000), ssc_directionCheck(left, top), ssc_que.push({
        x: left,
        y: top,
        lastX: 0 > left ? .99 : -.99,
        lastY: 0 > top ? .99 : -.99,
        start: +new Date
    }), !ssc_pending) {
        var step = function() {
            for (var now = +new Date, scrollX = 0, scrollY = 0, i = 0; i < ssc_que.length; i++) {
                var item = ssc_que[i],
                    elapsed = now - item.start,
                    finished = elapsed >= ssc_animtime,
                    position = finished ? 1 : elapsed / ssc_animtime;
                ssc_pulseAlgorithm && (position = ssc_pulse(position));
                var _x = item.x * position - item.lastX >> 0,
                    _y = item.y * position - item.lastY >> 0;
                scrollX += _x, scrollY += _y, item.lastX += _x, item.lastY += _y, finished && (ssc_que.splice(i, 1), i--)
            }
            if (left) {
                var lastLeft = elem.scrollLeft;
                elem.scrollLeft += scrollX, scrollX && elem.scrollLeft === lastLeft && (left = 0)
            }
            if (top) {
                var lastTop = elem.scrollTop;
                elem.scrollTop += scrollY, scrollY && elem.scrollTop === lastTop && (top = 0)
            }
            left || top || (ssc_que = []), ssc_que.length ? setTimeout(step, delay / ssc_framerate + 1) : ssc_pending = false
        };
        setTimeout(step, 0), ssc_pending = !0
    }
}

// Events

function ssc_wheel(event) {
    ssc_initdone || ssc_init();
    var target = event.target,
        overflowing = ssc_overflowingAncestor(target);
    if (!overflowing || event.defaultPrevented || ssc_isNodeName(ssc_activeElement, "embed") || ssc_isNodeName(target, "embed") && /\.pdf/i.test(target.src)) return true;
    var deltaX = event.wheelDeltaX || 0,
        deltaY = event.wheelDeltaY || 0;
    deltaX || deltaY || (deltaY = event.wheelDelta || 0), Math.abs(deltaX) > 1.2 && (deltaX *= ssc_stepsize / 120), Math.abs(deltaY) > 1.2 && (deltaY *= ssc_stepsize / 120), ssc_scrollArray(overflowing, -deltaX, -deltaY), event.preventDefault()
}

function ssc_keydown(event) {
    var target = event.target,
        modifier = event.ctrlKey || event.altKey || event.metaKey;
    if (/input|textarea|embed/i.test(target.nodeName) || target.isContentEditable || event.defaultPrevented || modifier) return true;
    if (ssc_isNodeName(target, "button") && event.keyCode === ssc_key.spacebar) return true;
    var shift, x = 0,
        y = 0,
        elem = ssc_overflowingAncestor(ssc_activeElement),
        clientHeight = elem.clientHeight;
    switch (elem == document.body && (clientHeight = window.innerHeight), event.keyCode) {
        case ssc_key.up:
            y = -ssc_arrowscroll;
            break;
        case ssc_key.down:
            y = ssc_arrowscroll;
            break;
        case ssc_key.spacebar:
            shift = event.shiftKey ? 1 : -1, y = -shift * clientHeight * .9;
            break;
        case ssc_key.pageup:
            y = .9 * -clientHeight;
            break;
        case ssc_key.pagedown:
            y = .9 * clientHeight;
            break;
        case ssc_key.home:
            y = -elem.scrollTop;
            break;
        case ssc_key.end:
            var i = elem.scrollHeight - elem.scrollTop - clientHeight;
            y = i > 0 ? i + 10 : 0;
            break;
        case ssc_key.left:
            x = -ssc_arrowscroll;
            break;
        case ssc_key.right:
            x = ssc_arrowscroll;
            break;
        default:
            return !0
    }
    ssc_scrollArray(elem, x, y), event.preventDefault()
}

function ssc_mousedown(event) {
    ssc_activeElement = event.target
}

function ssc_setCache(elems, overflowing) {
    for (var c = elems.length; c--;) ssc_cache[ssc_uniqueID(elems[c])] = overflowing;
    return overflowing
}

function ssc_overflowingAncestor(el) {
    var elems = [],
        ssc_rootScrollHeight = ssc_root.scrollHeight;
    do {
        var cached = ssc_cache[ssc_uniqueID(el)];
        if (cached) return ssc_setCache(elems, cached);
        if (elems.push(el), ssc_rootScrollHeight === el.scrollHeight) {
            if (!ssc_frame || ssc_root.clientHeight + 10 < ssc_rootScrollHeight) return ssc_setCache(elems, document.body)
        } else if (el.clientHeight + 10 < el.scrollHeight && (overflow = getComputedStyle(el, "").getPropertyValue("overflow"), "scroll" === overflow || "auto" === overflow)) return ssc_setCache(elems, el)
    } while (el = el.parentNode)
}

// Helpers

function ssc_addEvent(type, fn, bubble) {
    window.addEventListener(type, fn, bubble || false)
}

function ssc_removeEvent(type, fn, bubble) {
    window.removeEventListener(type, fn, bubble || false)
}

function ssc_isNodeName(el, tag) {
    return el.nodeName.toLowerCase() === tag.toLowerCase()
}

function ssc_directionCheck(x, y) {
    x = x > 0 ? 1 : -1, y = y > 0 ? 1 : -1, (ssc_direction.x !== x || ssc_direction.y !== y) && (ssc_direction.x = x, ssc_direction.y = y, ssc_que = [])
}

// ssc_pulse

function ssc_pulse_(x) {
    var s, c, t;
    return x *= ssc_pulseScale, 1 > x ? s = x - (1 - Math.exp(-x)) : (c = Math.exp(-1), x -= 1, t = 1 - Math.exp(-x), s = c + t * (1 - c)), s * ssc_pulseNormalize
}

function ssc_pulse(x) {
    return x >= 1 ? 1 : 0 >= x ? 0 : (1 == ssc_pulseNormalize && (ssc_pulseNormalize /= ssc_pulse_(1)), ssc_pulse_(x))
}
var ssc_framerate = 150,
    ssc_animtime = 500,
    ssc_stepsize = 150,
    ssc_pulseAlgorithm = !0,
    ssc_pulseScale = 6,
    ssc_pulseNormalize = 1,
    ssc_keyboardsupport = !0,
    ssc_arrowscroll = 50,
    ssc_frame = false,
    ssc_direction = {
        x: 0,
        y: 0
    },
    ssc_initdone = false,
    ssc_fixedback = true,
    ssc_root = document.documentElement,
    ssc_activeElement, ssc_key = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        spacebar: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36
    },
    ssc_que = [],
    ssc_pending = false,
    ssc_cache = {};
setInterval(function() {
    ssc_cache = {}
}, 1e4);
var ssc_uniqueID = function() {
    var i = 0;
    return function(el) {
        return el.ssc_uniqueID || (el.ssc_uniqueID = i++)
    }
}(),
    ischrome = /chrome/.test(navigator.userAgent.toLowerCase());
ischrome && (ssc_addEvent("mousedown", ssc_mousedown), ssc_addEvent("mousewheel", ssc_wheel), ssc_addEvent("load", ssc_init));