# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget::Events::FormBase do
  describe '.applies?' do
    it 'raises a not implemented error' do
      expect { described_class.applies?('foo_bar_biz') }
        .to raise_error(NotImplementedError)
    end
  end
end
