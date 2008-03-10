var Screw = {
  Unit: function(fn) {
    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function("matchers", "specifications",
      "with (specifications) { with (matchers) { " +
        contents +
      " } }"
    )
    
    $(function() {
      Object.prototype.should = function(matcher, expected, not) {
        var matched = matcher.call(this, expected);
        if (not ? matched : !matched) {
          throw("Failed")
        }
      }
      Object.prototype.should_not = function(matcher, expected) {
        this.should(matcher, expected, true);
      };
      
      var describes = $('<ul class="describes"></ul>').fn({
        call_befores: function() {}
      });
      $('body').append(describes);
      Screw.Specifications.context.push($('body'));
      fn.call(this, Screw.Matchers, Screw.Specifications)
      $('body').find('.describe').fn('call');
      
      delete Object.prototype.should;
      delete Object.prototype.should_not;
    });
  },
  Specifications: {
    context: [],
    describe: function(name, fn) {
      var b = new XmlBuilder();
      with (b) {
        li({class: 'describe'}, function() {
          h1(name);
          ol({class: 'befores'});
          ul({class: 'its'});
          ul({class: 'describes'});
        });
      }
      var describe = $(b.toString()).fn({
        call_befores: function() {
          $(this).parent('.describes').parent('.describe').fn('call_befores');
          $(this).children('.befores').find('.before').fn('call');
        },
        call: function() {
          $(this).find('.it').fn('call');
        }
      });
      this.context.push(describe);
      fn.call(describe);
      this.context.pop();
      
      this.context[this.context.length-1]
        .children('.describes')
          .append(describe);
    },
    it: function(name, fn) {
      var it = $('<li class="it">' + name + '</li>').fn({
        call: function() {
          $(this).parent('.its').parent('.describe').fn('call_befores');
          try {
            fn();
            $(this).addClass('passed');
          } catch(e) {
            $(this).addClass('failed');
          }
        }
      });
      this.context[this.context.length-1]
        .children('.its')
          .append(it);
    },
    before: function(fn) {
      var before = $('<li class="before"></li>').fn({
        call: fn
      });
      this.context[this.context.length-1]
        .find('.befores')
          .append(before);
    }
  },
  Matchers: {
    equal: function(other) {
      if (this instanceof Array) {
        return Screw.Matchers.array_equal.call(this, other);
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