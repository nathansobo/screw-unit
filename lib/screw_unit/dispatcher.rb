module ScrewUnit
  class Dispatcher
    class << self
      def instance(*args)
        @instance ||= new(*args)
      end

      protected :new
    end

    attr_reader :root

    def initialize(screw_unit_core_path, code_under_test_path, specs_path, options = {})
      @root = Resources::Root.new(screw_unit_core_path, code_under_test_path, specs_path, options)
    end

    def call(env)
      request = Rack::Request.new(env)
      next_resource = locate_resource(request.path_info)
      case(request.request_method)
      when "GET":
        puts "screw-unit: received GET request to #{request.path_info}" if ENV['SCREW_UNIT_DEBUG']
        next_resource.get
      when "POST":
        puts "screw-unit: received POST request to #{request.path_info}: '#{request.body.string}'" if ENV['SCREW_UNIT_DEBUG']
        next_resource.post(request)
      else
        raise "unrecognized HTTP method #{request.request_method}"
      end
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
  end
end