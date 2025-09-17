import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input","results","qty","preview"]
  per100 = null
  selected = null

  query = async () => {
    const q = this.inputTarget.value.trim()
    if (!q) { this.resultsTarget.classList.add("hidden"); this.resultsTarget.innerHTML = ""; return }
    const res = await fetch(`/nutrition/search?q=${encodeURIComponent(q)}`)
    const items = await res.json()
    this.resultsTarget.innerHTML = items.map(i => `
      <button type="button" data-name="${i.name}" data-brand="${i.brand||""}" data-barcode="${i.off_barcode||""}"
              data-per100='${JSON.stringify(i.per_100g)}'
              class="w-full text-left px-3 py-2 hover:bg-gray-100">
        <div class="font-medium">${i.name}</div>
        <div class="text-xs text-gray-500">${i.brand||""}</div>
      </button>
    `).join("")
    this.resultsTarget.classList.remove("hidden")
    this.resultsTarget.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => this.pick(btn)))
  }

  pick(btn) {
    this.per100 = JSON.parse(btn.dataset.per100 || "{}")
    this.selected = { name: btn.dataset.name, brand: btn.dataset.brand, barcode: btn.dataset.barcode }
    // Remplir les champs hidden
    const form = this.element.querySelector("form")
    form.querySelector('[name="item[name]"]').value = this.selected.name
    form.querySelector('[name="item[brand]"]').value = this.selected.brand
    form.querySelector('[name="item[off_barcode]"]').value = this.selected.barcode
    // Preview calories
    this.recalc()
    // Fermer la liste
    this.resultsTarget.classList.add("hidden")
    this.resultsTarget.innerHTML = ""
    this.inputTarget.value = this.selected.name
  }

  recalc() {
    if (!this.per100) { this.previewTarget.textContent = "—"; return }
    const qty = parseFloat(this.qtyTarget.value || "0")
    const factor = qty / 100.0
    const kcal = (Number(this.per100.kcal || 0) * factor).toFixed(1)
    const protein = (Number(this.per100.protein_g || 0) * factor).toFixed(1)
    const carbs = (Number(this.per100.carbs_g || 0) * factor).toFixed(1)
    const fat = (Number(this.per100.fat_g || 0) * factor).toFixed(1)
    this.previewTarget.textContent = `${kcal} kcal — P ${protein}g · G ${carbs}g · L ${fat}g`

    const form = this.element.querySelector("form")
    form.querySelector('[name="item[kcal]"]').value = kcal
    form.querySelector('[name="item[protein_g]"]').value = protein
    form.querySelector('[name="item[carbs_g]"]').value = carbs
    form.querySelector('[name="item[fat_g]"]').value = fat
    form.querySelector('[name="item[fiber_g]"]').value = (Number(this.per100.fiber_g || 0)*factor).toFixed(1)
    form.querySelector('[name="item[sugar_g]"]').value = (Number(this.per100.sugar_g || 0)*factor).toFixed(1)
    form.querySelector('[name="item[sodium_mg]"]').value = Math.round(Number(this.per100.sodium_mg || 0)*factor)
  }
}
