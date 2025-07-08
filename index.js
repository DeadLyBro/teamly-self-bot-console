// @ts-check
/// <reference path="./types.d.ts" />

// https://github.com/DeadLyBro/teamly-self-bot-console

{
  var tid = '' // Current team id
  var cid = '' // Current channel id
  var cookie = 'signed_session=...' // Cookie (E.g: 'signed_session=your_encrypted_login_session')

  // Call this to update `cid` and `tid` to current channel and team id
  var update_teamId_and_channelId_withCurrentlyVisible = (log = true) => {
    tid = window.location.href.split('/').slice(4)[0]
    cid = window.location.href.split('/').slice(4)[2]
    if (log) {
      console.log(`\`tid\` was set to the team id you are currently looking at (${tid})`)
      console.log(`\`cid\` was set to the channel id you are currently looking at (${cid})`)
    }
  }
  var id = update_teamId_and_channelId_withCurrentlyVisible

  /** @type {import('./types').api['delay']} */
  var delay = ms => new Promise(res => setTimeout(res, ms))
  // prettier-ignore
  var qs = obj => Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('&')

  /** @type {import('./types').api['apiCall']} */
  var apiCall = (apiPath, body, method = 'GET', options = {}) => {
    if (!cookie) throw new Error("Cookie is missing. Did you forget to set it? `cookie = 'your_cookie'`")

    const fetchOptions = {
      body: body ? body : undefined,
      method,
      headers: {
        Accept: '*/*',
        'Accept-Language': 'tr',
        Cookie: cookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Teamly/0.0.21-beta Chrome/130.0.6723.137 Electron/33.2.1 Safari/537.36',
      },
      ...options,
    }
    const isFormData = body?.constructor?.name === 'FormData'
    if (!isFormData) {
      fetchOptions.headers['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(body)
    }
    return fetch(`https://api.teamly.one/api/v1${apiPath}`, fetchOptions)
      .then(res => {
        if (res.ok) {
          const contentType = res.headers.get('Content-Type')
          if (contentType && contentType.includes('application/json')) {
            return res.json() // JSON ise çözümle
          } else {
            return res.text() // JSON değilse metin al
          }
        }
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`)
      })
      .catch(err => {
        console.error(err)
        throw new Error('An error occurred while fetching the API.')
      })
  }

  /** @type {import('./types').api} */
  var api = {
    /* Channels */
      /* Update Channel */
      updateChannel: (teamId, channelId, name, additionalData = {}) => apiCall(`/teams/${teamId}/channels/${channelId}`, { name, additionalData }, "PATCH"),
      updateChannelRolePermissions: (teamId, channelId, roleId, allow = 0, deny = 0) => apiCall(`/teams/${teamId}/channels/${channelId}/permissions/role/${roleId}`, { allow, deny }, "POST"),
    getChannels: (teamId) => apiCall(`/teams/${teamId}/channels`),
    createChannel: (teamId, name, type = "text", additionalData = { streamChannel: null, streamPlatform: null }) => apiCall(`/teams/${teamId}/channels`, { name, type, additionalData }, "PUT"),
    deleteChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}`, null, "DELETE"),
    duplicateChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}/clone`, null, "POST"),
    updateChannelPriority: (teamId, channels) => apiCall(`/teams/${teamId}/channelspriority`, channels, "PUT"),
    getChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}`),

    /* Messages */
    getMessages: (channelId, limit = 50, params = {}) => apiCall(`/channels/${channelId}/messages?limit=${limit}&${qs(params)}`),
    sendMessage: (channelId, message, body = {}) => apiCall(`/channels/${channelId}/messages`, { content: message, ...body }, "POST"),
    replyToMessage: (channelId, repliedMessageId, message, body = {}) => apiCall(`/channels/${channelId}/messages`, { content: message, replyTo: repliedMessageId, ...body }, "POST"),
    editMessage: (channelId, messageId, newMessage, body = {}) => apiCall(`/channels/${channelId}/messages/${messageId}`, { content: newMessage, ...body }, "PATCH"),
    reactToMessage: (channelId, messageId, emojiId) => apiCall(`/channels/${channelId}/messages/${messageId}/reactions/${emojiId}`, null ,"POST"),
    deleteMessage: (channelId, messageId) => apiCall(`/channels/${channelId}/messages/${messageId}`, null, "DELETE"),
    getMessage: (channelId, messageId) => apiCall(`/channels/${channelId}/messages/${messageId}`),

    // Not implemented yet, you can just get typing with websocket event: CHANNEL_TYPING
    /* typing: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}/typing`, null, 'POST'), */

    // Use this generator: https://discord.club/dashboard
    // Click `+` at the bottom in the embed section then copy the `embed` key in the JSON output.
    // You can try but it does not work with user account!
    sendEmbed: (channelId, content = 'Teamly da best!', embeds = [{ title: "Title", description: "Description", color: 0x00ff00 }]) => apiCall(`/channels/${channelId}/messages`, { content, embeds }, "POST"),

    /* Teams */
      /* Members */
      addRole: (teamId, userId, roleId) => apiCall(`/teams/${teamId}/members/${userId}/roles/${roleId}`, null, "POST"),
      removeRole: (teamId, userId, roleId) => apiCall(`/teams/${teamId}/members/${userId}/roles/${roleId}`, null, "DELETE"),
      kickMember: (teamId, userId) => apiCall(`/teams/${teamId}/members/${userId}`, null, "DELETE"),
      getMember: (teamId, userId) => apiCall(`/teams/${teamId}/members/${userId}`),
      listMembers: (teamId) => apiCall(`/teams/${teamId}/members`),
      /* Bans */
      getBannedUsers: teamId => apiCall(`/teams/${teamId}/bans`),
      unbanUser: (teamId, userId) => apiCall(`/teams/${teamId}/members/${userId}/ban`, null, 'DELETE'),
      banUser: (teamId, userId, reason = '') => apiCall(`/teams/${teamId}/members/${userId}/ban`, { reason }, 'POST'),
    getTeam: (teamId) => apiCall(`/teams/${teamId}/details`),
    updateTeam: (teamId, name = null, description = null, profilePicture = null, banner = null) => apiCall(`/teams/${teamId}`, { name, description, profilePicture, banner }, "POST"),
    leaveTeam: teamId => apiCall(`/teams`, { id: teamId }, 'DELETE'),
    listTeams: () => apiCall(`/teams`),
    auditLogs: (teamId, limit = 50) => apiCall(`/teams/${teamId}/audit-logs?limit=${limit}`),

    /* Roles */
    createRole: (teamId, name, color, isDisplayedSeparately = false, permissions = undefined, color2 = null) => apiCall(`/teams/${teamId}/roles`, { name, permissions, color, color2, isDisplayedSeparately },"POST"),
    getRoles: teamId => apiCall(`/teams/${teamId}/roles`),
    deleteRole: (teamId, roleId) => apiCall(`/teams/${teamId}/roles/${roleId}`, null, "DELETE"),
    cloneRole: (teamId, roleId) => apiCall(`/teams/${teamId}/roles/${roleId}/clone`, null, "POST"),
    updateRolePriority: (teamId, roleIds = []) => apiCall(`/teams/${teamId}/roles-priority`, roleIds, "PATCH"),
    updateRole: (teamId, roleId, name, color, isDisplayedSeparately = false, permissions = undefined, color2 = null) => apiCall(`/teams/${teamId}/roles/${roleId}`, { name, permissions, color, color2, isDisplayedSeparately }, "PATCH"),

    /* Users */
    getUser: userId => apiCall(`/users/${userId}`),
    getCurrentUser: () => apiCall(`/me`),

    /* Custom Status */
    setCustomStatus: (content = 'DeadLyBro\'dan selamlar!', emojiId = '🍃') => apiCall(`/me/status`, { content, emojiId }, "POST"),
    deleteCustomStatus: () => apiCall(`/me/status`, null, "DELETE"),

    /* Todos */
    getTodos: (channelId) => apiCall(`/channels/${channelId}/todo/list`),
    createTodo: (channelId, message) => apiCall(`/channels/${channelId}/todo/item`, { content: message }, "POST"),
    deleteTodo: (channelId, todoId) => apiCall( `/channels/${channelId}/todo/item/${todoId}`, null, "DELETE"),
    cloneTodo: (channelId, todoId) => apiCall(`/channels/${channelId}/todo/item/${todoId}/clone`, null, "POST"),
    updateTodo: (channelId, todoId, content) => apiCall(`/channels/${channelId}/todo/item/${todoId}`, { content }, "PUT"),

    /* DMs */
    getDMs: () => apiCall(`/me/chats`),
    createDM: (userId) => apiCall(`/me/chats`, { users: [{ id: userId }] }, "POST"),

    /* Applications */
    getApplications: (teamId) => apiCall(`/teams/${teamId}/applications`),
    updateApplicationStatus: (teamId, applicationId, status) => apiCall(`/teams/${teamId}/applications/${applicationId}`, { status }, "POST"),
    updateTeamApplicationStatus: (teamId, status) => apiCall(`/teams/${teamId}/applications/status`, { status }, "POST"),
    updateApplicationQuestions: (teamId, description, questions = { question: "", type: "" }) => apiCall(`/teams/${teamId}/applications`, { description, questions }, "PATCH"),
    getApplication: (teamId, applicationId) => apiCall(`/teams/${teamId}/applications/${applicationId}`),

    /* Custom Reactions */
    listCustomReactions: (teamId) => apiCall(`/teams/${teamId}/reactions`),
    createCustomReaction: (teamId, name = null, emoji = {}) => {
      const formData = new FormData();
      formData.append(
      "payload_json",
      JSON.stringify({
        name,
        ...(emoji || {}),
      })
      );
      return apiCall(`/teams/${teamId}/reactions`, formData, "POST");
    },
    updateCustomReaction: (teamId, reactionId, name) => apiCall(`/teams/${teamId}/reactions/${reactionId}`, { name: name }, "PUT"),
    deleteCustomReaction: (teamId, reactionId) => apiCall(`/teams/${teamId}/reactions/${reactionId}`, null, "DELETE"),

    /* Attachments */
    uploadAttachment: (image, type) => {
      const formData = new FormData();
      formData.append("file", image);
      formData.append(
      "payload_json",
      JSON.stringify({
        type,
      })
      );
      return apiCall(`/upload`, formData, "POST");
    },

    /* Voice [May be have bug!] */
    joinVoiceChannel: (teamId, channelId, isMuted = false, isDeafened = false) => apiCall(`/teams/${teamId}/channels/${channelId}/join?isMuted=${isMuted}&isDeafened=${isDeafened}`),
    updateVoiceSettings: (teamId, channelId, isMuted, isDeafened) => apiCall(`/teams/${teamId}/channels/${channelId}/metadata`, { isMuted, isDeafened }, 'POST'),
    leaveVoiceChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}/leave`),

    /* Webhooks */
    sendWebhookMessage: (webhookId, webhookToken, username, content = "Demo message.", embeds = [{ title: "Demo Embed", description: "This is a demo embed message sent via webhook.", color: 0x00ff00, }]) => apiCall(`/webhooks/${webhookId}/${webhookToken}`, { username, content, embeds }, "POST"),
    webhookForGithub: (webhookId, webhookToken) => apiCall(`/webhooks/${webhookId}/${webhookToken}/github`, null, "POST"),

    /* Blog */
    getBlogPosts: (teamId) => apiCall(`/teams/${teamId}/blogs`),
    createBlogPost: (teamId, title, content, heroImage = null) => apiCall(`/teams/${teamId}/blogs`, { title, content, heroImage }, "POST"),
    deleteBlogPost: (teamId, blogId) => apiCall(`/teams/${teamId}/blogs/${blogId}`, null, "DELETE"),

    /* Category */
    createCategory: (teamId, name) => apiCall(`/teams/${teamId}/categories`, { name }, "POST"),
    updateCategory: (teamId, categoryId, name) => apiCall(`/teams/${teamId}/categories/${categoryId}`, { name }, "PUT"),
    updateCategoryRolePermissions: (teamId, categoryId, roleId, allow, deny = undefined) => apiCall( `/teams/${teamId}/categories/${categoryId}/permissions/role/${roleId}`, { allow, deny }, "POST"),
    deleteCategory: (teamId, categoryId) => apiCall(`/teams/${teamId}/categories/${categoryId}`, null, "DELETE"),
    addChannelToCategory: (teamId, categoryId, channelId) => apiCall(`/teams/${teamId}/categories/${categoryId}/channels/${channelId}`, null, "POST"),
    removeChannelFromCategory: (teamId, categoryId, channelId) => apiCall(`/teams/${teamId}/categories/${categoryId}/channels/${channelId}`, null, "DELETE"),
    setChannelPriorityOfCategory: (teamId, categoryId, channels) => apiCall(`/teams/${teamId}/categories/${categoryId}/channels-priority`, { channels }, "POST"),
    setCategoryPriorityOfTeam: (teamId, categories) => apiCall(`/teams/${teamId}/categories-priority`, { categories }, "POST"),

    /* Announcements */
    getAnnouncements: channelId => apiCall(`/channels/${channelId}/announcements`),
    createAnnouncement: (channelId, title, content, tagEveryone = false) => apiCall(`/channels/${channelId}/announcements`, { title, content, tagEveryone }, 'POST'),
    deleteAnnouncement: (channelId, announcementId) => apiCall(`/channels/${channelId}/announcements/${announcementId}`, null, 'DELETE'),

    /* Misc. */
    delay,
    downloadFileByUrl: (url, filename) =>
      fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch(console.error),
    apiCall,
    id,
    update_teamId_and_channelId_withCurrentlyVisible,
    getConfig: () =>
      Object.freeze({ cookie, teamId: tid, channelId: cid, tid, cid }),
    setConfigCookie: (token) => (cookie = token),
    setConfigTid: (id) => (tid = id),
    setConfigTeamId: (id) => (tid = id),
    setConfigCid: (id) => (cid = id),
    setConfigChannelId: (id) => (cid = id),
  };

  console.log('\n\n\n\nSelfbot loaded! Use it like this: `await api.someFunction()`')
  console.log('Abusing this could get you banned from Teamly, use at your own risk!')
  console.log()
  console.log('This script does **not** work with bot accounts! ' + 'If you have a bot account, use forbots.js file with NodeJS!')
  console.log()
  console.log('Use the `id()` function to update the variable `tid` team id and `cid` channel id to what you are currently watching.')
  console.log('https://github.com/DeadLyBro/teamly-self-bot-console')

  id(false)

  // Do not replace configuration when reusing script in same context
  // @ts-ignore

  if (!module) {
    // Allow pasting this script in the console
    // @ts-ignore
    var module = {}
  }
  module.exports = {
    api,
    id,
    delay,
    update_teamId_and_channelId_withCurrentlyVisible,
  }
}
