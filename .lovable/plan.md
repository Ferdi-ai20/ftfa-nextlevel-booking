# Favicon vervangen met nieuw FTFA-logo

## Probleem
De browsertab toont nog het oude FT-shield logo uit de WordPress-tijd, omdat `public/favicon.ico` nog het oude bestand is en er geen expliciete favicon-link in `index.html` staat.

## Aanpak

1. **Favicon-bestand vervangen**
   - Het uploaded logo (`BB008121-9121-4E3A-8277-7B0DE29E8680.png`) is breed met veel zwarte ruimte eromheen — als favicon (16×16 / 32×32 px) wordt de tekst onleesbaar klein.
   - Crop het logo naar een vierkant frame rond de "FTFA" tekst (met wat padding) zodat het herkenbaar blijft op klein formaat.
   - Schrijf het resultaat naar `public/favicon.png` (vierkant, ~512×512).
   - Verwijder de oude `public/favicon.ico` zodat browsers niet automatisch terugvallen op het oude shield.

2. **`index.html` updaten**
   - Voeg expliciete favicon-links toe in `<head>`:
     ```html
     <link rel="icon" type="image/png" href="/favicon.png" />
     <link rel="apple-touch-icon" href="/favicon.png" />
     ```

## Belangrijk om te weten
- **Browser-cache:** Safari/Chrome cachen favicons agressief. Zelfs na deze update kan het oude logo nog enkele uren of dagen in je tab-switcher staan tot de cache vervalt. Hard refresh (Cmd+Shift+R) of de tab sluiten en opnieuw openen helpt meestal.
- **Tab-switcher screenshot:** de afbeelding die je deelde komt uit Safari's tab-overzicht — dat is een gecachete preview van toen je de pagina voor het laatst bezocht. Die preview update pas als je de pagina opnieuw laadt.

## Bestanden
- `public/favicon.png` (nieuw)
- `public/favicon.ico` (verwijderen)
- `index.html` (favicon-links toevoegen)
