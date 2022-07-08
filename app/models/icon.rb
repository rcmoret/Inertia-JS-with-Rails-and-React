# frozen_string_literal: true

class Icon < ApplicationRecord
  validates :name, uniqueness: true, presence: true
  validates :class_name, uniqueness: true, presence: true

  has_many :budget_categories, class_name: 'Budget::Category', dependent: :nullify

  delegate :to_hash, to: :attributes

  def attributes
    super.slice('id', 'class_name', 'name').symbolize_keys
  end
end
