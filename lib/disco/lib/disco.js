Disco = function() {
  this.doc = [];
};

$.extend(Disco, {
  inherit: function(layout, template) {
    var merged_template = $.extend(true, {}, layout, template);
    
    merged_template.methods = merged_template.methods || {};
    
    merged_template.methods.after_initialize = function() {
      if(layout.methods && layout.methods.after_initialize) {
        layout.methods.after_initialize.call(this);
      }
      if(template.methods && template.methods.after_initialize) {
        template.methods.after_initialize.call(this);
      }
    };
    
    return merged_template;
  },
  
  build: function(fn_or_template, initial_attributes) {
    var builder = new this();
    if (fn_or_template instanceof Function) {
      fn_or_template(builder, initial_attributes);
    } else {
      fn_or_template.content(builder, initial_attributes);
    }
    return builder.to_view(fn_or_template, initial_attributes);
  },

  initialize: function() {
    var supported_tags = [
      'a', 'acronym', 'address', 'area', 'b', 'base', 'bdo', 'big', 'blockquote', 'body',
      'br', 'button', 'caption', 'cite', 'code', 'dd', 'del', 'div', 'dl', 'dt', 'em',
      'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'html', 'i',
      'img', 'iframe', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'link', 'map',
      'meta', 'noframes', 'noscript', 'ol', 'optgroup', 'option', 'p', 'param', 'pre',
      'samp', 'script', 'select', 'small', 'span', 'strong', 'style', 'sub', 'sup',
      'table', 'tbody', 'td', 'textarea', 'th', 'thead', 'title', 'tr', 'tt', 'ul', 'var'
    ];

    for(var i=0; i < supported_tags.length; i++) {
      var tag = supported_tags[i];
      this.register_tag(tag);
    }
    var event_types = ["blur", "change", "click", "dblclick", "error", "focus", "keydown",
      "keypress", "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup",
      "resize", "scroll", "select", "submit", "unload"];

    for(var i=0; i < event_types.length; i++) {
      var event_type = event_types[i];
      this.register_event_type(event_type);
    }
  },

  register_tag: function(tag_name) {
    this.prototype[tag_name] = function() {
      return this.tag_with_array_args(tag_name, arguments);
    };
  },

  register_event_type: function(event_type) {
    this.prototype[event_type] = function(fn) {
      this.doc.push(new Disco.PostProcessorInstruction('bind', [event_type, null, fn]));
    };
  }
});

$.extend(Disco.prototype, {
  tag: function() {
    if(arguments.length > 3) {
      throw("XmlBulider#tag does not accept more than three arguments");
    }
    var tag_name, attributes, value;
    tag_name = arguments[0];

    var arg1 = arguments[1];
    if(typeof arg1 == 'object') {
      attributes = arg1;
      var arg2 = arguments[2];
      if(typeof arg2 == 'function' || typeof arg2 == 'string'){
        value = arg2;
      };
    } else if(typeof arg1 == 'function' || typeof arg1 == 'string'){
      value = arg1;
      var arg2 = arguments[2];
      if(typeof arg2 == 'object') {
        attributes = arg2;
      }
    };

    var open_tag = new Disco.OpenTag(tag_name, attributes);
    this.doc.push(open_tag);

    if(typeof value == 'function') {
      value.call(this);
    } else if(typeof value == 'string') {
      this.doc.push(new Disco.Text(value));
    }

    this.doc.push(new Disco.CloseTag(tag_name));

    return this;
  },

  tag_with_array_args: function(tag, args) {
    if(!args) return this.tag(tag);

    var new_arguments = [tag];
    for(var i=0; i < args.length; i++) {
      new_arguments.push(args[i]);
    }
    return this.tag.apply(this, new_arguments);
  },

  rawtext: function(value) {
    this.doc.push(new Disco.Text(value));
  },

  text: function(value) {
    var html = this.escape_html(value);
    this.doc.push(new Disco.Text(html));
  },

  escape_html: function(html) {
    return html.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;")
  },

  subview: function(name, template, initial_attributes) {
    this.doc.push(new Disco.PostProcessorInstruction('open_subview', [name]))
    template.content(this, initial_attributes);
    this.doc.push(new Disco.PostProcessorInstruction('close_view', [template, initial_attributes]))
  },

  keyed_subview: function(name, key, template, initial_attributes) {
    this.doc.push(new Disco.PostProcessorInstruction('open_subview', [name, key]))
    template.content(this, initial_attributes);
    this.doc.push(new Disco.PostProcessorInstruction('close_view', [template, initial_attributes]))
  },

  bind: function() {
    var type = arguments[0];
    if (arguments.length > 2) {
      var data = arguments[1];
      var fn = arguments[2];
    } else {
      var data = null;
      var fn = arguments[1];
    }

    this.doc.push(new Disco.PostProcessorInstruction('bind', [type, data, fn]));
  },

  to_string: function() {
    var output = "";
    for(var i=0; i < this.doc.length; i++) {
      var element = this.doc[i];
      output += element.to_string();
    }
    return output;
  },

  to_view: function(template, initial_attributes) {
    var string = this.to_string();
    if (string == "") return "";
    var post_processor = new Disco.PostProcessor($(string));
    for(var i=0; i < this.doc.length; i++) {
      var element = this.doc[i];
      element.post_process(post_processor);
    }
    post_processor.close_view(template, initial_attributes);
    return post_processor.root_view;
  }
});

Disco.initialize();

Disco.OpenTag = function(tag_name, attributes) {
  this.tag_name = tag_name;
  this.attributes = attributes;
}

$.extend(Disco.OpenTag.prototype, {
  to_string: function() {
    var serialized_attributes = [];
    for(var attributeName in this.attributes) {
      serialized_attributes.push(attributeName + '="' + this.attributes[attributeName] + '"');
    }
    if(serialized_attributes.length > 0) {
      return "<" + this.tag_name + " " + serialized_attributes.join(" ") + ">";
    } else {
      return "<" + this.tag_name + ">";
    }
  },

  post_process: function(processor) {
    processor.push();
  }
});

Disco.CloseTag = function(tag_name) {
  var that = this;
  this.tag_name = tag_name;
}

$.extend(Disco.CloseTag.prototype, {
  to_string: function() {
    return "</" + this.tag_name + ">";
  },

  post_process: function(processor) {
    processor.pop();
  }
});

Disco.Text = function(value) {
  this.value = value;
}

$.extend(Disco.Text.prototype, {
  to_string: function() {
    return this.value;
  },

  post_process: function(processor) {}
});

Disco.PostProcessorInstruction = function(function_name, arguments) {
  this.function_name = function_name;
  this.arguments = arguments;
}

$.extend(Disco.PostProcessorInstruction.prototype, {
  to_string: function() {
    return "";
  },

  post_process: function(processor) {
    processor[this.function_name].apply(processor, this.arguments);
  }
});

Disco.PostProcessor = function(root_view) {
  this.root_view = root_view;
  this.view_stack = [root_view];
  this.selector_stack = [0];
}

$.extend(Disco.PostProcessor.prototype, {
  push: function() {
    this.add_child();
    this.selector_stack.push(0);
  },

  add_child: function() {
    if (!this.selector_stack.length == 0) {
      this.selector_stack[this.selector_stack.length - 1]++;
    }
  },

  pop: function() {
    this.selector_stack.pop();
  },

  open_subview: function(name, key) {
    var view = this.next_element();
    var current_view = this.current_view();
    if (!key) {
      current_view[name] = view;
    } else {
      if (!current_view[name]) {
        current_view[name] = {};
      }
      current_view[name][key] = view;
    }
    view.parent = current_view;
    this.view_stack.push(view);
  },

  close_view: function(template, initial_attributes) {
    var current_view = this.current_view();
    if (template && template.methods) {
      $.extend(current_view, template.methods);
    }
    if (template && template.configuration) {
      current_view.configuration = template.configuration;
    }
    if (initial_attributes) {
      $.extend(current_view, initial_attributes);
    }
    if (current_view.after_initialize) {
      current_view.after_initialize();
    }
    this.view_stack.pop();
  },

  bind: function(type, data, fn) {
    var view = this.current_view();
    this.previous_element().bind(type, data, function(event) {
      fn(event, view);
    });
  },

  next_element: function() {
    return this.find_element(this.next_selector());
  },

  previous_element: function() {
    if(this.selector_stack.length == 1) {
      if (this.root_view.length == 1) {
        return this.root_view;
      } else {
        return this.root_view.eq(this.num_root_children() - 1);
      }
    } else {
      return this.find_element(this.previous_selector());
    }
  },

  find_element: function(selector) {
    if(this.root_view.length == 1) {
      return this.root_view.find(selector);
    } else {
      return this.root_view.eq(this.num_root_children() - 1).find(selector);
    }
  },

  num_root_children: function() {
    return this.selector_stack[0];
  },

  next_selector: function() {
    return this.selector(true)
  },

  previous_selector: function() {
    return this.selector(false)
  },

  selector: function(next) {
    var selectors = [];
    for(var i = 1; i < this.selector_stack.length; i++) {
      if (i == this.selector_stack.length - 1) {
        var index = next ? this.selector_stack[i] + 1 : this.selector_stack[i];
        selectors.push(":nth-child(" + index + ")")
      } else {
        selectors.push(":nth-child(" + this.selector_stack[i] + ")")
      }
    }
    return "> " + selectors.join(" > ");
  },

  current_view: function() {
    return this.view_stack[this.view_stack.length - 1];
  }
});
