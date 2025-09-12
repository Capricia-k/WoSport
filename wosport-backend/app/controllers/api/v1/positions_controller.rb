module Api
  module V1
    class PositionsController < ApplicationController
      before_action :set_session

      def create
        @position = @session.positions.new(position_params.merge(timestamp: Time.current))

        if @position.save
          render json: @position, status: :created
        else
          render json: { errors: @position.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_session
        @session = Session.find(params[:session_id])
      end

      def position_params
        params.require(:position).permit(:latitude, :longitude)
      end
    end
  end
end
