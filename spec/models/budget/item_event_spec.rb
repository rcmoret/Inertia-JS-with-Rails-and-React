# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::ItemEvent, type: :model do
  subject { FactoryBot.create(:budget_item_event) }

  it { is_expected.to belong_to(:item) }
  xit { is_expected.to belong_to(:type) }
end
