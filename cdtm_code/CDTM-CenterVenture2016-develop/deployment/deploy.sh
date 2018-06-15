#!/bin/bash

pm2 stop server
pm2 delete server
git reset --hard
git pull
npm install
echo "module.exports = {url : 'mongodb://localhost:12345/'}" >  ../config/db.js
cd ..
pm2 start server.js


