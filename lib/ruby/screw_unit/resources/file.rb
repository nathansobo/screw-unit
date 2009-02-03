module ScrewUnit
  module Resources
    MIME_TYPES = {
      ".css" => "text/css",
      ".gif" => "image/gif",
      ".js" => "text/javascript",
      ".jpg" => "image/jpeg",
      ".jpeg" => "image/jpeg",
      ".png" => "image/png",
    }

    class File
      attr_reader :relative_path, :absolute_path
      def initialize(relative_path, absolute_path)
        @relative_path, @absolute_path = relative_path, absolute_path
      end

      def get
        [200, headers, ::File.read(absolute_path)]
      end

      def headers
        {
          "Content-Type" => mime_type(absolute_path),
          "Last-Modified" => ::File.mtime(absolute_path).rfc822          
        }
      end

      protected

      def mime_type(absolute_path)
        MIME_TYPES[::File.extname(absolute_path)]
      end
    end
  end
end