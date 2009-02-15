module ScrewUnit
  class Dispatcher
    class << self
      def instance(*args)
        @instance ||= new(*args)
      end

      protected :new
    end

    attr_reader :root

    def initialize(code_under_test_path, specs_path)
      @root = Resources::Root.new(screw_unit_core_path, code_under_test_path, specs_path)
    end

    def call(env)
      request = Rack::Request.new(env)
      locate_resource(request.path_info).send(request.request_method.downcase)
    rescue Exception => e
      puts e.message
      puts e.backtrace
    end

    def locate_resource(path)
      path_parts(path).inject(root) do |resource, child_resource_name|
        resource.locate(child_resource_name)
      end
    end

    def path_parts(path)
      path.split('/').reject { |part| part == "" }
    end

    def screw_unit_core_path
      "#{File.dirname(__FILE__)}/../../javascript/lib"
    end
  end
end