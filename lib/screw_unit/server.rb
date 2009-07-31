require "selenium"

module ScrewUnit
  class Server
    attr_reader :thin_thread

    def self.start(options)
      new.start(options)
    end

    def start(options)
      port = options.delete(:port) || 8080
      screw_unit_core_path = options.delete(:screw_unit_core_path)
      code_under_test_path = options.delete(:code_under_test_path)
      specs_path = options.delete(:specs_path)

      start_thin_server_in_new_thread(port, screw_unit_core_path, code_under_test_path, specs_path, options)
      open_suite_with_selenium(port) if options[:selenium]
      thin_thread.join
    end

    def start_thin_server_in_new_thread(port, screw_unit_core_path, code_under_test_path, specs_path, options)
      @thin_thread = Thread.new do
        $thin_server = Thin::Server.new(port) do
          run Dispatcher.instance(screw_unit_core_path, code_under_test_path, specs_path, options)
        end
        $thin_server.start
      end
    end

    def open_suite_with_selenium(port)
      selenium_driver = Selenium::SeleniumDriver.new(
        Configuration.selenium_host,
        Configuration.selenium_port,
        Configuration.selenium_browser_string,
        "#{Configuration.selenium_screw_server_url}:#{Configuration.selenium_screw_server_port}"
      )

      at_exit do
        sleep 1 if ENV['SELENIUM_BROWSER_STRING'] == "*iexplore"
        selenium_driver.stop
      end

      selenium_driver.start
      selenium_driver.open(Configuration.selenium_specs_path)
    end
  end
end
