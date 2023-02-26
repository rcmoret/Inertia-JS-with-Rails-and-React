# frozen_string_literal: true

module Slugable
  extend ActiveSupport::Concern

  SLUG_FORMAT_MESSAGE = 'must be combination of lowercase letters, numbers and dashes'
  SLUG_REGEXP = /\A[a-z][a-z0-9-]*[a-z0-9]\z/.freeze

  included do
    validates :slug, presence: true
    validates :slug, format: { with: SLUG_REGEXP, message: SLUG_FORMAT_MESSAGE }
    validates :slug, uniqueness: { scope: :user_group_id }
  end

  class_methods do
    def for(slug)
      find_by(arel_table[:slug].lower.eq(slug.to_s.strip.downcase))
    end
  end
end
