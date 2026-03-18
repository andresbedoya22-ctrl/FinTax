import json
import os

files = {
    'en': 'messages/en.json',
    'es': 'messages/es.json'
}

new_keys = {
    'en': {
        'nav_how': 'How it works',
        'nav_blog': 'Blog',
        'hero_price': 'Fixed-fee plans from EUR 99 depending on case scope.',
        'blog_title': 'Blog preview',
        'final_cta_title': 'Ready to start with clarity?',
        'final_cta_body': 'Open secure intake and receive scope confirmation before full case execution.',
        'legal_title': 'Legal and operational information',
        'legal_body': 'Privacy, terms and workflow scope are published and updated in this public area.'
    },
    'es': {
        'nav_how': 'Cómo funciona',
        'nav_blog': 'Blog',
        'hero_price': 'Planes de tarifa fija desde EUR 99 según alcance del caso.',
        'blog_title': 'Vista previa del blog',
        'final_cta_title': '¿Listo para empezar con claridad?',
        'final_cta_body': 'Abre intake seguro y recibe confirmación de alcance antes de ejecutar el caso.',
        'legal_title': 'Información legal y operativa',
        'legal_body': 'Privacidad, términos y alcance operativo publicados en este espacio público.'
    }
}

for lang, path in files.items():
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    if 'premium' not in data['Landing']:
        data['Landing']['premium'] = {}
        
    data['Landing']['premium']['navHow'] = new_keys[lang]['nav_how']
    data['Landing']['premium']['navBlog'] = new_keys[lang]['nav_blog']
    data['Landing']['premium']['heroPrice'] = new_keys[lang]['hero_price']
    data['Landing']['premium']['blogTitle'] = new_keys[lang]['blog_title']
    data['Landing']['premium']['finalCtaTitle'] = new_keys[lang]['final_cta_title']
    data['Landing']['premium']['finalCtaBody'] = new_keys[lang]['final_cta_body']
    data['Landing']['premium']['legalTitle'] = new_keys[lang]['legal_title']
    data['Landing']['premium']['legalBody'] = new_keys[lang]['legal_body']
    
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

print("Patched translations successfully")
