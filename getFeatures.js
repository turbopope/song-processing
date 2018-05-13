const request = require('request');
const async   = require('async');
const fs      = require('fs');
const _       = require('lodash');



let TRACK_FIELDS = ['id', 'name', 'artists.name', 'album.name', 'popularity', 'duration_ms'].join('%2C');
let FIELDS = ['next', `items(track(${TRACK_FIELDS}))`].join('%2C');
let token = fs.readFileSync('./token', { encoding: 'utf-8' });
let [, userID, playlistID] = process.argv[2].match(/^spotify:user:(.+):playlist:(.+)$/);


async.waterfall(
  [
    async.constant(userID, playlistID),
    getTracks,
    getFeatures,
    cleanUp,
    writeOut
  ],
  error => {
    if (error) throw error
  }
)


function writeOut(playlist, callback) {
  return fs.writeFile(`./playlists/${userID}_${playlistID}.json`, JSON.stringify(playlist), callback);
}


function getTracks(userID, playlistID, callback) {
  let tracks = []
  let uri = `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks?market=DE&fields=${FIELDS}&limit=100&offset=0`;
  
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

  function getFeaturesForChunk(tracksChunk, callback) {
    let ids = tracksChunk.map(item => item.track.id).join('%2C');
    let uri = `https://api.spotify.com/v1/audio-features?ids=${ids}`;
    return getWithAuth(uri, (error, featuresChunk) => {
      if (error) return callback(error);
      return callback(null, _.zipWith(tracksChunk.map(track => track.track), featuresChunk.audio_features, _.merge))
    });
  }

  function unchunkFeatures(chunkFeatures, callback) {
    let features = [].concat(...chunkFeatures/*.map(chunk => chunk.audio_features)*/)
    return callback(null, features)
    // return fs.writeFile(`./playlists/${userID}_${playlistID}.json`, JSON.stringify(features), callback);
  }
}

function cleanUp(tracks, callback) {

  tracks.forEach(track => {
    delete track.type
    delete track.uri
    delete track.track_href
    delete track.analysis_url
    track.album = track.album.name
    track.artists = _.map(track.artists, 'name')
    track.artist = _.first(track.artists)
  })
  return callback(null, tracks)
}

function getWithAuth(uri, callback) {
  request.get(uri, {headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }}, (error, response, body) => {
    if (error) return callback(error);
    body = JSON.parse(body);
    if (body.error) return callback(body.error.message)
    return callback(null, body, response);
  });
}

