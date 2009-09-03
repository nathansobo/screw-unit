module ScrewUnit
  module Resources
    class File
      attr_reader :virtual_path, :asset_manager
      def initialize(virtual_path, asset_manager)
        @virtual_path, @asset_manager = virtual_path, asset_manager
      end

      def physical_path
        asset_manager.physicalize_path(virtual_path)
      end

      def get
        file = Rack::File.new(nil)
        file.path = asset_manager.physicalize_path(virtual_path)
        file.serving
      end
    end
  end
end
