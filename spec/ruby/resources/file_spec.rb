require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  module Resources
    describe File do
      attr_reader :dir, :file

      before do
        @dir = ::File.dirname(__FILE__)
        @file = File.new("/foo.js", absolute_path)
      end

      describe "#get" do
        context "when a file exists at #absolute_path" do
          def absolute_path
            "#{dir}/file_system_fixtures/foo.js"
          end
          attr_reader :response_code, :headers, :body

          before do
            ::File.exists?(absolute_path).should be_true
            @response_code, @headers, @body = file.get
          end

          it "returns 200 as the response code" do
            response_code.should == 200
          end

          it "returns the contents of the file as the respons body" do
            body.should == ::File.read(absolute_path)
          end

          context "when the file has a .js extension" do
            it "has a Content-Type header of 'text/javascript'" do
              headers['Content-Type'].should == "text/javascript"
            end
          end
        end

        context "when no file exists at #absolute_path" do

        end
      end
    end
  end
end