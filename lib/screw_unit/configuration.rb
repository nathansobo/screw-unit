module ScrewUnit

  def self.configure(&block)
    Configuration.instance.instance_eval(&block)
  end

  class Configuration
    DEFAULT_SELENIUM_HOST = "localhost"
    DEFAULT_SELENIUM_PORT = 4444
    DEFAULT_SELENIUM_BROWSER_STRING = "*firefox"
    DEFAULT_SELENIUM_SCREW_SERVER_URL = "http://localhost"
    DEFAULT_SELENIUM_SPECS_PATH = "/specs"

    class << self
      def instance
        @instance ||= new
      end

      def method_missing(method_name, *args, &block)
        instance.send(method_name, *args, &block)
      end
    end

    attr_reader :base_path

    def load_screwrc(base_path)
      @base_path = base_path
      load("#{base_path}/.screwrc")
    end
    
    def port(port=nil)
      @port = port if port
      @port
    end

    def code_under_test_path(relative_path=nil)
      @code_under_test_path = expand_path(relative_path) if relative_path
      @code_under_test_path
    end

    def custom_resource_locators
      @custom_resource_locators ||= []
      @custom_resource_locators
    end

    def register_custom_resource_locator(klass)
      @custom_resource_locators ||= []
      @custom_resource_locators << klass
    end

    def specs_path(relative_path=nil)
      @specs_path = expand_path(relative_path) if relative_path
      @specs_path
    end

    def screw_unit_core_path
      File.expand_path("#{File.dirname(__FILE__)}/../../javascript/lib")
    end

    def expand_path(relative_path)
      File.expand_path("#{base_path}/#{relative_path}")
    end


    def selenium_host
      ENV['SELENIUM_HOST'] || DEFAULT_SELENIUM_HOST
    end

    def selenium_port
      ENV['SELENIUM_PORT'] || DEFAULT_SELENIUM_PORT
    end

    def selenium_browser_string
      ENV['SELENIUM_BROWSER_STRING'] || DEFAULT_SELENIUM_BROWSER_STRING
    end

    def selenium_screw_server_url
      ENV['SELENIUM_SCREW_SERVER_URL'] || DEFAULT_SELENIUM_SCREW_SERVER_URL
    end

    def selenium_screw_server_port
      ENV['SELENIUM_SCREW_SERVER_PORT'] || port
    end

    def selenium_specs_path
      ENV['SELENIUM_SPECS_PATH'] || DEFAULT_SELENIUM_SPECS_PATH
    end
  end
end