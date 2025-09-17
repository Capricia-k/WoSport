# frozen_string_literal: true
require 'net/http'
require 'uri'
require 'json'

class OpenFoodFactsClient
  BASE = 'https://world.openfoodfacts.org'

  FIELDS = %w[product_name brands code nutriments serving_quantity serving_size].freeze

  def self.search(query, page_size: 10)
    uri = URI("#{BASE}/cgi/search.pl")
    params = {
      search_terms: query, search_simple: 1, action: 'process',
      json: 1, page_size: page_size, fields: FIELDS.join(',')
    }
    uri.query = URI.encode_www_form(params)
    json_get(uri)['products'].map { |p| build_item(p) }.compact
  end

  def self.find_by_barcode(code)
    uri = URI("#{BASE}/api/v0/product/#{code}.json")
    p = json_get(uri)['product']
    build_item(p)
  end

  def self.build_item(p)
    return nil unless p
    n = p['nutriments'] || {}

    # OFF donne parfois l’énergie en kJ seulement → convertissons
    kcal_100g = n['energy-kcal_100g'] || (n['energy_100g'] && n['energy_unit'] == 'kJ' ? n['energy_100g'].to_f / 4.184 : nil)

    {
      name: p['product_name'] || 'Produit',
      brand: p['brands'],
      off_barcode: p['code'],
      per_100g: {
        kcal: kcal_100g&.to_f,
        protein_g: n['proteins_100g']&.to_f,
        carbs_g:   n['carbohydrates_100g']&.to_f,
        fat_g:     n['fat_100g']&.to_f,
        fiber_g:   n['fiber_100g']&.to_f,
        sugar_g:   n['sugars_100g']&.to_f,
        sodium_mg: n['sodium_100g'] ? (n['sodium_100g'].to_f * 1000).round : nil
      },
      default_serving_qty: p['serving_quantity']&.to_f, # ex: 30
      default_serving_unit: (p['serving_size'] || 'g').to_s # ex: "30 g"
    }
  end

  def self.json_get(uri)
    res = Net::HTTP.get_response(uri)
    raise "OFF error #{res.code}" unless res.is_a?(Net::HTTPSuccess)
    JSON.parse(res.body)
  end
end
