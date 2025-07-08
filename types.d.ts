/// <reference path="./index.js" />

export interface RequestOptions {
  method?: string
  headers?: { [key: string]: string }
  body?: any
}

export interface Message {
  id: string
  channelId: string
  type: string
  content?: string | null
  attachments?: any[] | null
  createdBy: User
  editedAt?: string | null
  replyTo?: string | null
  embeds: Embed[]
  emojis?: {
    emojiId?: string
  } | null
  reactions?: Reaction[] | null
  nonce?: string
  createdAt: string
  mentions?: {
    users?: string[]
  } | null
}

export interface Embed {
  title?: string | null
  description?: string | null
  url?: string | null
  color?: number | null
  author?: {
    name?: string
    icon_url?: string
  } | null
  thumbnail?: {
    url?: string
  } | null
  image?: {
    url?: string
  } | null
  footer?: {
    text?: string
    icon_url?: string
  } | null
}

export interface Channel {
  id: string
  type: string
  teamId: string
  name: string
  description?: string | null
  createdBy: string
  parentId?: string | null
  participants?: string[] | null
  priority: number
  nsfw: boolean
  region?: string | null
  createdAt: string
  permissions: {
    role?: {
      roleId?: string
      allow?: number
      deny?: number
    }
  }
  additionalData?: {
    streamChannel?: string | null
    streamPlatform?: string | null
  } | null
}

export interface DM {
  id: string
  users: string[]
  channelId: string
  createdAt: string
  lastMessage: any[]
}

export interface Todo {
  id: string
  channelId: string
  type: string
  content: string
  createdBy: string
  editedBy?: string | null
  editedAt?: string | null
  completed: boolean
  completedBy?: string | null
  completedAt?: string | null
  createdAt: string
}

export interface Application {
  id: string
  type: string
  submittedBy: User
  answers: {
    questionId: string
    answer?: string | any[]
    question: string
    optional: boolean
    options: any[]
  }
  status: string
  createdAt: string
}

export interface Emoji {
  id: string
  name: string
  createdBy: string
  updatedBy?: string | null
  updatedAt?: string | null
  url: string
  createdAt: string
}

export interface Team {
  id: string
  name: string
  profilePicture?: string | null
  banner?: string | null
  description?: string | null
  isVerified: boolean
  isSuspended?: boolean
  createdBy?: string
  defaultChannelId?: string
  games?: any[]
  isDiscoverable?: boolean
  discoverableInvite?: string | null
  createdAt?: string
  memberCount?: number
}

export interface User {
  id: string
  username: string
  subdomain: string
  profilePicture?: string | null
  banner?: string | null
  bot: boolean
  presence: number
  flags: string
  badges: Badge[]
  userStatus?: {
    content?: string | null
    emojiId?: string | null
  }
  userRPC?: {
    type?: string | null
    name?: string | null
    id?: number | null
    startedAt?: string | null
  }
  connections: any[]
  createdAt: string
  system: boolean
}

export interface Badge {
  id: string
  name: string
  icon: string
}

export interface Reaction {
  emojiId?: string
  count?: number
  users?: {
    userId?: string
    timestamp?: string
  }[]
}

export interface Role {
  id: string
  teamId: string
  name: string
  iconUrl?: string | null
  color: string
  color2?: string | null
  permissions: number
  priority: number
  createdAt: string
  updatedAt?: string | null
  isDisplayedSeparately: boolean
  isSelfAssignable?: boolean
  iconEmojiId?: string
  mentionable: boolean
  botScope?: {
    userId?: string
  } | null
}

export interface Webhook {
  id: string
  channelId: string
  teamId: string
  username: string
  profilePicture: string | null
  token: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Blog {
  id: string
  title: string
  content: string
  createdAt: string
  createdBy: string
  editedAt?: string | null
  teamId: string
  heroImage?: string | null
}

export interface Category {
  id: string
  teamId: string
  name: string
  createdBy: string
  priority?: number | null
  permissions: {
    role?: {
      roleId?: string
      allow?: number
      deny?: number
    }
  }
  createdAt: string
  editedAt?: string | null
}

export interface Announcement {
  id: string
  channelId: string
  title: string
  content: string
  createdBy: User
  attachments?: Attachment[]
  emojis?: Emoji[]
  mentions?: {
    users?: string[]
  }
  reactions?: Reaction[]
  createdAt: string
  editedAt?: string | null
}

export interface Attachment {
  url: string
}

export type api = {
	/* Channels */
		/* Update Channel */
  	updateChannel(teamId: string, channelId: string, name: string, additionalData?: {}): Promise<any>
  	updateChannelRolePermissions(teamId: string, channelId: string, roleId: string, allow?: number, deny?: number): Promise<any>
  getChannels(teamId: string): Promise<any>
  createChannel(teamId: string, name: string, type: string, additionalData?: any): Promise<any>
  deleteChannel(teamId: string, channelId: string): Promise<void>
  duplicateChannel(teamId: string, channelId: string): Promise<any>
  updateChannelPriority(teamId: string, channels: any[]): Promise<any>
  getChannel(teamId: string, channelId: string): Promise<any>

  /* Messages */
  getMessages(channelId: string, limit?: number, params?: any): Promise<Message[]>
  sendMessage(channelId: string, message: string, body?: any): Promise<any>
  replyToMessage(channelId: string, repliedMessageId: string, message: string, body?: any): Promise<any>
  editMessage(channelId: string, messageId: string, newMessage: string, body?: any): Promise<any>
  reactToMessage(channelId: string, messageId: string, emojiId: string): Promise<any>
  deleteMessage(channelId: string, messageId: string): Promise<any>
  getMessage(channelId: string, messageId: string): Promise<any>
  
  sendEmbed(channelId: string, content: string, embed?: Embed[] | null): Promise<Message>

  /* Teams */
    /* Members */
	  addRole(teamId: string, userId: string, roleId: string): Promise<any>
	  removeRole(teamId: string, userId: string, roleId: string): Promise<any>
	  kickMember(teamId: string, userId: string): Promise<any>
	  getMember(teamId: string, userId: string): Promise<any>
	  listMembers(teamId: string): Promise<any>
	  /* Bans */
    getBannedUsers(teamId: string): Promise<any>
    unbanUser(teamId: string, userId: string): Promise<void>
    banUser(teamId: string, userId: string, reason?: string | null): Promise<any>
  getTeam(teamId: string): Promise<any>
  updateTeam(teamId: string, name?: string | null, description?: string | null, profilePicture?: string | null, banner?: string | null): Promise<any>
  leaveTeam(teamId: string): Promise<void>
  listTeams(): Promise<any>
  auditLogs(teamId: string, limit?: number): Promise<any>

  /* Roles */
  getRoles(teamId: string): Promise<Role[]>
  createRole(teamId: string, name: string, color: string, permissions?: any, isDisplayedSeparately?: boolean | undefined, color2?: string | null): Promise<Role>
  deleteRole(teamId: string, roleId: string): Promise<any>
  cloneRole(teamId: string, roleId: string): Promise<any>
  updateRolePriority(teamId: string, RoleIds: string[]): Promise<any>
  updateRole(teamId: string, roleId: string, name: string, color: string, permissions?: any, isDisplayedSeparately?: boolean | undefined, color2?: string | null): Promise<any>

  /* Users */
  getUser(userId: string): Promise<User>
  getCurrentUser(): Promise<any>

  /* Custom Status */
  setCustomStatus(content?: string | null, emojiId?: string | null): Promise<any>
  deleteCustomStatus(): Promise<void>

  /* Todos */
  getTodos(channelId: string): Promise<any>
  createTodo(channelId: string, message: string): Promise<any>
  deleteTodo(channelId: string, todoId: string): Promise<any>
  cloneTodo(channelId: string, todoId: string): Promise<any>
  updateTodo(channelId: string, todoId: string, newMessage: string): Promise<any>

  /* DMs */
  getDMs(): Promise<DM[]>
  createDM(userId: string): Promise<any>

  /* Applications */
  getApplications(teamId: string): Promise<any>
  updateApplicationStatus(teamId: string, applicationId: string, status: string): Promise<any>
  updateTeamApplicationStatus(teamId: string, status: string): Promise<any>
  updateApplicationQuestions(teamId: string, description: string, questions: any): Promise<any>
  getApplication(teamId: string, applicationId: string): Promise<any>

  /* Custom Reactions */
  listCustomReactions(teamId: string): Promise<any>
  createCustomReaction(teamId: string, name?: string | null, emoji?: {}): Promise<any>
  updateCustomReaction(teamId: string, reactionId: string, name: string): Promise<any>
  deleteCustomReaction(teamId: string, reactionId: string): Promise<any>

  /* Attachments */
  uploadAttachment(image: any, type: string): Promise<any>

  /* Voice */
  joinVoiceChannel(teamId: string, channelId: string, isMuted?: boolean, isDeafened?: boolean): Promise<any>
  updateVoiceSettings(teamId: string, channelId: string, isMuted?: boolean, isDeafened?: boolean): Promise<any>
  leaveVoiceChannel(teamId: string, channelId: string): Promise<any>

  /* Webhooks */
  sendWebhookMessage(webhookId: string, webhookToken: string, username: string, content: string, embeds?: Embed[] | null): Promise<any>
  webhookForGithub(webhookId: string, webhookToken: string): Promise<any>

  /* Blog */
  getBlogPosts(teamId: string): Promise<any>
  createBlogPost(teamId: string, title: string, content: string, heroImage?: string | null): Promise<any>
  deleteBlogPost(teamId: string, blogId: string): Promise<any>

  /* Category */
  createCategory(teamId: string, name: string): Promise<any>
  updateCategory(teamId: string, categoryId: string, name: string): Promise<any>
  updateCategoryRolePermissions(teamId: string, categoryId: string, roleId: string, allow: boolean, deny?: boolean): Promise<any>
  deleteCategory(teamId: string, categoryId: string): Promise<any>
  addChannelToCategory(teamId: string, categoryId: string, channelId: string): Promise<any>
  removeChannelFromCategory(teamId: string, categoryId: string, channelId: string): Promise<any>
  setChannelPriorityOfCategory(teamId: string, categoryId: string, channels: any[]): Promise<any>
  setCategoryPriorityOfTeam(teamId: string, categories: any[]): Promise<any>

  /* Announcements */
  getAnnouncements(channelId: string): Promise<any>
  createAnnouncement(channelId: string, title: string, content: string, tagEveryone?: boolean): Promise<any>
  deleteAnnouncement(channelId: string, announcementId: string): Promise<any>

  /* Misc. */
  delay(ms: number): Promise<void>
  downloadFileByUrl(url: string, filename: string): Promise<void>
  apiCall<T>(apiPath: string, body?: any, method?: string, options?: RequestOptions): Promise<T>
  id(log?: boolean): void
  update_teamId_and_channelId_withCurrentlyVisible(log?: boolean): void
  getConfig(): Readonly<{ cookie: string, tid: string, teamId: string, cid: string, channelId: string }>
  setConfigCookie(token: string): void
  setConfigTid(teamId: string): void
  setConfigTeamId(teamId: string): void
  setConfigCid(channelId: string): void
  setConfigChannelId(channelId: string): void
}
