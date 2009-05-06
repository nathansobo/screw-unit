dir = File.dirname(__FILE__)
require "rubygems"
require "thin"
require "sprockets"
require "#{dir}/screw_unit/dispatcher"
require "#{dir}/screw_unit/server"
require "#{dir}/screw_unit/resources"
require "#{dir}/screw_unit/configuration"

module ScrewUnit
  VERSION = "1.9.0"
end