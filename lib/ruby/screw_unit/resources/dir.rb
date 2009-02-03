module ScrewUnit
  module Resources
    class Dir < File
      def locate(name)
        relative_child_path = "#{relative_path}/#{name}"
        absolute_child_path = "#{absolute_path}/#{name}"

        if ::File.exists?(absolute_child_path)
          if ::File.directory?(absolute_child_path)
            Dir.new(relative_child_path, absolute_child_path)
          else
            File.new(relative_child_path, absolute_child_path)
          end
        else
          FileNotFound.new(relative_child_path)
        end
      end
    end
  end
end