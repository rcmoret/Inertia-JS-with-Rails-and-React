# frozen_string_literal: true

module BelongsToUserGroup
  extend ActiveSupport::Concern

  included do
    belongs_to :user_group
    scope :belonging_to, ->(user) { joins(:user_group).where(user_group: user.user_group) }
  end
end
