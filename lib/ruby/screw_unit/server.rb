require "rubygems"
require "thin"

module ScrewUnit
  class Server
    def self.start
      new.start
    end

    def start
      Thin::Server.start do
        run Dispatcher.new
      end
    end
  end
end