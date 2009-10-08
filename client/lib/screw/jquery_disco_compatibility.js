module("Screw", function(c) { with(c) {
}});

Screw.$ = jQuery;
Screw.jQuery = jQuery;
jQuery.noConflict(true);

Screw.Monarch = window.Monarch;
delete window.Monarch;

Screw.Disco = window.Disco;
delete window.Disco;
