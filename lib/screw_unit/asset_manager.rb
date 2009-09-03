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

    attr_reader :locations, :js_locations
    def initialize
      @locations = []
      @js_locations = []
    end

    def add_location(virtual_path, physical_path)
      location = AssetLocation.new(virtual_path, physical_path)
      locations.unshift(location)
      location
    end

    def add_js_location(virtual_path, physical_path)
      location = add_location(virtual_path, physical_path)
      js_locations.unshift(location)
      location
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

    def virtual_dependency_paths(*relative_paths)
      virtual_dependency_paths = []
      relative_paths.each do |relative_path|
        js_file = find_on_js_load_path(relative_path)
        js_file.add_dependencies_to_required_virtual_paths(virtual_dependency_paths)
      end
      virtual_dependency_paths
    end

    def find_on_js_load_path(relative_path)
      js_locations.each do |js_location|
        if physical_path = js_location.relative_find(relative_path)
          return JsFile.new(physical_path, self)
        end
      end
      nil
    end
  end
end
