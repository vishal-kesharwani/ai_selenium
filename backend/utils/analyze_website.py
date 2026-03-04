import requests
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By

def get_selector(element):
    """Generate a CSS selector for an element."""
    try:
        if element.get('id'):
            return f"#{element.get('id')}"
        elif element.get('class'):
            classes = ' '.join(element.get('class'))
            return f".{'.'.join(classes.split())}"
        else:
            return element.name
    except:
        return element.name if hasattr(element, 'name') else 'element'

def analyze_website(url):
    """
    Analyze the website and return test recommendations.
    """
    try:
        # Add headers to bypass simple bot detection
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, timeout=10, headers=headers, verify=False, allow_redirects=True)
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

        if not recommendations:
            recommendations.append({
                'element_type': 'info',
                'description': 'No interactive elements found on this page. Consider manual testing.'
            })

        return recommendations

    except requests.exceptions.RequestException as e:
        print(f"Error analyzing website: {e}")
        return [{"error": f"Failed to access website: {str(e)}", "type": "network_error"}]
    except Exception as e:
        print(f"Error analyzing website: {e}")
        return [{"error": f"Analysis failed: {str(e)}", "type": "parsing_error"}]
