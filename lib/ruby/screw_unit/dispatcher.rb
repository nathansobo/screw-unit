module ScrewUnit
  class Dispatcher
    def self.instance
      @instance ||= new
    end

    def call(env)
      request = Rack::Request.new(env)
      locate_resource(request.path_info).send(request.request_method.downcase)
    end

    def locate_resource(path)
      path_parts(path).inject(Resources::Root.new) do |resource, child_resource_name|
        resource.locate(child_resource_name)
      end
    end

    def path_parts(path)
      path.split('/').reject { |part| part == "" }
    end
  end
end