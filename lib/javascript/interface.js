module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('Runner', {
      content: function(b) { with (b) {
        ul({'class': 'descriptions'}, function() {
          Screw.each(Screw.global_description().child_descriptions, function() {
            keyed_subview('descriptions', this.name, Screw.Interface.Description, {description: this});
          });
        });
      }},

      methods: {
        after_initialize: function() {
          Screw.global_description().run();
        }
      }
    });

    def('Description', {
      content: function(b, initial_attributes) { with (b) {
        var description = initial_attributes.description;
        li({'class': 'description'}, function() {
          span({'class': 'name'}, description.name);

          if (description.examples.length > 0) {
            ul({'class': 'examples'}, function() {
              Screw.each(description.examples, function() {
                keyed_subview('examples', this.name, Screw.Interface.Example, {example: this});
              })
            });
          }
          if (description.child_descriptions.length > 0) {
            ul({'class': 'child_descriptions'}, function() {
              Screw.each(description.child_descriptions, function() {
                keyed_subview('child_descriptions', this.name, Screw.Interface.Description, {description: this});
              })
            });
          }
        });
      }}
    });

    def('Example', {
      content: function(b, initial_attributes) { with(b) {
        li({'class': 'example'}, function() {
          span(initial_attributes.example.name, {'class': 'name'}); 
        });
      }},

      methods: {
        after_initialize: function() {
          var self = this;
          this.example.on_pass(function() {
            self.addClass("passed");
          })
          this.example.on_fail(function(e) {
            self.addClass("failed");
            self.append("<div>" + e.message + "</div>");
            console.debug(e);
          })
        }
      }
    });
  });
}});

$(function() {
  console.debug(Screw.global_description());
  $('body').html(Disco.build(Screw.Interface.Runner));
});