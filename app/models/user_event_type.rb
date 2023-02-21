# frozen_string_literal: true

class UserEventType < ApplicationRecord
  validates :name,
            length: { maximum: 100 },
            presence: true,
            uniqueness: true,
            format: { with: /[az][az_]*[az]/ }

  alias_attribute :client_recordable?, :is_client_recordable
  alias_attribute :internal_recordable?, :is_internal_recordable
end
