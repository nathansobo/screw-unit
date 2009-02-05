module ScrewUnit
  module Resources
    class SpecSuite
      attr_reader :spec_file_resources

      def initialize(spec_file_resources)
        @spec_file_resources = spec_file_resources
      end

      def get
        [200, {'Content-Type' => 'text/html'}, content]
      end

      protected
      def content
        spec_file_include_tags
      end

      def spec_file_include_tags
        spec_file_resources.map do |spec_file_resource|
          %{<script type="text/javascript" src="#{spec_file_resource.relative_path}"></script>}
        end.join("\n")
      end
    end
  end
end