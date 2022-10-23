# frozen_string_literal: true

module Budget
  class ItemEvent < ApplicationRecord
    include EventTypes
    include Presentable
    belongs_to :item, class_name: 'Item', foreign_key: :budget_item_id
    belongs_to :item_view, class_name: 'ItemView', foreign_key: :budget_item_id
    belongs_to :type, class_name: 'ItemEventType', foreign_key: :budget_item_event_type_id

    alias_attribute :type_id, :budget_item_event_type_id
    alias_attribute :item_id, :budget_item_id

    validates :type_id, uniqueness: { scope: :item_id }, if: :item_create?
    validates :type_id, uniqueness: { scope: :item_id }, if: :item_delete?
    validate :validate_json_data, if: :data_present?

    scope :prior_to, ->(date_hash) { joins(:item).merge(Item.prior_to(date_hash)) }
    scope :in_range, ->(range) { joins(:item).merge(Item.in_range(range)) }
    scope :adjust_events, -> { where(type: ItemEventType.where(name: ADJUST_EVENTS)) }
    scope :create_events, -> { where(type: ItemEventType.where(name: CREATE_EVENTS)) }
    scope :delete_events, -> { where(type: ItemEventType.where(name: DELETE_EVENTS)) }

    VALID_ITEM_TYPES.each do |event_type|
      scope event_type.to_sym, -> { where(type: ItemEventType.for(event_type)) }
    end

    delegate :as_json, :to_json, to: :to_hash
    delegate :present?, to: :data, prefix: true

    def to_hash
      attributes
        .symbolize_keys
        .merge(name: type.name)
    end

    def item_create?
      CREATE_EVENTS.include?(type.name)
    end

    def item_delete?
      DELETE_EVENTS.include?(type.name)
    end

    private

    def validate_json_data
      case data
      when nil, Hash
        nil
      when String
        self[:data] = JSON.parse(data)
      when Array
        self[:data] = { event_data: data }
      end
    rescue JSON::ParserError
      errors.add(:data, 'provided a string that was not valid JSON')
    end

    def presenter_class
      Presenters::Budget::ItemEventPresenter
    end
  end
end
