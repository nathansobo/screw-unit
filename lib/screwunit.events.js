$(Screw).bind('loaded', function() {    
  $('.describe, .it')
    .click(function() {
      document.location = location.href.split('?')[0] + '?' + $(this).fn('selector');
      return false;
    })
    .focus(function() {
      $('html, body').animate({'scrollTop': $(this).offset().top}, 1000);
      $(this).addClass('focused');
      return $(this);
    })
    .bind('running', function() {
      $(this).addClass('running');
    })
    .bind('passed', function() {
      $(this).addClass('passed');
    })
    .bind('failed', function() {
      $(this).addClass('failed');
    })
});