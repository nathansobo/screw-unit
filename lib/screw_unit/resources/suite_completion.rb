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
          $thin_server.stop!
        end
      end
    end
  end
end