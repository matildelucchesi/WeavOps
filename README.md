# WeavOps

WeavOps è un gestionale per aziende tessili che semplifica la gestione aziendale e il monitoraggio del processo di produzione di una tela.

Il progetto è composto da:

- **Frontend**: interfaccia web.
- **Backend**: API e logica applicativa.

## Architettura

WeavOps è composto da un frontend web Angular e da un backend Java basato su Spring Boot. Il backend espone le API applicative e usa MongoDB per la persistenza dei dati.

```text
Utente
  │
  ▼
Frontend Angular (porta 4200)
  │ richieste API (/api)
  ▼
Backend Spring Boot (porta 8080)
  │
  ▼
MongoDB
```

In ambiente di sviluppo, il proxy del frontend inoltra le richieste `/api` al backend. La documentazione delle API è disponibile tramite Swagger UI all'indirizzo `http://localhost:8080/swagger-ui.html`.

## Funzionalità

- Monitora lo stato operativo dei telai registrati.
- Tiene traccia delle pezze prodotte ogni giorno.
- Gestisce le scadenze di produzione e consegna.
- Stima la data di completamento di un articolo quando viene avviato in produzione.
- Suggerisce quanti telai assegnare per completare la produzione entro la data di consegna.
- Esporta in PDF la disposizione delle lavorazioni per ciascun telaio.
- Esporta in PDF lo storico delle operazioni eseguite su un telaio.
- Esporta in PDF i dati riepilogativi della produzione al suo completamento.

## Avvio rapido

### Prerequisiti

- Node.js e npm
- Java 17
- Maven
- MongoDB configurato con il replica set `replicaset-01`

### Avvio del backend

Avvia MongoDB e poi, dalla cartella `be`, esegui:

```bash
mvn spring-boot:run
```

Il backend sarà disponibile su `http://localhost:8080`. La documentazione API è disponibile su `http://localhost:8080/swagger-ui.html`.

### Avvio del frontend

Da un altro terminale, dalla cartella `fe`, installa le dipendenze e avvia il server di sviluppo:

```bash
npm ci
npm start
```

Apri `http://localhost:4200` nel browser. In sviluppo, il proxy del frontend inoltra le richieste API al backend sulla porta `8080`.

## Configurazione

### MongoDB

Il backend si connette al database `weavops` su `127.0.0.1:27017` e richiede un replica set chiamato `replicaset-01`. Per un ambiente locale a nodo singolo, crea prima la cartella dati (se non esiste) e avvia MongoDB da PowerShell:

```powershell
New-Item -ItemType Directory -Force C:\data\weavops
mongod --dbpath C:\data\weavops --replSet replicaset-01 --bind_ip localhost --port 27017
```

Lascia aperto questo terminale. Al primo avvio, apri un secondo terminale PowerShell e inizializza il replica set:

```powershell
mongosh --host 127.0.0.1:27017
```

Nel prompt di `mongosh`, esegui:

```javascript
rs.initiate({ _id: "replicaset-01", members: [{ _id: 0, host: "127.0.0.1:27017" }] })
rs.status()
```

Attendi che lo stato del nodo diventi `PRIMARY`, poi avvia il backend. L'inizializzazione con `rs.initiate()` va eseguita solo la prima volta per quella cartella dati; agli avvii successivi basta riavviare `mongod` con gli stessi parametri.

La configurazione del backend si trova in `be/src/main/resources/application.properties`. Se usi un'istanza MongoDB diversa, aggiorna `spring.data.mongodb.uri` nel file delle proprietà e assicurati che il replica set sia coerente con l'URI.

### Backend

Il backend legge la configurazione da `be/src/main/resources/application.properties`.

### Frontend

Il frontend usa `/api` come indirizzo base per le richieste API. In sviluppo, `fe/src/proxy.conf.json` inoltra queste richieste a `http://localhost:8080`.

### Sicurezza

La configurazione locale contiene un JWT secret di sviluppo. Prima di usare il progetto in un ambiente condiviso o di produzione, sostituiscilo con un valore sicuro e gestiscilo fuori dal repository. Non inserire credenziali o altri segreti nei file versionati.



