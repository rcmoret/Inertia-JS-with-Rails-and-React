Rails.application.routes.draw do
  devise_for :users
  resources :to_dos
  resources :artists
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  as :user do
    get '/', to: 'to_dos#index'
  end
end
