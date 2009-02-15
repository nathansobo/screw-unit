module ScrewUnit
  module Resources
    class FileNotFound
      attr_reader :relative_path

      def initialize(relative_path)
        @relative_path = relative_path
      end

      def get
        raise "No file found at relative path '#{relative_path}'¢"
      end
    end
  end
end