module ScrewUnit
  module Resources
    class SpecDir < Dir
      def get
        SpecSuite.new(glob("/**/*.js")).get
      end
    end
  end
end