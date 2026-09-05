"use strict";

window.SOC_EXAMS_MODERN = [
  {
    year: "2021",
    title: "Examen Archi 3A — 2020/2021 · Renommage de registres",
    pdf: "../Ex-Annales/Partie2_2021.pdf",
    intro: `<p>Cette partie étudie deux optimisations réalisées directement au renommage dans une machine out-of-order : produire zéro sans exécuter l’instruction, puis supprimer une copie en faisant partager un registre physique. Le cœur du sujet n’est pas seulement le gain de performance : il faut préserver le retrait en ordre, le recyclage des registres et la récupération après une mauvaise prédiction.</p>`,
    sections: [
      {
        title: "1 · Zero-idiom Elimination",
        theme: "Renommage",
        context: `<div class="exam-source-context">
<p>On se place dans le contexte d’un jeu d’instruction définissant 31 registres généralistes 64-bit (<code>R1</code> à <code>R31</code>). Le jeu d’instruction définit de plus un registre 64-bit valant toujours <code>0x0</code>, <code>R0</code>.</p>
<p>On possède un processeur implémentant cette architecture via une microarchitecture à exécution dans le désordre. Les structures nécessaires à l’exécution correcte et efficace des instructions sont donc déjà présentes : <em>Rename Map Table</em>, <em>Scoreboard</em>, <em>Active List</em>, <em>Free List</em>, <em>Physical Register File</em> (fichier de registres) <em>Reorder Buffer</em>, <em>Instruction Queue</em> (ordonnanceur) et <em>Load/Store Queue</em>.</p>
<p>Dans cette microarchitecture, le fichier de registres possède 127 registres physiques <code>p1</code> à <code>p127</code>, auquel on ajoute un unique registre cablé à <code>0x0</code>, <code>p0</code> afin d’implémenter le registre logique <code>R0</code>. En particulier, une instruction utilisant <code>R0</code> comme opérande (source ou destination) renommera toujours <code>R0</code> par <code>p0</code>. Cela signifie notamment que <code>p0</code> ne fait pas partie de la <em>Free List</em>, et que le registre <code>p0</code> est toujours prêt dans le <em>Scoreboard</em>, car sa valeur courante est toujours <code>0x0</code>.</p>
<p>On souhaite améliorer la performance de la microarchitecture existante en tirant parti du renommage de registre. En particulier, on remarque qu’il est possible de calculer le résultat de certaines instructions sans les exécuter, mais en manipulant l’association des registres physiques aux registres logiques.</p>
<h4>1.1 “Zero-idiom Elimination”</h4>
<p>Dans un premier temps, on remarque que les instructions pour lesquelles on peut prouver que le résultat généré vaut <code>0x0</code> simplement via l’instruction et le nom de ses opérandes (registres architecturaux) peut “s’éliminer” (i.e., n’a pas besoin d’être ordonnancée et exécutée) à l’étage de renommage en renommant le registre logique de destination par <code>p0</code>. Quelques exemples où renommer <code>R1</code> par <code>p0</code> permet d’exécuter l’instruction au renommage :</p>
<pre><code>xor  R1, R2, R2    # R1 = R2 xor R2 = 0x0
and  R1, R2, R0    # R1 = R2 and 0x0 = 0x0
or   R1, R0, R0    # R1 = 0x0 or 0x0 = 0x0</code></pre>
</div>`,
        questions: [
          {
            n: "1.1",
            title: "Pourquoi produire zéro au renommage ?",
            verbatim: true,
            sourcePage: 1,
            prompt: `<p><strong>Question 1.1 :</strong> Quel(s) avantage(s) aura-t-on à éliminer les instructions que l’on peut prouver comme produisant toujours <code>0x0</code> dans l’étage de renommage ?</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut montrer que la <em>zero-idiom elimination</em> n’est pas seulement une simplification algébrique : reconnaître le résultat au renommage supprime du travail dans presque tout le backend, tout en produisant exactement la valeur architecturale attendue.</p>

<h4>État initial et notation</h4>
<p>La <strong>RMT</strong> (<em>Rename Map Table</em>) associe chaque registre architectural à sa version physique courante. La <strong>Free List</strong> contient les registres physiques disponibles. On réserve ici <code>p0</code> comme registre physique constant : sa valeur vaut toujours zéro, son bit <em>ready</em> est toujours vrai et il ne doit jamais être recyclé.</p>
<p>Pour une instruction <code>xor Rd,Rs,Rs</code>, le résultat est nul quelle que soit la valeur de <code>Rs</code>. Le détecteur utilise donc l’opcode et l’égalité des noms de sources ; il n’a pas besoin de lire leurs données.</p>

<h4>Raisonnement étape par étape</h4>
<p>Le renommage peut effectuer directement l’association suivante :</p>
<pre><code>ancienne destination = RMT[Rd]
RMT[Rd] = p0</code></pre>
<ol>
  <li>Le matériel vérifie que l’instruction appartient à la liste sûre des identités donnant zéro et qu’elle n’a aucun autre effet architectural à préserver.</li>
  <li>Il lit l’ancienne association de <code>Rd</code>, car elle servira au retrait ou à une récupération.</li>
  <li>Il écrit <code>RMT[Rd]=p0</code> sans retirer de registre de la Free List.</li>
  <li>Les instructions suivantes qui lisent <code>Rd</code> reçoivent le tag <code>p0</code>, immédiatement disponible.</li>
  <li>L’instruction peut être déclarée terminée pour le suivi en ordre, mais elle ne passe ni par l’ordonnanceur ni par une unité fonctionnelle.</li>
</ol>
<p>Comme <code>p0</code> contient toujours zéro et que son bit de disponibilité est toujours vrai, le résultat architectural est connu sans attendre ni lire les autres opérandes.</p>
<ul>
  <li>Aucun nouveau registre physique n’est retiré de la Free List : la pression sur les registres physiques diminue.</li>
  <li>L’instruction n’occupe pas l’Instruction Queue ou une station de réservation pour son exécution.</li>
  <li>Elle ne consomme ni unité fonctionnelle, ni port d’écriture du fichier de registres, ni bande passante de diffusion du résultat.</li>
  <li>Elle économise de l’énergie dans l’ordonnanceur, les unités d’exécution et le réseau de réveil.</li>
  <li>Les consommateurs reçoivent immédiatement le tag <code>p0</code>, déjà prêt. La chaîne de dépendances est donc raccourcie.</li>
  <li>Une expression comme <code>R2 xor R2</code> n’a même pas à attendre que la valeur de <code>R2</code> soit disponible : le résultat dépend du nom identique des opérandes, pas de leur valeur.</li>
</ul>
<h4>Mini-exemple de contrôle</h4>
<p>Supposons <code>RMT[R1]=p17</code> et <code>RMT[R2]=p42</code>, avec <code>p42</code> encore non prêt. Après <code>xor R1,R2,R2</code>, on obtient immédiatement <code>RMT[R1]=p0</code>. Une instruction suivante <code>add R3,R1,R4</code> reçoit zéro pour son premier opérande sans attendre <code>p42</code>. <code>p17</code> n’est toutefois libéré que lorsque le changement de mapping devient sûr au retrait.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> La zero-idiom elimination remplace au renommage la destination par le registre constant prêt <code>p0</code>. Elle évite allocation, attente, exécution et write-back, raccourcit les RAW des consommateurs et réduit énergie et pression sur la fenêtre ; il faut néanmoins conserver assez d’information pour retirer ou annuler correctement le changement de mapping.</p>`,
            intuition: `<p>Au lieu de calculer zéro, on donne au registre logique l’adresse de l’unique zéro déjà présent dans la machine.</p>`,
            trap: `<p>« Éliminée » ne signifie pas forcément « invisible à tout le pipeline ». L’instruction peut éviter l’exécution, mais son changement de renommage doit encore être retiré ou annulé proprement.</p>`
          },
          {
            n: "1.2",
            title: "Une instruction éliminée peut-elle disparaître ?",
            verbatim: true,
            sourcePage: 1,
            prompt: `<p><strong>Question 1.2 :</strong> Est-ce qu’une instruction éliminée peut complètement disparaître de toutes les structures du pipeline au renommage ? On pourra par exemple considérer la suite d’instructions suivante :</p>
<pre><code>A:
    add  R2, R4, R5    # R2 = R4 + R5
    cbnz R2, B          # Saut vers B si R2 =! 0
    xor  R3, R2, R2    # R3 = R2 xor R2 = 0x0; elim
    ...
B:
    sub  R1, R2, R3    # R1 = R2 + R3</code></pre>
<p>Est-il alors possible de faire complètement disparaître <code>xor R1, R2, R2</code> du pipeline au renommage ?</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>La question vérifie que l’on distingue <strong>supprimer l’exécution</strong> d’une instruction et <strong>supprimer toute trace de son effet spéculatif</strong>. La première opération est possible ; la seconde empêcherait une récupération correcte.</p>

<h4>État initial : branche, mapping et checkpoint</h4>
<p>Notons <code>p_old</code> l’association de <code>R3</code> juste avant le branchement. Le processeur prédit <code>cbnz</code> non pris et continue donc sur le chemin contenant le <code>xor</code>. Un checkpoint pris autour de la branche, ou un journal de renommage équivalent, représente encore l’état où <code>R3→p_old</code>.</p>
<p><strong>Réponse courte :</strong> non, l’instruction ne peut pas disparaître sans conserver une information équivalente dans une autre structure.</p>

<h4>Déroulement pas à pas de la mauvaise prédiction</h4>
<ol>
  <li>Avant le <code>xor</code>, la RMT contient <code>R3→p_old</code>.</li>
  <li>Sur le chemin prédit, le <code>xor</code> est reconnu et modifie spéculativement la table :</li>
</ol>
<pre><code>RMT[R3] = p0</code></pre>
<ol start="3">
  <li>Le branchement se résout finalement comme pris : le <code>xor</code> est plus jeune que la branche et appartient au mauvais chemin.</li>
  <li>Le squash annule son changement de nom et restaure <code>RMT[R3]=p_old</code>.</li>
  <li>Le frontend repart en <code>B</code>. Lors du renommage de <code>sub R1,R2,R3</code>, sa source <code>R3</code> reçoit alors <code>p_old</code>, et non <code>p0</code>.</li>
</ol>
<p>Cette restauration est obligatoire : sans historique, le <code>sub</code> lirait à tort zéro et l’exécution ne correspondrait plus au programme séquentiel.</p>

<h4>Ce qui peut réellement être supprimé</h4>
<p>L’instruction peut disparaître des structures d’exécution :</p>
<ul>
  <li>pas d’entrée dans l’Instruction Queue ;</li>
  <li>pas de passage dans une unité fonctionnelle ;</li>
  <li>pas de write-back ou de diffusion de résultat.</li>
</ul>
<p>En revanche, une entrée marquée « déjà terminée » doit normalement rester dans l’Active List ou le ROB, ou bien être remplacée par un enregistrement équivalent dans l’historique de renommage. Cet enregistrement conserve au minimum le registre logique destination, son ancienne association physique, sa nouvelle association <code>p0</code> et le fait qu’aucun registre physique n’a été alloué.</p>
<p>Cette trace est nécessaire pour deux raisons : restaurer l’ancienne association lors d’un squash et ne recycler l’ancienne destination qu’au retrait en ordre. Un checkpoint complet de la RMT peut assurer la première fonction, mais il reste encore à ordonner la validation et le recyclage ; l’effet ne peut donc pas disparaître de toute forme de suivi.</p>
<h4>Contrôle des deux issues possibles</h4>
<ul>
  <li><strong>Prédiction correcte :</strong> <code>R3→p0</code> devient architectural au retrait ; <code>p_old</code> peut être recyclé lorsqu’aucune version protégée n’en a plus besoin.</li>
  <li><strong>Prédiction incorrecte :</strong> <code>R3→p_old</code> est restauré ; aucune allocation n’ayant créé <code>p0</code>, celui-ci ne doit évidemment jamais être ajouté à la Free List.</li>
</ul>
<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Le calcul du zero idiom peut disparaître de l’IQ, des unités fonctionnelles et du write-back, mais son changement de mapping doit rester suivi dans le ROB/Active List, un checkpoint ou un historique. Cette trace garantit à la fois rollback précis et recyclage au bon instant.</p>`,
            intuition: `<p>L’opération arithmétique est inutile, mais le changement de nom de <code>R3</code> reste un événement spéculatif qu’il faut pouvoir rembobiner.</p>`,
            trap: `<p>Le code du sujet écrit <code>xor R3,R2,R2</code>, puis la phrase de la question mentionne <code>xor R1,R2,R2</code>. Il s’agit d’une coquille : c’est bien l’association de <code>R3</code> qu’il faut restaurer pour que le <code>sub</code> lise la bonne valeur.</p>`
          },
          {
            n: "1.3",
            title: "Support matériel, recyclage et récupération",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.3 :</strong> Est-ce qu’implémenter cette élimination dans notre microarchitecture requiert un support matériel particulier (par ex., nouvelles structures, nouveaux champs dans des structures existantes, nouveaux circuits, etc.) ? On pourra notamment chercher à répondre aux questions suivantes<sup>1</sup> :</p>
<ul>
  <li>Quel impact sur l’algorithme assurant le recyclage des registres physiques ?</li>
  <li>Quel impact sur la réparation des structures de l’étage de renommage lors d’un vidage de pipeline ?</li>
</ul>
<p class="exam-source-note"><sup>1</sup> Les questions sont données à titre indicatif afin de guider votre réflexion. L’objectif est cependant de fournir une réponse à la Question 1.3 dans son entièreté.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut passer de l’idée « le résultat vaut déjà zéro » à une implémentation qui reste correcte lors du renommage, du retrait et d’un flush. La réponse attendue doit donc citer le détecteur, les métadonnées et les deux chemins de fin : <em>commit</em> ou <em>squash</em>.</p>

<h4>État initial et symboles</h4>
<ul>
  <li><code>Rd</code> est la destination architecturale de l’instruction.</li>
  <li><code>p_old=RMT[Rd]</code> est l’ancienne version physique de cette destination.</li>
  <li><code>p0</code> est la version physique permanente contenant zéro.</li>
  <li><code>allocated=false</code> signifie que cette instruction n’a prélevé aucune nouvelle entrée de la Free List.</li>
</ul>

<h4>Étape 1 — détecter et renommer</h4>
<p>Le chemin de renommage doit détecter les opérations reconnues comme produisant certainement zéro, puis sélectionner <code>p0</code> à la place d’un registre issu de la Free List :</p>
<pre><code>p_old = RMT[Rd]
RMT[Rd] = p0
record = { Rd, p_old, p0, eliminated = true, allocated = false }</code></pre>
<p>Lire et enregistrer <code>p_old</code> <em>avant</em> d’écrire la nouvelle RMT est indispensable : après la mise à jour, cette information ne peut plus être reconstruite à partir de la table courante.</p>

<h4>Étape 2 — fournir le support minimal</h4>
<p>Le support minimal comprend :</p>
<ul>
  <li>un détecteur combinatoire fondé sur l’opcode et les noms des opérandes ;</li>
  <li>un multiplexeur sur l’entrée de mise à jour de la RMT pour choisir <code>p0</code> ;</li>
  <li>un bit <code>eliminated</code> ou <code>completed-at-rename</code> dans l’Active List/ROB ;</li>
  <li>un bit indiquant qu’aucun registre physique n’a été alloué ;</li>
  <li>la conservation de <code>p_old</code> pour le retrait et le rollback ;</li>
  <li>une commande empêchant l’insertion dans l’Instruction Queue et l’écriture ultérieure dans le PRF.</li>
</ul>
<p>Le bit <code>completed-at-rename</code> autorise le ROB à considérer l’opération comme terminée. Il ne l’autorise pas à dépasser les instructions plus anciennes au retrait : l’ordre architectural reste inchangé.</p>

<h4>Étape 3 — distinguer le cycle de vie normal et la récupération</h4>
<table>
  <thead><tr><th>Moment</th><th>Action correcte</th></tr></thead>
  <tbody>
    <tr><td>Renommage</td><td>Ne pas retirer de registre de la Free List ; associer <code>Rd</code> à <code>p0</code> ; conserver l’ancienne association.</td></tr>
    <tr><td>Exécution</td><td>Marquer l’instruction terminée ; ne rien envoyer à une unité fonctionnelle ; laisser <code>p0</code> toujours prêt.</td></tr>
    <tr><td>Retrait correct</td><td>Valider l’association architecturale vers <code>p0</code> et recycler <code>p_old</code> lorsqu’il n’est plus vivant.</td></tr>
    <tr><td>Squash</td><td>Restaurer <code>RMT[Rd]=p_old</code> ou le checkpoint antérieur ; ne jamais ajouter <code>p0</code> à la Free List.</td></tr>
  </tbody>
</table>
<p>La récupération peut être réalisée par un checkpoint de la RMT et de la Free List à chaque branchement, ou par le parcours inverse d’un journal de renommage. Dans les deux cas, le système doit distinguer une instruction éliminée d’une instruction ayant réellement alloué une destination : sinon le squash tenterait de « libérer » <code>p0</code>.</p>
<p><strong>Pourquoi le checkpoint fonctionne :</strong> il photographie le mapping valide au moment de la branche. Le journal est l’alternative différentielle : chaque entrée dit « remettre <code>Rd</code> sur <code>p_old</code> », et le rollback les applique de la plus jeune à la plus ancienne.</p>

<h4>Contrôle de légalité</h4>
<p>La reconnaissance n’est légale que si tous les effets architecturaux sont préservés. Une instruction qui peut lever une exception, accéder à la mémoire ou produire des flags observables ne peut pas être supprimée en ne traitant que son registre destination. Par exemple, deux instructions donnant le même résultat entier ne sont pas interchangeables si l’une modifie des flags que lit un branchement.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Le matériel ajoute un détecteur de zero idiom, un choix <code>p0</code>/Free List dans le renommage et des bits indiquant « terminée sans allocation ». Le ROB ou l’historique garde <code>Rd</code> et <code>p_old</code> : au commit on valide <code>p0</code> et l’on recycle prudemment <code>p_old</code> ; au squash on restaure <code>p_old</code> et l’on ne libère jamais <code>p0</code>.</p>`,
            intuition: `<p>Les circuits ajoutés sont modestes ; la difficulté est surtout de faire comprendre au retrait et au rollback que la destination vaut <code>p0</code> sans qu’aucun registre ait été réservé.</p>`,
            trap: `<p>Au retrait, on peut éventuellement libérer l’ancienne destination de <code>Rd</code>. Au squash, on annule au contraire la nouvelle association. Confondre ces deux instants conduit à une libération trop précoce.</p>`
          }
        ]
      },
      {
        title: "2 · Move Elimination",
        theme: "Renommage",
        context: `<div class="exam-source-context">
<h4>1.2 “Move Elimination”</h4>
<p>Dans un second temps, on remarque que les instructions qui ne font que copier la valeur d’un registre dans un autre (instruction <code>move</code>) peuvent aussi s’éliminer à l’étage de renommage, en renommant le registre logique de destination par le registre physique qui correspond au registre logique source. Par exemple :</p>
<pre><code>move R1(p12), R2(p42)  # p12 = p42
move R3(p18), R1(p12)  # p18 = p12</code></pre>
<p>devient :</p>
<pre><code>move R1(p42), R2(p42)  # R1 = R2; elim
move R3(p42), R1(p42)  # R3 = R1; elim</code></pre>
</div>`,
        questions: [
          {
            n: "2.1",
            title: "Pourquoi éliminer les moves ?",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 2.1 :</strong> Quel(s) avantage(s) aura-t-on à éliminer les instructions <code>move</code> dans l’étage de renommage ?</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut reconnaître qu’un <code>move</code> ne crée aucune information nouvelle : sa destination doit désigner exactement la même valeur que sa source. L’optimisation consiste donc à créer un <strong>alias de mapping</strong>, puis à expliquer les ressources et la latence supprimées.</p>

<h4>État initial et notation</h4>
<p><code>RMT[R]</code> donne la version physique courante du registre architectural <code>R</code>. Notons <code>p_source=RMT[Rs]</code> et <code>p_old=RMT[Rd]</code>. La disponibilité appartient à <code>p_source</code> dans le Scoreboard : le move ne possède pas un résultat ou un bit <em>ready</em> distinct.</p>

<h4>Raisonnement étape par étape</h4>
<p>Pour une copie <code>move Rd,Rs</code>, le renommage peut effectuer :</p>
<pre><code>p_source = RMT[Rs]
RMT[Rd] = p_source</code></pre>
<ol>
  <li>Lire d’abord le mapping de la source, et sauvegarder l’ancienne destination <code>p_old</code>.</li>
  <li>Associer <code>Rd</code> au même registre physique que <code>Rs</code>, sans allocation.</li>
  <li>Donner ce tag physique directement aux consommateurs futurs de <code>Rd</code>.</li>
  <li>Conserver une entrée de suivi terminée, ou une trace équivalente, pour valider ou annuler l’alias dans l’ordre.</li>
</ol>

<h4>Gains obtenus</h4>
<ul>
  <li>Le move ne consomme pas d’unité fonctionnelle, de port PRF ou de bande passante de write-back.</li>
  <li>Il peut éviter une entrée dans l’Instruction Queue.</li>
  <li>Aucun nouveau registre physique n’est nécessaire, ce qui réduit la pression sur la Free List.</li>
  <li>Le consommateur de <code>Rd</code> attend directement le véritable producteur de <code>p_source</code>, sans ajouter la latence d’une copie.</li>
  <li>Si la source est déjà prête, la destination l’est immédiatement.</li>
  <li>Le débit du cœur et son efficacité énergétique augmentent, surtout dans un code contenant beaucoup de copies introduites par l’ISA ou le compilateur.</li>
</ul>
<h4>Mini-exemple de disponibilité</h4>
<p>Si <code>RMT[R2]=p42</code> et que le producteur de <code>p42</code> n’a pas encore terminé, <code>move R1,R2</code> donne <code>RMT[R1]=p42</code>, mais ne rend pas <code>p42</code> prêt. Un consommateur de <code>R1</code> attend la diffusion du producteur original. Si <code>p42</code> était déjà prêt, ce consommateur peut au contraire partir sans délai supplémentaire.</p>
<p>Le move continue généralement à être représenté comme une instruction terminée dans l’ordre de retrait, car son effet de renommage doit être validé ou annulé précisément.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> La move elimination remplace <code>RMT[Rd]</code> par le tag physique courant de <code>Rs</code>. Elle supprime allocation, exécution et write-back de la copie et retire une latence de la chaîne, mais la disponibilité reste celle du producteur source et l’alias doit rester suivi pour le recyclage et le rollback.</p>`,
            intuition: `<p>Une copie ne crée aucune nouvelle information : il suffit de donner deux noms architecturaux à la même case physique.</p>`,
            trap: `<p>L’élimination retire la latence du move, pas celle du producteur de la source. Une source non prête reste non prête.</p>`
          },
          {
            n: "2.2",
            title: "Disponibilité, durée de vie et rollback des moves",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 2.2 :</strong> Est-ce qu’implémenter cette élimination dans notre microarchitecture requiert un support matériel particulier (par ex., nouvelles structures, nouveaux champs dans des structures existantes, nouveaux circuits, etc.) ? On pourra notamment chercher à répondre aux questions suivantes<sup>2</sup> :</p>
<ul>
  <li><p>Quand le résultat d’une instruction <code>move</code> éliminée devient-il prêt ? On pourra par exemple considérer les instructions suivantes :</p>
<pre><code>add  R2(p42), R8(p127), R9(p1)     # R2 = R8 + R9
move R1(p42), R2(p42)              # R1 = R2; elim
add  R4(p12), R1(p42), R1(p42)     # R4 = R1 + R1</code></pre>
<p>Peut-on alors exécuter <code>add R4, R1, R1</code> immédiatement après son entrée dans l’ordonnanceur, puisque <code>move R1, R2</code> sera considéré comme exécuté (car éliminé au renommage) et produit <code>R1</code> lu par <code>add R4, R1, R1</code> ?</p></li>
  <li><p>Quand est-il possible de remettre le registre physique de destination d’une instruction <code>move</code> éliminée dans la <em>Free List</em> ? Il faudra notamment (mais pas seulement) considérer le cas où plusieurs définitions d’un même registre architectural utilisent le même registre physique (ici <code>R2</code> est renommé en <code>p42</code> par le <code>sub</code>, et renommé en <code>p42</code> par le dernier <code>move</code>, qui est éliminé) :</p>
<pre><code>sub  R2(p42), R1(p18), R8(p13)     # R2 = R1 + R8
move R1(p42), R2(p42)              # R1 = R2; elim
move R3(p42), R1(p42)              # R3 = R1; elim
move R2(p42), R3(p42)              # R2 = R3; elim</code></pre></li>
  <li><p>Quel impact sur la réparation des structures de l’étage de renommage lors d’un vidage de pipeline ? On pourra par exemple considérer les instructions suivantes :</p>
<pre><code>A:
    add  R2, R4, R5    # R2 = R4 + R5
    cbnz R2, B          # Saut vers B si R2 == 0
    move R1, R2         # R1 = R2; elim
    ...
B:
    sub  R1, R2, R3    # R1 = R2 + R3</code></pre>
<p>Est-il sûr de remettre le registre physique de destination alloué à <code>R1</code> pour <code>move R1, R2</code> (qui est donc le même que celui alloué à <code>R2</code> pour <code>add R2, R4, R5</code> car le <code>move</code> est éliminé) si on a renommé l’instruction sur le mauvais chemin et que le branchement a sauté vers B ?</p></li>
</ul>
<p class="exam-source-note"><sup>2</sup> Les questions et exemples sont données à titre indicatif afin de guider votre réflexion, et devraient tous être lus avant de tenter de répondre à la question 2.2 dans son entièreté.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Cette question teste les trois difficultés cachées derrière une copie « gratuite » : partager correctement l’état de disponibilité, empêcher le recyclage d’une valeur encore référencée et annuler seulement l’alias créé sur un mauvais chemin.</p>

<h4>État initial et vocabulaire</h4>
<ul>
  <li><code>p_source</code> est le registre physique vers lequel pointe la source au renommage.</li>
  <li><code>p_old</code> est l’ancienne association physique de la destination.</li>
  <li>Le <strong>Scoreboard</strong> indique si une valeur physique est prête.</li>
  <li>Un <strong>alias</strong> signifie que plusieurs noms architecturaux, et éventuellement plusieurs versions de récupération, pointent vers le même registre physique.</li>
</ul>
<p>La règle directrice est simple : le move ajoute une référence vers une valeur existante ; il ne produit ni nouvelle valeur, ni nouvelle allocation.</p>

<h4>1. Disponibilité de la donnée</h4>
<p>Le move ne produit aucune nouvelle valeur. Il ne doit donc jamais forcer <code>Scoreboard[p42]</code> à l’état prêt. Sa destination possède exactement l’état de disponibilité de sa source physique.</p>
<ul>
  <li>Si le premier <code>add</code> n’a pas terminé, <code>p42</code> reste non prêt.</li>
  <li>Le dernier <code>add</code> reçoit deux opérandes portant le même tag <code>p42</code> et attend le producteur originel.</li>
  <li>Quand le premier <code>add</code> diffuse <code>p42</code>, cette unique diffusion réveille les deux opérandes.</li>
  <li>Le dernier <code>add</code> peut partir immédiatement après son insertion seulement si <code>p42</code> était déjà prêt.</li>
</ul>
<p>Le move peut être marqué terminé dans le ROB sans que <code>p42</code> soit prêt : le producteur de la source est plus ancien et devra de toute façon se retirer avant lui.</p>

<h4>2. Recyclage d’un registre partagé</h4>
<p>La move elimination autorise plusieurs registres architecturaux à pointer vers le même registre physique. Cela casse l’algorithme traditionnel qui libère systématiquement l’ancienne destination au retrait.</p>
<pre><code>sub  R2(p42),R1(p18),R8(p13)
move R1(p42),R2(p42)              # R1 et R2 partagent p42
move R3(p42),R1(p42)              # R1, R2 et R3 partagent p42
move R2(p42),R3(p42)              # ancienne et nouvelle assoc. de R2 = p42</code></pre>
<p>Au dernier move, une logique naïve considérerait <code>p42</code> comme « ancienne destination de R2 » et le remettrait dans la Free List. Ce serait faux : <code>R1</code>, <code>R2</code> et <code>R3</code> le désignent encore.</p>
<p>Il faut donc un compteur de références, un masque d’alias ou un mécanisme équivalent. L’implémentation doit suivre les associations spéculatives et validées, ainsi que les versions gardées pour la récupération. Un registre physique n’est recyclable que lorsque la dernière association qui le nécessite a été remplacée de façon non spéculative. Le retrait en ordre garantit alors que ses anciens consommateurs ont fini.</p>
<p>Pour un auto-move ou lorsque <code>p_old==p_source</code>, la modification nette d’association est nulle : le move ne doit jamais provoquer la libération de <code>p_source</code>.</p>

<h4>3. Récupération après une mauvaise prédiction</h4>
<pre><code>add  R2,R4,R5
cbnz R2,B
move R1,R2                       # renommé sur le mauvais chemin
...
B:
sub  R1,R2,R3</code></pre>
<p>Le registre physique partagé a été alloué par le producteur de <code>R2</code>, pas par le move. Si ce move est annulé, il faut :</p>
<ul>
  <li>restaurer l’ancienne association physique de <code>R1</code> ;</li>
  <li>annuler uniquement la référence spéculative ajoutée pour <code>R1</code> ;</li>
  <li>ne pas remettre le registre physique de <code>R2</code> dans la Free List, car <code>R2</code> le référence toujours ;</li>
  <li>restaurer les compteurs d’alias avec le checkpoint ou en parcourant le journal en sens inverse.</li>
</ul>
<p>L’entrée de suivi doit donc mémoriser au minimum <code>Rd</code>, <code>p_old</code>, <code>p_source</code>, un bit <code>eliminated</code>, un bit <code>allocated=false</code> et l’opération de référence à inverser. Le Scoreboard reste indexé par le registre physique partagé : aucun nouveau bit de disponibilité n’est créé pour le move.</p>
<h4>Mini-contrôle de cohérence</h4>
<p>Après <code>move R1,R2</code>, supposons que <code>R1→p42</code> et <code>R2→p42</code>. Si une mauvaise prédiction annule seulement le move, on doit retrouver l’ancien mapping de <code>R1</code>, par exemple <code>R1→p18</code>, tandis que <code>R2→p42</code> reste intact. Le compteur de références de <code>p42</code> perd une référence, mais ne tombe pas artificiellement à zéro. Ce test suffit à détecter la faute classique « squash = libérer la source ».</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> La destination d’un move éliminé hérite du tag et du bit de disponibilité de la source. Comme plusieurs mappings peuvent alors partager ce tag, le matériel doit suivre les alias et ne recycler le registre qu’après disparition de la dernière référence validée ou protégée. En cas de squash, il restaure <code>p_old</code> et retire uniquement l’alias spéculatif, sans libérer le registre encore utilisé par la source.</p>`,
            intuition: `<p>Le move ajoute un alias, pas une valeur. Toute la correction consiste donc à partager l’état « prêt » et à compter combien de noms ou de versions ont encore besoin de la case physique.</p>`,
            trap: `<p>Le registre utilisé comme destination logique du move n’a pas été nouvellement alloué. Lors d’un squash, le remettre dans la Free List libérerait potentiellement la valeur encore courante de la source.</p>`
          }
        ]
      }
    ]
  },
  {
    year: "2022",
    title: "Examen CEAMC/SEOC3A — Partie 2 — 2021/2022 · Factorielle",
    pdf: "../Ex-Annales/Partie2_2022.pdf",
    intro: `<p>Le sujet part d’une factorielle scalaire x86-64 pour faire apparaître les dépendances vraies et les fausses dépendances, mesurer l’ILP avant et après renommage, puis transformer la réduction séquentielle en calcul SIMD à quatre voies. Les calculs d’IPC ci-dessous annoncent explicitement leurs hypothèses.</p>`,
    sections: [
      {
        title: "1 · Ordonnancement",
        theme: "Ordonnancement",
        context: `<div class="exam-source-context">
<h4>Factorielle</h4>
<p>On considère un programme C calculant la factorielle d’un entier naturel positif. On rappelle que factorielle de <code>n</code>, <code>n!</code>, est définie comme :</p>
<p class="formula"><code>n! = ∏<sub>i=1</sub><sup>n</sup> i</code></p>
<p>avec <code>0! = 1</code> par définition de la factorielle. On a donc :</p>
<pre><code>1! = 1 × 0! = 1 × 1 = 1
2! = 2 × 1! = 2 × 1 × 1 = 2
3! = 3 × 2! = 3 × 2 × 1 × 1 = 6</code></pre>
<p>Cette fonction peut être traduite en langage C par le code suivant :</p>
<pre><code>unsigned long long fact ( unsigned long long n )
{
  unsigned long long result = 1;

  while ( n != 0) {
    result = result * n ;
    n--;
  }

  return result ;
}</code></pre>
<p>Ce code C peut-être traduit dans l’assembleur x86_64 ci-après. Ce jeu d’instructions définit 16 registres généralistes 64-bit, nous n’en utilisons que deux ici, <code>rax</code> et <code>rdi</code>. De plus, ce jeu d’instructions utilise le premier opérande source comme destination, il faut donc par exemple lire <code>imul rax, rdi</code> comme <code>rax = rax ∗ rdi</code>.</p>
<pre><code>                 % n est dans le registre rdi
.fact:
    mov   rax, 1      % result &lt;= 1 (result est dans le registre rax)
    test  rdi, rdi    % test fait le ET bit-a-bit et jette le resultat
    je    .end        % Pris si (test rdi, rdi) == 0, sinon non pris
.loop:
    imul  rax, rdi    % rax (result) = rax (result) * rdi (n)
    sub   rdi, 1      % rdi (n) = rdi (n) - 1
    jne   .loop       % Pris si (sub rdi, 1) != 0 sinon non pris
.end:
    ret               % Retour de fonction (result est dans registre rax)</code></pre>
<p>On note que le code a déjà été optimisé. Premièrement, les variables sont conservées dans des registres, ce qui évite le coût d’accéder à la mémoire à chaque tour de boucle. Deuxièmement, le test de la condition du <code>while</code> a été fusionné avec la mise à jour de <code>n</code> : <code>sub, rdi, 1</code><sup>1</sup> met à jour les flags définis dans l’architecture x86_64 (notamment le flag <em>Zero</em><sup>2</sup>), qui sont lus par les branchements conditionnels (il y a donc une dépendance de donnée sur les flags entre <code>sub rdi, 1</code> et <code>jne .loop</code>). Cela permet de déterminer directement si la boucle doit continuer, plutôt que de sauter vers le début du corps de boucle puis tester la condition et refaire un branchement en conséquence.</p>
<p class="exam-source-note"><sup>1</sup> C’est à dire <code>rdi = rdi − 1</code><br><sup>2</sup> Qui vaut 1 si le résultat de l’opération vaut 0, sinon il vaut 0.</p>
</div>`,
        questions: [
          {
            n: "1.1",
            title: "Les dépendances de registres",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.1 (0,5pt):</strong> Rappelez les différents types de dépendances de données via les registres.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>On vous demande de savoir classer une contrainte entre une instruction ancienne <code>I</code> et une instruction plus jeune <code>J</code>. La méthode la plus sûre consiste à relever, pour un même registre, qui lit et qui écrit, puis à lire les deux lettres de gauche à droite dans l’ordre du programme.</p>

<h4>Définitions et convention</h4>
<p><strong>R</strong> signifie <em>Read</em> (lecture) et <strong>W</strong> signifie <em>Write</em> (écriture). Dans « X after Y », le premier mot décrit l’action de l’instruction jeune et le second celle de l’instruction ancienne. Ainsi, RAW signifie : la jeune lit <em>après</em> que l’ancienne a écrit.</p>

<h4>Classification pas à pas</h4>
<table>
  <thead><tr><th>Type</th><th>Nom</th><th>Situation</th><th>Nature</th></tr></thead>
  <tbody>
    <tr><td>RAW</td><td>Read After Write, dépendance de flot</td><td>Une instruction lit une valeur écrite par une instruction antérieure.</td><td>Dépendance vraie : elle représente le calcul.</td></tr>
    <tr><td>WAR</td><td>Write After Read, anti-dépendance</td><td>Une instruction plus jeune veut écraser un nom que l’ancienne doit encore lire.</td><td>Fausse dépendance due au nombre limité de noms.</td></tr>
    <tr><td>WAW</td><td>Write After Write, dépendance de sortie</td><td>Deux instructions écrivent le même nom et l’ordre final doit être conservé.</td><td>Fausse dépendance due au nom.</td></tr>
  </tbody>
</table>
<ol>
  <li>Si <code>I</code> écrit et <code>J</code> lit la valeur, tracer une <strong>RAW</strong> de <code>I</code> vers <code>J</code> : <code>J</code> doit attendre la donnée.</li>
  <li>Si <code>I</code> lit puis <code>J</code> écrase le même nom, tracer une <strong>WAR</strong> : il suffit de préserver l’ancienne version pour libérer l’ordre.</li>
  <li>Si les deux écrivent le même nom, tracer une <strong>WAW</strong> : la dernière écriture architecturale doit rester celle de <code>J</code>.</li>
  <li>Si les deux ne font que lire, il s’agit d’une RAR, sans ordre de données à imposer.</li>
</ol>

<h4>Mini-exemple et contrôle par renommage</h4>
<pre><code>I: add R1,R2,R3     # écrit R1, lit R2/R3
J: sub R4,R1,R5     # lit R1      => I→J RAW sur R1
K: mul R2,R6,R7     # écrit R2    => I→K WAR sur R2
L: xor R1,R8,R9     # écrit R1    => I→L WAW sur R1</code></pre>
<p>En donnant des destinations physiques distinctes à <code>I</code>, <code>K</code> et <code>L</code>, le renommage supprime les collisions WAR/WAW. Il ne peut pas supprimer <code>I→J</code>, car <code>J</code> a réellement besoin du résultat calculé par <code>I</code>.</p>
<p>Une relation RAR, Read After Read, n’impose aucun ordre : deux lectures de la même valeur peuvent être parallèles.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> RAW est une dépendance vraie de flot et subsiste après renommage. WAR et WAW sont de fausses dépendances liées à la réutilisation d’un nom architectural et disparaissent avec des versions physiques distinctes. RAR n’est pas une dépendance contraignante.</p>`,
            intuition: `<p>RAW relie deux valeurs du calcul. WAR et WAW relient seulement deux réutilisations accidentelles du même nom architectural.</p>`,
            trap: `<p>Ne pas présenter RAR comme une quatrième dépendance contraignante et ne jamais prétendre que le renommage supprime les RAW.</p>`
          },
          {
            n: "1.2",
            title: "Mémoire, contrôle et autres limites",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.2 (0,5pt):</strong> Existe-t-il d’autres types de dépendances de données qui pourraient limiter la performance dans ce programme ? En général ?</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut d’abord répondre pour <em>ce programme précis</em>, puis élargir au cas général sans mélanger dépendance de données, dépendance de contrôle et conflit de ressources.</p>

<h4>Étape 1 — inventorier les accès du noyau</h4>
<p>Dans le corps de la boucle, les variables <code>result</code> et <code>n</code> restent dans <code>rax</code> et <code>rdi</code>. Les trois instructions répétées sont le multiply, le décrément et le branchement ; elles ne chargent ni ne stockent de tableau. Il n’y a donc <strong>aucune dépendance de données mémoire explicite</strong> dans le noyau étudié.</p>

<h4>Étape 2 — citer la dépendance de données manquante en général</h4>
<p>Des loads et stores peuvent présenter des dépendances mémoire RAW, WAR ou WAW lorsqu’ils accèdent à la même adresse ou à des plages d’octets qui se chevauchent. À la différence d’un registre, l’identité de la donnée dépend ici d’une adresse calculée pendant l’exécution. Comme ces adresses ne sont pas toujours connues au renommage, une machine out-of-order utilise une <strong>Load/Store Queue (LSQ)</strong> et de la désambiguïsation mémoire.</p>
<ol>
  <li>Une load jeune cherche si une store plus ancienne vise la même adresse.</li>
  <li>Si la correspondance est certaine et la donnée prête, elle peut recevoir cette donnée par forwarding.</li>
  <li>Si une adresse ancienne est inconnue, la machine attend ou spécule.</li>
  <li>Une spéculation erronée est détectée puis rejouée pour préserver l’ordre mémoire exigé.</li>
</ol>

<h4>Étape 3 — classer les autres limites</h4>
<ul>
  <li>Les branchements <code>je</code> et <code>jne</code> introduisent des dépendances de contrôle. Elles ne sont pas des dépendances de données, mais une absence ou une erreur de prédiction réduit la performance.</li>
  <li>Un manque d’unités fonctionnelles, de ports ou de largeur d’émission crée un aléa structurel, pas une dépendance de données.</li>
  <li><code>ret</code> lit implicitement la pile, mais cette opération se situe hors du noyau de calcul de la boucle.</li>
</ul>

<h4>Mini-exemple pour ne pas confondre adresse et registre</h4>
<pre><code>store [r8], rax
load  rbx, [r9]</code></pre>
<p>Les noms <code>r8</code> et <code>r9</code> sont différents, mais si leurs valeurs calculées sont égales, la load dépend de la store. À l’inverse, deux opérations utilisant le même registre d’adresse peuvent accéder à des adresses différentes après un incrément. C’est pourquoi le renommage de registres ne résout pas à lui seul les dépendances mémoire.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Le noyau de factorielle étudié ne contient pas d’accès mémoire et n’a donc pas de dépendance mémoire explicite. En général, les alias entre loads/stores forment d’autres dépendances de données, gérées par la LSQ. Les sauts sont des dépendances de contrôle et la rareté des ports/unités est un aléa structurel : ce sont des limites de performance, mais pas des dépendances de données.</p>`,
            intuition: `<p>Le registre n’est qu’un lieu possible de dépendance. Deux instructions mémoire peuvent dépendre l’une de l’autre même si leurs registres portent des noms différents.</p>`,
            trap: `<p>La question demande d’abord des dépendances de données : citer la mémoire. Le contrôle et les ressources sont utiles à mentionner, mais il faut les étiqueter correctement comme autres limites.</p>`
          },
          {
            n: "1.3",
            title: "Graphe des dépendances inter-itérations",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.3 (1pt):</strong> Mettre en lumière les dépendances de données via les registres présentes dans l’assembleur implémentant la fonction factorielle. Attention à ne pas oublier les dépendances entre plusieurs itérations de la boucle.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut construire le graphe de dépendances, et non seulement lister RAW/WAR/WAW. Un nœud représente une instruction ; un arc <code>A→B</code> signifie que l’ordre entre <code>A</code> et <code>B</code> doit être respecté dans la machine considérée.</p>

<h4>État d’une itération et notation</h4>
<p>Notons <code>M_i</code> l’instruction <code>imul</code>, <code>S_i</code> le <code>sub</code> et <code>B_i</code> le <code>jne</code> de l’itération <code>i</code>. Pour raisonner sans ambiguïté, on peut numéroter les valeurs :</p>
<pre><code>M_i : lit rax_i et rdi_i ; écrit rax_(i+1)
S_i : lit rdi_i            ; écrit rdi_(i+1) et flags_i
B_i : lit flags_i</code></pre>
<p>La syntaxe x86 à deux opérandes explique que <code>imul %rdi,%rax</code> lit puis réécrit <code>rax</code>. Le <code>sub</code> lit puis réécrit <code>rdi</code> et produit les flags consommés par <code>jne</code>.</p>

<h4>Méthode pas à pas</h4>
<ol>
  <li>Pour chaque instruction, écrire son ensemble de lectures et d’écritures.</li>
  <li>Relier les opérations de la même itération qui utilisent le même nom.</li>
  <li>Dupliquer mentalement deux itérations, puis chercher les arcs de <code>i</code> vers <code>i+1</code>.</li>
  <li>Étiqueter chaque arc RAW s’il transporte une valeur, WAR/WAW s’il protège seulement la réutilisation d’un nom.</li>
</ol>

<h4>Arcs obtenus</h4>
<table>
  <thead><tr><th>Arc</th><th>Registre</th><th>Type</th><th>Raison</th></tr></thead>
  <tbody>
    <tr><td><code>mov → M_1</code></td><td><code>rax</code></td><td>RAW</td><td>Le premier produit utilise la valeur initiale 1.</td></tr>
    <tr><td><code>test → je</code></td><td>flags</td><td>RAW</td><td>Le saut initial teste si <code>n=0</code>.</td></tr>
    <tr><td><code>M_i → S_i</code></td><td><code>rdi</code></td><td>WAR</td><td>Le produit doit lire l’ancien <code>n</code> avant sa décrémentation.</td></tr>
    <tr><td><code>M_i → M_{i+1}</code></td><td><code>rax</code></td><td>RAW</td><td>Le produit suivant utilise le produit partiel précédent.</td></tr>
    <tr><td><code>S_i → M_{i+1}</code></td><td><code>rdi</code></td><td>RAW</td><td>Le produit suivant utilise <code>n-1</code>.</td></tr>
    <tr><td><code>S_i → S_{i+1}</code></td><td><code>rdi</code></td><td>RAW</td><td>La décrémentation suivante part de la valeur précédente.</td></tr>
    <tr><td><code>S_i → B_i</code></td><td>flags</td><td>RAW</td><td><code>jne</code> lit le Zero Flag produit par <code>sub</code>.</td></tr>
    <tr><td><code>B_i → S_{i+1}</code></td><td>flags</td><td>WAR</td><td>Le branchement doit lire les flags avant leur écrasement suivant.</td></tr>
    <tr><td><code>S_i → S_{i+1}</code></td><td>flags</td><td>WAW</td><td>Deux itérations successives produisent les flags.</td></tr>
  </tbody>
</table>
<p>Parce que les instructions x86 à deux opérandes lisent puis écrivent leur première opérande, deux <code>imul</code> successifs présentent aussi WAR et WAW sur <code>rax</code>, en plus de la RAW déjà suffisante pour les ordonner. Deux <code>sub</code> successifs présentent de même WAR et WAW sur <code>rdi</code>, en plus de leur RAW.</p>
<p>Avant la boucle, <code>test</code> et <code>je</code> doivent lire <code>rdi</code> ou les flags avant que le premier <code>sub</code> ne les écrase : ce sont des dépendances de nom supplémentaires, sans effet sur l’IPC stationnaire de la boucle.</p>

<h4>Vue compacte sur deux itérations</h4>
<pre><code>chaîne produit : M_i ──RAW(rax)────────────→ M_(i+1)
chaîne compteur: S_i ──RAW(rdi)────────────→ S_(i+1)
                         └─RAW(rdi)────────→ M_(i+1)
contrôle       : S_i ──RAW(flags)──────────→ B_i
noms avant renommage : M_i ─WAR(rdi)→ S_i
                       B_i ─WAR(flags)→ S_(i+1)</code></pre>
<p>Ce dessin fournit un contrôle rapide : on doit retrouver deux récurrences vraies inter-itérations, celle du produit et celle du compteur. Si l’une manque, le graphe autoriserait de calculer une itération avec une valeur qui n’existe pas encore.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Le graphe contient les RAW <code>M_i→M_(i+1)</code>, <code>S_i→M_(i+1)</code>, <code>S_i→S_(i+1)</code> et <code>S_i→B_i</code>. Avant renommage s’ajoutent notamment la WAR <code>M_i→S_i</code> sur <code>rdi</code>, la WAR <code>B_i→S_(i+1)</code> et les WAW entre définitions successives. Les RAW décrivent les deux chaînes de calcul ; les autres arcs viennent de la réutilisation des noms.</p>`,
            intuition: `<p>Deux chaînes vraies traversent toutes les itérations : le produit partiel dans <code>rax</code> et le compteur dans <code>rdi</code>. La réutilisation des mêmes noms ajoute des barrières WAR/WAW artificielles.</p>`,
            trap: `<p>Le piège principal est d’oublier <code>S_i → M_{i+1}</code> et les arcs portés par les flags entre <code>sub</code>, <code>jne</code> et l’itération suivante.</p>`
          },
          {
            n: "1.4",
            title: "IPC exact avant renommage",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.4 (2pt):</strong> En ne considérant que les dépendances de données via les registres mises en lumière à la question précédente, et en considérant que chaque instruction requiert un seul cycle pour s’exécuter, quel est le parallélisme d’instructions présent dans la boucle de la fonction <code>fact(n)</code>, en instructions par cycle (IPC), en admettant que <code>n</code> soit grand. Attention, on considère ici que deux instructions dépendantes ne peuvent <strong>jamais</strong> être ordonnancées dans le même cycle, même si certains designs pourraient se le permettre.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>On cherche l’<strong>IPC maximal imposé uniquement par le graphe de dépendances avant renommage</strong>. Il faut donc proposer un ordonnancement légal, compter toutes les instructions et tous les cycles, puis prendre la limite quand le nombre d’itérations devient grand.</p>

<h4>Hypothèses et symboles</h4>
<ul>
  <li><code>n</code> désigne ici le nombre d’itérations exécutées, pas seulement la valeur d’un registre à un instant.</li>
  <li><code>M_i</code>, <code>S_i</code> et <code>B_i</code> désignent respectivement <code>imul</code>, <code>sub</code> et <code>jne</code> à l’itération <code>i</code>.</li>
  <li>Chaque instruction a une latence d’un cycle ; un consommateur dépendant ne peut pas partir dans le même cycle que son producteur.</li>
  <li>Fenêtre, unités fonctionnelles et largeur d’émission sont suffisantes ; les branchements sont parfaitement prédits.</li>
</ul>
<p>La dernière hypothèse vient directement de la consigne qui demande d’ignorer tout sauf les dépendances de registres. Ajouter un arrêt au branchement mesurerait autre chose.</p>

<h4>Étape 1 — trouver le rythme contraignant</h4>
<p>Avant renommage, <code>M_i</code> doit lire l’ancienne valeur de <code>rdi</code> avant que <code>S_i</code> ne l’écrase : la WAR interdit donc leur émission simultanée. Après <code>S_i</code>, deux instructions deviennent disponibles pour le cycle suivant : <code>B_i</code> reçoit les flags, et <code>M_(i+1)</code> reçoit le nouveau compteur.</p>

<h4>Étape 2 — écrire un ordonnancement légal</h4>
<table>
  <thead><tr><th>Cycle</th><th>Instructions émises</th></tr></thead>
  <tbody>
    <tr><td>1</td><td><code>M_1</code></td></tr>
    <tr><td>2</td><td><code>S_1</code></td></tr>
    <tr><td>3</td><td><code>B_1 + M_2</code></td></tr>
    <tr><td>4</td><td><code>S_2</code></td></tr>
    <tr><td>5</td><td><code>B_2 + M_3</code></td></tr>
    <tr><td>6</td><td><code>S_3</code></td></tr>
    <tr><td>…</td><td>alternance identique</td></tr>
    <tr><td><code>2n</code></td><td><code>S_n</code></td></tr>
    <tr><td><code>2n+1</code></td><td><code>B_n</code></td></tr>
  </tbody>
</table>
<p><code>M_i</code> et <code>S_i</code> ne peuvent pas être émis ensemble à cause de la WAR sur <code>rdi</code>. Une fois <code>S_i</code> terminé, <code>B_i</code> et <code>M_{i+1}</code> sont prêts et indépendants dans le modèle de l’énoncé.</p>

<h4>Étape 3 — compter puis passer à la limite</h4>
<p>Chaque itération fournit trois instructions, donc <code>N_instr=3n</code>. Le calendrier utilise deux cycles par itération pour les paires <code>M_i/S_i</code>, puis un dernier cycle pour <code>B_n</code>, soit <code>N_cycles=2n+1</code>. Par définition :</p>
<p><strong>IPC(n) = N_instr/N_cycles = 3n / (2n + 1).</strong></p>
<p>Pour calculer proprement la limite, on divise numérateur et dénominateur par <code>n</code> :</p>
<p><strong>IPC(n) = 3 / (2 + 1/n) → 3/2 = 1,5 lorsque n devient grand.</strong></p>
<p>Le remplissage et la vidange expliquent le terme <code>+1</code>. Par exemple, avec quatre itérations on compte 12 instructions sur 9 cycles, soit 1,33 IPC ; avec beaucoup d’itérations, le coût du dernier cycle devient négligeable et le rythme stationnaire est bien trois instructions tous les deux cycles.</p>
<p>Si la machine n’autorisait aucune spéculation après <code>jne</code>, elle tomberait vers 1 IPC, mais ce serait ajouter une dépendance de contrôle que la question demande d’écarter.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Sous les hypothèses de l’énoncé, l’ordonnancement optimal alterne <code>M_i</code>, puis <code>S_i</code>, puis superpose <code>B_i</code> à <code>M_(i+1)</code>. Pour <code>n</code> itérations, il exécute <code>3n</code> instructions en <code>2n+1</code> cycles ; l’IPC tend donc vers <strong>1,5</strong>.</p>`,
            intuition: `<p>Chaque itération apporte trois instructions mais impose essentiellement deux étages successifs : d’abord multiplier, puis décrémenter. Le branchement précédent se glisse avec le multiply suivant.</p>`,
            trap: `<p>Répondre simplement « 2 IPC au cycle où deux instructions partent » est faux : l’IPC est une moyenne. Sur deux cycles stationnaires, trois instructions sont émises, soit 1,5 IPC.</p>`
          },
          {
            n: "1.5",
            title: "Principe et structures du renommage",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.5 (1,5pt):</strong> Rappelez brièvement le principe du renommage de registres et ses avantages, les structures matérielles requises pour l’implémenter et leur(s) rôle(s).</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Une bonne réponse doit relier trois idées : <strong>créer des versions</strong> pour supprimer WAR/WAW, <strong>suivre la disponibilité</strong> pour exécuter hors ordre, puis <strong>conserver un état validé</strong> pour retirer dans l’ordre et récupérer après spéculation.</p>

<h4>Définition</h4>
<p>Un registre <strong>architectural</strong>, par exemple <code>rdi</code>, est le nom visible dans l’ISA. Un registre <strong>physique</strong>, par exemple <code>p42</code>, identifie une version précise de sa valeur dans la microarchitecture. Le renommage associe chaque nouvelle définition architecturale à une nouvelle version physique.</p>
<p>Ainsi, une ancienne lecture peut encore viser <code>p7</code> pendant qu’une écriture plus jeune de <code>rdi</code> produit <code>p42</code>. Les deux valeurs ne se détruisent plus parce qu’elles portent des noms physiques différents.</p>

<h4>Exemple pas à pas</h4>
<p>Supposons <code>RMT[rdi]=p7</code> et <code>RMT[rax]=p3</code> avant une instruction abstraite <code>op rdi,rax → rdi</code>, qui lit les deux registres et redéfinit <code>rdi</code>.</p>
<ol>
  <li>Le renommage lit d’abord les sources : l’instruction consommera <code>p7</code> et <code>p3</code>.</li>
  <li>Il prélève ensuite <code>p42</code> dans la Free List pour la nouvelle destination.</li>
  <li>Il mémorise dans le ROB que l’ancienne destination était <code>p7</code>, puis écrit <code>RMT[rdi]=p42</code>.</li>
  <li>Les lecteurs plus anciens gardent leur tag <code>p7</code> ; les lecteurs plus jeunes reçoivent <code>p42</code>. La WAR et la WAW sur le nom <code>rdi</code> disparaissent.</li>
  <li>Quand l’instruction termine, le Scoreboard marque <code>p42</code> prêt. Au commit, la table validée adopte <code>p42</code> et <code>p7</code> ne sera recyclé que lorsqu’il est sûr qu’aucun état protégé n’en a besoin.</li>
</ol>

<h4>Structures matérielles et rôles</h4>
<table>
  <thead><tr><th>Structure</th><th>Rôle</th></tr></thead>
  <tbody>
    <tr><td>Rename Map Table ou RAT</td><td>Associe chaque registre architectural à sa version physique spéculative courante.</td></tr>
    <tr><td>Free List</td><td>Fournit un registre physique libre pour chaque nouvelle destination ordinaire.</td></tr>
    <tr><td>Physical Register File</td><td>Conserve les valeurs des différentes versions physiques.</td></tr>
    <tr><td>Scoreboard ou busy bits</td><td>Indique quelles versions physiques sont prêtes.</td></tr>
    <tr><td>ROB ou Active List</td><td>Conserve l’ordre du programme, l’état de terminaison, les exceptions et les anciennes/nouvelles destinations ; permet le retrait en ordre.</td></tr>
    <tr><td>Retirement Map Table ou état validé</td><td>Représente l’association architecturale non spéculative.</td></tr>
    <tr><td>Checkpoints ou historique</td><td>Restaure la RMT et les allocations après une mauvaise prédiction ou une exception.</td></tr>
    <tr><td>Instruction Queue</td><td>Conserve les tags sources, réveille les consommateurs et choisit les instructions prêtes.</td></tr>
  </tbody>
</table>
<h4>Pourquoi les structures de récupération sont nécessaires</h4>
<p>Si une branche est mal prédite après l’allocation de <code>p42</code>, le frontend doit retrouver le mapping antérieur et rendre les seules allocations du mauvais chemin. Un checkpoint photographie la RMT/Free List à la branche ; un journal peut obtenir le même effet en restaurant les anciennes destinations en ordre inverse. Le ROB et la Retirement Map empêchent qu’une valeur spéculative devienne l’état architectural avant son tour.</p>
<p>Le renommage supprime les anti-dépendances WAR et les dépendances de sortie WAW. Il augmente donc l’ILP et permet l’exécution hors ordre. Il ne supprime pas les RAW, qui décrivent la transmission réelle d’une valeur.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Le renommage attribue une version physique distincte à chaque écriture, via RMT, Free List et PRF ; Scoreboard/IQ propagent les tags et leur disponibilité. ROB, table de retrait et checkpoints conservent l’ordre précis. WAR et WAW disparaissent, tandis que RAW subsiste car elle transporte une vraie valeur.</p>`,
            intuition: `<p>Le registre architectural est le nom vu par le programme ; le registre physique est une version précise de cette variable à un instant du flot d’instructions.</p>`,
            trap: `<p>Une RMT et une Free List ne suffisent pas : sans suivi en ordre et sans restauration, une exception ou une mauvaise prédiction exposerait un état spéculatif incorrect.</p>`
          },
          {
            n: "1.6",
            title: "Dépendances après renommage",
            verbatim: true,
            sourcePage: 2,
            prompt: `<p><strong>Question 1.6 (1.5pt):</strong> Même question que 1.3, mais en ignorant les dépendances de données via les registres que le renommage de registres permet d’ignorer (on considère qu’on a un nombre infini de registres physiques à notre disposition).</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut reprendre le graphe précédent en supprimant <em>uniquement</em> les arcs dus aux noms, puis montrer le parallélisme nouvellement exposé. « Une infinité de registres physiques » retire la contrainte d’allocation ; elle ne crée pas les valeurs avant leurs producteurs.</p>

<h4>État renommé d’une itération</h4>
<pre><code>M_i : (rax_i, rdi_i) → rax_(i+1)
S_i :  rdi_i         → rdi_(i+1), flags_i
B_i :  flags_i       → décision de branchement</code></pre>
<p><code>M_i</code> et <code>S_i</code> lisent la <strong>même ancienne version</strong> <code>rdi_i</code>, mais leurs écritures vont vers des versions physiques différentes. Il n’existe donc plus de WAR entre eux : deux lectures communes n’imposent aucun ordre.</p>

<h4>Étape 1 — conserver seulement les arcs RAW</h4>
<p>Après renommage, il ne reste que les RAW :</p>
<ul>
  <li><code>mov → M_1</code> sur la valeur initiale de <code>rax</code> ;</li>
  <li><code>test → je</code> sur les flags ;</li>
  <li><code>M_i → M_{i+1}</code> sur le produit partiel dans <code>rax</code> ;</li>
  <li><code>S_i → M_{i+1}</code> sur la nouvelle valeur de <code>rdi</code> ;</li>
  <li><code>S_i → S_{i+1}</code> sur le compteur <code>rdi</code> ;</li>
  <li><code>S_i → B_i</code> sur les flags.</li>
</ul>
<p>Les anciennes WAR et WAW ont disparu parce que les écritures ne portent plus le même tag physique. En revanche, <code>M_(i+1)</code> attend toujours à la fois le produit <code>rax_(i+1)</code> de <code>M_i</code> et le compteur <code>rdi_(i+1)</code> de <code>S_i</code> : ces données sont réellement nécessaires.</p>

<h4>Étape 2 — construire le calendrier le plus tôt possible</h4>
<p>L’ordonnancement idéal correspondant est :</p>
<table>
  <thead><tr><th>Cycle</th><th>Instructions émises</th></tr></thead>
  <tbody>
    <tr><td>1</td><td><code>M_1 + S_1</code></td></tr>
    <tr><td>2</td><td><code>B_1 + M_2 + S_2</code></td></tr>
    <tr><td>3</td><td><code>B_2 + M_3 + S_3</code></td></tr>
    <tr><td>…</td><td>trois instructions par cycle stationnaire</td></tr>
    <tr><td><code>n+1</code></td><td><code>B_n</code></td></tr>
  </tbody>
</table>
<p>Au cycle 1, <code>M_1</code> et <code>S_1</code> partent ensemble. Au cycle suivant, leurs résultats rendent <code>M_2</code>, <code>S_2</code> et <code>B_1</code> prêts : en régime permanent, on émet donc un multiply, un sub et le branchement précédent dans le même cycle.</p>

<h4>Étape 3 — calculer l’IPC</h4>
<p>Il y a toujours <code>3n</code> instructions. Le premier cycle lance <code>M_1+S_1</code>, les cycles suivants superposent trois instructions, puis un cycle final reste nécessaire pour <code>B_n</code> : le calendrier compte <code>n+1</code> cycles.</p>
<p>Pour une machine d’émission au moins triple : <strong>IPC(n) = 3n / (n + 1) = 3/(1+1/n), donc IPC → 3</strong>. Avec quatre itérations, le contrôle donne <code>12/5=2,4</code> IPC ; la limite 3 apparaît lorsque le coût du dernier branchement devient négligeable. Avec une largeur d’émission <code>W</code>, ce résultat est naturellement plafonné par <code>W</code>.</p>
<p>La convention retenue est celle du sujet : le flot de flags utile à <code>jne</code> est produit par <code>sub</code>. Un modèle microarchitectural x86 plus détaillé devrait traiter séparément les sous-ensembles de flags touchés ou rendus indéfinis par <code>imul</code>.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Après renommage, seuls restent les RAW du produit, du compteur et des flags. <code>M_i</code> et <code>S_i</code> deviennent indépendants et peuvent partir ensemble ; en régime stationnaire, <code>B_(i−1)+M_i+S_i</code> partent au même cycle. On obtient <code>3n</code> instructions en <code>n+1</code> cycles, soit un IPC tendant vers <strong>3</strong> sous les hypothèses idéales.</p>`,
            intuition: `<p>Le renommage fait apparaître trois voies parallèles par itération : le multiply, la décrémentation et le branchement de l’itération précédente.</p>`,
            trap: `<p>Ne pas supprimer les arcs <code>M_i → M_{i+1}</code> ou <code>S_i → M_{i+1}</code> : ce sont des RAW et un nombre infini de registres ne crée pas les valeurs avant leur calcul.</p>`
          }
        ]
      },
      {
        title: "2 · Single Instruction Multiple Data",
        theme: "SIMD",
        context: `<div class="exam-source-context">
<p>La fonction <code>fact()</code> possède du parallélisme au niveau données. On note par exemple que <code>8!</code> requiert d’effectuer les ”blocs” d’opérations suivants:</p>
<pre><code>tmp₀ = 8 × 7
tmp₁ = 6 × 5
tmp₂ = 4 × 3
tmp₃ = 2 × 1</code></pre>
<p>Puis:</p>
<pre><code>tmp₄ = tmp₀ × tmp₁
tmp₅ = tmp₂ × tmp₃</code></pre>
<p>Et enfin:</p>
<pre><code>result = tmp₄ × tmp₅</code></pre>
<p>Bien qu’il y ait des dépendances de données entre les différentes étapes, les opérations à l’intérieur d’un bloc sont indépendantes. On peut donc accélérer le calcul de <code>fact()</code> en parallélisant les traitements via le paradigme <strong>Single Instruction Multiple Data</strong> (SIMD).</p>
</div>`,
        questions: [
          {
            n: "2.1",
            title: "Principe du SIMD",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 2.1 (0,5pt):</strong> Rappelez le principe du paradigme SIMD.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il faut définir précisément le parallélisme SIMD et le distinguer de l’émission de plusieurs instructions ou de l’exécution de plusieurs threads.</p>

<h4>Définitions</h4>
<ul>
  <li><strong>Single Instruction</strong> : un seul opcode et un seul flux de contrôle commandent l’opération.</li>
  <li><strong>Multiple Data</strong> : le registre est découpé en plusieurs éléments, appelés <em>lanes</em>, qui reçoivent la même opération.</li>
  <li>Le <strong>degré SIMD</strong> est le nombre d’éléments traités simultanément ; ici il vaut quatre.</li>
</ul>

<h4>Déroulement d’une opération</h4>
<ol>
  <li>Le programme regroupe quatre données indépendantes dans un registre vectoriel.</li>
  <li>Il émet une instruction vectorielle unique.</li>
  <li>Chaque lane applique cette instruction à sa paire d’opérandes, sans mélanger les lanes.</li>
  <li>Le résultat est un nouveau vecteur ; une opération horizontale n’est nécessaire que si l’on veut ensuite réunir les lanes.</li>
</ol>
<p>Avec quatre éléments de 64 bits :</p>
<pre><code>[a0,a1,a2,a3] × [b0,b1,b2,b3]
= [a0×b0,a1×b1,a2×b2,a3×b3]</code></pre>
<p>Par exemple, si les vecteurs valent <code>[2,3,4,5]</code> et <code>[10,10,10,10]</code>, une multiplication SIMD produit <code>[20,30,40,50]</code>. Le calcul a effectué quatre produits, mais le frontend n’a décodé qu’une instruction vectorielle.</p>
<p>Le programme exploite ainsi le parallélisme de données avec un seul flot d’instructions et un seul contrôle, contrairement à plusieurs threads indépendants. Les lanes doivent toutefois effectuer une opération compatible ; une dépendance d’une lane vers la suivante empêcherait cette vectorisation directe.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> SIMD applique une même instruction à plusieurs éléments indépendants d’un ou plusieurs registres vectoriels. Avec quatre lanes, une instruction réalise quatre opérations élémentaires en parallèle sous un contrôle commun ; ce n’est ni quatre threads, ni quatre instructions scalaires différentes émises ensemble.</p>`,
            intuition: `<p>On ne fait pas quatre opérations différentes : on applique une même consigne à quatre cases en parallèle.</p>`,
            trap: `<p>SIMD ne signifie ni quatre cœurs ni quatre instructions différentes émises ensemble. Ces descriptions correspondent plutôt au multithreading et au superscalaire/VLIW.</p>`
          },
          {
            n: "2.2",
            title: "Pourquoi factorielle résiste à la vectorisation directe",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p>On se place dans le contexte de l’extension vectorielle AVX (<em>Advanced Vector Extensions</em>) du jeu d’instructions x86_64. Cette extension permet de manipuler des vecteurs de 4 éléments de 64-bit via des registres et instructions vectorielles dédiés.</p>
<p><strong>Question 2.2 (1pt):</strong> Quelle(s) difficulté(s) va-t-on rencontrer lors de la conversion du code scalaire de <code>fact()</code> en code vectoriel avec vecteur de taille 4 ? On pourra notamment se poser la question de l’exécution de <code>fact(10)</code>.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>Il ne suffit pas de dire « la boucle a une dépendance ». Il faut identifier la récurrence scalaire, expliquer comment l’associativité de la multiplication permet de la découper, puis traiter les facteurs qui ne remplissent pas quatre lanes.</p>

<h4>État initial : la chaîne scalaire</h4>
<p>La factorielle calcule <code>n×(n−1)×…×1</code>. Si <code>result_i</code> désigne le produit après l’itération <code>i</code>, alors <code>result_(i+1)=result_i×facteur_(i+1)</code>. Chaque itération lit donc le résultat de la précédente : cette RAW forme une longue chaîne critique.</p>
<p>On ne peut pas placer quatre itérations successives <em>inchangées</em> dans quatre lanes, car les lanes demanderaient simultanément des états successifs qui n’existent pas encore. En revanche, pour la multiplication entière considérée, on peut réassocier les facteurs : on construit quatre produits partiels indépendants, puis on effectue une réduction horizontale finale.</p>

<h4>Étapes de la transformation</h4>
<ol>
  <li>Initialiser les quatre accumulateurs à l’identité multiplicative <code>1</code>.</li>
  <li>Distribuer quatre facteurs consécutifs dans les quatre lanes.</li>
  <li>Répéter avec les quatre facteurs suivants : chaque lane prolonge seulement sa propre chaîne.</li>
  <li>Si moins de quatre facteurs restent, compléter les lanes vides par <code>1</code> ou utiliser un masque.</li>
  <li>Multiplier horizontalement les quatre produits partiels pour revenir à un résultat scalaire.</li>
</ol>
<p>Les difficultés concrètes sont donc :</p>
<ul>
  <li><code>n</code> n’est pas toujours multiple de quatre : il reste entre zéro et trois facteurs.</li>
  <li>Les lanes inutilisées doivent être remplies par l’élément neutre de la multiplication, soit 1, ou traitées par un masque.</li>
  <li>Il faut construire puis décrémenter le vecteur des facteurs.</li>
  <li>Le résultat reste réparti dans quatre lanes et doit être reconverti en un scalaire avec trois multiplications de réduction.</li>
  <li>Initialisation, masquage, shuffles/extractions et reste constituent un surcoût fixe.</li>
</ul>

<h4>Application détaillée à <code>fact(10)</code></h4>
<p>Il y a deux groupes complets de quatre facteurs, puis un reste de deux. Une décomposition correcte est :</p>
<pre><code>groupe 1 = [10,9,8,7]
groupe 2 = [ 6,5,4,3]
reste   = [ 2,1,1,1]

acc = groupe 1 × groupe 2 × reste
    = [120,45,32,21]

résultat = (120×45) × (32×21) = 3 628 800</code></pre>
<p>Le détail par lane fournit un contrôle utile : <code>10×6×2=120</code>, <code>9×5×1=45</code>, <code>8×4×1=32</code> et <code>7×3×1=21</code>. Puis <code>120×45=5 400</code>, <code>32×21=672</code> et <code>5 400×672=3 628 800</code>. Chaque entier de 1 à 10 apparaît exactement une fois ; les trois « 1 » ajoutés ne changent pas le produit.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> La factorielle n’est pas directement vectorisable à cause de la récurrence sur <code>result</code>. On exploite l’associativité pour former quatre chaînes de produits indépendantes, on complète le reste avec l’élément neutre 1, puis on réduit horizontalement les quatre accumulateurs. Pour <code>10!</code>, on obtient <code>[120,45,32,21]</code>, puis <strong>3 628 800</strong>.</p>`,
            intuition: `<p>On remplace une longue chaîne de produits par quatre chaînes plus courtes, puis on réunit leurs quatre résultats à la fin.</p>`,
            trap: `<p>Ne pas perdre les facteurs 2 et 1 de <code>10!</code>. Un reste ne se complète pas avec zéro, qui annulerait tout, mais avec l’identité multiplicative 1.</p>`
          },
          {
            n: "2.3",
            title: "Pseudo-code vectoriel de degré quatre",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 2.3 (2.5pt):</strong> Fournir le pseudo-code de la fonction <code>fact()</code> en exprimant un parallélisme de données de degré 4 (par exemple en utilisant la notation <code>var[0,1,2,3] = ...</code>)</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>On doit écrire un algorithme vectoriel complet, pas seulement une multiplication de quatre facteurs. La copie doit montrer l’initialisation, les groupes de quatre, le reste, la réduction finale et le cas <code>0!</code>.</p>

<h4>Convention de pseudo-code</h4>
<p><code>vector4</code> contient quatre entiers de 64 bits. L’opérateur <code>*</code> entre deux <code>vector4</code> est <strong>élément par élément</strong> : il n’effectue pas encore la réduction entre lanes. <code>n</code> est décrémenté de quatre après chaque groupe traité.</p>

<h4>Algorithme</h4>
<pre><code>uint64 fact4(uint64 n)
{
    vector4 acc = [1, 1, 1, 1];

    while (n &gt;= 4) {
        vector4 factors = [n, n-1, n-2, n-3];
        acc = acc * factors;          // quatre produits simultanés
        n = n - 4;
    }

    if (n != 0) {
        vector4 tail = [1, 1, 1, 1];
        if (n &gt;= 1) tail[0] = n;
        if (n &gt;= 2) tail[1] = n - 1;
        if (n &gt;= 3) tail[2] = n - 2;
        acc = acc * tail;
    }

    uint64 tmp0 = acc[0] * acc[1];
    uint64 tmp1 = acc[2] * acc[3];
    return tmp0 * tmp1;
}</code></pre>

<h4>Justification ligne par ligne</h4>
<ol>
  <li><code>acc=[1,1,1,1]</code> est valide car 1 est l’identité de la multiplication. Il garantit aussi <code>fact4(0)=1</code>.</li>
  <li>Tant que <code>n≥4</code>, le vecteur <code>[n,n−1,n−2,n−3]</code> contient quatre facteurs distincts encore non traités. La multiplication met à jour quatre produits partiels en parallèle.</li>
  <li><code>n=n−4</code> fait avancer exactement au groupe suivant, sans doublon ni trou.</li>
  <li>À la sortie, <code>n</code> vaut 0, 1, 2 ou 3. Le vecteur <code>tail</code> place ces seuls facteurs utiles au début et garde 1 ailleurs.</li>
  <li>Les trois dernières multiplications forment un arbre de réduction : deux produits de paires peuvent être indépendants, puis leur produit donne le scalaire final.</li>
</ol>

<h4>Invariant et contrôles rapides</h4>
<p>Après chaque passage de boucle, le produit <code>acc[0]×acc[1]×acc[2]×acc[3]</code> est exactement le produit de tous les facteurs déjà consommés. Le <code>tail</code> ajoute les facteurs restants ; la réduction retourne donc le produit de <code>1</code> à la valeur initiale.</p>
<ul>
  <li><code>n=0</code> : aucune boucle, aucun tail, réduction de quatre 1, résultat 1.</li>
  <li><code>n=3</code> : <code>tail=[3,2,1,1]</code>, résultat 6.</li>
  <li><code>n=10</code> : deux tours complets, puis <code>tail=[2,1,1,1]</code>, résultat 3 628 800.</li>
</ul>
<p>Pour <code>n=4q+r</code>, la boucle effectue <code>q</code> multiplications vectorielles complètes, puis le bloc <code>tail</code> traite <code>r</code> facteurs. Une variante conserve un vecteur <code>[n,n-1,n-2,n-3]</code> et lui soustrait <code>[4,4,4,4]</code> à chaque tour, ce qui évite de le reconstruire.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> Le pseudo-code maintient quatre accumulateurs initialisés à 1, consomme les facteurs par groupes de quatre, traite les <code>r=n mod 4</code> facteurs restants avec des 1 neutres, puis réduit les quatre lanes en arbre. Il couvre donc tous les <code>n</code>, notamment <code>0!=1</code>.</p>`,
            intuition: `<p>Chaque lane reçoit une colonne de la factorielle : <code>n,n-4,n-8…</code>, puis les quatre colonnes sont multipliées ensemble.</p>`,
            trap: `<p>Le pseudo-code suit le modèle abstrait de l’énoncé. En ISA réelle, l’AVX historique ne fournit pas directement toutes les multiplications entières empaquetées 64 bits ; une implémentation exacte peut demander une extension plus récente ou une décomposition.</p>`
          },
          {
            n: "2.4",
            title: "SIMD n’est pas toujours plus rapide",
            verbatim: true,
            sourcePage: 3,
            prompt: `<p><strong>Question 2.4 (1pt):</strong> La vectorisation va nous permettre de traiter plus d’éléments à chaque tour de boucle et donc augmenter la performance en augmentant le débit d’instructions. Cependant, étant donné les réponses aux questions 2.2 et 2.3, est-t-il forcément plus efficace d’utiliser la version vectorisée de <code>fact(n)</code> (par rapport à la version scalaire) ? On pourra notamment se poser la question de l’exécution de <code>fact(2)</code>. On attend naturellement une réponse argumentée.</p>`,
            answer: `<h4>Objectif de la question</h4>
<p>La bonne réponse est « non », puis doit expliquer pourquoi le degré SIMD n’est pas un speed-up garanti. Il faut comparer le travail utile au coût de préparation et de réduction, sans inventer un nombre de cycles absent de l’énoncé.</p>

<h4>Modèle de coût qualitatif</h4>
<p>La version scalaire effectue environ une multiplication utile par facteur. La version vectorielle remplace une partie de ce travail par environ <code>ceil(n/4)</code> multiplications vectorielles, mais ajoute un coût fixe : création des vecteurs, contrôle du reste et réduction horizontale. On peut donc raisonner sous la forme :</p>
<pre><code>T_SIMD ≈ T_préparation + ceil(n/4)·T_mul_vec
         + T_reste + T_réduction</code></pre>
<p>Sans les latences exactes de la machine, cette expression permet de conclure sur la tendance, pas de chiffrer un seuil universel.</p>

<h4>Coûts à compter</h4>
<p>Une multiplication vectorielle traite jusqu’à quatre facteurs, mais la transformation ajoute :</p>
<ul>
  <li>initialisation des registres vectoriels ;</li>
  <li>construction des facteurs et gestion du masque ou du reste ;</li>
  <li>instructions de boucle vectorielle ;</li>
  <li>extractions ou shuffles ;</li>
  <li>trois multiplications pour réduire quatre lanes vers un scalaire.</li>
</ul>
<h4>Application à <code>fact(2)</code></h4>
<p>La version scalaire n’exécute que deux petites itérations. La version vectorielle construit essentiellement <code>[2,1,1,1]</code> : une seule lane porte un facteur non neutre après la valeur 2, trois lanes sont inutilisées, puis il faut encore réduire quatre positions vers un scalaire. Son surcoût dépasse donc très probablement le travail économisé.</p>
<p>Ce cas fournit un contrôle simple : une largeur de quatre avec un seul ou deux éléments utiles donne un taux d’occupation faible. Même si l’instruction vectorielle elle-même est rapide, les instructions auxiliaires restent présentes.</p>

<h4>Décision pratique et précision arithmétique</h4>
<p>La bonne stratégie pratique est donc hybride : choisir la version scalaire sous un seuil et la version SIMD seulement lorsque le nombre de facteurs permet d’amortir la préparation et la réduction. Le gain réel dépend aussi de la latence et du débit du multiplicateur vectoriel, de la largeur d’émission et du coût des mouvements de données.</p>
<p>Enfin, un <code>unsigned long long</code> ne représente mathématiquement la factorielle que jusqu’à <code>20!</code>. À partir de <code>21!</code>, le C calcule modulo <code>2^64</code>. La multiplication non signée modulo <code>2^64</code> reste associative : la réassociation SIMD peut conserver les mêmes bits que la version scalaire non signée, mais le résultat n’est plus la factorielle mathématique.</p>

<p class="answer-conclusion"><strong>Conclusion à écrire dans la copie.</strong> SIMD n’est avantageux que si le travail réalisé dans les lanes amortit préparation, reste et réduction. Pour <code>fact(2)</code>, les lanes sont sous-utilisées et le surcoût rend vraisemblablement la version scalaire meilleure. Le seuil dépend de l’ISA et de la microarchitecture ; une implémentation réaliste choisit donc souvent scalaire pour les petits <code>n</code> et SIMD au-delà.</p>`,
            intuition: `<p>SIMD gagne sur le travail répété ; pour un tout petit problème, préparer et replier le vecteur coûte plus cher que le calcul lui-même.</p>`,
            trap: `<p>« Quatre lanes » ne garantit jamais un speed-up de quatre. Il faut compter le reste, la réduction, les instructions auxiliaires et la taille réellement utile du problème.</p>`
          }
        ]
      }
    ]
  }
];
