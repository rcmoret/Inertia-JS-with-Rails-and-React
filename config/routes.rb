# frozen_string_literal: true

Rails.application.routes.draw do
  mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql' if Rails.env.development? || Rails.env.demo?
  devise_for :users
  post '/graphql', to: 'graphql#execute'
  namespace :budget do
    get '(/:month/:year)', to: 'interval_items#index'
    resources :items, only: :show
    get 'set-up', to: 'set_up#new'
    post 'set-up', to: 'set_up#create'
    get 'finalize', to: 'finalize#new'
    post 'finalize', to: 'finalize#complete'
  end
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
