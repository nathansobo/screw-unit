Disco.Namespace = function(ns, fn_or_view) {
  if(typeof fn_or_view == 'object') {
    if( ! Disco.Namespace.namespaces[ns]) {
      Disco.Namespace.namespaces[ns] = {};
    }

    for(var key in fn_or_view) {
      Disco.Namespace.namespaces[ns][key] = fn_or_view[key];
    }
  }
  else {
    if( ! Disco.Namespace.namespaces[ns]) {
      throw 'InvalidNamespaceException for ' + ns;
    }

    if( ! fn_or_view) {
      return Disco.Namespace.namespaces[ns];
    }

    if(fn_or_view instanceof Function) {
      return fn_or_view(Disco.Namespace.namespaces[ns]);
    }
  }
};

Disco.Namespace.namespaces = {}
