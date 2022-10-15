# frozen_string_literal: true

module Budget
  module EventTypes
    ADJUST_EVENTS = [
      ITEM_ADJUST = 'item_adjust',
      MULTI_ITEM_ADJUST = 'multi_item_adjust',
      ROLLOVER_ITEM_ADJUST = 'rollover_item_adjust',
      SETUP_ITEM_ADJUST = 'setup_item_adjust',
    ].freeze

    CREATE_EVENTS = [
      ITEM_CREATE = 'item_create',
      LEGACY_ITEM_CREATE = 'legacy_item_create',
      MULTI_ITEM_ADJUST_CREATE = 'multi_item_adjust_create',
      PRE_SETUP_ITEM_CREATE = 'pre_setup_item_create',
      PRE_SETUP_MULTI_ITEM_ADJUST_CREATE = 'pre_setup_multi_item_adjust_create',
      ROLLOVER_ITEM_CREATE = 'rollover_item_create',
      SETUP_ITEM_CREATE = 'setup_item_create',
    ].freeze

    DELETE_EVENTS = [
      ITEM_DELETE = 'item_delete',
      MULTI_ITEM_ADJUST_DELETE = 'multi_item_adjust_delete',
      SETUP_ITEM_DELETE = 'setup_item_delete',
    ].freeze

    VALID_ITEM_TYPES = [
      *CREATE_EVENTS,
      *ADJUST_EVENTS,
      *DELETE_EVENTS,
    ].freeze
  end
end
