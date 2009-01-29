module ScrewUnit
  module Resources
    class Root
      def get
        [200, {"Content-Type" => "text/html"}, "ROOT"]
      end
    end
  end
end