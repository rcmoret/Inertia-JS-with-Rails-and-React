# frozen_string_literal: true

Rails.application.routes.draw do
  mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql' if Rails.env.development? || Rails.env.demo?
  devise_for :users

  get '/', to: redirect('/budget')
  get '/sign_in', to: redirect('/users/sign_in')

  post '/graphql', to: 'graphql#execute'

  get '/accounts/:slug/transactions(/:month/:year)', to: 'accounts/transactions#index', as: :account_transactions
  get '/accounts', to: 'accounts/home#index', as: :accounts_home
  get '/accounts/admin', to: 'accounts/list#index', as: :accounts

  resources :accounts, only: %i[create update destroy] do
    resources :transactions, only: %i[create update destroy], controller: 'accounts/transactions'
  end

  namespace :budget do
    get '(/:month/:year)', to: 'items#index'
    resources :items, only: :show
    namespace :items do
      resources :events, only: :create
    end
    get 'set-up', to: 'set_up#new'
    post 'set-up', to: 'set_up#create'
    get 'finalize', to: 'finalize#new'
    post 'finalize', to: 'finalize#complete'
  end
end
