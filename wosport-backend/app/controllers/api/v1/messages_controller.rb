module Api
  module V1
    class MessagesController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/messages
      def index
        chats = Message
                .where('sender_id = :id OR receiver_id = :id', id: current_user.id)
                .includes(:sender, :receiver)
                .order(created_at: :desc)
                .group_by { |m| m.sender_id == current_user.id ? m.receiver_id : m.sender_id }

        user_ids = chats.keys.compact
        users = User.where(id: user_ids).index_by(&:id)

        render json: chats.map do |user_id, messages|
          other_user = users[user_id]
          last_message = messages.first

          {
            id: user_id || 0,
            first_name: other_user&.first_name.presence || "Utilisateur",
            avatar_url: other_user&.avatar_url,
            last_message: last_message&.content || '',
            last_message_at: last_message&.created_at,
            unread_count: messages.count { |m| m.receiver_id == current_user.id && !m.read }
          }
        end
      end

      # GET /api/v1/messages/:user_id
      def show
        other_user = User.find(params[:user_id])
        messages = conversation_with(other_user).order(:created_at)

        messages.where(receiver_id: current_user.id, read: false).update_all(read: true)

        render json: messages.as_json(
          only: [:id, :sender_id, :receiver_id, :content, :created_at, :read],
          include: { post: { only: [:id, :content], methods: [:image_url] } }
        )
      end

      # POST /api/v1/messages/:user_id
      def create
        other_user = User.find(params[:user_id])
        message = Message.new(
          sender: current_user,
          receiver: other_user,
          content: params[:content],
          post_id: params[:post_id]
        )

        if message.save
          if other_user.expo_push_token.present?
            NotificationService.send_push(
              token: other_user.expo_push_token,
              title: "#{current_user.first_name} t'a envoyé un message",
              body: message.content.present? ? message.content.truncate(50) : "📌 a partagé un post",
              data: { type: "message", sender_id: current_user.id }
            )
          end

          render json: {
            id: message.id,
            content: message.content,
            sender_id: message.sender_id,
            receiver_id: message.receiver_id,
            created_at: message.created_at,
            read: message.read,
            post: message.post.present? ? serialize_post(message.post) : nil
          }, status: :created
        else
          render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/users/:user_id/conversation
      def conversation
        return render json: { error: "Utilisateur non authentifié" }, status: :unauthorized unless current_user

        user_id = params[:user_id] || params[:id]

        if user_id
          specific_conversation(user_id)
        else
          all_conversations
        end
      end

      # DELETE /api/v1/messages/:id
      def destroy
        message = Message.find(params[:id])
        if message.sender_id == current_user.id || message.receiver_id == current_user.id
          message.destroy
          render json: { success: true }
        else
          render json: { error: "Not authorized" }, status: :forbidden
        end
      end

      # GET /api/v1/messages/unread_count
      def unread_count
        count = current_user.received_messages.where(read: false).count
        render json: { unread_count: count }
      end

      private

      def serialize_post(post)
        {
          id: post.id,
          content: post.content,
          photos: post.photos.map { |p| { url: url_for(p) } },
          videos: post.videos.map { |v| { url: rails_blob_url(v, host: request.base_url) } },
          comments_count: post.comments.size,
          encouragements_count: post.encouragements.size,
          user: {
            id: post.user.id,
            first_name: post.user.first_name,
            avatar_url: post.user.avatar_url
          }
        }
      end

      def set_default_host!
        return if Rails.application.routes.default_url_options[:host].present?

        Rails.application.routes.default_url_options[:host] = request.base_url
      end

      def specific_conversation(user_id)
        other_user = User.find(user_id)

        messages = Message.where(
          '(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
          current_user.id, other_user.id, other_user.id, current_user.id
        ).order(created_at: :asc)

        messages.where(receiver_id: current_user.id, read: false).update_all(read: true)

        render json: {
          conversation: messages.map do |m|
            {
              id: m.id,
              sender_id: m.sender_id,
              receiver_id: m.receiver_id,
              content: m.content,
              created_at: m.created_at,
              read: m.read,
              post: m.post.present? ? serialize_post(m.post) : nil
            }
          end,
          other_user: {
            id: other_user.id,
            first_name: other_user.first_name,
            last_name: other_user.last_name,
            avatar_url: other_user.avatar_url
          }
        }
      end

      def all_conversations
        sent_messages = Message.where(sender_id: current_user.id)
        received_messages = Message.where(receiver_id: current_user.id)
        user_ids = (sent_messages.pluck(:receiver_id) + received_messages.pluck(:sender_id)).uniq

        conversations = user_ids.map do |user_id|
          other_user = User.find_by(id: user_id)
          next unless other_user

          all_messages = Message.where(
            '(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',
            current_user.id, user_id, user_id, current_user.id
          ).order(created_at: :desc)

          last_message = all_messages.first
          unread_count = all_messages.where(receiver_id: current_user.id, read: false).count

          {
            id: other_user.id,
            first_name: other_user.first_name,
            last_name: other_user.last_name,
            avatar_url: other_user.avatar_url,
            last_message: last_message&.content || " ",
            last_message_time: last_message&.created_at,
            unread_count: unread_count
          }
        end.compact

        conversations.sort_by! { |conv| conv[:last_message_time] || Time.at(0) }.reverse!
        render json: conversations
      end

      def conversation_with(user)
        Message.where(
          '(sender_id = :me AND receiver_id = :other) OR (sender_id = :other AND receiver_id = :me)',
          me: current_user.id,
          other: user.id
        ).includes(:sender, :receiver, :post)
      end
    end
  end
end
