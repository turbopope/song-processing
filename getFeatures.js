const request = require('request');
const async   = require('async');
const fs      = require('fs');
const _       = require('lodash');



let token = fs.readFileSync('./token', { encoding: 'utf-8' });
let [, userID, playlistID] = process.argv[2].match(/^spotify:user:(.+):playlist:(.+)$/);


async.waterfall(
  [
    async.constant(userID, playlistID),
    getTracks,
    getFeatures,
    _.partial(fs.writeFile, `${userID}_${playlistID}.json`)
  ],
  error => {
    if (error) throw error
  }
)



function getTracks(userID, playlistID, callback) {
  let tracks = []
  let uri = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks?market=DE&fields=next%2Citems(track(id))&limit=100&offset=0`;
  
  async.doUntil(
    cb => getWithAuth(uri, _.partial(handleTrackPage, _, _, cb)),
    () => _.isUndefined(uri) || _.isNull(uri),
    callback
  );

  function handleTrackPage(error, body, cb) {
    if (error) return cb(error);
    tracks.push(...body.items);
    uri = body.next;
    return cb(null, tracks);
  }
}

function getFeatures(tracks, callback) {
  async.waterfall(
    [
      async.constant(tracks),
      chunkTracks,
      getFeaturesForChunks,
      unchunkFeatures
    ],
    callback
  )

  function chunkTracks(tracks, callback) {
    return callback(null, chunks = _.chunk(tracks, 100))
  }

  function getFeaturesForChunks(chunks, callback) {
    return async.map(chunks, getFeaturesForChunk, callback);
  }

  function getFeaturesForChunk(chunk, callback) {
    let ids = chunk.map(item => item.track.id).join('%2C');
    let uri = `https://api.spotify.com/v1/audio-features?ids=${ids}`;
    return getWithAuth(uri, callback);
  }

  function unchunkFeatures(chunkFeatures) {
    let features = [].concat(...chunkFeatures.map(chunk => chunk.audio_features))
    fs.writeFileSync(`./playlists/${userID}_${playlistID}.json`, JSON.stringify(features));
  }
}

function getWithAuth(uri, callback) {
  request.get(uri, {headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }}, (error, response, body) => {
    if (error) callback(error);
    body = JSON.parse(body);
    return callback(null, body, response);
  });
}

