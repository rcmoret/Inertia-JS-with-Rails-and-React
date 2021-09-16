# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::ItemEvent, type: :model do
  it { is_expected.to belong_to(:item) }
  it { is_expected.to belong_to(:type) }
end
