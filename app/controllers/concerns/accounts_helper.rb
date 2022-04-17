# frozen_string_literal: true

module AccountsHelper
  def selected_account_path
    session[:selected_account_path].to_s
  end
end
