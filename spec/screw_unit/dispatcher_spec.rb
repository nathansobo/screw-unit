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
      attr_reader :code_under_test_path, :specs_path
      before do
        @code_under_test_path = "code/under/test/path"
        @specs_path = "specs/path"
        Dispatcher.instance(code_under_test_path, specs_path)
      end

      it "initializes a single instance of the Dispatcher" do
        Dispatcher.instance.should equal(Dispatcher.instance)
      end

      it "assigns #root to a Root resource with the given #code_under_test_path and #specs_path and a calculated #screw_unit_core_path" do
        root = Dispatcher.instance.root
        root.should_not be_nil
        root.code_under_test_path.should == code_under_test_path
        root.specs_path.should == specs_path
        root.screw_unit_core_path.should == Dispatcher.instance.screw_unit_core_path
      end
    end
  end
end
