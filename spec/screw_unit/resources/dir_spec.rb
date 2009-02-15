require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe Dir do
      attr_reader :dir
      before do
        spec_file_dir = ::File.dirname(__FILE__)
        @dir = Dir.new(relative_path, "#{spec_file_dir}/file_system_fixtures")
      end

      def relative_path
        "/bar"
      end

      describe "#locate" do
        context "when the string names a file in the directory" do
          it "returns a File resource with the appropriate absolute and relative paths" do
            file = dir.locate("foo.js")
            file.class.should == Resources::File
            file.relative_path.should == "/bar/foo.js"
            file.absolute_path.should == "#{dir.absolute_path}/foo.js"
          end

          context "when the Dir's #relative_path is '/'" do
            def relative_path
              '/'
            end

            it "starts the File resource's relative path with only a single /" do
              dir.locate("foo.js").relative_path.should == "/foo.js"
            end
          end
        end

        context "when the string names a subdirectory in the directory" do
          it "returns a Dir resource with the appropriate absolute and relative paths" do
            subdir = dir.locate("specs")
            subdir.class.should == Resources::Dir
            subdir.relative_path.should == "/bar/specs"
            subdir.absolute_path.should == "#{dir.absolute_path}/specs"
          end
        end

        context "when the string names a file that doesn't exist" do
          it "returns a FileNotFound resource with the relative path" do
            not_found = dir.locate("bogus")
            not_found.class.should == FileNotFound
            not_found.relative_path.should == "#{dir.relative_path}/bogus"
          end
        end
      end

      describe "#glob" do
        it "returns File resources with the correct relative and absolute paths for all files matching the pattern" do
          glob_pattern = "/**/*.js"
          globbed_file_resources = dir.glob(glob_pattern)

          ::Dir.glob(dir.absolute_path + glob_pattern).each do |expected_absolute_path|
            expected_relative_path = expected_absolute_path.gsub(dir.absolute_path, dir.relative_path)
            globbed_file_resources.select do |resource|
              resource.relative_path == expected_relative_path && resource.absolute_path == expected_absolute_path
            end.length.should == 1
          end
        end
      end
    end
  end
end
