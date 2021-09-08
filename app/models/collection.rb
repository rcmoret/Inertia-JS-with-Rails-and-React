class Collection < ApplicationRecord
  has_many :songs
  has_many :artists, through: :songs
  belongs_to :collection_type
  alias_attribute :type, :collection_type
end
