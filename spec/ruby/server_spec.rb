require "#{File.dirname(__FILE__)}/screw_unit_spec_helper"

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
      it "assigns Dispatcher.instance.root to a root with the appropriate #screw_unit_core_path, #code_under_test_path, #specs_path and calls Thin::Server.start" do
        Dispatcher.instance.root.should be_nil
        mock(Thin::Server).start

        Server.start(
          :code_under_test_path => "code_under_test_path",
          :specs_path => "specs_path"
        )

        root = Dispatcher.instance.root
        root.code_under_test_path.should == "code_under_test_path"
        root.specs_path.should == "specs_path"
      end
    end
  end
end
