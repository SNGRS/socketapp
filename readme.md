# SocketApp voor de kassa van GBV Weco 
Voor verrijking van de GBV Weco Kassa is een hulpprogramma gemaakt om kassabonnen naar 2 printers te sturen (bijv. pakbon voor de bunker + kassabon voor klant).

## Graag wel rekening houden met het volgende:

 - Dit programma is voornamelijk gemaakt met goede bedoelingen om ons eigen proces te bevorderen. Dit is voornamelijk een 'hobbyproject' geweest en ben zelf verre van een professionele developer - andere 'geeks' kunnen mogelijk commentaar hebben op de manier hoe dit programma is gebouwd. Maar het werkt en het werkt redelijk efficiënt, dus ik ben tevreden :)
 - Ik ben niet vebonden aan Mediasolutions of GBV Weco. Wijzigingen aan hun kant van het systeem kunnen er mogelijk toe leiden dat dit programma niet voldoende werkt. Grote kans dat ik wel met nieuwe versies zal komen, gezien wij zelf ook gebruik zullen maken van dit programma. Wel kan het raadzaam zijn om ook voor een eigen back-up plan te zorgen.
 - Hierover gesproken, dit programma is voornamelijk gemaakt voor onze specifieke behoefte: een kassabonprinter bij de verkoopbalie (thermische kassarollen van 80mm) en een pakbonprinter in de bunker (A4 formaat). Als mensen zich comfortabel voelen met Javascript, dan is dit zelf te tweaken naar eigen behoefte.
 - Ook heb ik dit programma **niet** getest op Windows 7. Mocht jouw kassa nog op Windows 7 draaien, dan zou het theoretisch voor kunen komen dat dit programma niet werkt. Ik ga er alleen niet van uit, maar onderaan staan mijn contactgegevens mocht het niet zo zijn. Eigenlijk uberhaupt belangrijk om te vermelden dat dit programma alleen op Windows werkt (en minimaal vanaf Windows 7)...
 - Om dit programma te laten werken heb je ook deze zelfgebouwde extensie nodig voor Google Chrome om de kassa te laten communiceren met dit programma. Instructies voor het downloaden en installeren hiervan vind je op [deze pagina](https://github.com/SNGRS/weco-exentensie).
 - Verder biedt dit programma ook de mogelijkheid om de kassalade elektronisch te openen. Zorg hiervoor hiervoor dat de kassalade aangesloten op de bonprinter is én de bonprinter in Windows is aangegeven als standaardprinter. Ook belangrijk om te weten is dat ik niet de eigenaar ben van het programma dat dit verzorgt, alle rechten daarvan zijn voorbehouden aan de eigenaar van dat deel van dit programma.
 - Zorg ook ervoor dat in het portal van GBV Weco het kassabon formaat op A4 staat. Socketapp zorgt voor schaling naar de kassabon.

## Een korte uitleg
Socketapp zorgt ervoor dat de Chrome-extensie de 'orderbevestiging' kan downloaden naar de computer. Vervolgens worden hiervan twee PDFjes gemaakt (één op A4 formaat en één op 80mm breedte). Deze PDFjes worden dan verstuurd naar de twee printers die zijn aangegeven in de instellingen.

Ook handig om te weten is dat SocketApp deze orderbevestigingen + pdfjes bewaart op de computer. Als er weinig opslagruimte op deze computer is, dan kan het handig zijn om aan het einde van een verkoopdag, die mappen te legen.
*Houd er rekening mee dat **alleen de bestanden** in transacties/html, transacties/pakbonnen en transacties/kassabonnen verwijderd mogen worden. Deze mappen moeten blijven bestaan.*

## Installatie & eerste keer gebruik

 1. [Download de app](https://github.com/SNGRS/socketapp/archive/refs/heads/master.zip) en pak dit zip-bestand uit.
 2. Klik vervolgens met de rechtermuisknop op het bestand `.env` en open deze door middel van de optie "Openen met..." met Kladblok.
 3. Vervang de namen van de printers voor je eigen printers. Deze namen kan je vinden via `Configuratiescherm -> Hardware -> Apparaten en Printers`. De naam van die printers moet volledig overgenomen worden tussen de aangegeven aanhalingstekens.
 4. Sla de wijzigingen op en sluit Kladblok af.
 5. Open nu `installatie.bat` via rechtermuisknop en de optie "Als administrator uitvoeren".  Volg de instructies op het scherm.

Op de achtergrond gebeuren er nu drie dingen: de mappen om bestanden op te slaan worden gemaakt, NodeJS (de 'ruggengraat' van dit programma) wordt gedownload en geïnstalleerd én de instellingen van NodeJS worden aangepast naar jouw specifieke computer.  Het uitvoeren van dit script kan dus even duren.
*Mocht het voorkomen dat er een error komt bij de installatie van NodeJS, dan kan je deze met behulp van de linkjes hieronder zelf installeren en het script nog een keer laten draaien.*

6. Als de installatie is afgrond dan kan je Socketapp opstarten via het bestand `startApplicatie.bat`. Deze kan misschien de eerste keer een waarschuwing geven over Firewall, maar druk op toestaan.
7. Nu worden de printers gecontroleerd en als deze zijn gevonden  zal er een printje worden gestuurd naar beide printers. 
Als er een rode balk verschijnt, dan zijn waarschijnlijk de verkeerde printernamen ingevoerd. Het script is afgesloten. Verander de namen en probeer opnieuw.
8. Zodra er een groene balk verschijnt met `Socketapp is gestart. Je kan nu de kassa openen. Goede verkoop!`, dan werkt het programma. 
9. Volg nu de stappen om [de Chrome-extensie te downloaden en installeren](https://github.com/SNGRS/weco-exentensie).

Vanaf nu kan je dit programma gewoon gebruiken! Aan het einde van de verkoopdag kan je dit programma gewoon afsluiten, maar **zorg dat tijdens de verkoopdagen dit programma altijd blijft draaien.**

## Backup voor NodeJS
[Windows 7](https://nodejs.org/download/release/v13.6.0/node-v13.6.0-x86.msi)
[Windows 10 & Windows 11](https://nodejs.org/dist/v20.10.0/node-v20.10.0-x86.msi)

## Vragen/contact
Zoals aangegeven: dit project is voor mij puur voor de hobby en ik hier niet mijn volledige aandacht aan zal geven ben ik wel altijd bereikbaar voor vragen. Je kan me een mailtje sturen naar `post [@] sngrs [.] com`. Ik zal proberen zo snel mogelijk met een antwoord te komen.

Verder, mocht je met dit programma enorm geholpen zijn, dan is een blijk van waardering altijd welkom :) https://bunq.me/rogiersangers