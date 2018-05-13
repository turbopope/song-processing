# Libraries
import matplotlib.pyplot as plt
import pandas as pd
from math import pi
import subprocess

# Set data
# df = pd.DataFrame({
#   'group': ['A', 'B', 'C', 'D'],
#   'var1': [38, 1.5, 30, 4],
#   'var2': [29, 10, 9, 34],
#   'var3': [8, 39, 23, 24],
#   'var4': [7, 31, 33, 14],
#   'var5': [28, 15, 32, 14]
# })

df = pd.read_json('peek.json', orient='records')

print(df.head())
print(df.sample())
track = df.sample().iloc[0]
apple_script_call = ['osascript', '-e', 'tell application "Spotify" to play track "{0}"'.format(track['uri'])]
subprocess.call(apple_script_call)

# We are going to plot the first line of the data frame.
# But we need to repeat the first value to close the circular graph:
values = track.drop(['id', 'loudness', 'mode', 'type', 'uri', 'track_href', 'analysis_url', 'duration_ms', 'time_signature', 'key', 'tempo'])
# number of variable
categories = values.index.values
values = values.values.flatten().tolist()
N = len(values)
values += values[:1]

# What will be the angle of each axis in the plot? (we divide the plot / number of variable)
angles = [n / float(N) * 2 * pi for n in range(N)]
angles += angles[:1]

# Initialise the spider plot
ax = plt.subplot(111, polar=True)

# Draw one axe per variable + add labels labels yet
plt.xticks(angles[:-1], categories, color='grey', size=8)

# Draw ylabels
ax.set_rlabel_position(0)
plt.yticks([0.25, 0.5, 0.75], ["0.25", "0.5", "0.75"], color="grey", size=7)
plt.ylim(0, 1)

# Plot data
ax.plot(angles, values, linewidth=1, linestyle='solid')

ax.set_title(track['uri'])
# ax.set_title('Lasse Lindh - C\'mon through')

# Fill area
ax.fill(angles, values, 'b', alpha=0.1)

plt.show()