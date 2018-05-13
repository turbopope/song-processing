const request = require('request');
const async   = require('async');
const fs      = require('fs');
const _       = require('lodash');



let token = fs.readFileSync('./token', { encoding: 'utf-8' });
let [, userID, playlistID] = process.argv[2].match(/^spotify:user:(.+):playlist:(.+)$/);

let uri = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks?market=DE&fields=next%2Citems(track(id))&limit=100&offset=0`;
let tracks = [];
getTracks(uri, gotTracks);



function getTracks(uri, callback) {
  console.log(uri);
  request.get(uri, {headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }}, (error, response, body) => {
    if (error) { console.error(error); return; }
    body = JSON.parse(body);
    tracks.push(...body.items);
    if (body.next) {
      getTracks(body.next, callback);
    } else {
      callback(null, tracks);
    }
  });
}

function gotTracks(error, tracks) {
  let chunks = _.chunk(tracks, 100);
  async.map(chunks, getFeatures, gotFeatures);
}


function getFeatures(chunk, callback) {
  let ids = chunk.map(item => item.track.id).join('%2C');
  let uri = `https://api.spotify.com/v1/audio-features?ids=${ids}`;

  request.get(uri, {headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }}, (error, response, body) => {
    if (error) { console.error(error); return; }
    body = JSON.parse(body);
    callback(null, body);
  });
}

function gotFeatures(error, chunkFeatures) {
  let features = [].concat(...chunkFeatures.map(chunk => chunk.audio_features))
  console.log(features)
  fs.writeFileSync(`${userID}_${playlistID}.json`, JSON.stringify(features));
}