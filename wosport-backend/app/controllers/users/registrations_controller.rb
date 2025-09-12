class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  before_action :configure_sign_up_params, only: [:create]

  def create
    build_resource(sign_up_params)
    resource.save
    yield resource if block_given?
    respond_with(resource)
  end

  private

  def configure_sign_up_params
    devise_parameter_sanitizer.permit(:sign_up, keys: [:first_name, :last_name])
  end

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        message: 'Signed up successfully',
        user: {
          id: resource.id,
          email: resource.email,
          first_name: resource.first_name,
          last_name: resource.last_name
        },
        token: request.env['warden-jwt_auth.token']
      }, status: :created
    else
      render json: {
        message: "Sign up failed",
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
end
