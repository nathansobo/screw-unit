require "#{File.dirname(__FILE__)}/../../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe SuiteCompletion do
      attr_reader :suite_completion, :mock_request

      describe "#post" do
        before do
          $exit_status = nil
          $thin_server = Object.new
          @mock_request = Object.new
        end

        context "when @options[:selenium] is true" do
          before do
            @suite_completion = SuiteCompletion.new(:selenium => true)
          end

          context "when the request body is 'success'" do
            before do
              stub(mock_request).body { StringIO.new("success") }
            end

            it "sets the $exit_status to 0 and stops the $thin_server" do
              mock($thin_server).stop!
              suite_completion.post(mock_request)
              $exit_status.should == 0
            end
          end

          context "when the request body is anything else" do
            before do
              stub(mock_request).body { StringIO.new("failure") }
            end

            it "sets the $exit_status to 1 and stops the $thin_server" do
              mock($thin_server).stop!
              suite_completion.post(mock_request)
              $exit_status.should == 1
            end
          end
        end

        context "when @options[:selenium] is not true" do
          before do
            @suite_completion = SuiteCompletion.new
            stub(mock_request).body { StringIO.new("anything") }
          end

          it "does not change $exit_status or stop the $thin_server" do
            dont_allow($thin_server).stop!
            suite_completion.post(mock_request)
            $exit_status.should be_nil
          end
        end
      end
    end
  end
end
