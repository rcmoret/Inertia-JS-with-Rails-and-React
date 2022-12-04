# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Icon, type: :model do
  subject { FactoryBot.create(:icon) }

  it { is_expected.to validate_uniqueness_of(:name) }
  it { is_expected.to validate_uniqueness_of(:class_name) }
  it { is_expected.to validate_presence_of(:name) }
  it { is_expected.to validate_presence_of(:class_name) }
end
