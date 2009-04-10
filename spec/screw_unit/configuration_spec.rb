require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit

  describe ".configure" do
    it "instance evals the given block in an instance of Configuration" do
      block = lambda {}
      mock(Configuration.instance.instance_eval(&block))
      ScrewUnit.configure(&block)
    end
  end

  describe Configuration do
    attr_reader :configuration
    before do
      @configuration = Configuration.new
    end

    describe ".instance" do
      it "always returns the same instance of Configuration" do
        instance = Configuration.instance
        instance.class.should == Configuration
        instance.should == Configuration.instance
      end
    end

    describe "#load_screwrc" do
      it "loads .screwrc from the given base_path and assigns #base_path" do
        mock(configuration).load("/base/path/.screwrc")
        configuration.load_screwrc("/base/path")
        configuration.base_path.should == "/base/path"
      end
    end

    describe "path configuration methods" do
      before do
        stub(configuration).base_path { "/base/path" }
      end

      describe "#code_under_test_path" do
        it "assigns the no-argument result of #code_under_test_path to a path that is relative to the base path" do
          configuration.code_under_test_path.should be_nil
          configuration.code_under_test_path("foo").should == "/base/path/foo"
          configuration.code_under_test_path.should == "/base/path/foo"
        end
      end

      describe "#specs_path" do
        it "assigns the no-argument result of #specs_path to a path that is relative to the base path" do
          configuration.specs_path.should be_nil
          configuration.specs_path("foo").should == "/base/path/foo"
          configuration.specs_path.should == "/base/path/foo"
        end
      end

      describe "#screw_unit_core_path" do
        it "returns the javascripts/lib directory in the current implementation" do
          configuration.screw_unit_core_path.should == File.expand_path("#{File.dirname(__FILE__)}/../../javascript/lib")
        end
      end

      describe "#register_custom_resource_locator" do
        before do
          class CustomLocator
            def locate()
            end
          end
        end

        it "registers a locator class" do
          lambda do
            configuration.register_custom_resource_locator(CustomLocator)
          end.should change(configuration.custom_resource_locators, :size).by(1)
        end
      end
    end
  end
end
