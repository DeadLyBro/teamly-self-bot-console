// @ts-check
const { api } = require('../index.js')

// Copy paste the below code inside the Browser Console
;(async () => {
  const userInfo = (await api.getCurrentUser()).user;

  console.log(userInfo.username);
})()
