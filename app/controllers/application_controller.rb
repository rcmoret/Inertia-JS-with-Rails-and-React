class ApplicationController < ActionController::Base
  before_action :authenticate_user!, unless: :demo_env?
  after_action :add_csrf_token

  private

  def add_csrf_token
    cookies["XSRF-TOKEN"] = form_authenticity_token
  end

  def demo_env?
    Rails.env == 'demo'
  end
end
