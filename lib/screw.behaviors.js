$(Screw).bind('load', function() {
  $('.status').fn({
    display: function() {
      $(this).text(
        $('.passed').length + $('.failed').length + ' test(s), ' + $('.failed').length + ' failure(s)'
      );
    }
  });

  $('.describe').fn({
    parent: function() {
      return $(this).parent('.describes').parent('.describe');
    },
    run_befores: function() {
      $(this).fn('parent').fn('run_befores');
      $(this).children('.befores').find('.before').fn('run');
    },
    enqueue: function() {
      $(this).children('.its').children('.it').fn('enqueue');
      $(this).children('.describes').children('.describe').fn('enqueue');
    },
    selector: function() {
      var parent_selector = $(this).fn('parent').fn('selector');
      return (parent_selector ? parent_selector : 'body')
        + ' > .describes > .describe:eq(' + $(this).parent('.describes').children('.describe').index(this) + ')';
    }
  });
    
  $('.it').fn({
    parent: function() {
      return $(this).parent('.its').parent('.describe');
    },
    run: function() {
      try {
        // TESTME
        $(this)
          .fn('parent').fn('run_befores');
        $(this).data('screwunit.run')();
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

  $(Screw).trigger('before');
  var to_run = unescape(location.search.slice(1)) || 'body > .describes > .describe';
  $(to_run)
    .focus()
    .fn('enqueue');
  $(Screw).queue(function() { $(Screw).trigger('after') });
});