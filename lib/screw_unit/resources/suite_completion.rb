module ScrewUnit
  module Resources
    class SuiteCompletion
      attr_reader :options
      def initialize(options = {})
        @options = options
      end

      def post(request)
        if options[:selenium]
          $exit_status = (request.body.string == "success") ? 0 : 1
          $thin_server.stop!
        end
      end
    end
  end
end