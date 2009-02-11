require "rubygems"
require "thin"

module ScrewUnit
  class Server
    def self.start(options)
      new.start(options)
    end

    def start(options)
      Thin::Server.start do
        run Dispatcher.instance(options[:code_under_test_path], options[:specs_path])
      end
    end
  end
end