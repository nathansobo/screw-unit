var ScrewUnit = {
  root_describes: [],
  current_describes: [],
  describes: []
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
    full_description: function() {
      return (this.parent ? this.parent.full_description() + ' ' : '') + this.description;
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
    return array_equal.call(this, other);
  } else {
    return this == other;
  }
}

var array_equal = function(other) {
  $.each(this, function(i, element) {
    if (element != other[i]) {
      return false;
    }
  });
  return this.length == other.length;
}

function build_describe(describe, b) {
  b.dt(describe.description);
  b.dd(function() {
    b.dl(function() {
      $.each(describe.its, function(i, it) {
        b.dt(it.description);
        b.dd("pending");
      });
      $.each(describe.children, function(i, child) {
        build_describe(child, b);
      });
    });
  });
}
// Runner
$(function() {
  
  var b = new XmlBuilder();
  b.dl(function() {
    $.each(ScrewUnit.root_describes, function(i, describe) {
      build_describe(describe, b);
    });
  });
  $('body').html(b.toString());
  
  Object.prototype.should = function(matcher, expected, not) {
    var matched = matcher.call(this, expected);
    if (not ? !matched : matched) {
      console.debug("Passed");
    } else {
      raise();
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
      } catch(e) {
        $.each(e, function(key, value) {
          console.debug(key);
          console.debug(value);
        })
      }
    });
  });
  
  delete Object.prototype.should;
  delete Object.prototype.should_not;
});