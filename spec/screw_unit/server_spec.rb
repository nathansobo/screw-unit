require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe Server do
    describe ".start" do
      it "creates a new instance of Server and calls #start on it" do
        options = { :foo => "bar" }
        mock_server = Object.new
        mock(mock_server).start(options)
        stub(Server).new {  mock_server }
        Server.start(options)
      end
    end

    describe "#start" do
      it "calls Thin::Server.start with an instance of the Dispatcher with the given options" do
        stub.instance_of(Thin::Server).start!

        mock.proxy(Thin::Server).start(8080)
        mock.proxy(Dispatcher).instance("code/under/test/path", "specs/path")

        Server.start(
          :code_under_test_path => "code/under/test/path",
          :specs_path => "specs/path"
        )
      end
    end
  end
end
