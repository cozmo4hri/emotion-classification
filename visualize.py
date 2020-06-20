import json
import seaborn as sns
import matplotlib.pyplot as plt

file_url = "sample_data.json"
with open(file_url, 'r') as f:
    data = json.load(f)

# responses = []
arousal_list = []
valence_list = []

#filter out unnecessary data:
for dataset in data:
    if dataset['trial_type'] != "grid-response":
        continue
    
    # response = {
    #     'video_id': dataset['video_id'],
    #     'valence': dataset['valence'],
    #     'arousal': dataset['arousal'],
    #     'confidence': dataset['confidence'],
    # }
    # responses.append(response)
    arousal_list.append(dataset['arousal'])
    valence_list.append(dataset['valence'])


sns.set(style="white")

# Show the joint distribution using kernel density estimation
g = sns.jointplot(valence_list, arousal_list, kind="kde", height=7, space=0, xlim=(-1, 1), ylim=(-1, 1))
g.set_axis_labels('x', 'y', fontsize=16)
g.ax_joint.set_xlabel('valence')
g.ax_joint.set_ylabel('arousal')

plt.tight_layout()
plt.show()