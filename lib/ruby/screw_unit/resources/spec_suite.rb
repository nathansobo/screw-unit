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
        screw_unit_css_file +
        "\n\n" +
        core_file_include_tags +
        "\n\n" +
        spec_file_include_tags
      end

      def screw_unit_css_file
        %{<link rel="stylesheet" type="text/css" href="/screw_unit_core/screw.css"/>}
      end

      def core_file_include_tags
        core_file_paths.map do |core_file_path|
          script_tag(core_file_path)
        end.join("\n")
      end

      def spec_file_include_tags
        spec_file_resources.map do |spec_file_resource|
          script_tag(spec_file_resource.relative_path)
        end.join("\n")
      end

      def script_tag(path)
        %{<script type="text/javascript" src="#{path}"></script>}
      end

      def core_file_paths
        [
          "/screw_unit_core/json.js",
          "/screw_unit_core/prefs.js",
          "/screw_unit_core/jquery-1.2.6.js",
          "/screw_unit_core/foundation.js",
          "/screw_unit_core/matchers.js",
          "/screw_unit_core/core.js",
          "/screw_unit_core/disco.js",
          "/screw_unit_core/jquery.print.js",
          "/screw_unit_core/interface.js",
        ]
      end

    end
  end
end