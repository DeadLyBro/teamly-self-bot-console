const WebSocket = require('ws'); // Websocket bağlantımız

// Bot ayarları
const token = 'api_xxx';      // Bot Kimliği (Tokeni) İsterseniz env kullanabilirsiniz
const prefix = '!';           // Diğer botlarla karışmamak için ön ek (değiştirmeniz önerilir)
const adminId = '1234567890'; // Buraya kendi ID'nizi girip daha sonra isterseniz kullanabilirsiniz

let bot;
let reconnectInterval = 500;

function createWebSocket() {
  const newWs = new WebSocket('wss://api.teamly.one/api/v1/ws', {
    headers: {
      Authorization: `Bot ${token}`
    }
  });
  return newWs;
}

ws = createWebSocket();

ws.on('open', async function open() {
  console.log('Connected to Teamly');
  
  const heartbeatInterval = setInterval(() => {
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ t: "HEARTBEAT", d: {} }));
    }
  }, 20000);
  
  ws.on('close', () => clearInterval(heartbeatInterval));
});

ws.on('error', (error) => {
  console.error('WebSocket hatası:', error);
});

ws.on('close', (event) => {
  console.log(`WebSocket bağlantısı kapandı: ${event.reason}`);
  console.log('Bağlantı kapandı, yeniden bağlanmaya çalışılıyor...');
  
  setTimeout(() => {
    ws = createWebSocket();
    
  }, reconnectInterval);
});

function closeWebSocket() {
  setTimeout(() => {
    if (ws && ws.readyState === ws.OPEN) {
      ws.close();
    }
  }, 500);
}

process.on('SIGINT', function() {
  closeWebSocket();
  setTimeout(() => {
    process.exit();
  }, 1000);
});

/** @type {import('./types').api['delay']} */
var delay = ms => new Promise(res => setTimeout(res, ms));
// prettier-ignore
var qs = obj => Object.entries(obj).map(([k, v]) => `${k}=${v}`).join('&');

/** @type {import('./types').api['apiCall']} */
var apiCall = (apiPath, body, method = 'GET', options = {}) => {
	const fetchOptions = {
	  body: body ? body : undefined,
	  method,
	  headers: {
		Accept: '*/*',
		'Accept-Language': 'tr',
		'Authorization': `Bot ${token}`,
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
			const contentType = res.headers.get("Content-Type");
			if (contentType && contentType.includes("application/json")) {
				return res.json(); // JSON ise çözümle
			} else {
				return res.text(); // değilse metni döndür
			}
		}
		throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
	})
	.catch(err => {
		console.error(err);
		throw new Error('An error occurred while fetching the API.');
	});
}

/** @type {import('./types').api} */
var api = {
    /* Channels */
	/* Update Channel */
	updateChannel: (teamId, channelId, name, additionalData = undefined) => apiCall(`/teams/${teamId}/channels/${channelId}`, { name, additionalData }, "PATCH"),
	updateChannelRolePermissions: (teamId, channelId, roleId, allow = 0, deny = 0) => apiCall(`/teams/${teamId}/channels/${channelId}/permissions/role/${roleId}`, { allow, deny }, "POST"),
    getChannels: (teamId) => apiCall(`/teams/${teamId}/channels`),
    createChannel: (teamId, name, type = "text", additionalData = { streamChannel: undefined, streamPlatform: undefined }) => apiCall(`/teams/${teamId}/channels`, { name, type, additionalData }, "PUT"),
    deleteChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}`, undefined, "DELETE"),
    duplicateChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}/clone`, undefined, "POST"),
    updateChannelPriority: (teamId, channels) => apiCall(`/teams/${teamId}/channelspriority`, channels, "PUT"),
    /* getChannel: channelId => apiCall(`/teams/${teamId}/channels/${channelId}`), */

    /* Messages */
    getMessages: (channelId, limit = 50, params = {}) => apiCall(`/channels/${channelId}/messages?limit=${limit ?? 50}&${qs(params)}`),
    sendMessage: (channelId, message, body = {}) => apiCall(`/channels/${channelId}/messages`, { content: message, ...body }, "POST"),
    replyToMessage: (channelId, repliedMessageId, message, body = {}) => apiCall(`/channels/${channelId}/messages`, { content: message, replyTo: repliedMessageId, ...body }, "POST"),
    editMessage: (channelId, messageId, newMessage, body = {}) => apiCall(`/channels/${channelId}/messages/${messageId}`, { content: newMessage, ...body }, "PATCH"),
	  reactToMessage: (channelId, messageId, emojiId) => apiCall(`/channels/${channelId}/messages/${messageId}/reactions/${emojiId}`, undefined, "POST"),
    deleteMessage: (channelId, messageId) => apiCall(`/channels/${channelId}/messages/${messageId}`, undefined, "DELETE"),

    /* typing: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}/typing`, undefined, 'POST'), */ // Just works with WebSocket event

    // Use this generator: https://discord.club/dashboard
    // Click `+` at the bottom in the embed section then copy the `embed` key in the JSON output.
    // Does not work with user account!
    sendEmbed: (channelId, content = "‏", embeds = [
        {
          title: "Title",
          description: "Description",
          color: 0x00ff00,
          author: { name: undefined, icon_url: undefined },
          thumbnail: { url: null },
          image: { url: undefined },
          footer: { text: undefined, icon_url: undefined },
        },
      ]) => apiCall(`/channels/${channelId}/messages`, { content, embeds }, "POST"),

    /* Teams */
	/* Members */
	addRole: (teamId, userId, roleId) => apiCall(`/teams/${teamId}/members/${userId}/roles/${roleId}`, undefined, "POST"),
	removeRole: (teamId, userId, roleId) => apiCall(`/teams/${teamId}/members/${userId}/roles/${roleId}`, undefined, "DELETE"),
	kickMember: (teamId, userId) => apiCall(`/teams/${teamId}/members/${userId}`, undefined, "DELETE"),
	getMember: (teamId, userId) => apiCall(`/teams/${teamId}/members/${userId}`),
	listMembers: (teamId) => apiCall(`/teams/${teamId}/members`),
    getTeam: (teamId) => apiCall(`/teams/${teamId}/details`),
    updateTeam: (teamId, name = undefined, description = undefined, profilePicture = undefined, banner = undefined) => apiCall(`/teams/${teamId}`, { name, description, profilePicture, banner }, "POST"),
    listTeams: () => apiCall(`/teams`),

    /* Roles */
    getRoles: (teamId) => apiCall(`/teams/${teamId}/roles`),
    createRole: (teamId, name, color, permissions = undefined, isDisplayedSeparately = false, color2 = undefined) => apiCall(`/teams/${teamId}/roles`, { name, color, permissions, isDisplayedSeparately, color2 },"POST"),
    deleteRole: (teamId, roleId) => apiCall(`/teams/${teamId}/roles/${roleId}`, undefined, "DELETE"),
    cloneRole: (teamId, roleId) => apiCall(`/teams/${teamId}/roles/${roleId}/clone`, undefined, "POST"),
    updateRolePriority: (teamId, multipleRoleIds) => apiCall(`/teams/${teamId}/roles-priority`, [multipleRoleIds], "PATCH"),
    updateRole: (teamId, roleId, name, color, permissions = undefined, isDisplayedSeparately = false, color2 = undefined) => apiCall(`/teams/${teamId}/roles/${roleId}`, { name, color, permissions, isDisplayedSeparately, color2 }, "PATCH"),

    /* Users */
    getUser: (userId) => apiCall(`/users/${userId}`),
    getCurrentUser: () => apiCall(`/me`),

    /* Custom Status */
    setCustomStatus: (content = undefined, emojiId = undefined) => apiCall(`/me/status`, { content, emojiId }, "POST"),
    deleteCustomStatus: () => apiCall(`/me/status`, undefined, "DELETE"),

    /* Todos */
    getTodos: (channelId) => apiCall(`/channels/${channelId}/todo/list`),
    createTodo: (channelId, message) => apiCall(`/channels/${channelId}/todo/item`, { content: message }, "POST"),
    deleteTodo: (channelId, todoId) => apiCall( `/channels/${channelId}/todo/item/${todoId}`, undefined, "DELETE"),
    cloneTodo: (channelId, todoId) => apiCall(`/channels/${channelId}/todo/item/${todoId}/clone`, undefined, "POST"),
    updateTodo: (channelId, todoId, newMessage) => apiCall(`/channels/${channelId}/todo/item/${todoId}`, { content: newMessage }, "PUT"),

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
    createCustomReaction: (teamId, name = undefined, emoji = {}) => {
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
    deleteCustomReaction: (teamId, reactionId) => apiCall(`/teams/${teamId}/reactions/${reactionId}`, undefined, "DELETE"),

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

    /* Voice :: Ses kısmı çalışmıyor, neden bilmiyorum. */
    /*
    joinVoiceChannel: (teamId, channelId, isMuted, isDeafened) => apiCall(`/teams/${teamId}/channels/${channelId}/join?isMuted=${isMuted ?? false}&isDeafened=${isDeafened ?? false}`),
    updateVoiceSettings: (teamId, channelId, isMuted, isDeafened) => apiCall(`/teams/${teamId}/channels/${channelId}/metadata`, { isMuted, isDeafened }, 'POST'),
    leaveVoiceChannel: (teamId, channelId) => apiCall(`/teams/${teamId}/channels/${channelId}/leave`),
    */

    /* Webhooks */
    sendWebhookMessage: (webhookId, webhookToken, username, content = "Demo message.", embeds = undefined) => apiCall(`/webhooks/${webhookId}/${webhookToken}`, { username, content, embeds }, "POST"),
    webhookForGithub: (webhookId, webhookToken) => apiCall(`/webhooks/${webhookId}/${webhookToken}/github`, undefined, "POST"),

    /* Blog */
    getBlogPosts: (teamId) => apiCall(`/teams/${teamId}/blogs`),
    createBlogPost: (teamId, title, content, heroImage = undefined) => apiCall(`/teams/${teamId}/blogs`, { title, content, heroImage }, "POST"),
    deleteBlogPost: (teamId, blogId) => apiCall(`/teams/${teamId}/blogs/${blogId}`, undefined, "DELETE"),

    /* Category */
    createCategory: (teamId, name) => apiCall(`/teams/${teamId}/categories`, { name }, "POST"),
    updateCategory: (teamId, categoryId, name) => apiCall(`/teams/${teamId}/categories/${categoryId}`, { name }, "PUT"),
    updateCategoryRolePermissions: (teamId, categoryId, roleId, allow, deny = undefined) => apiCall( `/teams/${teamId}/categories/${categoryId}/permissions/role/${roleId}`, { allow, deny }, "POST"),
    deleteCategory: (teamId, categoryId) => apiCall(`/teams/${teamId}/categories/${categoryId}`, undefined, "DELETE"),
    addChannelToCategory: (teamId, categoryId, channelId) => apiCall(`/teams/${teamId}/categories/${categoryId}/channels/${channelId}`, undefined, "POST"),
    removeChannelFromCategory: (teamId, categoryId, channelId) => apiCall(`/teams/${teamId}/categories/${categoryId}/channels/${channelId}`, undefined, "DELETE"),
    setChannelPriorityOfCategory: (teamId, categoryId, channels) => apiCall(`/teams/${teamId}/categories/${categoryId}/channels-priority`, { channels }, "POST"),
    setCategoryPriorityOfTeam: (teamId, categories) => apiCall(`/teams/${teamId}/categories-priority`, { categories }, "POST"),

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
      Object.freeze({ token, teamId: tid, channelId: cid, tid, cid }),
    setConfigToken: newToken => (token = newToken),
    setConfigTid: (id) => (tid = id),
    setConfigTeamId: (id) => (tid = id),
    setConfigCid: (id) => (cid = id),
    setConfigChannelId: (id) => (cid = id),
};

ws.on('message', async function incoming(data) {
    const dataObj = JSON.parse(data);
    const {t: eventName, d: eventData} = dataObj;

    if(eventName === "READY") { // https://docs.teamly.one/welcome-message-796453m0
        bot = eventData.user;
    }

    if(eventName === "MESSAGE_SEND") {
        const {message, channelId, channelType, teamId} = eventData;

        if((message.content)?.toLowerCase() === prefix + "ping") {
        	let reply = await api.replyToMessage(channelId, message.id, `Pong <@${message.createdBy.id}>! Gecikme ölçülüyor...`)

          let ping = Date.parse(reply.message.createdAt) - Date.parse(message.createdAt);
          api.editMessage(channelId, reply.message.id, null, {
            embeds: [
              {
                title: '🏓 Pong!',
                description: `Yanıt sürem: **${ping}ms**`,
                color: 0x00FF00
              }
            ]
          });	
        } // Ping komutu

        // İstediğiniz kodu buraya ekleyebilirsiniz

    } // Bir kullanıcı mesaj gönderdiğinde
});


