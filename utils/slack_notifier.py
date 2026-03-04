import requests
import os

def notify_slack(message):
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    if webhook:
        requests.post(webhook, json={"text": message})
