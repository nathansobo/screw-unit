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
          span("Total Examples: ");
          span("0").ref('num_completed_examples_span');
        });
        
        div(function() {
          span("Failed Examples: ");
          span("0").ref('num_failed_examples_span');
        });

        div(function() {
          span("Files: ")
          span("0").ref('num_completed_files_span');
          span(" / ");
          span().ref('total_files_span');
        });

        div(function() {
          span("Current File Path: ");
          span().ref('current_file_span');
        })

        div(function() {
          span("Examples In Current File: ")
          span("0").ref('completed_examples_in_current_file_span');
          span(" / ")
          span().ref('total_examples_in_current_file_span');
        });

        ul(function() {

        }).ref("failures_list");

        div({id: "test_content"});
      });
    }},

    view_properties: {
      initialize: function() {
        this.num_completed_examples = 0;
        this.num_failed_examples = 0;
        this.num_completed_files = 0;
        this.total_files_span.html(this.spec_paths.length);

        var self = this;
        Screw.root_description().on_example_completed(function(example) {
          self.num_completed_examples++;
          self.num_completed_examples_span.html(self.num_completed_examples);
          self.num_completed_examples_in_current_file++;
          self.completed_examples_in_current_file_span.html(self.num_completed_examples_in_current_file);
          if (!example.passed) self.handle_failed_example(example);
          if (self.num_completed_examples_in_current_file == self.num_examples_in_current_file) self.examples_completed_for_current_spec_file();
        });

        this.load_next_spec_path();
      },

      load_next_spec_path: function() {
        if (this.spec_paths.length == 0) return;
        var self = this;
        var path = this.spec_paths.shift();
        this.current_file_span.html(path);

        setTimeout(function() {
          var script_tag = document.createElement('script');
          script_tag.type = 'text/javascript';
          script_tag.src = path;
          script_tag.onload = function() {
            self.run_examples_for_current_spec_file()
          };
          jQuery('head')[0].appendChild(script_tag);
        }, 1);
      },

      run_examples_for_current_spec_file: function() {
        this.num_examples_in_current_file = Screw.root_description().total_examples();
        this.num_completed_examples_in_current_file = 0;
        this.completed_examples_in_current_file_span.html("0");
        this.total_examples_in_current_file_span.html(this.num_examples_in_current_file);

        if (this.num_examples_in_current_file > 0) {
          Screw.root_description().run()
        } else {
          this.examples_completed_for_current_spec_file();
        }
      },

      handle_failed_example: function(example) {
        this.num_failed_examples++;
        this.num_failed_examples_span.html(this.num_failed_examples);
        this.failures_list.append_view(function(b) {
          b.li(function() {
            b.div(example.full_name());
            b.div(example.failure_message);
            b.pre(example.stack);
          });
        });
      },

      examples_completed_for_current_spec_file: function() {
        Screw.clear();
        this.num_completed_files++;
        this.num_completed_files_span.html(this.num_completed_files);
        this.load_next_spec_path();
      }
    }
  });
})(Screw, Monarch, jQuery);
