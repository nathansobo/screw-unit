require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe SpecSuite do
      attr_reader :dir, :spec_file_resources, :spec_suite

      before do
        @dir = ::File.dirname(__FILE__)
        @spec_file_resources = Dir.new("/specs", "#{dir}/file_system_fixtures/specs").glob("**/*.js")
        @spec_suite = SpecSuite.new(spec_file_resources)
      end

      describe "#get" do
        attr_reader :response_code, :headers, :content
        before do
          @response_code, @headers, @content = spec_suite.get
        end

        it "returns a response code of 200" do
          response_code.should == 200
        end

        it "returns a Content-Type header of 'text/html'" do
          headers['Content-Type'].should == "text/html"
        end

        it "includes the relative paths of all the screw unit core files" do
          Dir.new("/screw_unit_core", "#{dir}/../../../lib/javascript").glob("**/*.js").each do |core_file_resource|
            expected_include_tag = %{<script type="text/javascript" src="#{core_file_resource.relative_path}"></script>}
            content.should match(/#{expected_include_tag}/)
          end
        end

        it "includes the relative paths of all the scripts files with which it was initialized" do
          spec_file_resources.each do |spec_file_resource|
            expected_include_tag = %{<script type="text/javascript" src="#{spec_file_resource.relative_path}"></script>}
            content.should match(/#{expected_include_tag}/)
          end
        end
      end
    end
  end
end
