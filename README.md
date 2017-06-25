# back_end

- redis keys: commits:date、commit:sssha

## Done

- 根据date获取当天 commit     √
- 根据 commit sha 获取详情    √

## To-Do-List

- 统计当日到访者

# front end

## Build Setup

``` bash
# install dependencies
cd front-end
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```


# spider 
use node-fetch to fetch bbs top 10 topics

## setup
```bash
cd source-data
# install dependencies
npm install

# start to fetch data
node index.js
