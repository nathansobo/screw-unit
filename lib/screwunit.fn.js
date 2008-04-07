$(Screw).bind('loaded', function() {    
  $('.status')
    .fn({
      display: function() {
        $(this).text(
          $('.passed').size() + $('.failed').size() + ' test(s), ' + $('.failed').size() + ' failure(s)'
        );
      }
    });
    
  $('.describe')
    .fn({
      parent: function() {
        return $(this).parent('.describes').parent('.describe');
      },
      run_befores: function() {
        $(this).fn('parent').fn('run_befores');
        $(this).children('.befores').find('.before').fn('run');
      },
      run: function() {
        $(this).children('.its').children('.it').fn('run');
        $(this).children('.describes').children('.describe').fn('run');
      },
      selector: function() {
        var parent_selector = $(this).fn('parent').fn('selector');
        return (parent_selector ? parent_selector : 'body')
          + ' > .describes > .describe:eq(' + $(this).parent('.describes').children('.describe').index(this) + ')';
      }
    });
    
  $('.it')
    .fn({
      parent: function() {
        return $(this).parent('.its').parent('.describe');
      },
      run: function() {
        $(this)
          .fn('parent').fn('run_befores')
        try {
          $(this)
            .trigger('running')
            .data('screwunit.run')();
          $(this).trigger('passed');
        } catch(e) {
          $(this).trigger('failed');
          $('<p class="error">')
            .text(e)
            .appendTo(this);
        }
      },
      selector: function() {
        return $(this).fn('parent').fn('selector')
          + ' > .its > .it:eq(' + $(this).parent('.its').children('.it').index(this) + ')';
      }
    });
    
  $('.before')
    .fn({
      run: function() { $(this).data('screwunit.run')() }
    });
    
  var to_run = unescape(location.search.slice(1)) || 'body > .describes > .describe';
  $(to_run)
    .focus()
    .fn('run');
  $('.status').fn('display');
});