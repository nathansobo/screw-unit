module ScrewUnit
  module Resources
    class File
      attr_reader :relative_path, :absolute_path
      def initialize(relative_path, absolute_path)
        @relative_path, @absolute_path = relative_path, absolute_path
      end

      def get
        [200, {"Content-Type" => "text/javascript"}, ::File.read(absolute_path)]
      end
    end
  end
end