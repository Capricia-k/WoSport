class NutritionProfile < ApplicationRecord
  belongs_to :user

  enum activity_level: { sedentary: 0, light: 1, moderate: 2, active: 3, very_active: 4 }
  enum goal: { lose_weight: 0, maintain: 1, gain_weight: 2 }

  validates :height_cm, :weight_kg, presence: true

  # Âge de l’utilisatrice
  def age
    return nil unless birth_date
    ((Time.zone.today - birth_date) / 365.25).to_i
  end

  # BMR — Formule Mifflin-St Jeor (FEMMES)
  def basal_metabolic_rate
    return nil unless height_cm && weight_kg && age
    10 * weight_kg.to_f + 6.25 * height_cm.to_f - 5 * age - 161
  end

  # TDEE ajusté par activité et objectif
  def compute_targets!
    bmr = basal_metabolic_rate
    factor = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 }[activity_level.to_sym]
    tdee = bmr * factor

    adj = { lose_weight: 0.85, maintain: 1.0, gain_weight: 1.10 }[goal.to_sym]
    self.calorie_target = (tdee * adj).round

    # Macros par défaut (femmes sportives : protéines ↑, lipides stables)
    self.protein_target_g = (calorie_target * 0.30 / 4).round
    self.carbs_target_g   = (calorie_target * 0.40 / 4).round
    self.fat_target_g     = (calorie_target * 0.30 / 9).round
    save!
  end

  # ---- CYCLE MENSTRUEL ----
  def cycle_day
    return nil unless last_period_start && cycle_length
    ((Date.today - last_period_start).to_i % cycle_length) + 1
  end

  def cycle_phase
    return :unknown unless cycle_day
    if cycle_day <= period_length
      :menstrual
    elsif cycle_day <= 13
      :follicular
    elsif cycle_day.between?(14, 15)
      :ovulation
    else
      :luteal
    end
  end

  def adjusted_calorie_target
    return calorie_target unless calorie_target && cycle_phase
    case cycle_phase
    when :menstrual
      (calorie_target * 0.95).round   # -5% énergie
    when :follicular
      calorie_target                  # stable
    when :ovulation
      calorie_target                  # stable
    when :luteal
      (calorie_target * 1.08).round   # +8% besoins
    else
      calorie_target
    end
  end
end
