Screw.Unit is a Behavior-Driven Testing Framework for Javascript written by Nathan Sobo and Nick Kallen. It features nested describes. Its goals are to provide:

* a DSL for elegant, readable, organized specs;
* an interactive runner which can execute focused specs and describes; 
* and brief, extensible source-code.

# What it is

![Test Runner](http://s3.amazonaws.com/assets.pivotallabs.com/87/original/runner.png)

The testing language is inspired by JSpec (and Rspec, obviously). Consider,

    describe("Matchers", function() {
      it("invokes the provided matcher on a call to expect", function() {
        expect(true).to(equal, true);
        expect(true).to_not(equal, false);
      });
    });

A key feature of Screw.Unit are nested `describes` and the cascading `before` behavior that entails:

    describe("a nested describe", function() {
      var invocations = [];
      
      before(function() {
        invocations.push("before");
      });

      describe("a doubly nested describe", function() {
        before(function() {
          invocations.push('inner before');
        });

        it("runs befores in all ancestors prior to an it", function() {
          expect(invocations).to(equal, ["before", "inner before"]);
        });
      });
    });
    
The Screw.Unit runner is pretty fancy, supporting focused `describes` and focused `its`:

![Focused Runner](http://s3.amazonaws.com/assets.pivotallabs.com/86/original/focused.png)

You can [download the source](http://github.com/nkallen/screw-unit/tree/master) from Github. Please see the included spec (`screwunit_spec.js`) to get up and running.

# Implementation Details

Screw.Unit is implemented using some fancy metaprogramming learned from the formidable Yehuda Katz. This allows the `describe` and `it` functions to not pollute the global namespace. Essentially, we take the source code of your test and wrap it in a with block which provides a new scope:

    var contents = fn.toString().match(/^[^\{]*{((.*\n*)*)}/m)[1];
    var fn = new Function("matchers", "specifications",
      "with (specifications) { with (matchers) { " + contents + " } }"
    );

    fn.call(this, Screw.Matchers, Screw.Specifications);

Furthermore, Screw.Unit is implemented using the **Concrete Javascript** style, which is made possible by the [Effen plugin](http://github.com/nkallen/effen/tree/master) and jQuery. Concrete Javascript is an alternative to MVC. In Concrete Javascript, DOM objects serve as the model and view simultaneously. The DOM is constructed using semantic (and visual) markup, and behaviors are attached directly to DOM elements. For example,

    $('.describe').fn({
      parent: function() {
        return $(this).parent('.describes').parent('.describe');
      },
      run: function() {
        $(this).children('.its').children('.it').fn('run');
        $(this).children('.describes').children('.describe').fn('run');
      },
    });

Here two methods (`#parent` and `#run`) are attached directly to DOM elements that have class `describe`. To invoke one of these methods, simply:

    $('.describe').fn('run');

Bind behaviors by passing a hash (see the previous example). Using CSS3 selectors and cascading to attach behaviors provides interesting kind of multiple inheritance and polymorphism:

    $('.describe, .it').fn({...}); // applies to both describe and its
    $('.describe .describe').fn({...}); // applies to nested describes only

A typical Concrete Javascript Application is divided into 4 aspects:

* a DOM data model,
* CSS bound to DOM elements,
* asynchronous events bound to DOM elements (`click`, `mouseover`), etc.,
* synchronous behaviors bound to DOM elements (`run` and `parent` in the above example).

The Concrete style is particularly well-suited to Screw.Unit; to add the ability to run a focused spec, we simply bind a click event to an `it` or a `describe`, which runs itself:

    $('.describe, .it')
      .click(function() {
        $(this).fn('run');
      })

Anyway, more details about Effen / Concrete Javascript in a later post.

# Extensibility

Screw.Unit is designed from the ground-up to be extensible. For example, to add custom logging, simply subscribe to certain events:

    $('.it')
      .bind('enqueued', function() {...})
      .bind('running', function() {...})
      .bind('passed', function() {...})
      .bind('failed', function(e, reason) {...})

# Thanks to

* Nathan Sobo
* Yehuda Katz