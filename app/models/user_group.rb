# frozen_string_literal: true

class UserGroup < ApplicationRecord
  has_many :users, inverse_of: :user_group, dependent: :restrict_with_exception
  has_many :accounts, dependent: :restrict_with_exception
  has_many :budget_categories, dependent: :restrict_with_exception
  has_many :budget_intervals, dependent: :restrict_with_exception
end
