var ScrewUnit = {
  root_describes: [],
  current_describes: [],
  describes: [],
  it_counter: 0
};

// Specifications
function describe(description, fn) {
  var describe = {
    description: description,
    children: [],
    its: [],
    befores: [],
    parent: $.last(ScrewUnit.current_describes),
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
      b.dt(self.description);
      b.dd(function() {
        b.dl(function() {
          $.each(self.its, function(i, it) {
            b.dt(it.description);
            b.dd("pending", {id: it.dom_id});
          });
          $.each(self.children, function(i, child) {
            child.render(b);
          });
        });
      });
    }
  };
  if (describe.parent) {
    describe.parent.children.push(describe);
  } else {
    ScrewUnit.root_describes.push(describe);
  }
  
  ScrewUnit.describes.push(describe);
  ScrewUnit.current_describes.push(describe);
  fn();
  ScrewUnit.current_describes.pop();
}

function it(description, fn) {
  fn.description = description;
  fn.dom_id = "it_" + ScrewUnit.it_counter++;
  $.last(ScrewUnit.current_describes).push_it(fn);
}

function before(fn) {
  $.last(ScrewUnit.current_describes).push_before(fn)
}

// Utilities
(function($) {
  $.last = function(arr) {
    return arr[arr.length-1];
  }
})(jQuery);

// Matcher
var equal = function(other) {
  if (this instanceof Array) {
    console.debug(array_equal.call(this, other));
    return array_equal.call(this, other);
  } else {
    return this == other;
  }
}

var array_equal = function(other) {
  for(var i = 0; i < this.length; i++) {
    if (this[i] != other[i]) { return false }
  }
  return this.length == other.length;
}

// Runner
$(function() {
  var b = new XmlBuilder();
  b.dl(function() {
    $.each(ScrewUnit.root_describes, function(i, describe) {
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

  $.each(ScrewUnit.describes, function(i, describe) {
    $.each(describe.its, function(i, it) {
      describe.call_befores();
      try {
        it();
        $('#' + it.dom_id).text("Passed")
      } catch(e) {
        $('#' + it.dom_id).text("Failed")
      }
    });
  });
  
  delete Object.prototype.should;
  delete Object.prototype.should_not;
});