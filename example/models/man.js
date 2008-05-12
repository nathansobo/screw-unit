function Man(options) {
  var luck = options.luck;
  
  this.decrement_luck = function(delta) {
    luck = Math.max(0, luck - delta);
  };
  this.luck = function() {
    return luck;
  };
  this.render = function() {
    return $('<ul class="man">')
      .append('<li class="hair">')
      .click(function() {
        $(this).children('.hair').remove();
      });
  };
}