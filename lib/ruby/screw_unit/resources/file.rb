module ScrewUnit
  module Resources
    class File
      def initialize(relative_path, absolute_path)
        @relative_path, @absolute_path = relative_path, absolute_path
      end
    end
  end
end