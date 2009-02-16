module ScrewUnit
  module Resources
    class FileNotFound
      attr_reader :relative_path

      def initialize(relative_path)
        @relative_path = relative_path
      end

      def locate(name)
        self
      end
      
      def get
        puts "Couldn't find #{relative_path}"
        [404, {}, "No file found at relative path '#{relative_path}'"]
      end

      def error
        raise 
      end
    end
  end
end