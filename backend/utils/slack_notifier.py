import requests
import os

def notify_slack(message):
    """
    Send notification to Slack channel.
    """
    webhook = os.getenv("SLACK_WEBHOOK_URL")
    if webhook:
        try:
            requests.post(webhook, json={"text": message})
        except Exception as e:
            print(f"Slack Notification Error: {e}")
