import { Dimensions, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container principal
  storiesContainer: {
    marginRight: 16,
    marginLeft: 16,
    marginVertical: 10,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
     shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  storiesContent: {
    paddingHorizontal: 10,
    alignItems: "center",
  },
  
  // Stories
  storyWrapper: {
    alignItems: "center",
    marginRight: 16,
  },
  
  avatarWrapper: {
    position: "relative",
  },
  
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#F5F0E8",
  },
  
  addIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#9b5f2f",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  
  addIconText: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 14,
  },
  
  storyLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#000",
  },
  
  // Posts container
  postsContainer: {
    paddingBottom: 80,
  },
  
  // Post styles
  postContainer: {
    backgroundColor: "#fff",
    marginRight: 16,
    marginLeft: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  
  postContent: {
    flexDirection: "row",
    marginBottom: 12,
    marginLeft: 2,
  },
  
  mediaContainer: {
    position: "relative",
    width: 170,
    height: 200,
    marginRight: 10,
  },
  
  media: {
    marginTop: 0,
    width: 170,
    height: 200,
    borderRadius: 8,
  },

  mediaMetrics: {
  position: "absolute",
  bottom: 0,
  left: 0,
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},
  
  rightContent: {
    flex: 1,
    justifyContent: "flex-start",
    marginLeft: 8,
  },
  
  postHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  
  postAvatar: {
    width: 34,
    height: 34,
    borderRadius: 22,
  },
  
  userName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
  
  verifiedBadge: {
    marginLeft: 4,
    fontSize: 14,
  },
  
  postTime: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  
  postTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: "#000",
    marginBottom: 8,
  },
  
  hashtagContainer: {
    marginBottom: 12,
  },
  
  hashtagText: {
    color: "#1E90FF",
    fontSize: 14,
    fontWeight: "500",
  },
  
  metricsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-start",
    gap: 20,
    marginTop: 28,
  },
  
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 20,
    marginTop: 8,
  },
  
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  
  metricCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
  },
  
  // Comments
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 6,
    padding: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  
  commentContent: {
    flex: 1,
  },
  
  commentName: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 2,
    color: "#000",
  },
  
  comment: {
    fontSize: 14,
    color: "#333",
    lineHeight: 18,
  },
  
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },

  commentContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
},
  
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#f8f9fa",
  },
  
  bottomNav: {
  flexDirection: "row",
  justifyContent: "space-around",
  alignItems: "center",
  backgroundColor: "#F5F0E8",
  paddingVertical: 12,
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 5,
},
  
  navItem: {
    alignItems: "center",
  },
  
  navText: {
    fontSize: 12,
    color: "#333",
  },
  
  // Input container
  inputContainer: {
  backgroundColor: "#F5F0E8",
  padding: 16,
  borderTopWidth: 1,
  borderTopColor: "#eee",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 4,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},
  
  visibilityContainer: {
  flexDirection: "row",
  alignItems: "center",
},

visibilityButton: {
  marginRight: 16,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: "#f2f2f2",
},

visibilityText: {
  fontSize: 13,
  color: "#555",
},
  
  visibilityActive: {
  backgroundColor: "#9b5f2f",
  color: "#fff",
  fontWeight: "600",
  padding: 2,
},
  
  mediaPreviewContainer: {
    marginBottom: 10,
  },
  
  mediaPreviewItem: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  
  previewMedia: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  
  mediaDeleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  deleteCommentButton: {
  position: "absolute",
  right: 0,
  top: 5,
  padding: 5,
},

deleteCommentText: {
  fontSize: 16,
  color: "red",
  fontWeight: "bold",
},

  
  inputRow: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f9f9f9",
  borderRadius: 25,
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderWidth: 1,
  borderColor: "#eee",
},

newPostInput: {
  flex: 1,
  fontSize: 14,
  color: "#333",
  paddingHorizontal: 10,
},

mediaButton: {
  marginLeft: 8,
  backgroundColor: "#f2f2f2",
  borderRadius: 20,
  padding: 8,
},

mediaButtonText: {
  fontSize: 18,
},

newPostButton: {
  marginLeft: 8,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: "#9b5f2f",
  shadowColor: "#000",
  shadowOpacity: 0.15,
  shadowRadius: 4,
  elevation: 3,
},

postButtonText: {
  color: "#fff",
  fontWeight: "600",
  fontSize: 14,
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  width: '100%',
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},
closeButton: {
  position: 'absolute',
  top: 50,
  right: 20,
  zIndex: 1000,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
closeButtonText: {
  color: '#fff',
  fontSize: 24,
  fontWeight: 'bold',
},
modalMediaContainer: {
  width: '100%',
  height: '80%',
},
modalMedia: {
  width: Dimensions.get('window').width,
  height: '100%',
},

// Ajouter ces styles à SocialFeed.styles.ts
modalVideoContainer: {
  width: Dimensions.get('window').width,
  height: '100%',
  justifyContent: 'center',
  alignItems: 'center',
},

videoContainer: {
  position: 'relative',
},

progressContainer: {
  position: 'absolute',
  bottom: 20,
  left: 20,
  right: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 5,
  padding: 10,
},

progressBar: {
  height: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
},

timeContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 5,
},

timeText: {
  color: '#fff',
  fontSize: 12,
},

controlsContainer: {
  position: 'absolute',
  bottom: 80,
  left: 0,
  right: 0,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
},

controlButton: {
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 10,
},

controlButtonText: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
},

customProgressContainer: {
  height: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: 2,
  overflow: 'hidden',
  marginBottom: 5,
},

customProgressBar: {
  height: '100%',
  backgroundColor: '#FF0000',
},

actionsColumn: {
  flexDirection: "column",
  alignItems: "flex-end",
  marginTop: 8,
},

visibilityRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},

cancelButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: "#e7e6e6ff",
},

cancelText: {
  color: "#333",
  fontSize: 18,
  fontWeight: "900",
},

postButton: {
  paddingVertical: 6,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: "#6B4226",
},

postText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "bold",
},

storyAvatarContainer: {
  position: 'relative',
},

unviewedBadge: {
  position: 'absolute',
  top: -2,
  right: -2,
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#E24741',
  borderWidth: 2,
  borderColor: '#E8DCC8',
},
});