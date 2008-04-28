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
          $(this).data('screwunit.run')();
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
    run: function() { $(this).data('screwunit.run')() }
  });

  $('.after').fn({
    run: function() { $(this).data('screwunit.run')() }
  });

  $('.status').text('Running...');
  var to_run = unescape(location.search.slice(1)) || 'body > .describe > .describes > .describe';
  $(to_run)
    .focus()
    .fn('enqueue');
  $(Screw).queue(function() {$(Screw).trigger('after');});
});