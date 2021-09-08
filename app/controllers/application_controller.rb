class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  after_action :add_csrf_token

  private

  def add_csrf_token
    cookies["XSRF-TOKEN"] = form_authenticity_token
  end
end
