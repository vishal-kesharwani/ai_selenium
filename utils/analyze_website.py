import requests
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By

def analyze_website(url):
    """
    Analyze the website and return test recommendations.
    """
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        recommendations = []

        # Find buttons
        buttons = soup.find_all(['button', 'input[type="submit"]', 'input[type="button"]'])
        for btn in buttons:
            selector = get_selector(btn)
            recommendations.append({
                'element_type': 'button',
                'selector': selector,
                'action': 'click',
                'description': f'Click button: {btn.get_text(strip=True) or btn.get("value", "Button")}'
            })

        # Find links
        links = soup.find_all('a', href=True)
        for link in links[:5]:  # Limit to 5 links
            selector = get_selector(link)
            recommendations.append({
                'element_type': 'link',
                'selector': selector,
                'action': 'click',
                'description': f'Click link: {link.get_text(strip=True) or link.get("href")}'
            })

        # Find input fields
        inputs = soup.find_all('input', {'type': ['text', 'email', 'password']})
        for inp in inputs:
            selector = get_selector(inp)
            recommendations.append({
                'element_type': 'input',
                'selector': selector,
                'action': 'type',
                'description': f'Fill input: {inp.get("placeholder", inp.get("name", "Input"))}'
            })

        return recommendations

    except Exception as e:
        return [{'error': str(e)}]

def get_selector(element):
    """
    Generate a CSS selector for the element.
    """
    if element.get('id'):
        return f"#{element['id']}"
    elif element.get('class'):
        classes = ' '.join(element['class'])
        return f".{classes.replace(' ', '.')}"
    else:
        return element.name