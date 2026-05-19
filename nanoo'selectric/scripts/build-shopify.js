import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import AdmZip from 'adm-zip';

const themeDir = path.join(process.cwd(), 'shopify-theme');

// Clean up previous build
if (fs.existsSync(themeDir)) {
  fs.rmSync(themeDir, { recursive: true, force: true });
}

// Create directories for OS 2.0
const dirs = ['layout', 'templates', 'templates/customers', 'sections', 'snippets', 'assets', 'config', 'locales'];
dirs.forEach(dir => {
  fs.mkdirSync(path.join(themeDir, dir), { recursive: true });
});

// Run Vite build
console.log('Building React app for Shopify...');
execSync('npx vite build --config vite.shopify.config.ts', { stdio: 'inherit' });

// Delete the generated index.html as it's not needed in Shopify
const indexHtmlPath = path.join(themeDir, 'assets', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  fs.unlinkSync(indexHtmlPath);
}

// Create layout/theme.liquid
const themeLiquid = `<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="">
    <link rel="canonical" href="{{ canonical_url }}">

    <title>{{ page_title }}</title>

    {% if page_description %}
      <meta name="description" content="{{ page_description | escape }}">
    {% endif %}

    {{ content_for_header }}

    {{ 'react-app.css' | asset_url | stylesheet_tag }}
  </head>

  <body>
    <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>

    <script src="{{ 'react-app.js' | asset_url }}" defer="defer"></script>
  </body>
</html>`;
fs.writeFileSync(path.join(themeDir, 'layout', 'theme.liquid'), themeLiquid);

// Create sections/react-root.liquid
const reactRootLiquid = `<div id="root" class="react-app-container"></div>
{% schema %}
{
  "name": "React App Root",
  "target": "section",
  "settings": [],
  "presets": [
    {
      "name": "React App Root"
    }
  ]
}
{% endschema %}`;
fs.writeFileSync(path.join(themeDir, 'sections', 'react-root.liquid'), reactRootLiquid);

// Create JSON templates for OS 2.0
const jsonTemplate = JSON.stringify({
  "sections": {
    "main": {
      "type": "react-root"
    }
  },
  "order": ["main"]
}, null, 2);

const templates = [
  'index.json', 'product.json', 'collection.json', 'cart.json', 
  '404.json', 'page.json', 'blog.json', 'article.json', 
  'list-collections.json', 'search.json', 'gift_card.json', 'password.json'
];

templates.forEach(template => {
  fs.writeFileSync(path.join(themeDir, 'templates', template), jsonTemplate);
});

// Create config/settings_schema.json
const settingsSchema = `[
  {
    "name": "theme_info",
    "theme_name": "React App Theme",
    "theme_author": "AI Studio",
    "theme_version": "1.0.0",
    "theme_documentation_url": "https://example.com",
    "theme_support_url": "https://example.com"
  },
  {
    "name": "Colors",
    "settings": [
      {
        "type": "color",
        "id": "color_primary",
        "label": "Primary color",
        "default": "#000000"
      }
    ]
  }
]`;
fs.writeFileSync(path.join(themeDir, 'config', 'settings_schema.json'), settingsSchema);

// Create config/settings_data.json
const settingsData = `{
  "current": {
    "blocks": {},
    "sections": {},
    "settings": {}
  }
}`;
fs.writeFileSync(path.join(themeDir, 'config', 'settings_data.json'), settingsData);

// Create locales/en.default.json
const localesEn = `{
  "general": {
    "password_page": {
      "login_form_heading": "Enter store using password",
      "login_password_button": "Enter using password",
      "login_form_password_label": "Password",
      "login_form_password_placeholder": "Your password",
      "login_form_error": "Wrong password!",
      "login_form_submit": "Enter"
    }
  }
}`;
fs.writeFileSync(path.join(themeDir, 'locales', 'en.default.json'), localesEn);

console.log('Shopify theme generated successfully in ./shopify-theme');

// Zip the directory
console.log('Creating zip file...');
const zip = new AdmZip();
zip.addLocalFolder(themeDir);
const zipPath = path.join(process.cwd(), 'shopify-theme.zip');
zip.writeZip(zipPath);

console.log('Successfully created ' + zipPath);
console.log('You can now download shopify-theme.zip and upload it to your Shopify store.');
