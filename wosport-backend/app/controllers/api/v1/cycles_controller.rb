module Api
  module V1
    class CyclesController < ApplicationController
      before_action :authenticate_user!
      before_action :set_cycle, only: [:show, :update, :destroy]

      def index
        render json: current_user.cycles.order(start_date: :desc)
      end

      def show
        render json: @cycle
      end

      def create
        cycle = current_user.cycles.new(cycle_params)
        if cycle.save
          render json: cycle, status: :created
        else
          render json: { errors: cycle.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @cycle.update(cycle_params)
          render json: @cycle
        else
          render json: { errors: @cycle.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @cycle.destroy
        head :no_content
      end

      private

      def set_cycle
        @cycle = current_user.cycles.find(params[:id])
      end

      def cycle_params
        params.require(:cycle).permit(:start_date, :end_date, :notes, symptoms: {})
      end
    end
  end
end
