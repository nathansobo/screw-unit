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
        spec_file_relative_paths.map do |relative_path|
          script_tag(relative_path)
        end.join("\n")
      end

      def spec_file_relative_paths
        spec_file_resources.map do |spec_file_resource|
          spec_file_resource.relative_path
        end
      end

      def spec_file_absolute_paths
        spec_file_resources.map do |spec_file_resource|
          spec_file_resource.absolute_path
        end
      end

      def sprocket_required_relative_paths
        sprocket_required_absolute_paths.map do |path|
          path.gsub(Configuration.specs_path, "/specs").gsub(Configuration.code_under_test_path, "")
        end
      end

      def sprocket_required_absolute_paths
        secretary = Sprockets::Secretary.new(
          :root => Configuration.specs_path,
          :asset_root   => nil,
          :load_path    => sprockets_load_paths,
          :source_files => spec_file_absolute_paths
        )
        absolute_paths = secretary.preprocessor.source_files.map {|f| f.pathname.absolute_location}
        absolute_paths - spec_file_absolute_paths
      end

      def sprockets_load_paths
        [
          Configuration.code_under_test_path,
          Configuration.specs_path,
          "#{Configuration.code_under_test_path}/**/*",
          "#{Configuration.specs_path}/**/*"
        ]
      end

      def script_tag(path)
        %{<script type="text/javascript" src="#{path}"></script>}
      end

      def core_file_paths
        [
          "/screw_unit_core/json.js",
          "/screw_unit_core/prefs.js",
          "/screw_unit_core/jquery-1.2.6.js",
          "/screw_unit_core/jquery.print.js",
          "/screw_unit_core/foundation.js",
          "/screw_unit_core/screw/jquery_mapper.js",  
          "/screw_unit_core/screw/require.js",
          "/screw_unit_core/screw/matchers.js",
          "/screw_unit_core/screw.js",
          "/screw_unit_core/screw/keywords.js",
          "/screw_unit_core/screw/context.js",
          "/screw_unit_core/screw/runnable_methods.js",
          "/screw_unit_core/screw/description.js",
          "/screw_unit_core/screw/example.js",
          "/screw_unit_core/screw/subscription_node.js",
          "/screw_unit_core/disco.js",
          "/screw_unit_core/screw/interface.js",
          "/screw_unit_core/screw/interface/runner.js",
          "/screw_unit_core/screw/interface/progress_bar.js",
          "/screw_unit_core/screw/interface/description.js",
          "/screw_unit_core/screw/interface/example.js",
        ]
      end

    end
  end
end