import pandas as pd
pd.set_option('display.width', 120)
import sys


def pprint(title, value):
  print(title, '\n', value, '\n')


playlist_uri = sys.argv[1]
playlist = pd.read_json(playlist_uri, orient='records')


pprint('Shape', playlist.shape)

pprint('Columns', playlist.columns)

pprint('Most Frequent Artists', playlist.groupby(playlist.artist).size().sort_values(ascending=False).head())


pprint('Track Popularity',    playlist.sort_values(by='popularity',   ascending=False)[['popularity',   'artist', 'name']])
pprint('Track Energy',        playlist.sort_values(by='energy',       ascending=False)[['energy',       'artist', 'name']])
pprint('Track Tempo',         playlist.sort_values(by='tempo',        ascending=False)[['tempo',        'artist', 'name']])
pprint('Track Danceability',  playlist.sort_values(by='danceability', ascending=False)[['danceability', 'artist', 'name']])
pprint('Track Valence',       playlist.sort_values(by='valence',      ascending=False)[['valence',      'artist', 'name']])
