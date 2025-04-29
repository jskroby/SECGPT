# SECGPT

Secure GPT based on LlamaIndex for applications with security features.

## Installation

Use the following commands to install SECGPT with pip:

```bash
git clone https://github.com/jskroby/SECGPT
cd SECGPT
pip install -r requirements.txt
```

## Running SECGPT as an API

```python
from secgpt.core import api
api.generate_response("Hello, this is SECGPT.")
```

## Running the AI-powered deployment workflow

* Ensure you have the necessary dependencies installed by running `pip install -r requirements.txt`.
* Push your changes to the `main` branch to trigger the AI-powered deployment workflow defined in `.github/workflows/ai-deploy.yml`.
* The workflow will run the AI analysis test and, if approved, execute the deployment decision.

## Running the auto-update AI deployment workflow

* Ensure you have the necessary dependencies installed by running `pip install -r requirements.txt`.
* Push your changes to the `main` branch to trigger the auto-update AI deployment workflow defined in `.github/workflows/auto-update.yml`.
* The workflow will update the AI deployment workflow file and commit the changes.

## Running the GPT-powered workflow

* Ensure you have the necessary dependencies installed by running `pip install -r requirements.txt`.
* Push your changes to the `main` branch to trigger the GPT-powered workflow defined in `.github/workflows/gpt-actions.yml`.
* The workflow will analyze the code using AI and, if approved, execute the deployment decision.
