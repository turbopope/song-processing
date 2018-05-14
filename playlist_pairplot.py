import pandas as pd
pd.set_option('display.width', 120)
import sys
import matplotlib.pyplot as plt
import seaborn as sns
sns.set(style="ticks")



playlist_uri = sys.argv[1]
playlist = pd.read_json(playlist_uri, orient='records')


g = sns.pairplot(playlist[['artist', 'popularity', 'danceability', 'energy', 'valence']], hue='artist', size=2)
# handles = g._legend_data.values()
# labels = g._legend_data.keys()
# g.fig.legend(handles=handles, labels=labels, loc='upper center', ncol=1)
plt.show()