# frozen_string_literal: true

module BelongsToUser
  extend ActiveSupport::Concern

  included do
    belongs_to :user
    scope :belonging_to, ->(user) { where(user: user) }
  end
end
