(function(window) {
  window.Screw.Assets = {};
  var required_paths = [];
  var included_stylesheets = {};
  Screw.Assets.use_cache_buster = false; // TODO: NS/CTI - make this configurable from the UI.
  var cache_buster = parseInt(new Date().getTime()/(1*1000));
  
  window.require = function(path_from_javascripts, onload) {
    if(!required_paths[path_from_javascripts]) {
      var full_path = path_from_javascripts + ".js";
      if (Screw.Assets.use_cache_buster) {
        full_path += '?' + cache_buster;
      }
      document.write("<script src='" + full_path + "' type='text/javascript'></script>");
      if(onload) {
        var scripts = document.getElementsByTagName('script');
        scripts[scripts.length-1].onload = onload;
      }
      required_paths[path_from_javascripts] = true;
    }
  };

  window.stylesheet = function(path_from_stylesheets) {
    if(!included_stylesheets[path_from_stylesheets]) {
      var full_path = path_from_stylesheets + ".css";
      if(Screw.Assets.use_cache_buster) {
        full_path += '?' + cache_buster;
      }
      document.write("<link rel='stylesheet' type='text/css' href='" + full_path + "' />");
      included_stylesheets[path_from_stylesheets] = true;
    }
  };
})(window);
