import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Tuple, Optional
from dataclasses import dataclass
import logging
import json
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class ProcessingConfig:
    width: int = 10000
    height: int = 1000
    seed: int = 42
    log_threshold: float = 13.0
    log_multiplier: float = 2.0
    dpi: int = 200
    output_path: str = "processed_log_image.png"
    colormap: str = "gray"  
    use_float32: bool = True  
    
    def __post_init__(self):
        if self.width <= 0 or self.height <= 0:
            raise ValueError("Width and height must be positive")
        if self.log_threshold <= 0:
            raise ValueError("Log threshold must be positive")
        if self.dpi <= 0:
            raise ValueError("DPI must be positive")


class ImageProcessor:
    
    def __init__(self, config: ProcessingConfig):
        self.config = config
        self.metadata = {}
    
    def estimate_memory_usage(self) -> dict:
        """Estimate memory requirements."""
        total_elements = self.config.width * self.config.height
        bytes_per_element = 4 if self.config.use_float32 else 8
        
        estimates = {
            'input_array_mb': (total_elements * 2) / (1024**2),  # uint16
            'working_array_mb': (total_elements * bytes_per_element) / (1024**2),
            'output_array_mb': (total_elements * 1) / (1024**2),  # uint8
            'peak_mb': (total_elements * (2 + bytes_per_element + 1)) / (1024**2),
            'dtype': 'float32' if self.config.use_float32 else 'float64'
        }
        
        logger.info(f"Estimated peak memory usage: {estimates['peak_mb']:.1f} MB")
        return estimates
    
    def generate_synthetic_data(self) -> np.ndarray:
        logger.info(f"Generating synthetic data: {self.config.height}×{self.config.width}")
        
        np.random.seed(self.config.seed)
        
        data = np.random.randint(
            0, 65536, 
            size=(self.config.height, self.config.width), 
            dtype=np.uint16
        )
        
        self.metadata['original_stats'] = {
            'min': int(data.min()),
            'max': int(data.max()),
            'mean': float(data.mean()),
            'median': float(np.median(data)),
            'zeros': int((data == 0).sum()),
            'shape': data.shape
        }
        
        logger.info(f"Generated data - min: {data.min()}, max: {data.max()}, "
                   f"zeros: {(data == 0).sum()} ({(data == 0).sum()/data.size*100:.2f}%)")
        
        return data
    
    def apply_log_transform(self, data: np.ndarray) -> np.ndarray:
        logger.info("Applying log10 transformation...")
        
        dtype = np.float32 if self.config.use_float32 else np.float64
        working = data.astype(dtype)
        
        del data
        
        valid_mask = working > 0
        num_invalid = (~valid_mask).sum()
        
        if num_invalid > 0:
            logger.warning(f"Found {num_invalid} zero/negative values "
                          f"({num_invalid/working.size*100:.2f}% of data)")
        
        working = np.where(
            valid_mask,
            10 * np.log10(working, where=valid_mask, out=working),
            np.nan  # Use NaN for invalid values
        )
        
        self.metadata['log_stats'] = {
            'min': float(np.nanmin(working)),
            'max': float(np.nanmax(working)),
            'mean': float(np.nanmean(working)),
            'invalid_count': int(num_invalid)
        }
        
        logger.info(f"Log transform - range: [{np.nanmin(working):.2f}, {np.nanmax(working):.2f}]")
        
        return working
    
    def apply_conditional_scaling(self, log_data: np.ndarray) -> np.ndarray:
        
        logger.info(f"Applying conditional scaling (threshold: {self.config.log_threshold})...")
        
        below_threshold = (log_data < self.config.log_threshold) & ~np.isnan(log_data)
        num_below = below_threshold.sum()
        
        logger.info(f"Values below threshold: {num_below} "
                   f"({num_below/log_data.size*100:.2f}%)")
        
        log_data[below_threshold] *= self.config.log_multiplier
        
        self.metadata['scaled_stats'] = {
            'min': float(np.nanmin(log_data)),
            'max': float(np.nanmax(log_data)),
            'scaled_count': int(num_below)
        }
        
        return log_data
    
    def normalize_to_uint8(self, data: np.ndarray) -> np.ndarray:
        """
        Normalize data to 0-255 range for image display.
        
        Handles edge cases and NaN values.
        """
        logger.info("Normalizing to uint8 range...")
        
        valid_data = data[~np.isnan(data)]
        
        if valid_data.size == 0:
            logger.error("No valid data to normalize!")
            return np.zeros_like(data, dtype=np.uint8)
        
        min_val = valid_data.min()
        max_val = valid_data.max()
        
        logger.info(f"Normalization range: [{min_val:.2f}, {max_val:.2f}]")
        
        # Handle edge case: all values identical
        if max_val == min_val:
            logger.warning("All values identical - setting to mid-range (127)")
            return np.full(data.shape, 127, dtype=np.uint8)
        
        normalized = np.nan_to_num(
            (data - min_val) / (max_val - min_val),
            nan=0.0
        )
        
        # Convert to uint8
        output = (normalized * 255).astype(np.uint8)
        
        self.metadata['normalization'] = {
            'min_value': float(min_val),
            'max_value': float(max_val),
            'output_range': [int(output.min()), int(output.max())]
        }
        
        return output
    
    def create_visualization(self, img_data: np.ndarray, save: bool = True) -> None:
        logger.info("Creating visualization...")
        
        fig, ax = plt.subplots(figsize=(12, 4))        
        im = ax.imshow(img_data, cmap=self.config.colormap, aspect='auto')
        
        cbar = plt.colorbar(im, ax=ax, label='Intensity (0-255)')
        
        title = (f"Processed Log Image (threshold={self.config.log_threshold}, "
                f"scale={self.config.log_multiplier}x)")
        ax.set_title(title)        
        ax.set_xlabel('Width (pixels)')
        ax.set_ylabel('Height (pixels)')
        
        plt.tight_layout()
        
        if save:
            output_path = Path(self.config.output_path)            
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            plt.savefig(output_path, dpi=self.config.dpi, bbox_inches='tight')
            logger.info(f"✓ Image saved: {output_path} ({self._get_file_size(output_path)})")            
            self._save_metadata(output_path.with_suffix('.json'))
        
        plt.show()
        plt.close(fig)
    
    def _get_file_size(self, path: Path) -> str:
        """Get human-readable file size."""
        size = path.stat().st_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.1f} {unit}"
            size /= 1024
        return f"{size:.1f} TB"
    
    def _save_metadata(self, path: Path) -> None:
        """Save processing metadata to JSON."""
        self.metadata['timestamp'] = datetime.now().isoformat()
        self.metadata['config'] = {
            'width': self.config.width,
            'height': self.config.height,
            'seed': self.config.seed,
            'log_threshold': self.config.log_threshold,
            'log_multiplier': self.config.log_multiplier,
            'colormap': self.config.colormap
        }
        
        with open(path, 'w') as f:
            json.dump(self.metadata, f, indent=2)
        
        logger.info(f"Metadata saved: {path}")
    
    def process(self) -> np.ndarray:
      
        try:
            data = self.generate_synthetic_data()
            
            # Apply transformations (in-place where possible)
            log_data = self.apply_log_transform(data)
            scaled_data = self.apply_conditional_scaling(log_data)
            final_img = self.normalize_to_uint8(scaled_data)
            
            # Free intermediate data
            del scaled_data, log_data
            
            # Create visualization
            self.create_visualization(final_img)
            
            logger.info("Processing completed successfully!")
            
            return final_img
            
        except Exception as e:
            logger.error(f"Processing failed: {e}", exc_info=True)
            raise
    
    def print_summary(self) -> None:
        """Print processing summary."""
        print("\n" + "="*60)
        print("IMAGE PROCESSING SUMMARY")
        print("="*60)
        print(f"Input shape: {self.config.height}×{self.config.width}")
        print(f"Seed: {self.config.seed}")
        print(f"\nOriginal Data:")
        if 'original_stats' in self.metadata:
            stats = self.metadata['original_stats']
            print(f"  Range: [{stats['min']}, {stats['max']}]")
            print(f"  Mean: {stats['mean']:.1f}")
            print(f"  Zeros: {stats['zeros']:,}")
        
        print(f"\nLog Transform:")
        if 'log_stats' in self.metadata:
            stats = self.metadata['log_stats']
            print(f"  Range: [{stats['min']:.2f}, {stats['max']:.2f}]")
            print(f"  Mean: {stats['mean']:.2f}")
        
        print(f"\nConditional Scaling:")
        if 'scaled_stats' in self.metadata:
            stats = self.metadata['scaled_stats']
            print(f"  Threshold: {self.config.log_threshold}")
            print(f"  Multiplier: {self.config.log_multiplier}x")
            print(f"  Values scaled: {stats['scaled_count']:,}")
        
        print(f"\nOutput:")
        print(f"  File: {self.config.output_path}")
        print(f"  Colormap: {self.config.colormap}")
        print("="*60 + "\n")


def main():
    config = ProcessingConfig()
    processor = ImageProcessor(config)
    
    result = processor.process()
    
    processor.print_summary()
    
    return result


if __name__ == "__main__":
    main()