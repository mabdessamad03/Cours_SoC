(() => {
  "use strict";

  const mockExam = {
    title: "Examen blanc complet — Systèmes sur puce",
    durationMinutes: 120,
    totalPoints: 100,
    instructions: [
      "Traitez les huit exercices. Le barème détaillé de chaque sous-question est visible dans son corrigé.",
      "Justifiez chaque résultat : une valeur numérique sans formule ni unité ne reçoit pas tous les points.",
      "Pendant la simulation, laissez les corrigés fermés et travaillez sur une feuille séparée.",
      "Les temps conseillés totalisent exactement 2 heures ; une calculatrice simple suffit.",
      "Toute hypothèse supplémentaire doit être écrite sur la copie."
    ],
    exercises: [
      {
        id: "foundations",
        number: 1,
        title: "Fondations, énergie et méthode de conception",
        theme: "SoC · Hétérogénéité · Énergie · Méthode",
        points: 10,
        minutes: 12,
        statement: `<p>On conçoit une caméra autonome à 30 images/s. Son SoC regroupe un CPU, un accélérateur de traitement d’image, une SRAM, un contrôleur DDR et des interfaces caméra/réseau. Le produit fonctionne sur batterie et chaque image doit être traitée avant l’arrivée de la suivante.</p>
          <p>Pour l’étude énergétique, on utilise <code>P<sub>dyn</sub>=αC<sub>eff</sub>V²f</code>, avec <code>α=0,25</code>, <code>C<sub>eff</sub>=8 nF</code> et une puissance statique supposée identique dans les deux modes, <code>P<sub>stat</sub>=0,40 W</code>. Le mode initial est <code>V=1,0 V</code>, <code>f=500 MHz</code>. Un mode DVFS emploie <code>V=0,80 V</code>, <code>f=400 MHz</code> et respecte encore la cadence de 30 images/s.</p>`,
        questions: [
          {
            id: "1.1",
            points: 3,
            prompt: `<p>Définissez précisément un SoC, attribuez un rôle aux cinq blocs cités et expliquez pourquoi cette organisation hétérogène peut être préférable à un CPU seul.</p>`,
            rubric: [
              { points: 1, label: "Définition : système complet intégré sur une même puce" },
              { points: 1, label: "Rôle cohérent des cinq blocs" },
              { points: 1, label: "Justification performance/énergie/flexibilité de l’hétérogénéité" }
            ],
            correction: {
              data: `<p>Un SoC se définit par l’intégration de fonctions de calcul, de mémoire, de communication et d’entrées-sorties dans une même puce. Il ne se réduit donc ni à un CPU ni à un simple assemblage de cœurs.</p>`,
              steps: `<ul><li>Le <strong>CPU</strong> exécute le système, le contrôle et les traitements irréguliers.</li><li>L’<strong>accélérateur</strong> exploite le parallélisme régulier du traitement d’image avec davantage d’opérations par joule.</li><li>La <strong>SRAM</strong> garde les données chaudes avec une faible latence ; le <strong>contrôleur DDR</strong> donne accès à une capacité externe plus grande.</li><li>Les <strong>interfaces caméra/réseau</strong> adaptent les protocoles physiques et déplacent les flux vers le reste du système.</li><li>L’hétérogénéité affecte chaque tâche au moteur le plus adapté : le CPU garde la programmabilité, tandis que l’accélérateur augmente le débit et réduit l’énergie.</li></ul>`,
              result: `<p><strong>Un SoC intègre sur une puce calcul, mémoires, interconnexion et interfaces. Son intérêt est de combiner flexibilité du CPU et efficacité des blocs spécialisés sous des contraintes de débit, coût et énergie.</strong></p>`,
              trap: `<p>« System on Chip » ne signifie pas que toute la mémoire est nécessairement sur la puce : le contrôleur peut piloter une DDR externe.</p>`
            }
          },
          {
            id: "1.2",
            points: 4,
            prompt: `<p>Calculez la puissance dynamique et la puissance totale dans les deux modes. Donnez le pourcentage de réduction de puissance totale et l’énergie consommée par image dans le mode DVFS.</p>`,
            rubric: [
              { points: 1, label: "Puissance initiale : dynamique et totale" },
              { points: 1, label: "Puissance DVFS : dynamique et totale" },
              { points: 1, label: "Réduction relative correctement calculée" },
              { points: 1, label: "Énergie par image avec unité" }
            ],
            correction: {
              data: `<p>Il faut convertir <code>8 nF=8×10⁻⁹ F</code> et les MHz en hertz. La puissance statique reste ici inchangée.</p>`,
              steps: `<ol><li>Mode initial : <code>Pdyn=0,25×8×10⁻⁹×1²×500×10⁶=1,00 W</code>, donc <code>Ptot=1,00+0,40=1,40 W</code>.</li><li>Mode DVFS : <code>Pdyn=0,25×8×10⁻⁹×0,8²×400×10⁶=0,512 W</code>, donc <code>Ptot=0,512+0,40=0,912 W</code>.</li><li>Réduction : <code>(1,40−0,912)/1,40≈0,3486</code>, soit <code>34,9 %</code>.</li><li>À 30 images/s, une image dure <code>1/30 s</code> : <code>Eimage=0,912/30=0,0304 J=30,4 mJ</code>.</li></ol>`,
              result: `<p><strong>Initial : 1,00 W dynamique et 1,40 W totale. DVFS : 0,512 W dynamique et 0,912 W totale, soit 34,9 % de moins et 30,4 mJ par image.</strong></p>`,
              trap: `<p>La tension intervient au carré. Diviser seulement la fréquence par 1,25 ne donne donc pas la réduction totale, et la puissance statique ne doit pas être multipliée par <code>V²f</code>.</p>`
            }
          },
          {
            id: "1.3",
            points: 3,
            prompt: `<p>Proposez une démarche top-down en trois niveaux pour décider si l’accélérateur est nécessaire. Précisez ce que l’on vérifie à chaque niveau et pourquoi commencer directement par le RTL serait risqué.</p>`,
            rubric: [
              { points: 1, label: "Spécification fonctionnelle et contraintes mesurables" },
              { points: 1, label: "Exploration d’architecture et modèle de performance" },
              { points: 1, label: "Raffinement RTL/vérification et justification du risque" }
            ],
            correction: {
              data: `<p>Une démarche top-down augmente progressivement le niveau de détail sans perdre les contraintes du produit.</p>`,
              steps: `<ol><li><strong>Spécification :</strong> fixer qualité du traitement, 30 images/s, latence maximale, enveloppe d’énergie, coût et interfaces.</li><li><strong>Exploration :</strong> profiler l’algorithme, estimer calculs et trafic mémoire, comparer CPU, SIMD et accélérateur avec un modèle transactionnel ou cycle-approximatif.</li><li><strong>Raffinement :</strong> choisir l’architecture, produire le RTL, puis vérifier fonction, timing, surface, puissance et intégration logiciel/matériel.</li></ol><p>Commencer par le RTL fige tôt une solution coûteuse à modifier avant d’avoir prouvé qu’elle respecte le débit et que la mémoire peut l’alimenter.</p>`,
              result: `<p><strong>On part des exigences, on explore plusieurs architectures avec des modèles rapides, puis on raffine et vérifie la solution retenue. Le RTL est une conséquence du choix, pas son point de départ.</strong></p>`,
              trap: `<p>Un accélérateur très rapide en calcul peut rester inutile si le débit DDR ou le coût des transferts devient le goulot d’étranglement.</p>`
            }
          }
        ]
      },
      {
        id: "infra",
        number: 2,
        title: "Communication, DMA, AXI et réseau sur puce",
        theme: "DMA · AXI · Arbitrage · NoC",
        points: 14,
        minutes: 17,
        statement: `<p>Un DMA copie un tampon contigu de <strong>4 096 octets</strong> de la DDR vers une SPRAM par AXI4, sur un bus de données de <strong>64 bits à 200 MHz</strong>. Les adresses source et destination sont alignées sur 128 octets. Le DMA choisit systématiquement des lots de 128 octets ; chaque lot produit un burst AXI de lecture de 128 octets puis un burst AXI d’écriture de 128 octets. Aucun burst ne franchit une frontière de 4 Kio.</p>
          <p>Pour un lot, la lecture paie 18 cycles fixes puis 16 cycles de données ; l’écriture paie 4 cycles fixes puis 16 cycles de données. Les coûts fixes incluent les handshakes d’adresse AR/AW et, pour l’écriture, la réponse B. Le DMA remplit son unique tampon avant d’écrire : lecture et écriture ne se recouvrent pas. Il émet une seule interruption après le dernier handshake B ; la première instruction de la routine s’exécute 120 cycles plus tard.</p>`,
        questions: [
          {
            id: "2.1",
            points: 4,
            prompt: `<p>Calculez le nombre de beats par burst, le nombre de lots, le nombre total de bursts AXI, les cycles de données, le temps entre le lancement et la première instruction d’interruption, puis le débit utile observé par le logiciel.</p>`,
            rubric: [
              { points: 1, label: "16 beats, 32 lots et 64 bursts AXI" },
              { points: 0.5, label: "1 024 cycles de données sur les deux directions" },
              { points: 1, label: "1 728 cycles pour le DMA" },
              { points: 1, label: "1 848 cycles et 9,24 µs jusqu’à la routine" },
              { points: 0.5, label: "Débit utile d’environ 443,3 MB/s" }
            ],
            correction: {
              data: `<ul><li>64 bits = 8 octets par beat.</li><li>Un lot contient un burst de lecture et un burst d’écriture.</li><li>À 200 MHz, un cycle dure 5 ns.</li></ul>`,
              steps: `<ol><li>Un burst transporte <code>128/8=16 beats</code>.</li><li>Le tampon contient <code>4096/128=32 lots</code>, donc <code>32 bursts R + 32 bursts W = 64 bursts AXI</code>.</li><li>Chaque octet traverse le bus deux fois : <code>2×4096/8=1 024</code> cycles de données.</li><li>Un lot coûte <code>18+16+4+16=54 cycles</code> ; le DMA coûte <code>32×54=1 728 cycles</code>.</li><li>Jusqu’à la routine : <code>1728+120=1 848 cycles</code>, soit <code>1848×5 ns=9,24 µs</code>.</li><li>Débit logiciel : <code>4096 B/9,24 µs≈443,3 MB/s</code> en unités décimales.</li></ol>`,
              result: `<p><strong>16 beats/burst ; 32 lots = 64 bursts AXI ; 1 024 cycles de données ; 1 848 cycles = 9,24 µs jusqu’à la routine ; débit utile ≈ 443,3 MB/s.</strong></p>`,
              trap: `<p>Il y a 32 lots mais 64 bursts AXI : une lecture et une écriture sont deux transactions distinctes. Les 120 cycles d’interruption ne sont payés qu’une fois.</p>`
            }
          },
          {
            id: "2.2",
            points: 3,
            prompt: `<p>Nommez les cinq canaux AXI, donnez leur direction et expliquez la règle <code>VALID/READY</code>, notamment pourquoi AW et W peuvent être acceptés à des cycles différents.</p>`,
            rubric: [
              { points: 1.5, label: "AR/R et AW/W/B avec directions correctes" },
              { points: 1, label: "Handshake indépendant VALID et READY" },
              { points: 0.5, label: "Maintien du payload stable jusqu’au handshake" }
            ],
            correction: {
              data: `<p>AXI sépare adresses, données et réponses ; chaque canal a ses propres signaux <code>VALID</code> et <code>READY</code>.</p>`,
              steps: `<ul><li><strong>AR</strong> : adresse de lecture, maître → esclave. <strong>R</strong> : données/réponse, esclave → maître.</li><li><strong>AW</strong> : adresse d’écriture, maître → esclave. <strong>W</strong> : données, maître → esclave. <strong>B</strong> : réponse d’écriture, esclave → maître.</li><li>Un transfert a lieu seulement au front où <code>VALID=1</code> et <code>READY=1</code> sur le canal concerné.</li><li>AW et W sont autonomes : un esclave peut accepter l’adresse avant les données ou l’inverse. L’émetteur conserve chaque payload stable tant que son handshake n’a pas eu lieu.</li></ul>`,
              result: `<p><strong>AR, AW et W vont du maître vers l’esclave ; R et B reviennent vers le maître. Aucun handshake d’un canal ne prouve qu’un autre canal a été accepté.</strong></p>`,
              trap: `<p>AW/W/B ne sont pas trois phases partageant un acquittement unique.</p>`
            }
          },
          {
            id: "2.3",
            points: 3,
            prompt: `<p>Quatre maîtres M0 à M3 demandent simultanément un bus non préemptif. Un burst occupe 16 cycles et le pointeur round-robin désigne M2. Donnez l’ordre des services et le temps d’attente initial de chaque maître. Comparez avec une priorité fixe où M0 est prioritaire et peut demander sans interruption.</p>`,
            rubric: [
              { points: 1, label: "Ordre round-robin M2, M3, M0, M1" },
              { points: 1, label: "Attentes 0, 16, 32 et 48 cycles correctement associées" },
              { points: 1, label: "Équité du round-robin et famine possible en priorité fixe" }
            ],
            correction: {
              data: `<p>Le burst en cours n’est pas interrompu. Le pointeur indique le premier gagnant, puis l’arbitre poursuit cycliquement.</p>`,
              steps: `<ol><li>M2 commence au cycle 0, M3 au cycle 16, M0 au cycle 32 et M1 au cycle 48.</li><li>Les attentes initiales sont donc M2=0, M3=16, M0=32 et M1=48 cycles.</li><li>Le round-robin borne ici l’attente à trois bursts et partage le bus.</li><li>En priorité fixe, si M0 renouvelle toujours sa requête, M1–M3 peuvent ne jamais être servis : c’est la famine.</li></ol>`,
              result: `<p><strong>Ordre RR : M2 → M3 → M0 → M1 ; attentes : 0, 16, 32, 48 cycles. La priorité fixe réduit la latence de M0 mais peut affamer les autres.</strong></p>`,
              trap: `<p>Le round-robin ne partage pas les 16 cycles d’un burst : il change de maître seulement entre deux bursts.</p>`
            }
          },
          {
            id: "2.4",
            points: 4,
            prompt: `<p>Dans un mesh 4×4 sans rebouclage, calculez la distance minimale entre les routeurs (0,1) et (3,3). Recalculez-la pour un tore 4×4. Un paquet contient 8 flits et, sans contention, sa latence est définie ici par <code>L=H+F−1</code> cycles. Donnez les deux latences à 500 MHz et expliquez le compromis du tore.</p>`,
            rubric: [
              { points: 1, label: "Distance mesh H=5" },
              { points: 1, label: "Distance tore H=3 avec distances circulaires" },
              { points: 1, label: "Latences 12 cycles/24 ns et 10 cycles/20 ns" },
              { points: 1, label: "Compromis latence/bande passante contre liens et routage supplémentaires" }
            ],
            correction: {
              data: `<p>Dans un mesh, <code>H=|Δx|+|Δy|</code>. Dans un tore de taille 4, chaque dimension utilise <code>min(|Δ|,4−|Δ|)</code>. Un cycle à 500 MHz vaut 2 ns.</p>`,
              steps: `<ol><li>Mesh : <code>|3−0|+|3−1|=3+2=5</code> sauts.</li><li>Tore : horizontalement <code>min(3,1)=1</code>, verticalement <code>min(2,2)=2</code>, donc <code>H=3</code>.</li><li>Mesh : <code>L=5+8−1=12 cycles=24 ns</code>.</li><li>Tore : <code>L=3+8−1=10 cycles=20 ns</code>.</li><li>Les liens de rebouclage réduisent diamètre et congestion, mais coûtent fils, ports de routeur et complexité de routage/deadlock.</li></ol>`,
              result: `<p><strong>Mesh : 5 sauts et 24 ns. Tore : 3 sauts et 20 ns selon la convention fournie ; le gain se paie en connectique et contrôle supplémentaires.</strong></p>`,
              trap: `<p>Dans un tore, la différence brute 3 devient une distance 1 grâce au rebouclage.</p>`
            }
          }
        ]
      },
      {
        id: "memory",
        number: 3,
        title: "SDRAM, cache et mémoire locale",
        theme: "SDRAM · Cache · AMAT · SPRAM",
        points: 14,
        minutes: 17,
        statement: `<p>Une banque SDRAM simplifiée utilise <code>tACT=4 cycles</code>, <code>CL=3 cycles</code>, un burst de données de 4 cycles et <code>tPRE=3 cycles</code>. Les commandes ne se recouvrent pas. La banque est d’abord préchargée ; on accède successivement à la ligne 5, encore à la ligne 5, puis à la ligne 9.</p>
          <p>On considère aussi un cache de données de 64 octets, direct-mapped, avec des lignes de 8 octets, initialement invalide, write-back et write-allocate. Les adresses et les mots font 32 bits ; les accès sont alignés. La mémoire contient : 0x100→11111111, 0x104→22222222, 0x108→33333333, 0x10C→44444444, 0x140→55555555, 0x144→66666666, 0x148→77777777 et 0x14C→88888888.</p>
          <p>Enfin, le SoC offre au noyau temps réel une SPRAM disponible de 4 Kio, à latence fixe d’un cycle, chargeable explicitement par DMA.</p>`,
        questions: [
          {
            id: "3.1",
            points: 3,
            prompt: `<p>Calculez la durée de chacun des trois accès SDRAM, leur total en cycles et en nanosecondes à 200 MHz. Expliquez l’intérêt de conserver une ligne ouverte.</p>`,
            rubric: [
              { points: 1.5, label: "Durées 11, 7 et 14 cycles" },
              { points: 0.5, label: "Total 32 cycles" },
              { points: 0.5, label: "Conversion 160 ns" },
              { points: 0.5, label: "Économie ACT/PRE lors d’un row hit" }
            ],
            correction: {
              data: `<p>Un premier accès exige ACT, CL et données. Un row hit réutilise la ligne ouverte. Changer de ligne exige PRE puis une nouvelle ACT.</p>`,
              steps: `<ol><li>Ligne 5, banque fermée : <code>4+3+4=11 cycles</code>.</li><li>Deuxième accès ligne 5 : row hit, donc <code>3+4=7 cycles</code>.</li><li>Passage à la ligne 9 : <code>3+4+3+4=14 cycles</code>.</li><li>Total : <code>11+7+14=32 cycles</code>. À 200 MHz : <code>32×5 ns=160 ns</code>.</li></ol>`,
              result: `<p><strong>11 cycles, 7 cycles et 14 cycles ; total 32 cycles = 160 ns. Le row hit évite précharge et activation.</strong></p>`,
              trap: `<p>La latence CAS ne remplace pas la durée du burst : les 4 cycles de données restent à compter.</p>`
            }
          },
          {
            id: "3.2",
            points: 3,
            prompt: `<p>Donnez le découpage tag/index/offset du cache. Pour 0x104, 0x108, 0x144 et 0x148, donnez base de ligne, index et tag.</p>`,
            rubric: [
              { points: 1, label: "Découpage 26 bits de tag, 3 d’index, 3 d’offset" },
              { points: 1, label: "Bases de ligne correctes" },
              { points: 1, label: "Index et tags corrects pour les quatre adresses" }
            ],
            correction: {
              data: `<p>Le cache contient <code>64/8=8</code> lignes. Une ligne de 8 octets utilise 3 bits d’offset et 8 index utilisent 3 bits.</p>`,
              steps: `<p><code>offset=A[2:0]</code>, <code>index=A[5:3]</code>, <code>tag=A[31:6]</code>.</p><table><thead><tr><th>Adresse</th><th>Base</th><th>Index</th><th>Tag</th></tr></thead><tbody><tr><td>0x104</td><td>0x100</td><td>0</td><td>0x4</td></tr><tr><td>0x108</td><td>0x108</td><td>1</td><td>0x4</td></tr><tr><td>0x144</td><td>0x140</td><td>0</td><td>0x5</td></tr><tr><td>0x148</td><td>0x148</td><td>1</td><td>0x5</td></tr></tbody></table>`,
              result: `<p><strong>Adresse = tag 26 bits | index 3 bits | offset 3 bits. 0x104/0x144 se disputent l’index 0 et 0x108/0x148 l’index 1.</strong></p>`,
              trap: `<p>L’index se calcule après retrait de l’offset de ligne, pas avec les bits de poids faible de l’adresse octet.</p>`
            }
          },
          {
            id: "3.3",
            points: 5,
            prompt: `<p>Exécutez dans l’ordre <code>R[0x104]</code>, <code>W[0x108]←AAAAAAAA</code>, <code>R[0x144]</code>, <code>R[0x108]</code>, <code>R[0x148]</code>. Pour chaque accès, donnez hit/miss, valeur lue, éventuel write-back et contenu complet de la ligne affectée après l’accès. Donnez les totaux.</p>`,
            rubric: [
              { points: 2.5, label: "Hit/miss et valeur pour les cinq accès" },
              { points: 1, label: "États, tags et contenus complets des lignes" },
              { points: 0.5, label: "Write-back de la ligne dirty au bon moment" },
              { points: 1, label: "Totaux 1 hit, 4 misses, 1 write-back et mémoire finale" }
            ],
            correction: {
              data: `<p>Une ligne contient deux mots. Un write miss charge d’abord toute la ligne, modifie le mot et pose le bit dirty.</p>`,
              steps: `<table><thead><tr><th>Accès</th><th>Événement</th><th>Ligne après accès</th></tr></thead><tbody><tr><td>R 0x104</td><td>Miss ; lit 22222222</td><td>index 0, tag 4, propre : [11111111,22222222]</td></tr><tr><td>W 0x108←AAAAAAAA</td><td>Miss + write-allocate</td><td>index 1, tag 4, dirty : [AAAAAAAA,44444444]</td></tr><tr><td>R 0x144</td><td>Miss ; éviction propre ; lit 66666666</td><td>index 0, tag 5, propre : [55555555,66666666]</td></tr><tr><td>R 0x108</td><td>Hit ; lit AAAAAAAA</td><td>index 1, tag 4, dirty : [AAAAAAAA,44444444]</td></tr><tr><td>R 0x148</td><td>Miss ; write-back de 0x108 ; lit 77777777</td><td>index 1, tag 5, propre : [77777777,88888888]</td></tr></tbody></table><p>Le write-back écrit toute la ligne : <code>M[0x108]=AAAAAAAA</code> et <code>M[0x10C]=44444444</code>.</p>`,
              result: `<p><strong>1 hit, 4 misses et 1 write-back. À la fin, les index 0 et 1 portent le tag 5 et la mémoire contient AAAAAAAA à 0x108.</strong></p>`,
              trap: `<p>Le remplacement à l’index 0 n’écrit rien : la ligne était propre. Le seul write-back survient lors du remplacement de l’index 1 dirty.</p>`
            }
          },
          {
            id: "3.4",
            points: 3,
            prompt: `<p>Un autre cache a un hit time de 1 cycle, un taux de miss de 6 % et une pénalité de base de 30 cycles. Parmi les misses, 25 % ajoutent un write-back de 16 cycles. Calculez l’AMAT. Pour le jeu de données temps réel de 4 Kio, choisissez ensuite entre ce cache et la SPRAM décrite dans l’énoncé.</p>`,
            rubric: [
              { points: 1, label: "Pénalité moyenne de miss égale à 34 cycles" },
              { points: 1, label: "AMAT égale à 3,04 cycles" },
              { points: 1, label: "Choix argumenté de la SPRAM pour le WCET" }
            ],
            correction: {
              data: `<p><code>AMAT=Thit+tauxmiss×pénalité moyenne</code>. La SPRAM disponible contient exactement les 4 Kio et répond en un cycle fixe.</p>`,
              steps: `<ol><li>Surcoût moyen dirty par miss : <code>0,25×16=4 cycles</code>.</li><li>Pénalité moyenne : <code>30+4=34 cycles</code>.</li><li><code>AMAT=1+0,06×34=3,04 cycles</code>.</li><li>L’AMAT est une moyenne ; le cache garde des misses et conflits. Charger le jeu en SPRAM par DMA avant le noyau donne ensuite une latence déterministe d’un cycle et facilite le calcul du WCET.</li></ol>`,
              result: `<p><strong>AMAT = 3,04 cycles. Pour un WCET précisément borné, choisir la SPRAM disponible et planifier explicitement son chargement.</strong></p>`,
              trap: `<p>La SPRAM n’est pas automatiquement « plus rapide » dans tous les systèmes ; son avantage décisif ici est la prédictibilité explicitement donnée.</p>`
            }
          }
        ]
      },
      {
        id: "cnn",
        number: 4,
        title: "Virgule fixe et accélération d’un CNN",
        theme: "Fixe · Quantification · Convolution · Débit",
        points: 14,
        minutes: 18,
        statement: `<p>Une valeur <code>Qe.v</code> possède <code>e</code> bits avant la virgule, signe inclus, et <code>v</code> bits fractionnaires. Une addition pleine précision produit <code>Q(max(ea,eb)+1).max(va,vb)</code> après alignement ; une multiplication produit <code>Q(ea+eb).(va+vb)</code>.</p>
          <p>Une convolution reçoit <strong>32×32×16</strong>, utilise <strong>32 filtres 3×3</strong>, stride 1 et padding 1. L’implémentation est dense : elle exécute les 144 MAC de chaque sortie, y compris les multiplications par les zéros du padding. Activations et poids sont sur 8 bits ; biais et sorties accumulées sont sur 32 bits. L’accélérateur possède 16 MAC à 250 MHz, un MAC par unité et par cycle.</p>`,
        questions: [
          {
            id: "4.1",
            points: 3,
            prompt: `<p>Avec <code>A:Q2.6</code>, <code>B:Q4.3</code> et <code>C:Q1.5</code>, donnez les formats pleine précision de <code>S=A+B</code> et <code>P=S×C</code>. Expliquez l’alignement de B.</p>`,
            rubric: [
              { points: 1, label: "Alignement de B de 3 positions vers la gauche" },
              { points: 1, label: "Somme S en Q5.6" },
              { points: 1, label: "Produit P en Q6.11" }
            ],
            correction: {
              data: `<p>Les deux opérandes d’une addition doivent attribuer le même poids au bit de poids faible.</p>`,
              steps: `<ol><li>On retient 6 bits fractionnaires. Le code entier de B est élargi puis décalé de <code>6−3=3</code> positions vers la gauche ; trois zéros fractionnaires sont ajoutés sans changer la valeur réelle.</li><li>La retenue de l’addition exige <code>max(2,4)+1=5</code> bits avant la virgule : <code>S:Q5.6</code>.</li><li>Le produit additionne les largeurs : <code>P:Q(5+1).(6+5)=Q6.11</code>.</li></ol>`,
              result: `<p><strong>S est en Q5.6 et P en Q6.11 avant arrondi, troncature ou saturation.</strong></p>`,
              trap: `<p>Ajouter directement les codes de Q2.6 et Q4.3 mélangerait deux échelles binaires différentes.</p>`
            }
          },
          {
            id: "4.2",
            points: 3,
            prompt: `<p>Dans un format signé sur 8 bits avec 4 bits fractionnaires, quantifiez <code>x=1,3</code> par troncature vers zéro puis par arrondi au plus proche. Donnez les erreurs <code>xq−x</code> et la saturation de <code>x=9</code>.</p>`,
            rubric: [
              { points: 1, label: "Troncature 1,25 et erreur −0,05" },
              { points: 1, label: "Arrondi 1,3125 et erreur +0,0125" },
              { points: 1, label: "Saturation à 7,9375" }
            ],
            correction: {
              data: `<p>Le pas vaut <code>2⁻⁴=1/16</code> et la plage du complément à deux est <code>[−8 ; 7,9375]</code>.</p>`,
              steps: `<ol><li><code>1,3×16=20,8</code>.</li><li>Troncation vers zéro : code 20, valeur <code>20/16=1,25</code>, erreur <code>−0,05</code>.</li><li>Arrondi au plus proche : code 21, valeur <code>21/16=1,3125</code>, erreur <code>+0,0125</code>.</li><li>9 dépasse la borne haute : la saturation renvoie <code>7,9375</code>.</li></ol>`,
              result: `<p><strong>Troncature : 1,25 (−0,05) ; arrondi : 1,3125 (+0,0125) ; saturation de 9 : 7,9375.</strong></p>`,
              trap: `<p>Une saturation bloque à une borne ; elle ne provoque pas le wrap-around d’un dépassement binaire ordinaire.</p>`
            }
          },
          {
            id: "4.3",
            points: 4,
            prompt: `<p>Calculez la dimension de sortie, les nombres de poids et de biais, le nombre total de MAC, puis les tailles de l’entrée, des poids, des biais et de la sortie accumulée.</p>`,
            rubric: [
              { points: 0.5, label: "Sortie 32×32×32" },
              { points: 0.5, label: "4 608 poids et 32 biais" },
              { points: 1, label: "4 718 592 MAC selon l’hypothèse dense" },
              { points: 1, label: "Entrée 16 Kio et poids 4,5 Kio" },
              { points: 1, label: "Biais 128 octets et sortie 128 Kio" }
            ],
            correction: {
              data: `<p><code>Hout=floor((H+2P−K)/S)+1</code>. Chaque sortie réduit une fenêtre dense de <code>3×3×16=144</code> termes.</p>`,
              steps: `<ol><li><code>Hout=Wout=(32+2−3)/1+1=32</code> ; profondeur 32.</li><li>Poids : <code>3×3×16×32=4 608</code> ; biais : 32.</li><li>Sorties : <code>32×32×32=32 768</code> ; travail : <code>32768×144=4 718 592 MAC</code>.</li><li>Entrée : <code>32×32×16×1=16 384 B=16 Kio</code>.</li><li>Poids : <code>4608 B=4,5 Kio</code>. Biais : <code>32×4=128 B</code>. Sortie : <code>32768×4=131 072 B=128 Kio</code>.</li></ol>`,
              result: `<p><strong>Sortie 32×32×32 ; 4 608 poids, 32 biais, 4 718 592 MAC ; 16 Kio d’entrée, 4,5 Kio de poids, 128 B de biais et 128 Kio de sortie.</strong></p>`,
              trap: `<p>Le nombre de MAC serait différent si le matériel sautait les zéros de bord ; l’énoncé impose ici explicitement l’exécution dense.</p>`
            }
          },
          {
            id: "4.4",
            points: 4,
            prompt: `<p>Avec une utilisation idéale des 16 MAC, calculez cycles, temps et débit crête en GMAC/s puis en GOPS si un MAC vaut deux opérations. Recalculez le temps si les MAC ne sont actifs que 80 % des cycles.</p>`,
            rubric: [
              { points: 1, label: "294 912 cycles" },
              { points: 1, label: "Temps idéal 1,179648 ms" },
              { points: 1, label: "4 GMAC/s et 8 GOPS avec convention" },
              { points: 1, label: "Temps à 80 % égal à 1,47456 ms" }
            ],
            correction: {
              data: `<p>Le travail total est de 4 718 592 MAC et le débit crête de <code>16 MAC/cycle×250 MHz</code>.</p>`,
              steps: `<ol><li><code>C=4 718 592/16=294 912 cycles</code>.</li><li><code>T=294 912/(250×10⁶)=1,179648 ms</code>.</li><li>Débit : <code>16×250 M=4 GMAC/s</code>, soit <code>8 GOPS</code> en comptant multiplication et addition séparément.</li><li>À 80 %, le débit utile vaut <code>3,2 GMAC/s</code> et <code>T=1,179648/0,8=1,47456 ms</code>.</li></ol>`,
              result: `<p><strong>294 912 cycles ; 1,179648 ms ; 4 GMAC/s = 8 GOPS. À 80 % d’occupation : 1,47456 ms.</strong></p>`,
              trap: `<p>GMAC/s et GOPS ne sont comparables qu’après avoir annoncé si un MAC compte pour une ou deux opérations.</p>`
            }
          }
        ]
      },
      {
        id: "precise",
        number: 5,
        title: "Exceptions précises et reprise",
        theme: "Commit · ROB · EPC/Cause · Handler",
        points: 12,
        minutes: 14,
        statement: `<p>Un processeur superscalaire exécute hors ordre, mais retire en ordre grâce à un ROB. Les stores n’écrivent la mémoire qu’au commit. Le ROB contient, de la tête vers la queue : 40 <code>ADD R1,R2,R3</code> terminée ; 41 <code>LD R4,0(R5)</code> terminée avec page fault ; 42 <code>MUL R6,R7,R8</code> terminée ; 43 <code>ST 0(R9),R6</code> adresse/donnée prêtes ; 44 <code>ADD R10,R10,1</code> terminée.</p>`,
        questions: [
          {
            id: "5.1",
            points: 5,
            prompt: `<p>Décrivez les retraits et l’état architectural lorsque la faute est prise : instructions validées/annulées, mémoire, EPC/Cause et renommage.</p>`,
            rubric: [
              { points: 1, label: "Commit normal de l’entrée 40" },
              { points: 1, label: "Faute prise quand 41 atteint la tête ; 41 ne committe pas" },
              { points: 1, label: "Annulation des entrées 42 à 44" },
              { points: 1, label: "Aucune écriture mémoire du store 43" },
              { points: 1, label: "EPC/Cause et restauration du renommage correctement décrits" }
            ],
            correction: {
              data: `<p>Une faute détectée pendant l’exécution reste mémorisée dans le ROB jusqu’à ce que l’instruction fautive devienne la plus ancienne.</p>`,
              steps: `<ol><li>40 est saine et en tête : elle committe, donc son résultat devient architectural.</li><li>41 arrive en tête : la page fault est alors délivrée ; le load ne committe pas R4.</li><li>42, 43 et 44 sont plus jeunes : elles sont squashées même si elles avaient terminé.</li><li>43 n’a jamais committé ; la mémoire reste inchangée.</li><li>EPC reçoit le PC du load 41 et Cause identifie la page fault.</li><li>La map de renommage revient à l’état committé ; les registres physiques spéculatifs sont récupérés selon le mécanisme de rollback.</li></ol>`,
              result: `<p><strong>Seule 40 devient architecturale. 41 forme la frontière précise ; 41 et toutes les instructions plus jeunes n’ont aucun effet architectural.</strong></p>`,
              trap: `<p>« Terminée » ne signifie pas « committée ». Les effets microarchitecturaux éventuels ne doivent pas être confondus avec l’état architectural.</p>`
            }
          },
          {
            id: "5.2",
            points: 3,
            prompt: `<p>Donnez les conditions d’une exception précise et expliquez pourquoi le commit en ordre et le store buffer sont nécessaires alors que l’exécution peut rester hors ordre.</p>`,
            rubric: [
              { points: 1, label: "Toutes les instructions plus anciennes ont produit leurs effets" },
              { points: 1, label: "Instruction fautive et plus jeunes sans effet architectural" },
              { points: 1, label: "Rôle du commit en ordre et de la rétention des stores" }
            ],
            correction: {
              data: `<p>Le handler doit observer un état équivalent à une exécution séquentielle arrêtée juste avant l’instruction fautive.</p>`,
              steps: `<ul><li>Toutes les instructions antérieures à la faute sont terminées et validées.</li><li>L’instruction fautive n’a pas modifié l’état architectural et toutes les plus jeunes sont annulées.</li><li>Le ROB autorise le calcul hors ordre mais impose cette frontière au commit.</li><li>Le store buffer/queue retarde une écriture spéculative jusqu’à son commit ; une écriture mémoire prématurée serait difficile à annuler.</li></ul>`,
              result: `<p><strong>Précise signifie : état des instructions anciennes conservé, faute et instructions jeunes absentes. Le ROB et la rétention des stores rendent cette frontière reconstructible.</strong></p>`,
              trap: `<p>Il n’est pas nécessaire d’exécuter en ordre pour obtenir des exceptions précises ; il faut rendre les effets architecturaux en ordre.</p>`
            }
          },
          {
            id: "5.3",
            points: 4,
            prompt: `<p>Sur un MIPS32 sans branche dans le delay slot fautif (<code>BD=0</code>), une page fault redirige vers <code>0x80000180</code>. Décrivez le rôle d’EPC et Cause, les étapes du handler et la valeur d’EPC permettant de réessayer l’instruction après réparation.</p>`,
            rubric: [
              { points: 1, label: "EPC contient l’adresse de l’instruction fautive" },
              { points: 1, label: "Cause identifie et qualifie l’exception" },
              { points: 1, label: "Séquence sauvegarde, diagnostic, réparation, restauration" },
              { points: 1, label: "EPC inchangé pour réessayer puis eret" }
            ],
            correction: {
              data: `<p>La faute de page est récupérable : le système peut rendre la page accessible puis relancer le load qui a fauté.</p>`,
              steps: `<ol><li>Le matériel écrit dans EPC l’adresse du load fautif, renseigne Cause, mémorise l’adresse virtuelle responsable dans <code>BadVAddr</code> et saute au vecteur 0x80000180.</li><li>Le handler sauvegarde le contexte nécessaire, lit Cause, EPC et <code>BadVAddr</code> avec <code>mfc0</code>, puis identifie précisément la page concernée.</li><li>Il installe ou recharge la traduction, met à jour le TLB si nécessaire et restaure le contexte.</li><li>Pour réessayer le load, il conserve EPC sur l’adresse fautive ; <code>eret</code> reprend à cette adresse.</li></ol>`,
              result: `<p><strong>EPC pointe le load fautif et ne doit pas être augmenté pour une faute réparée que l’on veut réessayer ; Cause guide le diagnostic, puis eret relance l’instruction.</strong></p>`,
              trap: `<p>Ajouter systématiquement 4 à EPC sauterait le load et changerait le programme. Cette règle ne convient qu’à une instruction que le handler décide explicitement d’ignorer.</p>`
            }
          }
        ]
      },
      {
        id: "ooo",
        number: 6,
        title: "Renommage et exécution hors ordre",
        theme: "RAT/PRF · Tomasulo · LSQ · Récupération",
        points: 12,
        minutes: 14,
        statement: `<p>Le processeur renomme les registres dans l’ordre, place les instructions dans des stations de réservation et retire via un ROB. Avant renommage : <code>RMT[R1]=p11</code>, <code>RMT[R2]=p12</code>, <code>RMT[R3]=p13</code>, <code>RMT[R4]=p14</code>. La Free List fournit p30 puis p31.</p>
          <p>Pour le chronogramme, il existe un port ADD/SUB de latence 1 et un port MUL de latence 3 ; une instruction au plus peut partir sur chaque port au début d’un cycle. Une instruction de latence L diffuse à la fin du cycle <code>émission+L−1</code> et un consommateur réveillé part au cycle suivant. La valeur p3 a été diffusée à la fin du cycle −1 : elle est donc prête avant le cycle 0 et ne concurrence aucune diffusion étudiée.</p>`,
        questions: [
          {
            id: "6.1",
            points: 3,
            prompt: `<p>Renommez dans l’ordre <code>ADD R1,R2,R3</code>, puis <code>SUB R2,R1,R4</code>. Donnez sources, nouvelle et ancienne destination, RMT finale, dépendance conservée et dépendance supprimée.</p>`,
            rubric: [
              { points: 1, label: "ADD : p12/p13, destination p30, ancienne p11" },
              { points: 1, label: "SUB : p30/p14, destination p31, ancienne p12 et RMT finale" },
              { points: 1, label: "RAW conservée, WAR supprimée" }
            ],
            correction: {
              data: `<p>Les sources sont lues dans la RMT avant que l’association de la destination courante soit remplacée.</p>`,
              steps: `<ol><li>ADD lit p12 et p13, alloue p30 pour R1, mémorise p11, puis pose R1→p30.</li><li>SUB lit la nouvelle version R1→p30 et R4→p14, alloue p31 pour R2, mémorise p12, puis pose R2→p31.</li><li>RMT finale : R1→p30, R2→p31, R3→p13, R4→p14.</li><li>La RAW ADD→SUB sur R1 reste une attente de p30. La WAR entre la lecture de R2 par ADD et l’écriture de R2 par SUB disparaît, car elles utilisent p12 et p31.</li></ol>`,
              result: `<p><strong>ADD : src p12/p13, dst p30, old p11. SUB : src p30/p14, dst p31, old p12. RAW conservée ; WAR éliminée.</strong></p>`,
              trap: `<p>Les anciens registres physiques ne sont pas remis immédiatement dans la Free List : ils restent nécessaires jusqu’au point de libération sûr.</p>`
            }
          },
          {
            id: "6.2",
            points: 3,
            prompt: `<p>La station contient A=<code>MUL p40,p2,p3</code>, B=<code>ADD p41,p4,p5</code>, C=<code>SUB p42,p40,p6</code> ; toutes les sources sont prêtes sauf p40. Donnez émissions et diffusions des cycles 0 à 3.</p>`,
            rubric: [
              { points: 1, label: "A et B émis ensemble au cycle 0" },
              { points: 1, label: "p41 diffusé fin 0 et p40 fin 2" },
              { points: 1, label: "C émis/diffusé au cycle 3" }
            ],
            correction: {
              data: `<p>A et B utilisent deux ports différents et p3 est déjà disponible au début du cycle 0.</p>`,
              steps: `<table><thead><tr><th>Cycle</th><th>Émission</th><th>Diffusion en fin de cycle</th></tr></thead><tbody><tr><td>0</td><td>A sur MUL et B sur ADD</td><td>p41 par B</td></tr><tr><td>1</td><td>—</td><td>—</td></tr><tr><td>2</td><td>—</td><td>p40 par A</td></tr><tr><td>3</td><td>C sur SUB</td><td>p42 par C</td></tr></tbody></table><p>C ne peut partir qu’au cycle suivant la diffusion de p40.</p>`,
              result: `<p><strong>A et B partent au cycle 0 ; B diffuse fin 0, A fin 2 ; C est réveillée fin 2 et part au cycle 3.</strong></p>`,
              trap: `<p>La disponibilité de deux ports autorise deux émissions le même cycle. La donnée p3 ne consomme aucun bus de résultat dans la fenêtre étudiée.</p>`
            }
          },
          {
            id: "6.3",
            points: 3,
            prompt: `<p>Un store plus ancien S a une adresse encore inconnue. Un load plus jeune L vers l’adresse A est exécuté spéculativement et lit le cache. S résout ensuite son adresse à A. Que doit détecter la LSQ et comment corriger ? Que ferait-elle si l’adresse et la donnée de S avaient été connues avant L ?</p>`,
            rubric: [
              { points: 1, label: "Détection d’une violation mémoire même adresse" },
              { points: 1, label: "Squash/replay du load et de ses dépendants" },
              { points: 1, label: "Store-to-load forwarding si adresse/donnée connues" }
            ],
            correction: {
              data: `<p>L’ordre programme impose que L observe S lorsque les deux ciblent la même adresse et que S est antérieur.</p>`,
              steps: `<ol><li>La Load Queue conserve l’adresse et l’état spéculatif de L.</li><li>Quand S résout A, la comparaison avec les loads plus jeunes révèle que L a lu trop tôt une ancienne valeur.</li><li>Le processeur annule/rejoue L et les instructions dépendantes, puis les réexécute avec la valeur de S.</li><li>Si adresse et donnée de S étaient prêtes avant l’émission de L, la Store Queue aurait transmis directement la donnée à L sans attendre le cache.</li></ol>`,
              result: `<p><strong>Adresse égale après exécution spéculative : violation et replay. Adresse/donnée connues avant L : forwarding du store vers le load.</strong></p>`,
              trap: `<p>Le renommage des registres ne résout pas les dépendances mémoire, car les adresses ne sont souvent connues qu’après calcul.</p>`
            }
          },
          {
            id: "6.4",
            points: 3,
            prompt: `<p>Une branche est finalement déclarée mal prédite. Décrivez précisément ce qui est conservé, ce qui est annulé et comment sont restaurés PC, table de renommage et Free List.</p>`,
            rubric: [
              { points: 1, label: "Conservation de la branche et des instructions plus anciennes" },
              { points: 1, label: "Annulation de toutes les instructions plus jeunes" },
              { points: 1, label: "Restauration PC, map et Free List par checkpoint/historique" }
            ],
            correction: {
              data: `<p>La mauvaise prédiction n’annule pas le passé correct : elle coupe seulement le chemin spéculatif placé après la branche.</p>`,
              steps: `<ul><li>Les instructions plus anciennes et la branche elle-même restent valides ; elles pourront committer en ordre.</li><li>Toutes les instructions plus jeunes du mauvais chemin sont retirées du ROB, des stations et de la LSQ ; leurs résultats ne deviennent pas architecturaux.</li><li>Le fetch redémarre à la bonne cible ou à l’instruction séquentielle correcte.</li><li>La map de renommage et l’état de la Free List sont restaurés depuis un checkpoint de branche ou reconstruits grâce à un historique, en récupérant les physiques alloués au mauvais chemin.</li></ul>`,
              result: `<p><strong>On garde le préfixe correct jusqu’à la branche, on supprime tout son suffixe spéculatif et on restaure PC et renommage au checkpoint associé.</strong></p>`,
              trap: `<p>Restaurer seulement le PC ne suffit pas : sans restauration des mappings et de la Free List, les futurs registres utiliseraient un état spéculatif incohérent.</p>`
            }
          }
        ]
      },
      {
        id: "multicore",
        number: 7,
        title: "Multicœur, cohérence et passage à l’échelle",
        theme: "MSI · DMA · Amdahl · NUMA/Répertoire",
        points: 12,
        minutes: 14,
        statement: `<p>Deux cœurs P0 et P1 ont des caches privés write-back, write-allocate, cohérents par snooping MSI. Les mots x et y partagent une ligne. Initialement, mémoire=[x=10,y=20] et les deux copies sont I. RM=BusRd, WM=BusRdX, IV=BusUpgr et WB=flush. Exécutez : (a) P0 lit x ; (b) P1 lit y ; (c) P0 écrit x=11 ; (d) P1 lit x ; (e) P1 écrit y=25.</p>`,
        questions: [
          {
            id: "7.1",
            points: 4,
            prompt: `<p>Après chaque opération, donnez transaction, états et données des deux caches, mémoire, valeur lue, puis les totaux de transactions.</p>`,
            rubric: [
              { points: 1, label: "Transactions a–e correctes" },
              { points: 1, label: "Transitions MSI correctes" },
              { points: 1, label: "Données caches/mémoire et lectures correctes" },
              { points: 1, label: "Totaux 3 RM, 2 IV, 1 WB et état final" }
            ],
            correction: {
              data: `<p>Plusieurs copies S peuvent coexister ; une copie M est unique et peut être plus récente que la mémoire.</p>`,
              steps: `<table><thead><tr><th>Étape</th><th>Bus</th><th>P0</th><th>P1</th><th>Mémoire / lecture</th></tr></thead><tbody><tr><td>a · P0 R(x)</td><td>P0:RM</td><td>S [10,20]</td><td>I</td><td>[10,20] ; lit 10</td></tr><tr><td>b · P1 R(y)</td><td>P1:RM</td><td>S [10,20]</td><td>S [10,20]</td><td>[10,20] ; lit 20</td></tr><tr><td>c · P0 W(x=11)</td><td>P0:IV</td><td>M [11,20]</td><td>I</td><td>[10,20]</td></tr><tr><td>d · P1 R(x)</td><td>P1:RM, P0:WB</td><td>S [11,20]</td><td>S [11,20]</td><td>[11,20] ; lit 11</td></tr><tr><td>e · P1 W(y=25)</td><td>P1:IV</td><td>I</td><td>M [11,25]</td><td>[11,20]</td></tr></tbody></table>`,
              result: `<p><strong>3 RM, 2 IV et 1 WB. État final : P0=I, P1=M[11,25], mémoire=[11,20].</strong></p>`,
              trap: `<p>Les écritures c et e sont des hits en S : elles demandent BusUpgr, pas BusRdX. Le WB restitue toute la ligne.</p>`
            }
          },
          {
            id: "7.2",
            points: 2,
            prompt: `<p>À l’état final, un DMA non cohérent lit directement la mémoire. Que reçoit-il ? Donnez une correction logicielle et une correction matérielle.</p>`,
            rubric: [
              { points: 0.5, label: "DMA lit [11,20] et y est périmé" },
              { points: 1, label: "Clean/flush et barrière avant lancement" },
              { points: 0.5, label: "DMA connecté à un domaine matériel cohérent" }
            ],
            correction: {
              data: `<p>P1 détient la seule version récente en M ; la mémoire n’a pas encore reçu y=25.</p>`,
              steps: `<ul><li>Le DMA hors cohérence lit la mémoire et obtient x=11, y=20.</li><li>Solution logicielle : nettoyer la ligne dirty jusqu’au point de cohérence, exécuter la barrière requise, puis notifier/lancer le DMA.</li><li>Solution matérielle : raccorder le DMA à un port cohérent capable de snooper ou de demander la ligne au propriétaire.</li></ul>`,
              result: `<p><strong>Le DMA voit [11,20]. Il faut publier la ligne par maintenance de cache ordonnée ou utiliser un DMA matériellement cohérent.</strong></p>`,
              trap: `<p>La cohérence entre caches CPU n’inclut pas automatiquement un maître DMA placé hors du domaine de snooping.</p>`
            }
          },
          {
            id: "7.3",
            points: 3,
            prompt: `<p>Un programme prend 100 ms sur un cœur et 95 % est parfaitement parallélisable. Calculez speedup et temps idéaux sur 8 cœurs. Ajoutez ensuite 2 ms au temps total sur 8 cœurs : donnez speedup réel et efficacité.</p>`,
            rubric: [
              { points: 1, label: "Temps idéal 16,875 ms et speedup 5,93" },
              { points: 1, label: "Temps réel 18,875 ms et speedup 5,30" },
              { points: 1, label: "Efficacité réelle 66,2 %" }
            ],
            correction: {
              data: `<p><code>S(N)=1/((1−p)+p/N)</code> et <code>E=S/N</code>, avec p=0,95 et N=8.</p>`,
              steps: `<ol><li><code>Tidéal=100×(0,05+0,95/8)=16,875 ms</code>, donc <code>Sidéal=100/16,875≈5,9259</code>.</li><li><code>Tréel=16,875+2=18,875 ms</code>.</li><li><code>Sréel=100/18,875≈5,2980</code>.</li><li><code>E=5,2980/8≈0,6623=66,2 %</code>.</li></ol>`,
              result: `<p><strong>Idéal : 16,875 ms et 5,93×. Avec surcoût : 18,875 ms, 5,30× et 66,2 % d’efficacité.</strong></p>`,
              trap: `<p>Les 2 ms s’ajoutent au temps total parallèle, pas au speedup ni au temps séquentiel de 100 ms.</p>`
            }
          },
          {
            id: "7.4",
            points: 3,
            prompt: `<p>Comparez UMA et NUMA. Pour un système à 64 cœurs, expliquez pourquoi un protocole à répertoire remplace souvent le snooping par broadcast et donnez une règle de placement des pages.</p>`,
            rubric: [
              { points: 1, label: "UMA : latence uniforme ; NUMA : latence dépendante du nœud" },
              { points: 1, label: "Répertoire cible les détenteurs et évite le broadcast global" },
              { points: 1, label: "Placement first-touch/proche du cœur consommateur" }
            ],
            correction: {
              data: `<p>La cohérence définit quelles copies sont valides ; la topologie mémoire définit le coût d’accès à leur emplacement.</p>`,
              steps: `<ul><li>En UMA, tous les processeurs voient approximativement la même latence vers la mémoire partagée. En NUMA, une mémoire locale est plus proche qu’une mémoire attachée à un autre nœud.</li><li>Le snooping diffuse chaque requête à tous les caches : trafic et énergie croissent mal avec 64 cœurs.</li><li>Un répertoire mémorise les sharers ou le propriétaire et envoie les messages seulement aux nœuds concernés, au prix de stockage et d’indirections.</li><li>La politique first-touch place idéalement une page dans le nœud du thread qui l’initialise ; il faut donc initialiser les données là où elles seront majoritairement consommées.</li></ul>`,
              result: `<p><strong>NUMA exige de placer calcul et pages ensemble. À grande échelle, le répertoire évite le broadcast en ciblant les seuls détenteurs d’une ligne.</strong></p>`,
              trap: `<p>Un système NUMA peut rester cohérent : non-uniformité de latence et cohérence sont deux propriétés différentes.</p>`
            }
          }
        ]
      },
      {
        id: "sync",
        number: 8,
        title: "Instructions atomiques et synchronisation",
        theme: "LR/SC · CAS · Ticket lock · Barrière · Deadlock",
        points: 12,
        minutes: 14,
        statement: `<p>Une machine <strong>RV64 avec extension A (RV64A)</strong> partage des mots 32 bits alignés. <code>lr.w</code> crée une réservation ; <code>sc.w</code> écrit si elle reste valide et renvoie 0 en cas de succès. Pour <code>atomic_fetch_add</code>, <code>a0=&amp;compteur</code>, <code>a1=delta</code> et l’ancienne valeur est retournée dans <code>a0</code>.</p>`,
        questions: [
          {
            id: "8.1",
            points: 3,
            prompt: `<p>Écrivez <code>atomic_fetch_add</code> avec LR/SC. Justifiez la boucle et indiquez où placer acquire/release pour une opération acq_rel.</p>`,
            rubric: [
              { points: 1.5, label: "Boucle RV64A LR, addw, SC et test du statut correcte" },
              { points: 0.5, label: "Retour de l’ancienne valeur" },
              { points: 0.5, label: "Relecture/recalcul après tout échec" },
              { points: 0.5, label: "lr.w.aq et sc.w.rl correctement placés" }
            ],
            correction: {
              data: `<p>Le registre destination de SC reçoit un statut, distinct de la valeur à écrire. Un échec signifie qu’il faut relire la valeur partagée.</p>`,
              steps: `<pre><code>atomic_fetch_add:
retry:
    lr.w.aq  t0, (a0)       # ancienne valeur
    addw     t1, t0, a1     # nouvelle valeur 32 bits
    sc.w.rl  t2, t1, (a0)   # t2=0 si succès
    bnez     t2, retry       # sinon relire et recalculer
    mv       a0, t0
    ret</code></pre><p>Le SC réussi est le point de linéarisation. Les suffixes aq/rl donnent ici les ordres acquire et release demandés.</p>`,
              result: `<p><strong>La boucle englobe LR, calcul et SC ; après un SC réussi, t0 est l’ancienne valeur atomique retournée.</strong></p>`,
              trap: `<p>Reboucler uniquement sur SC réutiliserait une réservation invalide et une somme calculée à partir d’une ancienne valeur.</p>`
            }
          },
          {
            id: "8.2",
            points: 2,
            prompt: `<p>Définissez <code>CAS(addr, attendu, nouveau)</code> et écrivez le principe d’un incrément atomique fondé sur CAS. Pourquoi la comparaison doit-elle être recommencée après un échec ?</p>`,
            rubric: [
              { points: 1, label: "Sémantique compare-and-swap correcte" },
              { points: 0.5, label: "Boucle load, calcul, CAS correcte" },
              { points: 0.5, label: "Relecture après concurrence expliquée" }
            ],
            correction: {
              data: `<p>CAS remplace atomiquement <code>*addr</code> par nouveau seulement si la valeur courante égale attendu ; il indique succès ou échec.</p>`,
              steps: `<pre><code>do {
    ancien = atomic_load(addr);
    nouveau = ancien + delta;
} while (!CAS(addr, ancien, nouveau));
return ancien;</code></pre><p>Un autre cœur peut modifier la valeur entre le load et CAS. Après échec, l’ancien attendu n’est plus une base valide pour le nouveau calcul.</p>`,
              result: `<p><strong>CAS transforme la condition « la valeur n’a pas changé » et l’écriture en une seule action atomique ; tout échec impose une nouvelle lecture et un nouveau calcul.</strong></p>`,
              trap: `<p>CAS évite la mise à jour perdue, mais les algorithmes manipulant des pointeurs doivent aussi considérer le problème ABA.</p>`
            }
          },
          {
            id: "8.3",
            points: 3,
            prompt: `<p>Un ticket lock contient <code>next=0</code> et <code>owner=0</code>. P0 puis P1 exécutent atomiquement <code>ticket=fetch_add(next,1)</code>. Donnez leurs tickets, l’ordre d’entrée et de sortie, puis expliquez équité et acquire/release.</p>`,
            rubric: [
              { points: 1, label: "Tickets P0=0 et P1=1" },
              { points: 1, label: "Ordre complet : P0 entre/sort, puis P1 entre/sort" },
              { points: 1, label: "FIFO, acquire sur observation et release sur owner" }
            ],
            correction: {
              data: `<p>Un thread entre lorsque <code>owner==ticket</code>. La libération incrémente owner.</p>`,
              steps: `<ol><li>P0 reçoit 0 et next devient 1 ; P1 reçoit 1 et next devient 2.</li><li><code>owner=0</code> : P0 entre immédiatement, tandis que P1 attend.</li><li>P0 sort en faisant passer <code>owner</code> de 0 à 1 avec un store release ; P1 observe 1 par une lecture acquire et entre.</li><li>P1 sort ensuite en faisant passer <code>owner</code> de 1 à 2. Les tickets croissants donnent un ordre FIFO, donc évitent la famine entre demandeurs qui continuent à s’exécuter.</li></ol>`,
              result: `<p><strong>P0 obtient 0, entre puis sort avec owner 0→1. P1 obtient 1, entre ensuite puis sort avec owner 1→2. Le ticket lock est FIFO, avec acquire à l’entrée et release à la sortie.</strong></p>`,
              trap: `<p>Le ticket lock est équitable mais tous les attenteurs relisent owner, ce qui peut créer beaucoup de trafic de cohérence.</p>`
            }
          },
          {
            id: "8.4",
            points: 2,
            prompt: `<p>Construisez une barrière one-shot pour N=4 avec un compteur atomique et un drapeau. Quel thread libère la barrière, et pourquoi un compteur incrémenté par load/add/store serait-il incorrect ?</p>`,
            rubric: [
              { points: 1, label: "fetch_add ; ancien=3 identifie le dernier et publie le drapeau" },
              { points: 0.5, label: "Attente acquire des trois autres threads" },
              { points: 0.5, label: "Mise à jour perdue avec load/add/store expliquée" }
            ],
            correction: {
              data: `<p>Le fetch_add retourne l’ancienne valeur. Pour quatre participants, le dernier observe donc 3.</p>`,
              steps: `<pre><code>ancien = fetch_add_acq_rel(&compteur, 1);
if (ancien == 3)
    store_release(&ouvert, 1);
else
    while (load_acquire(&ouvert) == 0) { }</code></pre><p>Deux load/add/store ordinaires peuvent lire le même compteur et perdre une arrivée. Pour réutiliser la barrière, il faut en plus une génération ou un sens local afin d’éviter de confondre deux tours.</p>`,
              result: `<p><strong>Le thread dont fetch_add retourne 3 est le quatrième : il ouvre la barrière en release ; les autres observent le drapeau en acquire.</strong></p>`,
              trap: `<p>Remettre simplement compteur et drapeau à zéro rend une barrière réutilisable incorrecte : un thread lent peut encore appartenir à la génération précédente.</p>`
            }
          },
          {
            id: "8.5",
            points: 2,
            prompt: `<p>P0 prend <code>Lbuf</code> puis <code>Lstats</code> ; P1 prend ces verrous dans l’ordre inverse. Donnez un entrelacement de deadlock et une règle qui garantit son absence.</p>`,
            rubric: [
              { points: 1, label: "Entrelacement formant l’attente circulaire" },
              { points: 1, label: "Ordre total commun respecté sur tous les chemins" }
            ],
            correction: {
              data: `<p>Chaque thread garde son premier verrou pendant qu’il attend le second.</p>`,
              steps: `<ol><li>P0 acquiert Lbuf.</li><li>P1 acquiert Lstats.</li><li>P0 attend Lstats ; P1 attend Lbuf : chacun attend une ressource détenue par l’autre.</li><li>Imposer partout l’ordre global Lbuf puis Lstats supprime l’une des conditions du cycle. Les chemins d’erreur doivent libérer dans l’ordre inverse.</li></ol>`,
              result: `<p><strong>L’ordre opposé crée une attente circulaire. Un ordre total unique d’acquisition, appliqué par tous les threads, garantit ici l’absence de deadlock.</strong></p>`,
              trap: `<p>L’atomicité et la cohérence garantissent le fonctionnement de chaque verrou, pas l’absence de cycle entre plusieurs verrous.</p>`
            }
          }
        ]
      }
    ]
  };

  window.SOC_MOCK_EXAM = mockExam;
  window.SOC_MOCK_QUESTION_COUNT = mockExam.exercises.reduce((sum, exercise) => sum + exercise.questions.length, 0);

  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const plural = (value, singular, pluralForm = `${singular}s`) => `${value} ${value > 1 ? pluralForm : singular}`;
  const formatNumber = (value) => String(value).replace(".", ",");

  function renderRubric(question) {
    const rows = question.rubric.map((item) => `<tr><td>${escapeHtml(item.label)}</td><td><strong>${formatNumber(item.points)}</strong></td></tr>`).join("");
    return `<div class="mock-rubric">
      <h5>Barème détaillé</h5>
      <table><caption class="sr-only">Barème détaillé de la question ${escapeHtml(question.id)}</caption><thead><tr><th>Élément attendu</th><th>Points</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th>Total</th><th>${formatNumber(question.points)}</th></tr></tfoot></table>
    </div>`;
  }

  function renderCorrection(question) {
    return `<details class="exam-correction mock-correction">
      <summary><span>Afficher le corrigé détaillé</span><small>${escapeHtml(question.id)} · ${plural(question.points, "point")}</small></summary>
      <div class="exam-answer-roadmap" aria-label="Étapes du corrigé">
        <span><b>1</b> Données</span><span><b>2</b> Étapes</span><span><b>3</b> Résultat + barème</span><span><b>4</b> Piège</span>
      </div>
      <div class="mock-correction-body">
        <section class="mock-correction-step"><h4>1 · Données et conventions</h4>${question.correction.data}</section>
        <section class="mock-correction-step"><h4>2 · Raisonnement pas à pas</h4>${question.correction.steps}</section>
        <section class="mock-correction-step answer-conclusion"><h4>3 · Résultat à écrire</h4>${question.correction.result}${renderRubric(question)}</section>
        <aside class="trap mock-correction-step"><strong>⚠ 4 · Piège à éviter</strong>${question.correction.trap}</aside>
      </div>
    </details>`;
  }

  function renderQuestion(question) {
    return `<article class="exam-question mock-question searchable" id="mock-q-${escapeHtml(question.id.replace(".", "-"))}" data-title="Examen blanc · Question ${escapeHtml(question.id)}" data-panel-id="quiz">
      <header class="exam-question-head">
        <span class="exam-q-number">${escapeHtml(question.id)}</span>
        <div><p class="exam-q-theme">${plural(question.points, "point")}</p><h3>Question ${escapeHtml(question.id)}</h3></div>
      </header>
      <div class="exam-prompt"><span class="exam-prompt-label">Question complète</span>${question.prompt}</div>
      <label class="mock-score-field">Auto-évaluation
        <input type="number" min="0" max="${question.points}" step="0.5" value="0" inputmode="decimal" data-mock-score="${escapeHtml(question.id)}" aria-label="Points obtenus à la question ${escapeHtml(question.id)} sur ${question.points}">
        <span>/ ${question.points}</span>
      </label>
      ${renderCorrection(question)}
    </article>`;
  }

  function renderExercise(exercise) {
    return `<section class="exam-section mock-exercise" id="mock-exercise-${escapeHtml(exercise.id)}">
      <header class="exam-section-title">
        <span>${escapeHtml(exercise.theme)}</span>
        <h2>Exercice ${exercise.number} · ${escapeHtml(exercise.title)}</h2>
        <small>${exercise.points} points · ${exercise.minutes} min conseillées</small>
      </header>
      <div class="mock-common-statement">
        <p class="eyebrow">Énoncé commun — à lire avant les questions</p>
        ${exercise.statement}
      </div>
      <div class="exam-question-list">${exercise.questions.map(renderQuestion).join("")}</div>
    </section>`;
  }

  function initMockExam() {
    const root = document.querySelector("#mock-exam-root");
    if (!root || root.dataset.mockReady === "true") return;

    const exercisesPoints = mockExam.exercises.reduce((sum, exercise) => sum + exercise.points, 0);
    const questions = mockExam.exercises.flatMap((exercise) => exercise.questions);
    const questionsPoints = questions.reduce((sum, question) => sum + question.points, 0);
    const minutes = mockExam.exercises.reduce((sum, exercise) => sum + exercise.minutes, 0);
    const invalidExercise = mockExam.exercises.find((exercise) =>
      exercise.questions.reduce((sum, question) => sum + question.points, 0) !== exercise.points
    );
    const invalidRubric = questions.find((question) =>
      !Array.isArray(question.rubric)
      || Math.abs(question.rubric.reduce((sum, item) => sum + Number(item.points), 0) - question.points) > 1e-9
      || question.rubric.some((item) => !item.label || !Number.isFinite(Number(item.points)) || Number(item.points) <= 0)
    );
    const questionIds = questions.map((question) => question.id);
    const duplicateQuestionId = questionIds.find((id, index) => questionIds.indexOf(id) !== index);

    if (exercisesPoints !== mockExam.totalPoints || questionsPoints !== mockExam.totalPoints || minutes !== mockExam.durationMinutes || invalidExercise || invalidRubric || duplicateQuestionId) {
      root.innerHTML = `<div class="warning"><strong>Examen blanc invalide</strong>Le barème, un sous-barème, un identifiant ou la durée ne correspond pas aux totaux annoncés.</div>`;
      return;
    }

    root.dataset.mockReady = "true";
    root.dataset.mockState = "ready";
    root.innerHTML = `<article class="exam-paper mock-exam-paper">
      <header class="exam-paper-head mock-exam-head">
        <div>
          <p class="eyebrow">Simulation écrite · huit chapitres · conditions réelles</p>
          <h2>${escapeHtml(mockExam.title)}</h2>
          <p>${mockExam.exercises.length} exercices · ${questions.length} sous-questions · ${mockExam.totalPoints} points · ${mockExam.durationMinutes} minutes.</p>
        </div>
        <div class="exam-paper-actions"><span>2 h · 100 points</span></div>
      </header>
      <section class="mock-instructions">
        <h3>Consignes</h3>
        <ol>${mockExam.instructions.map((instruction) => `<li>${escapeHtml(instruction)}</li>`).join("")}</ol>
      </section>
      <section class="mock-dashboard" aria-label="Commandes de l’examen blanc">
        <div class="big-result"><span>Temps restant</span><strong id="mock-timer" role="timer" aria-label="Temps restant" aria-live="off">02:00:00</strong><span class="sr-only" id="mock-timer-status" aria-live="polite"></span></div>
        <div class="big-result"><span>Auto-évaluation</span><strong id="mock-score-total" aria-live="polite">0 / 100</strong></div>
        <div class="hero-actions">
          <button class="btn" type="button" data-mock-action="start">Démarrer</button>
          <button class="btn secondary" type="button" data-mock-action="pause">Pause</button>
          <button class="btn ghost" id="mock-reset-answers" type="button" data-mock-action="reset-answers">Recommencer l’épreuve</button>
          <button class="btn ghost" id="mock-toggle-corrections" type="button" data-mock-action="toggle" aria-expanded="false">Afficher tous les corrigés</button>
          <button class="btn ghost" type="button" data-mock-action="print">Imprimer le sujet</button>
        </div>
      </section>
      ${mockExam.exercises.map(renderExercise).join("")}
    </article>`;

    let remainingSeconds = mockExam.durationMinutes * 60;
    let deadlineMs = null;
    let timerId = null;
    const timer = root.querySelector("#mock-timer");
    const startButton = root.querySelector('[data-mock-action="start"]');
    const pauseButton = root.querySelector('[data-mock-action="pause"]');
    const toggleButton = root.querySelector("#mock-toggle-corrections");
    const timerStatus = root.querySelector("#mock-timer-status");
    const correctionDetails = [...root.querySelectorAll(".mock-correction")];

    const announceTimer = (message) => {
      if (!timerStatus) return;
      timerStatus.textContent = "";
      window.requestAnimationFrame(() => { timerStatus.textContent = message; });
    };

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutesPart = Math.floor((seconds % 3600) / 60);
      const secondsPart = seconds % 60;
      return [hours, minutesPart, secondsPart].map((part) => String(part).padStart(2, "0")).join(":");
    };

    const renderTime = () => {
      timer.textContent = formatTime(remainingSeconds);
      timer.dataset.expired = remainingSeconds === 0 ? "true" : "false";
    };

    const syncRemainingFromClock = () => {
      if (deadlineMs !== null) remainingSeconds = Math.max(0, Math.ceil((deadlineMs - Date.now()) / 1000));
    };

    const setStoppedButtons = () => {
      startButton.disabled = remainingSeconds === 0;
      pauseButton.disabled = true;
    };

    const pauseTimer = () => {
      syncRemainingFromClock();
      if (timerId !== null) window.clearInterval(timerId);
      timerId = null;
      deadlineMs = null;
      renderTime();
      setStoppedButtons();
      root.dataset.mockState = remainingSeconds === 0 ? "expired" : "paused";
      announceTimer(remainingSeconds === 0 ? "Temps écoulé." : `Chronomètre en pause. Temps restant : ${formatTime(remainingSeconds)}.`);
    };

    const tickTimer = () => {
      syncRemainingFromClock();
      renderTime();
      if (remainingSeconds === 0) {
        if (timerId !== null) window.clearInterval(timerId);
        timerId = null;
        deadlineMs = null;
        setStoppedButtons();
        root.dataset.mockState = "expired";
        announceTimer("Temps écoulé.");
      }
    };

    const startTimer = () => {
      if (timerId !== null || remainingSeconds === 0) return;
      deadlineMs = Date.now() + remainingSeconds * 1000;
      startButton.disabled = true;
      pauseButton.disabled = false;
      root.dataset.mockState = "running";
      timerId = window.setInterval(tickTimer, 250);
      announceTimer("Chronomètre démarré.");
    };

    const resetTimer = () => {
      if (timerId !== null) window.clearInterval(timerId);
      timerId = null;
      deadlineMs = null;
      remainingSeconds = mockExam.durationMinutes * 60;
      renderTime();
      setStoppedButtons();
      root.dataset.mockState = "ready";
      announceTimer("Chronomètre réinitialisé à deux heures.");
    };

    const normalizedScore = (input) => {
      const maximum = Number(input.max);
      const value = Number.parseFloat(String(input.value).replace(",", "."));
      if (!Number.isFinite(value)) return 0;
      const bounded = Math.min(maximum, Math.max(0, value));
      return Math.round(bounded * 2) / 2;
    };

    const updateScore = () => {
      const score = [...root.querySelectorAll("[data-mock-score]")].reduce((sum, input) => sum + normalizedScore(input), 0);
      root.querySelector("#mock-score-total").textContent = `${Number.isInteger(score) ? score : score.toFixed(1)} / ${mockExam.totalPoints}`;
    };

    const normalizeScoreField = (input) => {
      const value = normalizedScore(input);
      input.value = Number.isInteger(value) ? String(value) : value.toFixed(1);
    };

    const syncToggleLabel = () => {
      if (!toggleButton) return;
      const allOpen = correctionDetails.length > 0 && correctionDetails.every((details) => details.open);
      toggleButton.textContent = allOpen ? "Masquer tous les corrigés" : "Afficher tous les corrigés";
      toggleButton.setAttribute("aria-expanded", String(allOpen));
    };

    root.addEventListener("input", (event) => {
      if (event.target.matches("[data-mock-score]")) updateScore();
    });

    root.addEventListener("change", (event) => {
      if (!event.target.matches("[data-mock-score]")) return;
      normalizeScoreField(event.target);
      updateScore();
    });

    correctionDetails.forEach((details) => details.addEventListener("toggle", syncToggleLabel));

    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-mock-action]");
      if (!button) return;
      const action = button.dataset.mockAction;
      if (action === "start") startTimer();
      if (action === "pause") pauseTimer();
      if (action === "reset-answers") {
        resetTimer();
        root.querySelectorAll("[data-mock-score]").forEach((input) => { input.value = "0"; });
        correctionDetails.forEach((details) => { details.open = false; });
        updateScore();
        syncToggleLabel();
      }
      if (action === "print") {
        document.body.classList.add("print-mock-subject");
        const restorePrintMode = () => document.body.classList.remove("print-mock-subject");
        window.addEventListener("afterprint", restorePrintMode, { once: true });
        window.print();
        window.setTimeout(restorePrintMode, 1500);
      }
      if (action === "toggle") {
        const shouldOpen = correctionDetails.some((item) => !item.open);
        correctionDetails.forEach((item) => { item.open = shouldOpen; });
        syncToggleLabel();
      }
    });

    pauseButton.disabled = true;
    renderTime();
    updateScore();
    syncToggleLabel();
  }

  if (document.querySelector("#mock-exam-root")) {
    initMockExam();
  } else {
    document.addEventListener("DOMContentLoaded", initMockExam, { once: true });
  }
})();
