class WorkoutsController < ApplicationController
  before_action :authenticate_user!

  def index
    workouts = Workout.all
    render json: workouts.map { |w|
      {
        id: w.id,
        title: w.title,
        duration: w.duration,
        level: w.level,
        video_url: w.video_url
      }
    }
  end

  def show
    workout = Workout.find(params[:id])
    render json: {
      id: workout.id,
      title: workout.title,
      duration: workout.duration,
      level: workout.level,
      video_url: workout.video_url
    }
  end
end
