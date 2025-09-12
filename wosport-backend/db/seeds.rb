# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

# db/seeds.rb
Workout.destroy_all

workouts = [
  { title: 'Relaxation', category: 'Relaxation', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127344/Relaxation_arux9s.mp4', duration: 13, level: 'Easy' },
  { title: 'Fitness', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127350/Fitness_j7taff.mp4', duration: 15, level: 'Hard' },
  { title: '10 Minute ABS', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127349/10_Minute_ABS_h2svum.mp4', duration: 11, level: 'Mid-Level' },
  { title: '13 min Full Body', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127350/13_min_Full_Body_iiivoy.mp4', duration: 5, level: 'Easy' },
  { title: 'Home Workout', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127349/14_Days___Home_Workout_tmraio.mp4', duration: 10, level: 'Mid-Level' },
  { title: '10 min Workout', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127343/10_min_Workout_urof4r.mp4', duration: 11, level: 'Mid-Level' },
  { title: 'Ab Workout', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127356/Ab_Workout_d4jms1.mp4', duration: 13, level: 'Easy' },
  { title: 'Deep Core', category: 'HIIT', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127356/Deep_Core_kbdpw6.mp4', duration: 8, level: 'Hard' },
  { title: 'Full Body Yoga', category: 'Relaxation', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127344/Full_Body_Yoga_weouwu.mp4', duration: 25, level: 'Mid-Level' },
  { title: 'HIIT', category: 'HIIT', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127353/HIIT_s1lh5y.mp4', duration: 13, level: 'Hard' },
  { title: 'Home Pilates', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127347/Home_Pilates_i7cis1.mp4', duration: 8, level: 'Mid-Level' },
  { title: 'Lower Belly', category: 'Fitness', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127347/lower_belly_c0rvzw.mp4', duration: 13, level: 'Hard' },
  { title: 'Pilates Calming', category: 'Relaxation', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127354/PilatesCalming_mwgnsq.mp4', duration: 15, level: 'Easy' },
  { title: 'Stretch Routine', category: 'Relaxation', video_url: 'https://res.cloudinary.com/dx16ewfq2/video/upload/v1756127355/Stretch_Routine_cuat6j.mp4', duration: 8, level: 'Easy' }
]

workouts.each do |data|
  # Générer un thumbnail à partir de la vidéo avec Cloudinary (frame à 3s)
  public_id = data[:video_url].split('/').last.split('.').first
  thumbnail_url = "https://res.cloudinary.com/dx16ewfq2/video/upload/so_5,w_300,h_200,c_fill/#{public_id}.jpg"

  workout = Workout.create!(
    title: data[:title],
    category: data[:category],
    duration: data[:duration],
    level: data[:level],
    video_url: data[:video_url],
    thumbnail_url: thumbnail_url
  )

  puts "✅ Créé #{workout.title} avec vidéo : #{data[:video_url]} et thumbnail : #{thumbnail_url}"
end

puts "🎬 Tous les workouts ont été seedés avec thumbnails !"

# --------------- SOCIAL--------------------------
user = User.find_or_create_by!(email: "rebecca@gmail.com") do |u|
  u.password = "1234567"
  u.first_name = "Rebecca"
end

post = Post.find_or_create_by!(user: user, content: "Mon premier post WoSport 💪")

Comment.find_or_create_by!(post: post, user: user, body: "Bravo !")

Encouragement.find_or_create_by!(post: post, user: user)

puts "✅ Utilisateur, post, commentaire et encouragement créés pour tester le feed"
