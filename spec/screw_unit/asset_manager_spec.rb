require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

module ScrewUnit
  describe AssetManager do
    attr_reader :manager, :dir

    before do
      @dir = File.dirname(__FILE__)
      @manager = AssetManager.new
      manager.add_js_location("/specs/1", "#{dir}/asset_manager_spec/dir_1")
      manager.add_js_location("/specs/2", "#{dir}/asset_manager_spec/dir_2")
      manager.add_js_location("/implementations", "#{dir}/asset_manager_spec/dir_3")
      manager.add_location("/css", "#{dir}/asset_manager_spec/dir_4")
    end

    describe "#virtualize_path" do
      it "converts a physical path to a virtual path based on the declared locations" do
        manager.virtualize_path("#{dir}/asset_manager_spec/dir_1/1.js").should == "/specs/1/1.js"
        manager.virtualize_path("#{dir}/asset_manager_spec/dir_2/2.js").should == "/specs/2/2.js"
        manager.virtualize_path("#{dir}/asset_manager_spec/dir_3/3.js").should == "/implementations/3.js"
        manager.virtualize_path("/crap").should be_nil
      end
    end

    describe "#physicalize_path" do
      it "converts a virtual path to a physical path based on the declared locations" do
        manager.physicalize_path("/specs/1/1.js").should == "#{dir}/asset_manager_spec/dir_1/1.js"
        manager.physicalize_path("/specs/2/2.js").should == "#{dir}/asset_manager_spec/dir_2/2.js"
        manager.physicalize_path("/implementations/3.js").should == "#{dir}/asset_manager_spec/dir_3/3.js"
      end
    end

    describe "#glob_virtual_paths" do
      it "maps the glob pattern to the declared locations, potentially spanning multiple physical locations, and returns the matching relative paths" do
        manager.glob_virtual_paths("/specs/**/*.js").should == ["/specs/2/2.js", "/specs/1/1.js", "/specs/1/subdir_1/4.js"]
        manager.glob_virtual_paths("/specs/1/*.js").should == ["/specs/1/1.js"]
        manager.glob_virtual_paths("/specs/x/*.js").should == []
        manager.glob_virtual_paths("/implementations/**/*.js").should == ["/implementations/3.js", "/implementations/subdir_3/5.js"]
        manager.glob_virtual_paths("/implementations/*.js").should == ["/implementations/3.js"]
      end
    end

    describe "#virtual_dependency_paths" do
      it "computes the virtual paths of the require graph extending out from the files on the load path corresponding to the given paths" do
        expected_dependency_paths = [
          "/specs/1/subdir_1/4.js",
          "/implementations/subdir_3/5.js",
          "/implementations/3.js",
          "/specs/1/1.js"
        ]
        manager.virtual_dependency_paths("1.js", "subdir_3/5.js").should == expected_dependency_paths
      end
    end
  end
end
