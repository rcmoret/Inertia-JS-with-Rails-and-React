# frozen_string_literal: true

module HasKeyIdentifier
  extend ActiveSupport::Concern

  included do
    validates :key, uniqueness: true, presence: true, length: { is: 12 }
  end

  class_methods do
    def for(key)
      find_by(arel_table[:key].lower.eq(key.to_s.downcase))
    end
  end
end
