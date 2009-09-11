// twippera.js

var Twippera = {
    version  : '20090609-1',
    release  : 34,
    TID      : null,
    parse    : true,
    postMsgs : [],
    PMindx   : 0,
    timeout  : 30000,
    fcount   : 0,
    msgState : "recent",
    itemfocus: null
}
    Twippera.initEvent = function() {
        var self = this;
        var config = self.config;
        var locale = config.locale;

//        $('header').addEventListener('dblclick', function() {
//            self.foldMsgList();
//        }, false);

        $('reload').addEventListener('click', function(e){
            if(config.ear) {
                self.autoReflesh();
            } else {
                self.post("friends_timeline");
            }
            if(Widget.getValue('state') == 'back') {
                self.flipWidget('front');
            } 
        }, false);

        $('pref').addEventListener('click', function(e) {
            if(Widget.getValue('state') == 'front') {
                self.flipWidget('back');
            } else {
                self.flipWidget('front');
            }
        }, false);
        
        $('wclose').addEventListener('click', function(e) {
            window.close();
        }, false);

        $('post').addEventListener('click', function() {
            self.post('update');
        }, false);

        $('save').addEventListener('click', function() {
            self.config.init();
        }, false);

        $('about').addEventListener('click', function() {
            self.showPopup(
                config.langs.abt,
                [
                    "&nbsp;",
                    config.langs.version,
                    ": ",
                    self.version,
                    ' (<a href="http://widgets.opera.com/widget/6522">',
                        config.langs.download,
                    '</a>)'
                ].join(""),
                [
                    "&nbsp;",
                    config.langs.author,
                    ': <a href="http://higeorange.com/">Higeorange</a> ',
                    '(<a href="http://twitter.com/higeorange">Twitter</a>)'
                ].join(''),
                [
                    "&nbsp;",
                    config.langs.design,
                    ': tobetchi (<a href="http://twitter.com/tobetchi">Twitter</a>)'
                ].join(''),
                "",
                config.langs.trans,
                '&nbsp;Español: Eduardo Escáre',
                '&nbsp;Magyor: Tamás Zahol',
                '&nbsp;Lietuviškai: Gediminas Ryženinas',
                '&nbsp;Русский: Andrew Ustimov, anton, neonmailbox',
                '&nbsp;Italiano: Alberto Raffaele Casale', 
                '&nbsp;Português: Eduardo Medeiros Schut',
                '&nbsp;简体中文: Jimmy Lvo',
                '&nbsp;Français: Yoann007',
                '&nbsp;Deutsch: Andrew Kupfer',
				'&nbsp;Ймення на рідній мові: Victoria Herukh',
				'&nbsp;Latviešu: Ivars Šaudinis',
				'&nbsp;Norsk bokmål: Brede Kaasa',
				'&nbsp;Português BR Carlos Gomes'
            );
        }, false);

        $('recent').addEventListener('click', function() {
            self.display('recent');
        }, false);

        $('replies').addEventListener('click', function() {
            self.display('replies');
        }, false);

        $('favorites').addEventListener('click', function() {
            self.display('favorites');
        }, false);

        $('pclose').addEventListener('click', function() {
            self.hidePopup();
        }, false);
        $('status').addEventListener('keydown', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
        }, false);

        $('status').addEventListener('keyup', function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            var status = $('status').value
            var rest   = 140 - status.length;
            $('count').innerHTML = (rest >= 0) ? rest : 0;
        }, false);

        $('query').addEventListener('keyup', function(evt) {
            var query = $('query').value;
            self.cache.updateCond(function(c) {
                return c["usr"].indexOf(query) > -1;
            });
        }, false);

        new KeyBinds($('status'), {
            "Up": function(evt) {
                if(self.postMsgs[self.PMindx + 1] && !evt.shiftKey) {
                    self.showPostHistory('back');
                }
            },
            "Down": function(evt) {
                if(self.postMsgs[self.PMindx - 1] && !evt.shiftKey) {
                    self.showPostHistory('forward');
                }
            }
        }).load();
    };
    Twippera.showPostHistory = function(to) {
        var status = $('status')
        if(to == 'back') {
            if(this.PMindx == 0) {
                this.postMsgs[0] = {
                    msg: $('status').value,
                    post: 0
                };
            }
            this.PMindx++;
        } else if (to == 'forward') {
            this.PMindx--;
        }
        status.value = this.postMsgs[this.PMindx].msg;
        setCaretPosition(status, status.value.length);
    };

    Twippera.foldMsgList = function() {
        switch (Widget.getValue('list')) {
            case "show":
                $('updateList').style.height = '0'
                Widget.setValue('hide', 'list');
                break;
            case "hide":
                $('updateList').style.height = '280px'
                Widget.setValue('show', 'list');
                break;
            default:
                break;
        }
    };

    Twippera.flipWidget = function(to) {
        switch (to) {
            case "back":
                $('front').style.display  = "none";
                $('config').style.display = "block";
                Widget.setValue('back', 'state');
                break;
            case "front":
                $('front').style.display  = "block";
                $('config').style.display = "none";
                Widget.setValue('front', 'state');
                break;
            default:
                break;
        }
    };

    Twippera.autoReflesh = function() {
        clearInterval(this.TID);
        var self = this;
        this.post("friends_timeline");
        this.TID = setInterval(
            function(){ self.post("friends_timeline") },
            Twippera.config.time);
    };

    Twippera.post = function(postType) {
        var self = this;
            self.hidePopup();
        var config = Twippera.config;
        var locale = config.locale;
        var cache = self.cache;


        var status = "";
        var query = null;
        var type;
        $('reload').style.backgroundImage = 'url("images/loading.gif")';

        if(postType == 'update') {
            type = "POST"
            status = $('status').value;
            if(status == "") return;
            query = 'status=' + encodeURIComponent(status) + '&source=Twippera';
            $('status').value = "";
            if(self.postMsgs[0]) {
                if(!self.postMsgs[0].post) {
                    self.postMsgs.shift();
                }
            }
            self.postMsgs.unshift({msg: "", post : 0}, {msg: status, post: 1});
            self.PMindx = 0;
        } else {
            type = "GET"
//            type = "POST" //POST はほんとはだめ. 新しい機能試すときだけ
            if(this.fcount > 10) {
                self.favorite.get(false);
                this.fcount = 0;
            } else {
                this.fcount++;
            }
        }

        var url = "http://twitter.com/statuses/" + postType + ".json";
        Ajax.request(
            url,
            function(xhr) {
                if(postType == 'friends_timeline') {
                    cache.update(xhr.responseText);
                } else if(postType == 'update') {
                    cache.update('[' + xhr.responseText + ']');
                }
                if(self.msgState == "recent") {
                    cache.parse();
                }
                $('reload').style.backgroundImage = 'url("images/reload.gif")';
                status = $('status').value;
                var rest   = 140 - status.length;
                $('count').innerHTML = (rest >= 0) ? rest : 0;
            }, {
                type: type,
                query: query,
                user: config.user,
                pass: config.pass,
                timeout: config.timeout,
                timeoutHandler: function(url) {
                    self.showPopup(config.langs.timeout);
                    $('reload').style.backgroundImage = 'url("images/reload.gif")';
                    log(url, "Timeout");
                },
                errorHandler: function(url, st, txt) {
                    log(url + ": " + st + ": " + txt);
                    $('reload').style.backgroundImage = 'url("images/reload.gif")';
                }
            }
        );
    };

    Twippera.destroy = function(id) {
        var config = Twippera.config;
        var api_url = "http://twitter.com/statuses/destroy/" + id + ".json"

        Ajax.request(
            api_url,
            function(xhr) {
                $(id).parentNode.removeChild($(id));
                Twippera.cache.remove(id);
            }, {
                type: 'DELETE',
                user: config.user,
                pass: config.pass
            }
        );
    }
    Twippera.display = function(to) {
        if(this.msgState == to) return;
        if (this.msgState) 
        removeClass($(this.msgState), "focused")
        switch(to) {
            case "replies":
                $('updateList').scrollTop = 0;
                addClass($('replies'), 'focused')

                Twippera.parse = false;
                Twippera.msgState = "replies";
                Twippera.replies.get();
                break;
            case "favorites":
                $('updateList').scrollTop = 0;
                addClass($('favorites'), 'focused');

                Twippera.parse = false;
                Twippera.msgState = "favorites";
                Twippera.favorite.get(true);
                break;
            case "recent":
                $('updateList').scrollTop = 0;
                addClass($('recent'), 'focused');

                Twippera.parse = true;
                Twippera.msgState = "favorites";
                Twippera.msgState = "recent";
                Twippera.cache.parse();
                break;
            default:
                break;
        }
    }

    Twippera.config = {
        user    : "",
        pass    : "",
        locale  : "en",
		langs   : {},
        lng     : null,
        time    : 60000,
        limit   : 200
    };
    Twippera.config.init = function() {
        var user = $('user').value;
        var pass = $('pass').value;

        this.user = user;
        this.pass = pass;
        Widget.setValue(user, 'user');
        Widget.setValue(pass, 'pass');

        var time = parseInt($('reflesh').value) * 1000 * 60;
        Widget.setValue(time, "time");
        if($('sar').checked) {
            Widget.setValue("true", "enableReflesh");
        } else {
            Widget.setValue("false", "enableReflesh");
            clearInterval(this.TID);
        }

        var timeout = parseInt($('timeout').value) * 1000;
        Widget.setValue(timeout, 'timeout');

        var limit = parseInt($('cache').value);
        Widget.setValue(limit, 'limit');

        var localeSel = $("locale");
        var locale = localeSel.value;
        Widget.setValue(locale, "locale");

        this.load();
        Twippera.flipWidget('front');
    };
    Twippera.config.load = function() {
        Widget.setValue('front', 'state');
        Widget.setValue('show', 'list');
        this.locale = Widget.getValue("locale") || "en";
        $('locale').selectedIndex = localeIndex[this.locale];
        this.setLocale(this.locale);
        this.user = Widget.getValue('user');
        this.pass = Widget.getValue('pass');
        this.time = Widget.getValue('time');
        this.ear  = Widget.getValue('enableReflesh', 'Boolean');
        this.timeout = Widget.getValue('timeout', 'Number');
        this.limit = Widget.getValue('limit', 'Number');

        $('count').innerHTML = '140';

        if(this.user != "" && this.pass !="") {
            addClass($(Twippera.msgState), 'focused');
            $('user').value = this.user;
            $('pass').value = this.pass;

            if(Twippera.fcount > 4) {
                Twippera.favorite.get(false);
                Twippera.fcount = 0;
            } else {
                Twippera.fcount++;
            }

            if(this.ear) {
                $("sar").checked = true;
                $("reflesh").value = this.time / 60000; 
                Twippera.autoReflesh();
            } else {
                $("sar").checked = false;
                Twippera.post('friends_timeline');
            }
            $('timeout').value = this.timeout / 1000;
            $('cache').value = this.limit;
        } else {
            Twippera.flipWidget("back");
        }
    };
    Twippera.config.setLocale = function(lng) {
		this.script= document.createElement('script');
		this.script.type = 'text/javascript';
		this.script.src = './js/lng/' + lng + '.js';
		document.body.appendChild(this.script);
    };
	Twippera.config.loadLocaleFile = function(langs) {
	    for(var i in langs) {
			if($(i)) {
				$(i).innerHTML = langs[i];
			}
			this.langs[i] = langs[i];
        }
		this.script.parentNode.removeChild(this.script);
	};

    Twippera.msg = function() {
        this.list = [];
        this.issort = true;
        this.limit = Twippera.config.limit;
        this.template = [
            '<li id="#{id}" class="#{cl}">',
                '<img src="#{img}" ',
                     'alt="#{usr}" ',
                     'style="width:16px;height:16px" ',
                     'onclick="Twippera.replies.reply(\'#{usr}\')">',
                '<span class="user" ',
                      'onclick="widget.openURL(\'http://twitter.com/#{usr}\')">#{usr}',
                '</span>',
                ': ',
                '<span class="msg">',
                    '#{msg}',
                '</span>',
                '<span class="meta">',
                    '<span class="post_time">',
                        '<a href="http://twitter.com/#{usr}/statuses/#{id}">',
                            '#{time}',
                        '</a>',
                    '</span>',
                    '#{prot}',
                    '#{trash}',
                    '<span class="fav" ',
                        'style="background-image:url(\'#{star}\')" ',
                        'onclick="Twippera.favorite.toggle(this, #{id})">',
                    '</span>',
                '</span>',
            '</li>'].join('');;
    };

    Twippera.msg.prototype.update = function(txt) {
        var config = Twippera.config;

        var json = eval(txt);
        // [{"id":,"created_at":,"text":,"user":{"name":,"profile_image_url":,"description":,"location":,"url":,"id":,"protected":,"screen_name":}},.....]
        var cl = null;
        var len = json.length;
        var tmp = [];

        for(var i = 0; i < len; i++) {
            if(this.check(json[i].id)) {
                if(json[i].text.indexOf('@' + config.user) >= 0) {
                    cl = 'tome';
                } else if (json[i].user.screen_name == config.user) {
                    cl = 'myself';
                } else {
                    cl = null;
                }
                tmp.push({
                    id     : json[i].id,
                    img    : json[i].user.profile_image_url,
                    usr    : json[i].user.screen_name,
                    msg    : json[i].text,
                    time   : json[i].created_at,
                    class  : cl,
                    prot   : json[i].user.protected,
                    cached : 0
                });
            }
        }

        var m = 0;
        if((m = this.list.length + tmp.length - config.limit) > 0) {
            this.list.splice(this.list.length - m, m);
        }

        if(this.list.length == 0) {
            this.list = tmp;
        } else {
            this.list = tmp.concat(this.list);
        }
        if(this.issort) {
            this.sort();
        }
    };
    Twippera.msg.prototype.sort = function() {
        var list = this.list;
        var end = list.length - 1;
        for(var i = 0; i < end; i++) {
            for(var j = i + 1; j <= end; j++){
                if(list[i]['id'] < list[j]['id']) {
                    var tmp = list[i];
                    list[i] = list[j];
                    list[j] = tmp
                }
            }
        }
        this.list = list;
    };
    Twippera.msg.prototype.check = function(id) {
        for(var c = true, i = 0, len = this.list.length; i < len; i++) {
            if(this.list[i].id == id) {
                c = false;
                break;
            }
        }
        return c;
    };
    Twippera.msg.prototype.parse = function(m) {
        var config = Twippera.config;
        var list = [];
        var msgs = m || this.list;

        for(var i = 0, len = msgs.length, usr, rep, li = ""; i < len; i++) {
            usr = msgs[i];
            var tmpMsg;
            if(!usr.cached) {
                tmpMsg = Tools.createHTML(usr.msg);
                usr.msg = tmpMsg;
                usr.cached = 1;
            } else {
                tmpMsg = usr.msg;
            }
            var trash = "";
            if(usr.class) {
                if(usr.class.indexOf('myself') > -1) {
                    trash = '<span class="trash" onclick="Twippera.destroy(' + usr.id + ')"></span>';
                }
            }
            var prot = "";
            if(usr['prot']) {
                prot = '<span class="protected"></span>'
            }
            rep = {
                id: usr.id,
                usr: usr.usr,
                cl: (i % 2 != 0) ? "zebra " + (usr.class || "") : (usr.class || ""),
                img: usr.img,
                msg: tmpMsg,
                time: Tools.createTime(usr.time, config.locale),
                trash: trash,
                prot: prot,
                star: Twippera.favorite.isFavorite(usr.id)? 
                    "images/icon_star_full.gif":
                    "images/icon_star_empty.gif"
            };

            li = this.template.replace(/#\{(\w+)\}/g, function($0, $1) {
                return rep[$1];
            });
            list.push(li);
        }
        $('updateList').innerHTML = list.join('');
        Twippera.itemfocus = null
    };

    Twippera.cache = new Twippera.msg;
    Twippera.cache.remove = function(id) {
        var list = this.list;
        var len = list.length
        for(var i = 0; i < len; i++) {
            if(id == list[i]["id"]) {
                list.splice(i, 1);
                break;
            }
        }
    }

    Twippera.replies = new Twippera.msg; 
    Twippera.replies.time = 0;
    Twippera.replies.get = function() {
        var n = new Date();
        if(this.time > 0 && (n - this.time) < 600000) {
            this.parse();
            return;
        }
        this.time = n;

        var self = this;
        var config = Twippera.config;

        Ajax.request(
            "http://twitter.com/statuses/replies.json",
            function(xhr) {
                self.update(xhr.responseText);
                self.parse();
            }, {
                user: config.user,
                pass: config.pass,
                errorHandler: function(url, st, txt) {
                    self.time = 0;
                    log(url, st, txt);
                }
            });
    }
    Twippera.replies.reply = function(user) {
        var status   = $('status');
        var msg = status.value;
            status.value = '@' + user + ' ' + msg;
        setCaretPosition(status, status.value.length);
    };

    Twippera.favorite = new Twippera.msg; 
    Twippera.favorite.favorites = [];
    Twippera.favorite.time = 0;
    Twippera.favorite.get = function(parse) {
        var n = new Date();
        if(this.list.length > 0 && (n - this.time) < 600000) {
            if(parse) this.parse();
            return;
        }
        this.time = n;

        var self = this;
        var config = Twippera.config

        var url = 'http://twitter.com/favorites.json';
        Ajax.request(
            url,
            function(xhr) {
                var res = xhr.responseText;
                var json = eval(res);
                for(var i = 0, len = json.length; i < len; i++) {
                    if(!self.isFavorite(json[i].id)) { 
                        self.favorites.push(json[i].id);
                    }
                }
                if(parse) {
                    self.update(res);
                    self.parse();
                }
            }, {
                user: config.user,
                pass: config.pass,
                asycn: false,
                errorHandler: function(url, st, txt) {
                    self.time = 0;
                    log(url, st, txt);
                }
            }
        );
    };
    Twippera.favorite.isFavorite = function(id) {
        return this.favorites.contains(id);
    };
    Twippera.favorite.toggle = function(elm, id){
        var curImage = elm.style.backgroundImage;
        var self = this;
        var config = Twippera.config;
        var url;
        var c = false;

        elm.style.backgroundImage = "url('images/icon_throbber.gif')";

        if(this.isFavorite(id)) {
            url = 'http://twitter.com/favorites/destroy/' + id;
            c = true;
        } else {
            url = 'http://twitter.com/favorites/create/' + id;
        }
        Ajax.request(
            url + ".json",
            function(xhr) {
                if(c) {
                    self.favorites = self.favorites.del(id);
                    elm.style.backgroundImage = "url('images/icon_star_empty.gif')";
                } else {
                    elm.style.backgroundImage = "url('images/icon_star_full.gif')";
                    self.favorites.push(id);
                }
            }, {
                user: config.user,
                pass: config.pass,
                type: "POST"
            }
        );
    };

    Twippera.update = {
        url : 'http://opera.higeorange.com/misc/twippera/twipperaRelease.txt'
    }
    Twippera.update.check = function() {
        var self = this;
		var config = self.config;

        Ajax.request(
            self.url,
            function(xhr) {
                var t = xhr.responseText.split(':')
                var release = parseInt(t[0]);
                var ver = t[1];
                if(Twippera.release < release) {
                    Twippera.showPopup(
                        config.langs.update + ' : ' + ver,
                        '<a href="http://widgets.opera.com/widget/6522/">' +
                            config.langs.download +
                        '</a>'
                    );
                }
            }, { }
        );
    };

    Twippera.showPopup = function() {
        var self = this;
        var config = self.config;

        var popup = $('popup');
            popup.style.display = 'block';

        var ppmsg = document.evaluate(
            './div/div/div/div/p[@class="msg"]',
            popup,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null).singleNodeValue;
            ppmsg.innerHTML = Array.prototype.join.call(arguments, '<br>');

        var btn = document.evaluate(
            './div/div/div/div/p/button',
            popup,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
            btn.addEventListener(
                'click',
                function(){
                    self.hidePopup();
                },
                false
            );
        var btnInner = document.evaluate(
            './span/span',
            btn,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
            btnInner.innerHTML = config.langs.close;
    };

    Twippera.hidePopup = function() {
        var popup = $('popup');
            popup.style.display = 'none';
    };

window.addEventListener('load', function() {
    preLoadImage([
        'images/loading.gif', 
        'images/icon_throbber.gif',
        'images/icon_star_empty.gif',
        'images/icon_star_full.gif',
        'images/icon_red_lock.gif'
    ]);

    Twippera.config.load();
    Twippera.initEvent()
    Twippera.update.check();
}, false);
