module ScrewUnit
  module Resources
    class SpecSuite
      attr_reader :spec_files

      def initialize(spec_files)
        @spec_files = spec_files
      end

      def get
        spec_files.join("<br>")
      end
    end
  end
end