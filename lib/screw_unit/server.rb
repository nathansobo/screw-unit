module ScrewUnit
  class Server
    def self.start(options)
      new.start(options)
    end

    def start(options)
      port = options.delete(:port) || 8080
      screw_unit_core_path = options.delete(:screw_unit_core_path)
      code_under_test_path = options.delete(:code_under_test_path)
      specs_path = options.delete(:specs_path)

      $thin_server = Thin::Server.new(port) do
        run Dispatcher.instance(screw_unit_core_path, code_under_test_path, specs_path, options)
      end
      $thin_server.start
    end
  end
end