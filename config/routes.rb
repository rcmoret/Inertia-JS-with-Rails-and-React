# frozen_string_literal: true

Rails.application.routes.draw do
  mount GraphiQL::Rails::Engine, at: '/graphiql', graphql_path: '/graphql' if Rails.env.development? || Rails.env.demo?
  devise_for :users
  get '/', to: redirect('/budget')
  get '/sign_in', to: redirect('/users/sign_in')
  post '/graphql', to: 'graphql#execute'
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
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
