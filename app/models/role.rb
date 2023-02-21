# frozen_string_literal: true

class Role < ApplicationRecord
  VALID_ROLES = %w[
    admin
    user
  ].freeze

  validates :name, inclusion: { in: VALID_ROLES }

  def self.for(name)
    find_or_create_by(name: name)
  end

  def admin?
    name == 'admin'
  end
end
