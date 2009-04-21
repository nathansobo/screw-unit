require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe Dispatcher do
    describe ".new" do
      it "is private" do
        lambda do
          Dispatcher.new
        end.should raise_error(NoMethodError)
      end
    end

    describe ".instance" do
      attr_reader :screw_unit_core_path, :code_under_test_path, :specs_path
      before do
        @screw_unit_core_path = "screw/unit/core/path"
        @code_under_test_path = "code/under/test/path"
        @specs_path = "specs/path"
        @options = { :selenium => true, :some_future_option => "some value" }
        Dispatcher.instance(screw_unit_core_path, code_under_test_path, specs_path, options)
      end

      it "initializes a single instance of the Dispatcher" do
        Dispatcher.instance.should equal(Dispatcher.instance)
      end

      it "assigns #root to a Root resource with the given paths" do
        root = Dispatcher.instance.root
        root.should_not be_nil
        root.code_under_test_path.should == code_under_test_path
        root.specs_path.should == specs_path
        root.screw_unit_core_path.should == screw_unit_core_path
        root.options.should == options
      end
    end
  end
end
