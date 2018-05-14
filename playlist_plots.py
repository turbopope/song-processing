import pandas as pd
pd.set_option('display.width', 120)
import sys
import matplotlib.pyplot as plt
import seaborn as sns
sns.set()



playlist_uri = sys.argv[1]
playlist = pd.read_json(playlist_uri, orient='records')


sns.lmplot(x="tempo", y="energy", truncate=True, size=8, data=playlist)
plt.show()

sns.lmplot(x="energy", y="popularity", truncate=True, size=8, data=playlist)
plt.show()