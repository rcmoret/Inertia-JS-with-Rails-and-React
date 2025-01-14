# frozen_string_literal: true

module Helpers
  module CustomMatchers
    RSpec::Matchers.define :be_a_boolean do |_expected|
      match do |actual|
        [true, false].include?(actual)
      end
    end

    RSpec::Matchers.define :include_these do |*expected|
      match do |actual|
        expected.all? { |e| actual.include?(e) }
      end
    end
  end
end
