module Api
  module V1
    class ReactionsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_story

      def index
        puts "Fetching reactions for story: #{params[:story_id]}"
        puts "Current user: #{current_user.id}"

        @story = Story.find_by(id: params[:story_id])
        if @story.nil?
          puts "Story not found!"
          return render json: { error: "Story not found" }, status: :not_found
        end

        puts "Story found: #{@story.id}"
        reactions = @story.reactions.includes(:user)
        puts "Reactions count: #{reactions.count}"

        render json: reactions.map { |r|
          {
            id: r.id,
            reaction_type: r.reaction_type,
            user: {
              id: r.user.id,
              first_name: r.user.first_name,
              avatar_url: r.user.avatar_url
            }
          }
        }
      end

      def create
        reaction = @story.reactions.find_or_initialize_by(user: current_user)
        reaction.reaction_type = params[:reaction_type]

        if reaction.save
          render json: {
            id: reaction.id,
            reaction_type: reaction.reaction_type,
            user: {
              id: current_user.id,
              first_name: current_user.first_name,
              avatar_url: current_user.avatar_url
            }
          }, status: :created
        else
          render json: { errors: reaction.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        reaction = @story.reactions.find_by(user: current_user)
        if reaction&.destroy
          head :no_content
        else
          render json: { error: "Reaction not found" }, status: :not_found
        end
      end

      private

      def set_story
        @story = Story.find(params[:story_id])
      end
    end
  end
end
