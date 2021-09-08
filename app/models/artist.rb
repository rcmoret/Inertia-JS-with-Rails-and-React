class Artist < ApplicationRecord
  has_many :songs
  has_many :collections, through: :songs

  validates :name, presence: true, uniqueness: true
  validates :slug,
            presence: true,
            uniqueness: true,
            format: {
              with: %r{\A[a-z0-9-]+\z},
              message: 'must be lowercase, numbers and dashes',
            }

  def collections
    super.uniq
  end
end
