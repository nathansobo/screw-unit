(function(Screw, Monarch, jQuery) {


Monarch.module("Screw.Require", {
  required_paths: [],
  included_stylesheets: {},
  cache_buster:  parseInt(new Date().getTime()/(1*1000)),
  use_cache_buster: true,

  require: function(javascript_path, onload) {
    console.debug(javascript_path);

    if (Screw.Require.required_paths[javascript_path]) return;
    var full_path = javascript_path + ".js";

    if (Screw.Require.use_cache_buster) {
      full_path += '?' + Screw.Require.cache_buster;
    }

    jQuery.getScript(full_path, function() {
      if (onload) onload();
    });

    Screw.Require.required_paths[javascript_path] = true;
  },


  stylesheet: function(stylesheet_path) {
    if(Screw.Require.included_stylesheets[stylesheet_path]) return;
    var full_path = stylesheet_path + ".css";
    if(Screw.Require.use_cache_buster) {
      full_path += '?' + Screw.Require.cache_buster;
    }
    jQuery('head').append(Screw.Require.tag("link", {rel: 'stylesheet', type: 'text/css', href: full_path}));
    Screw.Require.included_stylesheets[stylesheet_path] = true;
  },

  tag: function(name, attributes) {
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
  }
});

})(Screw, Monarch, jQuery);

window.require = Screw.Require.require;
window.stylesheet = Screw.Require.stylesheet;
