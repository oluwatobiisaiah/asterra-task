import numpy as np
import matplotlib.pyplot as plt

# Set seed for reproducibility
np.random.seed(42)

# Create random array (1000 x 10000), values 0–65535
data = np.random.randint(0, 65536, size=(1000, 10000), dtype=np.uint16)

# Convert to float for log computation
data_float = data.astype(np.float64)

# Compute log-transformed data where values > 0
valid_mask = data_float > 0
log_data = np.zeros_like(data_float)
log_data[valid_mask] = 10 * np.log10(data_float[valid_mask])

# Apply transformation: double log values below 13, keep others
final = log_data.copy()
final[(log_data < 13) & valid_mask] = 2 * log_data[(log_data < 13) & valid_mask]

# Normalize for image display (0–255)
min_val = np.min(final)
max_val = np.max(final)
final_norm = (final - min_val) / (max_val - min_val)
final_img = (final_norm * 255).astype(np.uint8)

# Plot and save image
plt.figure(figsize=(12, 4))
plt.imshow(final_img, cmap="gray", aspect="auto")
plt.colorbar(label="Intensity")
plt.title("Processed Log Image")
plt.tight_layout()
plt.savefig("processed_log_image.png", dpi=200)
plt.show()

print("Image saved as: processed_log_image.png")
