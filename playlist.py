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

pprint('Most Popular Tracks', playlist.sort_values(by='popularity', ascending=False).iloc[0:10][['popularity', 'artist', 'name']])

pprint('Least Popular Tracks', playlist.sort_values(by='popularity').iloc[0:10][['popularity', 'artist', 'name']])