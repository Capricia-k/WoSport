class Users::SessionsController < Devise::SessionsController
  respond_to :json

  # POST /users/sign_in
  def create
    email = params.dig(:user, :email) || params[:email]
    password = params.dig(:user, :password) || params[:password]

    user = User.find_by(email: email)

    if user && user.valid_password?(password)
      sign_in(:user, user)

      # Génération du token JWT
      token, _payload = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

      render json: {
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          avatar_url: user.avatar_url
        },
        token: token
      }, status: :ok
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  # DELETE /users/sign_out
  def destroy
    if current_user
      # Révocation du JWT
      Warden::JWTAuth::UserDecoder.new.call(request.headers['Authorization'].split.last, :user, nil)
      sign_out(current_user)
      render json: { message: "Logged out successfully" }, status: :ok
    else
      render json: { error: "No active session" }, status: :unauthorized
    end
  end
end
