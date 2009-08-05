module ScrewUnit
  module Resources
    class SuiteCompletion
      attr_reader :options
      def initialize(options = {})
        @options = options
      end

      def post(request)
        puts request.body.string unless request.body.string == "success"
        if options[:selenium]
          $exit_status = (request.body.string == "success") ? 0 : 1
          Thread.new do
            sleep 1 # give the server thread a moment to send the response before we kill it
            $thin_server.stop!
          end
        end
        [200, {}, "OK"]
      end
    end
  end
end