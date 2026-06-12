## Plan: Domein vrijmaken + opnieuw setup + end-to-end test

### Stap 1 — Buiten Lovable: domein vrijmaken bij Mailgun (jij doet dit)

Aangezien je weet welk Mailgun-account het is:

1. Log in op dat Mailgun-account (https://app.mailgun.com).
2. Ga naar **Sending → Domains**.
3. Zoek `notify.ftfaacademy.nl` in de lijst.
4. Klik erop → **Delete domain** (rechtsboven, of via instellingen).
5. Bevestig.

Optioneel maar aanbevolen: ook bij Mijndomein de oude DNS-records die naar Mailgun wezen (SPF, DKIM, MX, CNAME's voor `email.notify.*`) opruimen. De nieuwe NS-records die we straks krijgen vervangen die toch.

Laat het mij weten zodra dit gelukt is. Pas dan kan stap 2.

### Stap 2 — In Lovable: domein opnieuw provisionen

Ik haal de huidige (failed) domein-koppeling weg en start opnieuw, zodat Lovable een verse setup-poging doet. Je krijgt opnieuw 2 NS-records (`ns3.lovable.cloud`, `ns4.lovable.cloud`) die je bij Mijndomein voor de subdomein `notify` moet zetten.

### Stap 3 — Bij Mijndomein: NS-records plaatsen

Dezelfde records als vorige keer, voor `notify.ftfaacademy.nl`. DNS-propagatie kan tot 72u duren, meestal binnen een paar uur.

### Stap 4 — Verificatie

Ik check de status periodiek (op jouw signaal, niet automatisch). Zodra status `active` is, kunnen mails écht verstuurd worden.

### Stap 5 — End-to-end test (zodra domein actief is)

Doorloop met echte data:

```text
1. Publieke site → aanmeldformulier invullen     → check applications-rij
2. Admin /admin/applications → approve           → check profiles + players + user_roles + mail "application-decision" in inbox
3. Nieuwe speler-account inloggen                → check email-confirmation mail
4. Admin /admin → slot aanmaken (private)        → check training_slots-rij
5. Speler /dashboard → private slot boeken       → check booking + "booking-confirmed-private" mail
6. Incognito → publieke site → public slot boeken → check guest-booking + "booking-pending-review" mail naar ouder + "admin-new-booking" naar Ferdi
7. Admin → boeking op paid zetten                → check payment_status update
8. Admin → boeking annuleren                     → check "booking-cancelled" mail
```

Per stap controleer ik `email_send_log` (template, status, recipient) en jij bevestigt of de mail aankomt.

### Wat ik nu nodig heb van jou

Eerst stap 1 zelf doen. Geef een seintje "domein verwijderd uit Mailgun" en dan ga ik door met stap 2.

### Risico's

- Als bij Mijndomein nog oude DNS-records van het oude Mailgun-account staan, kan dat de verificatie van Lovable's nieuwe setup vertragen. Beste om die oude records mee te verwijderen.
- Als jij geen delete-rechten hebt op het Mailgun-account, kom je vast. Geef dan een seintje, dan switchen we alsnog naar een andere subdomein (bv. `mail.ftfaacademy.nl`).
