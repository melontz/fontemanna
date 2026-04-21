import { GameEvent, Season } from './types'

export const WOLF_EVENT: GameEvent = {
  id: 'wolf',
  type: 'wolf',
  title: 'Grigio di Colle San Paolo!',
  description: 'Bostiano sente ululare dal bosco. Grigio è di nuovo in agguato ai margini del pascolo. Tre pecore sono lontane dalla recinzione.',
  choices: [
    {
      label: 'Vai subito a radunare il gregge (perdi 2 ore di lavoro)',
      effect: { sheepLost: 0, money: -20, logMessage: 'Hai messo in salvo tutto il gregge. Giornata persa ma nessuna perdita.' },
    },
    {
      label: 'Spari in aria per spaventare il lupo',
      effect: { sheepLost: 1, money: 0, logMessage: 'Grigio si è ritirato ma una pecora mancava già all\'appello. Trovata solo la lana.' },
    },
    {
      label: 'Chiama Giuditta per un consiglio veterinario',
      effect: { sheepLost: 0, money: -50, logMessage: 'Giuditta ha suggerito un sistema di segnalazione acustica. Gregge salvo, ma hai pagato la consulenza.' },
      cost: 50,
    },
  ],
  resolved: false,
}

export const BOAR_EVENT: GameEvent = {
  id: 'boar',
  type: 'boar',
  title: 'Il Podestà è tornato!',
  description: 'Stanotte il cinghiale soprannominato "Il Podestà" ha devastato il campo di foraggio. Un terzo della riserva è distrutta e la recinzione è sfondare in due punti.',
  choices: [
    {
      label: 'Chiama la Forestale e fai denuncia',
      effect: { money: 0, complianceForestale: +10, logMessage: 'La Forestale ha preso nota. Ti hanno consigliato reti metalliche. Ottima mossa per la reputazione con gli enti.' },
    },
    {
      label: 'Ripara da solo la recinzione (costa tempo e materiali)',
      effect: { money: -120, logMessage: 'Recinzione riparata. Ma il Podestà tornerà.' },
    },
    {
      label: 'Chiedi aiuto a Ottorino',
      effect: { money: -40, sheepLost: 0, logMessage: 'Ottorino ha aiutato... ma giura che tre pecore erano già "smarrite" quando è arrivato. Mah.' },
    },
  ],
  resolved: false,
}

export const ERMINIA_ESCAPE: GameEvent = {
  id: 'erminia',
  type: 'escape',
  title: 'Erminia è fuggita di nuovo!',
  description: 'Erminia ha trovato un varco nella recinzione e si è avventurata sulla strada provinciale. Tre sue amiche l\'hanno seguita. Una macchina ha quasi preso Florinda.',
  choices: [
    {
      label: 'Vai a recuperarle subito con il furgone',
      effect: { money: -30, sheepLost: 0, milkQuality: 0.9, logMessage: 'Recuperate tutte. Erminia aveva già convinto Palmira e Zelinda. Solita storia.' },
    },
    {
      label: 'Chiama Ottorino per aiuto',
      effect: { money: -60, sheepLost: 0, logMessage: 'Ottorino le ha trovate nel suo campo. "Per i disturbi" ha detto, e hai pagato.' },
    },
    {
      label: 'Aspetta — tanto tornano da sole',
      effect: { money: 0, sheepLost: 2, logMessage: 'Due non sono tornate. La recinzione va rinforzata.' },
    },
  ],
  resolved: false,
}

export const ASL_INSPECTION: GameEvent = {
  id: 'asl',
  type: 'inspection',
  title: 'Ispezione ASL a sorpresa',
  description: 'Un ispettore dell\'ASL di Perugia è arrivato senza preavviso. Vuole controllare la stalla, le celle frigorifere e l\'etichettatura dei prodotti.',
  choices: [
    {
      label: 'Accoglilo e mostragli tutto',
      effect: { complianceASL: +15, logMessage: 'Ispezione superata. L\'ispettore ha trovato tutto in ordine. Ben fatto.' },
    },
    {
      label: 'Chiedi di rinviare a domani (hai qualcosa da sistemare)',
      effect: { complianceASL: -20, money: -200, logMessage: 'L\'ispettore ha insistito. Ha notato la tua riluttanza e ha guardato tutto con più attenzione. Multa per irregolarità nell\'etichettatura.' },
    },
  ],
  resolved: false,
}

export const NAS_INSPECTION: GameEvent = {
  id: 'nas',
  type: 'inspection',
  title: 'Controllo NAS — Tracciabilità',
  description: 'I carabinieri del NAS verificano la tracciabilità del latte: registro carico/scarico, temperatura di conservazione, lotti di produzione.',
  choices: [
    {
      label: 'Mostra tutta la documentazione',
      effect: { complianceNAS: +10, logMessage: 'Documentazione impeccabile. I NAS sono andati via soddisfatti.' },
    },
    {
      label: 'Il registro non è aggiornato — ammetti e paghi la multa',
      effect: { complianceNAS: -30, money: -350, logMessage: 'Multa salata. Aggiorna il registro ogni giorno d\'ora in poi.' },
    },
  ],
  resolved: false,
}

export const BITTER_HERBS: GameEvent = {
  id: 'bitterness',
  type: 'bitterness',
  title: 'Erbe amare nel pascolo',
  description: 'Le ultime piogge hanno favorito la crescita di erbe selvatiche amare nella zona est del pascolo. Il latte di oggi sa di cicoria e il primo sale rischia di essere invendibile.',
  choices: [
    {
      label: 'Sposta il gregge nel pascolo ovest (meno erba ma sicura)',
      effect: { milkQuality: 0.85, logMessage: 'Pascolo cambiato. Produzione calata ma qualità recuperata in 2 giorni.' },
    },
    {
      label: 'Usa il latte amaro solo per la ricotta (meno ricavi)',
      effect: { milkQuality: 0.7, money: -80, logMessage: 'La ricotta amara non piace al GAS. Perdi reputazione.' },
    },
    {
      label: 'Chiama Giuditta per identificare le erbe',
      effect: { milkQuality: 1.0, money: -60, logMessage: 'Giuditta ha identificato l\'erba e suggerito dove pascolare. Tutto risolto.' },
      cost: 60,
    },
  ],
  resolved: false,
}

export const MARKET_ORDER: GameEvent = {
  id: 'market_spoleto',
  type: 'market',
  title: 'Ordine urgente da Spoleto',
  description: 'Il ristorante stellato di Spoleto vuole 15 forme di primo sale e 20 kg di yogurt entro venerdì. Se consegni, la reputazione sale alle stelle.',
  choices: [
    {
      label: 'Accetta e lavora giorno e notte',
      effect: { money: +600, reputationSP: +20, logMessage: 'Consegna fatta! Il ristorante è entusiasta. Bostiano crolla a letto stremato.' },
    },
    {
      label: 'Accetta ma sottolinea che dipende dalle pecore',
      effect: { money: +400, reputationSP: +10, logMessage: 'Consegnato il possibile. Spoleto apprezza l\'onestà.' },
    },
    {
      label: 'Declina — non hai scorte sufficienti',
      effect: { reputationSP: -15, logMessage: 'Spoleto è rimasto deluso. La prossima volta si organizzano con un altro fornitore.' },
    },
  ],
  resolved: false,
}

export const TRUMP_COST_SPIKE: GameEvent = {
  id: 'trump',
  type: 'cost',
  title: 'Nuovo dazio USA — Energia e carburante alle stelle',
  description: 'Trump ha annunciato nuovi dazi sul gas naturale europeo. In tre giorni il costo dell\'energia è salito del 18%. Il gasolio per il trattore costa il 12% in più.',
  choices: [
    {
      label: 'Assorbi il costo e vai avanti',
      effect: { money: -200, logMessage: 'Hai assorbito il rincaro. Per ora reggi, ma il margine si stringe.' },
    },
    {
      label: 'Aumenta i prezzi del 10% ai clienti',
      effect: { reputationPG: -5, reputationSP: -5, reputationGAS: -8, logMessage: 'I clienti accettano, ma qualcuno brontola. Il GAS ti chiede trasparenza.' },
    },
    {
      label: 'Cerca un fornitore locale di fieno alternativo',
      effect: { money: -80, logMessage: 'Trovato un agricoltore di Montefalco. Costa di più adesso ma è stabile.' },
    },
  ],
  resolved: false,
}

export function getSeasonalEvents(season: Season): GameEvent[] {
  const base = [ERMINIA_ESCAPE, BITTER_HERBS, TRUMP_COST_SPIKE]
  if (season === 'spring' || season === 'winter') base.push({ ...WOLF_EVENT, id: `wolf-${Date.now()}`, resolved: false })
  if (season === 'summer' || season === 'autumn') base.push({ ...BOAR_EVENT, id: `boar-${Date.now()}`, resolved: false })
  base.push(ASL_INSPECTION, NAS_INSPECTION, MARKET_ORDER)
  return base
}
