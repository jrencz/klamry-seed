1. Install dependencies 
2. run `node_modules/.bin/gh user --login`
3. Go to the `.gh.json` file which path is returned by `gh user` call
4. Remove hook in `hooks.issue.new` unless you want a browser tab opened for 
each created issue
5. run `node index.js`
6. Open `index.js`, edit `start`, don't touch `limit` unless you want to be 
blocked by github