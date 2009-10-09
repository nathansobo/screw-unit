(function(Screw, Monarch, jQuery) {
  Monarch.constructor("Screw.Interface.StreamingRunner", Monarch.View.Template, {
    constructor_properties: {
      run_specs_on_page_load: function(params) {
        jQuery(function() {
          jQuery('body').html(Screw.Interface.StreamingRunner.to_view(params));
        });
      }
    },

    content: function() { with(this.builder) {
      div(function() {
        div(function() {
          span("Spec Files: ")
          span().ref('completed_files_span');
          span(" / ")
          span().ref('total_files_span');
        });

        div(function() {
          span("Examples In Current File: ")
          span().ref('completed_examples_span');
          span(" / ")
          span().ref('total_examples_span');
        });

        ul(function() {

        }).ref("failures_list");

        div({id: "test_content"});
      });
    }},

    view_properties: {
      initialize: function() {
        this.num_completed_spec_files = 0;
        this.completed_files_span.html("0");
        this.total_files_span.html(this.spec_paths.length);
        this.load_next_spec_path();
      },

      load_next_spec_path: function() {
        if (this.spec_paths.length == 0) return;
        var self = this;
        var path = this.spec_paths.shift();
        jQuery.getScript(path, function() {
          self.run_examples_for_current_spec_file();
        });
      },

      run_examples_for_current_spec_file: function() {
        var self = this;
        var root = Screw.root_description();
        var num_examples = root.total_examples();
        var num_examples_completed = 0;
        self.completed_examples_span.html("0");
        self.total_examples_span.html(num_examples);

        Screw.root_description().on_example_completed(function(example) {
          num_examples_completed++;
          self.completed_examples_span.html(num_examples_completed);
          if (!example.passed) self.handle_failed_example(example);
          if (num_examples_completed == num_examples) self.examples_completed_for_current_spec_file();
        });

        Screw.root_description().enqueue()
      },

      handle_failed_example: function(example) {
        this.failures_list.append_view(function(b) {
          b.li(function() {
            b.div(example.full_name());
            b.pre(example.stack);
          });
        });
      },

      examples_completed_for_current_spec_file: function() {
        Screw.clear_descriptions();
        this.num_completed_spec_files++;
        this.completed_files_span.html(this.num_completed_spec_files);
        this.load_next_spec_path();
      }
    }
  });
})(Screw, Monarch, jQuery);
