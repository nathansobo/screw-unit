require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources

    class TestLocator
      attr_reader :call_args

      # BR: Included because mocking a constructor does not work out so well in rr
      def initialize(relative_path, absolute_path)
        @@call_count ||= 0
        @@call_args ||= []

        @@call_count += 1
        @@call_args << [relative_path, absolute_path]
      end

      def self.call_count
        @@call_count
      end

      def self.call_args
        @@call_args
      end

      def locate(name)
      end
    end

    class CustomLocator1 < TestLocator; end
    class CustomLocator2 < TestLocator; end

    class TestResource
      def get; end
    end

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

        context "when there are custom resource locators" do
          attr_reader :resource_string, :expected_relative_path, :expected_absolute_path
          before do
            @resource_string = "foo.js"
            file = dir.locate(resource_string)
            @expected_relative_path = ::File.dirname(file.relative_path)
            @expected_absolute_path = ::File.dirname(file.absolute_path)

            Configuration.instance.register_custom_resource_locator(TestLocator)
            Configuration.instance.register_custom_resource_locator(TestLocator)
            Configuration.instance.custom_resource_locators.size.should == 2
          end

          after do
            Configuration.instance.instance_eval do
              @custom_resource_locators = []
            end
          end

          it "constructs each custom resource locator with the relative_path and absolute_path as arguments" do
            dir.locate(resource_string)
            TestLocator.call_args.each do |args|
              args[0].should == expected_relative_path
              args[1].should == expected_absolute_path
            end
            TestLocator.call_count.should == 2
          end

          it "calls locate on each custom resource locator for each directory" do
            mock.instance_of(CustomLocator1).locate(resource_string)
            mock.instance_of(CustomLocator2).locate(resource_string)
            dir.locate(resource_string)
          end
        end

        context "when a custom resource locator returns a resource" do
          attr_reader :resource_string
          before do
            @resource_string
            mock.instance_of(TestLocator).locate(resource_string) { TestResource.new }
          end

          it "returns the resource that was found by the custom resource locator" do
            Configuration.instance.register_custom_resource_locator(TestLocator)
            dir.locate(resource_string).is_a?(TestResource).should be_true
          end
        end

        context "when no custom resource locators return a resource" do
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
