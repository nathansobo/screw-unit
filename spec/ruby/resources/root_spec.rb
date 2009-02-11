require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe Root do
      attr_reader :root
      before do
        dir = ::File.dirname(__FILE__)
        screw_unit_core_path = "#{dir}/../../../lib/javascript"
        specs_path = "#{dir}/file_system_fixtures/specs"
        code_under_test_path = "#{dir}/file_system_fixtures/code_under_test"
        @root = Root.instance(screw_unit_core_path, code_under_test_path, specs_path)
      end

      describe "#locate" do
        context "when called with 'screw_unit_core'" do
          it "returns a Dir resource with relative path of '/screw_unit_core' and absolute path of the #screw_unit_core_path" do
            core_dir = root.locate('screw_unit_core')
            core_dir.class.should == Resources::Dir
            core_dir.absolute_path.should == root.screw_unit_core_path
            core_dir.relative_path.should == "/screw_unit_core"
          end
        end

        context "when called with 'specs'" do
          it "returns a SpecDir resource with relative path of '/specs' and absolute path of the #spec_path" do
            specs_dir = root.locate('specs')
            specs_dir.class.should == Resources::SpecDir
            specs_dir.absolute_path.should == root.specs_path
            specs_dir.relative_path.should == "/specs"
          end
        end

        context "when called with a file name within #code_under_test_path" do
          it "returns a File resource for that file" do
            file_resource = root.locate('code_under_test.js')
            file_resource.class.should == Resources::File
            file_resource.absolute_path.should == "#{root.absolute_path}/code_under_test.js"
            file_resource.relative_path.should == "/code_under_test.js"
          end
        end
      end
    end
  end
end
