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
      before do
        stub.instance_of(Thin::Server).start!
      end

      it "calls Thin::Server.start with an instance of the Dispatcher with the given options" do
        mock.proxy(Thin::Server).start(9090)
        mock.proxy(Dispatcher).instance("screw/unit/core/path", "code/under/test/path", "specs/path")

        Server.start(
          :port => 9090,
          :screw_unit_core_path => "screw/unit/core/path",
          :code_under_test_path => "code/under/test/path",
          :specs_path => "specs/path"
        )
      end

      context "when no port option is supplied" do
        it "defaults to 8080" do
          mock.proxy(Thin::Server).start(8080)
          Server.start(
            :screw_unit_core_path => "screw/unit/core/path",
            :code_under_test_path => "code/under/test/path",
            :specs_path => "specs/path"
          )
        end
      end
    end
  end
end
