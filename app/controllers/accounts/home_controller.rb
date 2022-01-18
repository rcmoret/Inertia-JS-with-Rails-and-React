# frozen_string_literal: true

module Accounts
  class HomeController < ApplicationController
    include GraphQuery

    def index
      render inertia: 'AccountHomeApp', props: props
    end

    private

    def current_interval
      Budget::Interval.current
    end

    def month
      params.fetch(:month, current_interval.month)
    end

    def year
      params.fetch(:year, current_interval.year)
    end

    def query
      '{ accounts { id name balance priority slug } }'
    end

    def namespace
      'accounts'
    end

    def additional_props
      { interval: { month: month, year: year } }
    end
  end
end
