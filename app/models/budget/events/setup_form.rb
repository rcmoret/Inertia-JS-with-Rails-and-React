# frozen_string_literal: true

module Budget
  module Events
    class SetupForm
      include ActiveModel::Model

      validate :interval_presence!
      validate :interval_needs_setup!
      validate :events_form_valid!

      def initialize(**options)
        @events_form = Budget::Events::Form.new(events: options.delete(:events))
        @interval = Interval.for(**options)
        @options = options
      end

      def save
        return false unless valid?

        ApplicationRecord.transaction do
          update_interval
          save_events

          raise ActiveRecord::Rollback if errors.any?
        end

        errors.none?
      end

      private

      attr_reader :interval, :events_form, :options

      def update_interval
        interval.set_up_completed_at = Time.current
        interval.start_date ||= start_date
        interval.end_date ||= end_date

        return if interval.save

        promote_errors(interval)
      end

      def start_date
        options.fetch(:start_date, interval.first_date)
      end

      def end_date
        options.fetch(:end_date, interval.last_date)
      end

      def save_events
        return if events_form.save

        promote_errors(events_form)
      end

      def interval_needs_setup!
        return unless interval.set_up?

        errors.add(:interval, 'has already been set up')
      end

      def interval_presence!
        return if interval.persisted?

        errors.add(:interval, 'must be present and valid')
      end

      def events_form_valid!
        return if events_form.valid?

        promote_errors(events_form)
      end

      def promote_errors(object)
        object.errors.each do |attribute, messages|
          errors.add(attribute, messages)
        end
      end
    end
  end
end
