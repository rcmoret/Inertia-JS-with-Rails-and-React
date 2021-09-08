class Artist < ApplicationRecord
  has_many :songs
  has_many :collections, through: :songs

  def collections
    super.uniq
  end
end
