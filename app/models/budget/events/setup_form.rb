# frozen_string_literal: true

module Budget
  module Events
    class SetupForm
      include ActiveModel::Model
      include CubanLinx::CallChain

      # validate :interval_presence!
      # validate :interval_needs_setup!
      # validate :events_form_valid!

      execution_chain :save_events_procedure, functions: %i[
        interval_presence!
        interval_needs_setup!
        events_form_valid!
        check_for_errors
        set_start_and_end_dates
        save_records
        check_for_errors
      ]

      def initialize(**options)
        @events_form = Budget::Events::Form.new(events: options.delete(:events))
        @interval = Interval.for(**options)
        @options = options
      end

      def save
        save_events_procedure.call(
          events_form: events_form,
          interval: interval,
          options: options,
        )
      end

      def save_records
        lambda { |*|
          ApplicationRecord.transaction do
            update_interval
            save_events

            raise ActiveRecord::Rollback if errors.any?
          end
          [:ok, { interval: interval, events: events_form.attributes }]
        }
      end

      attr_reader :interval, :events_form, :options

      def update_interval
        lambda { |payload|
          interval.set_up_completed_at = Time.current
          interval.start_date ||= payload.fetch(:start_date)
          interval.end_date ||= payload.fetch(:end_date)

          return :ok if interval.save

          promote_errors(interval)
          :ok
        }
      end

      def set_start_and_end_dates
        lambda { |payload|
          start_date = payload.fetch(:options).fetch(:start_date, interval.first_date)
          end_date = payload.fetch(:options).fetch(:end_date, interval.last_date)
          [:ok, { start_date: start_date, end_date: end_date }]
        }
      end

      def save_events
        lambda { |*|
          return :ok if events_form.save

          promote_errors(events_form)
          :ok
        }
      end

      def interval_needs_setup!
        lambda { |payload|
          interval = payload.fetch(:interval)
          return :ok unless interval.set_up?

          errors.add(:interval, 'has already been set up')
          :ok
        }
      end

      def interval_presence!
        lambda { |payload|
          interval = payload.fetch(:interval)

          return :ok if interval.persisted?

          errors.add(:interval, 'must be present and valid')
          :ok
        }
      end

      def events_form_valid!
        lambda { |payload|
          events_form = payload.fetch(:events_form)

          return :ok if events_form.valid?

          promote_errors(events_form)
          :ok
        }
      end

      def check_for_errors
        lambda { |*|
          return :ok if errors.none?

          [:error, errors.to_h]
        }
      end

      private

      def promote_errors(object)
        object.errors.each do |attribute, messages|
          errors.add(attribute, messages)
        end
      end
    end
  end
end
