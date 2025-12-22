import numpy as np
import tensorflow as tf
from tensorflow import keras
import json
import os

def main():
    model_path = "vital_model.h5"
    output_dir = "public/models/vital-monitor"
    output_file = os.path.join(output_dir, "manual_weights.json")
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    print(f"Loading model from {model_path}...")
    model = keras.models.load_model(model_path)
    model.summary()
    
    weights_data = []
    
    for layer in model.layers:
        w = layer.get_weights()
        if w:
            # w[0] is kernel, w[1] is bias
            kernel = w[0].tolist()
            bias = w[1].tolist()
            weights_data.append({
                "name": layer.name,
                "kernel": kernel,
                "bias": bias
            })
            print(f"Exported weights for {layer.name}: Kernel {np.shape(kernel)}, Bias {np.shape(bias)}")
            
    with open(output_file, 'w') as f:
        json.dump(weights_data, f)
        
    print(f"Weights saved to {output_file}")

if __name__ == "__main__":
    main()
