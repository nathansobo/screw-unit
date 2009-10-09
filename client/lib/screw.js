//= require <monarch_view>
//= require <jquery.print>
//= require <prefs>

//= require "screw/screw"
//= require "screw/keywords"
//= require "screw/matchers"
//= require "screw/context"
//= require "screw/runnable_methods"
//= require "screw/description"
//= require "screw/example"
//= require "screw/interface"

Screw.$ = jQuery;
Screw.jQuery = jQuery;
Screw.Monarch = window.Monarch;
Screw.Disco = window.Disco;
Screw.Prefs = window.Prefs;

jQuery.noConflict(true);
delete window.$;
delete window.jQuery;
delete window.Monarch;

//delete window.Disco;
delete window.Prefs;
