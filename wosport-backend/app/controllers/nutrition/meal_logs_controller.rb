class Nutrition::MealLogsController < ApplicationController
  before_action :authenticate_user!

  def index
    @date = params[:date]&.to_date || Time.zone.today
    @profile = current_user.nutrition_profile
    @logs = current_user.meal_logs.where(ate_on: @date).order(:meal_type)
  end

  def create
    log = current_user.meal_logs.find_or_create_by!(ate_on: params[:ate_on], meal_type: params[:meal_type])
    redirect_to nutrition_meal_logs_path(date: log.ate_on)
  end
end
