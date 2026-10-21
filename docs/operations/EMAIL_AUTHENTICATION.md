# Autentikacija e-pošte (SPF, DKIM, DMARC)

**Status:** Potrebno prije stvarnog slanja. Nije konfigurisano.
**Odluka:** OD-PP-28
**Transport u ovom repou:** stub. Amazon SES adapter postoji i nije odabran. Nema ključa i nema slanja.

Ovaj dokument nije dokaz da je domena autentikovana.

## Prije uključivanja SES-a

1. Potvrditi identitet pošiljaoca u Amazon SES (domena, ne samo adresa).
2. Objaviti SPF zapis koji ovlašćuje SES za tu domenu. Jedan domen ima jedan SPF `TXT` zapis.
3. Uključiti Easy DKIM u SES-u i objaviti tri CNAME zapisa koje SES izda. Pošta mora biti potpisana prije produkcije.
4. Objaviti DMARC `TXT` zapis na `_dmarc`. Početi sa `p=none` i izvještajima, pa preći na `quarantine` ili `reject` kad izvještaji budu čisti.
5. Uskladiti adresu pošiljaoca (`From`) sa domenom u SPF i DKIM, inače DMARC ne prolazi.
6. Bounce i complaint pretplatu usmjeriti na zaštićeni poziv. Trenutna kuka je `POST /v1/staff/notices/:jobId/bounce` i `POST /v1/staff/notices/:jobId/complaint`, samo za `COM_TECH`. Javni nepotpisani webhook nije uključen.

Bez ova četiri koraka (identitet, SPF, DKIM, DMARC) transport ostaje stub.
