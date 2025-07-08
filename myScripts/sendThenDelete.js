// @ts-check
const { api } = require('../index.js')

// Copy paste the below code inside the Browser Console
;(async () => {
  const userInfo = (await api.getCurrentUser()).user;

  api.update_teamId_and_channelId_withCurrentlyVisible();
  let channelId = api.getConfig().channelId;

  // Send a message
  let sentMessage = (await api.sendMessage(channelId, `Hello! 👋 My name is ${userInfo.username}!`)).message;

  await api.delay(2000);

  // Edit a message
  let editedMessage = (await api.editMessage(channelId, sentMessage.id, 'Hello, edited! ✌️')).message;

  await api.delay(2000);

  // Delete a message
  await api.deleteMessage(channelId, editedMessage.id);

  await api.delay(2000);

  // Log the last 100 messages in the console
  let messages = (await api.getMessages(channelId)).messages;
  console.log(messages);
})()
