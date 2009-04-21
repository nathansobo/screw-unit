require "selenium"

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

      open_suite_with_selenium(port) if options[:selenium]

      $thin_server = Thin::Server.new(port) do
        run Dispatcher.instance(screw_unit_core_path, code_under_test_path, specs_path, options)
      end
      $thin_server.start
    end

    def open_suite_with_selenium(port)
      selenium_driver = Selenium::SeleniumDriver.new("localhost", 4444, "*firefox", "http://localhost:#{port}/")

      Thread.new do
        sleep 1
        selenium_driver.start
        selenium_driver.open("/specs")
      end

      at_exit do
        selenium_driver.stop
      end
    end
  end
end
