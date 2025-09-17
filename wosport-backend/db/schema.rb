# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_09_17_150048) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "comments", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.text "body"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_comments_on_post_id"
    t.index ["user_id"], name: "index_comments_on_user_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "contact_user_id", null: false
    t.string "relation"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "phone_number"
    t.index ["contact_user_id"], name: "index_contacts_on_contact_user_id"
    t.index ["user_id"], name: "index_contacts_on_user_id"
  end

  create_table "cycles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "start_date"
    t.date "end_date"
    t.json "symptoms"
    t.text "notes"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_cycles_on_user_id"
  end

  create_table "encouragements", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "post_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["post_id"], name: "index_encouragements_on_post_id"
    t.index ["user_id"], name: "index_encouragements_on_user_id"
  end

  create_table "follows", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "follower_id", null: false
    t.bigint "followed_id", null: false
    t.index ["followed_id"], name: "index_follows_on_followed_id"
    t.index ["follower_id", "followed_id"], name: "index_follows_on_follower_id_and_followed_id", unique: true
    t.index ["follower_id"], name: "index_follows_on_follower_id"
  end

  create_table "food_entries", force: :cascade do |t|
    t.bigint "meal_log_id", null: false
    t.string "source"
    t.string "external_id"
    t.string "name"
    t.string "brand"
    t.decimal "serving_qty"
    t.string "serving_unit"
    t.decimal "kcal"
    t.decimal "protein_g"
    t.decimal "carbs_g"
    t.decimal "fat_g"
    t.decimal "fiber_g"
    t.decimal "sugar_g"
    t.integer "sodium_mg"
    t.string "off_barcode"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["meal_log_id"], name: "index_food_entries_on_meal_log_id"
  end

  create_table "jwt_denylists", force: :cascade do |t|
    t.string "jti"
    t.datetime "exp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["jti"], name: "index_jwt_denylists_on_jti"
  end

  create_table "meal_logs", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "ate_on"
    t.integer "meal_type"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_meal_logs_on_user_id"
  end

  create_table "messages", force: :cascade do |t|
    t.bigint "sender_id", null: false
    t.bigint "receiver_id", null: false
    t.text "content", null: false
    t.boolean "read", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "post_id"
    t.index ["post_id"], name: "index_messages_on_post_id"
    t.index ["sender_id", "receiver_id"], name: "index_messages_on_sender_id_and_receiver_id"
  end

  create_table "nutrition_profiles", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.date "birth_date"
    t.integer "height_cm"
    t.decimal "weight_kg"
    t.integer "activity_level"
    t.integer "goal"
    t.integer "calorie_target"
    t.integer "protein_target_g"
    t.integer "carbs_target_g"
    t.integer "fat_target_g"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "cycle_length"
    t.integer "period_length"
    t.date "last_period_start"
    t.index ["user_id"], name: "index_nutrition_profiles_on_user_id"
  end

  create_table "positions", force: :cascade do |t|
    t.bigint "session_id", null: false
    t.float "latitude"
    t.float "longitude"
    t.datetime "timestamp"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["session_id"], name: "index_positions_on_session_id"
  end

  create_table "posts", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.text "content"
    t.integer "privacy", default: 0, null: false
    t.integer "comments_count", default: 0, null: false
    t.integer "encouragements_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "visibility", default: "public", null: false
    t.index ["user_id"], name: "index_posts_on_user_id"
  end

  create_table "reactions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "story_id", null: false
    t.bigint "user_id", null: false
    t.integer "reaction_type", null: false
    t.index ["story_id", "user_id"], name: "index_reactions_on_story_id_and_user_id", unique: true
    t.index ["story_id"], name: "index_reactions_on_story_id"
    t.index ["user_id"], name: "index_reactions_on_user_id"
  end

  create_table "saved_videos", force: :cascade do |t|
    t.string "title"
    t.string "video_url"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_saved_videos_on_user_id"
  end

  create_table "sessions", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.datetime "start_time"
    t.datetime "end_time"
    t.float "distance"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "sos_alerts", force: :cascade do |t|
    t.string "message"
    t.float "latitude"
    t.float "longitude"
    t.string "google_maps_url"
    t.string "apple_maps_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_sos_alerts_on_user_id"
  end

  create_table "stories", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.datetime "expires_at"
    t.index ["user_id"], name: "index_stories_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "first_name"
    t.string "avatar_url"
    t.string "last_name"
    t.integer "profile_visibility"
    t.text "bio"
    t.string "expo_push_token"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "videos", force: :cascade do |t|
    t.string "title"
    t.string "video_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "thumbnail_url"
  end

  create_table "workouts", force: :cascade do |t|
    t.string "title"
    t.integer "duration"
    t.string "level"
    t.string "video_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "category"
    t.string "thumbnail_url"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "comments", "posts"
  add_foreign_key "comments", "users"
  add_foreign_key "contacts", "users"
  add_foreign_key "contacts", "users", column: "contact_user_id"
  add_foreign_key "cycles", "users"
  add_foreign_key "encouragements", "posts"
  add_foreign_key "encouragements", "users"
  add_foreign_key "follows", "users", column: "followed_id"
  add_foreign_key "follows", "users", column: "follower_id"
  add_foreign_key "food_entries", "meal_logs"
  add_foreign_key "meal_logs", "users"
  add_foreign_key "messages", "posts"
  add_foreign_key "messages", "users", column: "receiver_id"
  add_foreign_key "messages", "users", column: "sender_id"
  add_foreign_key "nutrition_profiles", "users"
  add_foreign_key "positions", "sessions"
  add_foreign_key "posts", "users"
  add_foreign_key "reactions", "stories"
  add_foreign_key "reactions", "users"
  add_foreign_key "saved_videos", "users"
  add_foreign_key "sessions", "users"
  add_foreign_key "sos_alerts", "users"
  add_foreign_key "stories", "users"
end
