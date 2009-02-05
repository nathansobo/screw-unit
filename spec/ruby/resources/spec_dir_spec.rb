require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe SpecDir do
      attr_reader :spec_dir

      before do
        dir = ::File.dirname(__FILE__)
        @spec_dir = SpecDir.new("/specs", "#{dir}/file_system_fixtures/specs")
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
