# frozen_string_literal: true

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  belongs_to :user_group
  alias_attribute :group, :user_group
  has_many :user_roles, dependent: :destroy

  def admin?
    user_roles.any?(&:admin?)
  end
end
