# 🏛️ Ankandet.ks — Platformë Profesionale Ankandesh Online (Kosovë)

Një platformë komerciale dhe open-source për ankande në kohë reale, e ngjashme me **Ankandet.com**, e ndërtuar pa asnjë varësi nga Replit. Sistemi përfshin logjikë të plotë ankandesh, bazë të dhënash me performancë të lartë, ofertim automatik (Proxy Bidding), mbrojtje nga sniping, import masiv të 9,000+ artikujve, menaxhim të porosive dhe logjistikës për Republikën e Kosovës.

---

## 🌟 Karakteristikat Kryesore të Platformës

### 1. Ankande me Oferta Reale & Bli Menjëherë (Buy Now)
- **Ofertim në Kohë Reale (WebSockets):** Çdo ofertë e re, ndryshim çmimi ose zgjatje ankandi reflektohet menjëherë te të gjithë klientët pa rifreskuar faqen.
- **Bli Menjëherë (Çmim Fiks):** Përdoruesit mund ta blejnë artikullin menjëherë me një çmim fiks të paracaktuar, duke e mbyllur ankandin dhe gjeneruar porosinë automatikisht.
- **Tabela e Rritjes së Ofertës (Bid Increments):** Shkallë komerciale automatike (€1 për <€50, €2 për €50-€199, €5 për €200-€499, €10 për €500-€999, €25 për €1000-€4999, €50 për €5000+).

### 2. Sistemi Automatik i Ofertimit (Proxy Bidding)
- Klienti mund të vendosë një **Ofertë Maksimale (Proxy)**.
- Sistemi algoritmit rrit ofertën vetëm aq sa nevojitet për të mbetur fitues kundrejt ofertuesve të tjerë, pa e çuar çmimin menjëherë te maksimumi.
- Menaxhim i plotë i barazive (ofertuesi i mëparshëm fiton) dhe mbështetje për njoftime të menjëhershme kur një klient tejkalohet ("Outbid Alert").

### 3. Çmimi Minimal i Fshehtë (Reserve Price)
- Shitësi ose administratori mund të vendosë një çmim dysheme (Reserve Price).
- Sistemi shfaq qartë nëse çmimi rezervë është arritur apo jo.
- Nëse ankandi përfundon pa arritur çmimin rezervë, produkti shënohet si i pashitur (`ended / reserve_not_met`) dhe nuk krijohet porosi, duke mbrojtur shitësin.

### 4. Mbrojtja nga Sniping (Anti-Sniping / Soft Close)
- Nëse vendoset një ofertë në 2 minutat e fundit para përfundimit, ankandi zgjatet automatikisht me 3 minuta shtesë.
- Parandalon "bot-et" ose ofertat në sekondën e fundit dhe u jep të gjithë blerësve shanse të barabarta.
- Transmetim i drejtpërdrejtë me njoftim zanor dhe vizual.

### 5. Import Masiv i 9,000+ Produkteve përmes CSV/Excel
- **Batch Streaming me SQLite WAL:** Importon 9,000 produkte në më pak se 0.5 sekonda pa ngarkuar memorien e serverit.
- Gjenerim automatik i SKU-ve (`ANK-#####`), URL slugs, fotove, kategorive dhe llogaritjes së çmimeve.
- Menaxhim i certifikuar i gjendjes fizike:
  - **Klasa A:** Si e re me paketim origjinal.
  - **Klasa B:** E përdorur në gjendje shumë të mirë.
  - **Klasa C:** E përdorur me shenja të dukshme përdorimi.
- Buton për shkarkimin e shabllonit CSV në shqip dhe buton me 1-klikim për të gjeneruar 9,000 produkte testuese.

### 6. Porositë dhe Logjistika në Kosovë
- Integrim me komunat kryesore: Prishtinë, Prizren, Pejë, Ferizaj, Gjilan, Gjakovë, Mitrovicë, Vushtrri, Podujevë, etj.
- Tarifa fikse e postës së shpejtë: **€3.00** (Dorëzim 24-48 orë).
- Pagesa: **Para në Dorë pas pranimit të pakos (Cash on Delivery)**, Transfer Bankar (BKT, TEB, NLB, Raiffeisen), ose me Kartelë.

### 7. Paneli i Administratorit dhe Siguria
- Përmbledhje statistikash: ankande aktive, shitje, vëllim parash (€), ofertues aktivë.
- Kontroll i plotë i produkteve: Krijim, Redaktim, Mbyllje para kohe (End Early) dhe Fshirje.
- Menaxhimi i porosive dhe futja e kodeve të gjurmimit të postës.
- Menaxhimi i përdoruesve (aktivizim / pezullim).
- Regjistër i plotë i auditimit dhe sigurisë (Activity Audit Logs).
- Shkarkim me një klikim i kopjes rezervë të bazës së të dhënave SQLite (`.db`).

---

## 🛠️ Teknologjitë e Përdorura (100% Open-Source)

- **Backend:** Node.js, Express 5, WebSocket (`ws`), Better-SQLite3 (WAL Mode), JWT, BcryptJS, Multer, CSV-Parser.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas-Confetti, Web Audio API.
- **Baza e të Dhënave:** SQLite relationale e indeksuar (User, Category, Product, Bid, ProxyBid, Watchlist, Order, ActivityLog, CsvImport).

---

## 🚀 Si të Niset Projekti

### 1. Instalimi i Paketimeve
```bash
pnpm install
cd client && pnpm install && cd ..
```

### 2. Ekzekutimi i Testeve Automatikë
Teston të gjitha 6 modulet kyçe (Proxy Bidding, Anti-Sniping, Reserve Price, Buy Now, Increments, dhe importin e 9,000 artikujve):
```bash
pnpm test
```

### 3. Populimi i Bazës me të Dhëna Fillestare (Seed)
Krijon llogaritë demo dhe 8 ankande reale me oferta fillestare:
```bash
pnpm run seed
```

### 4. Nisja e Serverit dhe Faqes në Zhvillim (Development)
```bash
pnpm run dev
```
Ose nisni vetëm serverin:
```bash
pnpm start
```
- Faqja hapet në: `http://localhost:5000` (ose `http://localhost:3000` me Vite)
- WebSocket në: `ws://localhost:5000/ws`

---

## 🔑 Llogaritë e Gatshme për Testim

| Roli | Email | Fjalëkalimi | Përshkrimi |
|---|---|---|---|
| **Administrator** | `admin@ankandet.al` | `Admin123!` | Qasje e plotë në Panelin Administrativ, Importin CSV dhe Backup |
| **Blerës 1** | `agron.m@gmail.com` | `Klienti123!` | Klient nga Prishtina me oferta aktive |
| **Blerës 2** | `blerina.k@gmail.com` | `Klienti123!` | Kliente nga Prizreni |
| **Blerës 3** | `dardan.g@gmail.com` | `Klienti123!` | Klient nga Peja |

*(Në dritaren e kyçjes keni edhe butonat me 1-klikim për plotësim të shpejtë të kredencialeve).*
