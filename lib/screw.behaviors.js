$(Screw).bind('loaded', function() {
  $(Screw).trigger('before');
  $('.status').fn({
    display: function() {
      $(this).text(
        $('.passed').length + $('.failed').length + ' test(s), ' + $('.failed').length + ' failure(s)'
      );
    }
  });
  $(Screw).bind('after', function() {
    $('.status').fn('display');
  });

  $('.describe').fn({
    parent: function() {
      return $(this).parent('.describes').parent('.describe');
    },
    run_befores: function() {
      $(this).fn('parent').fn('run_befores');
      $(this).children('.befores').find('.before').fn('run');
    },
    run_afters: function() {
      $(this).fn('parent').fn('run_afters');
      $(this).children('.afters').find('.after').fn('run');
    },
    enqueue: function() {
      $(this).children('.its').children('.it').fn('enqueue');
      $(this).children('.describes').children('.describe').fn('enqueue');
    },
    selector: function() {
      var parent_selector = $(this).fn('parent').fn('selector');
      if(parent_selector) {
        return parent_selector + ' > .describes > .describe:eq(' + $(this).parent('.describes').children('.describe').index(this) + ')';
      } else {
        return 'body > .describe';
      }
    }
  });

  $('.it').fn({
    parent: function() {
      return $(this).parent('.its').parent('.describe');
    },
    run: function() {
      try {
        try {
          $(this)
            .fn('parent').fn('run_befores');

          for(var i=0; i < Screw.its.length; i++) {
            var args = Screw.its[i];
            if(args[0] == this) {
              args[1]();
              break;
            }
          }
        } finally {
          $(this).fn('parent').fn('run_afters');
        }
        $(this).trigger('passed');
      } catch(e) {
        $(this).trigger('failed', [e]);
      }
    },
    enqueue: function() {
      var self = $(this).trigger('enqueued');
      $(Screw)
        .queue(function() {
          self.fn('run');
          setTimeout(function() { $(Screw).dequeue() }, 0);
        });
    },
    selector: function() {
      return $(this).fn('parent').fn('selector')
        + ' > .its > .it:eq(' + $(this).parent('.its').children('.it').index(this) + ')';
    }
  });

  $('.before').fn({
    run: function() {
      for(var i=0; i < Screw.befores.length; i++) {
        var args = Screw.befores[i];
        if(args[0] == this) {
          return args[1]();
        }
      }
    }
  });

  $('.after').fn({
    run: function() {
      for(var i=0; i < Screw.afters.length; i++) {
        var args = Screw.afters[i];
        if(args[0] == this) {
          return args[1]();
        }
      }
    }
  });

  $('.status').text('Running...');
  var to_run = unescape(location.search.slice(1)) || 'body > .describe > .describes > .describe';
  $(to_run)
    .focus()
    .fn('enqueue');
  $(Screw).queue(function() {$(Screw).trigger('after');});
});