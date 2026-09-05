window.SOC_EXAMS_2015 = [
  {
    year: "2016",
    label: "2015–2016",
    title: "Cell Processor, ordonnancement MIPS et réseau torique",
    pdf: "../Ex-Annales/SLE_SOC_examen_2015-2016.pdf",
    intro: `<p>Un corrigé rédigé comme une copie solide, avec une distinction nette entre valeurs exactes, hypothèses d’architecture et lectures approximatives des courbes de l’article Cell.</p>`,
    sections: [
      {
        title: "Application du Cell Processor au traitement d’image",
        theme: "Cell & DMA",
        context: `<section><h4>1.1 Communications dans le Cell processor</h4>
            <p><strong>Contexte de la question 5.</strong> Considérons un pipeline de traitement d’image constitué de 8 tâches. Chaque tâche communique avec la suivante et lui envoie un flux de données (les pixels d’une image). La première tâche lit ses données en mémoire principale et la dernière les écrits en mémoire principale.</p>
          </section>
          <section><h4>1.2 Architecture mémoire du Cell processor</h4></section>
          <section><h4>1.3 Application à la détection de visage</h4>
            <p>On souhaite réaliser un algorithme de détection de visage dans une image stockée en mémoire externe. Un pixel de l’image est codé sur 8 bits. L’image d’entrée <em>I</em> est de taille <em>t<sub>x</sub> × t<sub>y</sub></em>.</p>
            <p>Les pixels sont stockés en mémoire dans l’ordre canonique. C’est-à-dire que l’adresse d’un pixel de coordonnée (<em>x</em>, <em>y</em>) de l’image <em>I</em>, noté <em>I</em>(<em>x</em>, <em>y</em>), se calcule par :</p>
            <p><code>adresse(I(x, y)) = x + y ∗ t<sub>x</sub></code></p>
            <p>Avec <em>x</em> variant de 0 à <em>t<sub>x</sub></em> − 1 (inclue) et <em>y</em> variant de 0 à <em>t<sub>y</sub></em> − 1. Le coin 0, 0 est en haut à gauche et le coin <em>t<sub>x</sub></em> − 1, <em>t<sub>y</sub></em> − 1 est en bas à droite.</p>
            <p>On notera qu’une zone <em>l × h</em> de l’image <em>I</em> a une largeur de <em>l</em> pixels et une hauteur de <em>h</em> pixels. La notation (<em>c<sub>x</sub></em>, <em>c<sub>y</sub></em>) + <em>z<sub>x</sub> × z<sub>y</sub></em> désigne une zone de coin supérieur gauche de coordonnée (<em>c<sub>x</sub></em>, <em>c<sub>y</sub></em>) et de taille <em>z<sub>x</sub> × z<sub>y</sub></em>. Dans la suite, l’image a une taille de <em>t<sub>x</sub> × t<sub>y</sub></em> = 512 pixels.</p>
            <p>L’algorithme de détection de visage commence par calculer l’image intégrale de l’image de départ. Un pixel de l’image intégrale <em>II</em>(<em>x</em>, <em>y</em>) prend pour valeur la somme de tous les pixels du rectangle compris entre l’origine (en haut à gauche) et le pixel <em>I</em>(<em>x</em>, <em>y</em>) de l’image de départ. Comme le dernier pixel de l’image intégrale peut prendre la valeur maximale de 255 ∗ <em>t<sub>x</sub> ∗ t<sub>y</sub></em>, il est nécessaire de coder chaque pixel de l’image intégrale sur 32 bits.</p>
            <p>A partir de l’image intégrale, la détection de visage consiste à parcourir tous les pixels de l’image intégrale, (<em>d<sub>x</sub></em>, <em>d<sub>y</sub></em>) , pour tester si un visage est présent dans la zone (<em>d<sub>x</sub></em>, <em>d<sub>y</sub></em>) + <em>v<sub>x</sub> × v<sub>y</sub></em>. La détection retourne une valeur booléenne (détecté / non détecté) pour chaque pixel (<em>d<sub>x</sub></em>, <em>d<sub>y</sub></em>) et a besoin de tous les pixels de l’image intégrale dans la zone (<em>d<sub>x</sub></em>, <em>d<sub>y</sub></em>) + <em>v<sub>x</sub> × v<sub>y</sub></em>. Typiquement, la zone a une taille de <em>v<sub>x</sub> × v<sub>y</sub></em> = 24 × 24.</p>
          </section>`,
        questions: [
          {
            n: "Cell Q1",
            title: "Bande passante théorique de l’EIB",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Quelle est la bande passante maximale théorique du bus EIB, en Gbyte/s ? Pour répondre, donnez la formule de calcul du débit et les valeurs utilisées.</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut convertir les caractéristiques physiques de l’EIB en un débit, puis annoncer clairement quelle notion de « maximum théorique » on utilise. Le sujet enchaînant avec une limitation à 204,8 GB/s, une bonne copie distingue la capacité brute des anneaux du plafond cohérent.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>quatre anneaux de données ;</li>
                  <li>largeur d’un anneau : 16 octets ;</li>
                  <li>jusqu’à trois transferts simultanés par anneau si leurs chemins ne se recouvrent pas ;</li>
                  <li>fréquence EIB : 1,6 GHz, soit la moitié des 3,2 GHz du SPU.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Un anneau peut transporter au mieux <code>3 × 16 = 48 B</code> par cycle EIB en additionnant trois communications disjointes.</li>
                  <li>Les quatre anneaux donnent <code>4 × 48 = 192 B/cycle EIB</code>.</li>
                  <li>On multiplie par <code>1,6×10⁹ cycles/s</code> :<br><code>192 × 1,6×10⁹ = 307,2×10⁹ B/s</code>.</li>
                </ol>
                <p>On peut vérifier autrement avec la valeur du cours : <code>96 B/cycle processeur × 3,2 GHz = 307,2 GB/s</code>. Les deux calculs concordent, car un cycle EIB dure deux cycles processeur.</p>
                <p>Cette valeur de 307,2 GB/s est la capacité structurelle brute. L’autorisation cohérente des transferts la ramène à 204,8 GB/s, ce qui fait précisément l’objet de Q2.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">La capacité brute maximale de l’EIB vaut <strong>307,2 GB/s</strong> : <code>4 × 3 × 16 B × 1,6 GHz</code>. Le débit cohérent réellement plafonné est cependant de 204,8 GB/s à cause du rythme de snooping des adresses.</blockquote></section>`,
            intuition: `<p>Imagine quatre autoroutes circulaires. Sur chacune, trois convois peuvent avancer en même temps lorsqu’ils occupent des tronçons différents : c’est la capacité brute de 307,2 GB/s.</p><p>Mais chaque convoi doit d’abord recevoir une autorisation unique du poste de contrôle. Q1 compte les voies disponibles ; Q2 étudie le poste de contrôle qui empêche de toutes les remplir en permanence. Ce découpage mental évite de mélanger 307,2 et 204,8.</p>`,
            trap: `<p>Ne pas répondre seulement « quatre anneaux × 16 octets × 1,6 GHz = 102,4 GB/s » : un anneau peut accueillir trois transferts simultanés sur des portions disjointes. Ne pas non plus confondre la capacité brute de 307,2 GB/s avec le plafond cohérent de 204,8 GB/s.</p>`
          },
          {
            n: "Cell Q2",
            title: "Pourquoi le plafond vaut 204,8 GB/s",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Quelle est le facteur principal limitant le débit maximal du bus à 204.8 Gbyte/s ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il ne faut pas recalculer la capacité brute des anneaux, mais identifier le mécanisme architectural qui empêche de dépasser 204,8 GB/s.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>le réseau de commandes diffuse et fait snooper au plus <strong>une nouvelle adresse par cycle EIB</strong> ;</li>
                  <li>un bus request associé à cette adresse transporte au plus <strong>128 B</strong> ;</li>
                  <li>l’EIB fonctionne à <strong>1,6 GHz</strong>.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Une adresse autorisée peut déclencher au plus 128 B de données.</li>
                  <li>Une seule adresse est traitée à chacun des 1,6 milliard de cycles EIB par seconde.</li>
                  <li>Le plafond vaut donc <code>1 × 128 B × 1,6×10⁹ = 204,8×10⁹ B/s</code>.</li>
                </ol>
                <p>Les anneaux pourraient transporter davantage sur des segments disjoints, mais aucune donnée cohérente ne peut partir sans que sa commande ait été ordonnée et snoopée. Le goulot se trouve ainsi dans le chemin de commandes, pas dans la largeur physique cumulée des anneaux.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le débit est limité à <strong>204,8 GB/s</strong> par le snooping global : l’EIB accepte une adresse par cycle, chaque adresse couvrant au plus 128 B, d’où <code>128 B × 1,6 GHz</code>.</blockquote></section>`,
            intuition: `<p>L’autoroute peut être très large, mais un seul véhicule est autorisé à franchir le péage à chaque top d’horloge. Même si des tronçons restent libres, le rythme du péage fixe le débit d’entrée.</p><p>Test rapide : dès qu’une formule contient <code>128 B × 1,6 GHz</code>, on raisonne sur les commandes snoopées ; lorsqu’elle contient <code>4 × 3 × 16 B</code>, on raisonne sur la capacité brute des anneaux.</p>`,
            trap: `<p>La limite n’est pas la fréquence de 3,2 GHz du SPU. L’EIB fonctionne à 1,6 GHz et c’est surtout le rythme d’une adresse snoopée par cycle EIB qui impose le plafond.</p>`
          },
          {
            n: "Cell Q3",
            title: "Burst maximal sur l’EIB",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Quelle est la longueur maximal d’un burst sur le bus EIB, exprimé en octets et en cycles d’horloge ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut donner la taille maximale d’un bus request, puis convertir cette taille en cycles de transfert en indiquant explicitement l’horloge choisie.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul><li>burst maximal : 128 octets ;</li><li>largeur d’un anneau : 16 octets par cycle EIB ;</li><li>un cycle EIB correspond à deux cycles SPU.</li></ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Le nombre de flits temporels nécessaires est <code>128 B ÷ 16 B = 8</code>.</li>
                  <li>Le burst occupe donc son anneau pendant huit cycles EIB.</li>
                  <li>Comme le bus est à demi-fréquence, <code>8 cycles EIB × 2 = 16 cycles SPU</code>.</li>
                </ol>
                <p>Ces cycles décrivent le transport des données sur une voie de l’anneau. Ils ne comprennent pas toute la latence préalable de commande, d’arbitrage, de cohérence ou d’accès mémoire.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le burst EIB maximal est de <strong>128 B</strong>. À 16 B par cycle d’anneau, il demande <strong>8 cycles EIB</strong>, soit <strong>16 cycles SPU</strong> puisque l’EIB fonctionne à demi-fréquence.</blockquote></section>`,
            intuition: `<p>Visualise le burst comme une boîte de 128 octets découpée en huit paquets de 16 octets. L’anneau ne peut faire passer qu’un paquet par cycle sur le lien considéré.</p><p>Ce calcul mesure uniquement le temps de sérialisation. Un DMA complet prend plus longtemps, exactement comme un train met huit instants à franchir un capteur mais doit auparavant attendre son itinéraire et ses aiguillages.</p>`,
            trap: `<p>Préciser l’horloge utilisée. Dire seulement « 8 cycles » est ambigu puisque le bus tourne à la moitié de la fréquence du SPU.</p>`
          },
          {
            n: "Cell Q4",
            title: "Quatre causes de perte de débit",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Quels sont les 4 facteurs principaux limitant le débit sur le bus ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>La question attend quatre motifs de trafic concrets qui empêchent l’EIB d’utiliser tous ses segments en parallèle. Il faut les nommer et expliquer pour chacun où la capacité est perdue.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <p>L’EIB comporte deux anneaux dans chaque sens. L’arbitre choisit un chemin court et n’autorise deux transferts sur un même anneau que si leurs portions ne se recouvrent pas. Un bus request plein contient 128 B.</p></section>
              <section class="answer-part"><h4>Raisonnement pas à pas</h4>
                <ol>
                  <li><strong>Hotspot de destination :</strong> si plusieurs SPE ciblent le même local store ou le contrôleur mémoire, cette interface doit sérialiser les arrivées même si d’autres segments du réseau restent libres.</li>
                  <li><strong>Trafic dans un seul sens :</strong> si tous les chemins minimaux vont dans la même direction, seuls deux anneaux sur quatre transportent les données.</li>
                  <li><strong>Bursts partiels :</strong> un transfert court consomme tout de même une commande et un arbitrage ; répéter des messages inférieurs à 128 B diminue la part utile de chaque transaction.</li>
                  <li><strong>Chemins d’un demi-anneau :</strong> un long chemin réserve beaucoup de liens. Il a donc davantage de chances de recouvrir le chemin d’un autre transfert et de le retarder.</li>
                </ol>
                <p>Ces cas correspondent respectivement à une saturation d’extrémité, un mauvais équilibrage directionnel, une mauvaise granularité et une forte occupation spatiale du réseau.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le débit baisse en présence d’un hotspot, lorsque tous les flux utilisent la même direction, lorsque les bursts sont partiels et lorsque les communications parcourent un demi-anneau. Ces motifs provoquent sérialisation, anneaux inutilisés ou recouvrement des chemins.</blockquote></section>`,
            intuition: `<p>Une communication efficace respecte quatre mots-clés : <strong>répartir, équilibrer, remplir, rapprocher</strong>. Répartir les destinations évite le hotspot ; équilibrer utilise les deux sens ; remplir produit des bursts de 128 B ; rapprocher raccourcit les chemins.</p><p>Pour retenir les quatre causes négatives, prends l’inverse : même destination, même sens, petits messages et longue distance.</p>`,
            trap: `<p>Ne pas citer seulement la bande passante de la mémoire externe : la question vise les contentions et inefficacités internes à l’EIB.</p>`
          },
          {
            n: "Cell Q5",
            title: "Placement d’un pipeline de huit tâches",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Comment attribuer chaque tâches à un processeur SPE et chacun des flux à un canal de l’EIB afin de maximiser le débit du système ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut construire un placement spatial, pas seulement distribuer une tâche par cœur. Comme les huit étages communiquent simultanément en régime permanent, le placement doit réduire les distances, les recouvrements de chemins et l’utilisation d’une seule direction.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>la mémoire principale est raccordée par le MIC ;</li>
                  <li>les couples physiques apparaissent dans l’ordre SPE0/1, SPE2/3, SPE4/5, SPE6/7 le long du réseau ;</li>
                  <li>deux anneaux vont dans chaque direction ;</li>
                  <li>la première tâche reçoit la mémoire et la huitième y renvoie le résultat.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Placer la première et la dernière tâche près du MIC réduit les deux communications avec la mémoire.</li>
                  <li>Faire progresser les quatre premiers étages sur les interfaces successives dans un sens produit des chemins courts et disjoints.</li>
                  <li>Passer de SPE6 à SPE7 au même point d’attachement permet de repartir dans l’autre sens.</li>
                  <li>Faire revenir les quatre derniers étages par SPE5, SPE3 et SPE1 active les anneaux opposés.</li>
                </ol>
                <p>Un placement correct est donc :</p>
                <p><code>MIC → SPE0 → SPE2 → SPE4 → SPE6 → SPE7 → SPE5 → SPE3 → SPE1 → MIC</code></p>
                <p>On alterne conceptuellement les flux aller sur les deux anneaux d’un sens, et les flux retour sur les deux autres. En pratique, l’arbitre choisit lui-même l’anneau parmi les deux allant dans la direction minimale ; le programme contrôle surtout le motif au moyen du placement.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">J’affecte les tâches selon le chemin <code>MIC–SPE0–SPE2–SPE4–SPE6–SPE7–SPE5–SPE3–SPE1–MIC</code>. Ce placement en serpentin utilise les deux directions, maintient des trajets courts et permet à l’arbitre de répartir les flux sur les quatre anneaux.</blockquote></section>`,
            intuition: `<p>Dessine les quatre points d’attachement comme les barreaux d’une échelle. Le pipeline monte d’abord le côté des SPE pairs, traverse au dernier barreau, puis redescend le côté des SPE impairs.</p><p>En régime permanent, tous les étages travaillent à la fois : le bon critère n’est donc pas seulement la distance d’un flux isolé, mais la possibilité pour tous les flux d’occuper des segments différents au même instant.</p>`,
            trap: `<p>Placer simplement les tâches sur SPE0, SPE1, …, SPE7 ne garantit pas une proximité physique : deux numéros consécutifs ne sont pas nécessairement voisins le long de l’EIB.</p>`
          },
          {
            n: "Cell Q6",
            title: "Caches L1 du PPE",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Quelles sont les quantités de cache L1 de data et instruction du processeur principal (PowerPC) ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut donner séparément la capacité du cache qui alimente les instructions du PPE et celle du cache qui alimente ses lectures/écritures de données.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul><li>cache L1 d’instructions du PPE : <strong>32 KiB</strong> ;</li><li>cache L1 de données du PPE : <strong>32 KiB</strong>.</li></ul>
                <p>Le PPE possède aussi un cache L2 de 512 KiB, mais cette valeur voisine n’est pas demandée. Les SPE, eux, utilisent un local store de 256 KiB et non ces caches L1.</p></section>
              <section class="answer-part"><h4>Raisonnement pas à pas : rôle concret et exemple</h4>
                <p>Le cache d’instructions conserve près du cœur les portions de programme récemment exécutées ; le cache de données conserve les variables et blocs récemment lus ou modifiés. Par exemple, une boucle de contrôle exécutée par le PPE peut rester dans son L1 instructions tandis que sa structure de tâches reste dans le L1 données. Un accès qui manque en L1 est recherché plus bas dans la hiérarchie, notamment en L2.</p>
                <p>Les deux caches sont séparés : charger une donnée n’utilise pas les 32 KiB réservés au code, et réciproquement.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le PPE possède un cache L1 Harvard composé de <strong>32 KiB d’instructions</strong> et <strong>32 KiB de données</strong>. Il ne faut pas les confondre avec son L2 de 512 KiB ni avec les 256 KiB de local store d’un SPE.</blockquote></section>`,
            intuition: `<p>Pense à deux petits bureaux séparés devant le PPE : l’un garde les prochaines pages de programme, l’autre les nombres manipulés. Leur séparation permet d’accéder à une instruction et à une donnée sans qu’elles se disputent exactement le même espace.</p><p>La paire facile à retenir est « 32 + 32 pour le PPE », puis « 256 local pour chaque SPE ».</p>`,
            trap: `<p>Ne pas répondre 512 KiB : cette valeur correspond au cache L2 partagé par le PPE, pas aux caches L1 demandés.</p>`
          },
          {
            n: "Cell Q7",
            title: "Capacité du local store d’un SPE",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Quelle est la quantité de mémoire locale d’un SPE ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>La réponse attend une capacité par SPE et l’identification correcte de la mémoire concernée.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <p>Chaque SPE contient un SPU, un MFC et un <strong>local store de 256 KiB</strong> :</p>
                <p><code>256 × 1 024 = 262 144 octets</code></p>
                <p>À comparer avec les 32 KiB de chacun des L1 du PPE et le DMA simple maximal de 16 KiB.</p></section>
              <section class="answer-part"><h4>Raisonnement pas à pas : rôle concret et exemple</h4>
                <p>Le SPU exécute ses instructions et lit ses opérandes directement dans ce local store. Il ne peut pas effectuer un load ordinaire vers la DRAM : son MFC doit d’abord y copier les données par DMA. Par exemple, pour traiter une tuile d’image, le programme réserve dans les 256 KiB une zone pour son code, une zone d’entrée, une zone de sortie et éventuellement un deuxième tampon.</p>
                <p>La capacité est déterministe mais petite ; elle pousse donc le programmeur à découper explicitement les grandes données.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Un SPE dispose de <strong>256 KiB de local store</strong>, soit 262 144 octets, partagés entre ses instructions et ses données. Les données de mémoire principale doivent être copiées dans cette mémoire par le MFC.</blockquote></section>`,
            intuition: `<p>Le local store est la table de travail personnelle du SPU. Tout ce que le SPU veut calculer doit d’abord être posé sur cette table ; une image trop grande reste dans l’entrepôt DRAM et arrive par morceaux.</p><p>Cette image mentale explique à la fois la limite de taille, le besoin de DMA et l’intérêt du découpage en tuiles.</p>`,
            trap: `<p>Les 256 KiB ne sont pas entièrement disponibles pour l’image : en pratique, il faut réserver de la place au programme, à la pile et aux tampons.</p>`
          },
          {
            n: "Cell Q8",
            title: "Local store ou cache ?",
            sourcePage: 1,
            verbatim: true,
            prompt: `<p>Cette mémoire locale est-elle un cache ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Un simple « non » ne suffit pas : il faut montrer la différence fonctionnelle entre un cache matériel et la mémoire locale explicitement gérée du SPE.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>un cache charge automatiquement une ligne après un miss, conserve des tags et choisit les lignes remplacées ;</li>
                  <li>le local store est directement adressé par le SPU et n’effectue aucun remplissage automatique ;</li>
                  <li>le MFC et les commandes DMA assurent les transferts avec la mémoire principale.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas et exemple</h4>
                <p>Avec un cache, l’instruction <code>load</code> utilise une adresse de mémoire globale : si la donnée n’est pas présente, le matériel va la chercher. Avec le local store, un <code>load</code> ne peut viser que son adresse locale. Le programme doit connaître l’adresse externe, lancer un <em>DMA get</em>, attendre le tag approprié, puis charger la donnée locale.</p>
                <p>Exemple : avant de multiplier un bloc de 4 KiB, le SPU demande explicitement sa copie dans un tampon du local store. Rien ne sera évincé sans que le programme réutilise lui-même cette zone.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le local store d’un SPE <strong>n’est pas un cache</strong> : c’est un scratchpad explicitement adressé et géré par logiciel. Il n’a ni tags ni remplacement automatique ; le programme déplace les données avec des DMA du MFC.</blockquote></section>`,
            intuition: `<p>Le cache est un assistant qui va chercher spontanément un dossier manquant. Le local store est un bureau vide : le programmeur décide quel dossier y poser, quand le faire venir et quand réutiliser la place.</p><p>Ce contrôle supplémentaire demande plus de code, mais rend les temps d’accès locaux prévisibles et permet de recouvrir précisément communication et calcul.</p>`,
            trap: `<p>Le fait qu’il soit rapide et proche du cœur ne suffit pas à en faire un cache. La différence essentielle est la gestion explicite par DMA.</p>`
          },
          {
            n: "Cell Q9",
            title: "Taille maximale d’un DMA simple",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Quelle est la longueur maximale d’un seul transfert DMA ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut donner la limite de longueur d’une <strong>commande DMA élémentaire</strong>, pas la capacité du local store ni celle d’un burst interne de l’EIB.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <p>La longueur maximale est <strong>16 KiB</strong> :</p>
                <p><code>16 KiB = 16 × 1 024 = 16 384 octets</code></p>
                <p>Les nombres voisins à ne pas confondre sont 128 B pour un bus request EIB, 256 KiB pour le local store et 2 048 pour le nombre maximal d’éléments d’une liste.</p></section>
              <section class="answer-part"><h4>Raisonnement pas à pas : rôle concret et exemple</h4>
                <p>La commande DMA exprime un gros déplacement autonome entre une adresse effective et une adresse locale. Le MFC décompose ensuite ces 16 KiB en bus requests internes pouvant atteindre 128 B.</p>
                <p>Pour charger une bande contiguë de 64 KiB, le programme émet donc au minimum <code>64 KiB ÷ 16 KiB = 4</code> DMA. Ils peuvent partager un tag, être placés dans une liste ou être lancés de manière non bloquante afin de se recouvrir.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Une commande DMA simple du MFC transfère au maximum <strong>16 KiB, soit 16 384 octets</strong>. Une zone plus grande doit être découpée en plusieurs commandes.</blockquote></section>`,
            intuition: `<p>Le DMA de 16 KiB est un ordre de livraison ; le burst de 128 B est la taille d’un camion utilisé en interne pour effectuer cette livraison. Un seul ordre déclenche donc jusqu’à 128 bus requests de 128 B.</p><p>Cette distinction « commande de 16 KiB / trajet interne de 128 B » est l’un des pièges les plus fréquents du chapitre.</p>`,
            trap: `<p>Ne pas confondre le DMA de 16 KiB avec le burst EIB de 128 B : un DMA de 16 KiB est décomposé en nombreux bus requests de 128 B.</p>`
          },
          {
            n: "Cell Q10",
            title: "Nombre d’éléments d’une liste DMA",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Combien de transferts DMA peut-on enchaîner en mode liste ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>La question porte sur le nombre d’éléments décrits par une seule commande <em>DMA list</em>, et non sur le nombre d’entrées immédiatement actives dans la file du MFC.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>une liste contient au maximum <strong>2 048 éléments</strong> ;</li>
                  <li>chaque élément décrit une adresse effective et une longueur d’au plus 16 KiB ;</li>
                  <li>sur cette implémentation, la file de commandes issue du SPU possède 16 entrées : c’est un autre nombre et un autre rôle.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas : rôle concret et exemple</h4>
                <p>Le mode liste effectue un scatter/gather. Les blocs peuvent être dispersés dans la mémoire principale, tandis que les données produites dans le local store sont concaténées selon l’ordre des éléments.</p>
                <p>Exemple : une bande verticale de l’image intégrale comporte un petit segment utile sur chacune des 512 lignes. Une liste de 512 éléments décrit ces 512 adresses ; elle reste très en dessous de la limite de 2 048 et évite au SPU de synchroniser manuellement chaque ligne.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Une commande DMA list peut enchaîner jusqu’à <strong>2 048 transferts</strong>. Chaque élément garde une longueur maximale de 16 KiB et permet de rassembler des zones non contiguës de mémoire.</blockquote></section>`,
            intuition: `<p>Une commande simple ressemble à une adresse de livraison unique ; une liste ressemble à une tournée contenant jusqu’à 2 048 arrêts. Le moteur DMA lit la tournée sans redemander au SPU une nouvelle commande à chaque arrêt.</p><p>Retenir : 2 048 décrit la longueur de la feuille de route, alors que 16 décrit la petite file de commandes que le moteur peut avoir en vol.</p>`,
            trap: `<p>Le MFC ne possède pas 2 048 commandes simultanément dans sa file. La liste contient 2 048 éléments, tandis que la file de commandes SPU du MFC comporte 16 entrées sur cette implémentation.</p>`
          },
          {
            n: "Cell Q11",
            title: "Conditions d’efficacité d’un DMA",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Quelles sont les deux conditions qui permettent de maximiser l’efficacité d’un tranfert DMA ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut énoncer les deux conditions d’alignement et de longueur qui permettent au MFC et à l’EIB de transporter uniquement des blocs pleins.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>un bus request EIB transporte jusqu’à 128 B ;</li>
                  <li>le DMA accepte souvent un alignement minimal de 16 B, mais le meilleur débit demande 128 B ;</li>
                  <li>les adresses concernées sont l’adresse effective externe <em>et</em> l’adresse de destination dans le local store.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas : rôle concret et exemple</h4>
                <ol>
                  <li><strong>Aligner les deux extrémités sur 128 B :</strong> le premier bus request commence au début d’une ligne et ne doit pas fusionner deux lignes.</li>
                  <li><strong>Choisir une longueur multiple de 128 B :</strong> le dernier request est lui aussi entièrement utile.</li>
                </ol>
                <p>Exemple : un DMA de 1 024 B aligné aux deux extrémités devient exactement <code>1 024 ÷ 128 = 8</code> requests pleins. Un bloc commençant 32 B après une frontière ou finissant au milieu d’une ligne demande des transactions de bord et réduit l’efficacité. Enfin, des messages assez grands amortissent les cycles fixes d’émission et de cohérence.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Pour maximiser le débit DMA, les adresses mémoire effective et local store doivent être <strong>alignées sur 128 B</strong>, et la longueur doit être un <strong>multiple de 128 B</strong>, idéalement assez grande pour amortir le coût de commande.</blockquote></section>`,
            intuition: `<p>Un bloc bien aligné ressemble à une rangée de boîtes de 128 octets toutes pleines. Un mauvais départ force à ouvrir une boîte partielle au début, et une mauvaise longueur une autre à la fin.</p><p>Le matériel sait parfois accepter un alignement moins favorable, mais « accepté » ne signifie pas « optimal » : la question demande le maximum d’efficacité.</p>`,
            trap: `<p>L’alignement minimal accepté pour de nombreux DMA est 16 B, mais l’alignement qui maximise les performances est bien 128 B.</p>`
          },
          {
            n: "Cell Q12",
            title: "Synchronisation MFC–SPU",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Comment un transfert DMA du MFC est-il synchronisé avec le SPU ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut expliquer comment le SPU sait qu’une opération autonome du MFC est terminée et à quel moment il peut utiliser les données sans risque.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>un DMA est asynchrone : le SPU continue après l’émission ;</li>
                  <li>chaque commande reçoit un tag, choisi parmi des groupes identifiables par un masque ;</li>
                  <li>les canaux de statut permettent une attente « tous terminés », « au moins un terminé » ou un test non bloquant ;</li>
                  <li>fence et barrier règlent l’ordre entre commandes, ce qui est différent de la simple détection de fin.</li>
                </ul></section>
              <section class="answer-part"><h4>Raisonnement pas à pas et exemple pratique</h4>
                <ol>
                  <li>Le SPU réserve un tampon local et émet un <em>get</em> avec, par exemple, le tag 3.</li>
                  <li>Pendant que le MFC remplit ce tampon, le SPU calcule sur un autre tampon.</li>
                  <li>Avant de lire les nouvelles données, il sélectionne le bit du tag 3 dans le masque et attend son statut de fin.</li>
                  <li>Lorsque le bit est signalé, toutes les écritures du DMA correspondant sont visibles dans le local store et le tampon peut être consommé.</li>
                </ol>
                <p>Ce mécanisme est la base du double buffering. Une fence/barrier est ajoutée si un second DMA doit absolument observer ou suivre le premier dans un ordre précis.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le SPU synchronise un DMA grâce à son <strong>tag</strong> : il sélectionne les tags concernés puis lit le canal de statut, en attente bloquante ou par polling. Le transfert reste asynchrone jusque-là ; fence et barrier servent séparément à imposer l’ordre.</blockquote></section>`,
            intuition: `<p>Le tag est un numéro de reçu. Le SPU dépose plusieurs colis au MFC, continue son travail, puis présente uniquement les reçus des colis dont il a besoin.</p><p>L’idée importante n’est pas « lancer puis attendre », mais « lancer, calculer autre chose, attendre le plus tard possible ». C’est ainsi que la latence mémoire peut être cachée.</p>`,
            trap: `<p>Ne pas dire que le SPU attend automatiquement après chaque DMA. Cette attente systématique supprimerait précisément l’avantage du MFC asynchrone.</p>`
          },
          {
            n: "Cell Q13",
            title: "Coût minimal d’émission d’un DMA",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Quel est le nombre minimum de cycles d’horloge nécessaires pour réaliser un transfert DMA ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Le mot « réaliser » peut être ambigu. Dans le passage de l’article visé par l’exercice, le minimum demandé est le coût côté SPU pour <strong>émettre</strong> une requête, et non le temps nécessaire pour que le dernier octet arrive.</p></section>
              <section class="answer-part"><h4>Données utiles</h4>
                <ul>
                  <li>émission minimale par le SPU : <strong>10 cycles SPU = 3,125 ns</strong> à 3,2 GHz ;</li>
                  <li>injection du premier bus request dans l’EIB : environ 30 cycles lorsque les ressources sont libres ;</li>
                  <li>exemple complet du tableau 1 : environ 290 cycles, soit 90,61 ns, pour le transfert inter-SPE de référence.</li>
                </ul>
                <p>Ces valeurs ne décrivent pas la même frontière temporelle : commande écrite, première requête injectée, puis transfert terminé.</p></section>
              <section class="answer-part"><h4>Raisonnement pas à pas et exemple pratique</h4>
                <p>Le SPU doit écrire dans les canaux du MFC les informations décrivant les adresses, la taille, le tag et le type de commande. Cette séquence minimale demande dix cycles. Ensuite, le MFC sélectionne la commande, traduit éventuellement l’adresse, la déroule en requests de 128 B, obtient l’autorisation cohérente et transporte les données.</p>
                <p>Pour un DMA de 16 KiB, le coût d’émission reste voisin de dix cycles, mais le transfert des <code>16 384 ÷ 128 = 128</code> requests et l’accès mémoire prolongent fortement l’achèvement. C’est pourquoi l’application ne doit pas confondre coût de lancement et latence.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">Le minimum cité est de <strong>10 cycles SPU</strong> pour émettre une commande DMA. Ce nombre ne mesure pas son achèvement : l’injection demande environ 30 cycles et le cas inter-SPE détaillé dans l’article totalise environ 290 cycles.</blockquote></section>`,
            intuition: `<p>Appuyer sur « envoyer » prend dix cycles ; le colis, lui, continue à voyager après que le SPU a repris son calcul.</p><p>Pour savoir quelle valeur employer, repère le verbe : <em>émettre</em> vaut 10 cycles, <em>injecter</em> environ 30, et <em>terminer</em> dépend de la destination, de la taille et de la contention.</p>`,
            trap: `<p>Si la question est formulée oralement comme « transfert terminé », il faut demander ou préciser le scénario. Dix cycles correspondent sans ambiguïté à l’émission minimale, pas à la latence bout en bout.</p>`
          },
          {
            n: "Cell Q14",
            title: "Lecture et sens de la figure 7",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Quelles sont les unités de la figure 7 et que représente-t-elle ?</p>`,
            answer: `<section class="answer-part"><h4>Ce que demande le sujet</h4>
                <p>Il faut identifier la nature statistique de la figure, donner les unités des deux axes, distinguer ses deux panneaux et expliquer la conclusion architecturale que les auteurs en tirent.</p></section>
              <section class="answer-part"><h4>Données utiles : comment lire les axes</h4>
                <ul>
                  <li><strong>abscisse :</strong> latence d’un DMA, en microsecondes ;</li>
                  <li><strong>ordonnée :</strong> nombre de DMA tombant dans chaque classe de latence ; c’est une fréquence d’observations, pas un débit ;</li>
                  <li><strong>figure 7(a) :</strong> distributions des <em>puts</em> bloquants et non bloquants ;</li>
                  <li><strong>figure 7(b) :</strong> distributions des <em>gets</em> bloquants et non bloquants.</li>
                </ul>
                <p>Le contexte expérimental est un hotspot de mémoire principale : tous les SPE exercent une forte pression sur la même destination.</p></section>
              <section class="answer-part"><h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>On repère d’abord le maximum de la distribution sur l’axe horizontal : le pic est voisin de <strong>5,6 µs</strong>.</li>
                  <li>On le compare à la latence sans contention : les auteurs observent une augmentation d’environ un facteur sept.</li>
                  <li>On regarde ensuite l’extrémité droite, et non seulement le pic : le pire cas reste proche de <strong>13 µs</strong>, environ deux fois la moyenne.</li>
                  <li>Enfin, les distributions obtenues pour les différents SPE ne montrent pas de différence mesurable. Aucun SPE n’est systématiquement défavorisé : l’arbitrage est équitable.</li>
                </ol>
                <p>La figure caractérise donc une distribution de latence sous contention ; elle ne fournit ni un nombre de DMA/s ni directement une bande passante.</p>
                <p>Sources : <a href="https://www.pnnl.gov/publications/cell-multiprocessor-communication-network-built-speed" target="_blank" rel="noopener">fiche officielle PNNL</a> et <a href="https://users.cecs.anu.edu.au/~Alistair.Rendell/hons09/ieeemicro-cell.pdf" target="_blank" rel="noopener">copie PDF archivée de l’article de Kistler, Perrone et Petrini</a>.</p></section>
              <section class="answer-part"><h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion">La figure 7 trace le nombre de DMA en fonction de leur latence en µs lors d’un hotspot vers la mémoire principale : puts en (a), gets en (b), bloquants ou non bloquants. Le pic est vers 5,6 µs, le pire cas vers 13 µs et l’absence d’écart entre SPE montre un arbitrage équitable.</blockquote></section>`,
            intuition: `<p>Lis la figure comme un histogramme de temps d’attente : plus une colonne ou un nuage est haut, plus de DMA ont connu cette latence. Se déplacer vers la droite signifie attendre plus longtemps.</p><p>Le pic renseigne sur le cas fréquent, la queue droite sur le pire cas et la superposition des SPE sur l’équité. Ces trois lectures répondent à trois questions différentes ; aucune ne doit être remplacée par une simple lecture de la hauteur maximale.</p>`,
            trap: `<p>L’ordonnée « DMAs » est un nombre d’échantillons, pas des DMA par seconde. L’abscisse est en µs, pas en cycles.</p>`
          },
          {
            n: "Cell Q15",
            title: "Taille de l’image intégrale",
            sourcePage: 2,
            verbatim: true,
            prompt: `<p>Quelle est la taille en octets de l’image intégrale ?</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut convertir les dimensions de l’image et la taille d’un pixel intégral en une capacité mémoire totale. On cherche bien la taille de <strong>l’image intégrale</strong>, pas celle de l’image source à 8 bits.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li>dimensions : <code>512 × 512</code> pixels ;</li>
                  <li>codage d’un pixel intégral : <code>32 bits = 4 octets</code> ;</li>
                  <li><code>1 MiB = 2²⁰ octets = 1 048 576 octets</code>.</li>
                </ul>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Nombre de pixels : <code>512 × 512 = 262 144</code>.</li>
                  <li>Taille en octets : <code>262 144 × 4 = 1 048 576 octets</code>.</li>
                  <li>Conversion binaire : <code>1 048 576 ÷ 1 024 = 1 024 KiB = 1 MiB</code>.</li>
                </ol>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>L’image intégrale occupe <strong>1 048 576 octets, soit 1 024 KiB = 1 MiB</strong>.</p></blockquote>
              </section>`,
            intuition: `<p>Une image intégrale conserve ici le même nombre de positions que l’image source, mais chaque position stocke une somme cumulée. Cette somme demande 32 bits au lieu de 8 bits : la capacité est donc multipliée par quatre.</p>
              <p>Le raccourci mental utile est <code>512 = 2⁹</code> : <code>2⁹ × 2⁹ × 2² = 2²⁰</code> octets, donc exactement 1 MiB.</p>`,
            trap: `<p>Ne pas calculer avec les pixels 8 bits de l’image source : la question porte sur l’image intégrale, dont chaque somme exige 32 bits.</p>`
          },
          {
            n: "Cell Q16",
            title: "L’image tient-elle dans un SPE ?",
            sourcePage: 3,
            verbatim: true,
            prompt: `<p>Peut-elle tenir en entier dans une mémoire de SPE ? Combien de pixels de l’image intégrale peut-on mettre dans un SPE ?</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut d’abord comparer la taille calculée à la question précédente avec la capacité du local store, puis convertir la capacité disponible en nombre de pixels de 4 octets.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li>image intégrale complète : <code>1 MiB = 1 048 576 B</code> ;</li>
                  <li>local store d’un SPE : <code>256 KiB = 262 144 B</code> ;</li>
                  <li>un pixel intégral : <code>4 B</code>.</li>
                </ul>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas</h4>
                <ol>
                  <li><code>1 MiB &gt; 256 KiB</code> : l’image complète est quatre fois trop grande et ne tient donc pas dans un seul SPE.</li>
                  <li>Dans le modèle idéal où tout le local store serait réservé aux pixels : <code>262 144 B ÷ 4 B/pixel = 65 536 pixels</code>.</li>
                  <li>Rapport à l’image : <code>65 536 ÷ 262 144 = 1/4</code>. Cela équivaut par exemple à <code>65 536 ÷ 512 = 128</code> lignes complètes.</li>
                </ol>
                <p>En pratique, cette borne est optimiste : code, pile, résultats et tampons DMA occupent eux aussi le local store.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Non, les <strong>1 MiB</strong> de l’image intégrale ne tiennent pas dans les <strong>256 KiB</strong> d’un SPE. La borne théorique est <strong>65 536 pixels intégraux</strong>, soit un quart de l’image ou 128 lignes de 512 pixels.</p></blockquote>
              </section>`,
            intuition: `<p>Le local store n’est pas une mémoire virtuelle : le programmeur doit décider explicitement quel morceau de l’image y réside. Ici, le rapport de capacités <code>1 MiB / 256 KiB = 4</code> donne immédiatement l’idée d’un découpage en au moins quatre morceaux.</p>
              <p>La valeur 65 536 est une limite de papier. Une implémentation robuste choisira un bloc plus petit afin de garder de la place pour le code et, souvent, deux tampons permettant de calculer sur l’un pendant que le DMA remplit l’autre.</p>`,
            trap: `<p>65 536 est un maximum théorique. Un vrai programme doit réserver du local store pour le code, la pile, les résultats et éventuellement un second tampon.</p>`
          },
          {
            n: "Cell Q17",
            title: "DMA pour trois formes de blocs",
            sourcePage: 3,
            verbatim: true,
            prompt: `<p>Dans chacun des cas suivant, calculez le nombre de transfert DMA nécessaires pour charger la zone de l’image intégrale, ainsi que la longueur de chaque transfert :</p>
              <ul>
                <li>Une bande horizontale de largeur <em>t<sub>x</sub></em> et hauteur <em>h<sub>y</sub></em> (à calculer selon réponse précédente)</li>
                <li>Une bande verticale de largeur <em>l<sub>x</sub></em> et hauteur <em>t<sub>y</sub></em> (à calculer selon réponse précédente)</li>
                <li>Un carré de taille <em>i<sub>x</sub> × i<sub>y</sub></em>, de taille à calculer vous même</li>
              </ul>
              <p>Pour répondre, faites attention à l’organisation des données en mémoire.</p>
              <p>P.S. : Attention la suite dépend de la réponse à cette question</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Pour trois géométries contenant le même maximum de 65 536 pixels, il faut déterminer les dimensions du bloc, puis traduire sa disposition <em>row-major</em> en nombre et taille de transferts DMA.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li>budget idéal : <code>65 536 pixels × 4 B = 262 144 B = 256 KiB</code> ;</li>
                  <li>image : 512 pixels par ligne ; une ligne complète vaut donc <code>512 × 4 = 2 048 B</code> ;</li>
                  <li>taille maximale d’une commande DMA simple : <code>16 KiB = 16 384 B</code> ;</li>
                  <li>en row-major, une portion horizontale est contiguë, contrairement à une portion verticale qui comporte un segment distinct par ligne.</li>
                </ul>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et calculs</h4>
                <ol>
                  <li><strong>Bande horizontale.</strong> Toute la largeur est conservée, donc la hauteur maximale est <code>65 536 ÷ 512 = 128</code> lignes. Les 256 KiB sont contigus, mais la limite de 16 KiB impose <code>256 ÷ 16 = 16</code> commandes de 16 KiB.</li>
                  <li><strong>Bande verticale.</strong> Sur chacune des 512 lignes, on prend <code>65 536 ÷ 512 = 128</code> pixels, soit <code>128 × 4 = 512 B</code>. Comme les segments sont séparés par le reste de chaque ligne, il faut 512 éléments DMA de 512 B, typiquement décrits par une DMA list.</li>
                  <li><strong>Carré.</strong> <code>√65 536 = 256</code>, donc le carré mesure <code>256 × 256</code>. Chacune de ses 256 lignes fournit un segment contigu de <code>256 × 4 = 1 024 B = 1 KiB</code>, d’où 256 éléments DMA.</li>
                </ol>
                <table>
                  <thead><tr><th scope="col">Zone</th><th scope="col">Dimensions largeur × hauteur</th><th scope="col">Nombre de DMA</th><th scope="col">Longueur utile</th></tr></thead>
                  <tbody>
                    <tr><td>Bande horizontale</td><td><code>512 × 128</code></td><td>16</td><td>16 KiB chacun</td></tr>
                    <tr><td>Bande verticale</td><td><code>128 × 512</code></td><td>512</td><td>512 B par ligne</td></tr>
                    <tr><td>Carré</td><td><code>256 × 256</code></td><td>256</td><td>1 KiB par ligne</td></tr>
                  </tbody>
                </table>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>À capacité identique, la bande horizontale utilise <strong>16 DMA de 16 KiB</strong>, la bande verticale <strong>512 DMA de 512 B</strong> et le carré <strong>256 DMA de 1 KiB</strong>. La bande horizontale est la plus favorable car ses données sont contiguës en mémoire.</p></blockquote>
              </section>`,
            intuition: `<p>La forme géométrique seule ne suffit pas : c’est son implantation linéaire en mémoire qui décide de la fragmentation. Deux blocs de 256 KiB peuvent ainsi demander 16 ou 512 commandes.</p>
              <p>Plus un transfert est grand, plus son coût fixe de lancement est amorti. C’est pourquoi une zone large et peu haute est naturellement avantagée dans une image rangée ligne par ligne.</p>`,
            trap: `<p>Ne pas annoncer un seul DMA de 256 KiB pour la bande horizontale : la zone est contiguë, mais une commande DMA reste limitée à 16 KiB.</p>`
          },
          {
            n: "Cell Q18",
            title: "Temps de transfert et meilleure forme",
            sourcePage: 3,
            verbatim: true,
            prompt: `<p>A partir des mesures relevées sur l’article, donnez le temps de tranfert des données dans chacun des cas et en déduire la meilleure configuration.</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut transformer des points lus sur les courbes expérimentales de l’article en temps total pour chaque géométrie, puis comparer ces temps. <strong>Les valeurs numériques sont donc des lectures approximatives de graphes</strong>, pas des constantes exactes du Cell.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles et lecture des axes</h4>
                <p><strong>Figure 4, transferts bloquants :</strong> l’axe horizontal donne la taille d’un message DMA en octets, sur une échelle logarithmique ; l’axe vertical donne la latence d’un DMA. Il faut choisir la courbe correspondant à un <em>get</em> depuis la mémoire principale, lire la latence à 512 B, 1 KiB ou 16 KiB, puis la multiplier par le nombre de messages.</p>
                <p><strong>Figure 5(d), commandes regroupées/non bloquantes :</strong> l’axe horizontal donne encore la taille d’un message et l’axe vertical le débit soutenu en GB/s. Après lecture du débit, on applique <code>temps = volume total ÷ débit</code>.</p>
                <p>Dans les trois cas, le volume total utile est identique : <code>256 KiB = 262 144 B</code>.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et calculs</h4>
                <p><strong>1. Mode bloquant.</strong> Chaque DMA doit finir avant le suivant ; les latences lues se cumulent donc directement.</p>
                <table>
                  <thead><tr><th scope="col">Zone</th><th scope="col">Lecture approximative</th><th scope="col">Multiplication</th><th scope="col">Temps total estimé</th></tr></thead>
                  <tbody>
                    <tr><td>Horizontale</td><td>16 KiB ≈ 1,08 µs/DMA</td><td><code>16 × 1,08</code></td><td>≈ 17,3 µs</td></tr>
                    <tr><td>Verticale</td><td>512 B ≈ 0,17–0,18 µs/DMA</td><td><code>512 × (0,17 à 0,18)</code></td><td>≈ 87–92 µs</td></tr>
                    <tr><td>Carré</td><td>1 KiB ≈ 0,19–0,20 µs/DMA</td><td><code>256 × (0,19 à 0,20)</code></td><td>≈ 49–51 µs</td></tr>
                  </tbody>
                </table>
                <p><strong>2. Mode regroupé/non bloquant.</strong> Les commandes se chevauchent ; on raisonne alors avec le débit soutenu. Par exemple, à 17 GB/s : <code>(262 144 ÷ 17×10⁹) × 10⁶ ≈ 15,4 µs</code>.</p>
                <table>
                  <thead><tr><th scope="col">Zone et taille des messages</th><th scope="col">Débit lu approximatif</th><th scope="col">Calcul</th><th scope="col">Temps estimé</th></tr></thead>
                  <tbody>
                    <tr><td>Horizontale, 16 KiB</td><td>≈ 17–18 GB/s</td><td><code>262 144 ÷ (17 à 18)×10⁹</code></td><td>≈ 14,6–15,4 µs</td></tr>
                    <tr><td>Verticale, 512 B</td><td>≈ 8 GB/s</td><td><code>262 144 ÷ 8×10⁹</code></td><td>≈ 32,8 µs</td></tr>
                    <tr><td>Carré, 1 KiB</td><td>≈ 15 GB/s</td><td><code>262 144 ÷ 15×10⁹</code></td><td>≈ 17,5 µs</td></tr>
                  </tbody>
                </table>
                <p>Dans chaque comparaison, le plus petit temps est celui de la bande horizontale. Le carré se rapproche en mode pipeliné, mais la bande verticale reste pénalisée par ses 512 petits segments.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>D’après les courbes, et avec des valeurs nécessairement approximatives, la bande horizontale demande environ <strong>17,3 µs en mode bloquant</strong> ou <strong>14,6–15,4 µs en mode regroupé</strong>. Elle est la meilleure configuration, devant le carré puis la bande verticale.</p></blockquote>
              </section>`,
            intuition: `<p>Les trois formes déplacent exactement le même volume. Ce n’est donc pas la quantité de données qui les départage, mais la granularité : un petit message paie presque autant de coût fixe de lancement qu’un grand, tout en transportant beaucoup moins de données.</p>
              <p>La méthode d’examen est systématique : lire d’abord le nom des axes et la bonne courbe, relever une valeur avec « ≈ », puis seulement appliquer soit <code>nombre de DMA × latence</code>, soit <code>volume ÷ débit</code>. Les deux modèles ne doivent pas être mélangés.</p>`,
            trap: `<p>Une valeur lue sur un graphe doit être précédée de « environ ». Il faut aussi préciser si l’on utilise les courbes bloquantes ou les courbes batch/nonblocking ; mélanger leur latence et leur débit produirait un calcul incohérent.</p>`
          },
          {
            n: "Cell Q19",
            title: "Parallélisation avec halos",
            sourcePage: 3,
            verbatim: true,
            prompt: `<p>En répartissant l’image intégrale par blocs sur les sPE et en remarquant que les zones de détection nécessitent des données qui se recouvrent, en déduire une méthode de parallélisation des calculs sur les SPE.</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut distribuer la détection entre les SPE sans perdre les fenêtres qui chevauchent une frontière de partition. La réponse doit distinguer la zone de <strong>résultats dont un SPE est propriétaire</strong> et la zone d’entrée un peu plus grande qu’il doit charger.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li>huit SPE disponibles ;</li>
                  <li>fenêtre de détection de hauteur <code>v<sub>y</sub> = 24</code> ;</li>
                  <li>image intégrale de 512 pixels de large, à 4 octets par pixel ;</li>
                  <li>local store de 256 KiB par SPE.</li>
                </ul>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Le PPE découpe les <strong>origines de détection</strong> en huit intervalles horizontaux exclusifs, un par SPE. Ainsi, chaque résultat possède exactement un propriétaire.</li>
                  <li>Une fenêtre qui commence sur la dernière ligne attribuée à un SPE descend encore sur <code>24 − 1 = 23</code> lignes. Chaque SPE, sauf celui du bord inférieur, charge donc un <strong>halo inférieur de 23 lignes</strong>.</li>
                  <li>Dans le découpage nominal du sujet, <code>512 ÷ 8 = 64</code> lignes de résultats sont confiées à chaque SPE. Les sept premières entrées contiennent alors <code>64 + 23 = 87</code> lignes ; la dernière est tronquée au bord de l’image.</li>
                  <li>Vérification mémoire : <code>87 × 512 × 4 = 178 176 B</code>, valeur inférieure aux <code>262 144 B</code> du local store.</li>
                  <li>Chaque SPE calcule uniquement ses 64 lignes de sorties, renvoie ses résultats au PPE et ignore toute éventuelle sortie correspondant au halo. Avec des blocs plus petits, deux tampons permettent de recouvrir DMA et calcul.</li>
                </ol>
                <p>Variante 2D : une tuile possédant <code>B<sub>x</sub> × B<sub>y</sub></code> origines de détection demande une entrée de <code>(B<sub>x</sub> + 23) × (B<sub>y</sub> + 23)</code>, avec halos droit et inférieur.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Je répartis les origines de détection en <strong>huit bandes horizontales exclusives</strong>. Chaque SPE charge sa bande plus un <strong>halo de 23 lignes</strong>, mais ne produit que les résultats dont il est propriétaire. Une entrée de 87 lignes occupe 178 176 B et tient dans le local store.</p></blockquote>
              </section>`,
            intuition: `<p>Le halo duplique des <em>données d’entrée</em>, jamais des résultats. Deux SPE voisins peuvent donc lire les mêmes pixels, mais chacun écrit une partie différente de la carte de détection : aucune synchronisation fine n’est nécessaire entre eux.</p>
              <p>Pourquoi 23 ? Une fenêtre de 24 lignes ancrée sur une ligne possède déjà sa première ligne dans la bande ; il lui en faut encore 23 sous la frontière. Cette règle générale donne toujours un halo de <code>taille de fenêtre − 1</code>.</p>`,
            trap: `<p>Le halo vaut 23 et non 24 : deux bandes de résultats voisines utilisent déjà chacune leur première ligne, et seules les 23 lignes suivantes traversent la frontière.</p>`
          },
          {
            n: "Cell Q20",
            title: "Volume rechargé dans les halos",
            sourcePage: 3,
            verbatim: true,
            prompt: `<p>Selon le schéma proposé, combien de données sont-elle chargées plusieurs fois ?</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>On cherche le <strong>volume supplémentaire</strong> relu à cause des halos, c’est-à-dire ce qui s’ajoute à une lecture unique de l’image. Il ne faut pas confondre ce supplément avec le trafic total.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li><code>P = 8</code> bandes, donc <code>P − 1 = 7</code> frontières internes ;</li>
                  <li>halo : 23 lignes par frontière ;</li>
                  <li>512 pixels par ligne et 4 octets par pixel intégral ;</li>
                  <li>image sans duplication : <code>1 048 576 B</code>.</li>
                </ul>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et calculs</h4>
                <ol>
                  <li>Chaque frontière crée une relecture de <code>23 × 512</code> pixels.</li>
                  <li>Formule générale : <code>N<sub>dup</sub> = (P − 1) × 23 × 512</code> pixels.</li>
                  <li>Pour huit bandes : <code>7 × 23 × 512 = 82 432 pixels</code>.</li>
                  <li>En octets : <code>82 432 × 4 = 329 728 B = 322 KiB</code>.</li>
                  <li>Trafic total : <code>1 048 576 + 329 728 = 1 378 304 B</code>.</li>
                  <li>Surcoût relatif : <code>329 728 ÷ 1 048 576 × 100 ≈ 31,45 %</code>.</li>
                </ol>
                <p>Dire que les pixels de halo sont « chargés deux fois » signifie une lecture normale par le propriétaire de la bande et une lecture supplémentaire par son voisin.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Les sept frontières du découpage à huit SPE dupliquent <strong>82 432 pixels</strong>, soit <strong>329 728 B = 322 KiB</strong>. Le trafic total vaut 1 378 304 B, ce qui représente un surcoût d’environ <strong>31,45 %</strong>.</p></blockquote>
              </section>`,
            intuition: `<p>Le bon comptage part des frontières, pas des bandes : huit bandes alignées ont sept frontières internes. Chacune provoque exactement une copie supplémentaire de son halo de 23 lignes.</p>
              <p>Cette redondance est volontaire. Elle consomme un peu de bande passante, mais évite aux SPE de communiquer entre eux au milieu du calcul et rend chaque tâche autonome.</p>`,
            trap: `<p>Le résultat dépend du nombre de bandes choisi. Une bonne copie commence donc par annoncer <code>(P − 1) × 23 × 512 × 4</code>, puis remplace <code>P</code> par 8 pour le schéma proposé.</p>`
          }
        ]
      },
      {
        title: "Déroulage de boucle et ordonnancement d’instructions",
        theme: "Ordonnancement MIPS",
        context: `<p>On dispose d’un processeur MIPS permettant d’exécuter une instruction entière par cycle, auquel on adjoint un opérateur d’addition flottante pipelinée acceptant une nouvelle addition à chaque cycle mais d’une latence de 2 cycles (2 stalls entre l’instruction qui produit et celle qui consomme) et un opérateur de multiplication flottante pipelinée acceptant une nouvelle multiplication à chaque cycle mais d’une latence de 4 cycles. Par ailleurs, on rappelle que le registre résultat d’un chargement à partir de la mémoire (entier, LD, ou flottant, LD.D) n’est pas disponible dans le cycle suivant, mais dans le cycle d’après (1 stall entre l’instruction de chargement et l’instruction qui consomme le registre), et que l’instruction qui suit le branchement est exécutée inconditionnellement. Cette instruction doit être considérée comme un stall si elle est un NOP.</p>
          <p>Soit le code :</p>
          <pre><code>for (i = n; i &gt; 0; i--) y[i] = y[i] + a*x[i];</code></pre>
          <p>Que l’on peut traduire en assembleur MIPS par</p>
          <pre><code>      L.D F0, 0(R0)    % charge a, constant sur la boucle
loop: L.D F1, 0(R1)    % charge y[i]
      L.D F2, 0(R2)    % charge x[i]
      MUL.D F2, F2, F0 % calcul de a * x[i]
      ADD.D F1, F1, F2 % somme à y[i]
      ADDUI R1, R1, 8 % passe à l’y suivant
      ADDUI R2, R2, 8 % passe à l’x suivant
      ADDUI R3, R3, -1 % décrémente le compteur
      S.D   F1         % sauve le resultat
      BNEZ R3, loop    % itère si pas au bout</code></pre>`,
        questions: [
          {
            n: "MIPS Q1",
            title: "Stalls du code initial",
            sourcePage: 4,
            verbatim: true,
            prompt: `<p>Indiquer les stalls dans le code sans le modifier et en déduire le CPI moyen des instructions de cette boucle (le NOP étant considéré comme un stall).</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut conserver l’ordre du programme, insérer explicitement toutes les bulles exigées par les dépendances du pipeline, puis calculer le CPI du corps répété.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li><code>L.D → utilisation</code> : une instruction indépendante doit séparer les deux, sinon un stall ;</li>
                  <li><code>MUL.D → ADD.D</code> dépendante : quatre instructions de séparation ;</li>
                  <li><code>ADD.D → S.D</code> dépendant : deux instructions de séparation ;</li>
                  <li>le branchement possède un delay slot, toujours exécuté.</li>
                </ul>
                <p>On exclut le chargement unique de <code>F0</code>, situé avant la boucle. L’adresse du store étant absente du PDF, <code>-8(R1)</code> représente ici l’ancienne adresse de <code>y[i]</code> après l’incrément de <code>R1</code>.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et code annoté</h4>
                <ol>
                  <li><code>L.D F2</code> est immédiatement suivi de <code>MUL.D</code> qui consomme <code>F2</code> : il manque une séparation, donc un NOP.</li>
                  <li><code>MUL.D</code> produit la valeur lue par <code>ADD.D</code> : aucune instruction utile n’est placée entre les deux dans le code initial, donc quatre NOP.</li>
                  <li>Après <code>ADD.D</code>, les trois <code>ADDUI</code> fournissent déjà plus que les deux séparations demandées avant <code>S.D</code> : aucun NOP supplémentaire ici.</li>
                  <li>Aucune instruction sûre n’a encore été déplacée dans le delay slot du branchement : il reste un NOP final.</li>
                </ol>
                <pre><code>loop:
    L.D    F1, 0(R1)
    L.D    F2, 0(R2)
    NOP                         # load F2 → MUL : 1 stall

    MUL.D  F2, F2, F0
    NOP
    NOP
    NOP
    NOP                         # MUL → ADD : 4 stalls

    ADD.D  F1, F1, F2
    ADDUI  R1, R1, 8
    ADDUI  R2, R2, 8
    ADDUI  R3, R3, -1
    S.D    F1, -8(R1)
    BNEZ   R3, loop
    NOP                         # delay slot perdu</code></pre>
                <p>Le corps contient neuf instructions utiles. Les dépendances ajoutent <code>1 + 4 = 5</code> stalls et le delay slot vide en ajoute un : <code>9 + 6 = 15</code> cycles.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Le code initial exige <strong>six stalls</strong> : un après <code>L.D F2</code>, quatre après <code>MUL.D</code> et un dans le delay slot. Pour neuf instructions utiles, <code>CPI = 15/9 ≈ <strong>1,67</strong></code>.</p></blockquote>
              </section>`,
            intuition: `<p>Un stall n’est pas attaché arbitrairement à une instruction : il représente le nombre de créneaux que le consommateur doit encore attendre avant que le résultat du producteur soit disponible. Une instruction indépendante placée dans ce créneau ferait le même travail temporel qu’un NOP, mais de façon utile.</p>
              <p>Ici, le chemin critique local est <code>chargement de x → multiplication → addition</code>. Les trois mises à jour de pointeurs arrivent trop tard pour masquer ces premières latences, tandis qu’elles masquent déjà entièrement la dépendance entre l’addition et le store.</p>`,
            trap: `<p>Ne pas ajouter deux stalls entre l’addition et le store : les trois instructions entières déjà présentes constituent des séparations valides.</p>`
          },
          {
            n: "MIPS Q2",
            title: "Réordonnancement de la boucle",
            sourcePage: 4,
            verbatim: true,
            prompt: `<p>On décide de réordonnancer les instructions sans modifier le comportement afin de minimiser les stalls. Proposez une nouvelle version du programme en mettant toujours les stalls en évidence et donnez le CPI.</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>On peut déplacer les instructions, mais ni en supprimer ni changer le résultat observable. Le but est de remplacer autant de NOP que possible par du travail indépendant et d’utiliser légalement le delay slot.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <p>Les mêmes séparations qu’en Q1 s’appliquent : une après un load, quatre entre multiplication et addition, deux entre addition et store. Les mises à jour de <code>R1</code>, <code>R2</code> et <code>R3</code> sont indépendantes du résultat flottant ; en revanche, avancer <code>R1</code> oblige le store à utiliser l’offset <code>-8</code>.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et code réordonné</h4>
                <pre><code>loop:
    L.D    F2, 0(R2)
    L.D    F1, 0(R1)            # masque le load-use de F2
    MUL.D  F2, F2, F0

    ADDUI  R1, R1, 8
    ADDUI  R2, R2, 8
    ADDUI  R3, R3, -1
    NOP                         # 4e séparation MUL → ADD

    ADD.D  F1, F1, F2
    NOP                         # 1re séparation ADD → store
    BNEZ   R3, loop             # 2e séparation
    S.D    F1, -8(R1)           # delay slot utile</code></pre>
                <ol>
                  <li><code>L.D F1</code>, indépendant de <code>F2</code>, est placé entre <code>L.D F2</code> et <code>MUL.D</code> : le load-use ne demande plus de NOP.</li>
                  <li>Après <code>MUL.D</code>, les trois <code>ADDUI</code> remplissent trois des quatre créneaux requis ; il manque exactement un NOP avant <code>ADD.D</code>.</li>
                  <li>Entre <code>ADD.D</code> et le store, le NOP puis <code>BNEZ</code> fournissent les deux séparations requises.</li>
                  <li>Le store courant est placé dans le delay slot. Il doit être exécuté même lorsque le branchement n’est pas pris à la dernière itération : ce déplacement préserve donc le comportement.</li>
                </ol>
                <p>Il reste neuf instructions utiles et deux bulles, donc onze cycles par itération.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Après réordonnancement, seuls <strong>deux NOP</strong> subsistent. Le store remplit le delay slot sans modifier le programme et <code>CPI = (9 + 2)/9 = 11/9 ≈ <strong>1,22</strong></code>.</p></blockquote>
              </section>`,
            intuition: `<p>Le réordonnancement ne raccourcit aucune latence matérielle. Il donne simplement au processeur d’autres instructions à exécuter pendant que la donnée flottante mûrit dans le pipeline.</p>
              <p>Le delay slot est une occasion particulière : l’instruction qui le remplit s’exécute que le branchement soit pris ou non. Le store de l’itération courante est sûr précisément parce qu’il doit avoir lieu dans les deux cas.</p>`,
            trap: `<p>Placer le chargement de l’itération suivante dans le delay slot peut lire hors du tableau lors de la dernière itération. Le store courant, lui, est toujours nécessaire.</p>`
          },
          {
            n: "MIPS Q3",
            title: "Déroulage par deux sans réordonnancement",
            sourcePage: 4,
            verbatim: true,
            prompt: `<p>On désire dérouler cette boucle 2 fois afin de gagner encore en performance, l’hypothèse étant qu’elle se fait un nombre pair de fois. En repartant de la version initiale du programme donnée dans l’énoncé (et non de votre version optimisée en Q2), proposez une nouvelle version du programme en mettant toujours les stalls en évidence et donnez le CPI.</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Le déroulage demandé est ici une transformation <strong>mécanique</strong> : deux itérations initiales sont mises dans un même corps, sans appliquer encore l’ordonnancement de Q2. On doit conserver les stalls de données de chaque copie et ne garder qu’un branchement pour les deux itérations.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <p>Une itération sans son branchement contient huit instructions utiles et cinq stalls de données : un pour <code>L.D → MUL.D</code> et quatre pour <code>MUL.D → ADD.D</code>. Le groupe déroulé contient deux telles copies, puis un seul <code>BNEZ</code> et un seul delay slot. On suppose un nombre d’itérations compatible avec un déroulage par deux, ou une boucle de finition séparée.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et code déroulé</h4>
                <p>Les pointeurs progressent de 8 octets et le compteur diminue après chaque copie. La première copie n’a plus son branchement ; la seconde termine le groupe.</p>
                <pre><code>loop:
    L.D    F1, 0(R1)
    L.D    F2, 0(R2)
    NOP
    MUL.D  F2, F2, F0
    NOP
    NOP
    NOP
    NOP
    ADD.D  F1, F1, F2
    ADDUI  R1, R1, 8
    ADDUI  R2, R2, 8
    ADDUI  R3, R3, -1
    S.D    F1, -8(R1)

    L.D    F1, 0(R1)
    L.D    F2, 0(R2)
    NOP
    MUL.D  F2, F2, F0
    NOP
    NOP
    NOP
    NOP
    ADD.D  F1, F1, F2
    ADDUI  R1, R1, 8
    ADDUI  R2, R2, 8
    ADDUI  R3, R3, -1
    S.D    F1, -8(R1)
    BNEZ   R3, loop
    NOP                         # un seul delay slot pour 2 tours</code></pre>
                <ol>
                  <li>Instructions utiles : <code>2 × 8 + 1 branchement = 17</code>.</li>
                  <li>Stalls de données : <code>2 × (1 + 4) = 10</code>.</li>
                  <li>Delay slot vide du seul branchement : <code>1</code> stall.</li>
                  <li>Cycles du groupe : <code>17 + 10 + 1 = 28</code>.</li>
                </ol>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Le déroulage littéral par deux donne <strong>17 instructions utiles</strong> et <strong>11 stalls</strong>, soit 28 cycles. Son CPI est donc <code>28/17 ≈ <strong>1,65</strong></code>.</p></blockquote>
              </section>`,
            intuition: `<p>Dérouler et ordonnancer sont deux opérations différentes. Dérouler agrandit d’abord la fenêtre d’instructions disponible ; si l’on ne réordonne pas ensuite, les deux chaînes dépendantes restent l’une après l’autre avec presque toutes leurs bulles.</p>
              <p>Le petit gain de <code>1,67</code> à <code>1,65</code> vient seulement de l’amortissement du contrôle : deux itérations partagent désormais un branchement et un delay slot, mais les dix stalls de données subsistent.</p>`,
            trap: `<p>Le sujet demande de repartir de la version initiale. Si l’on duplique la boucle déjà ordonnancée de Q2, on ne répond plus à la transformation demandée et le CPI change.</p>`
          },
          {
            n: "MIPS Q4",
            title: "Ordonnancement de la boucle déroulée",
            sourcePage: 4,
            verbatim: true,
            prompt: `<p>Finalement, on se propose de réordonner cette version déroulée (il était temps), sachant que les autres registres entiers et flottants sont disponibles à loisir. Proposez une nouvelle version du programme en mettant toujours les stalls en évidence et donnez le CPI.</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Après déroulage par deux, il faut exploiter l’indépendance des deux itérations pour remplir tous les créneaux de latence. Des registres flottants distincts évitent d’introduire de fausses dépendances entre les deux calculs.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <p>On réserve <code>F1/F2</code> à l’itération 0 et <code>F3/F4</code> à l’itération 1. Les contraintes restent : au moins une instruction entre load et utilisation, quatre entre multiplication et addition, deux entre addition et store, plus une instruction dans le delay slot. Chaque élément double occupe 8 octets, donc les deux stores visent les adresses initiales <code>R1</code> et <code>R1+8</code>.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et code ordonnancé</h4>
                <pre><code>loop:
    L.D    F1, 0(R1)            # y0
    L.D    F2, 0(R2)            # x0
    L.D    F3, 8(R1)            # y1
    L.D    F4, 8(R2)            # x1

    MUL.D  F2, F2, F0
    MUL.D  F4, F4, F0

    ADDUI  R1, R1, 8
    ADDUI  R2, R2, 8
    ADDUI  R3, R3, -1

    ADD.D  F1, F1, F2
    ADD.D  F3, F3, F4

    ADDUI  R1, R1, 8
    ADDUI  R3, R3, -1
    S.D    F1, -16(R1)
    ADDUI  R2, R2, 8

    BNEZ   R3, loop
    S.D    F3, -8(R1)           # delay slot utile</code></pre>
                <table>
                  <thead><tr><th scope="col">Dépendance vérifiée</th><th scope="col">Positions dans le groupe</th><th scope="col">Pourquoi elle est satisfaite</th></tr></thead>
                  <tbody>
                    <tr><td><code>L.D F2 → MUL.D F2</code></td><td>2 → 5</td><td>Les instructions 3 et 4 les séparent ; il en fallait au moins une.</td></tr>
                    <tr><td><code>L.D F4 → MUL.D F4</code></td><td>4 → 6</td><td>L’autre multiplication, en position 5, fournit la séparation requise.</td></tr>
                    <tr><td><code>MUL.D F2 → ADD.D F1</code></td><td>5 → 10</td><td>Les positions 6 à 9 donnent exactement quatre instructions intermédiaires.</td></tr>
                    <tr><td><code>MUL.D F4 → ADD.D F3</code></td><td>6 → 11</td><td>Les positions 7 à 10 donnent exactement quatre instructions intermédiaires.</td></tr>
                    <tr><td><code>ADD.D F1 → S.D F1</code></td><td>10 → 14</td><td>Trois instructions les séparent, donc la contrainte de deux est dépassée.</td></tr>
                    <tr><td><code>ADD.D F3 → S.D F3</code></td><td>11 → 17</td><td>Cinq instructions les séparent ; le store occupe en plus le delay slot.</td></tr>
                  </tbody>
                </table>
                <p>Au moment des stores, <code>R1</code> a avancé deux fois : <code>-16(R1)</code> retrouve l’adresse de <code>y[i]</code> et <code>-8(R1)</code> celle de <code>y[i+1]</code>. Les deux décréments de <code>R3</code> sont terminés avant <code>BNEZ</code>. Les 17 créneaux contiennent donc 17 instructions utiles et aucun NOP.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Le renommage des registres permet d’entrelacer les deux itérations et de satisfaire toutes les latences sans NOP. Le groupe exécute <strong>17 instructions utiles en 17 cycles</strong>, donc <code>CPI = <strong>1</strong></code>.</p></blockquote>
              </section>`,
            intuition: `<p>Les latences matérielles n’ont pas disparu : elles sont cachées par du travail appartenant à l’autre itération. Le déroulage fournit précisément les instructions indépendantes qui manquaient à la boucle courte.</p>
              <p>Le renommage <code>F1/F2</code> et <code>F3/F4</code> est essentiel. Si les deux itérations réutilisaient immédiatement les mêmes registres, elles sembleraient dépendre l’une de l’autre et le compilateur ne pourrait pas les chevaucher aussi librement.</p>`,
            trap: `<p>Les offsets négatifs des stores sont indispensables ici : au moment des écritures, <code>R1</code> a déjà été avancé de 16 octets.</p>`
          }
        ]
      },
      {
        title: "Réseau sur puce : tore rectangulaire",
        theme: "Réseaux sur puce",
        context: `<p>Cet exercice porte sur le réseau dont la topologie est donnée à la figure 1. Les hypothèses sont les suivantes : un paquet qui va d’un routeur à l’un de ses voisins (directement connecté par un lien) met 1 cycle ; les connexions entre les nœuds (liens) sont des canaux bidirectionnels, chaque canal possédant une bande passante notée <em>b</em>.</p>
          <figure>
            <pre aria-label="Topologie du réseau torique"><code> (0,m−1)──(1,m−1)──(2,m−1)── … ──(n−1,m−1)
    │         │         │                   │
   (0,3)────(1,3)─────(2,3)────── … ────(n−1,3)
    │         │         │                   │
   (0,2)────(1,2)─────(2,2)────── … ────(n−1,2)
    │         │         │                   │
   (0,1)────(1,1)─────(2,1)────── … ────(n−1,1)
    │         │         │                   │
   (0,0)────(1,0)─────(2,0)────── … ────(n−1,0)

Chaque ligne et chaque colonne reboucle sur elle-même.</code></pre>
            <figcaption>Figure 1 – Réseau torique non symétrique</figcaption>
          </figure>`,
        questions: [
          {
            n: "Tore Q1",
            title: "Bande passante totale du tore",
            sourcePage: 5,
            verbatim: true,
            prompt: `<p>Donnez la bande passante totale du réseau, c.-à-d. la bande passante de l’ensemble des canaux, comme une fonction de <em>n</em> et <em>m</em> ;</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut compter une seule fois tous les canaux physiques du tore, puis multiplier ce nombre par la bande passante <code>b</code> d’un canal bidirectionnel.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <ul>
                  <li>nombre de nœuds : <code>N = nm</code> ;</li>
                  <li>degré de chaque nœud : 4, avec deux voisins horizontaux et deux verticaux ;</li>
                  <li>un même canal relie deux nœuds et apparaît donc deux fois dans la somme des degrés.</li>
                </ul>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas</h4>
                <p>La somme des degrés vaut <code>4nm</code>. En divisant par deux pour ne pas compter chaque canal à ses deux extrémités :</p>
                <p><code>L = 4nm ÷ 2 = 2nm canaux</code>.</p>
                <p>On retrouve le même résultat en séparant les directions : chacune des <code>m</code> lignes forme un cycle de <code>n</code> liens, soit <code>nm</code> liens horizontaux ; chacune des <code>n</code> colonnes forme un cycle de <code>m</code> liens, soit <code>nm</code> liens verticaux.</p>
                <p>En multipliant par la capacité d’un canal : <code>B<sub>total</sub> = Lb = 2nmb</code>.</p>
                <p>Cette écriture suit l’énoncé : <code>b</code> désigne la capacité du canal bidirectionnel complet. Si <code>b</code> était donné <em>par direction</em>, la somme des capacités directionnelles serait doublée.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Le tore possède <strong><code>2nm</code> canaux bidirectionnels</strong>. Sa bande passante agrégée est donc <strong><code>B<sub>total</sub> = 2nmb</code></strong>.</p></blockquote>
              </section>`,
            intuition: `<p>Le facteur deux ne vient pas des deux sens de circulation : il vient des deux familles de liens, horizontale et verticale. Chacune contient exactement autant de liens que le réseau contient de nœuds.</p>
              <p>La division par deux dans la preuve par les degrés évite un piège classique : le lien entre A et B est vu une fois depuis A et une fois depuis B, mais il ne constitue qu’un seul canal physique.</p>`,
            trap: `<p>Ne pas écrire <code>4nmb</code> sans diviser par deux : chaque lien relie deux nœuds et serait sinon compté à chacune de ses extrémités.</p>`
          },
          {
            n: "Tore Q2",
            title: "Bisections minimale et maximale",
            sourcePage: 5,
            verbatim: true,
            prompt: `<p>Déterminer la bande passante minimale et maximale (<em>bisection bandwidth</em> qui passe sur les canaux traversés lorsque l’on coupe le réseau en <em>deux parties égales</em>.</p>
              <p>NB : plusieurs découpages sont possibles, il faut donc déterminer ceux qui amènent à la plus grande et plus petite découpe de bande passante ;</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut compter les canaux reliant deux moitiés de même taille. Comme le mot « coupe » peut désigner soit une séparation géométrique en deux régions connexes, soit n’importe quelle partition équilibrée des nœuds, l’hypothèse doit être annoncée.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles et hypothèses</h4>
                <p>On adopte d’abord l’interprétation usuelle du sujet : <strong><code>n</code> et <code>m</code> pairs</strong> et coupes géométriques droite/gauche ou haut/bas. Chaque canal traversé contribue <code>b</code>. Le rebouclage est essentiel : une moitié possède une frontière au milieu du dessin et une seconde à l’endroit où les bords extérieurs sont raccordés.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas</h4>
                <ol>
                  <li><strong>Coupe verticale.</strong> Dans chacune des <code>m</code> lignes cycliques, un lien traverse la séparation centrale et un lien traverse la couture de rebouclage. Cela donne <code>2m</code> canaux, donc <code>B<sub>verticale</sub> = 2mb</code>.</li>
                  <li><strong>Coupe horizontale.</strong> Le même raisonnement sur les <code>n</code> colonnes donne <code>2n</code> canaux, donc <code>B<sub>horizontale</sub> = 2nb</code>.</li>
                  <li>La plus petite des deux coupes géométriques vaut donc <code>2b × min(n,m)</code>, et la plus grande <code>2b × max(n,m)</code>.</li>
                </ol>
                <table>
                  <thead><tr><th scope="col">Interprétation</th><th scope="col">Minimum</th><th scope="col">Maximum</th></tr></thead>
                  <tbody>
                    <tr><td>Coupes géométriques connexes</td><td><code>2b·min(n,m)</code></td><td><code>2b·max(n,m)</code></td></tr>
                    <tr><td>Toute partition équilibrée, <code>n,m</code> pairs</td><td><code>2b·min(n,m)</code></td><td><code>2nmb</code>, par damier</td></tr>
                  </tbody>
                </table>
                <p><strong>Nuance pour une partition arbitraire :</strong> un damier sépare les extrémités de tous les liens lorsque les deux dimensions sont paires, d’où le maximum <code>2nmb</code>. Si <code>n</code> est pair et <code>m</code> impair, une arête par colonne ne peut pas alterner et le maximum devient <code>(2nm − n)b</code> ; si <code>n</code> est impair et <code>m</code> pair, il devient <code>(2nm − m)b</code>.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Pour les coupes géométriques usuelles d’un tore pair, <strong><code>B<sub>min</sub> = 2b·min(n,m)</code></strong> et <strong><code>B<sub>max,géo</sub> = 2b·max(n,m)</code></strong>. Si toute partition équilibrée est autorisée, je le précise : pour <code>n,m</code> pairs, le damier donne <code>B<sub>max</sub> = 2nmb</code>.</p></blockquote>
              </section>`,
            intuition: `<p>Sur une grille sans rebouclage, on imagine spontanément une seule frontière. Sur un tore, les deux moitiés se touchent aussi par les bords opposés recollés : chaque ligne ou colonne coupée fournit donc deux canaux traversants.</p>
              <p>La bisection « classique » mesure le goulot d’étranglement et cherche le minimum. La demande d’un maximum rend l’énoncé ambigu : une droite coupe peu de liens, tandis qu’une coloration en damier fait alterner les deux groupes presque à chaque lien. Écrire l’hypothèse protège la copie.</p>`,
            trap: `<p>Dans une copie, annoncer l’hypothèse de coupe géométrique. Sinon le mot « maximale » est ambigu : un damier peut couper bien plus de liens qu’une droite.</p>`
          },
          {
            n: "Tore Q3",
            title: "Diamètre du réseau",
            sourcePage: 5,
            verbatim: true,
            prompt: `<p>Donnez le diamètre du réseau, c.-à-d. le nombre de nœuds (<em>hop count</em>) qu’il faut traverser pour qu’un paquet voyage entre les nœuds les plus distants, incluant la source et la destination). Donnez un exemple de tel chemin (genre (a, b) ↝ (u, v), ou (a, b) et (u, v) sont les coordonnées des nœuds) ;</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Le diamètre est la plus grande distance minimale entre deux nœuds. Il faut toutefois rendre le résultat dans la convention particulière de l’énoncé : <strong>nombre de nœuds traversés, extrémités incluses</strong>, et non simple nombre de liens ou <em>hops</em>.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <p>Par symétrie, on fixe la source à <code>(0,0)</code>. Pour une destination <code>(x,y)</code>, on peut avancer ou reculer dans chaque cycle. Les deux coordonnées sont indépendantes : le chemin minimal est la somme du meilleur déplacement horizontal et du meilleur déplacement vertical.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas</h4>
                <ol>
                  <li>Horizontalement, les deux longueurs possibles sont <code>x</code> et <code>n − x</code> ; on retient <code>min(x,n−x)</code>.</li>
                  <li>Verticalement, on retient de même <code>min(y,m−y)</code>.</li>
                  <li>La distance minimale en liens est donc <code>d(x,y) = min(x,n−x) + min(y,m−y)</code>.</li>
                  <li>La coordonnée la plus éloignée sur un cycle de longueur <code>n</code> est à <code>⌊n/2⌋</code> liens ; sur le cycle de longueur <code>m</code>, elle est à <code>⌊m/2⌋</code>. Ainsi <code>D<sub>liens</sub> = ⌊n/2⌋ + ⌊m/2⌋</code>.</li>
                  <li>Un chemin de <code>h</code> liens visite <code>h+1</code> nœuds lorsque source et destination sont comptées. On ajoute donc 1.</li>
                </ol>
                <p>Exemple maximal : de <code>(0,0)</code> à <code>(⌊n/2⌋,⌊m/2⌋)</code>, parcourir <code>⌊n/2⌋</code> liens horizontalement puis <code>⌊m/2⌋</code> verticalement. Tout ordre intercalant ces déplacements possède la même longueur minimale.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Le diamètre vaut <strong><code>⌊n/2⌋ + ⌊m/2⌋</code> liens</strong>, soit, dans la convention demandée, <strong><code>D<sub>nœuds</sub> = 1 + ⌊n/2⌋ + ⌊m/2⌋</code> nœuds traversés</strong>.</p></blockquote>
              </section>`,
            intuition: `<p>Le rebouclage transforme chaque dimension en cercle : pour atteindre une position, on choisit toujours le plus court des deux sens. Le point le plus difficile à atteindre est donc situé à environ un demi-tour horizontal et un demi-tour vertical.</p>
              <p>Retenir la conversion <code>nœuds = liens + 1</code> évite l’erreur d’unité. Un trajet direct A→B comporte un seul lien mais visite bien deux nœuds.</p>`,
            trap: `<p>Le hop count désigne souvent le nombre de liens. Ici l’énoncé impose explicitement source et destination incluses : il faut donc ajouter 1 au nombre de liens.</p>`
          },
          {
            n: "Tore Q4",
            title: "Distance moyenne",
            sourcePage: 5,
            verbatim: true,
            prompt: `<p>Donnez le nombre moyens de nœuds à traverser (distance moyenne) pour un paquet du réseau en supposant une équiprobabilité de répartition. Par ex., on peut supposer que le nœud 00 envoie un paquet à chacun des autres nœuds du réseau.</p>`,
            answer: `<section class="answer-part">
                <h4>Ce que demande le sujet</h4>
                <p>Il faut sommer les longueurs des plus courts chemins depuis <code>(0,0)</code> vers toutes les <code>nm−1</code> destinations distinctes, diviser par leur nombre, puis convertir les liens en nœuds traversés.</p>
              </section>
              <section class="answer-part">
                <h4>Données utiles</h4>
                <p>La distance du tore est séparable : <code>d(x,y) = d<sub>n</sub>(x) + d<sub>m</sub>(y)</code>, avec <code>d<sub>k</sub>(i)=min(i,k−i)</code>. On introduit la somme sur un cycle de longueur <code>k</code> :</p>
                <p><code>S(k) = Σ<sub>i=0</sub><sup>k−1</sup> min(i,k−i)</code>.</p>
              </section>
              <section class="answer-part">
                <h4>Raisonnement pas à pas et démonstration</h4>
                <ol>
                  <li>Si <code>k=2q</code> est pair, les distances sont <code>0,1,…,q−1,q,q−1,…,1</code>. Leur somme vaut <code>2(1+…+q−1)+q = q² = k²/4</code>.</li>
                  <li>Si <code>k=2q+1</code> est impair, les distances sont <code>0,1,…,q,q,…,1</code>. Leur somme vaut <code>2(1+…+q)=q(q+1)=⌊k²/4⌋</code>.</li>
                  <li>Dans les deux cas, <code>S(k)=⌊k²/4⌋</code>.</li>
                  <li>La somme horizontale <code>S(n)</code> apparaît une fois pour chacune des <code>m</code> lignes, soit <code>m⌊n²/4⌋</code>. La somme verticale <code>S(m)</code> apparaît dans chacune des <code>n</code> colonnes, soit <code>n⌊m²/4⌋</code>.</li>
                  <li>La source a une distance nulle et ne change pas le numérateur, mais elle n’est pas une destination : le dénominateur est donc <code>nm−1</code>.</li>
                </ol>
                <p>La moyenne en liens est :</p>
                <p><code>d̄<sub>liens</sub> = [m⌊n²/4⌋ + n⌊m²/4⌋] ÷ (nm−1)</code>.</p>
                <p>Chaque chemin non vide visite un nœud de plus qu’il ne traverse de liens, donc :</p>
                <p><code>d̄<sub>nœuds</sub> = 1 + d̄<sub>liens</sub></code>.</p>
              </section>
              <section class="answer-part">
                <h4>Conclusion prête à recopier</h4>
                <blockquote class="answer-conclusion"><p>Pour des destinations équiprobables parmi les <code>nm−1</code> autres nœuds, la moyenne demandée est <strong><code>d̄<sub>nœuds</sub> = 1 + [m⌊n²/4⌋ + n⌊m²/4⌋]/(nm−1)</code></strong>.</p></blockquote>
              </section>`,
            intuition: `<p>On n’a pas besoin d’énumérer les <code>nm</code> destinations une à une. La structure produit permet de traiter séparément deux anneaux 1D : la contribution horizontale est répétée sur toutes les lignes et la verticale sur toutes les colonnes.</p>
              <p>Le plancher réunit proprement les cas pairs et impairs. Sur un cycle pair, il existe un unique point diamétralement opposé ; sur un cycle impair, deux points sont à la distance maximale. Les deux motifs donnent pourtant la même forme compacte <code>⌊k²/4⌋</code>.</p>`,
            trap: `<p>Le dénominateur est <code>nm−1</code>, puisque le texte envoie vers chacun des autres nœuds. Inclure la source donnerait une moyenne différente.</p>`
          }
        ]
      }
    ]
  }
];
