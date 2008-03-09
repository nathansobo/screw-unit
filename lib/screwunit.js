var Screw = {
  Unit: function(fn) {
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    new Function("matchers", "specifications",
      "with (specifications) { with (matchers) {" +
        contents +
      " } }"
    ).call(this, Screw.matchers, Screw.specifications);
  },
  root_describes: [],
  current_describes: [],
  describes: [],
  it_counter: 0,
  specifications: {
    describe: function(description, fn) {
      var describe = {
        description: description,
        children: [],
        its: [],
        befores: [],
        parent: $.last(Screw.current_describes),
        push_it: function(it) {
          this.its.push(it);
        },
        push_before: function(before) {
          this.befores.push(before);
        },
        call_befores: function() {
          if (this.parent) {
            this.parent.call_befores();
          };
          $.each(this.befores, function(i, before) {
            before();
          })
        },
        render: function(b) {
          var self = this;
          b.dt(self.description, {class: 'description'});
          b.dd({class: 'describe'}, function() {
            b.dl({class: 'its'}, function() {
              b.dt("its")
              b.dd(function() {
                b.ul(function() {
                  $.each(self.its, function(i, it) {
                    b.li(it.description, {id: it.dom_id, class: 'it'});
                  });
                })
              })
              if (self.children.length > 0) {
                b.dt("describes")
                b.dd(function() {
                  b.dl({class: 'describes'}, function() {
                    $.each(self.children, function(i, child) {
                      child.render(b);
                    });              
                  });
                });
              };
            });
          });
        }
      }
      if (describe.parent) {
        describe.parent.children.push(describe);
      } else {
        Screw.root_describes.push(describe);
      }

      Screw.describes.push(describe);
      Screw.current_describes.push(describe);
      fn();
      Screw.current_describes.pop();
    },
    it: function(description, fn) {
      fn.description = description;
      fn.dom_id = "it_" + Screw.it_counter++;
      $.last(Screw.current_describes).push_it(fn);
    },
    before: function(fn) {
      $.last(Screw.current_describes).push_before(fn)
    }
  },
  matchers: {
    equal: function(other) {
      if (this instanceof Array) {
        return Screw.matchers.array_equal.call(this, other);
      } else {
        return this == other;
      }
    },
    array_equal: function(other) {
      for(var i = 0; i < this.length; i++) {
        if (this[i] != other[i]) { return false }
      }
      return this.length == other.length;
    }
  }
};

// Utilities
(function($) {
  $.last = function(arr) {
    return arr[arr.length-1];
  }
})(jQuery);


// Runner
$(function() {
  var b = new XmlBuilder();
  b.dl({class: 'describes'}, function() {
    $.each(Screw.root_describes, function(i, describe) {
      describe.render(b);
    });
  });
  $('body').html(b.toString());
  
  Object.prototype.should = function(matcher, expected, not) {
    var matched = matcher.call(this, expected);
    if (not ? matched : !matched) {
      throw("Failed")
    }
  };

  Object.prototype.should_not = function(matcher, expected) {
    this.should(matcher, expected, true);
  };

  $.each(Screw.describes, function(i, describe) {
    $.each(describe.its, function(i, it) {
      describe.call_befores();
      try {
        it();
        $('#' + it.dom_id).addClass("passed")
      } catch(e) {
        console.debug(e);
        $('#' + it.dom_id).addClass("failed")
      }
    });
  });
  
  delete Object.prototype.should;
  delete Object.prototype.should_not;
});