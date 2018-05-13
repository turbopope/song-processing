const request = require('request');
const async   = require('async');
const fs      = require('fs');
const _       = require('lodash');



const TOKEN = 'BQA0vW0IrH1cVUHpdrpBddipHfTvt7tjxXpgFydRxyHox4lOtq70fY86yhodIQ7Mvyk9PdLx6FFVrjftsWTQ6uXGDh8o3DSqwRctf_gIbsWdaxrrtiuv2qi-aASF6DG0ghS1PRszNkcJupSdUuwixjcWPek';
const PLAYLIST_ID = '6SqQma7FkgI5ShUXpzZlnH';

let uri = `https://api.spotify.com/v1/users/turbopope/playlists/${PLAYLIST_ID}/tracks?market=DE&fields=next%2Citems(track(id))&limit=100&offset=0`;
let tracks = [];
getTracks(uri, gotTracks);



function getTracks(uri, callback) {
  console.log(uri);
  request.get(uri, {headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${TOKEN}`
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
    "Authorization": `Bearer ${TOKEN}`
  }}, (error, response, body) => {
    if (error) { console.error(error); return; }
    body = JSON.parse(body);
    callback(null, body);
  });
}

function gotFeatures(error, chunkFeatures) {
  let features = [].concat(...chunkFeatures.map(chunk => chunk.audio_features))
  console.log(features)
  fs.writeFileSync('inspiration.json', JSON.stringify(features));
}