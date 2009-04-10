module ScrewUnit
  module Resources
    class Dir < File
      def locate(name)

        # could refactor to its own method
#        Configuration.custom_resources_locators.each do |custom_resource_locator|
#          locator = custom_resource_locator.new(relative_path, absolute_path)
#          if resource = locator.locate(name)
#            return resource
#          end
#        end

        relative_child_path = "#{relative_path}/#{name}".gsub("//", "/")
        absolute_child_path = "#{absolute_path}/#{name}".gsub("//", "/")

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

      def glob(glob_pattern)
        ::Dir.glob(absolute_path + glob_pattern).map do |absolute_child_path|
          relative_child_path = absolute_child_path.gsub(absolute_path, relative_path)
          File.new(relative_child_path, absolute_child_path)
        end
      end

    end
  end
end