module ScrewUnit
  module Resources
    class SpecDir < Dir
      def locate(name)
        relative_child_path = "#{relative_path}/#{name}".gsub("//", "/")
        absolute_child_path = "#{absolute_path}/#{name}".gsub("//", "/")

        p absolute_child_path

        if ::File.exists?(absolute_child_path)
          if ::File.directory?(absolute_child_path)
            SpecDir.new(relative_child_path, absolute_child_path)
          else
            File.new(relative_child_path, absolute_child_path)
          end
        elsif ::File.exists?(absolute_child_path + ".js")
          SpecSuite.new([File.new(relative_child_path + ".js", absolute_child_path + ".js")])
        else
          FileNotFound.new(relative_child_path)
        end
      end

      def get
        SpecSuite.new(glob("/**/*.js")).get
      end
    end
  end
end