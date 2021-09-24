Rails.application.routes.draw do
  if Rails.env.development?
    mount GraphiQL::Rails::Engine, at: "/graphiql", graphql_path: "/graphql"
  end
  devise_for :users
  post "/graphql", to: "graphql#execute"
  namespace :budget do
    get 'set-up', to: 'set_up#new'
    post 'set-up', to: 'set_up#create'
  end
  get '/budget(/:month/:year)', to: 'budget#index'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  as :user do
    get '/', to: 'to_dos#index'
  end
end
