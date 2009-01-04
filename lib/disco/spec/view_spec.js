Screw.Unit(function() {
  describe("Disco", function() {
    var builder;
    before(function() {
      $('#screw_unit_content').html("");
      builder = new Disco();
    });

    describe("#tag", function() {
      it("returns the builder", function() {
        expect(builder.tag("div")).to(equal, builder);
      });
      
      it("with no arguments, generates an open and close tag", function() {
        builder.tag("div");
        expect(builder.to_string()).to(equal, "<div></div>");
      });

      it("with no attributes, generates an open and close tag with those attributes", function() {
        builder.tag("div", {'class': "foo"});
        expect(builder.to_string()).to(equal, '<div class="foo"></div>');
      });

      it("with a functional argument, wraps the tag around whatever the functional argument builds", function() {
        builder.tag("div", function() {
          builder.tag("span");
        });
        expect(builder.to_string()).to(equal, '<div><span></span></div>');
      });

      it("with attributes and a functional argument, wraps the tag with the given attributes around whatever the functional argument builds", function() {
        builder.tag("div", {'class': "bar"}, function() {
          builder.tag("span");
        });
        expect(builder.to_string()).to(match, '<div class="bar"><span></span></div>');
      });

      it("with a textual argument, wraps the tag around the text", function() {
        builder.tag("div", "some text");
        expect(builder.to_string()).to(match, '<div>some text</div>');
      });

      it("with attributes and a textual argument, wraps the tag with the given attributes around the text", function() {
        builder.tag("div", "some text", {'class': "baz"});
        expect(builder.to_string()).to(match, '<div class="baz">some text</div>');
      });
    });

    describe("#text", function() {
      it("renders the HTML-escaped version of the given text", function() {
        builder.tag('span', function() {
          builder.text("Me & You");
        })
        expect(builder.to_string()).to(match, '<span>Me &amp; You</span>');
      });
    });

    describe("#rawtext", function() {
      it("renders the given text unescaped", function() {
        builder.tag('span', function() {
          builder.rawtext("Me & You");
        })
        expect(builder.to_string()).to(match, '<span>Me & You</span>');
      });
    });

    describe("#to_view", function() {
      it("returns a jQuery wrapped version of the generated XML", function() {
        with(builder) {
          div({'class': "foo"}, function() {
            span({'class': "bar"});
          });
        }

        var view = builder.to_view();
        expect(view).to(match_selector, 'div.foo');
        expect(view).to(contain_selector, 'span.bar');
      });
    });

    describe(".inherit", function() {
      var layout, template, merged_template, after_initialize_calls;
      
      before(function() {
        after_initialize_calls = [];
        layout = {
          content: function(builder, initial_attributes) {
            with(builder) {
              this.header(builder);
              this.wrapped_content(builder);
            }
          },
          header: function(builder) {
            builder.h1("Hello " + this.name);
          },
          name: function() {
            return 'world';
          },
          methods: {
            after_initialize: function() {
              after_initialize_calls.push([this, 'layout']);
            },
            method_one: function() {}
          },
          configuration: {
            config_one: 'i am the first configuration'
          }
        };
        template = {
          wrapped_content: function(builder, initial_attributes) {
          },
          name: function() {
            return 'mars';
          },
          methods: {
            after_initialize: function() {
              after_initialize_calls.push([this, 'template']);
            },
            method_two: function() {}
          },
          configuration: {
            config_two: 'second configuration'
          }
        };
        merged_template = Disco.inherit(layout, template);
      });
      
      describe("when passed a layout and an inheriting template", function() {
        it("extends the inheriting template with the top level methods of the layout", function() {
          expect(merged_template.content).to(equal, layout.content);
          expect(merged_template.header).to(equal, layout.header);
        });
        
        it("overrides methods in the layout with methods in the template that share the same name", function() {
          expect(merged_template.name()).to_not(equal, layout.name());
          expect(merged_template.name()).to(equal, template.name());
        });
        
        it("combines the methods hashes of the layout and the inheriting template, giving priority to the inheriting template", function() {
          expect(merged_template.methods.method_one).to(equal, layout.methods.method_one);
          expect(merged_template.methods.method_two).to(equal, template.methods.method_two);
        });
        
        it("combines the configuration hashes of the layout and the inheriting template, giving priority to the inheriting template", function() {
          expect(merged_template.configuration.config_one).to(equal, layout.configuration.config_one);
          expect(merged_template.configuration.config_two).to(equal, template.configuration.config_two);
        });
        
        it("combines the after_initialize methods of the layout and inheriting template, executing the layout's method first", function() {
          expect(merged_template.methods.after_initialize).to_not(equal, undefined);
          var view = Disco.build(merged_template);
          expect(after_initialize_calls).to(equal, [[view, 'layout'], [view, 'template']]);
        });
        
        var it_does_not_raise_for_undefined = function(missing_definition) {
          describe("when " + missing_definition + " is undefined", function() {
            before(function() {
              missing_definition = eval(missing_definition);
              delete missing_definition;
              merged_template = Disco.inherit(layout, template);
            });

            it("does not raise an exception", function() {
              expect(raises_exception(function() { Disco.build(merged_template); })).to(equal, false);
            });
          });
        };
        
        it_does_not_raise_for_undefined('layout.methods');
        it_does_not_raise_for_undefined('layout.methods.after_initialize');
        it_does_not_raise_for_undefined('template.methods');
        it_does_not_raise_for_undefined('template.methods.after_initialize');
      });
      
      describe("when applied to a subview", function() {
        var view, form_builder, parent_builder, child_builder;
        
        before(function() {
          form_builder = {
            form_for: function(fn) {
              return this.tag_with_array_args('form', [{action: '/foo'}, fn]);
            },
            
            input_for: function(attribute) {
              return this.tag_with_array_args('input', [{name: attribute, value: ''}]);
            }
          };
          
          form_layout = {
            content: function(builder) {
              var self = this;
              var extended_builder = $.extend(true, {}, builder, form_builder);
              
              with(extended_builder) {
                form_for(function() {
                  self.form_content(extended_builder);
                });
              }
            }
          };
          
          page_template = {
            content: function(builder) {
              parent_builder = builder;
              with(builder) {
                div(function() {
                  subview('form', form_template);
                });
              }
            }
          };
          
          child_template = {
            form_content: function(builder) {
              child_builder = builder;
              with(builder) {
                input_for('name');
              }
            }
          };
          
          form_template = Disco.inherit(form_layout, child_template);
          view = Disco.build(page_template);
        });
      
        describe("the builder for parent view", function() {
          it("does not inherit the layout", function() {
            expect(parent_builder.input_for).to(equal, undefined);
          });
        });
        
        describe("the builder for child view", function() {
          it("inherits the layout", function() {
            expect(child_builder.input_for).to(equal, form_builder.input_for);
          });
        });
      });
    });

    describe(".build", function() {
      describe('when passed a function', function() {
        it("calls the function with a builder and returns a view", function() {
          var view = Disco.build(function(builder) {
            with(builder) {
              div({'class': "foo"}, function() {
                div({'class': "bar"});
              });
            }
          });

          expect(view).to(match_selector, 'div.foo');
          expect(view).to(contain_selector, 'div.bar');
        });

        it("when the function renders no content to the builder, returns an empty string instead of the view", function() {
          var view = Disco.build(function(builder) { /* noop */ });
          expect(view).to(equal, "");
        });
      });
      
      describe('when passed a function and a hash of instance attributes', function() {
        it('returns a view with the attributes set', function() {
          var content = function(builder) {
            builder.div({'class': "foo"});
          };
          var view = Disco.build(content, { foo: 'bar', baz: 'quux' });
          expect(view.foo).to(equal, 'bar');
          expect(view.baz).to(equal, 'quux');
        });
        
        it('passes the attributes as arguments to the content template', function() {
          var content = function(builder, initial_attributes) {
            builder.div(initial_attributes.foo);
          }
          var view = Disco.build(content, { foo: 'bar' });
          expect(view.html()).to(equal, 'bar');
        });
      });

      describe("when passed a template", function() {
        var view;
        var template = {
          content: function(builder) {
            with(builder) {
              div({'class': "foo"}, function() {
                div({'class': "bar"});
              });
            }
          },

          methods: {
            foo: function() {
              return "bar";
            },

            after_initialize: function() {
              this.after_initialize_called = true;
            }
          },
          
          configuration: {
            config_name: 'config value'
          }
        }

        before(function() {
          view = Disco.build(template);
        });

        it("returns a view wrapping the HTML specified in the template's content method", function() {
          expect(view).to(match_selector, 'div.foo');
          expect(view).to(contain_selector, 'div.bar');
        });

        it("attaches the template's methods to the returned view", function() {
          expect(view.foo()).to(equal, "bar");
        });

        it("attaches the template's configuration hash to the returned view", function() {
          expect(view.configuration).to(equal, template.configuration);
        });

        it("calls after_initialize on the created view if the method exists", function() {
          expect(view.after_initialize_called).to(be_true);
        });
      });
      
      describe("when passed a template and a hash of instance attributes", function() {
        var view, variables, variables_at_time_of_call;
              
        var template = {
          content: function(builder, initial_attributes) {
            builder.div(initial_attributes.foo, {'class': "foo"});
          },
          
          methods: {
            after_initialize: function() {
              variables_at_time_of_call.foo = this.foo;
              variables_at_time_of_call.baz = this.baz;
            }
          }
        }
        
        before(function() {
          variables = {
            foo: 'bar',
            baz: 'quux'
          };
          variables_at_time_of_call = {};
        });
        
        it("assigns the attributes on the view before after_initialize is called", function() {
          var view = Disco.build(template, variables);
          expect(view.foo).to(equal, variables.foo);
          expect(view.baz).to(equal, variables.baz);
          expect(variables_at_time_of_call).to(equal, variables);
        });

        it('passes the attributes as arguments to the content template', function() {
          var view = Disco.build(template, variables);
          expect(view.html()).to(equal, 'bar');
        });
      })
    });

    describe("#subview", function() {
      var view;
      var initialization_order;
      var initial_attributes_of_template_1_during_after_intialize;
      
      var template_1 = {
        content: function(builder) {
          with(builder) {
            div({'class': "bar"}, function() {
              subview('subview', template_2, { subcontent: 'subview content'})
            });
          }
        },

        methods: {
          foo: function() {
            return "bar"
          },

          after_initialize: function() {
            initialization_order.push(this);
            initial_attributes_of_template_1_during_after_intialize['bar'] = this.bar;
            initial_attributes_of_template_1_during_after_intialize['bing'] = this.bing;
          }
        }
      }

      var template_2 = {
        content: function(builder, initial_attributes) {
          builder.span(initial_attributes.subcontent, {'class': "baz"});
        },

        methods: {
          baz: function() {
            return "bop"
          },

          after_initialize: function() {
            initialization_order.push(this);
          }
        }
      }

      describe("within a view that wraps a single element", function() {
        before(function() {
          initialization_order = [];
          initial_attributes_of_template_1_during_after_intialize = {};
          view = Disco.build(function(builder) {
            with(builder) {
              div({'class': "foo"}, function() {
                subview('subview', template_1, { bar: "baz", bing: "bop" });
              });
            }
          });
        });

        it("causes a jQuery wrapped version of the content of the given template to be assigned to the given name on the parent view", function() {
          expect(view.subview).to(match_selector, 'div.foo > div.bar');
          expect(view.subview.length).to(equal, 1);
          expect(view.subview.subview).to(match_selector, 'div.foo > div.bar > span.baz');
          expect(view.subview.subview.length).to(equal, 1);
        });

        it("attaches the methods specified in each subview template to the constructed view object", function() {
          expect(view.subview.foo()).to(equal, "bar");
          expect(view.subview.subview.baz()).to(equal, "bop");
        });

        it("calls after initialize on each view object if it exists, starting with the lowest subview first", function() {
          expect(initialization_order).to(equal, [view.subview.subview, view.subview]);
        });
        
        it('assigns the elements of the initial_attributes hash to the view before after_initialize is called', function() {
          expect(initial_attributes_of_template_1_during_after_intialize.bar).to(equal, 'baz')
          expect(initial_attributes_of_template_1_during_after_intialize.bing).to(equal, 'bop')
          expect(view.subview.bar).to(equal, 'baz');
          expect(view.subview.bing).to(equal, 'bop');
        });

        it('passes the initial_attributes hash to the content template', function() {
          expect(view.subview.subview.html()).to(equal, "subview content");
        });

        it("sets the parent view on the subview", function() {
          expect(view.subview.parent).to(equal, view);
        });
      });

      describe("within a view that wraps multiple elements", function() {
        before(function() {
          initialization_order = [];
          view = Disco.build(function(builder) {
            with(builder) {
              div({'class': "sibling"}, function() {
                div(function() {
                  div(function() {
                    div();
                  });
                })
              });
              div({'class': "foo"}, function() {
                subview('subview', template_1);
              });
            }
          });
        });

        it("causes a jQuery wrapped version of ONLY the content of the given template to be assigned to the given name on the parent view", function() {
          expect(view.subview).to(match_selector, 'div.foo > div.bar');
          expect(view.subview.length).to(equal, 1);
          expect(view.subview.subview).to(match_selector, 'div.foo > div.bar > span.baz');
          expect(view.subview.subview.length).to(equal, 1);
        });
      });
    });

    describe("#keyed_subview", function() {
      var view;
      var initialization_order;
      var initial_attributes_of_template_1_during_after_intialize;

      var template_1 = {
        content: function(builder) {
          builder.div({'class': "bar"});
        },

        methods: {
          foo: function() {
            return "bar"
          },

          after_initialize: function() {
            initialization_order.push(this);
            initial_attributes_of_template_1_during_after_intialize['bar'] = this.bar;
            initial_attributes_of_template_1_during_after_intialize['bing'] = this.bing;
          }
        }
      }

      var template_2 = {
        content: function(builder, initial_attributes) {
          builder.span(initial_attributes.bar, {'class': "baz"});
        },

        methods: {
          baz: function() {
            return "bop"
          },

          after_initialize: function() {
            initialization_order.push(this);
          }
        }
      }

      describe("within a view that wraps a single element", function() {
        before(function() {
          initialization_order = [];
          initial_attributes_of_template_1_during_after_intialize = {};
          view = Disco.build(function(builder) {
            with(builder) {
              div({'class': "foo"}, function() {
                keyed_subview('subviews', 1, template_1, { bar: "baz", bing: "bop" });
                keyed_subview('subviews', 2, template_2, { bar: "boof" });
              });
            }
          });
        });

        it("registers the provided subview at the given key", function() {
          expect(view.subviews).to_not(equal, undefined);
          expect(view.subviews[1].bar).to(equal, "baz");
          expect(view.subviews[2].bar).to(equal, "boof");
        });

        it('passes the initial_attributes hash to the content template', function() {
          expect(view.subviews[2].html()).to(equal, "boof");
        });
      });
    });

    describe("#bind", function() {
      it("causes a jQuery #bind on the preceding element of a closure which calls the given function with the current view object", function() {
        var callback_data;
        var callback_view;

        var data = {foo: "bar"};

        var subview_template = {
          content: function(builder) {
            builder.div({'class': "bar"}).bind('click', data, function(event, view) {
              callback_data = event.data;
              callback_view = view;
            });
          }
        }

        with(builder) {
          div({'class': "foo"}, function() {
            subview('subview', subview_template);
          });
        }

        var view = builder.to_view();

        view.find("div.bar").trigger('click');
        expect(callback_data).to(equal, data);
        expect(callback_view).to(equal, view.subview);
      });

      it("works when no data is provided", function() {
        var callback_view;
        with(builder) {
          div({'class': "foo"}, function() {
            div({'class': "bar"}).bind("click", function(event, view) {
              callback_view = view;
            })
          })
        }

        var view = builder.to_view();
        view.find('div.bar').trigger('click');
        expect(callback_view).to(equal, view);
      });

      it("works on the root_view", function() {
        var callback_view;
        builder.div({'class': "foo"}).bind("click", function(event, view) {
          callback_view = view;
        });

        var view = builder.to_view();
        view.trigger('click');
        expect(callback_view).to(equal, view);
      });

      it("works on the first of several root-level elements, applying ONLY to element", function() {
        var times_called = 0;
        with(builder) {
          div({'class': "foo"}).bind("click", function(event, view) {
            times_called++;
          });
          div({'class': "bar"});
          div({'class': "baz"});
        }

        var view = builder.to_view();
        view.eq(0).trigger('click');
        view.eq(1).trigger('click');
        view.eq(2).trigger('click');
        expect(times_called).to(equal, 1);
      });
    });

    describe("all event handlers supported in jQuery 1.2.3", function() {

      it("have a corresponding method on the builder that inserts a bind metatag for that event type", function() {
        var event_types = ["blur", "change", "click", "dblclick", "error", "focus", "keydown",
          "keypress", "keyup", "load", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup",
          "resize", "scroll", "select", "submit", "unload"]

        for (var i = 0; i < event_types.length; i++) {
          var event_type = event_types[i];
          var view_argument;

          with(builder) {
            div({'class': "foo"}, function() {
              div({'class': "bar"})[event_type](function(event, view) {
                view_argument = view;
              })
            });
          }

          var view = builder.to_view();
          view.find('div.bar').trigger(event_type);
          expect(view_argument).to(equal, view);
        }
      });
    });
  });
});