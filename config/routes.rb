# frozen_string_literal: true

Rails.application.routes.draw do
  mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql' if Rails.env.development? || Rails.env.demo?
  devise_for :users

  get '/', to: redirect('/budget')
  get '/sign_in', to: redirect('/users/sign_in')

  post '/graphql', to: 'graphql#execute'

  get '/accounts', to: 'accounts/home#index', as: :accounts_home
  get '/accounts/admin', to: 'accounts/list#index', as: :accounts
  post '/accounts', to: 'accounts/create#call'
  put '/accounts/:id', to: 'accounts/update#call'
  delete '/accounts/:id', to: 'accounts/delete#call'

  get '/accounts/:identifier/transactions(/:month/:year)', to: 'accounts/transactions#index', as: :account_transactions
  post '/accounts/:account_identifier/transactions', to: 'transactions/create#call'
  put '/transactions/:key', to: 'transactions/update#call'
  delete '/transactions/:key', to: 'transactions/delete#call'
  post '/accounts/transfer', to: 'transfers#call'

  namespace :budget do
    get '(/:month/:year)', to: 'items#index'
    resources :items, only: :show
    namespace :items do
      resources :events, only: :create
    end
    get '/set-up/:month/:year', to: 'set_up#new'
    post 'set-up/:month/:year', to: 'set_up#create'
    get '/finalize/:month/:year', to: 'finalize#new'
    get '/:month/:year/finalize', to: 'finalize#new'
    post 'finalize/:month/:year', to: 'finalize#complete'

    get '/categories', to: 'categories/index#call', as: :categories
    post '/categories', to: 'categories/create#call'
    put '/categories/:slug', to: 'categories/update#call'
    delete '/categories/:slug', to: 'categories/delete#call'
    post '/categories/:slug/maturity_intervals', to: 'categories/maturity_intervals/create#call'
    delete '/categories/:slug/maturity_intervals/:month/:year', to: 'categories/maturity_intervals/delete#call'
  end
end
