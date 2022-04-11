# frozen_string_literal: true

module Budget
  module Events
    # rubocop:disable Metrics/ClassLength
    class CreateItemForm < FormBase
      include ActiveModel::Model
      include EventTypes
      include Messages

      APPLICABLE_EVENT_TYPES = [
        ITEM_CREATE,
        MULTI_ITEM_ADJUST_CREATE,
        ROLLOVER_ITEM_CREATE,
        PRE_SETUP_MULTI_ITEM_ADJUST_CREATE,
        PRE_SETUP_ITEM_CREATE,
        SETUP_ITEM_CREATE,
      ].freeze

      def self.applicable_event_types
        APPLICABLE_EVENT_TYPES
      end

      validates :event_type, inclusion: { in: APPLICABLE_EVENT_TYPES }
      validates :category, presence: true
      validates :amount, numericality: { only_integer: true }
      validates :amount,
                numericality: {
                  less_than_or_equal_to: 0,
                  message: EXPENSE_AMOUNT_VALIDATION_MESSAGE,
                },
                if: :expense?
      validates :amount,
                numericality: {
                  greater_than_or_equal_to: 0,
                  message: REVENUE_AMOUNT_VALIDATION_MESSAGE,
                },
                if: :revenue?

      def initialize(params)
        @event_type = params[:event_type]
        @amount = params[:amount]
        @month = params[:month].to_i
        @year = params[:year].to_i
        @budget_category_id = params[:budget_category_id]
        @data = params[:data]
        super()
      end

      def save
        return false unless valid?

        ApplicationRecord.transaction do
          create_interval! unless interval.persisted?
          create_item!
          create_event!
        end

        errors.none?
      end

      def attributes
        { item: item_attributes }
      end

      alias to_hash attributes

      def to_s
        'create_item_form'
      end

      private

      def create_interval!
        return if interval.save

        promote_errors(interval.errors)
        raise ActiveRecord::Rollback
      end

      def create_item!
        return if item.save

        promote_errors(item.errors)
        raise ActiveRecord::Rollback
      end

      def create_event!
        return if event.save

        promote_errors(event.errors)
        raise ActiveRecord::Rollback
      end

      def event
        @event ||= Budget::ItemEvent.new(
          item: item,
          type: ItemEventType.send(budget_item_event_type),
          data: data,
          amount: amount,
        )
      end

      def item
        @item ||= Budget::Item.new(interval: interval, category: category)
      end

      def category
        @category ||= Budget::Category.find_by(id: budget_category_id)
      end

      def interval
        @interval ||= Budget::Interval.for(month: month, year: year)
      end

      def promote_errors(model_errors)
        model_errors.each do |attribute, message|
          errors.add(attribute, message)
        end
      end

      def expense?
        return false if category.nil?

        category.expense?
      end

      def revenue?
        return false if category.nil?

        category.revenue?
      end

      def item_attributes
        item.to_hash.merge(
          events: [event.attributes],
          amount: amount,
          monthly: category.monthly,
          transaction_count: 0,
          spent: 0,
        )
      end

      def budget_item_event_type
        @budget_item_event_type ||=
          if interval.set_up?
            event_type
          else
            pre_setup_event_type
          end
      end

      def pre_setup_event_type
        case event_type
        when SETUP_ITEM_CREATE, ITEM_CREATE
          PRE_SETUP_ITEM_CREATE
        when MULTI_ITEM_ADJUST_CREATE, PRE_SETUP_MULTI_ITEM_ADJUST_CREATE
          PRE_SETUP_MULTI_ITEM_ADJUST_CREATE
        else
          event_type
        end
      end
      attr_reader :amount, :budget_category_id, :event_type, :month, :year, :data
    end
    # rubocop:enable Metrics/ClassLength
  end
end
