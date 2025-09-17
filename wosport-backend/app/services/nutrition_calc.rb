class NutritionCalc
  # portion_unit: "g" ou "ml" (si densité inconnue, on traite ml ~ g)
  def self.by_portion(per100, qty:, portion_unit: 'g')
    factor = qty.to_f / 100.0 # base 100g
    {
      kcal:      (per100[:kcal].to_f * factor).round(1),
      protein_g: (per100[:protein_g].to_f * factor).round(1),
      carbs_g:   (per100[:carbs_g].to_f * factor).round(1),
      fat_g:     (per100[:fat_g].to_f * factor).round(1),
      fiber_g:   (per100[:fiber_g].to_f * factor).round(1),
      sugar_g:   (per100[:sugar_g].to_f * factor).round(1),
      sodium_mg: (per100[:sodium_mg].to_f * factor).round
    }
  end
end
