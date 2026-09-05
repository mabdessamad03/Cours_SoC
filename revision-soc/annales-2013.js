"use strict";

window.SOC_EXAMS_2013 = [
  {
    year: "2014",
    label: "2013–2014",
    title: "DMA, image intégrale, ordonnancement MIPS et Spidergon",
    pdf: "../Ex-Annales/SLE_SOC_examen_2013-2014.pdf",
    intro: `<p>Ce corrigé suit le modèle de coût implicite du sujet et rédige chaque réponse comme sur une bonne copie : hypothèses annoncées, formule littérale, application numérique et contrôle du résultat. Les rares ambiguïtés de l’énoncé sont signalées sans masquer la réponse vraisemblablement attendue.</p>`,
    sections: [
      {
        title: "Hiérarchie mémoire, DMA et image intégrale",
        theme: "DMA & SPRAM",
        context: `<h3>1 · Hiérarchie mémoire et détection de visage (12 pts)</h3>
          <p>On souhaite réaliser un algorithme de détection de visage à l’aide d’un processeur 32 bits qui dispose d’un cache et d’une Scratch-Pad RAM (SPRAM) ainsi qu’illustré sur la figure 1. Le processeur accède au cache et à la SPRAM en un seul cycle d’horloge. Le processeur est connecté à la mémoire externe à travers un bus système 32 bits. Un DMA est présent dans le système afin de réaliser différents transferts entre les mémoires. Le DMA est configuré par l’adresse de départ, l’adresse d’arrivée et la quantité de données transférées. Il émet une interruption lorsque le transfert est terminé. Il contient une mémoire de la taille du burst maximum.</p>
          <p><strong>Figure 1 – Architecture mémoire :</strong> CPU, Cache, SPRAM, DMA, bus système, contrôleur DDR, DDR SDRAM et interruption IT.</p>
          <h4>1.1 · Fonctionnement du DMA (2 points)</h4>
          <p>On appelle <em>l</em><sub>m</sub> la latence d’accès à la mémoire externe et <em>l</em><sub>SPRAM</sub> la latence d’accès à la SPRAM depuis le DMA. <em>b</em><sub>max</sub> est la taille maximum d’un burst sur le bus système (exprimé en octets). Un burst est constitué d’une séquence de mots de 32 bits.</p>
          <p><em>t</em><sub>IT</sub> est le temps minimum de réponse du processeur à une interruption. Cela correspond au nombre de cycles minimum entre le moment où une interruption apparaît et l’exécution de la première instruction de la routine de traitement d’interruption. Ce temps inclus la sauvegarde de contexte, etc…</p>
          <h4>1.2 · Application (10 points)</h4>
          <p>On souhaite réaliser un algorithme de détection de visage dans une image stockée en mémoire externe. Un pixel de l’image est codé sur 8 bits. L’image d’entrée <em>I</em> est de taille <em>t</em><sub>x</sub> × <em>t</em><sub>y</sub>.</p>
          <p>Les pixels sont stockés en mémoire dans l’ordre canonique. C’est-à-dire que l’adresse d’un pixel se calcule par : <code>adresse(I(x, y)) = x + y * t<sub>x</sub></code>. Avec <em>x</em> variant de 0 à <em>t</em><sub>x</sub> − 1 et <em>y</em> variant de 0 à <em>t</em><sub>y</sub> − 1. Le coin 0, 0 est en haut à gauche et le coin <em>t</em><sub>x</sub> − 1, <em>t</em><sub>y</sub> − 1 est en bas à droite.</p>
          <p><strong>Valeurs numériques</strong></p>
          <ul>
            <li><em>t</em><sub>x</sub> = <em>t</em><sub>y</sub> = 512</li>
            <li><em>l</em><sub>m</sub> = 20 cycles</li>
            <li><em>l</em><sub>SPRAM</sub> = 10 cycles</li>
            <li><em>b</em><sub>max</sub> = 16 Octets</li>
            <li><em>t</em><sub>IT</sub> = 400 cycles</li>
            <li>La SPRAM fait 4 KOctet</li>
          </ul>
          <p>L’algorithme de détection de visage commence par calculer l’image intégrale de l’image de départ. Un pixel de l’image intégrale <em>II</em>(x, y) prend pour valeur la somme de tous les pixels du rectangle compris entre l’origine (en haut à gauche) et le pixel <em>I</em>(x, y) de l’image de départ.</p>
          <p>Le calcul de l’image intégrale se fait en deux passes : une intégrale verticale suivie d’une intégrale horizontale. On exécute l’algorithme suivant :</p>
<pre><code>/* 1ere passe : intégrale verticale */
for(=0; x&lt;tx; x++)                 /* pour chaque colonne */
{
    II(x,0)=I(x, 0);               /* initialise l’intégrale */
    for(y=1; y&lt;ty; y++)            /* pour chaque ligne */
        II(x,y) =II(x,y-1)+I(x,y);
}
/* 2nde passe : intégrale horizontale */
for(y=0; y&lt;ty; y++)                /* pour chaque ligne */
    for(x=1; x&lt;tx; x++)            /* pour chaque colonne */
        II(x,y) =II(x-1,y)+I(x,y);</code></pre>
          <p>Une zone <em>l</em> × <em>h</em> de l’image <em>I</em> a une largeur de <em>l</em> pixels et une hauteur de <em>h</em> pixels.</p>`,
        questions: [
          {
            n: "Q1",
            title: "Cache ou Scratch-Pad RAM ?",
            prompt: `<p><strong>Question 1 :</strong></p>
              <p>Rappeler en deux phrases la différence entre une SPRAM et un cache.</p>`,
            verbatim: true,
            sourcePage: 1,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Il faut distinguer deux mémoires rapides proches du processeur, non pas par leur technologie — toutes deux peuvent être réalisées en SRAM — mais par <strong>qui décide de leur contenu</strong>.</p>
              <h4>2. Comparaison guidée</h4>
              <table>
                <thead><tr><th>Point comparé</th><th>Cache</th><th>SPRAM</th></tr></thead>
                <tbody>
                  <tr><td>Gestion</td><td>Automatique, par le matériel</td><td>Explicite, par le logiciel ou le DMA</td></tr>
                  <tr><td>Contenu</td><td>Copies de blocs de la mémoire principale</td><td>Données placées volontairement à des adresses connues</td></tr>
                  <tr><td>Matériel associé</td><td>Tags, comparateurs, politique de remplacement</td><td>Pas de tags ni de remplacement automatique</td></tr>
                  <tr><td>Temps d’accès</td><td>Rapide en cas de hit, beaucoup plus long en cas de miss</td><td>Prévisible ; ici un cycle côté CPU</td></tr>
                </tbody>
              </table>
              <p>Exemple : avec un cache, lire <code>A[i]</code> peut provoquer automatiquement le chargement de toute une ligne. Avec une SPRAM, le programme doit d’abord demander explicitement au DMA d’y copier la zone qui contient <code>A[i]</code>.</p>
              <h4>3. Conséquence architecturale</h4>
              <p>Le cache simplifie la programmation mais son temps est moins déterministe. La SPRAM demande davantage de travail logiciel, mais permet de prévoir précisément les transferts et les temps, ce qui est précieux dans un système embarqué.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Le cache est une mémoire de copies gérée automatiquement par le matériel, avec des hits et des misses. La SPRAM est une mémoire locale explicitement gérée par le logiciel/DMA, sans tags ni remplacement automatique, et son accès est déterministe. »</strong></p>`,
            intuition: `<p>Imagine une table de travail. Le cache est un assistant qui choisit lui-même les dossiers à poser dessus : souvent il anticipe bien, parfois le dossier manque. La SPRAM est une table que tu organises toi-même : cela demande une préparation, mais tu sais exactement ce qui s’y trouve au moment du calcul.</p>`,
            trap: `<p>« Petite, proche et rapide » ne suffit pas à distinguer les deux. Le critère essentiel est la <strong>gestion automatique</strong> du cache contre la <strong>gestion explicite</strong> de la SPRAM.</p>`
          },
          {
            n: "Q2",
            title: "Chronogramme d’un burst DMA",
            prompt: `<p><strong>Question 2 :</strong></p>
              <p>Dessiner le chronogramme d’une séquence de transfert DMA d’un bloc de données de taille <em>b</em><sub>max</sub> provenant de la mémoire externe et écrites en SPRAM.</p>`,
            verbatim: true,
            sourcePage: 1,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On veut ordonner dans le temps les deux phases nécessaires pour déplacer un burst complet : <strong>DDR → tampon du DMA</strong>, puis <strong>tampon du DMA → SPRAM</strong>.</p>
              <h4>2. Données et symboles</h4>
              <ul>
                <li><code>bmax</code> : taille maximale du burst, en octets ;</li>
                <li><code>lm</code> : latence initiale d’un accès à la mémoire externe ;</li>
                <li><code>lSPRAM</code> : latence initiale d’un accès du DMA à la SPRAM ;</li>
                <li>le bus fait 32 bits, donc transporte <strong>4 octets par cycle</strong> après la latence.</li>
              </ul>
              <p>Le nombre de mots du burst est donc <code>k = bmax / 4</code>. Le DMA ne possède qu’un tampon d’un burst : il faut le remplir avant de le vider, sans recouvrement dans le modèle du sujet.</p>
              <h4>3. Chronogramme</h4>
<pre><code>temps ───────────────────────────────────────────────────────────────►
DDR → DMA   requête │ attente lm │ R0 R1 ... R(k−1)
tampon DMA                       │    burst complet    │
DMA → SPRAM                                      requête │ attente lSPRAM │ W0 ... W(k−1)
</code></pre>
              <h4>4. Calcul étape par étape</h4>
              <p>La lecture DDR coûte <code>lm</code> cycles de latence puis <code>k</code> cycles de données. L’écriture SPRAM coûte ensuite <code>lSPRAM</code> cycles de latence puis encore <code>k</code> cycles de données.</p>
              <p><code>Cburst = lm + k + lSPRAM + k = lm + lSPRAM + 2·bmax/4</code>.</p>
              <p>Avec <code>lm = 20</code>, <code>lSPRAM = 10</code> et <code>bmax = 16 B</code>, on a <code>k = 4</code> et :</p>
              <p><code>Cburst = 20 cycles + 4 cycles + 10 cycles + 4 cycles = 38 cycles</code>.</p>
              <p>Contrôle : sur les 38 cycles, 30 sont des latences fixes et 8 transportent effectivement les quatre mots deux fois. Le résultat est donc bien supérieur aux seuls 8 cycles de données.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Un burst de <code>bmax</code> octets coûte <code>lm + lSPRAM + 2·bmax/4</code> cycles. Ici, un burst de 16 octets coûte <code>20+10+2·4 = 38 cycles</code>. »</strong></p>`,
            intuition: `<p>Le tampon du DMA joue le rôle d’un seau : on attend la DDR, on remplit le seau mot après mot, puis on attend la SPRAM et on le vide mot après mot. Avec 16 octets sur un bus de 4 octets, ce sont quatre « pelletées » à l’aller et quatre au retour.</p>`,
            trap: `<p>Le calcul adopte la convention habituelle du cours « latence + un cycle par mot » et suppose qu’il n’y a pas de recouvrement lecture/écriture, cohérent avec l’unique tampon de taille <em>b</em><sub>max</sub>. Une convention où le premier mot occupe le dernier cycle de latence créerait seulement un décalage d’un cycle par phase.</p>`
          },
          {
            n: "Q3",
            title: "Synchroniser DMA et logiciel par interruption",
            prompt: `<p><strong>Question 3 :</strong></p>
              <p>Comment synchroniser un DMA avec le logiciel en utilisant des interruptions ? Dessiner un chronogramme type pour le transfert d’un paquet de <em>n</em> KOctets.</p>`,
            verbatim: true,
            sourcePage: 2,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Le logiciel doit savoir exactement quand les données sont disponibles, tout en évitant d’occuper le CPU à interroger continuellement le DMA. L’interruption fournit ce rendez-vous.</p>
              <h4>2. Déroulement étape par étape</h4>
              <ol>
                <li>Le CPU écrit dans les registres du DMA l’adresse source, l’adresse destination et la taille, puis démarre le canal.</li>
                <li>Le DMA transfère de façon autonome les bursts successifs ; le CPU peut exécuter un travail indépendant.</li>
                <li>Après la dernière écriture en SPRAM, le DMA lève son interruption.</li>
                <li>Au plus tôt <code>tIT</code> cycles plus tard, le processeur entre dans la routine d’interruption, acquitte la source et positionne un drapeau ou réveille la tâche en attente.</li>
                <li>Après la synchronisation mémoire nécessaire, le logiciel peut consommer les données de la SPRAM.</li>
              </ol>
              <h4>3. Lecture du chronogramme</h4>
<pre><code>CPU : config │ travail indépendant ................ │&lt;── tIT ──&gt;│ ISR : ack + done=1
DMA :        │ lire/écrire burst 0 │ ... │ dernier burst │ IT
</code></pre>
              <p><code>tIT</code> n’est pas un temps de transfert de données : c’est le délai minimal entre l’apparition de l’interruption et la première instruction utile de l’ISR, sauvegarde de contexte comprise. Si le DMA termine au cycle 10 000 et si <code>tIT=400</code>, le logiciel ne constate la fin qu’au plus tôt au cycle 10 400.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Le CPU configure puis lance le DMA et poursuit son exécution. Le DMA interrompt le CPU après la dernière écriture ; <code>tIT</code> cycles plus tard, l’ISR acquitte l’interruption et signale que la zone de SPRAM peut être utilisée. »</strong></p>`,
            intuition: `<p>L’interruption est une sonnette de fin. Sans elle, le CPU resterait devant la porte à demander « est-ce terminé ? ». Avec elle, il part travailler ailleurs et le DMA le rappelle uniquement lorsque tout le paquet est arrivé.</p>`,
            trap: `<p>L’interruption est émise <strong>une fois après le paquet complet</strong>, pas après chaque burst interne. Le coût <code>tIT</code> sera donc payé une fois par commande DMA configurée.</p>`
          },
          {
            n: "Q4",
            title: "Temps minimal pour n Kio",
            prompt: `<p><strong>Question 4 :</strong></p>
              <p>Exprimer le nombre de cycles minimum pour transférer entre la mémoire externe et la SPRAM un paquet de données de <em>n</em> KOctets en fonction de <em>n</em>, <em>l</em><sub>SPRAM</sub>, <em>l</em><sub>m</sub>, <em>b</em><sub>max</sub> et <em>t</em><sub>IT</sub></p>`,
            verbatim: true,
            sourcePage: 2,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On généralise le coût d’un burst de la Q2 à un paquet contigu de <code>n</code> Kio, puis on ajoute une seule fois le délai de réponse à l’interruption.</p>
              <h4>2. Définition de chaque symbole</h4>
              <ul>
                <li><code>Q = 1024·n</code> : taille totale du paquet, en octets ;</li>
                <li><code>B = ceil(Q/bmax)</code> : nombre de bursts nécessaires ;</li>
                <li><code>W = ceil(Q/4)</code> : nombre de mots de 32 bits transportés ;</li>
                <li><code>lm</code> et <code>lSPRAM</code> : latences fixes payées à chaque burst ;</li>
                <li><code>tIT</code> : délai payé une fois après le paquet complet.</li>
              </ul>
              <h4>3. Construction de la formule</h4>
              <p>Les <code>B</code> bursts paient chacun les deux latences, d’où <code>B·(lm+lSPRAM)</code>. Les <code>W</code> mots traversent le bus deux fois, d’où <code>2W</code>. Enfin, le CPU attend la prise en compte de l’unique interruption finale :</p>
              <p><strong><code>T(Q) = B·(lm + lSPRAM) + 2·W + tIT</code></strong>.</p>
              <p>Si le paquet est un multiple de <code>bmax</code>, tous les bursts sont pleins :</p>
              <p><code>T(n) = (1024·n / bmax)·(lm + lSPRAM + 2·bmax/4) + tIT</code>.</p>
              <h4>4. Application numérique</h4>
              <p>Ici, <code>1024n/16 = 64n</code> bursts et chaque burst coûte 38 cycles :</p>
              <p><code>T(n) = 64n·38 + 400 = </code><strong><code>2432n + 400 cycles</code></strong>.</p>
              <p>Mini-contrôle pour <code>n=1</code> Kio : <code>T(1)=2432+400=2832 cycles</code>. C’est exactement le coût que l’on retrouvera pour une bande horizontale de 1024 octets en Q9.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Pour <code>n</code> Kio contigus, <code>T=(1024n/bmax)(lm+lSPRAM+2bmax/4)+tIT</code>. Numériquement, <code>T=2432n+400 cycles</code>. »</strong></p>`,
            intuition: `<p>La taille du paquet détermine combien de fois on paie le « péage burst ». En revanche, comme le DMA reçoit une seule commande pour toute la zone contiguë, la « sonnette » de 400 cycles ne retentit qu’une fois à la fin.</p>`,
            trap: `<p>Un Kio vaut ici 1024 octets. Ne pas multiplier <code>tIT</code> par le nombre de bursts : un paquet contigu correspond à une seule commande DMA.</p>`
          },
          {
            n: "Q5",
            title: "Temps de chargement d’une ligne",
            prompt: `<p><strong>Question 5 :</strong></p>
              <p>Combien de temps minimum faut-il pour charger une ligne de <em>t</em><sub>x</sub> × 1 pixels dans la SPRAM ?</p>`,
            verbatim: true,
            sourcePage: 3,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Il faut transformer la taille d’une ligne en nombre de bursts, puis appliquer le coût d’un transfert <strong>contigu</strong>.</p>
              <h4>2. Données utiles</h4>
              <ul>
                <li><code>tx = 512 pixels</code> ;</li>
                <li>un pixel vaut 8 bits, donc 1 octet ;</li>
                <li><code>bmax = 16 octets</code> et un burst complet coûte 38 cycles ;</li>
                <li><code>tIT = 400 cycles</code>.</li>
              </ul>
              <h4>3. Calcul étape par étape</h4>
              <p>La ligne contient <code>512 pixels · 1 B/pixel = 512 B</code>. Comme ses adresses vont sans trou de <code>I(0,y)</code> à <code>I(511,y)</code>, une seule commande DMA peut couvrir toute la ligne.</p>
              <p>Nombre de bursts : <code>512 B / 16 B par burst = 32 bursts</code>.</p>
              <p>Temps des bursts : <code>32 bursts · 38 cycles/burst = 1216 cycles</code>.</p>
              <p>Temps observé par le logiciel : <code>1216 + 400 = 1616 cycles</code>.</p>
              <p>Contrôle : le minimum de données seules serait deux passages de <code>512/4 = 128</code> cycles, soit 256 cycles. En ajoutant <code>32·(20+10)=960</code> cycles de latence et 400 cycles d’interruption, on retrouve <code>256+960+400=1616</code>.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Une ligne de 512 octets est contiguë et demande 32 bursts. Son chargement prend <code>32·38+400 = 1616 cycles</code>. »</strong></p>`,
            intuition: `<p>La disposition row-major range une ligne comme une phrase écrite sans espaces inutiles : le DMA commence au premier pixel et continue tout droit jusqu’au dernier. Il paie donc 32 petits bursts, mais ne doit être lancé et interrompre le CPU qu’une seule fois.</p>`,
            trap: `<p>Il y a 32 bursts, mais seulement une commande DMA et donc un seul coût d’interruption.</p>`
          },
          {
            n: "Q6",
            title: "Temps de chargement d’une colonne",
            prompt: `<p><strong>Question 6 :</strong></p>
              <p>Combien de temps minimum faut-il pour charger une colonne de 1 × <em>t</em><sub>y</sub> pixels dans la SPRAM ?</p>
              <p><strong>Indication :</strong> Les pixels d’une colonne ne sont pas à des adresses contiguës</p>`,
            verbatim: true,
            sourcePage: 3,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>La quantité utile est encore de 512 octets, mais il faut d’abord déterminer si ces octets forment un intervalle contigu en mémoire.</p>
              <h4>2. Étude des adresses</h4>
              <p>L’adresse d’un pixel est <code>adresse(I(x,y)) = x + y·tx</code>. Pour deux pixels consécutifs d’une même colonne :</p>
              <p><code>adresse(I(x,y+1)) − adresse(I(x,y)) = tx = 512 octets</code>.</p>
              <p>Il y a donc un pixel utile tous les 512 octets. Le DMA simple du sujet ne sait décrire qu’une zone contiguë : il faut <strong>un transfert par pixel</strong>, soit 512 commandes.</p>
              <h4>3. Coût d’un pixel</h4>
              <p>Le bus est large de 32 bits. Même si un seul octet est utile, il faut un beat en lecture et un beat en écriture :</p>
              <p><code>Tpixel = lm + 1 beat + lSPRAM + 1 beat + tIT</code></p>
              <p><code>Tpixel = 20 + 1 + 10 + 1 + 400 = 432 cycles</code>.</p>
              <h4>4. Coût de la colonne</h4>
              <p><code>Tcolonne = 512 pixels · 432 cycles/pixel = </code><strong><code>221 184 cycles</code></strong>.</p>
              <p>Contrôle de cohérence : la colonne et la ligne contiennent autant d’octets, mais <code>221 184 / 1616 ≈ 137</code>. Ce très grand facteur vient des 512 interruptions au lieu d’une seule et du gaspillage de trois octets sur chaque mot bus.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Les pixels d’une colonne sont espacés de 512 octets ; il faut 512 DMA d’un beat. Chaque transfert coûte 432 cycles, donc la colonne coûte <code>512·432 = 221 184 cycles</code>. »</strong></p>`,
            intuition: `<p>Imagine un livre : une ligne est une phrase que l’on photographie d’un coup, tandis qu’une colonne impose de prendre une photo sur chacune des 512 pages. La quantité utile est la même, mais chaque nouvelle photo repaie la préparation et la notification de fin.</p>`,
            trap: `<p>Ne pas appliquer directement la formule d’un bloc contigu de 512 octets. Le DMA du sujet ne possède ni adressage 2D ni paramètre de pas ou <em>stride</em>.</p>`
          },
          {
            n: "Q7",
            title: "Coût total des deux passes originales",
            prompt: `<p><strong>Question 7 :</strong></p>
              <p>Combien de lignes et colonnes l’algorithme précédent nécessite-t-il de charger ?</p>
              <ul>
                <li>Dans la passe verticale</li>
                <li>Dans la passe horizontale</li>
              </ul>
              <p>En déduire le temps total passé à charger les données pour le calcul de l’image intégrale.</p>`,
            verbatim: true,
            sourcePage: 3,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On compte les zones chargées par chacune des deux boucles externes, puis on réutilise les résultats unitaires des Q5 et Q6.</p>
              <h4>2. Passe verticale</h4>
              <p>La boucle externe parcourt <code>x=0…511</code> : elle traite donc <strong>512 colonnes</strong>. Une colonne coûte <code>221 184 cycles</code> :</p>
              <p><code>Tvertical = 512 colonnes · 221 184 cycles/colonne</code></p>
              <p><strong><code>Tvertical = 113 246 208 cycles</code></strong>.</p>
              <h4>3. Passe horizontale</h4>
              <p>La boucle externe parcourt <code>y=0…511</code> : elle traite donc <strong>512 lignes</strong>. Une ligne coûte <code>1616 cycles</code> :</p>
              <p><code>Thorizontal = 512 lignes · 1616 cycles/ligne</code></p>
              <p><strong><code>Thorizontal = 827 392 cycles</code></strong>.</p>
              <h4>4. Somme et contrôle</h4>
              <p><code>Ttotal = 113 246 208 + 827 392 = </code><strong><code>114 073 600 cycles</code></strong>.</p>
              <p>La part verticale vaut environ <code>113 246 208 / 114 073 600 ≈ 99,27 %</code>. C’est cohérent : la passe verticale multiplie les minuscules commandes non contiguës, alors que chaque ligne horizontale est transférée d’un seul tenant.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« La passe verticale charge 512 colonnes et coûte 113 246 208 cycles ; la passe horizontale charge 512 lignes et coûte 827 392 cycles. Le total est 114 073 600 cycles, dominé à 99,27 % par les colonnes. »</strong></p>`,
            intuition: `<p>L’algorithme fait deux fois la même quantité de calcul géométrique, mais pas du tout le même type de trafic. Horizontalement, la mémoire déroule naturellement les pixels ; verticalement, elle oblige le DMA à sauter une ligne entière entre deux pixels. C’est cette granularité, plus que la taille de l’image, qui explique l’écart.</p>`,
            trap: `<p>Le résultat suit le modèle explicite de l’exercice, qui compte les zones chargées comme des pixels de 8 bits. Une image intégrale réelle exige des éléments de 32 bits ; cette incohérence de l’énoncé sera rappelée à la Q10.</p>`
          },
          {
            n: "Q8",
            title: "Bandes verticales de plusieurs colonnes",
            prompt: `<p>Nous allons essayer d’optimiser cet algorithme et améliorer le temps de chargement.</p>
              <p>Tout d’abord nous remarquons qu’il est plus intéressant de charger plusieurs colonnes simultanément car un mot mémoire de 32 bits contient 4 pixels consécutifs, qui appartiennent à 4 colonnes.</p>
              <p><strong>Question 8 :</strong></p>
              <p>Combien de temps faut-il pour charger une bande verticale de <em>l</em> × <em>t</em><sub>y</sub> pixels dans la SPRAM ?</p>
              <p>Donner l’expression analytique puis le temps :</p>
              <ul>
                <li>pour <em>l</em>=2</li>
                <li>pour <em>l</em>=4</li>
                <li>pour <em>l</em>=6</li>
                <li>pour <em>l</em>=8</li>
              </ul>`,
            verbatim: true,
            sourcePage: 3,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On élargit une colonne à <code>l</code> pixels pour utiliser davantage de chaque mot de 32 bits. Il faut déterminer combien de mots sont nécessaires par ligne et combien de fois le DMA est relancé.</p>
              <h4>2. Organisation mémoire</h4>
              <p>Dans une ligne, les <code>l</code> pixels sont contigus. En revanche, tant que <code>l &lt; tx</code>, la ligne suivante de la bande commence après un trou de <code>tx−l</code> octets. Il reste donc <strong>une commande DMA par ligne</strong>, soit <code>ty=512</code> commandes.</p>
              <p>Un mot bus contient 4 pixels. Le nombre de mots par petit segment est :</p>
              <p><code>w(l) = ceil(l/4)</code>.</p>
              <h4>3. Formule</h4>
              <p>Pour les valeurs demandées, <code>l≤8</code>, donc le segment tient dans un seul burst. Une ligne coûte :</p>
              <p><code>lm + lSPRAM + 2·w(l) + tIT</code>.</p>
              <p>La bande entière coûte donc :</p>
              <p><strong><code>TV(l) = ty·[lm + lSPRAM + 2·ceil(l/4) + tIT]</code></strong>.</p>
              <h4>4. Applications numériques</h4>
              <table>
                <thead><tr><th>l</th><th>w(l)</th><th>Coût d’une ligne</th><th>Temps des 512 lignes</th></tr></thead>
                <tbody>
                  <tr><td>2</td><td>1 mot</td><td><code>20+10+2+400 = 432</code></td><td><strong>221 184 cycles</strong></td></tr>
                  <tr><td>4</td><td>1 mot</td><td><code>432</code></td><td><strong>221 184 cycles</strong></td></tr>
                  <tr><td>6</td><td>2 mots</td><td><code>20+10+4+400 = 434</code></td><td><strong>222 208 cycles</strong></td></tr>
                  <tr><td>8</td><td>2 mots</td><td><code>434</code></td><td><strong>222 208 cycles</strong></td></tr>
                </tbody>
              </table>
              <p>Le temps varie peu entre 2 et 8 colonnes, car les 430 cycles fixes par ligne dominent les deux ou quatre cycles de données. Pourtant, le nombre de pixels utiles est multiplié par quatre : la bande de 8 est donc beaucoup plus efficace par pixel.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Une bande verticale impose 512 DMA, mais chaque beat sert plusieurs colonnes. <code>TV(l)=512·[430+2·ceil(l/4)]</code>, soit 221 184 cycles pour <code>l=2,4</code> et 222 208 cycles pour <code>l=6,8</code>. »</strong></p>`,
            intuition: `<p>Le coût ressemble à un taxi avec une prise en charge de 430 cycles et seulement quelques cycles selon le nombre de passagers. Faire voyager quatre pixels dans le même mot ne coûte pas plus que deux ; faire voyager huit pixels ne coûte pas plus que six. Il faut donc remplir les mots autant que possible.</p>`,
            trap: `<p>Cette formule suppose les bandes utilisées par l’algorithme convenablement alignées. Avec une origine arbitraire non alignée, un segment peut toucher un mot supplémentaire.</p>`
          },
          {
            n: "Q9",
            title: "Bandes horizontales de plusieurs lignes",
            prompt: `<p>Nous remarquons aussi que deux lignes de l’image sont à des adresses consécutives.</p>
              <p><strong>Question 9 :</strong></p>
              <p>Combien de temps faut-il pour charger une bande horizontale de <em>t</em><sub>x</sub> × <em>h</em> pixels dans la SPRAM ?</p>
              <p>Donner l’expression analytique puis le temps :</p>
              <ul>
                <li>pour <em>h</em>=2</li>
                <li>pour <em>h</em>=4</li>
                <li>pour <em>h</em>=6</li>
                <li>pour <em>h</em>=8</li>
              </ul>`,
            verbatim: true,
            sourcePage: 3,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On regroupe <code>h</code> lignes et on exploite le fait qu’en row-major la fin d’une ligne est immédiatement suivie du début de la suivante.</p>
              <h4>2. Taille et contiguïté</h4>
              <p>Une ligne contient 512 octets. Une bande de hauteur <code>h</code> contient donc :</p>
              <p><code>Q = 512h octets</code>.</p>
              <p>La zone est entièrement contiguë : il faut une seule commande DMA et une seule interruption. Le nombre de bursts est :</p>
              <p><code>B = 512h / 16 = 32h bursts</code>.</p>
              <h4>3. Formule et valeurs</h4>
              <p><strong><code>TH(h) = 32h·38 + 400 = 1216h + 400 cycles</code></strong>.</p>
              <table>
                <thead><tr><th>h</th><th>Taille</th><th>Bursts</th><th>Calcul</th><th>Temps</th></tr></thead>
                <tbody>
                  <tr><td>2</td><td>1024 B</td><td>64</td><td><code>64·38+400</code></td><td><strong>2 832 cycles</strong></td></tr>
                  <tr><td>4</td><td>2048 B</td><td>128</td><td><code>128·38+400</code></td><td><strong>5 264 cycles</strong></td></tr>
                  <tr><td>6</td><td>3072 B</td><td>192</td><td><code>192·38+400</code></td><td><strong>7 696 cycles</strong></td></tr>
                  <tr><td>8</td><td>4096 B</td><td>256</td><td><code>256·38+400</code></td><td><strong>10 128 cycles</strong></td></tr>
                </tbody>
              </table>
              <p>Contrôle pour <code>h=2</code> : la bande vaut exactement 1 Kio. La Q4 donnait <code>T(1)=2432+400=2832 cycles</code>, donc les deux méthodes concordent.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Les <code>h</code> lignes sont contiguës : une seule commande transfère <code>512h</code> octets. <code>TH(h)=1216h+400</code>, d’où 2 832, 5 264, 7 696 et 10 128 cycles pour <code>h=2,4,6,8</code>. »</strong></p>`,
            intuition: `<p>Ici, agrandir la bande revient simplement à allonger un seul train : on ajoute des wagons de données, mais on ne repaie qu’une seule fois le départ et l’arrivée. C’est pourquoi deux lignes ensemble coûtent moins que deux transferts de ligne séparés.</p>`,
            trap: `<p>Ne pas calculer <code>h·Tligne</code> : cela paierait à tort <code>h</code> interruptions alors que la zone entière est contiguë.</p>`
          },
          {
            n: "Q10",
            title: "Réécriture par bandes de 8",
            prompt: `<p>La SPRAM faisant 4 KOctets, on peut au maximum stocker 8 lignes ou 8 colonnes en mémoire.</p>
              <p><strong>Question 10 :</strong></p>
              <p>A partir de l’algorithme original, écrire un algorithme qui charge les zones de données en SPRAM, et fait les calculs sur plusieurs lignes ou colonnes. On utilisera une fonction <code>charge_zone(x, y, l, h)</code> qui charge en SPRAM une zone de coin supérieur gauche de coordonnée <em>x</em>, <em>y</em> et de taille <em>l</em> × <em>h</em> (il n’est pas demandé de détailler cette fonction, juste de l’utiliser dans le nouvel algorithme).</p>`,
            verbatim: true,
            sourcePage: 3,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Il faut conserver exactement les deux préfixes de l’algorithme — vertical puis horizontal — tout en traitant la plus grande zone qui tient dans la SPRAM afin d’amortir les accès.</p>
              <h4>2. Choix de la taille des bandes</h4>
              <p>Dans le modèle du sujet, un élément chargé vaut 1 octet et la SPRAM contient <code>4 Kio = 4096 octets</code>.</p>
              <ul>
                <li>bande verticale : <code>8 colonnes · 512 pixels · 1 B = 4096 B</code> ;</li>
                <li>bande horizontale : <code>512 pixels · 8 lignes · 1 B = 4096 B</code>.</li>
              </ul>
              <p>Huit est donc la largeur/hauteur maximale annoncée par l’exercice.</p>
              <h4>3. Algorithme bloqué</h4>
<pre><code>/* Passe verticale : huit colonnes à la fois */
for (xb = 0; xb &lt; tx; xb += 8) {
    w = min(8, tx - xb);
    charge_zone(xb, 0, w, ty);

    for (x = xb; x &lt; xb + w; x++) {
        II(x,0) = I(x,0);
        for (y = 1; y &lt; ty; y++)
            II(x,y) = II(x,y-1) + I(x,y);
    }
}

/* Passe horizontale : huit lignes à la fois */
for (yb = 0; yb &lt; ty; yb += 8) {
    h = min(8, ty - yb);
    charge_zone(0, yb, tx, h); /* résultat vertical */

    for (y = yb; y &lt; yb + h; y++)
        for (x = 1; x &lt; tx; x++)
            II(x,y) = II(x-1,y) + II(x,y);
}</code></pre>
              <h4>4. Pourquoi le résultat reste correct</h4>
              <p>Dans la première passe, chaque colonne est indépendante des autres : grouper huit colonnes ne modifie donc aucune dépendance. Dans la seconde, chaque ligne est indépendante des autres : grouper huit lignes est également sûr. À l’intérieur d’une colonne ou d’une ligne, l’ordre croissant de <code>y</code> ou de <code>x</code> est conservé, donc chaque préfixe utilise bien sa valeur précédente.</p>
              <p>La dernière affectation réalise le bon préfixe horizontal : <code>II(x,y)</code> contient déjà la somme verticale courante, et on lui ajoute la somme intégrale située à gauche.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Comme <code>8·512=4096</code> octets, je parcours d’abord l’image par bandes de huit colonnes, puis par bandes de huit lignes. Chaque bande est chargée une fois avec <code>charge_zone</code> et les dépendances internes gardent le même ordre que dans l’algorithme initial. »</strong></p>`,
            intuition: `<p>Le calcul ne change pas ; on change seulement son emballage. Au lieu d’apporter un ingrédient à la fois dans la petite cuisine qu’est la SPRAM, on y place exactement un plateau de 4 Kio et on termine tous les calculs possibles sur ce plateau avant de le remplacer.</p>`,
            trap: `<p>L’énoncé écrit dans sa seconde passe <code>II(x,y)=II(x-1,y)+I(x,y)</code>. C’est une coquille : cela ne construit pas une image intégrale 2D. Il faut ajouter la valeur de la passe verticale, comme dans le code ci-dessus. Autre simplification du sujet : une vraie valeur de l’image intégrale doit être codée sur 32 bits ; huit lignes de telles valeurs occuperaient 16 Kio, pas 4 Kio. Les calculs de cette annale suivent néanmoins l’hypothèse annoncée de 1 octet par élément chargé.</p>`
          },
          {
            n: "Q11",
            title: "Temps total de la version par bandes",
            prompt: `<p><strong>Question 11 :</strong></p>
              <p>En déduire le temps total passé à charger les données pour le calcul de l’image intégrale.</p>`,
            verbatim: true,
            sourcePage: 4,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On multiplie le coût d’une bande maximale, obtenu aux Q8 et Q9, par le nombre de bandes nécessaires dans chaque passe.</p>
              <h4>2. Nombre de bandes</h4>
              <p>Chaque bande couvre huit colonnes ou huit lignes et <code>512</code> est divisible par huit :</p>
              <p><code>Nbandes = 512 / 8 = 64</code>.</p>
              <h4>3. Passe verticale</h4>
              <p>Une bande verticale de largeur 8 coûte <code>TV(8)=222 208 cycles</code> :</p>
              <p><code>Tvertical,opt = 64 · 222 208</code></p>
              <p><strong><code>Tvertical,opt = 14 221 312 cycles</code></strong>.</p>
              <h4>4. Passe horizontale</h4>
              <p>Une bande horizontale de hauteur 8 coûte <code>TH(8)=10 128 cycles</code> :</p>
              <p><code>Thorizontal,opt = 64 · 10 128</code></p>
              <p><strong><code>Thorizontal,opt = 648 192 cycles</code></strong>.</p>
              <h4>5. Total et vérification du gain</h4>
              <p><code>Ttotal,opt = 14 221 312 + 648 192 = </code><strong><code>14 869 504 cycles</code></strong>.</p>
              <p>Le temps initial était <code>114 073 600 cycles</code>. Le facteur d’accélération dû aux chargements est :</p>
              <p><code>114 073 600 / 14 869 504 ≈ 7,67</code>.</p>
              <p>Contrôle : la verticale reste dominante, avec environ <code>95,64 %</code> du nouveau total. Le blocage améliore énormément la situation sans supprimer la non-contiguïté verticale.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Il faut 64 bandes par passe. Les chargements coûtent 14 221 312 cycles verticalement et 648 192 horizontalement, soit 14 869 504 cycles au total et un gain d’environ 7,67×. »</strong></p>`,
            intuition: `<p>La bande verticale remplit enfin les mots de 32 bits : huit colonnes utilisent deux mots complets à chaque ligne. La bande horizontale fait encore mieux en regroupant 4096 octets contigus sous une seule interruption. Le premier gain vient donc de l’utilisation du bus ; le second, de l’amortissement des commandes.</p>`,
            trap: `<p>Il faut additionner les deux passes. Le temps <code>648 192</code> correspond seulement aux bandes horizontales.</p>`
          },
          {
            n: "Q12",
            title: "Temps de chargement d’un bloc Bx × By",
            prompt: `<p>Une optimisation suplémentaire consisterait à charger un bloc de taille <em>B</em><sub>x</sub> × <em>B</em><sub>y</sub> en SPRAM, puis faire les deux passes horizontale et verticale sur tout le bloc. Le problème est que le calcul d’un bloc dépend du bloc voisin. Sur la figure suivante nous voyons que le calcul du bloc B nécessite le bord droite du bloc A, et le calcul du bloc F nécessite le bord inférieur du bloc B et le bord droite du bloc E.</p>
<pre><code>A    B    C    D
E    F    G    H
I    J    K    L
M    N    O    P</code></pre>
              <p>Une solution consiste à calculer les blocs horizontalement, ligne après ligne, en utilisant les valeurs des blocs précédemment calculés. On a alors l’algorithme suivant :</p>
<pre><code>for(by=0; by&lt;ty; by+=By) /* pour chaque ligne de bloc */
{
    for(bx=0; bx&lt;tx; bx+=Bx) /* pour chaque bloc de la ligne*/
    {
        /* 1ere passe : intégrale verticale */
        for(x=0; x&lt;Bx; x++)              /* pour chaque colonne du bloc */
        {
            /* initialise l’intégrale sur la colonne*/
            if (by!=0)                   /* si ce n’est pas le premier bloc,*/
                II(bx+x,by)=II(bx+x,by-1)+I(bx+x,by); /* utilise le calcul précédent */
            else
                II(bx+x,0)=I(bx+x,0);

            for(y=1; y&lt;By; y++)          /* pour chaque ligne du bloc */
                II(bx+x,by+y) =II(bx+x,by+y-1)+I(bx+x,by+y);
        }
        /* 2nde passe : intégrale horizontale */
        for(y=0; y&lt;By; y++)              /* pour chaque ligne du bloc */
            for(x=0; x&lt;Bx; x++)          /* pour chaque colonne du bloc */
                if (bx+x!=0)
                    II(bx+x,by+y) =II(bx+x-1,by+y)+I(bx+x,by+y);
    }
}</code></pre>
              <p><strong>Question 12 :</strong></p>
              <p>Quel est le temps nécessaire pour charger un bloc de taille <em>B</em><sub>x</sub> × <em>B</em><sub>y</sub> en SPRAM ?</p>
              <p><strong>Attention :</strong> le chargement de deux lignes de <em>B</em><sub>x</sub> pixels ne peut pas se faire avec un seul transfert DMA lorsque les données ne sont pas à des adresses consécutives ! A l’inverse, si les données sont consécutives en mémoire, un seul transfert DMA suffit.</p>
              <p>Donner les équations pour chacun des cas.</p>`,
            verbatim: true,
            sourcePage: 4,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Un rectangle géométrique n’est pas forcément un intervalle contigu en mémoire. Il faut donc établir une formule pour les lignes séparées, puis une autre pour le cas contigu.</p>
              <h4>2. Symboles</h4>
              <ul>
                <li><code>Bx</code> : largeur du bloc en pixels/octets dans le modèle du sujet ;</li>
                <li><code>By</code> : nombre de lignes du bloc ;</li>
                <li><code>tx</code> : largeur physique d’une ligne complète de l’image ;</li>
                <li><code>bmax</code> : taille maximale d’un burst ;</li>
                <li><code>ceil(Bx/4)</code> : nombre de beats 32 bits pour une ligne.</li>
              </ul>
              <h4>3. Cas non contigu : Bx &lt; tx</h4>
              <p>Après les <code>Bx</code> octets utiles d’une ligne, il reste <code>tx−Bx</code> octets avant la ligne suivante du même bloc. Le DMA simple ne sait pas sauter ce trou : chaque ligne est une commande séparée.</p>
              <p>Une ligne paie <code>ceil(Bx/bmax)</code> fois les deux latences, transporte <code>ceil(Bx/4)</code> mots deux fois et déclenche une interruption :</p>
              <p><strong><code>Tbloc,nc = By·[ceil(Bx/bmax)·(lm+lSPRAM) + 2·ceil(Bx/4) + tIT]</code></strong>.</p>
              <h4>4. Cas contigu : Bx = tx ou By = 1</h4>
              <p>Les <code>Bx·By</code> octets se suivent sans trou. Une seule commande et une seule interruption suffisent :</p>
              <p><strong><code>Tbloc,c = ceil(Bx·By/bmax)·(lm+lSPRAM) + 2·ceil(Bx·By/4) + tIT</code></strong>.</p>
              <p>Pour les dimensions de la Q13, toutes multiples de 16, les expressions se simplifient :</p>
              <ul>
                <li>non contigu : <code>By·[(Bx/16)·38 + 400]</code> ;</li>
                <li>contigu : <code>(Bx·By/16)·38 + 400</code>.</li>
              </ul>
              <p>Mini-exemple : un bloc <code>32×2</code> non contigu paie deux interruptions, <code>2·[2·38+400]</code>. Un segment contigu de 64 octets ne paierait que <code>4·38+400</code>. Même nombre d’octets, mais une interruption de moins.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Si <code>Bx&lt;tx</code>, je lance un DMA pour chacune des <code>By</code> lignes. Si le bloc couvre une zone contiguë, un seul DMA transfère les <code>BxBy</code> octets ; le coût d’interruption n’apparaît alors qu’une fois. »</strong></p>`,
            intuition: `<p>Découpe un rectangle dans une feuille imprimée. En mémoire row-major, ses morceaux sont rangés ligne par ligne, mais du texte extérieur au rectangle reste entre eux. Seul un rectangle couvrant toute la largeur de la feuille devient une bande continue que le DMA peut lire sans relever la tête.</p>`,
            trap: `<p>Deux lignes ne sont contiguës que si le bloc couvre toute la largeur physique de l’image. Le fait qu’elles soient voisines visuellement ne suffit pas.</p>`
          },
          {
            n: "Q13",
            title: "Comparaison numérique des blocs",
            prompt: `<p><strong>Question 13 :</strong></p>
              <p>En déduire le temps total passé à charger les données pour le calcul de l’image intégrale dans les cas suivant :</p>
              <ul>
                <li><em>B</em><sub>x</sub> = 32, <em>B</em><sub>y</sub> = 32 (1 bloc=1 KOctets)</li>
                <li><em>B</em><sub>x</sub> = 64, <em>B</em><sub>y</sub> = 32 (1 bloc=2 KOctets)</li>
                <li><em>B</em><sub>x</sub> = 128, <em>B</em><sub>y</sub> = 32 (1 bloc=4 KOctets)</li>
                <li><em>B</em><sub>x</sub> = 512, <em>B</em><sub>y</sub> = 8 (1 bloc=4 KOctets)</li>
              </ul>`,
            verbatim: true,
            sourcePage: 5,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Pour chaque forme de bloc, on calcule d’abord le coût d’un bloc, puis le nombre de blocs qui pavent l’image <code>512×512</code>. Toutes les dimensions divisent exactement 512.</p>
              <h4>2. Méthode commune</h4>
              <p>Pour <code>Bx&lt;512</code>, une ligne coûte <code>(Bx/16)·38+400</code>, puis on multiplie par <code>By</code>. Le nombre de blocs vaut <code>(512/Bx)·(512/By)</code>. Pour <code>Bx=512</code>, les lignes sont contiguës et tout le bloc utilise un seul DMA.</p>
              <h4>3. Calculs intermédiaires</h4>
              <ul>
                <li><strong>32×32 :</strong> deux bursts par ligne ; <code>Tbloc=32·(2·38+400)=15 232</code>. Il y a <code>16·16=256</code> blocs, donc <code>15 232·256=3 899 392 cycles</code>.</li>
                <li><strong>64×32 :</strong> quatre bursts par ligne ; <code>Tbloc=32·(4·38+400)=17 664</code>. Il y a <code>8·16=128</code> blocs, donc <code>17 664·128=2 260 992 cycles</code>.</li>
                <li><strong>128×32 :</strong> huit bursts par ligne ; <code>Tbloc=32·(8·38+400)=22 528</code>. Il y a <code>4·16=64</code> blocs, donc <code>22 528·64=1 441 792 cycles</code>.</li>
                <li><strong>512×8 :</strong> le bloc de <code>4096 B</code> est contigu ; <code>Tbloc=256·38+400=10 128</code>. Il y a 64 blocs, donc <code>10 128·64=648 192 cycles</code>.</li>
              </ul>
              <h4>4. Tableau récapitulatif</h4>
              <table>
                <thead><tr><th>Bloc</th><th>Temps par bloc</th><th>Nombre de blocs</th><th>Temps total</th></tr></thead>
                <tbody>
                  <tr><td>32 × 32</td><td><code>32·(2·38+400) = 15 232</code></td><td>16·16 = 256</td><td><strong>3 899 392 cycles</strong></td></tr>
                  <tr><td>64 × 32</td><td><code>32·(4·38+400) = 17 664</code></td><td>8·16 = 128</td><td><strong>2 260 992 cycles</strong></td></tr>
                  <tr><td>128 × 32</td><td><code>32·(8·38+400) = 22 528</code></td><td>4·16 = 64</td><td><strong>1 441 792 cycles</strong></td></tr>
                  <tr><td>512 × 8</td><td><code>256·38+400 = 10 128</code></td><td>1·64 = 64</td><td><strong>648 192 cycles</strong></td></tr>
                </tbody>
              </table>
              <h4>5. Contrôle de cohérence</h4>
              <p>Dans chaque scénario, l’image complète contient toujours <code>512·512 = 262 144 octets</code>, soit <code>262 144/16 = 16 384 bursts</code>. La partie transport et latences de burst est donc toujours <code>16 384·38 = 622 592 cycles</code>. Seul change le nombre de commandes/interruption : 8192, 4096, 2048 puis 64. En ajoutant <code>400</code> cycles par commande, on retrouve chaque total du tableau.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Les temps totaux sont respectivement 3 899 392, 2 260 992, 1 441 792 et 648 192 cycles. Le bloc <code>512×8</code> est meilleur car ses 4 Kio sont contigus et ne nécessitent qu’une commande DMA par bloc. »</strong></p>`,
            intuition: `<p>Les quatre solutions déplacent exactement les mêmes 262 144 octets et exécutent donc le même nombre de bursts. Ce qui les départage est le nombre de fois où l’on coupe le transfert en morceaux. La forme <code>512×8</code> épouse l’ordre physique de la mémoire et réduit 8192 démarrages possibles à seulement 64.</p>`,
            trap: `<p>Ces temps comptent le chargement des blocs d’entrée selon le modèle du sujet. Ils ignorent un éventuel trafic supplémentaire pour relire les bords d’image intégrale déjà calculés ; l’algorithme proposé suppose ces valeurs disponibles par le mécanisme de stockage retenu.</p>`
          }
        ]
      },
      {
        title: "Déroulement de boucle et ordonnancement",
        theme: "Ordonnancement MIPS",
        context: `<h3>2 · Déroulement de boucle et ordonnancement d’instructions (8 points)</h3>
          <p>Le produit scalaire de 2 vecteurs <em>x⃗</em> = (x<sub>1</sub>, …, x<sub>n</sub>) et <em>y⃗</em> = (y<sub>1</sub>, …, y<sub>n</sub>) dans un espace de dimension <em>n</em> se calcule comme ∑<sub>i=1</sub><sup>n</sup> x<sub>i</sub> · y<sub>i</sub>. Traduit en assembleur MIPS, cela donne (avec F2 initialement à zéro et R1 pointant sur x<sub>1</sub> et R2 sur y<sub>1</sub>, sachant que les <em>x⃗</em> et <em>y⃗</em> sont en fait des tableaux de flottant double précision - 8 octets -, et R3 contient initialement n) :</p>
<pre><code>loop: L.D F0, 0(R1)    % charge x[i]
      L.D F4, 0(R2)    % charge y[i]
      MUL.D F0, F0, F4 % calcul de x[i] * y[i]
      ADD.D F2, F2, F0 % somme à l’existant
      ADDUI R1, R1, 8 % passe à l’x suivant
      ADDUI R2, R2, 8 % passe à l’y suivant
      ADDUI R3, R3, -1 % décrémente le compteur
      BNEZ R3, loop    % itère si pas au bout
      S.D   F2         % sauve le resultat</code></pre>
          <p>On a les gels (stall ) suivants (identiques à ceux pris en cours) :</p>
          <table>
            <thead><tr><th>Instruction produisante</th><th>Instruction consommante</th><th>Gels (cycles)</th></tr></thead>
            <tbody>
              <tr><td>FP ALU op</td><td>FP ALU op</td><td>3</td></tr>
              <tr><td>FP ALU op</td><td>Store double</td><td>2</td></tr>
              <tr><td>Load double</td><td>FP ALU op</td><td>1</td></tr>
              <tr><td>FP op</td><td>INT ALU op</td><td>0</td></tr>
              <tr><td>INT ALU op</td><td>INT ALU op</td><td>0</td></tr>
              <tr><td>INT ALU op</td><td>branch</td><td>1</td></tr>
            </tbody>
          </table>`,
        questions: [
          {
            n: "Q14",
            title: "Stalls de la boucle originale",
            prompt: `<p><strong>Question 14 :</strong></p>
              <p>L’instruction qui suit le branchement ne fait pas partie de la boucle. Réécrivez la boucle telle quelle en faisant apparaître explicitement les cycles de gels dues au dépendances et anti-dépendances de données.</p>`,
            verbatim: true,
            sourcePage: 6,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Il faut garder l’ordre original, repérer chaque valeur produite puis consommée trop tôt, et matérialiser les cycles pendant lesquels le pipeline ne peut lancer aucune nouvelle instruction utile.</p>
              <h4>2. Lecture des dépendances</h4>
              <table>
                <thead><tr><th>Producteur → consommateur</th><th>Dépendance</th><th>Gels nécessaires ici</th></tr></thead>
                <tbody>
                  <tr><td><code>L.D F4 → MUL.D</code></td><td>RAW sur F4</td><td>1</td></tr>
                  <tr><td><code>MUL.D F0 → ADD.D</code></td><td>RAW sur F0</td><td>3</td></tr>
                  <tr><td><code>ADDUI R3 → BNEZ</code></td><td>RAW sur R3</td><td>1</td></tr>
                </tbody>
              </table>
              <p>Le premier load de <code>F0</code> est déjà séparé du MUL par le load de <code>F4</code>. En revanche, <code>F4</code> vient juste d’être chargé : il reste un gel à insérer.</p>
              <h4>3. Chronologie de la boucle inchangée</h4>
<pre><code>loop:
    L.D    F0, 0(R1)          # c1 : x[i]
    L.D    F4, 0(R2)          # c2 : y[i]
    NOP                       # c3 : Load F4 → MUL, 1 stall
    MUL.D  F0, F0, F4         # c4
    NOP                       # c5 : MUL → ADD, stall 1/3
    NOP                       # c6 : stall 2/3
    NOP                       # c7 : stall 3/3
    ADD.D  F2, F2, F0         # c8
    ADDUI  R1, R1, 8          # c9
    ADDUI  R2, R2, 8          # c10
    ADDUI  R3, R3, -1         # c11
    NOP                       # c12 : R3 → BNEZ, 1 stall
    BNEZ   R3, loop           # c13</code></pre>
              <h4>4. CPI et autres dépendances</h4>
              <p>Une itération contient huit instructions architecturales. Les cinq NOP ajoutent cinq cycles :</p>
              <p><code>Cycles/itération = 8 + 1 + 3 + 1 = 13</code></p>
              <p><strong><code>CPI = 13 cycles / 8 instructions = 1,625</code></strong>.</p>
              <p>Il existe aussi une récurrence vraie <code>ADD F2(i) → ADD F2(i+1)</code>. Elle n’ajoute pas de gel ici, car beaucoup d’instructions séparent naturellement deux additions successives. Les lectures de <code>R1/R2</code> avant leur incrément et la lecture de <code>F0</code> par l’ADD avant le prochain <code>L.D F0</code> sont des WAR. <code>L.D F0</code> puis <code>MUL.D F0,…</code> forment une WAW. Dans cette machine in-order, ces faux liens ne créent pas directement de bulle, mais ils limiteront les déplacements possibles.</p>
              <p>Contrôle : <code>8 instructions + 5 gels = 13 cycles</code> ; le CPI doit donc être supérieur à 1 et inférieur à 2, ce qui concorde avec 1,625.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« La boucle inchangée exige 1 stall entre le second load et le MUL, 3 entre le MUL et l’ADD, puis 1 entre le décrément et le branchement. Elle prend 13 cycles pour 8 instructions, donc <code>CPI=1,625</code>. »</strong></p>`,
            intuition: `<p>Une RAW est une vraie attente : le consommateur réclame une valeur qui n’est pas encore arrivée. Une WAR ou une WAW ressemble plutôt à deux colis portant le même nom de boîte aux lettres : le renommage pourrait leur donner des boîtes différentes, mais sans renommage l’ordonnanceur doit respecter leur ordre pour ne pas écraser la mauvaise valeur.</p>`,
            trap: `<p>Le sujet précise que le <code>S.D</code> après le branchement ne fait pas partie de la boucle : il n’est pas inclus dans le CPI. Aucun delay slot de contrôle n’est ajouté ici, faute d’indication en ce sens. Si une convention MIPS à delay slot obligatoire était imposée, il faudrait ajouter ou remplir ce cycle séparément.</p>`
          },
          {
            n: "Q15",
            title: "Réordonnancement minimal et CPI",
            prompt: `<p><strong>Question 15 :</strong></p>
              <p>Réordonnancez les instructions de sorte à minimiser ce nombre de cycles. Donnez le CPI de la boucle.</p>`,
            verbatim: true,
            sourcePage: 6,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On ne peut changer ni les opérations ni leurs résultats. Le but est de placer les trois mises à jour entières dans les intervalles où les unités flottantes attendent, afin de remplacer des NOP par du travail utile.</p>
              <h4>2. Contraintes à respecter</h4>
              <ul>
                <li>Chaque <code>L.D</code> doit lire l’ancien pointeur avant son <code>ADDUI</code>.</li>
                <li>Il faut au moins une instruction indépendante entre le second load et le MUL.</li>
                <li>Il faut trois instructions/cycles entre le MUL et l’ADD consommateur.</li>
                <li>Il faut une instruction entre le décrément de <code>R3</code> et le branchement.</li>
              </ul>
              <h4>3. Ordonnancement obtenu</h4>
<pre><code>loop:
    L.D    F0, 0(R1)          # c1
    L.D    F4, 0(R2)          # c2
    ADDUI  R1, R1, 8          # c3 : couvre Load → MUL
    MUL.D  F0, F0, F4         # c4
    ADDUI  R2, R2, 8          # c5
    NOP                       # c6 : seul gel restant
    ADDUI  R3, R3, -1         # c7
    ADD.D  F2, F2, F0         # c8 : 3 cycles entre MUL et ADD
    BNEZ   R3, loop           # c9 : ADD sépare R3 du branchement</code></pre>
              <h4>4. Vérification cycle par cycle</h4>
              <ul>
                <li><code>L.D F4</code> est en c2 et <code>MUL.D</code> en c4 : c3 fournit le cycle requis.</li>
                <li><code>MUL.D</code> est en c4 et <code>ADD.D</code> en c8 : c5, c6 et c7 fournissent les trois cycles requis.</li>
                <li><code>ADDUI R3</code> est en c7 et <code>BNEZ</code> en c9 : l’ADD de c8 les sépare.</li>
                <li>Les pointeurs ne sont modifiés qu’après les loads qui utilisent leur ancienne valeur.</li>
              </ul>
              <p>Il reste donc un seul NOP et neuf cycles pour huit instructions :</p>
              <p><strong><code>CPI = 9/8 = 1,125</code></strong>.</p>
              <p>Pourquoi ne peut-on faire huit cycles ? Avec deux loads en c1–c2, le MUL ne peut pas être avant c4. Son ADD ne peut alors pas être avant c8, et le branchement doit encore terminer l’itération en c9. Le neuvième cycle est donc un vrai minimum sans mélanger plusieurs itérations.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« En déplaçant les trois ADDUI dans les latences FP, il ne reste qu’un NOP. L’itération prend 9 cycles pour 8 instructions, soit <code>CPI=1,125</code>, et ce planning est minimal sans déroulement. »</strong></p>`,
            intuition: `<p>Le processeur attend déjà le résultat flottant ; autant utiliser cette attente pour avancer les pointeurs et le compteur. C’est comme préparer l’adresse du prochain colis pendant que la machine termine le colis courant. Un seul trou demeure parce qu’une itération ne contient pas assez de travail indépendant.</p>`,
            trap: `<p>Dans une seule itération, le gel restant est inévitable sous les contraintes données : les deux loads occupent deux cycles, le MUL ne peut être placé avant le cycle 4 et l’ADD avant le cycle 8. Le branchement doit ensuite terminer la boucle.</p>`
          },
          {
            n: "Q16",
            title: "Déroulement ×2 sans aucun stall",
            prompt: `<p><strong>Question 16 :</strong></p>
              <p>S’il reste des cycles de stall, déroulez la boucle du nombre de cycles nécessaires à les faire disparaître. Donnez le CPI de la boucle.</p>`,
            verbatim: true,
            sourcePage: 6,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>La Q15 laisse un cycle vide faute d’instruction indépendante dans une seule itération. En mettant deux itérations dans le même corps, on rend disponibles les loads et calculs de <code>i+1</code> pour remplir ce trou.</p>
              <h4>2. Préparation du déroulement</h4>
              <p>Une itération originale utilise <code>F0/F4</code>. La seconde doit utiliser <code>F6/F8</code> afin de ne pas écraser les opérandes ou le produit de la première. Les pointeurs et le compteur avancent deux fois avant le branchement unique.</p>
              <h4>3. Code ordonnancé sur deux itérations</h4>
<pre><code>loop2:
    L.D    F0, 0(R1)          # c1  : x[i]
    L.D    F4, 0(R2)          # c2  : y[i]
    ADDUI  R1, R1, 8          # c3
    MUL.D  F0, F0, F4         # c4
    ADDUI  R2, R2, 8          # c5

    L.D    F6, 0(R1)          # c6  : x[i+1]
    L.D    F8, 0(R2)          # c7  : y[i+1]
    ADD.D  F2, F2, F0         # c8
    MUL.D  F6, F6, F8         # c9

    ADDUI  R3, R3, -1         # c10
    ADDUI  R3, R3, -1         # c11
    ADDUI  R1, R1, 8          # c12
    ADD.D  F2, F2, F6         # c13
    ADDUI  R2, R2, 8          # c14
    BNEZ   R3, loop2          # c15</code></pre>
              <h4>4. Audit des latences</h4>
              <table>
                <thead><tr><th>Dépendance</th><th>Producteur</th><th>Consommateur</th><th>Cycles intercalés</th></tr></thead>
                <tbody>
                  <tr><td>Produit i</td><td>MUL c4</td><td>ADD c8</td><td>c5, c6, c7 : 3</td></tr>
                  <tr><td>Load y[i+1]</td><td>L.D c7</td><td>MUL c9</td><td>c8 : 1</td></tr>
                  <tr><td>Produit i+1</td><td>MUL c9</td><td>ADD c13</td><td>c10, c11, c12 : 3</td></tr>
                  <tr><td>Somme F2</td><td>ADD c8</td><td>ADD c13</td><td>c9 à c12 : 4</td></tr>
                  <tr><td>Compteur</td><td>dernier décrément c11</td><td>BNEZ c15</td><td>c12 à c14 : 3</td></tr>
                </tbody>
              </table>
              <p>Aucun NOP ne subsiste. Deux copies de la boucle originale auraient 16 instructions, mais le déroulement partage un seul branchement : il reste 15 instructions utiles exécutées en 15 cycles.</p>
              <p><strong><code>CPI = 15/15 = 1</code></strong>. Le coût par élément devient <code>15/2 = 7,5 cycles</code> dans cette version, contre 9 cycles par élément pour la boucle simplement réordonnée.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Je déroule par deux et renomme les registres FP de la deuxième itération en F6/F8. Les 15 instructions couvrent toutes les latences sans NOP : <code>CPI=1</code>. Cette boucle traite deux éléments et suppose un nombre d’éléments pair. »</strong></p>`,
            intuition: `<p>La première itération n’avait pas assez de tâches pour occuper toutes les cases du planning. En ouvrant aussi la boîte de l’itération suivante, on trouve exactement les loads indépendants qui remplissent ces cases, à condition d’étiqueter leurs registres différemment pour éviter les écrasements.</p>`,
            trap: `<p>Cette version suppose <code>n</code> pair ; pour un <code>n</code> impair, traiter un élément restant dans une boucle de nettoyage. Il faut aussi renommer les registres FP de la deuxième copie : réutiliser trop tôt <code>F0/F4</code> écraserait les valeurs encore nécessaires.</p>`
          },
          {
            n: "Q17",
            title: "Pipeline logiciel avec préchargement",
            prompt: `<p><strong>Question 17 :</strong></p>
              <p>Appliquez la technique du pipeline logiciel à la boucle originale pour en faire disparaitre les dépendances.</p>`,
            verbatim: true,
            sourcePage: 6,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Le pipeline logiciel mélange en permanence des opérations appartenant à des itérations différentes. On veut qu’après une courte phase de remplissage, chaque cycle du noyau contienne une instruction utile.</p>
              <h4>2. Découpage prologue – noyau – épilogue</h4>
              <p>Le <strong>prologue</strong> vérifie d’abord <code>n&gt;0</code>, charge <code>x[0]</code> dans <code>F0</code> et <code>y[0]</code> dans <code>F4</code>, initialise l’accumulateur <code>F2</code>, puis place <code>R3=n−1</code>. Le noyau peut alors multiplier l’élément courant tout en préchargeant le suivant.</p>
              <h4>3. Noyau en régime permanent</h4>
<pre><code>pipe:
    MUL.D  F6, F0, F4         # c1 : produit courant
    L.D    F0, 8(R1)          # c2 : x suivant
    L.D    F4, 8(R2)          # c3 : y suivant
    ADDUI  R1, R1, 8          # c4
    ADD.D  F2, F2, F6         # c5 : trois instructions après MUL
    ADDUI  R3, R3, -1         # c6
    ADDUI  R2, R2, 8          # c7 : sépare compteur et branchement
    BNEZ   R3, pipe           # c8</code></pre>
              <h4>4. Pourquoi le noyau ne gèle pas</h4>
              <ul>
                <li>Entre le MUL c1 et son ADD c5, les deux loads et l’incrément de <code>R1</code> fournissent trois cycles.</li>
                <li>Les valeurs chargées en c2–c3 ne sont consommées qu’au MUL c1 du tour suivant, donc leur latence est largement couverte.</li>
                <li>L’ADD de c5 et l’ADD du tour suivant sont espacés de huit cycles, ce qui respecte la récurrence sur <code>F2</code>.</li>
                <li>L’incrément de <code>R2</code> en c7 sépare le décrément c6 du branchement c8.</li>
              </ul>
              <p>Le noyau contient huit instructions en huit cycles : <strong><code>CPI=1</code></strong>. Il s’exécute <code>n−1</code> fois. Après son dernier tour, le dernier couple <code>x/y</code> est chargé mais pas encore calculé.</p>
              <h4>5. Épilogue</h4>
<pre><code>last:
    MUL.D  F6, F0, F4
    NOP
    NOP
    NOP
    ADD.D  F2, F2, F6
    NOP
    NOP
    S.D    F2, 0(Rresult)</code></pre>
              <p>Les NOP de l’épilogue ne contredisent pas le résultat : ils ne sont payés qu’une fois pour vider le pipeline, et non à chaque itération. Pour un grand <code>n</code>, leur coût moyen devient négligeable.</p>
              <p>Mini-exemple avec <code>n=3</code> : le prologue charge l’élément 0 ; les deux tours du noyau calculent 0 puis 1 tout en chargeant 1 puis 2 ; l’épilogue termine 2. Aucun élément n’est oublié ni lu après le tableau.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Le prologue précharge le premier élément, le noyau exécuté <code>n−1</code> fois multiplie le courant, charge le suivant et accumule sans stall, puis l’épilogue termine le dernier élément. Le CPI du régime permanent est 1. »</strong></p>`,
            intuition: `<p>Visualise une chaîne de montage : pendant qu’un produit est additionné au total, le suivant est multiplié et le troisième est amené depuis la mémoire. Le prologue remplit les postes, le noyau les garde tous occupés, puis l’épilogue laisse sortir les derniers produits déjà engagés.</p>`,
            trap: `<p>Une version naïve qui précharge toujours « l’élément suivant » lirait après la fin du tableau au dernier tour. La séparation en prologue, noyau <code>n−1</code> fois et épilogue évite cet accès hors limites. Le cas <code>n=0</code> doit être testé avant le prologue.</p>`
          }
        ]
      },
      {
        title: "Réseau sur puce Spidergon",
        theme: "Spidergon",
        context: `<h3>3 · Réseau sur puce (8 points)</h3>
          <p>Cet exercice porte sur le réseau dont la topologie, appelée Spidergone, est donnée à la figure 2. Les hypothèses sont les suivantes : un paquet qui va d’un routeur à l’un de ses voisins (directement connecté par un lien) met 1 cycle ; les connexions entre les nœuds (liens) sont des canaux bidirectionnels, chaque canal possédant une bande passante ”locale” notée <em>b</em>.</p>
          <p><strong>Figure 2 – Réseau de type Spidergone avec <em>N</em> = 12 nœuds.</strong></p>
          <p>La figure numérote les nœuds 0 à 11 autour de l’anneau et montre les liens entre voisins ainsi que les cordes opposées 0–6, 1–7, 2–8, 3–9, 4–10 et 5–11.</p>`,
        questions: [
          {
            n: "Q18",
            title: "Contrainte sur le nombre de nœuds",
            prompt: `<p><strong>Question 18 :</strong></p>
              <p>Quelle contrainte existe-t-il sur le nombre de nœuds <em>N</em> du réseau ;</p>`,
            verbatim: true,
            sourcePage: 7,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Un Spidergon ajoute à l’anneau un lien entre chaque nœud et son nœud diamétralement opposé. Il faut déterminer quand cette association est possible pour tous les nœuds.</p>
              <h4>2. Raisonnement</h4>
              <p>Numérotons les routeurs de <code>0</code> à <code>N−1</code>. L’opposé du nœud <code>i</code> est :</p>
              <p><code>(i + N/2) modulo N</code>.</p>
              <p>Cette expression doit désigner un numéro entier : <code>N/2</code> doit donc être entier. Autrement dit, les nœuds doivent former <code>N/2</code> paires opposées et :</p>
              <p><strong><code>N = 2m</code>, avec <code>m</code> entier.</strong></p>
              <p>Exemple à douze nœuds : les paires sont <code>(0,6)</code>, <code>(1,7)</code>, …, <code>(5,11)</code>. Avec onze nœuds, aucun nœud n’est exactement à un demi-tour entier.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Le nombre de nœuds doit être pair, <code>N=2m</code>, afin que chaque routeur possède un opposé unique relié par une corde. En pratique, <code>N≥4</code>. »</strong></p>`,
            intuition: `<p>Place les nœuds par couples face à face autour d’une horloge. Tant que le nombre total est pair, chacun trouve un partenaire de l’autre côté. Avec un nombre impair, la direction « un demi-tour plus loin » tombe entre deux nœuds.</p>`,
            trap: `<p>La contrainte générale est « pair », pas obligatoirement « puissance de deux » ni « multiple de quatre ». Les deux cas <code>N=4q</code> et <code>N=4q+2</code> seront distingués pour la moyenne.</p>`
          },
          {
            n: "Q19",
            title: "Nombre de liens et bande passante totale",
            prompt: `<p><strong>Question 19 :</strong></p>
              <p>Déterminez le nombre de liens <em>L</em> pour <em>N</em> = 12 et en déduire la bande passante totale du réseau. Donnez ensuite une expression analytique de <em>L</em> en fonction de <em>N</em> ;</p>`,
            verbatim: true,
            sourcePage: 7,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>On compte séparément les liens de l’anneau et les cordes opposées, puis on multiplie le nombre total de canaux par leur bande passante locale <code>b</code>.</p>
              <h4>2. Comptage des liens</h4>
              <ul>
                <li>L’anneau fermé reliant chaque nœud au suivant possède exactement <code>N</code> liens.</li>
                <li>Chaque nœud possède une connexion opposée, mais cette même corde est partagée par ses deux extrémités. Il y a donc <code>N/2</code> cordes, pas <code>N</code>.</li>
              </ul>
              <p>Ainsi :</p>
              <p><code>L = Lanneau + Lopposés = N + N/2 = </code><strong><code>3N/2</code></strong>.</p>
              <h4>3. Application à N=12</h4>
              <p><code>Lanneau=12</code> et <code>Lopposés=12/2=6</code>, donc :</p>
              <p><strong><code>L=12+6=18 liens</code></strong>.</p>
              <p>Chaque canal bidirectionnel offrant la capacité locale agrégée <code>b</code> :</p>
              <p><strong><code>Btotal(12)=18b</code></strong>, et en général <strong><code>Btotal(N)=3Nb/2</code></strong>.</p>
              <h4>4. Contrôle par les degrés</h4>
              <p>Chaque nœud touche trois voisins : gauche, droite et opposé. La somme des degrés vaut <code>3N</code>. Comme tout lien est compté à ses deux extrémités, <code>2L=3N</code>, donc <code>L=3N/2</code>. Les deux méthodes concordent.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Le Spidergon possède <code>N</code> liens d’anneau et <code>N/2</code> cordes, soit <code>L=3N/2</code>. Pour <code>N=12</code>, <code>L=18</code> et la bande passante totale vaut <code>18b</code>. »</strong></p>`,
            intuition: `<p>Le comptage par degré est un excellent réflexe de vérification : dessine trois « mains » par routeur, soit <code>3N</code> extrémités de lien. Deux mains forment toujours un même canal, donc on divise par deux.</p>`,
            trap: `<p>Ne pas compter chaque corde deux fois. Si le symbole <code>b</code> désigne une capacité <em>par direction</em> plutôt que par canal bidirectionnel, l’agrégat aller + retour serait le double ; il faut annoncer la convention.</p>`
          },
          {
            n: "Q20",
            title: "Bisection et diamètre",
            prompt: `<p><strong>Question 20 :</strong></p>
              <p>Quelle est la bande passante (<em>bisection bandwidth</em> qui passe sur les canaux traversés lorsque l’on coupe le réseau à 12 nœuds en deux parties égales ? Donnez en l’expression analytique en fonction de <em>N</em> ; Donnez le diamètre (le nombre de nœuds <em>hop count</em> qu’il faut traverser pour qu’un paquet voyage entre les nœuds les plus distants, incluant la source ou la destination), toujours sur cet exemple à 12 nœuds. Donnez un exemple de tel chemin (genre xx ↝ yy, ou xx et yy sont les numéros des nœuds). Exprimez le diamètre analytiquement ;</p>`,
            verbatim: true,
            sourcePage: 7,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>La question demande deux propriétés distinctes : la capacité traversant une coupe en deux moitiés et la plus grande des distances minimales entre deux routeurs.</p>
              <h4>2. Bande passante de la coupe attendue</h4>
              <p>La coupe géométrique suggérée par le dessin place <code>N/2</code> nœuds consécutifs de chaque côté. Elle traverse :</p>
              <ul>
                <li>les <code>N/2</code> cordes reliant chaque nœud à son opposé ;</li>
                <li>deux liens de l’anneau, un à chacune des deux frontières entre les moitiés.</li>
              </ul>
              <p>Nombre de canaux coupés : <code>N/2+2</code>. Comme chacun offre <code>b</code> :</p>
              <p><strong><code>Bbis=(N/2+2)·b</code></strong>.</p>
              <p>Pour <code>N=12</code> : <code>12/2+2=8</code>, donc <strong><code>Bbis=8b</code></strong>.</p>
              <h4>3. Distance minimale entre deux nœuds</h4>
              <p>Soit <code>d</code> leur séparation le long du plus court arc de l’anneau, avec <code>0≤d≤N/2</code>. Deux stratégies suffisent :</p>
              <ol>
                <li>rester sur l’anneau : coût <code>d</code> hops ;</li>
                <li>prendre une corde, coût 1, puis revenir depuis l’opposé de <code>N/2−d</code> positions : coût <code>1+N/2−d</code>.</li>
              </ol>
              <p>La distance minimale est donc :</p>
              <p><code>δ(d)=min(d, 1+N/2−d)</code>.</p>
              <h4>4. Diamètre</h4>
              <p>La première stratégie augmente avec <code>d</code>, la seconde diminue. Leur minimum est maximal près de leur point de croisement :</p>
              <p><code>d = 1+N/2−d</code>, soit <code>d=(N+2)/4</code>.</p>
              <p>Pour un nombre entier de hops, cela donne :</p>
              <p><strong><code>D=ceil(N/4)</code></strong>.</p>
              <p>Avec <code>N=12</code>, <code>D=ceil(3)=3 hops</code>. Par exemple <code>0→1→2→3</code> utilise trois liens ; <code>0→6→5→4</code> est un autre chemin maximal de trois liens.</p>
              <p>Contrôle : l’opposé 6 n’est pas le plus éloigné de 0, car la corde directe l’atteint en un seul hop. Les nœuds les plus difficiles sont près du quart de cercle.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« La coupe géométrique traverse <code>N/2+2</code> canaux, donc <code>Bbis=(N/2+2)b=8b</code> pour douze nœuds. La distance est <code>min(d,1+N/2−d)</code> et le diamètre vaut <code>ceil(N/4)=3 hops</code>. »</strong></p>`,
            intuition: `<p>Le raccourci opposé replie mentalement l’anneau en deux. Pour une cible proche, marcher autour du cercle reste le plus court ; après le quart de tour, traverser le diamètre puis revenir devient préférable. Le pire cas se situe exactement à la frontière entre ces deux choix.</p>`,
            trap: `<p>Deux conventions sont à séparer. Premièrement, le sujet dit « incluant la source <em>ou</em> la destination » : un chemin de trois liens est donc compté comme trois nœuds/hops. Si les deux extrémités étaient comptées, il aurait quatre nœuds. Deuxièmement, <code>(N/2+2)b</code> est la <strong>coupe géométrique contiguë attendue par le dessin</strong>. Au sens graph-théorique strict, où toute partition non contiguë est autorisée, <code>{0,1,2,6,7,8}</code> ne coupe que quatre canaux pour <code>N=12</code> ; le minimum vaut 4 canaux pour <code>N=4q</code> et 5 pour <code>N=4q+2</code>. En copie, donner d’abord <code>8b</code>, puis signaler cette convention si nécessaire.</p>`
          },
          {
            n: "Q21",
            title: "Distance moyenne",
            prompt: `<p><strong>Question 21 :</strong></p>
              <p>Donnez le nombre moyens de nœuds à traverser (distance moyenne) pour un paquet du réseau en supposant une équiprobabilité de répartition, d’abord pour le réseau à 12 nœuds puis en fonction de <em>N</em>. Par ex., on peut supposer que le nœud 0 envoie un paquet à chacun des autres nœuds du réseau.</p>`,
            verbatim: true,
            sourcePage: 7,
            answer: `<h4>1. Ce qu’on cherche</h4>
              <p>Grâce à la symétrie du Spidergon, il suffit de fixer la source 0, de trouver le plus court chemin vers chacun des <code>N−1</code> autres nœuds, puis de faire la moyenne.</p>
              <h4>2. Calcul pour N=12</h4>
              <table>
                <thead><tr><th>Distance</th><th>Destinations depuis 0</th><th>Contribution</th></tr></thead>
                <tbody>
                  <tr><td>1 hop</td><td>1, 6, 11</td><td><code>3·1=3</code></td></tr>
                  <tr><td>2 hops</td><td>2, 5, 7, 10</td><td><code>4·2=8</code></td></tr>
                  <tr><td>3 hops</td><td>3, 4, 8, 9</td><td><code>4·3=12</code></td></tr>
                </tbody>
              </table>
              <p>La somme vaut <code>3+8+12=23 hops</code>. Il y a onze destinations équiprobables :</p>
              <p><strong><code>d̄12 = 23/11 ≈ 2,091 hops</code></strong>.</p>
              <h4>3. Formule générale</h4>
              <p>Posons <code>m=N/2</code>. Pour une séparation <code>d</code>, la distance vaut <code>min(d,1+m−d)</code>. Pour chaque <code>d=1…m−1</code>, il existe deux destinations symétriques, une dans chaque sens. L’opposé <code>d=m</code> n’existe qu’une fois et se trouve à distance 1. Ainsi :</p>
              <p><code>S(N)=2·Σ[d=1…m−1] min(d,1+m−d)+1</code></p>
              <p>et, puisque la source ne s’envoie pas de paquet :</p>
              <p><strong><code>d̄=S(N)/(N−1)</code></strong>.</p>
              <h4>4. Formes fermées</h4>
              <p>La position du sommet de la suite change selon que <code>N/2</code> est pair ou impair :</p>
              <ul>
                <li>si <code>N=4q</code> : <strong><code>d̄ = (2q²+2q−1)/(4q−1)</code></strong> ;</li>
                <li>si <code>N=4q+2</code> : <strong><code>d̄ = (2q²+4q+1)/(4q+1)</code></strong>.</li>
              </ul>
              <p>Contrôle avec <code>N=12=4·3</code> : <code>q=3</code>, donc le numérateur vaut <code>2·3²+2·3−1=23</code> et le dénominateur <code>4·3−1=11</code>. On retrouve bien le décompte direct.</p>
              <h4>Conclusion à écrire sur la copie</h4>
              <p class="answer-conclusion"><strong>« Depuis 0, trois destinations sont à 1 hop, quatre à 2 et quatre à 3 : la moyenne vaut <code>(3+8+12)/11=23/11≈2,091</code>. En général, elle vaut <code>(2q²+2q−1)/(4q−1)</code> si <code>N=4q</code>, et <code>(2q²+4q+1)/(4q+1)</code> si <code>N=4q+2</code>. »</strong></p>`,
            intuition: `<p>Sur un anneau simple, la distance continuerait à augmenter jusqu’au nœud opposé. Ici, l’opposé est justement voisin grâce à la corde : la distance monte jusqu’au quart du cercle, puis redescend. Le tableau 3–4–4 montre visuellement cette « petite montagne » des distances à douze nœuds.</p>`,
            trap: `<p>Le dénominateur est <code>N−1</code>, car l’exemple envoie vers chacun des autres nœuds. Certaines références incluent aussi la destination égale à la source avec une distance nulle et divisent alors par <code>N</code> : pour douze nœuds, elles obtiennent <code>23/12</code>. Il faut annoncer la convention.</p>`
          }
        ]
      }
    ]
  }
];
