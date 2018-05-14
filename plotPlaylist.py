# import numpy as np
import pandas as pd
# import matplotlib as mpl
import matplotlib.pyplot as plt

import seaborn as sns
sns.set(style="whitegrid", color_codes=True)
fig, axs = plt.subplots(nrows=2, figsize=(11, 8.4))
fig.suptitle("Spotify Playlist Feature Analysis")

features = [
  'danceability',
  'energy',
  'speechiness',
  'acousticness',
  'instrumentalness',
  'liveness',
  'valence'
]

inspiration = pd.read_json('inspiration.json', orient='records')
random = pd.read_json('random.json', orient='records')

inspiration = pd.melt(inspiration, value_vars=features, id_vars='mode')
random = pd.melt(random, value_vars=features, id_vars='mode')

sns.violinplot(x="variable", y="value", hue="mode", data=random, split=True, ax=axs[0])
sns.violinplot(x="variable", y="value", hue="mode", data=inspiration, split=True, ax=axs[1])

axs[0].set_title('Random')
axs[1].set_title('Inspiration')

plt.show()