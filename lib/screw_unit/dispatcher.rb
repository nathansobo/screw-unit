module ScrewUnit
  class Dispatcher
    attr_reader :root

    def initialize(configuration)
      @root = Resources::Root.new(configuration)
    end

    def call(env)
      request = Rack::Request.new(env)
      resource = locate_resource(request.path_info)
      case(request.request_method)
      when "GET":
        resource.get
      when "POST":
        resource.post(request)
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
