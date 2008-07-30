// KeyBinds.js
// Made by Higeorange

var KeyBinds = function(elm, k) {
    this.elm = elm;
    this.keybind = {};
    for(var t in k) {
        this.add(t, k[t]);
    }
};
    KeyBinds.prototype.expand = function(key) {
        var keycode;
        var m = null
        var sp = {
            "Up" : 38,
            "Down" : 40,
            "Right" : 39,
            "Left" : 37
            // need other special keys
        }
        key.replace(/^(([CSA])-)?(\w+)$/, function($0, $1, $2, $3) {
            if($2) m = $2;
            keycode = sp[$3] || $3.toUpperCase().charCodeAt(0);
        });
        return [keycode, m]
    }

    KeyBinds.prototype.add = function(key, func) {
        var e = this.expand(key);
        var keycode = e[0];
        var m = e[1];
        if(!this.keybind[keycode]) {
            this.keybind[keycode] = {};
        }
        if(m) {
            this.keybind[keycode][m] = func;
        } else {
            this.keybind[keycode].func = func;
        }
        return this;
    };
    KeyBinds.prototype.remove = function(key) {
        var e = this.expand(key);
        var keycode = e[0];
        var m = e[1];
        if(this.keybind[keycode]) {
            if(m && this.keybind[keycode][m]) {
                delete this.keybind[keycode][m]
            } else if(this.keybind[keycode].func){
                delete this.keybind[keycode].func
            }
        }
        return this;
    }
    KeyBinds.prototype.load = function(func) {
        var self = this;
        var addEvent = function(elm, type, func, c) {
            if(elm.addEventListener){
                elm.addEventListener(type, func, c);
                return true;
            }
            else if(elm.attachEvent){
                return elm.attachEvent('on' + type, func);
            }
            else{
                elm["on" + type] = func;
            }
        }
        addEvent(this.elm, "keypress", function(e) {
            e = e || window.event
            var c = false;
            var num = e.keyCode || e.charCode;
            var k = self.keybind[num]
            if(k) {
                if(e.ctrlKey) c = k.C
                else if(e.shiftKey) c = k.S
                else if(e.altKey) c = k.A
                else c = k
            }

            if(c) {
                if(e.preventDefault) {
                    e.preventDefault();
                    e.stopPropagation();
                } else {
                    e.returnValue = false;
                    e.cancelBubble = true;
                }
            }
        }, false);
        addEvent(this.elm, 'keydown', function(e) {
            e = e || window.event;
            var num = e.keyCode || e.charCode;
            if(func) func(e)
            var k = self.keybind[num];
            if(k) {
                if(e.ctrlKey) {
                    if(k.C) k.C(e)
                } else if(e.shiftKey){
                    if(k.S) k.S(e)
                } else if(e.altKey) {
                    if(k.A) k.A(e)
                } else {
                    if(k.func) k.func(e);
                }
            }
        }, false);
    }
