class MealLog < ApplicationRecord
  belongs_to :user
  has_many :food_entries, dependent: :destroy

  enum meal_type: { breakfast: 0, lunch: 1, dinner: 2, snack: 3 }
  validates :ate_on, presence: true

  def totals
    food_entries.select('COALESCE(SUM(kcal),0) AS kcal, COALESCE(SUM(protein_g),0) AS protein_g, COALESCE(SUM(carbs_g),0) AS carbs_g, COALESCE(SUM(fat_g),0) AS fat_g').take
  end
end
