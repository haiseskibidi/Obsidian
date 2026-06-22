import numpy as np
import matplotlib.pyplot as plt

try:
    plt.style.use('seaborn-v0_8-whitegrid')
except:
    try:
        plt.style.use('seaborn-whitegrid')
    except:
        pass

x = np.linspace(0, 6, 500)

# Define fuzzy set A (triangular)
yA = np.zeros_like(x)
for i, val in enumerate(x):
    if 1 <= val < 2.5:
        yA[i] = (val - 1) / 1.5
    elif 2.5 <= val <= 4:
        yA[i] = (4 - val) / 1.5

# Define fuzzy set B (triangular)
yB = np.zeros_like(x)
for i, val in enumerate(x):
    if 2.5 <= val < 4:
        yB[i] = (val - 2.5) / 1.5
    elif 4 <= val <= 5.5:
        yB[i] = (5.5 - val) / 1.5

# Min (Intersection)
y_min = np.minimum(yA, yB)

# Max (Union)
y_max = np.maximum(yA, yB)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5), dpi=150)

# Left plot: Min / AND
ax1.plot(x, yA, 'b--', linewidth=1.5, label='Множество A')
ax1.plot(x, yB, 'r--', linewidth=1.5, label='Множество B')
ax1.plot(x, y_min, color='#7025d9', linewidth=3, label='Пересечение (И / min)')
ax1.fill_between(x, y_min, color='#7025d9', alpha=0.3)
ax1.set_title('Конъюнкция / Пересечение (И)\nВыбирается МИНИМУМ из двух функций', fontsize=11, fontweight='bold')
ax1.set_ylim(-0.05, 1.1)
ax1.legend(loc='upper right')
ax1.spines['top'].set_visible(False)
ax1.spines['right'].set_visible(False)

# Right plot: Max / OR
ax2.plot(x, yA, 'b--', linewidth=1.5, label='Множество A')
ax2.plot(x, yB, 'r--', linewidth=1.5, label='Множество B')
ax2.plot(x, y_max, color='#137333', linewidth=3, label='Объединение (ИЛИ / max)')
ax2.fill_between(x, y_max, color='#137333', alpha=0.2)
ax2.set_title('Дизъюнкция / Объединение (ИЛИ)\nВыбирается МАКСИМУМ из двух функций', fontsize=11, fontweight='bold')
ax2.set_ylim(-0.05, 1.1)
ax2.legend(loc='upper right')
ax2.spines['top'].set_visible(False)
ax2.spines['right'].set_visible(False)

plt.tight_layout()
plt.savefig(r'D:\Me\ТПР\fuzzy_min_max.png', dpi=150)
plt.close()
print("Min/Max comparison graph generated successfully!")
