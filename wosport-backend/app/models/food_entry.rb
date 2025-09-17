class FoodEntry < ApplicationRecord
  belongs_to :meal_log
  validates :name, :serving_qty, :serving_unit, presence: true
end
