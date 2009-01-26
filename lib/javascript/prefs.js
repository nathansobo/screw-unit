var Prefs = {
  data: {},

  load: function () {
    var the_cookie = document.cookie.split(';');
    if (the_cookie[0]) {
      this.data = JSON.parse(unescape(the_cookie[0]));
    }
    return this.data;
  },

  save: function (expires, path) {
    var d = expires || new Date(2020, 02, 02);
    var p = path || '/';
    document.cookie = escape(JSON.stringify(this.data))
      + ';path=' + p
      + ';expires=' + d.toUTCString();
  }
}

Prefs.load();