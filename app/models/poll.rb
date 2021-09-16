class Poll < ApplicationRecord
  has_many :poll_opotions
  alias_attribute :poll_options, :options
end
