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
        mock.proxy(Thin::Server).new(9090) do |return_value|
          stub(return_value).start
        end
        mock.proxy(Dispatcher).instance("screw/unit/core/path", "code/under/test/path", "specs/path", :selenium => true, :some_future_option => "some value")

        Server.start(
          :port => 9090,
          :screw_unit_core_path => "screw/unit/core/path",
          :code_under_test_path => "code/under/test/path",
          :specs_path => "specs/path",
          :selenium => true,
          :some_future_option => "some value"
        )
      end

      context "when no port option is supplied" do
        it "defaults to 8080" do
          mock.proxy(Thin::Server).new(8080) do |return_value|
            stub(return_value).start
          end
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
