class UsersController < ApplicationController
  before_action :authenticate_user!, :set_user, only: [:update, :avatar, :show,  :toggle_visibility]

  def update
    if current_user.update(user_params)
      render json: current_user.as_json(
        only: [:id, :first_name, :last_name, :bio, :profile_visibility],
        methods: [:avatar_url]
      )
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def toggle_visibility
    visibility = params[:profile_visibility]

    if User.profile_visibilities.keys.include?(visibility) && current_user.update(profile_visibility: visibility)
      render json: { profile_visibility: current_user.profile_visibility }
    else
      render json: { errors: ['Invalid visibility'] }, status: :unprocessable_content
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.require(:user).permit(:first_name, :email, :bio, :profile_visibility)
  end
end
