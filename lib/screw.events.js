$(Screw).bind('loaded', function() {    
  $('.describe, .it')
    .click(function() {
      document.location = location.href.split('?')[0] + '?' + $(this).fn('selector');
      return false;
    })
    .focus(function() {
      $('body').get(0).scrollTop = $(this).offset().top;
      return $(this).addClass('focused');
    });

  $('.it')
    .bind('enqueued', function() {
      $(this).addClass('enqueued');
    })
    .bind('running', function() {
      $(this).addClass('running');
    })
    .bind('passed', function() {
      $(this).addClass('passed');
    })
    .bind('failed', function(e, reason) {
      $(this).addClass('failed');
      $('<p class="error">')
        .text(reason.toString())
        .appendTo($(this));
    })
});