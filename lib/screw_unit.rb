dir = File.dirname(__FILE__)
require "rubygems"
require "thin"
require "#{dir}/../vendor/sprockets/lib/sprockets"
require "#{dir}/screw_unit/dispatcher"
require "#{dir}/screw_unit/server"
require "#{dir}/screw_unit/resources"
require "#{dir}/screw_unit/configuration"
require "#{dir}/screw_unit/asset_manager"
require "#{dir}/screw_unit/asset_location"

module ScrewUnit
  VERSION = "1.9.0"
end
