class Nutrition::FoodEntriesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_log

  def create
    item = params.require(:item).permit(:name,:brand,:off_barcode,:serving_qty,:serving_unit,:kcal,:protein_g,:carbs_g,:fat_g,:fiber_g,:sugar_g,:sodium_mg,:external_id,:source)
    @log.food_entries.create!(item.to_h)
    redirect_to nutrition_meal_logs_path(date: @log.ate_on), notice: "Aliment ajouté"
  end

  def destroy
    @log.food_entries.find(params[:id]).destroy
    redirect_to nutrition_meal_logs_path(date: @log.ate_on), notice: "Supprimé"
  end

  private
  def set_log
    @log = current_user.meal_logs.find(params[:meal_log_id])
  end
end
