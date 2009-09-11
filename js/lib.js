// http://jsgt.org/mt/archives/01/001175.html
function $(el) {
    return $[el] || ($[el] = (document.getElementById(el) || el));
}

// Refer to "JavaScript: The Definitive Guide,  5th Edition" (O'REILLY)
var Ajax = {};
    Ajax.request = function(url, callback, options) {
        var xhr = new XMLHttpRequest();
        var timer;
        if(options.timeout) {
            timer = setTimeout(function() {
                xhr.abort();
                if(options.timeoutHandler) {
                    options.timeoutHandler(url);
                }
            }, options.timeout);
        }

        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4) {
                if(timer) clearTimeout(timer);
                if(xhr.status == 200) {
                    callback(xhr);
                } else {
                    if(options.errorHandler) {
                        options.errorHandler(url, xhr.status, xhr.statusText);
                    }
                }
            }
        }

        var opts = {
            type: options.type || "GET",
            async: options.async || true,
            user: options.user || null,
            pass: options.pass || null,
            query: options.query || "",
            header: options.header || {}
        }
        if(opts.user && opts.pass) {
            log(opts.type)
            xhr.open(opts.type, url, opts.async, opts.user, opts.pass);
        } else {
            xhr.open(opts.type, url, opts.async);
        }
        xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
        for(var t in opts.header) {
            xhr.setRequestHeader(t, opts.header[t]);
        }
        xhr.send(opts.query);
    }

var preLoadImage = function(l) {
    for(var i = 0, len = l.length; i < len; i++) {
        new Image().src = l[i];
    }
}

var log = function() {
    var l = "";
    for(var i = 0, len = arguments.length; i < len; i++) {
        l += i < len - 1 ? arguments[i] + ": ": arguments[i];
    }
    opera.postError(l);
}

var Tools = {};
    Tools.absoluteTime = function(time) {
        var t = time.split(' ');
        var Month = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        var y = parseInt(t[5]);
        var m = Month[t[1]];
        var d = parseInt(t[2]);
        var time = t[3].split(':')
        var H = parseInt(time[0]);
        var M = parseInt(time[1]);
        var S = parseInt(time[2]);
        var postTime = new Date(y, m, d, H, M, S);
            postTime = new Date(postTime.getTime() + 9 * 60 * 60 * 1000);
        return postTime.getHours() + ":" + postTime.getMinutes();
    };
    Tools.createTime = function(time, locale) {
		var langs = Twippera.config.langs;
        var t = time.split(' ');
        var Month = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        var y = parseInt(t[5]);
        var m = Month[t[1]];
        var d = parseInt(t[2]);
        var time = t[3].split(':')
        var H = parseInt(time[0]);
        var M = parseInt(time[1]);
        var S = parseInt(time[2]);
        var postTime = Date.UTC(y, m, d, H, M, S);
        var nowTime = new Date().getTime();
        var sa = Math.round((nowTime - postTime) / 60 / 1000);
        if(sa < 1) {
            return langs.less;
        } else if(sa == 1) {
            return sa + langs.minago;
        } else if(sa > 1 && sa < 60) {
            return sa + langs.minsago;
        } else {
            var hours = Math.floor(sa / 60);
            return (hours == 1) ? hours + langs.hrago : hours + langs.hrsago;
        }
    };
    Tools.createHTML = function(text) {
        var self = this;
        var text = text.replace(/&amp;/g, "&");
        text = text.replace(
//            /((https?|ftp)(:\/\/[-_.!~*\'a-zA-Z0-9;\/?:\@&=+\$,\%#]+))/g,
//            /(https?|ftp)(:\/\/[^\s\(\)]+)/g,
            /((https?|s?ftp|ssh)\:\/\/[^"\s\<\>]*[^.,;'">\:\s\<\>\)\]\!])/g, // from http://twitter.com/javascripts/blogger.js
            function(url){
                if(url.indexOf('http://tinyurl.com/') == 0
                    || url.indexOf('http://z.la/') == 0
                    || url.indexOf('http://ff.im/') == 0
                    || url.indexOf('http://bit.ly/') == 0) {
                    url = DecodeURI(self.resolveTinyUrl(url) || url);
                }
                return '<a href="' + url + '">' + url +'</a>';
            }
        );
        return text.replace(/\B@([_a-z0-9]+)/ig, function(reply) {
			return reply.charAt(0) + '<a href="http://twitter.com/' + reply.substring(1) + '">' + reply.substring(1) + '</a>';
		});
    };
    // Tinyurl 展開: 1つに付き about 600ms
    Tools.resolveTinyUrl = function(url) {
        var exURL;
        var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4) {
                    exURL = escape(xhr.getResponseHeader('Location'));
                }
            }
            xhr.send(null);
        return exURL || url;
    };

// 2つ以上のクラスがつく可能性がある場合
var appendClass = function(elm, _class) {
    elm.className += elm.className ? " " + _class : _class;
}

//Widget
var Widget = {}
    Widget.setValue = function(value, key) {
        var vals = ""
        switch(value.constructor) {
            case Array:
                vals = value.join(',');
                break;
            case String:
                vals = value;
            case Number:
                vals = value.toString();
            default:
                vals = value;
        }
        widget.setPreferenceForKey(vals, key);
        return this;
    };
    Widget.getValue = function(key, type) {
        var value = widget.preferenceForKey(key);
        if(typeof type != 'undefined') {
            switch(type) {
                case 'Number':
                    return parseInt(value);
                    break;
                case 'Array':
                    return value.split(',');
                    break;
				case 'Boolean':
					return value == 'true' ? true : false;
                default:
                    break;
            }
        } else {
            return value;
        }
    }

// Array
Array.prototype.map = function(callback, thisObject) {
    for(var i = 0, len = this.length, res = []; i < len; i++) {
        res[i] = callback.call(thisObject, this[i], i, this);
    }
    return res;
}

Array.prototype.indexOf = function(obj) {
    for(var i = 0, l = this.length; i < l; i++) {
        if(this[i] == obj) {
            return i;
        }
    }
    return -1;
}

Array.prototype.contains = function(obj) {
    for(var i = 0, len = this.length;i < len; i++) {
        if(this[i] == obj) {
            return true;
        }
    }
    return false;
}
Array.prototype.del = function(obj) {
    var len = this.length;
    var r = new Array(len - 1);
    for(var i = 0; i < len; i++) {
        if(this[i] != obj) {
            r.push(this[i]);
        }
    }
    return r;
}

function addClass(elm, class) {
    elm.className = elm.className + ' ' + class;
}

function removeClass(elm, class) {
    elm.calssName.replace(new RegExp(class), "");
}

function setCaretPosition(ctrl, pos) {
    if(ctrl.setSelectionRange) {
        ctrl.focus();
        ctrl.setSelectionRange(pos,pos);
    }
    else if (ctrl.createTextRange) {
        var range = ctrl.createTextRange();
        range.collapse(true);
        range.moveEnd('character', pos);
        range.moveStart('character', pos);
        range.select();
    }
}

//
// TransURI (UTF-8): transURI.js (Ver.041211)
//
// Copyright (C) http://nurucom-archives.hp.infoseek.co.jp/digital/
//

var DecodeURI=function(str){
	return str.replace(/%(E(0%[AB]|[1-CEF]%[89AB]|D%[89])[0-9A-F]|C[2-9A-F]|D[0-9A-F])%[89AB][0-9A-F]|%[0-7][0-9A-F]/ig,function(s){
		var c=parseInt(s.substring(1),16);
		return String.fromCharCode(c<128?c:c<224?(c&31)<<6|parseInt(s.substring(4),16)&63:((c&15)<<6|parseInt(s.substring(4),16)&63)<<6|parseInt(s.substring(7),16)&63)
	})
};
