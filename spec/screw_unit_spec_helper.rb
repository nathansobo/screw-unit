require "rubygems"
require "spec"

dir = File.dirname(__FILE__)
require "#{dir}/../lib/screw_unit"

Spec::Runner.configure do |config|
  config.mock_with :rr
end
