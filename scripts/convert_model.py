import numpy as np
# Monkeypatch np.object
try:
    np.object = object
except:
    pass

import sys
import os
from tensorflowjs.converters import converter

def main():
    input_path = "vital_model.h5"
    output_dir = "public/models/vital-monitor"
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    print(f"Converting {input_path} to {output_dir}...")
    
    # Arguments for converter
    # We are simulating: tensorflowjs_converter --input_format keras vital_model.h5 public/models/vital-monitor
    
    converter.dispatch_keras_h5_to_tfjs_layers_model_conversion(
        h5_path=input_path,
        output_dir_path=output_dir
    )
    print("Conversion successful!")

if __name__ == "__main__":
    main()
