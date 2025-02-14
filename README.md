# Teamly.one self-bot console

A simple Teamly.one Self-bot using console. Intended for quick scripts runnable directly from the devtools. Can also be used with *Node.js* for quick simple scripts!

# Disclaimer

Automating user accounts may be against [Teamly's Terms of Service](https://teamly.one/tos). You might get banned if you abuse it (too much spam, unusual activity).

# Usage

1. Open Teamly Website (teamly.one)
2. Open Browser Devtools using `Ctrl + shift + i` (or ı if you're using Turkish keyboard)
3. Edit your cookie in [`index.js`](./index.js) file
4. Copy & Paste all codes from file to Console tab then press enter
5. Profit!

**If you don't know how to find your cookie, follow steps below:**

1. Open Teamly Website (teamly.one)
2. Open Browser Devtools using `Ctrl + shift + i` (or ı if you're using Turkish keyboard)
3. Go to the network tab and send a message in any channel/DM
4. A new entry should appear (message), click it then copy the `Cookie` header (in the `Request Headers` section)
5. Edit your cookie in [`index.js`](./index.js) file
6. Copy & Paste all codes from file to Console tab then press enter
7. Profit!

You can now use any function provided by this script in the console like `await api.someFunction()`. Don't forget `await` or the server's response will not be printed to the console.

Use the `api.id()` function to update the variable `tid` team id and `cid` channel id to what you are currently watching.

**Note:** It's a good idea to wrap your code in its own scope `{ code }` or you might get an error when reusing the same variable names later!

# Examples

## Basic example

Update `cid` to the channel you are watching, get the last 50 messages, send a message, edit then delete.

```js
{
  api.id()
  // or api.update_teamId_and_channelId_withCurrentlyVisible()
  
  let userInfo = await api.getCurrentUser();

  let channelId = cid
  // or let channelId = api.getConfig().channelId

  // Send a message
  let sentMessage = await api.sendMessage(channelId, `Hello! 👋 My name is ${userInfo.user.username}!`)

  await api.delay(2000)
  
  // Edit a message
  let editedMessage = await api.editMessage(channelId, sentMessage.message.id, 'Hello, edited! ✌️')

  await api.delay(2000)

  // Delete a message
  await api.deleteMessage(channelId, editedMessage.message.id)

  await api.delay(2000)

  // Log the last 50 messages in the console
  let messages = await api.getMessages(channelId)
  console.log(messages)
}
```

## Develop in IDE and get typings

Types are provided at [`types.d.ts`](./types.d.ts). You can use them in your IDE to get typings and develop your script in a better environment. The typings are not fully complete, but it's better than nothing ([PRs are welcome!](https://github.com/DeadLyBro/teamly-self-bot-console/issues)).

The script will not work with Node.js (and not supposed to be made for it), you need to copy/paste it in the Teamly console to run it.

Don't forget to paste the full [`index.js`](./index.js) script in the console first to get the `api` variable!

```bash
git clone git@github.com:DeadLyBro/teamly-self-bot-console.git
# or
git clone https://github.com/DeadLyBro/teamly-self-bot-console.git

cd teamly-self-bot-console
code .
```

Doing the following, you should be able to get typings. Open [`myScripts/example.js`](./myScripts/example.js).

```js
// myScripts/example.js

// @ts-check
const { api } = require('../index.js')

// Copy paste the below code inside the Browser Devtools Console
;(async () => {
  const userInfo = await api.getCurrentUser()

  console.log(userInfo.user.username)
})()
```

## Send an embed

**SENDING EMBEDS AS A USER ACCOUNT IS NOT POSSIBLE**

## Use a bot account

This specific script only works for user accounts. If you want to use a bot account, you need to use the provided Node.js version (see above).

[Script for Bot Accounts](./forbots.js)

## Farm XP

Send a `message` to a channel (`channelId`) every minute then delete it (useful for XP farming in some servers).

You can use `loop = false` at any time to stop it.

```js
{
  api.id()
  let channelId = cid
  let message = 'Hi, I like spamming 🦜'

  var loop = true
  let count = 0
  while (loop) {
    const sentMessage = await api.sendMessage(channelId, message)
    await api.deleteMessage(channelId, sentMessage.message.id)
    console.log(`Sent ${++count} messages`)
    await api.delay(61*1000) // 61 seconds
  }
}
```

## Clear messages of user

Delete the `amount` messages from user (`userId`) sent to a channel/DM (`channelId`) and wait `delayMs` milliseconds everytime.

I use sometimes to fully clear my DMs as Teamly does not offer it as a feature.

You can use `loop = false` at any time to stop it.

Teamly's rate limit may be strictier. I recommend 1100ms as a minimum to not get rate limited. Make it even bigger if you are affraid of getting banned.

```js
{
  api.id()
  let channelId = cid
  let userId = '012345678987654321'
  let amount = 99999999
  let delayMs = 1100

  let deletionCount = 0
  var loop = true
  var offsetNum = 0

  while (loop) {
    const messages = await api.getMessages(channelId, undefined, { offset: offsetNum })

    // We reached the start of the conversation
    if (messages.messages.length < 50 && messages.messages.filter(x => x.createdBy.id === userId).length === 0) {
      loop = false
      console.log(`[${deletionCount}/${amount}] Reached the start of the conversations! Ending.`)
      continue
    }

    // Update last message snowflake for next iteration
    offsetNum = offsetNum+=50

    for (const aMessage of messages.messages) {
      if (loop === false) break

      // Check if the max amount was reached
      if (deletionCount >= amount) {
        loop = false
        console.log(`[${deletionCount}/${amount}] Deleted the requested amount of messages! Ending.`)
        break
      }

      // Check if the message should be deleted
      if (aMessage.createdBy.id === userId) {
        await api.deleteMessage(channelId, aMessage.id)
        deletionCount++
        console.log(`[${deletionCount}/${amount}] Deleted a message!`)
        if (deletionCount < amount) await api.delay(delayMs)
      }
    }
    await api.delay(delayMs)
  }
}
```

## Do anything to every messages in a text channel

Pass your custom function!

This example will apply all reactions already there on all messages, then add 👋 if message says `hi!!` or `hello`.

```js
{
  api.id()
  let channelId = cid
  let amount = 99999999
  let delayMs = 500

  let actionFn = async (channelId, message) => {
    //
    // Your custom code here
    //
    let wasActiontriggered = false

    // Copy all reactions already present on message
    for (const reaction of message.reactions || []) {
      let reactionToAdd = reaction.emojiId ? `${reaction.name}:${reaction.emojiId}` : reaction.name
      await api.reactToMessage(channelId, message.id, reactionToAdd)
      wasActiontriggered = true
      await api.delay(delayMs)
    }

    // If person said `hello!!!` or `hi!`, react with waving hand 👋
    if (message.content.match(/^(?:hi|hello)!*$/)) {
      await api.reactToMessage(channelId, message.id, '👋')
      wasActiontriggered = true
    }

    // Return a boolean indicating if you did something to the message
    // If true, will log and apply delay
    return wasActiontriggered
  }

  let count = 0
  var loop = true
  var offsetNum = 0
  
  while (loop) {
    const messages = await api.getMessages(channelId, undefined, { offset: offsetNum })

    // We reached the start of the conversation
    if (messages.messages.length < 50 && messages.messages.length === 0) {
      loop = false
      console.log(`[${count}/${amount}] Reached the start of the conversation! Ending.`)
      continue
    }

    // Update last message snowflake for next iteration
    offsetNum = offsetNum+=50

    for (const aMessage of messages.messages) {
      if (loop === false) break

      // Check if the max amount was reached
      if (count >= amount) {
        loop = false
        console.log(`[${count}/${amount}] Treated the requested amount of messages! Ending.`)
        break
      }

      // Check if the message should be reacted
      if (aMessage.type === 'text') {
        let wasActiontriggered = await actionFn(channelId, aMessage)
        // Apply delay and log only if return true
        if (wasActiontriggered) {
          count++
          console.log(`[${count}/${amount}] Treated a message! ID=${aMessage.id}`)
          if (count < amount) await api.delay(delayMs)
        }
      }
    }
    await api.delay(delayMs)
  }
}
```

# FAQ

## Will I get banned if I do x?

I don't know, maybe. I have used lots of scripts in the past, often deleted 100k+ messages of mine accross private messages and servers and never got banned, ever.

But I can't guarantee anything. Use at your own risk.

Automating user accounts is againt [Teamly's Terms of Service](https://teamly.one/tos).

## Listen to events, do some advanced stuff

This is intended for small scripts, not to implement a full-featured bot.

**Note:** If they don't support user bots anymore, it may break at any time (with Teamly changing their APIs).

## Can it do x? Can you help me?

Post your requests in the [Discussions](https://github.com/DeadLyBro/teamly-self-bot-console/discussions) tab. Please search if your request was not mentionned in an earlier post before asking.

## I made a nice/useful script, can I share?

Of course! Post it in the [Discussions](https://github.com/DeadLyBro/teamly-self-bot-console/discussions) tab. Please search if a similar script was shared earlier before posting.

## Why this repo?

I want to everyone make their bots or user bots with Javascript.

# API

## Full list

The full list of available functions is available in [`types.d.ts`](./types.d.ts).

```js
api.id()
api.update_teamId_and_channelId_withCurrentlyVisible()
api.delay(ms)
api.apiCall(apiPath, body, method = 'GET')

api.getMessages(channelId, limit?, params = {}) 
api.sendMessage(channelId, message, body = {})
api.replyToMessage(channelId, repliedMessageId, message, body = {})
api.editMessage(channelId, messageId, newMessage, body = {})
api.deleteMessage(channelId, messageId)

api.getCurrentUser()
// and more...
```

## `api.delay(ms)`

`api.delay(ms: number) => Promise<void>`

Wait for `ms` milliseconds.

```js
await delay(1500)
await api.delay(1500)
```

## `api.downloadFileByUrl(url, filename)`

`api.downloadFileByUrl(url: string, filename: string) => Promise<void>`

Download a file at `url` and name it `filename`.

See [How to download attachments (file, image) from a message?](https://github.com/rigwild/discord-self-bot-console/discussions/66)

```js
await api.downloadFileByUrl('https://cataas.com/cat', 'cat.png')
await api.downloadFileByUrl(messages[0].attachments[0].url, messages[0].attachments[0].name)
```

## `api.id()`

`api.id() => void` (old alias)

`api.update_teamId_and_channelId_withCurrentlyVisible() => void`

Update the variable `tid` team id and `cid` channel id to what you are currently watching in Teamly.

```js
id()
api.id()
```

## `api.getConfig()`

```ts
api.getConfig(): Readonly<{
  Cookie: string,
  teamId: string,
  channelId: string,
  tid: string,
  cid: string,
}>
```

Returns the current configuration, read-only. Useful if you want to use typings in your IDE.

Set configuration

```
api.setConfigAutoUpdateToken(autoUpdateToken: boolean): void
api.setConfigTid(teamId: string): void
api.setConfigGuildId(teamId: string): void
api.setConfigCid(channelId: string): void
api.setConfigChannelId(channelId: string): void
```

## Variables

- `Cookie`: Your Teamly account login token
- `tid`: Current team id (update to what you are currently watching using `api.id()`)
- `cid`: Current channel id (update to what you are currently watching using `api.id()`)

# License

[The MIT License](./LICENSE)
