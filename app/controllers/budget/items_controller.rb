# frozen_string_literal: true

module Budget
  class ItemsController < ApplicationController
    skip_before_action :authenticate_user!

    def show
      render json: 'BudgetSetupApp', props: graph_data
    end

    private

    def query
      <<-GQL
        {
          budget {
            item(id: #{item_id}) {
            id
            events {
              typeDescription
              amount
              data
              createdAt
            }
            transactionDetails {
              amount
              description
              accountName
              categoryName
              updatedAt
            }
          }
        }
      GQL
    end
  end
end
