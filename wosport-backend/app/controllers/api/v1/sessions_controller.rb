module Api
  module V1
    class SessionsController < ApplicationController
      before_action :set_user

      # GET /api/v1/sessions
      def index
        @sessions = @user.sessions.order(start_time: :desc)
        render json: @sessions
      end

      # POST /api/v1/sessions
      def create
        @session = @user.sessions.new(session_params)
        if @session.save
          render json: @session
        else
          render json: { errors: @session.errors.full_messages }, status: :bad_request
        end
      end

      # PATCH /api/v1/sessions/:id/stop
      def stop
        @session = @user.sessions.find(params[:id])
        @session.update(end_time: Time.current)
        render json: @session
      end

      private

      def set_user
        @user = User.find(params[:user_id])
      end

      def session_params
        params.require(:session).permit(:start_time, :end_time, :distance)
      end
    end
  end
end
