require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe SpecDir do
      attr_reader :spec_dir

      before do
        dir = ::File.dirname(__FILE__)
        @spec_dir = SpecDir.new("/specs", "#{dir}/file_system_fixtures/specs")
      end

      describe "#locate" do
        describe "when called with the name of a directory" do
          it "returns a SpecDir for that directory" do
            spec_subdir = spec_dir.locate("subsuite")
            spec_subdir.class.should == SpecDir
            spec_subdir.relative_path.should == "/specs/subsuite"
            spec_subdir.absolute_path.should == "#{spec_dir.absolute_path}/subsuite"
          end
        end

        describe "when called with the name of a .js file excluding the extension" do
          it "returns a SpecSuite with the .js file as its only spec_file_resource" do
            spec_suite = spec_dir.locate("foo_spec")
            spec_suite.class.should == SpecSuite
            spec_file_resources = spec_suite.spec_file_resources
            spec_file_resources.length.should == 1
            spec_file_resources.first.relative_path.should == "/specs/foo_spec.js"
            spec_file_resources.first.absolute_path.should == "#{spec_dir.absolute_path}/foo_spec.js"
          end
        end

        describe "when called with the name of a .js file including the extension" do
          it "returns a normal File resource for the File"
        end
      end

      describe "#get" do
        it "returns the results of #get called on a SpecSuite instantiated with all /**/*.js files in the directory" do
          spec_files = spec_dir.glob("/**/*.js")
          spec_files.should_not be_empty
          spec_dir.get.should == SpecSuite.new(spec_files).get
        end
      end
    end
  end
end
