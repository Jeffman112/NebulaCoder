# python_script.py
import sys
from ctransformers import AutoModelForCausalLM

# Set gpu_layers to the number of layers to offload to GPU. Set to 0 if no GPU acceleration is available on your system.
llm = AutoModelForCausalLM.from_pretrained("TheBloke/deepseek-coder-6.7B-base-GGUF", model_file="deepseek-coder-6.7b-base.Q4_K_M.gguf", model_type="deepseek", gpu_layers=50)

# Read the comment from the command line argument
comment = sys.argv[1]
generated_text = f"Hi {comment}"
