module("Screw", function(c) { with(c) {
  module("Require", function() {
    var required_paths = [];
    var included_stylesheets = {};
    var cache_buster = parseInt(new Date().getTime()/(1*1000));

    def("use_cache_buster", true);

    def("require", function(javascript_path, onload) {
      if(required_paths[javascript_path]) return;
      var full_path = javascript_path + ".js";

      if (Screw.Require.use_cache_buster) {
        full_path += '?' + cache_buster;
      }
      document.write(tag("script", {src: full_path, type: 'text/javascript'}));
      if (onload) {
        var scripts = document.getElementsByTagName('script');
        scripts[scripts.length-1].onload = onload;
      }
      required_paths[javascript_path] = true;
    });
    window.require = Screw.Require.require;

    def("stylesheet", function(stylesheet_path) {
      if(included_stylesheets[stylesheet_path]) return;
      var full_path = stylesheet_path + ".css";
      if(Screw.Require.use_cache_buster) {
        full_path += '?' + cache_buster;
      }
      document.write(tag("link", {rel: 'stylesheet', type: 'text/css', href: full_path}));
      included_stylesheets[stylesheet_path] = true;
    });
    window.stylesheet = this.stylesheet;

    function tag(name, attributes) {
      var html = "<" + name;
      for(var attribute in attributes) {
        html += (" " + attribute + "='" + attributes[attribute]) + "'";
      };

      if (name == "script") {
        html += "></";
        html += name;
        html += ">";
      } else {
        html += "/>";
      }

      return html;
    };
  });
}});