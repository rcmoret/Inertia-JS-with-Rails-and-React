# frozen_string_literal: true

module Fetchable
  extend ActiveSupport::Concern

  class_methods do
    def fetch(user:, identifier:)
      belonging_to(user).for(identifier)
    end
  end
end
