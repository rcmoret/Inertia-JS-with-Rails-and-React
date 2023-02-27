# frozen_string_literal: true

module AccountAdminHelpers
  COMPONENT = :account_index_app

  def query
    GraphQueries::AccountQueries.full_accounts_belonging_to(
      current_user,
      include_archived: include_archived?
    )
  end

  def include_archived?
    params.fetch(:include_archived, false) == 'true'
  end

  def namespace
    'accounts'
  end
end
