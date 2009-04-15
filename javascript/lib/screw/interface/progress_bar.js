module("Screw", function(c) { with(c) {
  module("Interface", function() {
    def('ProgressBar', {
      content: function(b, initial_attributes) { with(b) {
        div({'id': 'screw_unit_progress_bar'}, function() {
          div({'id': 'screw_unit_progress'});
          div({'id': 'screw_unit_progress_text'});
        });
      }},

      methods: {
        after_initialize: function() {
          var self = this;
          this.total_examples = 0;
          Screw.each(this.examples_to_run, function() {
            self.total_examples += this.total_examples();
            this.on_example_completed(function(example) {
              self.update_progress(example);
            });
          });


          this.completed_examples = 0;
          this.failed_examples = 0;

          this.progress_div = this.find('div#screw_unit_progress');
          this.progress_text_div = this.find('div#screw_unit_progress_text');

          this.resize_progress_div();
          this.refresh_progress_text();
        },

        update_progress: function(example) {
          this.completed_examples++;
          if (example.failed) {
            this.failed_examples++;
            this.addClass('failed');
          }

          this.resize_progress_div();
          this.refresh_progress_text();
        },

        resize_progress_div: function() {
          var percent_complete = (this.total_examples == 0) ? 0 : (this.completed_examples / this.total_examples * 100);
          this.progress_div.css("width", percent_complete + "%");
        },

        refresh_progress_text: function() {
          this.progress_text_div.html(this.completed_examples + " of " + this.total_examples + " completed. " + this.failed_examples + " failed.");
        }
      }
    });
  });
}});
