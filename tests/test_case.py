from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException

def execute_test(driver):

    driver.get("https://example.com")

    try:
        # Primary locator
        driver.find_element(By.ID, "non-existing-id")

    except NoSuchElementException:
        print("Primary locator failed. Trying fallback...")

        try:
            driver.find_element(By.TAG_NAME, "h1")
            print("Recovered using TAG_NAME fallback.")
            return "RECOVERED"

        except:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.TAG_NAME, "p"))
            )
            print("Recovered using WAIT fallback.")
            return "RECOVERED"
