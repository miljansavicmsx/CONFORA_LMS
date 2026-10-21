# Odluke vlasnika — plan proizvoda CONFORA

**Document ID:** CON-GOV-OD-PP-2026-10-19
**Status:** Recorded 2026-10-19; OD-PP-12 confirmed 2026-10-20; OD-PP-15 … OD-PP-18 accepted 2026-10-20; OD-PP-19 … OD-PP-25 accepted 2026-10-21; OD-PP-26 … OD-PP-29 accepted 2026-10-21
**Owner:** Miljan Savić, Repository Owner
**Authority level:** Governance Hierarchy Level 1
**Companion:** [OWNER_DECISION_REGISTER.md](./OWNER_DECISION_REGISTER.md) Part F (OD-PP-01 … OD-PP-29)

Ovaj zapis prenosi odluke koje je vlasnik odobrio u ovom zadatku: specifikaciju proizvoda, analizu razlika (uključujući „Zahtjevi za akreditaciju”) i analizu primjenjivosti standarda. Tekst standarda nije unesen u repozitorij. Zapis nije elektronski potpis niti dokaz akreditacije. Mapiranje na klauzulu nije tvrdnja o usaglašenosti.

Ovlaštenje za implementaciju u ovom paketu ograničeno je na ovaj zapis, registar, Prisma šemu, migraciju, opis modela podataka i testove šeme. Nisu ovlašteni API, korisničko sučelje, izdavanje certifikata, prikupljanje slike s webkamere, obrada JMBG-a, niti produkcijsko postavljanje.

---

## OD-PP-01 — Razdvajanje obuke i certifikacije

| Field           | Value                                                                                                                                                                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Date            | 2026-10-19                                                                                                                                                                                                                                                                           |
| Status          | ACCEPTED                                                                                                                                                                                                                                                                             |
| Approved option | Obuka i certifikacija ostaju odvojene. Postoji alternativni put certifikacije uz dokaz vanjske obuke. Trener ne smije ispitivati niti nadzirati vlastitog polaznika. PDF nakon kviza je samo potvrda o pohađanju. Certifikat osobe izdaje se samo odlukom komiteta za certifikaciju. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                                                                       |
| Rationale       | ISO/IEC 17024:2026, klauzule 5.2.3 a–e. Specifikacija 6.1 i Baseline §11.1 za Fast-Track opisuju automatsko izdavanje koje se ne smije primijeniti na certifikat osobe.                                                                                                              |
| Scope           | Put prijave, SoD trener/ispitivač/nadzornik, tipovi isprava                                                                                                                                                                                                                          |
| Residual risk   | Tekst Baseline §11.1 nije prepisan u ovom paketu. Workflow izdavanja nije implementiran.                                                                                                                                                                                             |
| Dependencies    | OD-PP-06, OD-PP-14                                                                                                                                                                                                                                                                   |
| Exit criteria   | Osoblje i komitet primjenjuju pravilo u procesu; šema to tehnički nosi, a izdavanje čeka kasniji ovlašteni paket                                                                                                                                                                     |
| Supersession    | Za certifikat osobe zamjenjuje Baseline §11.1 tačku 7 („Certificate auto-generated”) i rečenicu da Fast-Track ne traži glas komiteta. Ne dira potvrdu o pohađanju.                                                                                                                   |

Potvrda o pohađanju može nastati nakon završene CONFORA obuke i položenog kviza, bez odluke komiteta. Ona nije certifikat osobe, ne ulazi u javni registar kao certifikat osoblja i ne nosi obim šeme certifikacije.

Prijava za certifikaciju ne smije zahtijevati isključivo CONFORA kurs. Put `EXTERNAL_EQUIVALENT` prima dokaz ekvivalentne vanjske obuke. Put `CONFORA_TRAINING` veže se na upis samo kada kandidat taj put sam izabere.

Marketing tipa „kupi kurs pa lakše položi” nije odobren.

Promjena teksta Baselinea i dalje traži vlasnika i Architecture Lead zajedno (Change Control §2). Ovaj zapis je Level 1 zamjena samo navedene dvije rečenice. Nezavisni pregled te zamjene ostaje uslov prije implementacije izdavanja, jer jedna osoba privremeno može držati više uloga.

---

## OD-PP-02 — AMF, pristup certifikaciji i suspenzija

| Field           | Value                                                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                                                                     |
| Status          | ACCEPTED                                                                                                                                                                                                                                       |
| Approved option | Članarina AMF ne smije biti uslov pristupa certifikaciji. Neplaćanje AMF otvara prijedlog suspenzije. Prijedlog postaje suspenzija tek nakon ljudske potvrde. Suspenzija je vremenski ograničena; ako se ne riješi u roku, slijedi povlačenje. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                                 |
| Rationale       | ISO/IEC 17024:2026, 4.3.6 i 9.5. Automatski prelazak Valid u Suspended iz specifikacije tačke 2 nije prihvaćen.                                                                                                                                |
| Scope           | Članarina, prijedlog suspenzije, statusi isprave                                                                                                                                                                                               |
| Residual risk   | Pravni tekst pravila šeme i ugovor o neisticanju za vrijeme suspenzije nisu napisani u ovom paketu.                                                                                                                                            |
| Dependencies    | OD-PP-01                                                                                                                                                                                                                                       |
| Exit criteria   | Objavljena pravila šeme opisuju naknadu, suspenziju i povlačenje; sistem ne veže prijavu za članarinu                                                                                                                                          |
| Supersession    | Zamjenjuje automatsku suspenziju iz specifikacije tačke 2. Ne ukida naknadu koju šema javno propiše kao naknadu, a ne kao članstvo.                                                                                                            |

Baseline §11.1 tačka 2 („Payment confirmed where applicable”) ostaje za naknadu koju šema objavi kao naknadu. Ne ovlašćuje članstvo kao uslov pristupa.

Statusi isprave su Active, Expired, Suspended i Withdrawn. Dodatno se vodi Scope reduced, jer 9.5 traži i sužavanje obima. Sužavanje nije automatska posljedica AMF-a.

Za vrijeme suspenzije certificirano lice ne ističe certifikat. Rok suspenzije i rok do povlačenja bilježe se na događaju životnog ciklusa. Povlačenje potvrđuje čovjek.

---

## OD-PP-03 — Politika upotrebe AI

| Field           | Value                                                                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                                                                                                    |
| Status          | ACCEPTED                                                                                                                                                                                                                                                                      |
| Approved option | AI samo pomaže. Čovjek prihvata ili odbija prijedlog (Accept AI Suggestion). Svaki takav izlaz nosi is_ai_generated. Vodi se AI audit zapis. Kandidat prije AI interakcije dobija obavještenje i potvrđuje da je upoznat. Za svaku AI funkciju radi se AIIA po ISO/IEC 42005. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                                                                |
| Rationale       | Baseline §12, ISO/IEC 17024:2026 4.3.5 i 6.5, posebno 6.5(b) i 6.5(f).                                                                                                                                                                                                        |
| Scope           | Tutor, nacrt sadržaja, nacrt pitanja, analiza grešaka, signal proctoringa, prijedlozi za rizik i metapodatke                                                                                                                                                                  |
| Residual risk   | ISO/IEC 42001 nije u biblioteci. AIIA dokumenti još nisu popunjeni. AI ne smije donijeti odluku o certifikaciji niti sam diskvalifikovati kandidata.                                                                                                                          |
| Dependencies    | OD-PP-04, OD-PP-05, OD-PP-08                                                                                                                                                                                                                                                  |
| Exit criteria   | Svaka uključena AI funkcija ima identifikator sistema, AIIA referencu, ljudski pregled gdje ulazi u ispit ili certifikaciju, i zapis potvrde kandidata                                                                                                                        |
| Supersession    | Dopuna Baseline §12: obavezna potvrda kandidata i AIIA. Ne sužava postojeće zabrane.                                                                                                                                                                                          |

AI proctoring je signal. Ne postavlja ishod ispita. Pitanje koje generiše AI ostaje u stanju nacrta dok ga SME ne odobri.

Dozvoljeni MVP slučajevi ostaju oni iz Baseline §12. Ovaj paket ne uključuje model ni provajdera.

---

## OD-PP-04 — Online ispit

| Field           | Value                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                              |
| Status          | ACCEPTED                                                                                                                                                                                |
| Approved option | Online ispit uključuje prihvaćena pravila, NDA, nadzornika uživo, provjeru identiteta od strane čovjeka i MFA. AI proctoring je samo signal. Ponovno polaganje je najranije za 90 dana. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                          |
| Rationale       | ISO/IEC 17024:2026 7.4.4, ISO/IEC 23988 kao referentni okvir za isporuku ispita informatičkim sredstvima, specifikacija tačke 3 i 7.                                                    |
| Scope           | Ispitna sesija, identitet, nadzor, MFA referenca, proctor zapis                                                                                                                         |
| Residual risk   | Siguran preglednik, psihometrija i oprema kandidata nisu u ovom paketu. Prikupljanje slike čeka OD-PP-05.                                                                               |
| Dependencies    | OD-PP-01, OD-PP-03, OD-PP-05                                                                                                                                                            |
| Exit criteria   | Prvi akreditabilni online ispit ne kreće bez ovih kontrola. Šema ih čini obaveznim poljima sesije.                                                                                      |
| Supersession    | Usklađuje specifikaciju 7 s Baseline §8 i §9: provjera identiteta nije IAL-3.                                                                                                           |

Provjera identiteta je ljudsko poređenje slike službene isprave i slike kandidata (IAL-2). Metoda u šemi je samo `HUMAN_VISUAL`. Nema biometrijskog šablona, prepoznavanja lica niti automatskog poređenja.

Nadzor uživo je rad nadzornika. Video zapis, ako se kasnije čuva, slijedi Baseline §9 za ispitni video (60 dana, osim pravnog zadržavanja) i ne smije se prikupljati prije DPIA.

Slika isprave slijedi Baseline §9 za KYC sliku (14 dana nakon provjere). Zapis odluke provjeravača ostaje u roku za KYC zapis.

Baseline §8 i §9 i dalje zabranjuju IAL-3 i namjernu obradu biometrije u MVP-u. Ovaj zapis to ne ukida.

---

## OD-PP-05 — DPIA prije webkamere, isprave i JMBG-a

| Field           | Value                                                                                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                                                                                |
| Status          | ACCEPTED                                                                                                                                                                                                                                                  |
| Approved option | Obrada slike s webkamere, slike lične isprave i JMBG-a nije dozvoljena dok se ne završi DPIA. Osnova su ISO/IEC 29100:2024 i ISO/IEC 27018:2025. U biblioteci nema 29134 ni 27701; do nabavke koriste se načela 29100, kontrole 27018 i smjernice EDPB-a. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                                            |
| Rationale       | Posebne i osjetljive kategorije podataka, Baseline §8 i §9, specifikacija 7 i 12.1.                                                                                                                                                                       |
| Scope           | Identitet, proctoring, nacionalni identifikator na profilu                                                                                                                                                                                                |
| Residual risk   | DPIA nije izrađena. Kolone u šemi nisu odobrenje za prikupljanje.                                                                                                                                                                                         |
| Dependencies    | OD-PP-04, OD-PP-08                                                                                                                                                                                                                                        |
| Exit criteria   | DPO ili ovlašteni pregled potvrdi DPIA prije nego što aplikacija upisuje ove podatke                                                                                                                                                                      |
| Supersession    | —                                                                                                                                                                                                                                                         |

JMBG se ne objavljuje i ne koristi kao javni identifikator. Javni identifikator isprave je `CON-YYYY-NNNN`.

---

## OD-PP-06 — Mapiranje uloga

| Field           | Value                                                                                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                                                |
| Status          | ACCEPTED                                                                                                                                                                                                                  |
| Approved option | Nazivi iz specifikacije mapiraju se na postojeće kanonske kodove. Lokalna baza ne postaje izvor ovlaštenja uloge. Članstvo u komitetu je zapis imenovanja i mora odgovarati kodu koji je već dodijeljen u vanjskom IdP-u. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                            |
| Rationale       | Baseline §6 i MD05 Phase 0: `ROLE_AUTHORITY_SOURCE = EXTERNAL_OIDC_IDP_CANONICAL`, `LOCAL_DATABASE_ROLE_AUTHORITY = false`.                                                                                               |
| Scope           | Nazivi specifikacije 11.1 i 12.1, plus uloge koje Baseline već traži za ispit i AI                                                                                                                                        |
| Residual risk   | Kodovi nisu time i upisani u IdP. `STAFF_ROLEADM` i `COMPLAINT_HANDLER` ostaju neimplementirani kako je zamrznuto u MD05.                                                                                                 |
| Dependencies    | MD05 Phase 0 freeze R2                                                                                                                                                                                                    |
| Exit criteria   | IdP dodjela i zapis imenovanja koriste istu tabelu kodova                                                                                                                                                                 |
| Supersession    | Ne uvodi nove kodove i ne pretvara specifikacijski naziv u drugi identifikator.                                                                                                                                           |

| Naziv u specifikaciji           | Kanonski kod          | Napomena                                                                       |
| ------------------------------- | --------------------- | ------------------------------------------------------------------------------ |
| korisnik                        | `USR_CAND`            | `USR_CERT` kada osoba ima aktivan certifikat osobe                             |
| rukovodilac CB                  | `STAFF_DIR`           | prati upravljanje; ne donosi operativnu odluku o certifikaciji (Baseline §7.4) |
| sys admin                       | `STAFF_SYSADM`        | vidi OD-PP-07                                                                  |
| admin obuka                     | `STAFF_TRAINADM`      | obuka, ne odluka o certifikaciji                                               |
| član tehničkog komiteta         | `COM_TECH`            | specifikacija 6 i 7                                                            |
| član komiteta za certifikaciju  | `COM_CERT`            | specifikacija 8                                                                |
| član komiteta za žalbe          | `COM_APP`             | specifikacija 9                                                                |
| član komiteta za nepristrasnost | `COM_IMP`             | specifikacija 11.1; nije u padajućoj listi 12.1, ali jeste kanonski            |
| auditor                         | `STAFF_AUD`           | interni audit                                                                  |
| ispitivač                       | `EXAMINER`            | Baseline §6 i 17024 6.2; nije u listi 12.1                                     |
| nadzornik                       | `INVIGILATOR`         | Baseline §6 i 17024 7.4.4                                                      |
| predmetni stručnjak             | `SME`                 | odobrenje AI pitanja, 6.5(b)                                                   |
| menadžer kvaliteta              | `QUALITY_MANAGER`     | ostaje iz Baselinea                                                            |
| menadžer AI sigurnosti          | `AI_SECURITY_MANAGER` | ostaje iz Baselinea                                                            |
| obrađivač prigovora             | `COMPLAINT_HANDLER`   | MD05; nije alias iz specifikacije                                              |
| administrator uloga             | `STAFF_ROLEADM`       | MD05; dodjela i oduzimanje ostaju na IdP-u                                     |

Pristup po specifikaciji 11, uz OD-PP-07: tehnički komitet radi obuku i konfiguraciju ispita; komitet za certifikaciju radi šemu i odluku; komitet za žalbe radi žalbe; direktor i sistem-administrator rade izvještaje u granicama dužnosti; zaposleni rade upravljanje u granicama dužnosti. Ista osoba ne trenira kandidata i ne odlučuje o njegovoj certifikaciji (Baseline §7.1).

---

## OD-PP-07 — Najmanja ovlaštenja i break-glass

| Field           | Value                                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                          |
| Status          | ACCEPTED                                                                                                                                                                                            |
| Approved option | „Sys admin vidi sve” se ne usvaja. Sistem-administrator ima najmanja ovlaštenja. Širi pristup ide preko break-glass zapisa s razlogom, opsegom i vremenom. Ne smije izmijeniti ishod certifikacije. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                      |
| Rationale       | AGENTS.md zabrana nekontrolisanog admin pristupa, Baseline §7.5, SoD.                                                                                                                               |
| Scope           | Specifikacija 12                                                                                                                                                                                    |
| Residual risk   | Break-glass još nema aplikacijski tok. Šema samo čuva zapis.                                                                                                                                        |
| Dependencies    | OD-PP-06                                                                                                                                                                                            |
| Exit criteria   | Svaki prošireni pristup ima zapis i audit događaj; nema stalne uloge „vidi sve”                                                                                                                     |
| Supersession    | Zamjenjuje specifikaciju 12 u dijelu „sve vidi”.                                                                                                                                                    |

---

## OD-PP-08 — Osnova politike privatnosti

| Field           | Value                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                     |
| Status          | ACCEPTED                                                                                                                                                                                       |
| Approved option | Osnova politike privatnosti je ISO/IEC 29100:2024. PII u javnom oblaku, uključujući JMBG, sliku isprave i kameru, dodatno se oslanja na ISO/IEC 27018:2025. GDPR rokovi iz Baseline §9 ostaju. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                 |
| Rationale       | 17024 7.3.2 i analiza standarda, odjeljak 8. Raniji MD05 zapis navodi da osnova privatnosti nije bila upisana.                                                                                 |
| Scope           | Identifikator osnove. Nije tekst politike ni završena DPIA.                                                                                                                                    |
| Residual risk   | MD05 ostaje neriješen. 27701 i 29134 nisu u biblioteci. Tekst obavještenja za kandidate nije napisan.                                                                                          |
| Dependencies    | OD-PP-05                                                                                                                                                                                       |
| Exit criteria   | Objavljena politika i DPIA pozivaju se na ove oznake i na Baseline §9                                                                                                                          |
| Supersession    | Popunjava prazninu „privacy basis unrecorded” kao identifikator osnove. Ne zatvara MD05, ne odobrava rad na žalbama i prigovorima i ne mijenja rokove čuvanja.                                 |

Načela koja politika mora pokriti, vlastitim riječima CONFORA-e, a ne tekstom standarda: saglasnost, ograničenje svrhe, minimizacija, tačnost, ograničenje čuvanja, sigurnost, transparentnost, prava lica, odgovornost, privatnost od dizajna. Jedanaesto načelo okvira primjenjuje se kao zabrana obrade koja nije potrebna za navedenu svrhu.

Log javne provjere (IP, vrijeme, identifikator isprave, rezultat) tretira se kao audit zapis iz Baseline §9 (najmanje 10 godina). To je primjena postojećeg roka, a ne novi rok.

Analitika učenja slijedi svrhu, saglasnost i minimizaciju (ISO/IEC TS 20748-4 kao referenca). xAPI zapis bez zabilježene saglasnosti za analitiku ne smije ići u AI analizu.

---

## OD-PP-09 — Nefunkcionalni zahtjevi po ISO/IEC 25010:2023

| Field           | Value                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                              |
| Status          | ACCEPTED                                                                                                |
| Approved option | Usvaja se sljedeća lista NFR-ova. Ona je zahtjev, ne dokaz da je proizvod već tako izgrađen.            |
| Owner           | Miljan Savić, Repository Owner                                                                          |
| Rationale       | Analiza standarda, korak 0: ISO/IEC 25010:2023.                                                         |
| Scope           | Svi moduli specifikacije 1–12                                                                           |
| Residual risk   | Nema mjerenja ni izvještaja evaluacije. ISO/IEC 29119 plan testa za ispitni motor dolazi s tim motorom. |
| Dependencies    | —                                                                                                       |
| Exit criteria   | Kasniji moduli navode koji NFR dotiču i kako se provjerava                                              |
| Supersession    | —                                                                                                       |

| ID     | Karakteristika 25010:2023 | Zahtjev CONFORA                                                                                                                               |
| ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | Functional suitability    | Funkcije pokrivaju specifikaciju 1–12 u granicama ovih odluka, uključujući odvojen tip potvrde o pohađanju i certifikata osobe.               |
| NFR-02 | Functional suitability    | Pravila SoD iz OD-PP-01 i Baseline §7 izvršavaju se na serveru.                                                                               |
| NFR-03 | Performance efficiency    | Katalog kurseva i javna provjera odgovaraju u interaktivnom vremenu za očekivani pilot obim. Tačan broj korisnika nije fiksiran ovim zapisom. |
| NFR-04 | Performance efficiency    | Trajanje ispita je zbir vremena po stavci. Istek vremena čuva već dane odgovore.                                                              |
| NFR-05 | Compatibility             | xAPI zapis koristi prepoznatljiv actor, verb, object i result kako bi se kasnije mogao prenositi.                                             |
| NFR-06 | Compatibility             | Isti kandidat može imati obuku u CONFORA-i ili dokaz vanjske obuke bez drugog korisničkog naloga.                                             |
| NFR-07 | Interaction capability    | Sučelje je na `bs-BA` i `en-US` (Baseline §14).                                                                                               |
| NFR-08 | Interaction capability    | WCAG 2.2 nivo AA za ispit, prijavu i javnu provjeru. Potrebe pristupačnosti su na profilu (ISO/IEC 24751).                                    |
| NFR-09 | Reliability               | Prekid ispita ne briše odgovore. Pokušaj se može označiti kao prekinut i nastaviti po pravilima šeme.                                         |
| NFR-10 | Reliability               | Audit lanac ostaje dopisiv i vezan hešom, kako je već zamrznuto za `AuditEvent`.                                                              |
| NFR-11 | Security                  | Vidi OD-PP-10. Tenant, MFA osoblja i MFA ispita su obavezni.                                                                                  |
| NFR-12 | Security                  | Javna provjera ne otkriva JMBG, sliku isprave ni sadržaj prijave.                                                                             |
| NFR-13 | Maintainability           | Domenski model je u jednoj Prisma šemi, s migracijom i testom invarijanti.                                                                    |
| NFR-14 | Maintainability           | Kanonski kodovi uloga ostaju u `packages/shared-types`; šema ih ne duplira kao tabelu ovlaštenja.                                             |
| NFR-15 | Flexibility               | Novi kurs, šema i stavka pitanja dodaju se podacima, bez promjene koda po svakoj šemi MVP kataloga iz Baseline §10.                           |
| NFR-16 | Safety                    | AI i proctoring ne smiju sami uskratiti certifikaciju ili prekinuti ispit. Štetna automatska odluka je zabranjena, a ne samo nepoželjna.      |

ISO/IEC 25019 i 25012 ostaju reference za kasnije mjerenje zadovoljstva i tačnosti registra. Nisu posebne odluke u ovom paketu.

---

## OD-PP-10 — Katalog sigurnosnih kontrola aplikacije

| Field           | Value                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                         |
| Status          | ACCEPTED                                                                                                                                                                                           |
| Approved option | Usvaja se katalog kontrola aplikacije u smislu ISO/IEC 27034 (organizacioni okvir i kontrole aplikacije). Katalog nije certifikat po 27034 i ne zamjenjuje ISO/IEC 27001, kojeg nema u biblioteci. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                     |
| Rationale       | Analiza standarda, korak 0. 17024 7.4 traži sigurnost ispita i podataka.                                                                                                                           |
| Scope           | Aplikacija CONFORA, posebno ispit, registar, AI i javna provjera                                                                                                                                   |
| Residual risk   | Većina kontrola je zahtjev. Implementacija i provjera ostaju djelimične (OQ-7).                                                                                                                    |
| Dependencies    | OD-PP-07, OD-PP-08                                                                                                                                                                                 |
| Exit criteria   | Svaka kontrola ima implementaciju i test prije tvrdnje da je zatvorena                                                                                                                             |
| Supersession    | —                                                                                                                                                                                                  |

| ID     | Kontrola            | Zahtjev                                                                                         | Implementacija danas                              | Provjera                                    | Ostatak                                 |
| ------ | ------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------- | --------------------------------------- |
| ASC-01 | Autentikacija       | OIDC; MFA za osoblje, komitete i privilegovane uloge; MFA referenca na ispitnoj sesiji          | Djelimično, postojeći auth paket                  | Nije predmet ovog paketa                    | MFA referenca na sesiji tek u šemi      |
| ASC-02 | Tenant izolacija    | Svaka poslovna tabela ima `tenantId`; upit je u tenant kontekstu                                | Šema ovog paketa i postojeći modeli               | Testovi historijskih modela                 | OQ-7 i dalje otvoren                    |
| ASC-03 | Audit               | Kritične radnje idu u postojeći `AuditEvent` lanac; ovaj paket ne pravi drugi lanac             | `AuditEvent` / `AuditChainHead`                   | Postojeći BAR-P05 testovi                   | Novi moduli još ne emituju događaje     |
| ASC-04 | Najmanja ovlaštenja | Nema tabele uloga koja dodjeljuje pravo; imenovanje u komitet nije grant                        | Šema bez `Role` / `UserRole`                      | Test zabrane tih tabela                     | IdP i dalje van repoa                   |
| ASC-05 | SoD                 | Trener nije ispitivač ni nadzornik svog polaznika; odluku ne donosi učesnik obuke tog kandidata | Polja COI na učesniku odluke i dužnosti na ispitu | Šema; pravilo još nije u servisu            | Servis kasnije                          |
| ASC-06 | Break-glass         | Razlog, opseg, početak i kraj; audit                                                            | Model `BreakGlassAccess`                          | Nema toka                                   | Tok i alarm                             |
| ASC-07 | Javna provjera      | Rate limit i CAPTCHA; log IP, vremena, identifikatora i rezultata                               | Model `VerificationLog`                           | Nema                                        | Rate limit i CAPTCHA nisu u ovom paketu |
| ASC-08 | Integritet isprave  | Heš sadržaja, potpis, QR token                                                                  | Kolone na `Credential`                            | Nema kriptografske provjere                 | Potpisni servis kasnije                 |
| ASC-09 | Tajne               | Tajne nisu u šemi ni u migraciji                                                                | Nema novih tajni                                  | Pregled difa                                | —                                       |
| ASC-10 | Prenos              | TLS na javnim servisima                                                                         | Izvan ovog paketa                                 | —                                           | Infrastruktura                          |
| ASC-11 | Datoteke identiteta | Ključ objekta, ne binar u bazi; rok čuvanja; pristup po dužnosti                                | Kolone ključa i `retainUntil`                     | Nema                                        | DPIA i brisanje                         |
| ASC-12 | AI                  | Oznaka, heš upita i izlaza, ljudsko prihvatanje                                                 | Modeli AI zapisa                                  | Nema runtime                                | AIIA dokumenti                          |
| ASC-13 | Biometrija          | Zabranjena u MVP-u                                                                              | Enum metode ima samo ljudski pregled              | Test šeme                                   | Ostaje zabrana                          |
| ASC-14 | Ispitni materijal   | Stavke nisu javne; pristup po dužnosti                                                          | Tenant na item banku                              | Nema                                        | Šifriranje banke kasnije                |
| ASC-15 | Zavisnosti i CI     | Sigurnosne provjere u postojećem CI-u                                                           | Postojeći workflow                                | Ovaj paket pokreće lint, tip i testove šeme | 27034 dio o SDLC nije zatvoren          |

ISO/IEC 27017 ostaje referenca za podjelu odgovornosti s pružaocem oblaka. Nije odluka o izboru pružaoca.

---

## OD-PP-11 — xAPI zapisi od prvog dana

| Field           | Value                                                                                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                           |
| Status          | ACCEPTED                                                                                                                                                             |
| Approved option | Lekcija, kviz i ispit od prvog dana upisuju xAPI zapis učenja. Historija se ne rekonstruira naknadno. Saglasnost za analitiku je posebna od samog zapisa aktivnosti. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                       |
| Rationale       | ISO/IEC/IEEE 39274-1-1:2025 i analiza standarda, korak 2. Specifikacija 2.2 i 12.1.                                                                                  |
| Scope           | `LearningActivityRecord`                                                                                                                                             |
| Residual risk   | Emiter u aplikaciji nije dio ovog paketa. Sirovi JSON ne smije sadržavati JMBG ni sliku isprave.                                                                     |
| Dependencies    | OD-PP-08                                                                                                                                                             |
| Exit criteria   | Prvi player i prvi ispit pišu zapis u istoj transakciji kao napredak                                                                                                 |
| Supersession    | —                                                                                                                                                                    |

---

## OD-PP-12 — Frontend: Vite ili Next.js

| Field           | Value                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-20                                                                                                                   |
| Status          | ACCEPTED                                                                                                                     |
| Approved option | Isporučujemo na Vite `frontend-app` (opcija A). Next.js (`apps/web`, `apps/admin`) je odgođen.                               |
| Owner           | Miljan Savić, Repository Owner — potvrda 2026-10-20                                                                          |
| Rationale       | Operativni frontend i F5 dokazi već su na `frontend-app`. Vlasnik je 2026-10-20 potvrdio preporuku.                          |
| Scope           | Površina isporuke plana proizvoda. Ne uključuje prepis Baselinea ni gašenje Next.js aplikacija.                              |
| Residual risk   | Baseline §0.2 i §4.1 i dalje opisuju Next.js kao cilj. ADR-001 ostaje u suprotnosti. OQ-4 ostaje OPEN.                       |
| Dependencies    | Change Control §2 (vlasnik i Architecture Lead zajedno) prije izmjene teksta Baselinea. OQ-4 / R0-1B2 prije zamjene ADR-001. |
| Exit criteria   | Potvrda površine isporuke je ispunjena. Preostaje usklađenje teksta, koje ovaj zapis ne radi.                                |
| Supersession    | Za isporuku plana proizvoda bira Vite i odgađa Next.js. Ne zatvara OQ-4, ne zamjenjuje ADR-001 i ne prepisuje Baseline.      |

Opcija A — nastaviti isporuku na Vite `frontend-app`. To je današnji operativni kanonski frontend za zaključani lokalni release candidate. Pilot rute i F5 dokazi već su na njemu. Cijena: ADR-001 ostaje u suprotnosti, a Next.js cilj se odgađa. **Vlasnik je 2026-10-20 odobrio ovu opciju.**

Opcija B — novi rad graditi na Next.js `apps/web` i `apps/admin`, kako Baseline §4.1 i ADR-001 opisuju cilj. **Nije odobrena.** Ostaje odgođena. Gap note i dalje traži matricu pariteta, ponovljeni E2E, izmjenu ADR-001, plan gašenja i a11y/i18n potvrdu prije bilo kakve tvrdnje da je frontend usklađen s tim ciljem.

Šta još treba, a ovaj zapis namjerno ne radi:

1. Tekst Baseline §0.2 i §4.1 i dalje kaže da je cilj Next.js. Change Control §2 traži vlasnika i Architecture Lead zajedno prije prepisa. Architecture Lead ovu izmjenu nije odobrio.
2. ADR-001 nije zamijenjen. OQ-4 ostaje OPEN jer izlazni uslovi (zamjenski ADR i ispunjeni kriteriji pariteta, ili njihov prepis jer je Next.js odgođen) nisu ispunjeni.
3. Kriteriji migracije u Frontend Canonicalization Gap Note ostaju za kasniji prelazak. Ne važe kao uslov za isporuku na `frontend-app`.

---

## OD-PP-13 — Pojednostavljenje procesa za feature rad

| Field           | Value                                                                                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                       |
| Status          | NOT_ADOPTED                                                                                                                                                      |
| Approved option | Preporuka iz analize razlika da se R0/MD evidencija pojednostavi za feature rad nije usvojena.                                                                   |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                   |
| Rationale       | Preporuka je u sukobu s Change Controlom, hijerarhijom upravljanja i granicama MD05. Zadatak je tražio da se sukob zabilježi, a ne da se niži akt tiho izmijeni. |
| Scope           | Proces odobravanja i evidencije                                                                                                                                  |
| Residual risk   | Feature rad i dalje traži jasan opseg i evidenciju. Ovaj paket ne uvodi kraći put.                                                                               |
| Dependencies    | Change Control, GOVERNANCE_HIERARCHY                                                                                                                             |
| Exit criteria   | Ostaje nevažeće dok vlasnik i Architecture Lead, uz nezavisni pregled, izričito ne zamijene proces                                                               |
| Supersession    | —                                                                                                                                                                |

---

## OD-PP-14 — Ovlaštenje za domenski model

| Field           | Value                                                                                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-19                                                                                                                                                                                                 |
| Status          | ACCEPTED                                                                                                                                                                                                   |
| Approved option | U ovom paketu smije se proširiti Prisma šema, dodati jedna napredna migracija, opis modela i testovi šeme. Postojeći modeli koji su testovima zamrznuti ostaju kakvi jesu.                                 |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                             |
| Rationale       | Korak 1 plana: model prije API-ja i sučelja.                                                                                                                                                               |
| Scope           | `packages/database/prisma/**`, `docs/architecture/PRODUCT_PLAN_DOMAIN_MODEL.md`, test šeme                                                                                                                 |
| Residual risk   | Logička veza na `CertificationApplication` nema strani ključ, jer bi ključ tražio izmjenu zamrznutog modela (PKG-06). Profil korisnika je zasebna tabela, jer skalarna polja na `User` testovi zabranjuju. |
| Dependencies    | OD-PP-01 … OD-PP-11                                                                                                                                                                                        |
| Exit criteria   | `prisma validate`, generate, typecheck, lint i postojeći testovi prolaze                                                                                                                                   |
| Supersession    | Ne mijenja PKG-06 zamrzavanje `CertificationApplication`, `ComplaintCase`, `AppealCase`, `AuditEvent` i `AuditChainHead`.                                                                                  |

Kurs slijedi strukturu ISO/IEC 8808 (kurs, modul kao poglavlje, lekcija, aktivnost kao blok sadržaja) i obrazovne metapodatke u obimu ISO/IEC 19788-5: jezik, nivo, ciljna grupa, tipično vrijeme, ciljevi. U polje standarda ide oznaka, ne tekst klauzule.

Kompetencija i nivo slijede ISO/IEC 20006-1/-2. Zapis postignuća uz ispravu slijedi ISO/IEC 19479 (naziv postignuća, nosilac, izdavalac, datum, rezultat, kriterij, jezik, dopunski zapis). To su imena polja CONFORA-e, ne prepisan model standarda.

ISO/IEC 9234 se ne uvodi. VR/AR ostaje budući modul.

Mapiranje ISO 21001 u analizi razlika ostaje provizorno jer je izvorni fajl oštećen. Ovaj paket ne tvrdi usaglašenost s 21001.

---

## Zabilježeni sukobi

1. **Baseline §11.1 Fast-Track automatski certifikat** i specifikacija 6.1 protiv 17024 5.2.3 i odluke komiteta. Riješeno u OD-PP-01 za certifikat osobe. Tekst Baselinea nije prepisan.
2. **Specifikacija 2, automatska AMF suspenzija** protiv 4.3.6 i 9.5. Riješeno u OD-PP-02. Nema automatskog prelaska statusa.
3. **Specifikacija 12, sys admin vidi sve** protiv SoD i AGENTS.md. Riješeno u OD-PP-07.
4. **Specifikacija 7, AI proctoring kao kontrola ispita** protiv 7.4.4(b) i Baseline §12. Riješeno u OD-PP-03 i OD-PP-04: signal, uz ljudskog nadzornika.
5. **Webkamera i slika isprave** protiv zabrane IAL-3 i biometrije u Baseline §8 i §9. Riješeno suženjem na IAL-2 ljudski pregled. IAL-3 ostaje van MVP-a. Prikupljanje slike čeka DPIA (OD-PP-05). OD-PP-15 (2026-10-20) dozvoljava zapis provjere bez slike prije nego što je sesija spremna.
6. **OQ-4 Vite / Next.js.** Vlasnik je 2026-10-20 odobrio OD-PP-12: isporuka ostaje na Vite `frontend-app`, Next.js je odgođen. Tekst Baseline §0.2 i §4.1 nije prepisan (traži i Architecture Lead). ADR-001 nije zamijenjen. OQ-4 ostaje OPEN.
7. **Pojednostavljenje R0 procesa.** Nije usvojeno. Vidi OD-PP-13.
8. **MD05 „privacy basis unrecorded”.** OD-PP-08 daje identifikator osnove i ne zatvara MD05.
9. **PKG-06 zamrznuta prijava.** Veza prijave na novi detalj nema strani ključ. To je ograničenje postojećeg testa, zabilježeno u OD-PP-14, a ne tiha izmjena prijave.
10. **`.cursor/rules/confora-baseline.mdc` nije u praćenom stablu** (OQ-2, odgođeno). Primijenjen je praćeni Baseline. Pravilo nije izmijenjeno.
11. **OD-PP-04 „ponovno polaganje najranije za 90 dana”** nije razlikovalo prolaz i pad. OD-PP-16 (2026-10-20) ograničava čekanje na pad.

ISO tekstovi se ne commitaju (Baseline §13, Standards Reference Policy).

---

## OD-PP-15 — Provjera identiteta bez slike prije spremne sesije

| Field           | Value                                                                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-20                                                                                                                                                                                            |
| Status          | ACCEPTED                                                                                                                                                                                              |
| Approved option | Prije nego što se certifikacijska ispitna sesija označi spremnom, obavezan je zapis `IdentityCheck` bez slike: vrsta isprave, provjeravač, vrijeme i metoda `HUMAN_VISUAL`. Slika i JMBG čekaju DPIA. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                        |
| Rationale       | OD-PP-04 traži ljudsku provjeru identiteta. OD-PP-05 i dalje zabranjuje sliku i JMBG. Zapis bez slike zatvara taj raskorak.                                                                           |
| Scope           | `CertificationExamSession` status `READY`, `CertificationExamIdentityLink`, `IdentityCheck.documentType`                                                                                              |
| Residual risk   | DPIA i dalje nije izrađena. Kolone za sliku ostaju prazne i nisu odobrenje za prikupljanje.                                                                                                           |
| Dependencies    | OD-PP-04, OD-PP-05                                                                                                                                                                                    |
| Exit criteria   | Sesija ne prelazi u spremno stanje bez vrste isprave, provjeravača, vremena i metode, i bez upisane slike                                                                                             |
| Supersession    | Pojašnjava OD-PP-04 i OD-PP-05: akreditabilna spremnost ne čeka sliku. Ne odobrava prikupljanje slike ni JMBG-a.                                                                                      |

Nadzornik dodijeljen sesiji upisuje vrstu isprave. Zapis ne sadrži broj isprave, sliku ni nacionalni identifikator. Dok taj zapis ne postoji, sesija ostaje zakazana i kandidat je ne može započeti.

---

## OD-PP-16 — Čekanje od 90 dana samo nakon pada

| Field           | Value                                                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-20                                                                                                                               |
| Status          | ACCEPTED                                                                                                                                 |
| Approved option | Prozor ponovnog polaganja od najmanje 90 dana primjenjuje se samo nakon rezultata koji nije položen. Položen ispit ne otvara to čekanje. |
| Owner           | Miljan Savić, Repository Owner                                                                                                           |
| Rationale       | OD-PP-04 je propisao najranije 90 dana. Vlasnik je 2026-10-20 ograničio to čekanje na pad.                                               |
| Scope           | Zakazivanje `CertificationExamSession` za isti nacrt ispita                                                                              |
| Residual risk   | Broj dozvoljenih prolaza i naknada za novi pokušaj nisu ovom odlukom fiksirani.                                                          |
| Dependencies    | OD-PP-04                                                                                                                                 |
| Exit criteria   | Zakazivanje odmah nakon prolaza prolazi pravilo prozora; zakazivanje unutar prozora nakon pada biva odbijeno                             |
| Supersession    | Sužava rečenicu OD-PP-04 o ponovnom polaganju. Ne snižava minimum od 90 dana za pad.                                                     |

---

## OD-PP-17 — Bodovanje višestrukog izbora

| Field           | Value                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-20                                                                                                                                  |
| Status          | ACCEPTED                                                                                                                                    |
| Approved option | Stavka višestrukog izbora je tačna samo kada se izabrani skup ključeva u potpunosti poklapa s ključem. Djelimičan odgovor ne donosi bodove. |
| Owner           | Miljan Savić, Repository Owner                                                                                                              |
| Rationale       | Potvrda pravila koje je već u ispitnom motoru. Parcijalni kredit nije odobren.                                                              |
| Scope           | Server scoring `MULTIPLE_CHOICE`                                                                                                            |
| Residual risk   | Druge vrste stavki, kada se uvedu, traže posebnu odluku o bodovanju.                                                                        |
| Dependencies    | OD-PP-04                                                                                                                                    |
| Exit criteria   | Test pokazuje da nepotpun ili suvišan skup ključeva nije tačan                                                                              |
| Supersession    | —                                                                                                                                           |

---

## OD-PP-18 — Sistem-administrator bez banke stavki i odluke

| Field           | Value                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Date            | 2026-10-20                                                                                                                                 |
| Status          | ACCEPTED                                                                                                                                   |
| Approved option | `STAFF_SYSADM` nema pristup banci ispitnih stavki niti odluci o certifikaciji. To je pravilo nepristrasnosti, a ne privremeno ograničenje. |
| Owner           | Miljan Savić, Repository Owner                                                                                                             |
| Rationale       | OD-PP-07 i razdvajanje dužnosti. Sistem-administrator ne vidi povjerljive stavke i ne mijenja ishod certifikacije.                         |
| Scope           | Čuvari ispitnog osoblja i komiteta, te isto pravilo na Vite sučelju                                                                        |
| Residual risk   | Break-glass i dalje nema aplikacijski tok. Ovaj zapis ne uvodi izuzetak.                                                                   |
| Dependencies    | OD-PP-06, OD-PP-07                                                                                                                         |
| Exit criteria   | Zahtjev sa ulogom `STAFF_SYSADM` na banku stavki, potvrdu identiteta i odluku biva odbijen                                                 |
| Supersession    | Potvrđuje OD-PP-07 za ispitnu banku i odluku. Ne daje sistem-administratoru širi pristup.                                                  |

---

## OD-PP-19 — Tri različita dokumenta

| Field           | Value                                                                                                                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                                   |
| Status          | ACCEPTED                                                                                                                                                                                     |
| Approved option | Potvrda o završetku edukacije, potvrda o rezultatu ispita i profesionalni certifikat nemaju isto značenje (ISO/IEC 17024:2026, 3.6). Svaki ima svoj model, prefiks, PDF i stranicu provjere. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                               |
| Rationale       | Vrijeme učenja je dokaz učešća, ne kompetencije. Potvrda o ispitu nije profesionalna certifikacija.                                                                                          |
| Scope           | EDU, EXM i CON dokumenti                                                                                                                                                                     |
| Residual risk   | Javni prikaz imena uz broj i dalje traži odluku o pristanku.                                                                                                                                 |
| Dependencies    | OD-PP-01, OD-PP-14                                                                                                                                                                           |
| Exit criteria   | Tri dokumenta se izdaju zasebno                                                                                                                                                              |
| Supersession    | Pojašnjava da potvrda o pohađanju i potvrda o ispitu nisu certifikat osoblja.                                                                                                                |

---

## OD-PP-20 — Osnovna prijava prije ispita

| Field           | Value                                                                                                                                                                               |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                          |
| Status          | ACCEPTED                                                                                                                                                                            |
| Approved option | Prije formalnog ispita osoba podnosi osnovnu prijavu (3.18, 3.19, 9.2). Podobnost se provjerava prema šemi. Dokaz iskustva može doći kasnije ako šema to dozvoli (napomena uz 8.2). |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                      |
| Rationale       | Prijava i ispit nisu isti čin.                                                                                                                                                      |
| Scope           | Faza ELIGIBILITY                                                                                                                                                                    |
| Residual risk   | Zamrznuta prijava ostaje bez stranog ključa.                                                                                                                                        |
| Dependencies    | OD-PP-04, OD-PP-19                                                                                                                                                                  |
| Exit criteria   | Objavljena šema i priznati preduslovi otvaraju prijavu bez obavezne obuke                                                                                                           |
| Supersession    | —                                                                                                                                                                                   |

---

## OD-PP-21 — Dosije i potvrda referenta

| Field           | Value                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                                         |
| Status          | ACCEPTED                                                                                                                                                                                           |
| Approved option | Nakon prolaza kandidat kompletira prijavu i može pozvati referenta sigurnom vezom bez prijave. Potvrda ne ispunjava uslov. Tijelo ocjenjuje relevantnost i vjerodostojnost. Pošta ide kroz outbox. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                     |
| Rationale       | Šema bira reference ili drugi provjerljiv dokaz.                                                                                                                                                   |
| Scope           | Dokazi, potvrde referenata, outbox                                                                                                                                                                 |
| Residual risk   | Pravi e-mail provajder nije izabran.                                                                                                                                                               |
| Dependencies    | OD-PP-20                                                                                                                                                                                           |
| Exit criteria   | Zapis ko, kada, šta i neslaganja; uslov ostaje neispunjen samom potvrdom                                                                                                                           |
| Supersession    | —                                                                                                                                                                                                  |

---

## OD-PP-22 — Odbor i nivo iz kriterija

| Field           | Value                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                   |
| Status          | ACCEPTED                                                                                                                                                                     |
| Approved option | Tijelo imenuje odlučioce. Sistem predlaže sastav, isključuje trenera i ispitivača (9.4.4) i provjerava ovlaštenje. Čovjek potvrđuje. Nivo računaju kriteriji šeme (8.2–8.4). |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                               |
| Rationale       | Odbor ne bira nivo slobodno.                                                                                                                                                 |
| Scope           | Kriteriji nivoa, imenovani odlučioci, prijedlog i glasovi                                                                                                                    |
| Residual risk   | Širi registar sukoba interesa nije poseban izvor.                                                                                                                            |
| Dependencies    | OD-PP-07, OD-PP-21                                                                                                                                                           |
| Exit criteria   | Trener i ispitivač su isključeni; važi najviši ispunjeni rang                                                                                                                |
| Supersession    | —                                                                                                                                                                            |

---

## OD-PP-23 — Četiri oka prije izdavanja

| Field           | Value                                                                                                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                                                                                                                    |
| Status          | ACCEPTED                                                                                                                                                                                                                                                                      |
| Approved option | Nakon pozitivne odluke predmet je APPROVED_FOR_ISSUANCE. Izdavanje odobrava osoba koja nije zapisala ni potvrdila odluku (9.4.7–9.4.9). Zatim sistem generiše, numeriše, potpisuje, upisuje registar, QR i obavještava nosioca. Isto važi za postojeće izdavanje nakon GRANT. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                                                                |
| Rationale       | Odluka i izdavanje nisu isti čin.                                                                                                                                                                                                                                             |
| Scope           | Ovlaštenje za izdavanje i postojeći endpoint izdavanja                                                                                                                                                                                                                        |
| Residual risk   | Promjena statusa i prijedlog AMF-a nisu čin izdavanja.                                                                                                                                                                                                                        |
| Dependencies    | OD-PP-22                                                                                                                                                                                                                                                                      |
| Exit criteria   | Učesnik odluke ne može izdati; druga ovlaštena osoba može                                                                                                                                                                                                                     |
| Supersession    | Sužava izdavanje: izdavalac ne smije biti učesnik odluke.                                                                                                                                                                                                                     |

---

## OD-PP-24 — Dva jednaka puta

| Field           | Value                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Date            | 2026-10-21                                                                                                                                             |
| Status          | ACCEPTED                                                                                                                                               |
| Approved option | Put A je edukacija CONFORA pa certifikacija. Put B je izravna certifikacija bez te obuke (5.2.3). Isti certifikat i isti kriteriji. Obuka nije kapija. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                         |
| Rationale       | Certifikacija ne smije biti uslovljena vlastitom obukom.                                                                                               |
| Scope           | CONFORA_EDUCATION i DIRECT                                                                                                                             |
| Residual risk   | Jednakovrijedan dokaz opisuje šema.                                                                                                                    |
| Dependencies    | OD-PP-01, OD-PP-20                                                                                                                                     |
| Exit criteria   | Put B prolazi i kad obuka nije završena                                                                                                                |
| Supersession    | —                                                                                                                                                      |

---

## OD-PP-25 — AI samo kao pomoć

| Field           | Value                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                                              |
| Status          | ACCEPTED                                                                                                                                                                                                |
| Approved option | AI smije predložiti kompletnost, sažetak, nesaglasnosti, obrazloženje sastava i nacrt obavijesti. Prijedlog je označen, upisan i ne odlučuje. Nema pristup banci stavki. Bez ključa radi određeni stub. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                          |
| Rationale       | Odluku donosi čovjek.                                                                                                                                                                                   |
| Scope           | AiCaseSuggestion                                                                                                                                                                                        |
| Residual risk   | Produkcijski provajder nije izabran.                                                                                                                                                                    |
| Dependencies    | OD-PP-21, OD-PP-22                                                                                                                                                                                      |
| Exit criteria   | Prijedlog ne mijenja fazu, nivo ni certifikat                                                                                                                                                           |
| Supersession    | OD-PP-27 određuje prolaz.                                                                                                                                                                               |

---

## OD-PP-26 — Meniji po ulozi

| Field           | Value                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                      |
| Status          | ACCEPTED                                                                                                                                                        |
| Approved option | „Moja certifikacija” za kandidata i „Komitet za certifikaciju” za člana komiteta. Izjava o sukobu mora biti potpisana prije uvida i odluke. RBAC je na serveru. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                  |
| Rationale       | Skriveni meni nije kontrola pristupa.                                                                                                                           |
| Scope           | Navigacija i čuvari                                                                                                                                             |
| Residual risk   | Pristanak za javno ime uz EDU/EXM ostaje otvoren.                                                                                                               |
| Dependencies    | OD-PP-19, OD-PP-22                                                                                                                                              |
| Exit criteria   | Zabranjena uloga dobija 403                                                                                                                                     |
| Supersession    | —                                                                                                                                                               |

---

## OD-PP-27 — CONFORA AI Gateway

| Field           | Value                                                                                                                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                                                                                                                         |
| Status          | ACCEPTED                                                                                                                                                                                                                                                                           |
| Approved option | OpenAI je primarni provajder iza jednog prolaza. Moduli ne zovu provajdera. Audit bilježi ko, svrhu, model, kategoriju, jedinice i trošak. Allowlist, budžet i ljudska provjera su obavezni. AI ne odlučuje (ISO/IEC 17024:2026, 6.5). Stub je podrazumijevan. Ključ nije povezan. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                                                                     |
| Rationale       | Jedan prolaz čini upotrebu vidljivom.                                                                                                                                                                                                                                              |
| Scope           | AI gateway                                                                                                                                                                                                                                                                         |
| Residual risk   | Ključ i AIIA nisu uključeni.                                                                                                                                                                                                                                                       |
| Dependencies    | OD-PP-25                                                                                                                                                                                                                                                                           |
| Exit criteria   | Odbijena upotreba je u auditu i ne zove provajdera                                                                                                                                                                                                                                 |
| Supersession    | Sužava OD-PP-25 na imenovani prolaz.                                                                                                                                                                                                                                               |

---

## OD-PP-28 — Obavijesti

| Field           | Value                                                                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                                                                              |
| Status          | ACCEPTED                                                                                                                                                                                                                                |
| Approved option | SES adapter i obavijest u aplikaciji idu kroz red, s ponavljanjem, zapisom ishoda i kukom za bounce i complaint. Podsjetnici pokrivaju istek, recertifikaciju, ispite i naknade. SPF, DKIM i DMARC su potrebni. Stub je podrazumijevan. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                                                                          |
| Rationale       | Ishod slanja je dokaz.                                                                                                                                                                                                                  |
| Scope           | Red obavijesti                                                                                                                                                                                                                          |
| Residual risk   | DNS i SES identitet nisu uključeni.                                                                                                                                                                                                     |
| Dependencies    | OD-PP-14                                                                                                                                                                                                                                |
| Exit criteria   | Red bilježi ishod, a podsjetnik ne mijenja status certifikata                                                                                                                                                                           |
| Supersession    | —                                                                                                                                                                                                                                       |

---

## OD-PP-29 — Godišnja naknada

| Field           | Value                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date            | 2026-10-21                                                                                                                                                                    |
| Status          | ACCEPTED                                                                                                                                                                      |
| Approved option | Predloženo je 90 EUR godišnje, podesivo po šemi. Prva godina je u cijeni početne certifikacije. Recertifikacija je zasebna. Neplaćanje ne povlači certifikat; otvara predmet. |
| Owner           | Miljan Savić, Repository Owner                                                                                                                                                |
| Rationale       | Naknada nije odluka o certifikaciji.                                                                                                                                          |
| Scope           | Cjenovnik šeme i predmet naknade                                                                                                                                              |
| Residual risk   | Platni provajder nije povezan.                                                                                                                                                |
| Dependencies    | OD-PP-14, OD-PP-23                                                                                                                                                            |
| Exit criteria   | Životni ciklus certifikata ostaje neizmijenjen kad se otvori predmet neplaćanja                                                                                               |
| Supersession    | Neplaćanje ne suspenduje i ne povlači certifikat samo od sebe.                                                                                                                |
