module ScrewUnit
  module Resources
    class Root < Resources::Dir
      attr_accessor :screw_unit_core_path, :code_under_test_path, :specs_path

      def self.instance(*args)
        @instance ||= new(*args)
      end

      def initialize(screw_unit_core_path, code_under_test_path, specs_path)
        @screw_unit_core_path, @code_under_test_path, @specs_path = screw_unit_core_path, code_under_test_path, specs_path
        super("/", code_under_test_path)
      end

      def locate(path_fragment)
        case path_fragment
        when "screw_unit_core"
          Dir.new("/screw_unit_core", screw_unit_core_path)
        when "specs"
          SpecDir.new("/specs", specs_path)
        else
          super
        end
      end
    end
  end
end