# frozen_string_literal: true

module Budget
  class ItemView < ActiveRecord::Base
    include Budget::Shared
    include Presentable

    self.primary_key = :id

    def to_hash
      super
      attributes.symbolize_keys
    end

    def to_json(*)
      to_hash.to_json
    end

    def readonly?
      true
    end

    private

    def presenter_class
      if monthly?
        Presenters::Budget::MonthlyItemPresenter
      else
        Presenters::Budget::DayToDayItemPresenter
      end
    end
  end
end
