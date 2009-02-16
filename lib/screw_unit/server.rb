module ScrewUnit
  class Server
    def self.start(options)
      new.start(options)
    end

    def start(options)
      port = options.delete(:port) || 8080
      Thin::Server.start(port) do
        run Dispatcher.instance(options[:screw_unit_core_path], options[:code_under_test_path], options[:specs_path])
      end
    end
  end
end