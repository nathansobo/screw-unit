class String
  def starts_with?(prefix)
    index(prefix) == 0
  end
end

module ScrewUnit
  class AssetManager
    class << self
      attr_reader :instance
      def instance
        @instance ||= new
      end

      def method_missing(name, *args, &block)
        instance.send(name, *args, &block)
      end
    end

    attr_reader :locations
    def initialize
      @locations = []
    end

    def add_location(virtual_path, physical_path)
      locations.push(AssetLocation.new(virtual_path, physical_path))
    end

    def virtualize_path(physical_path)
      locations.each do |location|
        if virtual_path = location.virtualize_path(physical_path)
          return virtual_path
        end
      end
      nil
    end

    def physicalize_path(virtual_path)
      locations.each do |location|
        if physical_path = location.physicalize_path(virtual_path)
          return physical_path
        end
      end
    end

    def glob_virtual_paths(virtual_glob_pattern)
      matching_locations = locations.select {|l| l.matches_virtual_glob_pattern?(virtual_glob_pattern)}
      matching_locations.map {|l| l.virtual_glob(virtual_glob_pattern)}.flatten
    end
  end
end
