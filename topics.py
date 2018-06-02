import pandas as pd
pd.set_option('display.width', 120)
import sys
import re



def count_topic_words(lyrics, topic_file):
  text_file = open(topic_file, "r")
  lines = text_file.readlines()
  listed_words = list(map(str.strip, lines))

  words = re.compile("[^a-zA-Z']+").split(lyrics)
  words = list(map(str.lower, words))
  return sum(el in words for el in listed_words)


playlist_uri = sys.argv[1]
playlist = pd.read_json(playlist_uri, orient='records')

playlist['profanities'] = playlist['lyrics'].apply(count_topic_words, args=('topics/bad-words.txt',))
playlist['drinking']    = playlist['lyrics'].apply(count_topic_words, args=('topics/drinking.txt',))
playlist['love']        = playlist['lyrics'].apply(count_topic_words, args=('topics/love.txt',))

print(playlist.sort_values(by='profanities',   ascending=False)[['profanities', 'drinking', 'love', 'artist', 'name']])