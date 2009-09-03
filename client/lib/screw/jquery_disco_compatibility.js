module("Screw", function(c) { with(c) {
}});

Screw.$ = jQuery.noConflict(true);
delete window.jQuery;
delete window.$;

Screw.Disco = window.Disco;
delete window.Disco;
