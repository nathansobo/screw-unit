var Screw = {
  Unit: function(specifications) {
    specifications.call(this, Screw.Context.build());
  },

  get_screw_context: function() {
    var screw_context = {};
    for(var slot in Screw.Matchers) {
      screw_context[slot] = matchers[slot];
    }
    for(var slot in Screw.Keywords) {
      screw_context[slot] = specifications[slot];
    }
    return screw_context;
  },



  // I want this object to manufacture objects with a certain prototype.
  // that means I neet to use a constructor
  Context: {
    build: function() {

    },


    Methods: {

    }
  },

  Keywords: {
    describe: function(string, fn) {
      Description.build(string, fn)
    }

  }


};


