module ScrewUnit
  module Resources
    class FileNotFound
      attr_reader :relative_path

      def initialize(relative_path)
        @relative_path = relative_path
      end
    end
  end
end