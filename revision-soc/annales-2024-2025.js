"use strict";

window.SOC_EXAMS_2024_2025 = [
  {
    year: "2025",
    label: "2024–2025",
    title: "Examen SEOC CEAMC — 22 janvier 2025",
    pdf: "../Ex-Annales/DS-3A-SEOC-S9-Conception-exploration-architectures-multi-coeurs-reseaux-sur-puces-2024-2025.pdf",
    intro: `<p><strong>Sujet sur 10 pages · deux parties de 12 points · calculatrice basique autorisée.</strong> Cette correction reprend les 25 questions dans leur ordre et leur formulation : ordonnancement d’une boucle RISC-V, renommage et élimination d’instructions, construction d’une MipMap, localité cache et précision en virgule fixe.</p>
      <p>Les questions mémoire ne précisent ni la politique d’écriture du cache ni l’alignement des tableaux. La correction donne donc séparément les défauts de lecture et les défauts d’écriture sous l’hypothèse usuelle d’un cache froid avec <em>write-allocate</em>. Ainsi, tu peux adapter immédiatement la réponse si le correcteur ne compte que les lectures.</p>`,
    sections: [
      {
        title: "1 · Ordonnancement de la fonction de hachage",
        theme: "Dépendances & IPC",
        context: `<p><strong>Données communes reproduites du sujet.</strong> La fonction calcule un hachage 64 bits en faisant le XOR des caractères ASCII placés aux mêmes positions modulo 8. La boucle RISC-V étudiée contient sept instructions :</p>
          <pre><code>I1  lbu   a4, 0(a5)          # c = *ptr
I2  addi  a2, a3, 8          # a2 = i + 8
I3  addi  a5, a5, 1          # ptr++
I4  sll   a4, a4, a3         # c = c &lt;&lt; i
I5  xor   a0, a0, a4         # hash = hash xor c
I6  andi  a3, a2, 63         # i = (i + 8) mod 64
I7  bne   a1, a5, .for_loop  # continuer si ptr != fin</code></pre>
          <p>On suppose chaque instruction exécutable en un cycle, une largeur matérielle illimitée et une prédiction de branchement parfaite. Deux instructions dépendantes ne peuvent pas être ordonnancées le même cycle.</p>`,
        questions: [
          {
            n: "1.1",
            title: "Types de dépendances via les registres",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 1.1:</strong> Rappelez les différents types de dépendances de données via les registres et ce qu’elles expriment.</p>`,
            answer: `<h4>1. Les trois dépendances à connaître</h4>
              <div class="table-scroll"><table class="compare-table"><thead><tr><th>Type</th><th>Nom</th><th>Ce qui doit rester ordonné</th><th>Nature</th></tr></thead><tbody>
                <tr><td><strong>RAW</strong></td><td><em>Read After Write</em></td><td>Une lecture attend l’écriture qui produit sa valeur.</td><td>Vraie dépendance, ou dépendance de flot.</td></tr>
                <tr><td><strong>WAR</strong></td><td><em>Write After Read</em></td><td>Une écriture ne doit pas écraser l’ancienne valeur avant sa lecture.</td><td>Anti-dépendance, liée au nom du registre.</td></tr>
                <tr><td><strong>WAW</strong></td><td><em>Write After Write</em></td><td>Deux écritures du même registre doivent rester dans l’ordre.</td><td>Dépendance de sortie, liée au nom.</td></tr>
              </tbody></table></div>
              <h4>2. Ce que le renommage peut supprimer</h4>
              <p>Seule RAW transporte réellement une valeur du producteur vers le consommateur. WAR et WAW apparaissent parce que plusieurs valeurs réutilisent le même nom architectural : des registres physiques distincts permettent de les supprimer. Deux lectures du même registre, RAR, ne créent aucune dépendance.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> RAW est une vraie dépendance et doit être respectée. WAR et WAW sont de fausses dépendances de nom, supprimables par renommage.</p>`,
            intuition: `<p>RAW signifie « j’attends ton résultat ». WAR et WAW signifient seulement « nous avons réutilisé la même étiquette de registre ».</p>`,
            trap: `<p>Ne pas présenter RAR comme un danger : deux instructions qui lisent la même valeur peuvent s’exécuter ensemble.</p>`
          },
          {
            n: "1.2",
            title: "Autres dépendances pouvant limiter la performance",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 1.2:</strong> Existe-t-il d’autres types de dépendances de données qui pourraient limiter la performance dans ce programme ? En général ?</p>`,
            answer: `<h4>1. Les dépendances mémoire</h4>
              <p>Oui. Deux instructions mémoire peuvent viser la même adresse alors que cette adresse n’est connue qu’après son calcul :</p>
              <ul><li><strong>store puis load</strong> : RAW mémoire, le load doit voir la valeur écrite ;</li><li><strong>load puis store</strong> : WAR mémoire, le store ne doit pas écraser trop tôt ;</li><li><strong>store puis store</strong> : WAW mémoire, la dernière écriture architecturale doit rester la dernière.</li></ul>
              <h4>2. Application à cette boucle</h4>
              <p>La boucle ne contient qu’un <code>lbu</code> et aucun store. Deux itérations lisent des caractères successifs : il n’existe donc pas de dépendance mémoire vraie entre elles. La progression de l’adresse reste toutefois contrainte par la RAW sur le registre pointeur <code>a5</code>.</p>
              <h4>3. Ne pas confondre dépendance et limitation</h4>
              <p>Un défaut de cache/TLB, la bande passante ou un manque d’unités fonctionnelles peuvent aussi réduire l’IPC, mais ce sont des contraintes de latence ou de ressources. La branche ajoute une dépendance de contrôle, explicitement ignorée en question 1.4.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Les autres dépendances de données sont les alias mémoire RAW/WAR/WAW. Elles sont absentes ici faute de store, mais importantes en général car les adresses peuvent être inconnues au moment de l’ordonnancement.</p>`,
            intuition: `<p>Deux registres identiques se voient tout de suite ; deux adresses mémoire identiques doivent souvent être calculées avant qu’on le sache.</p>`,
            trap: `<p>Les cache misses limitent la performance, mais ne constituent pas à eux seuls un quatrième type de dépendance de données.</p>`
          },
          {
            n: "1.3",
            title: "Graphe des dépendances de la boucle",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 1.3:</strong> Mettre en lumière les dépendances de données via les registres présentes dans la boucle du code assembleur (de <code>.for_loop</code> à <code>.empty_str</code>). Attention à ne pas oublier les dépendances entre plusieurs itérations de la boucle.</p>`,
            answer: `<h4>1. Registres lus et écrits</h4>
              <div class="table-scroll"><table class="compare-table"><thead><tr><th>ID</th><th>Instruction</th><th>Lit</th><th>Écrit</th></tr></thead><tbody>
                <tr><td>I1</td><td><code>lbu a4,0(a5)</code></td><td>a5</td><td>a4</td></tr><tr><td>I2</td><td><code>addi a2,a3,8</code></td><td>a3</td><td>a2</td></tr><tr><td>I3</td><td><code>addi a5,a5,1</code></td><td>a5</td><td>a5</td></tr><tr><td>I4</td><td><code>sll a4,a4,a3</code></td><td>a4, a3</td><td>a4</td></tr><tr><td>I5</td><td><code>xor a0,a0,a4</code></td><td>a0, a4</td><td>a0</td></tr><tr><td>I6</td><td><code>andi a3,a2,63</code></td><td>a2</td><td>a3</td></tr><tr><td>I7</td><td><code>bne a1,a5,...</code></td><td>a1, a5</td><td>—</td></tr>
              </tbody></table></div>
              <h4>2. Dans une même itération k</h4>
              <ul><li><code>I1 → I4</code> : RAW sur <code>a4</code>, et WAW car les deux écrivent aussi <code>a4</code>.</li><li><code>I4 → I5</code> : RAW sur <code>a4</code>.</li><li><code>I2 → I6</code> : RAW sur <code>a2</code> ; I2 lit aussi l’ancien <code>a3</code> avant I6, donc WAR sur <code>a3</code>.</li><li><code>I3 → I7</code> : RAW sur <code>a5</code>.</li><li><code>I1 → I3</code> : WAR sur <code>a5</code>.</li><li><code>I4 → I6</code> : WAR sur <code>a3</code>.</li></ul>
              <h4>3. Entre les itérations k et k+1</h4>
              <ul><li><code>I3ₖ → I1ₖ₊₁</code> et <code>I3ₖ → I3ₖ₊₁</code> : nouveau pointeur <code>a5</code>.</li><li><code>I6ₖ → I2ₖ₊₁</code> et <code>I6ₖ → I4ₖ₊₁</code> : nouvel indice de décalage <code>a3</code>. La première arête est aussi une WAR sur <code>a2</code>, lu par I6 avant d’être réécrit par I2.</li><li><code>I5ₖ → I5ₖ₊₁</code> : accumulation vraie du hash dans <code>a0</code>.</li><li><code>I5ₖ → I1ₖ₊₁</code> : WAR sur <code>a4</code>, car le XOR doit lire le caractère courant avant le prochain chargement.</li><li>On trouve aussi les WAW successives sur <code>a2</code>, <code>a3</code>, <code>a4</code>, <code>a5</code> et <code>a0</code>, ainsi que <code>I7ₖ → I3ₖ₊₁</code> en WAR sur <code>a5</code>.</li></ul>
              <h4>4. Récurrence qui commande le débit</h4>
              <pre><code>I1ₖ (lbu) ─RAW a4→ I4ₖ (sll) ─RAW a4→ I5ₖ (xor) ─WAR a4→ I1ₖ₊₁</code></pre>
              <p>Les arêtes transitives peuvent être omises d’un dessin, mais pas les dépendances inter-itérations.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Les trois récurrences vraies concernent le pointeur <code>a5</code>, l’indice <code>a3</code> et l’accumulateur <code>a0</code>. Avant renommage, la réutilisation de <code>a4</code> ajoute une récurrence de trois instructions.</p>`,
            intuition: `<p>Dérouler deux copies de la boucle côte à côte révèle immédiatement les flèches qui traversent la frontière d’itération.</p>`,
            trap: `<p>Ne pas s’arrêter aux dépendances écrites sur une seule itération : le pointeur, l’indice, le hash et le registre temporaire relient les itérations.</p>`
          },
          {
            n: "1.4",
            title: "IPC maximal avec toutes les dépendances",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 1.4:</strong> En considérant toutes les dépendances de données via les registres mises en lumière à la question précédente, et en considérant que chaque instruction requiert un seul cycle pour s’exécuter, quel est le parallélisme d’instructions présent dans la boucle de la fonction, en instructions par cycle (IPC), en admettant que la chaîne de caractères soit grande. Attention, on considère ici que deux instructions dépendantes ne peuvent jamais être ordonnancées dans le même cycle, même si certains designs pourraient se le permettre. On ignorera de plus les dépendances de controle (i.e., prédiction de branchement parfaite).</p>`,
            answer: `<h4>1. Trouver l’intervalle d’initiation</h4>
              <p>La chaîne <code>I1ₖ → I4ₖ → I5ₖ → I1ₖ₊₁</code> comporte trois arêtes de latence un cycle. Le prochain <code>lbu</code> ne peut donc commencer qu’après trois cycles : <strong><code>II = 3</code></strong>.</p>
              <h4>2. Montrer que II=3 est réalisable</h4>
              <div class="table-scroll"><table class="compare-table"><thead><tr><th>Cycle</th><th>Instructions exécutables ensemble</th></tr></thead><tbody><tr><td><code>3k+1</code></td><td>I1 <code>lbu</code> et I2 <code>addi a2</code></td></tr><tr><td><code>3k+2</code></td><td>I3 <code>addi a5</code> et I4 <code>sll</code></td></tr><tr><td><code>3k+3</code></td><td>I5 <code>xor</code>, I6 <code>andi</code> et I7 <code>bne</code></td></tr></tbody></table></div>
              <p>Ce planning respecte toutes les flèches, y compris les WAR et WAW.</p>
              <h4>3. Calculer l’IPC asymptotique</h4>
              <p>Une itération contient 7 instructions et une nouvelle itération démarre tous les 3 cycles :</p>
              <p class="formula"><code>IPC = 7 / 3 ≈ 2,33 instructions/cycle</code></p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le parallélisme maximal théorique est <strong>7/3 ≈ 2,33 IPC</strong>, sous les hypothèses idéales du sujet.</p>`,
            intuition: `<p>On ne divise pas simplement 7 par le nombre de lignes du code : on cherche la plus longue récurrence qui empêche de lancer l’itération suivante.</p>`,
            trap: `<p>Le résultat suppose des unités et une largeur d’émission illimitées. Il exprime le parallélisme du graphe, pas forcément l’IPC d’un processeur réel.</p>`
          },
          {
            n: "1.5",
            title: "Principe et matériel du renommage",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 1.5:</strong> Rappelez brièvement le principe du renommage de registres et ses avantages, les structures matérielles requises pour l’implémenter et leur(s) rôle(s).</p>`,
            answer: `<h4>1. Principe</h4>
              <p>Chaque écriture d’un registre architectural reçoit un nouveau registre physique. Les sources d’une instruction sont traduites avec la version courante, puis la destination obtient une nouvelle version. Plusieurs valeurs portant le même nom architectural peuvent ainsi coexister.</p>
              <h4>2. Déroulement au renommage</h4>
              <ol><li>Lire dans la <strong>Rename Map Table</strong> les registres physiques des sources.</li><li>Prendre un registre libre dans la <strong>Free List</strong> pour la destination.</li><li>Mémoriser l’ancien mapping pour le retrait ou la récupération.</li><li>Mettre la table à jour avec la nouvelle destination physique.</li></ol>
              <h4>3. Structures et rôles</h4>
              <ul><li><strong>RAT/Rename Map Table</strong> : logique → version physique spéculative.</li><li><strong>Free List</strong> : registres physiques disponibles.</li><li><strong>Physical Register File</strong> : valeurs de toutes les versions vivantes.</li><li><strong>Scoreboard/ready bits</strong> : disponibilité des opérandes.</li><li><strong>Instruction Queue</strong> : attente puis réveil des instructions prêtes.</li><li><strong>ROB/Active List</strong> : retrait en ordre, exceptions précises, libération de l’ancien mapping.</li><li><strong>Checkpoints ou journal</strong> : restauration de la RAT et de la Free List après un mauvais chemin.</li></ul>
              <h4>4. Avantages</h4>
              <p>WAR et WAW disparaissent, l’exécution hors ordre trouve davantage d’instructions indépendantes et les versions spéculatives restent séparées. Les RAW, elles, doivent toujours être respectées.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le renommage remplace des noms architecturaux réutilisés par des versions physiques uniques ; RAT, Free List, PRF, état de disponibilité et ROB assurent traduction, stockage, réveil, retrait et récupération.</p>`,
            intuition: `<p>Le registre architectural est le nom vu par le programme ; le registre physique est la feuille réellement utilisée pour une version précise de la valeur.</p>`,
            trap: `<p>Dire seulement « le renommage ajoute des registres » est insuffisant : il faut expliquer la table de correspondance, l’allocation et la récupération.</p>`
          },
          {
            n: "1.6 · Bonus",
            title: "IPC après suppression des fausses dépendances",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 1.6 (Bonus):</strong> Même question que 1.4, mais en ignorant les dépendances de données via les registres que le renommage de registres permet d’ignorer (on considère qu’on a un nombre infini de registres physiques à notre disposition).</p>`,
            answer: `<h4>1. Ce qui disparaît</h4>
              <p>Le renommage supprime les WAR et WAW. La chaîne artificielle passant par la réutilisation de <code>a4</code> ne limite donc plus le lancement des itérations.</p>
              <h4>2. Récurrence vraie restante</h4>
              <pre><code>I6ₖ (andi a3) ─RAW a3→ I2ₖ₊₁ (addi a2) ─RAW a2→ I6ₖ₊₁</code></pre>
              <p>Elle impose deux cycles : <strong><code>II = 2</code></strong>. Un planning périodique est possible :</p>
              <ul><li>cycle <code>2k+1</code> : I1ₖ, I2ₖ, I3ₖ et, en régime établi, I5ₖ₋₁ ;</li><li>cycle <code>2k+2</code> : I4ₖ, I6ₖ et I7ₖ.</li></ul>
              <h4>3. IPC</h4>
              <p class="formula"><code>IPC = 7 / 2 = 3,5 instructions/cycle</code></p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Avec un nombre infini de registres physiques, l’IPC théorique monte à <strong>3,5</strong>. La vraie récurrence de mise à jour de <code>i</code> empêche d’atteindre 7 IPC.</p>`,
            intuition: `<p>Renommer libère le temporaire <code>a4</code>, mais ne permet pas d’inventer le prochain indice avant d’avoir calculé l’actuel.</p>`,
            trap: `<p>Le renommage ne supprime jamais une RAW : annoncer une itération par cycle oublierait la récurrence <code>a3 → a2 → a3</code>.</p>`
          }
        ]
      },
      {
        title: "3 · MipMap : coût arithmétique",
        theme: "MipMap & complexité",
        context: `<p><strong>Données communes reproduites du sujet.</strong> Un niveau est filtré par le filtre séparable <code>f=(1/4, 1/2, 1/4)</code>. Deux passes appliquent d’abord <code>f</code> horizontalement, puis verticalement. La passe unique utilise :</p>
          <p class="formula"><code>F = [[1/16,1/8,1/16],[1/8,1/4,1/8],[1/16,1/8,1/16]] = fᵀ·f</code></p>
          <p>Pour produire <code>Pᵣ</code> depuis <code>Pᵣ₋₁</code>, on filtre puis on décime d’un facteur 2 dans chaque dimension. La version fusionnée calcule directement les sorties aux positions paires. Les bords et le calcul des indices sont ignorés.</p>`,
        questions: [
          {
            n: "P2 · Q1",
            title: "Opérations du filtrage en deux passes",
            verbatim: true,
            sourcePage: 7,
            prompt: `<p><strong>Question 1 :</strong><br>Pour une image de taille <code>tₓ × tᵧ</code>, donner le nombre d’additions et de multiplications pour appliquer le filtrage en deux passes.</p>`,
            answer: `<h4>1. Coût d’une passe 1D</h4>
              <p>Chaque pixel de sortie est la somme de 3 produits. Mathématiquement, cela représente <strong>3 multiplications et 2 additions</strong>. Une passe traite <code>N=tₓtᵧ</code> pixels.</p>
              <h4>2. Deux passes</h4>
              <p>La passe horizontale et la passe verticale ont le même coût :</p>
              <p class="formula"><code>Nmul = 2·3N = 6tₓtᵧ</code><br><code>Nadd = 2·2N = 4tₓtᵧ</code></p>
              <h4>3. Convention de comptage du pseudo-code</h4>
              <p>Si le professeur compte littéralement les trois opérations <code>acc += produit</code> à partir de zéro, il obtient 3 additions par passe, donc <code>6tₓtᵧ</code> additions. La convention algorithmique habituelle compte la somme de trois termes, soit deux additions ; il faut annoncer la convention.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Deux passes : <strong><code>6tₓtᵧ</code> multiplications et <code>4tₓtᵧ</code> additions</strong> ; ou <code>6tₓtᵧ</code> additions si l’initialisation de l’accumulateur est comptée comme un MAC complet.</p>`,
            intuition: `<p>Chaque passe touche tous les pixels et possède trois coefficients : on paie deux fois un filtre à trois taps.</p>`,
            trap: `<p>Ne pas compter la décimation ici : la question porte uniquement sur l’application du filtrage en deux passes.</p>`
          },
          {
            n: "P2 · Q2",
            title: "Opérations du filtrage en une passe",
            verbatim: true,
            sourcePage: 7,
            prompt: `<p><strong>Question 2 :</strong><br>Même question pour le filtrage en une passe.</p>`,
            answer: `<h4>1. Une fenêtre 3×3</h4>
              <p>Chaque sortie combine 9 pixels avec 9 coefficients : <strong>9 multiplications</strong>. Additionner 9 termes demande <strong>8 additions</strong>.</p>
              <h4>2. Toute l’image</h4>
              <p class="formula"><code>Nmul = 9tₓtᵧ</code><br><code>Nadd = 8tₓtᵧ</code></p>
              <p>La lecture littérale de neuf <code>acc +=</code> donne <code>9tₓtᵧ</code> additions si l’on compte aussi l’ajout du premier produit à zéro.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> La convolution 2D pleine demande <strong><code>9tₓtᵧ</code> multiplications</strong> et soit <strong><code>8tₓtᵧ</code> additions</strong> pour une somme de neuf termes, soit <strong><code>9tₓtᵧ</code></strong> en comptant littéralement les neuf <code>acc +=</code>.</p>`,
            intuition: `<p>Le filtre 2D matérialise les neuf combinaisons que la séparabilité permettait de factoriser en deux groupes de trois.</p>`,
            trap: `<p>Une passe ne signifie pas moins d’arithmétique : sans exploiter la séparabilité, le noyau contient neuf coefficients.</p>`
          },
          {
            n: "P2 · Q3",
            title: "Filtrer et décimer simultanément",
            verbatim: true,
            sourcePage: 7,
            prompt: `<p><strong>Question 3 :</strong><br>Même question mais pour le filtrage et décimation simultané.</p>`,
            answer: `<h4>1. Nombre de sorties réellement calculées</h4>
              <p>La décimation par 2 horizontalement et verticalement produit :</p>
              <p class="formula"><code>(tₓ/2)·(tᵧ/2) = tₓtᵧ/4</code> pixels</p>
              <h4>2. Coût par sortie et coût total</h4>
              <p>Chaque sortie conserve le noyau 3×3 : 9 multiplications et 8 additions.</p>
              <p class="formula"><code>Nmul = 9·tₓtᵧ/4</code><br><code>Nadd = 8·tₓtᵧ/4 = 2tₓtᵧ</code></p>
              <p>Avec la convention MAC depuis zéro, le second résultat devient <code>9tₓtᵧ/4</code> additions.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> La fusion évite de calculer les trois quarts des pixels ensuite jetés : <strong><code>(9/4)tₓtᵧ</code> multiplications</strong> et soit <strong><code>2tₓtᵧ</code> additions</strong>, soit <strong><code>(9/4)tₓtᵧ</code></strong> en comptant les <code>acc +=</code>.</p>`,
            intuition: `<p>On applique le même filtre, mais uniquement là où un pixel survivra à la décimation.</p>`,
            trap: `<p>Ne pas utiliser <code>tₓtᵧ/2</code> : diviser chaque dimension par deux divise la surface par quatre.</p>`
          }
        ]
      },
      {
        title: "2 · Élimination d’instructions au renommage",
        theme: "Renommage & élimination",
        context: `<p>Le processeur possède 31 registres logiques 64 bits <code>R1…R31</code> et <code>R0=0</code>. Ils sont implémentés par <code>p1…p127</code> plus <code>p0</code>, câblé à zéro, toujours prêt et absent de la Free List. Une instruction dont le résultat est prouvable égal à zéro peut être éliminée au renommage en associant sa destination à <code>p0</code>.</p>
          <pre><code>xor R1, R2, R2   # R1 = 0
and R1, R2, R0   # R1 = 0
or  R1, R0, R0   # R1 = 0</code></pre>`,
        questions: [
          {
            n: "2.1",
            title: "Avantages de l’élimination vers p0",
            verbatim: true,
            sourcePage: 4,
            prompt: `<p><strong>Question 2.1 :</strong> Quel(s) avantage(s) aura-t-on à éliminer les instructions que l’on peut prouver comme produisant toujours 0x0 dans l’étage de renommage ?</p>`,
            answer: `<h4>1. Résultat disponible immédiatement</h4>
              <p>La destination devient <code>p0</code>, dont la valeur zéro est permanente et dont le bit <em>ready</em> est toujours vrai. Il n’est donc même pas nécessaire d’attendre les opérandes de l’instruction éliminée.</p>
              <h4>2. Ressources économisées</h4>
              <ul><li>aucun nouveau registre physique alloué ;</li><li>aucune entrée dans l’Instruction Queue ;</li><li>aucun port ni cycle d’unité fonctionnelle ;</li><li>aucune écriture PRF et aucune diffusion de résultat ;</li><li>moins de réveils, de pression et d’énergie ;</li><li>les consommateurs de la destination voient immédiatement une source prête.</li></ul>
              <p>L’instruction consomme encore du débit de décodage/renommage et garde généralement une représentation minimale dans le ROB/Active List.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> L’élimination transforme le calcul en simple mise à jour de mapping : résultat immédiat, registre, ordonnanceur, exécution et diffusion économisés.</p>`,
            intuition: `<p>On ne calcule pas zéro : on donne directement aux consommateurs le registre matériel qui contient déjà toujours zéro.</p>`,
            trap: `<p>Une instruction éliminée n’est pas forcément effacée de tout le pipeline ; les questions suivantes expliquent pourquoi.</p>`
          },
          {
            n: "2.2",
            title: "Pourquoi l’instruction ne peut pas disparaître totalement",
            verbatim: true,
            sourcePage: 4,
            prompt: `<p><strong>Question 2.2 :</strong> Est-ce qu’une instruction éliminée peut complètement disparaître de toutes les structures du pipeline au renommage ? On pourra par exemple considérer la suite d’instructions suivante :</p>
              <pre><code>A:
add  R2, R4, R5     # R2 = R4 + R5
cbnz R2, B          # Saut vers B si R2 =! 0
xor  R3, R2, R2     # R3 = R2 xor R2 = 0x0; elim
...
B:
sub  R1, R2, R3     # R1 = R2 + R3</code></pre>
              <p>Est-il alors possible de faire complètement disparaître <code>xor R1, R2, R2</code> du pipeline au renommage ?</p>`,
            answer: `<h4>1. Non : il reste un effet spéculatif à annuler</h4>
              <p>Supposons la branche prédite non prise. Le <code>xor</code> est renommé et pose <code>RMT[R3]=p0</code>. Si la branche est finalement prise, ce <code>xor</code> appartient au mauvais chemin : le mapping de <code>R3</code> doit revenir à sa valeur antérieure. Sans trace, l’instruction située en B pourrait lire zéro alors que le <code>xor</code> n’aurait jamais dû exister.</p>
              <h4>2. Il faut également retirer dans l’ordre</h4>
              <p>Sur le bon chemin, l’ancien mapping de <code>R3</code> ne peut devenir recyclable qu’au retrait de l’instruction. Une entrée ROB/Active List — éventuellement très légère, marquée « éliminée et terminée » — conserve donc le registre logique et son ancien mapping.</p>
              <h4>3. Ce qui peut réellement disparaître</h4>
              <p>L’instruction peut éviter l’Instruction Queue, l’unité fonctionnelle, les lectures d’opérandes, l’écriture du PRF et le bus de résultat. Elle ne peut pas disparaître du mécanisme de retrait/récupération ou d’un journal équivalent.</p>
              <h4>4. Coquilles du sujet</h4>
              <p>Le code élimine <code>xor R3,R2,R2</code>, mais la dernière phrase écrit <code>xor R1,R2,R2</code>. Le commentaire de <code>sub</code> affiche aussi une addition et <code>=!</code> devrait être <code>!=</code>. Le raisonnement porte bien sur la production de <code>R3=0</code>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Non. Le calcul disparaît, mais une trace reste nécessaire pour libérer l’ancien mapping au bon moment et restaurer la RAT en cas de vidage.</p>`,
            intuition: `<p>Éliminer le travail n’élimine pas l’histoire : le processeur doit encore pouvoir dire « cette instruction était sur le mauvais chemin ».</p>`,
            trap: `<p>Ne corrige pas silencieusement la coquille : signale-la, puis indique clairement que tu analyses le <code>xor</code> sur <code>R3</code>.</p>`
          },
          {
            n: "2.3 · Bonus",
            title: "Support matériel, recyclage et réparation",
            verbatim: true,
            sourcePage: 4,
            prompt: `<p><strong>Question 2.3 (Bonus) :</strong> Est-ce qu’implémenter cette élimination dans notre microarchitecture requiert un support matériel particulier (par ex., nouvelles structures, nouveaux champs dans des structures existantes, nouveaux circuits, etc.) ? On pourra notamment chercher à répondre aux questions suivantes :</p>
              <ul><li>Quel impact sur l’algorithme assurant le recyclage des registres physiques ?</li><li>Quel impact sur la réparation des structures de l’étage de renommage lors d’un vidage de pipeline ?</li></ul>
              <p><small>¹ Les questions sont données à titre indicatif afin de guider votre réflexion. L’objectif est cependant de fournir une réponse à la Question 2.3 dans son entièreté.</small></p>`,
            answer: `<h4>1. Détection et chemin de renommage</h4>
              <p>Il faut une logique combinatoire qui reconnaît les idiomes zéro, choisit <code>p0</code> comme destination, inhibe l’allocation dans la Free List et transmet immédiatement <code>p0</code> aux consommateurs du même groupe de renommage.</p>
              <pre><code>old = RMT[Rd]
RMT[Rd] = p0
ROB = { Rd, old_pd=old, new_pd=p0,
        allocated=0, eliminated=1, complete=1 }</code></pre>
              <h4>2. Recyclage</h4>
              <p>Au retrait, l’ancien mapping devient libre s’il est différent de <code>p0</code>. <code>p0</code> ne doit jamais entrer dans la Free List :</p>
              <pre><code>si old_pd != p0 : FreeList.push(old_pd)</code></pre>
              <p>Exemple : <code>R1→p7</code>, puis un XOR éliminé donne <code>R1→p0</code>, puis une instruction normale donne <code>R1→p8</code>. Le retrait du XOR libère <code>p7</code> ; le retrait de l’instruction suivante ne « libère » jamais <code>p0</code>.</p>
              <h4>3. Vidage de pipeline</h4>
              <p>Dans une réparation par parcours inverse, restaurer <code>RMT[Rd]=old_pd</code>, mais ne pas restituer <code>p0</code> puisqu’aucun registre n’avait été alloué. Un bit <code>allocated</code>/<code>eliminated</code>, ou un test robuste de <code>new_pd==p0</code>, suffit souvent. Avec des checkpoints, la RAT et la Free List reviennent au snapshot, mais la logique doit accepter une destination n’ayant consommé aucune entrée libre.</p>
              <h4>4. Invariants particuliers de p0</h4>
              <ul><li>son bit de disponibilité reste toujours à 1 ;</li><li>aucune instruction ne l’écrit ;</li><li>plusieurs registres logiques peuvent pointer simultanément vers lui ;</li><li>il n’est jamais recyclé.</li></ul>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Aucune grosse structure nouvelle n’est obligatoire, mais il faut détection, multiplexage vers <code>p0</code>, marquage de l’entrée ROB et cas particuliers dans le recyclage et la récupération.</p>`,
            intuition: `<p><code>p0</code> est une ressource partagée permanente, pas un registre physique ordinaire qu’une seule destination posséderait.</p>`,
            trap: `<p>Ne jamais pousser <code>p0</code> dans la Free List, ni le marquer non prêt, même lorsqu’un registre logique qui le référençait est réécrit.</p>`
          }
        ]
      },
      {
        title: "4 · MipMap : étude des accès mémoire",
        theme: "Caches & localité",
        context: `<p><strong>Configuration exacte.</strong> <code>P₀</code> mesure 1024×1024, un pixel occupe 1 octet et <code>P₁</code> mesure 512×512. Le cache contient 32 Kio, ses lignes font 64 octets et il est associatif 16 voies : il possède donc <code>32768/(64·16)=32 ensembles</code>.</p>
          <p>Une ligne contient 64 pixels. Une ligne d’image de 1024 pixels occupe 16 lignes de cache. Le parcours selon <code>i</code> est contigu ; le parcours selon <code>j</code> fait un saut de 1024 octets. Ce pas vaut 16 lignes de cache : une colonne alterne donc principalement entre deux ensembles, ce qui explique le <em>thrashing</em> malgré les 16 voies.</p>
          <div class="warning"><strong>Convention nécessaire</strong>Le sujet ne donne ni politique d’écriture, ni adresses de base. Les résultats principaux supposent des tableaux distincts et alignés, un cache froid au début de chaque phase, LRU et <em>write-allocate</em>. Les tableaux donnent toujours « lectures », « écritures » et « total ». Si seuls les accès source sont demandés, prendre la colonne lectures.</div>`,
        questions: [
          {
            n: "P2 · Q4",
            title: "Défauts des deux passes et de la décimation",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 4 :</strong><br>Pour le calcul de <code>P₁</code> à partir de <code>P₀</code>, donner le nombre de défauts de cache pour chacune des parties de l’algorithme :</p><ul><li>Passe horizontale</li><li>Passe verticale</li><li>Décimation</li></ul>`,
            answer: `<h4>1. Quantités de base</h4>
              <p><code>N=1024²=1 048 576</code> pixels. Une image 1024² contient <code>N/64=16 384</code> lignes de cache. <code>P₁</code> contient <code>N/4=262 144</code> pixels, soit <code>4 096</code> lignes.</p>
              <h4>2. Passe horizontale, j extérieur puis i intérieur</h4>
              <p>Les trois pixels voisins sont contigus. Après le premier défaut, les suivants sont dans la même ligne ; chaque ligne de <code>P₀</code> est chargée une fois. L’écriture séquentielle de <code>P₀_H</code> alloue également chaque ligne une fois.</p>
              <p><code>lectures = 16 384</code>, <code>écritures = 16 384</code>, total <strong>32 768</strong>.</p>
              <h4>3. Passe verticale</h4>
              <p>À un instant, trois lignes source et une ligne destination suffisent, soit environ 4 Kio, bien moins que 32 Kio. Une ligne de <code>P₀_H</code> reste donc présente pour ses trois utilisations verticales.</p>
              <p><code>lectures = 16 384</code>, <code>écritures = 16 384</code>, total <strong>32 768</strong>.</p>
              <h4>4. Décimation</h4>
              <p>On lit une ligne source sur deux, mais dans chacune on prend un octet sur deux : cela touche quand même les 16 lignes de cache de la rangée. Donc <code>512·16=8 192</code> défauts source. Les écritures compactes de <code>P₁</code> allouent <code>262144/64=4 096</code> lignes.</p>
              <div class="table-scroll"><table class="compare-table"><thead><tr><th>Phase</th><th>Lecture source</th><th>Écriture destination</th><th>Total write-allocate</th></tr></thead><tbody><tr><td>Horizontale</td><td>16 384</td><td>16 384</td><td><strong>32 768</strong></td></tr><tr><td>Verticale</td><td>16 384</td><td>16 384</td><td><strong>32 768</strong></td></tr><tr><td>Décimation</td><td>8 192</td><td>4 096</td><td><strong>12 288</strong></td></tr></tbody></table></div>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Les défauts de lecture, indépendants de la politique d’écriture, sont <strong>16 384, 16 384 et 8 192</strong>. Sous l’hypothèse write-allocate annoncée : <strong>32 768, 32 768 et 12 288 défauts au total</strong>.</p>`,
            intuition: `<p>Lire un pixel sur deux ne divise pas les lignes de cache par deux : une ligne de 64 octets reste touchée dès qu’un seul de ses pixels est lu.</p>`,
            trap: `<p>Ne pas confondre 512 lignes d’image utilisées et 512 défauts : chaque rangée de 1024 pixels occupe 16 lignes de cache.</p>`
          },
          {
            n: "P2 · Q5",
            title: "Effet de la permutation des boucles i et j",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 5 :</strong><br>Après avoir constaté que l’on peut permuter les boucles en i et j de chacun des algorithme, sans que cela ne modifie le résultat, donner les défauts de cache pour les deux passes et la décimation.</p>`,
            answer: `<h4>1. Pourquoi la permutation détruit la localité</h4>
              <p>Avec <code>i</code> extérieur et <code>j</code> intérieur, deux pixels successifs d’une colonne sont séparés de 1024 octets, soit 16 lignes. Les 1024 rangées se répartissent surtout sur deux des 32 ensembles. Chaque ensemble devrait retenir environ 512 lignes, alors qu’il n’a que 16 voies : lorsque la colonne suivante commence, les lignes utiles ont été évincées.</p>
              <h4>2. Comptage principal, hors rares fenêtres coupant deux lignes</h4>
              <div class="table-scroll"><table class="compare-table"><thead><tr><th>Phase permutée</th><th>Lecture source</th><th>Écriture destination</th><th>Total</th></tr></thead><tbody><tr><td>Horizontale</td><td><code>N = 1 048 576</code></td><td><code>N = 1 048 576</code></td><td><strong>2 097 152</strong></td></tr><tr><td>Verticale</td><td><code>N = 1 048 576</code></td><td><code>N = 1 048 576</code></td><td><strong>2 097 152</strong></td></tr><tr><td>Décimation</td><td><code>N/4 = 262 144</code></td><td><code>N/4 = 262 144</code></td><td><strong>524 288</strong></td></tr></tbody></table></div>
              <p>Dans le filtre vertical, les trois rangées de la fenêtre se réutilisent immédiatement en avançant en <code>j</code> : on charge environ une nouvelle ligne source par sortie, et non trois. Dans la passe horizontale, les trois pixels d’une même fenêtre sont généralement dans la même ligne.</p>
              <h4>3. Raffinement exact aux frontières de 64 octets</h4>
              <p>Pour 30 colonnes intérieures par rangée (<code>i mod 64=0</code> ou 63), la fenêtre horizontale chevauche deux lignes. Les lectures horizontales deviennent <code>N+30·1024=1 079 296</code>, et son total <strong>2 127 872</strong>. Cette correction d’ordre <code>O(N)</code> est due aux frontières des lignes de cache et est souvent négligée dans le comptage principal.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Lectures seules : environ <strong>1 048 576, 1 048 576 et 262 144</strong>. Sous write-allocate, les totaux principaux sont <strong>2 097 152, 2 097 152 et 524 288</strong>.</p>`,
            intuition: `<p>Le tableau est rangé par lignes. Le parcourir par colonnes force le cache à garder un morceau de presque toutes les rangées en même temps.</p>`,
            trap: `<p>L’associativité 16 voies ne suffit pas : le pas de 1024 octets concentre les lignes d’une colonne dans seulement deux ensembles.</p>`
          },
          {
            n: "P2 · Q6",
            title: "Défauts du filtrage 2D en une passe",
            verbatim: true,
            sourcePage: 8,
            prompt: `<p><strong>Question 6 :</strong><br>Calculer le nombre de défauts de cache du filtrage en une passe</p>`,
            answer: `<h4>1. Fenêtre active</h4>
              <p>Le parcours reste <code>j</code> extérieur, <code>i</code> intérieur. Les neuf lectures concernent trois rangées voisines ; ces trois rangées, plus la rangée de sortie, occupent environ 4 Kio. Elles restent donc dans le cache pendant le balayage horizontal.</p>
              <h4>2. Chaque ligne n’est chargée qu’une fois</h4>
              <p>La lecture de <code>P₀</code> coûte <code>1024²/64 = 16 384</code> défauts. L’écriture séquentielle de <code>P₀_c</code> coûte également <code>16 384</code> allocations de ligne.</p>
              <p class="formula"><code>Nmiss = 16 384 + 16 384 = 32 768</code></p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> La réponse indépendante de la politique d’écriture est <strong>16 384 défauts de lecture</strong>. Avec write-allocate, les 16 384 allocations de sortie portent le total à <strong>32 768</strong>.</p>`,
            intuition: `<p>Neuf accès par sortie ne signifient pas neuf défauts : les mêmes lignes servent à de nombreuses fenêtres voisines.</p>`,
            trap: `<p>Multiplier le nombre de pixels par neuf ignorerait totalement les localités spatiale et temporelle.</p>`
          },
          {
            n: "P2 · Q7",
            title: "Filtrage 2D après permutation",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 7 :</strong><br>En observant que l’on peut permuter les deux premières boucles, donner le nombre de défauts de cache après cette permutation.</p>`,
            answer: `<h4>1. Parcours obtenu</h4>
              <p><code>i</code> devient extérieur et <code>j</code> intérieur. Dans une colonne, les trois rangées de la fenêtre se réutilisent immédiatement, mais les lignes de cette colonne ne survivent pas au parcours des 1024 rangées jusqu’à la colonne suivante.</p>
              <h4>2. Comptage</h4>
              <p>On a environ un nouveau défaut source et un défaut d’écriture par pixel :</p>
              <p class="formula"><code>lectures ≈ N = 1 048 576</code><br><code>écritures = N = 1 048 576</code><br><code>total ≈ 2N = 2 097 152</code></p>
              <p>Pour les 30 positions où la fenêtre horizontale chevauche deux lignes de 64 octets, le comptage raffiné donne <code>1 079 296</code> lectures et <strong>2 127 872</strong> au total.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Après permutation : environ <strong>1 048 576 défauts de lecture</strong>. Avec write-allocate : <strong>2 097 152 au total</strong>, ou 2 127 872 avec le raffinement des frontières de ligne.</p>`,
            intuition: `<p>La petite fenêtre verticale tient dans le cache, mais la localité horizontale de 64 pixels par ligne est perdue avant le retour à la colonne suivante.</p>`,
            trap: `<p>La permutation ne change pas le résultat mathématique, mais elle change radicalement l’ordre des adresses.</p>`
          },
          {
            n: "P2 · Q8",
            title: "Défauts du filtrage-décimation fusionné",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 8 :</strong><br>Calculer le nombre de défauts de cache de ce filtrage.</p>`,
            answer: `<h4>1. Sorties et couverture de l’entrée</h4>
              <p>On ne calcule que 512×512 sorties, mais les fenêtres centrées aux positions paires couvrent ensemble pratiquement toute l’image source : toutes ses 16 384 lignes de cache sont touchées. Deux lignes de sortie successives partagent une rangée source, qui reste dans le cache.</p>
              <h4>2. Écriture compacte</h4>
              <p><code>P₁</code> contient 262 144 octets, donc <code>262144/64=4 096</code> lignes à allouer.</p>
              <p class="formula"><code>Nmiss = 16 384 + 4 096 = 20 480</code></p>
              <p>Le pseudo-code du sujet échange <code>Pᵣₓ</code> et <code>Pᵣᵧ</code> dans les bornes de <code>i</code>/<code>j</code>. Cela est invisible ici parce que l’image est carrée ; pour une image rectangulaire, <code>j&lt;Pᵣᵧ</code> et <code>i&lt;Pᵣₓ</code>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le filtre provoque <strong>16 384 défauts de lecture</strong>. Sous write-allocate, les 4 096 allocations de la sortie portent le total à <strong>20 480</strong>.</p>`,
            intuition: `<p>La fusion supprime l’image intermédiaire et ses écritures, mais elle doit encore lire toutes les lignes source nécessaires aux fenêtres conservées.</p>`,
            trap: `<p>Ne pas diviser les défauts d’entrée par quatre : les centres sont espacés, mais leurs fenêtres 3×3 couvrent encore toutes les rangées et toutes les lignes.</p>`
          },
          {
            n: "P2 · Q9",
            title: "Filtrage-décimation fusionné après permutation",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 9 :</strong><br>En observant que l’on peut permuter les deux premières boucles, donner le nombre de défauts de cache après cette permutation.</p>`,
            answer: `<h4>1. Source lue par colonnes de sorties</h4>
              <p>Il existe 512 colonnes de sortie. Pour chacune, le balayage vertical touche environ une ligne de cache dans chacune des 1024 rangées source, soit <code>512·1024=N/2=524 288</code> défauts de lecture. Ces lignes ne survivent pas jusqu’à la colonne de sortie suivante.</p>
              <h4>2. Destination écrite par colonnes</h4>
              <p>Chaque écriture de <code>P₁(i,j)</code> est séparée de 512 octets de la suivante. Les lignes destinations sont elles aussi évincées avant réutilisation : <code>N/4=262 144</code> défauts d’écriture.</p>
              <p class="formula"><code>Nmiss ≈ N/2 + N/4 = 3N/4 = 786 432</code></p>
              <h4>3. Raffinement des fenêtres horizontales</h4>
              <p>Les centres source sont pairs. Quinze colonnes intérieures ont <code>2i mod 64=0</code> et chevauchent deux lignes source. Elles ajoutent <code>15·1024=15 360</code> lectures : <strong>539 648 lectures</strong> et <strong>801 792 défauts</strong> au total.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Après permutation : environ <strong>524 288 défauts de lecture</strong>. Sous write-allocate : <strong>786 432 au total</strong>, ou 801 792 avec les frontières internes de ligne.</p>`,
            intuition: `<p>La décimation réduit de moitié le nombre de colonnes parcourues, mais chaque colonne traverse toujours toute la hauteur de l’image source.</p>`,
            trap: `<p>Le résultat n’est pas <code>N/4</code> en lecture : chaque sortie observe trois rangées source, dont l’union couvre les 1024 rangées.</p>`
          },
          {
            n: "P2 · Q10",
            title: "Bilan : version optimale",
            verbatim: true,
            sourcePage: 9,
            prompt: `<p><strong>Question 10 :</strong></p><ul><li>Quelle est la version de l’algorithme qui permet de minimiser le nombre de défauts de cache ?</li><li>Quelle est la version de l’algorithme qui permet de minimiser le nombre d’opérations arithmétiques ?</li></ul>`,
            answer: `<h4>1. Minimum de défauts de cache</h4>
              <p>En conservant l’ordre <code>j</code> extérieur / <code>i</code> intérieur :</p>
              <ul><li>deux passes puis décimation : <code>32 768 + 32 768 + 12 288 = 77 824</code> défauts ;</li><li>une passe pleine puis décimation : <code>32 768 + 12 288 = 45 056</code> défauts ;</li><li>filtrage et décimation fusionnés : <strong>20 480</strong> défauts.</li></ul>
              <p>Ce sont les totaux write-allocate. En lecture seule, les trois résultats sont respectivement <code>40 960</code>, <code>24 576</code> et <strong>16 384</strong> : le classement ne change pas. La version fusionnée évite les grandes images intermédiaires. Les variantes permutées sont nettement pires à cause du parcours en colonnes.</p>
              <h4>2. Minimum d’opérations</h4>
              <p>Pour <code>N=tₓtᵧ</code> pixels :</p>
              <ul><li>deux passes : <code>6N</code> multiplications et <code>4N</code> additions ;</li><li>une passe pleine : <code>9N</code> multiplications et <code>8N</code> additions ;</li><li>fusion : <strong><code>9N/4</code> multiplications et <code>2N</code> additions</strong>.</li></ul>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> La meilleure version sur les deux critères est le <strong>filtrage 2D avec décimation simultanée, parcouru ligne par ligne</strong>.</p>`,
            intuition: `<p>Le meilleur résultat vient moins d’un filtre moins cher que du fait de ne calculer, écrire et relire aucun pixel destiné à être jeté.</p>`,
            trap: `<p>Préciser l’ordre des boucles : la même formule fusionnée parcourue par colonnes perd une grande partie de son avantage cache.</p>`
          }
        ]
      },
      {
        title: "5 · MipMap : calcul de précision",
        theme: "Virgule fixe",
        context: `<p><strong>Notation du sujet.</strong> Un format non signé <code>(n,e,v)</code> possède <code>n=e+v</code> bits : <code>e</code> bits à gauche de la virgule et <code>v</code> bits fractionnaires. Les pixels d’entrée sont des entiers non signés 8 bits, donc <code>(8,8,0)</code>.</p>
          <p>Règles du cours : une multiplication additionne les nombres de bits entiers et fractionnaires ; une somme de <code>m</code> termes de même format demande <code>ceil(log₂m)</code> bits de garde entiers. La correction donne le format conservateur attendu, puis le format serré possible en exploitant que les coefficients positifs somment à 1.</p>`,
        questions: [
          {
            n: "P2 · Q11",
            title: "Format des coefficients du filtre f",
            verbatim: true,
            sourcePage: 10,
            prompt: `<p><strong>Question 11 :</strong><br>Quel est le format des coefficients du filtre <code>f</code> ?</p>`,
            answer: `<h4>1. Écriture binaire exacte</h4>
              <p><code>1/4 = 0,01₂</code> et <code>1/2 = 0,10₂</code>. Deux bits fractionnaires suffisent et aucun bit entier n’est nécessaire puisque tous les coefficients sont strictement inférieurs à 1.</p>
              <p class="formula"><code>f : (n,e,v) = (2,0,2)</code></p>
              <h4>2. Représentation entière sous-jacente</h4>
              <p>Avec le facteur d’échelle <code>2⁻²</code>, les trois codes stockés sont <code>[1,2,1]</code>. Leur interprétation donne exactement <code>[1/4,1/2,1/4]</code>.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Les coefficients de <code>f</code> ont le format commun minimal exact <strong><code>(2,0,2)</code></strong>.</p>`,
            intuition: `<p>On choisit assez de bits pour représenter le plus petit pas, ici un quart : deux bits après la virgule.</p>`,
            trap: `<p>Ne pas écrire <code>(3,1,2)</code> par réflexe : en non-signé, le format autorise <code>e=0</code> pour des nombres tous inférieurs à 1.</p>`
          },
          {
            n: "P2 · Q12",
            title: "Formats après les deux passes",
            verbatim: true,
            sourcePage: 10,
            prompt: `<p><strong>Question 12 :</strong><br>En reprenant la notation de la section 1.4, après la première passe, quel sont les format des données de <code>Pₛ_H</code> et de <code>Pₛ_V</code> si on souhaite conserver toute la précision des calculs ?</p>`,
            answer: `<h4>1. Passe horizontale</h4>
              <p>Un pixel <code>(8,8,0)</code> multiplié par un coefficient <code>(2,0,2)</code> produit :</p>
              <p><code>(8+2, 8+0, 0+2) = (10,8,2)</code>.</p>
              <p>Il faut sommer 3 produits. <code>ceil(log₂3)=2</code> bits de garde entiers :</p>
              <p class="formula"><code>Pₛ_H : (12,10,2)</code></p>
              <h4>2. Passe verticale</h4>
              <p>Chaque produit <code>Pₛ_H·f</code> vaut <code>(12+2,10+0,2+2)=(14,10,4)</code>. La somme de trois produits ajoute deux bits de garde :</p>
              <p class="formula"><code>Pₛ_V : (16,12,4)</code></p>
              <h4>3. Nuance de dynamique</h4>
              <p>Ces formats sont les formats conservateurs obtenus avec les règles génériques du cours. Comme les coefficients sont positifs et somment à 1, la valeur réelle reste entre 0 et 255. Une analyse serrée permettrait <code>Pₛ_H=(10,8,2)</code> et <code>Pₛ_V=(12,8,4)</code>, sans changer les bits finaux à conserver.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Réponse attendue par croissance systématique : <strong><code>Pₛ_H=(12,10,2)</code></strong> puis <strong><code>Pₛ_V=(16,12,4)</code></strong>.</p>`,
            intuition: `<p>Chaque passage par le filtre ajoute deux bits fractionnaires ; chaque somme de trois termes réserve deux bits de retenue.</p>`,
            trap: `<p>Ne pas remettre l’intermédiaire sur 8 bits entre les passes si la question exige de conserver toute la précision.</p>`
          },
          {
            n: "P2 · Q13",
            title: "Huit bits à conserver après deux passes",
            verbatim: true,
            sourcePage: 10,
            prompt: `<p><strong>Question 13 :</strong><br>Comme la pyramide doit être stockée en mémoire dans un tableau de mots de 8 bits, quels sont les bits de <code>Pₛ_V</code> à conserver ?</p>`,
            answer: `<h4>1. Localiser la virgule</h4>
              <p>Dans <code>Pₛ_V=(16,12,4)</code>, les bits physiques <code>[3:0]</code> représentent la fraction. Les bits <code>[15:4]</code> représentent la partie entière.</p>
              <h4>2. Sélectionner les poids 2⁷ à 2⁰</h4>
              <p>Le résultat 8 bits doit garder les huit bits entiers utiles : ce sont <strong>les bits <code>[11:4]</code></strong> du mot 16 bits.</p>
              <pre><code>résultat8 = (P_s_V_brut &gt;&gt; 4) &amp; 0xFF</code></pre>
              <p>Les bits <code>[3:0]</code> sont supprimés par troncature. Les gardes <code>[15:12]</code> restent nuls pour ce filtre normalisé et des pixels compris entre 0 et 255. Pour un arrondi au plus proche, on ajouterait <code>2³=8</code> avant le décalage.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Conserver <strong><code>Pₛ_V[11:4]</code></strong> pour produire le pixel <code>(8,8,0)</code>.</p>`,
            intuition: `<p>Quatre bits fractionnaires signifient d’abord un décalage à droite de quatre positions ; on prélève ensuite les huit bits de poids utile.</p>`,
            trap: `<p>Garder <code>[7:0]</code> conserverait quatre bits fractionnaires et seulement quatre bits entiers : ce ne serait pas un pixel 8 bits ordinaire.</p>`
          },
          {
            n: "P2 · Q14",
            title: "Format des coefficients du filtre F",
            verbatim: true,
            sourcePage: 10,
            prompt: `<p><strong>Question 14 :</strong><br>Quel est le format des coefficients du filtre <code>F</code> ?</p>`,
            answer: `<h4>1. Plus petit coefficient</h4>
              <p><code>1/16=0,0001₂</code>, <code>1/8=0,0010₂</code> et <code>1/4=0,0100₂</code>. Quatre bits fractionnaires représentent exactement tous les coefficients.</p>
              <p class="formula"><code>F : (n,e,v) = (4,0,4)</code></p>
              <h4>2. Codes stockés</h4>
              <pre><code>échelle 2^-4 :
[ [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1] ]</code></pre>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Le format commun minimal exact de <code>F</code> est <strong><code>(4,0,4)</code></strong>.</p>`,
            intuition: `<p>Le noyau 2D est le produit des deux filtres 1D : deux bits fractionnaires plus deux bits fractionnaires donnent quatre.</p>`,
            trap: `<p>Le coefficient maximal 1/4 ne suffit pas à choisir le format : il faut aussi représenter exactement le plus petit, 1/16.</p>`
          },
          {
            n: "P2 · Q15",
            title: "Format et extraction après la passe unique",
            verbatim: true,
            sourcePage: 10,
            prompt: `<p><strong>Question 15 :</strong><br>Pour cette unique passe, quel est le format de <code>O(i,j)</code> et quels sont les 8 bits à conserver après le calcul de l’accumulation ?</p>`,
            answer: `<h4>1. Format d’un produit</h4>
              <p><code>(8,8,0) × (4,0,4) = (12,8,4)</code>.</p>
              <h4>2. Accumulation de neuf produits</h4>
              <p><code>ceil(log₂9)=4</code> bits de garde entiers sont nécessaires avec la règle conservatrice :</p>
              <p class="formula"><code>O(i,j) : (16,12,4)</code></p>
              <h4>3. Retour à huit bits</h4>
              <p>Comme en question 13, garder les poids <code>2⁷…2⁰</code>, donc <strong><code>O[11:4]</code></strong>. Le calcul équivaut à <code>(O_brut &gt;&gt; 4) &amp; 0xFF</code>.</p>
              <p>En exploitant <code>ΣF=1</code>, un accumulateur serré <code>(12,8,4)</code> suffit en dynamique réelle ; la tranche finale reste exactement la même.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Format conservateur <strong><code>(16,12,4)</code></strong> et bits à stocker <strong><code>[11:4]</code></strong>.</p>`,
            intuition: `<p>Les neuf coefficients possèdent déjà le même facteur 1/16 : l’accumulateur garde quatre bits après la virgule jusqu’à la conversion finale.</p>`,
            trap: `<p>Ne pas ajouter neuf bits de garde : la somme de neuf termes exige quatre bits, car <code>2⁴≥9</code>.</p>`
          },
          {
            n: "P2 · Q16",
            title: "Algorithme au bruit de calcul le plus faible",
            verbatim: true,
            sourcePage: 10,
            prompt: `<p><strong>Question 16 :</strong><br>De façon qualitative, quel est l’algorithme qui a le bruit de calcul le plus faible ?</p>`,
            answer: `<h4>1. Réponse stricte avec les hypothèses précédentes</h4>
              <p>Si <code>Pₛ_H</code> conserve réellement toute sa précision, les deux méthodes ont le <strong>même bruit final</strong>. En effet <code>F=fᵀf</code>, les coefficients sont des puissances de deux exactes et :</p>
              <p class="formula"><code>Σₗ f(l)·[Σₖ I·f(k)] = Σₖ,ₗ I·F(k,l)</code></p>
              <p>Les deux chemins produisent le même numérateur entier à l’échelle <code>1/16</code>, puis effectuent la même troncature finale <code>[11:4]</code>.</p>
              <h4>2. Réponse pratique si l’intermédiaire est ramené à 8 bits</h4>
              <p>Si l’image horizontale doit être stockée sur 8 bits, la méthode deux passes tronque une première fois après l’horizontale, puis une seconde fois à la fin. La passe unique ne tronque qu’à la fin : elle possède alors le <strong>bruit le plus faible</strong> et évite un biais supplémentaire vers le bas.</p>
              <p class="answer-conclusion"><strong>Conclusion de copie.</strong> Avec la pleine précision explicitement demandée en Q12 : <strong>bruit identique</strong>. Avec un tampon intermédiaire 8 bits — cas matériel courant — : <strong>la passe unique est moins bruitée</strong>.</p>`,
            intuition: `<p>Le bruit apparaît quand on jette des bits, pas simplement quand on découpe une formule mathématique en deux étapes.</p>`,
            trap: `<p>Énoncer « une passe » sans préciser la largeur de <code>Pₛ_H</code> oublie que, sans troncature intermédiaire, les deux calculs sont exactement équivalents.</p>`
          }
        ]
      }
    ]
  }
];

// Les blocs sont maintenus séparément pour faciliter les audits ; l’affichage
// reprend toujours l’ordre exact du sujet, quelle que soit leur position source.
window.SOC_EXAMS_2024_2025.forEach((exam) => {
  exam.sections.sort((left, right) => Number.parseInt(left.title, 10) - Number.parseInt(right.title, 10));
});
