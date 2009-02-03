module ScrewUnit
  module Resources
    class Dir < File

      def locate(name)
        subdir(name)
      end

      protected
      def subdir(name)
        relative_subdir_path = "#{relative_path}/#{name}"
        absolute_subdir_path = "#{absolute_path}/#{name}"
        if ::File.directory?(absolute_path)
          Dir.new(relative_subdir_path, absolute_subdir_path)
        else
          nil
        end
      end
    end
  end
end