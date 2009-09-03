var Prefs = {
  data: {},

  load: function () {
    var split_cookies = document.cookie.split(';');
    var prefs_string;
    for(var i = 0; i < split_cookies.length; i++) {
      var screw_unit_cookie_prefix = /^ *screw_unit_prefs=/;
      if (split_cookies[i].match(screw_unit_cookie_prefix)) {
        prefs_string = split_cookies[i].replace(/^ *screw_unit_prefs=/, "");
      }
    }

    if (prefs_string) {
      this.data = JSON.parse(unescape(prefs_string));
    }
    return this.data;
  },

  save: function (path, expires) {
    if (!this.data) return;

    var p = path || '/';
    var d = expires || new Date(2020, 02, 02);
    var cookie_string = "screw_unit_prefs=" + escape(JSON.stringify(this.data)) + ';path=' + p + ';expires=' + d.toUTCString()
    document.cookie = cookie_string;
  }
}

Prefs.load();