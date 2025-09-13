require 'sidekiq/web'

Rails.application.routes.draw do
  get 'stories/index'
  mount Sidekiq::Web => '/sidekiq'

  devise_for :users,
             defaults: { format: :json },
             controllers: {
               sessions: 'users/sessions',
               registrations: 'users/registrations'
             }

  # Health check
  get 'up' => 'rails/health#show', as: :rails_health_check

  resources :workouts, only: [:index, :show]
  resources :videos

  namespace :api do
    namespace :v1 do
      # Cycles
      resources :cycles, only: [:index, :create, :update, :destroy, :show]

      # Saved videos
      resources :saved_videos, only: [:index, :create, :show, :destroy]

      # SOS Alerts
      resources :sos_alerts, only: [:create]

      # Posts
      resources :posts, only: [:index, :show, :create, :destroy] do
        resources :comments, only: [:create, :destroy]
        resources :encouragements, only: [:create, :destroy]
      end

      # Messages
      resources :messages, only: [:index, :show, :create, :destroy] do
        collection do
          get 'unread_count', to: 'messages#unread_count'
          get 'conversation', to: 'messages#conversation'
        end
      end

      # Users
      resources :users, only: [:index, :update, :show] do
        post :avatar, on: :member
        patch :toggle_visibility, on: :collection
        get :friends, on: :collection
        get 'conversation', to: 'messages#conversation', on: :member

        # Sessions & Positions
        resources :sessions, only: [:index, :create, :show, :update, :destroy] do
          member do
            patch :stop
          end
          resources :positions, only: [:create]
        end

        # Messages inside users
        resources :messages, only: [:create, :destroy]
      end

      # Follows
      resources :follows, only: [:create, :destroy]

      resources :stories, only: [:index, :create, :show, :destroy] do
        resources :reactions, only: [:create, :index, :destroy]
        get 'viewers', on: :member
        post 'messages', on: :member
      end
    end
  end
end
