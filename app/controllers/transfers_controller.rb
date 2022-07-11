# frozen_string_literal: true

class TransfersController < ApplicationController
  def call
    case form.call
    in [:ok, { transfer: transfer }]
      redirect_to account_transactions_path(transfer_params[:from_account_id])
    in [:error, error_hash]
      render json: error_hash, status: :unprocessable_entity
    end
  end

  private

  def transfer_params
    params.require(:transfer).permit(:to_account_id, :from_account_id, :amount)
  end

  def form
    @form ||= Forms::TransferForm.new(
      **transfer_params.to_h.symbolize_keys
    )
  end
end
