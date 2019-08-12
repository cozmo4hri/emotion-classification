import json
import numpy as np
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

file_url = "data/sample_data.json"

with open(file_url, 'r') as f:
    data = json.load(f)

responses = []
arousal_list = []
valence_list = []

#filter out unnecessary data:
for dataset in data:
    if dataset['trial_type'] != "grid-response":
        continue
    
    response = {
        'video_id': dataset['video_id'],
        'valence': dataset['valence'],
        'arousal': dataset['arousal'],
        'confidence': dataset['confidence'],
    }
    responses.append(response)


for response in responses:
    arousal_list.append(response['arousal'])
    valence_list.append(response['valence'])

print(valence_list)

sns.set(style="white")

x1 = pd.Series(valence_list, name="$valence$")
x2 = pd.Series(arousal_list, name="$arousal$")

# Show the joint distribution using kernel density estimation
g = sns.jointplot(x1, x2, kind="kde", height=7, space=0, xlim=(-1,1), ylim=(-1,1))

plt.show()