# frozen_string_literal: true

module Slugable
  extend ActiveSupport::Concern

  SLUG_FORMAT_MESSAGE = 'must be combination of lowercase letters, numbers and dashes'

  included do
    validates :slug, presence: true
    validates :slug, format: { with: /\A[a-z0-9-]+\Z/, message: SLUG_FORMAT_MESSAGE }

    scope :active_scope, -> { defined?(active) ? active : all }
    validates_uniqueness_of :name, :slug, conditions: -> { active_scope }
  end
end
