import os
import json
import traceback
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException

from utils.ai_analyzer import analyze_failure
from utils.slack_notifier import notify_slack
from utils.s3_uploader import upload_file

REPORTS_DIR = "reports"
SCREENSHOT_DIR = "screenshots"

os.makedirs(REPORTS_DIR, exist_ok=True)
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

def run_tests(url, recommendations):
    """
    Run tests on the given URL based on recommendations.
    """
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get(url)

    results = []

    for rec in recommendations:
        result = execute_test_action(driver, rec)
        results.append(result)

    driver.quit()
    return results

def execute_test_action(driver, recommendation):
    """
    Execute a single test action.
    """
    result = {
        "element_type": recommendation['element_type'],
        "selector": recommendation['selector'],
        "action": recommendation['action'],
        "description": recommendation['description'],
        "status": "PASS",
        "error": None,
        "ai_analysis": None
    }

    try:
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, recommendation['selector']))
        )

        if recommendation['action'] == 'click':
            element.click()
        elif recommendation['action'] == 'type':
            element.send_keys("test input")  # Simple test input

        # Wait a bit to see if page changes or errors
        WebDriverWait(driver, 5).until(lambda d: d.execute_script("return document.readyState") == "complete")

    except (NoSuchElementException, TimeoutException) as e:
        result["status"] = "FAIL"
        result["error"] = str(e)
        result["ai_analysis"] = analyze_failure(str(e))
    except Exception as e:
        result["status"] = "ERROR"
        result["error"] = traceback.format_exc()
        result["ai_analysis"] = analyze_failure(traceback.format_exc())

    return result

def save_report(url, results, user_id=None):
    """
    Save the test report.
    """
    report = {
        "timestamp": str(datetime.now()),
        "url": url,
        "user_id": user_id,
        "results": results,
        "summary": {
            "total_tests": len(results),
            "passed": sum(1 for r in results if r['status'] == 'PASS'),
            "failed": sum(1 for r in results if r['status'] in ['FAIL', 'ERROR'])
        }
    }

    report_path = os.path.join(
        REPORTS_DIR, f"report_{int(datetime.now().timestamp())}.json"
    )

    with open(report_path, "w") as f:
        json.dump(report, f, indent=4)

    # Upload to S3 if configured
    bucket = os.getenv("S3_BUCKET")
    if bucket and bucket != "optional":
        try:
            upload_file(report_path, bucket)
        except Exception as e:
            print(f"S3 Upload Failed: {e}")

    return report_path
