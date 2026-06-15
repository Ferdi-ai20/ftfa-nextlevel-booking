Het huidige domein `notify.ftfaacademy.nl` is mislukt omdat het al bij een andere Mailgun-account geregistreerd staat. We zetten een nieuw subdomein op: **mail.ftfaacademy.nl**.

## Stappen

1. Bestaande mislukte domein-registratie (`notify.ftfaacademy.nl`) opruimen via de Email-setup dialoog.
2. Nieuw domein `mail.ftfaacademy.nl` toevoegen via de email setup flow.
3. Jij voegt bij je DNS-provider (waar `ftfaacademy.nl` beheerd wordt) de NS-records toe die Lovable opgeeft (`ns3.lovable.cloud` / `ns4.lovable.cloud` op subdomein `mail`).
4. Wachten op DNS-propagatie (kan tot 72 uur, meestal sneller).
5. Zodra status `active` is, gaan alle transactionele mails (booking-bevestigingen, application decisions, etc.) automatisch verzenden vanaf `mail.ftfaacademy.nl`.
6. De bestaande edge functions en email templates blijven werken — alleen het afzenderdomein verandert; geen code-wijzigingen nodig.

## Belangrijk om te weten

- Zorg dat `mail.ftfaacademy.nl` nergens anders al in gebruik is (geen oude Mailgun/Resend/SendGrid registratie), anders krijgen we dezelfde fout opnieuw.
- Verwijder ook eventuele bestaande NS/MX/TXT records op `mail` subdomein bij je DNS provider voordat je de Lovable NS records toevoegt.
