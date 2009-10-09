(function(Screw, Monarch) {

Monarch.constructor("Screw.Interface.Description", Monarch.View.Template, {
  content: function(initial_attributes) { with (this.builder) {
    var description = initial_attributes.description;
    li({'class': 'description'}, function() {
      span({'class': 'name'}, description.name).click(function(view) {
        view.focus();
      });

      if (description.examples.length > 0) {
        ul({'class': 'examples'});
      }

      if (description.child_descriptions.length > 0) {
        ul({'class': 'child_descriptions'});
      }
    });
  }},

  view_properties: {
    initialize: function() {
      this.build_examples();
      this.build_child_descriptions();
      
      var self = this;
      this.description.on_example_completed(function(example) {
        if (example.failed) {
          self.addClass('failed')
        } else {
          self.addClass('passed');
        }
      })
    },

    build_examples: function() {
      var self = this;
      var examples_container = this.find("ul.examples").eq(0);
      Screw.each(this.description.examples, function() {
        var subview = Screw.Interface.Example.to_view({example: this});
        self.build_subview(examples_container, subview);
      });
    },

    build_child_descriptions: function() {
      var self = this;
      var child_descriptions_container = this.find("ul.child_descriptions").eq(0);
      Screw.each(this.description.child_descriptions, function() {
        var subview = Screw.Interface.Description.to_view({description: this, build_immediately: self.build_immediately});
        self.build_subview(child_descriptions_container, subview);
      });
    },

    build_subview: function(container, subview) {
      if (this.build_immediately) {
        container.append(subview);
      } else {
        setTimeout(function() { container.append(subview); }, 0);
      }
    },

    focus: function() {
      throw new Error("Not yet implemented");
    }
  }
});

})(Screw, Monarch);
