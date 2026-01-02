# -----------------------------
# Setup PyTorch + torch-directml for AMD GPU
# -----------------------------

# 1️⃣ Uninstall any old versions
# pip uninstall torch torchvision torchaudio torch-directml -y

# # 2️⃣ Upgrade pip
# python -m pip install --upgrade pip

# # 3️⃣ Install latest PyTorch + torch-directml
# pip install torch torchvision torchaudio --upgrade
# pip install torch-directml==0.2.1.dev240521

# 4️⃣ Test AMD GPU
import torch
import torch_directml

device = torch_directml.device()
x = torch.randn(4, 4, device=device)
print("AMD GPU detected as device:", x.device)
