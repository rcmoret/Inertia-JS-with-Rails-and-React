# frozen_string_literal: true

class TransfersController < ApplicationController
  def call
    case form.call
    in [:ok, { transfer: transfer }]
      redirect_to account_transactions_path(transfer_params[:from_account_slug])
    in [:error, error_hash]
      render json: error_hash, status: :unprocessable_entity
    end
  end

  private

  def transfer_params
    params.require(:transfer).permit(:key, :to_account_slug, :from_account_slug, :amount)
  end

  def form
    @form ||= Forms::TransferForm.new(user: current_user, params: transfer_params)
  end
end
