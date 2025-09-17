class Nutrition::FoodsController < ApplicationController
  def search
    q = params[:q].to_s.strip
    render json: [] and return if q.blank?
    items = OpenFoodFactsClient.search(q)
    render json: items
  end
end
